import { getCachedInstagramData } from "@/lib/tools/cache";
import { callClaude } from "@/lib/anthropic";
import type { ToolHandler, ToolResult } from "@/lib/tools/types";

const handler: ToolHandler = async (input) => {
  const handle = input.handle?.trim();
  if (!handle) {
    throw new Error("Missing required input: handle. Provide an Instagram username to check for fake followers.");
  }

  try {
    const data = await getCachedInstagramData(handle);
    const { profile, posts, avgEngagementRate } = data;

    // Compute suspicious signals
    const followerFollowingRatio =
      profile.followingCount > 0
        ? parseFloat((profile.followerCount / profile.followingCount).toFixed(2))
        : profile.followerCount;

    // Suspicious if large account (>10k) with low ratio
    const isLargeAccount = profile.followerCount > 10000;
    const lowRatioSuspicious = isLargeAccount && followerFollowingRatio < 2;

    // Engagement rate vs follower count analysis
    // Very low engagement with high followers is suspicious
    const veryLowEngagement = avgEngagementRate < 0.5 && profile.followerCount > 5000;

    // Comment-to-like ratio (healthy is ~1-5%, very low or very high can be suspicious)
    const totalLikes = posts.reduce((sum, p) => sum + p.likeCount, 0);
    const totalComments = posts.reduce((sum, p) => sum + p.commentCount, 0);
    const commentToLikeRatio =
      totalLikes > 0 ? parseFloat(((totalComments / totalLikes) * 100).toFixed(2)) : 0;
    const suspiciousCommentRatio = commentToLikeRatio < 0.5 || commentToLikeRatio > 20;

    // Count suspicious signals
    const suspiciousSignals: string[] = [];
    if (lowRatioSuspicious) {
      suspiciousSignals.push(
        `Low follower/following ratio (${followerFollowingRatio}) for an account with ${profile.followerCount.toLocaleString()} followers`
      );
    }
    if (veryLowEngagement) {
      suspiciousSignals.push(
        `Very low engagement rate (${avgEngagementRate.toFixed(2)}%) relative to ${profile.followerCount.toLocaleString()} followers`
      );
    }
    if (suspiciousCommentRatio) {
      suspiciousSignals.push(
        `Unusual comment-to-like ratio (${commentToLikeRatio}%) — healthy range is typically 1-5%`
      );
    }

    // Send to Claude for fraud risk assessment
    const metricsForClaude = JSON.stringify({
      username: profile.username,
      followerCount: profile.followerCount,
      followingCount: profile.followingCount,
      mediaCount: profile.mediaCount,
      followerFollowingRatio,
      avgEngagementRate,
      commentToLikeRatio,
      isPrivate: profile.isPrivate,
      category: profile.category,
      suspiciousSignals,
      totalPostsAnalyzed: posts.length,
      avgLikesPerPost: posts.length > 0 ? Math.round(totalLikes / posts.length) : 0,
      avgCommentsPerPost: posts.length > 0 ? Math.round(totalComments / posts.length) : 0,
    });

    const claudeResponse = await callClaude(
      "You are an expert in detecting fake followers and fraudulent engagement on Instagram. Analyze the provided real metrics and return ONLY valid JSON with: fraudRiskLevel (string: 'Low' | 'Medium' | 'High'), fraudRiskScore (number 0-100, where 100 is definitely fraudulent), explanation (string, 2-3 sentences explaining the assessment), redFlags (array of strings, specific concerns found), greenFlags (array of strings, positive authenticity signals). Be balanced and fair — not every account with unusual metrics has fake followers.",
      `Assess the fake follower risk for this Instagram account based on real metrics:\n${metricsForClaude}`
    );

    const cleaned = claudeResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const assessment = JSON.parse(cleaned);

    return {
      success: true,
      data: {
        handle: profile.username,
        profile: {
          followerCount: profile.followerCount,
          followingCount: profile.followingCount,
          mediaCount: profile.mediaCount,
          isPrivate: profile.isPrivate,
          category: profile.category,
        },
        metrics: {
          followerFollowingRatio,
          engagementRate: `${avgEngagementRate.toFixed(2)}%`,
          commentToLikeRatio: `${commentToLikeRatio}%`,
          avgLikesPerPost: posts.length > 0 ? Math.round(totalLikes / posts.length) : 0,
          avgCommentsPerPost: posts.length > 0 ? Math.round(totalComments / posts.length) : 0,
        },
        suspiciousSignals,
        assessment,
      },
      dataSource: "real",
    };
  } catch (err) {
    // AI fallback
    const aiResponse = await callClaude(
      "You are an expert in detecting fake followers on Instagram. Return ONLY valid JSON, no markdown fences.",
      `Estimate fake follower analysis for @${handle}. Return JSON with: profile (followerCount, followingCount, mediaCount), metrics (followerFollowingRatio, engagementRate, commentToLikeRatio, avgLikesPerPost, avgCommentsPerPost), suspiciousSignals (array), assessment (fraudRiskLevel Low/Medium/High, fraudRiskScore 0-100, explanation, redFlags array, greenFlags array). Use realistic estimates.`
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
