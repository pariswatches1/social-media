import { getCachedInstagramData } from "@/lib/tools/cache";
import { callClaude } from "@/lib/anthropic";
import type { ToolHandler, ToolResult } from "@/lib/tools/types";

function computeMetrics(data: Awaited<ReturnType<typeof getCachedInstagramData>>) {
  const { profile, posts, avgEngagementRate } = data;
  const totalPosts = posts.length;
  const totalLikes = posts.reduce((sum, p) => sum + p.likeCount, 0);
  const totalComments = posts.reduce((sum, p) => sum + p.commentCount, 0);
  const avgLikes = totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0;
  const avgComments = totalPosts > 0 ? Math.round(totalComments / totalPosts) : 0;

  const typeCounts: Record<string, number> = { image: 0, video: 0, carousel: 0, reel: 0 };
  for (const post of posts) {
    typeCounts[post.mediaType] = (typeCounts[post.mediaType] || 0) + 1;
  }
  const mediaTypeDistribution: Record<string, string> = {};
  for (const [type, count] of Object.entries(typeCounts)) {
    mediaTypeDistribution[type] = totalPosts > 0 ? `${((count / totalPosts) * 100).toFixed(1)}%` : "0%";
  }

  return {
    profile: {
      username: profile.username,
      fullName: profile.fullName,
      biography: profile.biography,
      followerCount: profile.followerCount,
      followingCount: profile.followingCount,
      mediaCount: profile.mediaCount,
      isPrivate: profile.isPrivate,
      category: profile.category,
    },
    engagementRate: avgEngagementRate,
    avgLikesPerPost: avgLikes,
    avgCommentsPerPost: avgComments,
    totalPostsAnalyzed: totalPosts,
    mediaTypeDistribution,
  };
}

function determineWinner(
  val1: number,
  val2: number,
  handle1: string,
  handle2: string
): string {
  if (val1 > val2) return handle1;
  if (val2 > val1) return handle2;
  return "Tie";
}

const handler: ToolHandler = async (input) => {
  const handle = input.handle?.trim();
  const handle2 = input.handle2?.trim();

  if (!handle) {
    throw new Error("Missing required input: handle. Provide the first Instagram username to compare.");
  }
  if (!handle2) {
    throw new Error("Missing required input: handle2. Provide the second Instagram username to compare.");
  }

  try {
    // Fetch both accounts in parallel
    const [data1, data2] = await Promise.all([
      getCachedInstagramData(handle),
      getCachedInstagramData(handle2),
    ]);

    const metrics1 = computeMetrics(data1);
    const metrics2 = computeMetrics(data2);

    const winners = {
      followers: determineWinner(
        metrics1.profile.followerCount,
        metrics2.profile.followerCount,
        metrics1.profile.username,
        metrics2.profile.username
      ),
      engagementRate: determineWinner(
        metrics1.engagementRate,
        metrics2.engagementRate,
        metrics1.profile.username,
        metrics2.profile.username
      ),
      avgLikes: determineWinner(
        metrics1.avgLikesPerPost,
        metrics2.avgLikesPerPost,
        metrics1.profile.username,
        metrics2.profile.username
      ),
      avgComments: determineWinner(
        metrics1.avgCommentsPerPost,
        metrics2.avgCommentsPerPost,
        metrics1.profile.username,
        metrics2.profile.username
      ),
      totalContent: determineWinner(
        metrics1.profile.mediaCount,
        metrics2.profile.mediaCount,
        metrics1.profile.username,
        metrics2.profile.username
      ),
    };

    return {
      success: true,
      data: {
        account1: {
          ...metrics1,
          engagementRate: `${metrics1.engagementRate.toFixed(2)}%`,
        },
        account2: {
          ...metrics2,
          engagementRate: `${metrics2.engagementRate.toFixed(2)}%`,
        },
        comparison: {
          winners,
          engagementDifference: `${Math.abs(metrics1.engagementRate - metrics2.engagementRate).toFixed(2)}%`,
          followerDifference: Math.abs(
            metrics1.profile.followerCount - metrics2.profile.followerCount
          ),
          avgLikesDifference: Math.abs(metrics1.avgLikesPerPost - metrics2.avgLikesPerPost),
          avgCommentsDifference: Math.abs(metrics1.avgCommentsPerPost - metrics2.avgCommentsPerPost),
        },
      },
      dataSource: "real",
    };
  } catch (err) {
    // AI fallback
    const aiResponse = await callClaude(
      "You are a social media analytics expert. Return ONLY valid JSON, no markdown fences.",
      `Compare Instagram accounts @${handle} and @${handle2}. Return JSON with: account1 (profile with username/fullName/followerCount/followingCount/mediaCount, engagementRate, avgLikesPerPost, avgCommentsPerPost, mediaTypeDistribution), account2 (same structure), comparison (winners object with followers/engagementRate/avgLikes/avgComments/totalContent category winners, engagementDifference, followerDifference, avgLikesDifference, avgCommentsDifference). Use realistic estimates.`
    );

    const cleaned = aiResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      success: true,
      data: { ...parsed, note: "Based on AI estimates — real data unavailable" },
      dataSource: "ai_estimate",
    };
  }
};

export default handler;
