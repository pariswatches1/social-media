import { getCachedInstagramData } from "@/lib/tools/cache";
import { callClaude } from "@/lib/anthropic";
import type { ToolHandler, ToolResult } from "@/lib/tools/types";

const handler: ToolHandler = async (input) => {
  const handle = input.handle?.trim();
  if (!handle) {
    throw new Error("Missing required input: handle. Provide an Instagram username to analyze.");
  }

  try {
    const data = await getCachedInstagramData(handle);
    const { profile, posts, topPosts, avgEngagementRate } = data;

    const totalPosts = posts.length;
    const totalLikes = posts.reduce((sum, p) => sum + p.likeCount, 0);
    const totalComments = posts.reduce((sum, p) => sum + p.commentCount, 0);
    const avgLikes = totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0;
    const avgComments = totalPosts > 0 ? Math.round(totalComments / totalPosts) : 0;

    const likesToFollowerRatio =
      profile.followerCount > 0
        ? parseFloat(((totalLikes / totalPosts / profile.followerCount) * 100).toFixed(4))
        : 0;
    const commentsToFollowerRatio =
      profile.followerCount > 0
        ? parseFloat(((totalComments / totalPosts / profile.followerCount) * 100).toFixed(4))
        : 0;

    // Media type distribution
    const typeCounts: Record<string, number> = { image: 0, video: 0, carousel: 0, reel: 0 };
    for (const post of posts) {
      typeCounts[post.mediaType] = (typeCounts[post.mediaType] || 0) + 1;
    }
    const mediaTypeDistribution: Record<string, string> = {};
    for (const [type, count] of Object.entries(typeCounts)) {
      mediaTypeDistribution[type] = totalPosts > 0 ? `${((count / totalPosts) * 100).toFixed(1)}%` : "0%";
    }

    // Top 3 posts by engagement
    const sortedPosts = [...posts].sort((a, b) => b.engagementRate - a.engagementRate);
    const top3Posts = sortedPosts.slice(0, 3).map((p) => ({
      caption: p.caption.slice(0, 100) + (p.caption.length > 100 ? "..." : ""),
      likes: p.likeCount,
      comments: p.commentCount,
      shares: p.shareCount,
      mediaType: p.mediaType,
      engagementRate: `${p.engagementRate.toFixed(2)}%`,
    }));

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

    return {
      success: true,
      data: {
        handle: profile.username,
        followerCount: profile.followerCount,
        totalPostsAnalyzed: totalPosts,
        overallEngagementRate: `${avgEngagementRate.toFixed(2)}%`,
        engagementRating,
        averageLikesPerPost: avgLikes,
        averageCommentsPerPost: avgComments,
        likesToFollowerRatio: `${likesToFollowerRatio}%`,
        commentsToFollowerRatio: `${commentsToFollowerRatio}%`,
        mediaTypeDistribution,
        top3PostsByEngagement: top3Posts,
      },
      dataSource: "real",
    };
  } catch (err) {
    // AI fallback
    const aiResponse = await callClaude(
      "You are a social media analytics expert. Return ONLY valid JSON, no markdown fences.",
      `Estimate Instagram engagement metrics for @${handle}. Return JSON with: overallEngagementRate, engagementRating, averageLikesPerPost, averageCommentsPerPost, likesToFollowerRatio, commentsToFollowerRatio, mediaTypeDistribution (image/video/carousel/reel percentages), top3PostsByEngagement (array of 3 objects with caption, likes, comments, shares, mediaType, engagementRate). Use realistic estimates.`
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
