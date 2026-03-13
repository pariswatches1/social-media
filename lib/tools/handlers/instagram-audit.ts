import { getCachedInstagramData } from "@/lib/tools/cache";
import { callClaude } from "@/lib/anthropic";
import type { ToolHandler, ToolResult } from "@/lib/tools/types";

const handler: ToolHandler = async (input) => {
  const handle = input.handle?.trim();
  if (!handle) {
    throw new Error("Missing required input: handle. Provide an Instagram username to audit.");
  }

  try {
    const data = await getCachedInstagramData(handle);
    const { profile, posts, avgEngagementRate } = data;

    // Follower/following ratio
    const followerFollowingRatio =
      profile.followingCount > 0
        ? parseFloat((profile.followerCount / profile.followingCount).toFixed(2))
        : profile.followerCount;

    // Post frequency (posts per week)
    let postsPerWeek = 0;
    if (posts.length >= 2) {
      const timestamps = posts.map((p) => p.timestamp).sort((a, b) => a - b);
      const oldestTs = timestamps[0];
      const newestTs = timestamps[timestamps.length - 1];
      const spanMs = newestTs - oldestTs;
      const spanWeeks = spanMs / (7 * 24 * 60 * 60 * 1000);
      postsPerWeek = spanWeeks > 0 ? parseFloat((posts.length / spanWeeks).toFixed(2)) : posts.length;
    } else {
      postsPerWeek = posts.length;
    }

    // Engagement rating
    let engagementRating: string;
    if (avgEngagementRate > 3.5) {
      engagementRating = "Excellent";
    } else if (avgEngagementRate >= 1) {
      engagementRating = "Good";
    } else if (avgEngagementRate >= 0.5) {
      engagementRating = "Average";
    } else {
      engagementRating = "Low";
    }

    const totalLikes = posts.reduce((sum, p) => sum + p.likeCount, 0);
    const totalComments = posts.reduce((sum, p) => sum + p.commentCount, 0);
    const avgLikes = posts.length > 0 ? Math.round(totalLikes / posts.length) : 0;
    const avgComments = posts.length > 0 ? Math.round(totalComments / posts.length) : 0;

    // Send metrics to Claude for qualitative analysis
    const metricsForClaude = JSON.stringify({
      username: profile.username,
      fullName: profile.fullName,
      biography: profile.biography,
      followerCount: profile.followerCount,
      followingCount: profile.followingCount,
      mediaCount: profile.mediaCount,
      isPrivate: profile.isPrivate,
      category: profile.category,
      followerFollowingRatio,
      postsPerWeek,
      avgEngagementRate,
      engagementRating,
      avgLikes,
      avgComments,
      totalPostsAnalyzed: posts.length,
    });

    const claudeResponse = await callClaude(
      "You are an expert Instagram account auditor. Analyze the provided metrics and return ONLY valid JSON with: healthScore (number 1-100), healthLabel (string: Excellent/Good/Fair/Poor), strengths (array of strings), weaknesses (array of strings), recommendations (array of strings, max 5). Be specific and actionable.",
      `Audit this Instagram account based on these real metrics:\n${metricsForClaude}`
    );

    const cleaned = claudeResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const analysis = JSON.parse(cleaned);

    return {
      success: true,
      data: {
        handle: profile.username,
        profile: {
          fullName: profile.fullName,
          biography: profile.biography,
          followerCount: profile.followerCount,
          followingCount: profile.followingCount,
          mediaCount: profile.mediaCount,
          isPrivate: profile.isPrivate,
          category: profile.category,
        },
        metrics: {
          followerFollowingRatio,
          postsPerWeek,
          engagementRate: `${avgEngagementRate.toFixed(2)}%`,
          engagementRating,
          averageLikesPerPost: avgLikes,
          averageCommentsPerPost: avgComments,
        },
        audit: analysis,
      },
      dataSource: "real",
    };
  } catch (err) {
    // AI fallback
    const aiResponse = await callClaude(
      "You are an expert Instagram account auditor. Return ONLY valid JSON, no markdown fences.",
      `Estimate Instagram audit metrics for @${handle}. Return JSON with: profile (followerCount, followingCount, mediaCount), metrics (followerFollowingRatio, postsPerWeek, engagementRate, engagementRating, averageLikesPerPost, averageCommentsPerPost), audit (healthScore 1-100, healthLabel, strengths array, weaknesses array, recommendations array). Use realistic estimates.`
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
