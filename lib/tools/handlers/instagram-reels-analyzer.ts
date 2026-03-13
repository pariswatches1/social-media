import { getCachedInstagramData } from "@/lib/tools/cache";
import { callClaude } from "@/lib/anthropic";
import type { ToolHandler, ToolResult } from "@/lib/tools/types";

const handler: ToolHandler = async (input) => {
  const handle = input.handle?.trim();
  if (!handle) {
    throw new Error("Missing required input: handle. Provide an Instagram username to analyze reels.");
  }

  try {
    const data = await getCachedInstagramData(handle);
    const { profile, posts, avgEngagementRate } = data;

    // Filter reels
    const reels = posts.filter((p) => p.mediaType === "reel");

    if (reels.length === 0) {
      return {
        success: true,
        data: {
          handle: profile.username,
          followerCount: profile.followerCount,
          totalPostsAnalyzed: posts.length,
          reelsCount: 0,
          message: `No reels found among the ${posts.length} most recent posts for @${profile.username}. This account may not be posting reels, or they may not appear in recent content.`,
        },
        dataSource: "real",
      };
    }

    const nonReels = posts.filter((p) => p.mediaType !== "reel");

    // Reel metrics
    const reelEngagementTotal = reels.reduce((sum, r) => sum + r.engagementRate, 0);
    const avgReelEngagement = reelEngagementTotal / reels.length;

    const nonReelEngagement =
      nonReels.length > 0
        ? nonReels.reduce((sum, p) => sum + p.engagementRate, 0) / nonReels.length
        : 0;

    const reelsWithPlays = reels.filter((r) => r.playCount !== null);
    const avgPlayCount =
      reelsWithPlays.length > 0
        ? Math.round(reelsWithPlays.reduce((sum, r) => sum + (r.playCount || 0), 0) / reelsWithPlays.length)
        : null;

    // Top 3 reels by engagement
    const sortedReels = [...reels].sort((a, b) => b.engagementRate - a.engagementRate);
    const top3Reels = sortedReels.slice(0, 3).map((r) => ({
      caption: r.caption.slice(0, 100) + (r.caption.length > 100 ? "..." : ""),
      likes: r.likeCount,
      comments: r.commentCount,
      shares: r.shareCount,
      playCount: r.playCount,
      engagementRate: `${r.engagementRate.toFixed(2)}%`,
    }));

    const reelPerformanceVsOverall =
      avgEngagementRate > 0
        ? parseFloat(((avgReelEngagement / avgEngagementRate) * 100 - 100).toFixed(1))
        : 0;

    return {
      success: true,
      data: {
        handle: profile.username,
        followerCount: profile.followerCount,
        totalPostsAnalyzed: posts.length,
        reelsAnalysis: {
          reelsCount: reels.length,
          reelsPercentage: `${((reels.length / posts.length) * 100).toFixed(1)}%`,
          avgReelEngagementRate: `${avgReelEngagement.toFixed(2)}%`,
          overallEngagementRate: `${avgEngagementRate.toFixed(2)}%`,
          nonReelEngagementRate: `${nonReelEngagement.toFixed(2)}%`,
          reelPerformanceVsOverall: `${reelPerformanceVsOverall > 0 ? "+" : ""}${reelPerformanceVsOverall}%`,
          avgPlayCount,
          top3ReelsByEngagement: top3Reels,
        },
      },
      dataSource: "real",
    };
  } catch (err) {
    // AI fallback
    const aiResponse = await callClaude(
      "You are a social media analytics expert. Return ONLY valid JSON, no markdown fences.",
      `Estimate Instagram Reels analytics for @${handle}. Return JSON with: followerCount, totalPostsAnalyzed, reelsAnalysis (reelsCount, reelsPercentage, avgReelEngagementRate, overallEngagementRate, nonReelEngagementRate, reelPerformanceVsOverall, avgPlayCount, top3ReelsByEngagement array with caption/likes/comments/shares/playCount/engagementRate). Use realistic estimates.`
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
