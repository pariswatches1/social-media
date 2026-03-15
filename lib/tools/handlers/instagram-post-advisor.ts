import { getCachedInstagramData } from "@/lib/tools/cache";
import { callClaude } from "@/lib/anthropic";
import type { ToolHandler, ToolResult } from "@/lib/tools/types";

const handler: ToolHandler = async (input) => {
  const handle = input.handle?.trim();
  if (!handle) {
    throw new Error("Missing required input: handle. Provide an Instagram username to get post advice.");
  }

  try {
    const data = await getCachedInstagramData(handle);
    const { profile, posts, topPosts, avgEngagementRate } = data;

    // Prepare top posts data for Claude
    const topPostsSummary = topPosts.map((p) => ({
      caption: p.caption.slice(0, 200),
      likes: p.likeCount,
      comments: p.commentCount,
      shares: p.shareCount,
      mediaType: p.mediaType,
      engagementRate: p.engagementRate,
      timestamp: new Date(p.timestamp).toISOString(),
      playCount: p.playCount,
    }));

    // Analyze posting times
    const postingHours = posts.map((p) => new Date(p.timestamp).getUTCHours());
    const postingDays = posts.map((p) => new Date(p.timestamp).getUTCDay());

    // Media type performance
    const typePerformance: Record<string, { count: number; totalEngagement: number }> = {};
    for (const post of posts) {
      if (!typePerformance[post.mediaType]) {
        typePerformance[post.mediaType] = { count: 0, totalEngagement: 0 };
      }
      typePerformance[post.mediaType].count++;
      typePerformance[post.mediaType].totalEngagement += post.engagementRate;
    }
    const mediaPerformance: Record<string, { count: number; avgEngagement: string }> = {};
    for (const [type, stats] of Object.entries(typePerformance)) {
      mediaPerformance[type] = {
        count: stats.count,
        avgEngagement: `${(stats.totalEngagement / stats.count).toFixed(2)}%`,
      };
    }

    const contextForClaude = JSON.stringify({
      profile: {
        username: profile.username,
        fullName: profile.fullName,
        biography: profile.biography,
        followerCount: profile.followerCount,
        category: profile.category,
      },
      avgEngagementRate,
      topPosts: topPostsSummary,
      mediaPerformance,
      postingHours,
      postingDays,
      totalPostsAnalyzed: posts.length,
    });

    const claudeResponse = await callClaude(
      "You are an expert Instagram content strategist. Analyze the provided real account data and return ONLY valid JSON with: recommendations (array of exactly 5 specific, actionable content improvement suggestions), bestPostingTimes (array of objects with day and timeRange based on analyzing the posting timestamps), bestContentType (string identifying which media type performs best and why), captionStyleAnalysis (object with avgLength, usesHashtags boolean, usesEmojis boolean, toneDescription string, suggestions array of strings). Be highly specific to this account's data.",
      `Analyze this Instagram account's content and provide strategic advice:\n${contextForClaude}`
    );

    const cleaned = claudeResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const advice = JSON.parse(cleaned);

    return {
      success: true,
      data: {
        handle: profile.username,
        currentMetrics: {
          followerCount: profile.followerCount,
          engagementRate: `${avgEngagementRate.toFixed(2)}%`,
          totalPostsAnalyzed: posts.length,
          mediaPerformance,
        },
        advice,
      },
      dataSource: "real",
    };
  } catch (err) {
    // AI fallback
    const aiResponse = await callClaude(
      "You are an expert Instagram content strategist. Return ONLY valid JSON, no markdown fences.",
      `Provide Instagram content advice for @${handle}. Return JSON with: currentMetrics (followerCount, engagementRate, totalPostsAnalyzed, mediaPerformance), advice (recommendations array of 5 strings, bestPostingTimes array, bestContentType string, captionStyleAnalysis object). Use realistic estimates.`
    );

    const cleaned = aiResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      success: true,
      data: { handle, ...parsed, note: "Based on AI estimates — real data unavailable" },
      dataSource: "ai_estimate",
    };
  }
};

export default handler;
