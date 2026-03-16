import { callClaude } from "@/lib/anthropic";
import { fetchYouTubeChannelData, formatCount, engagementRating, hasYouTubeApiKey } from "@/lib/youtube-api";
import type { ToolHandler, ToolResult } from "@/lib/tools/types";

const handler: ToolHandler = async (input): Promise<ToolResult> => {
  const handle = input.handle?.trim();
  if (!handle) {
    return {
      success: false,
      data: { error: "A YouTube channel name is required." },
      dataSource: "ai_estimate",
    };
  }

  // ── Try real YouTube API first ───────────────────────────────────────────
  if (hasYouTubeApiKey()) {
    try {
      const data = await fetchYouTubeChannelData(handle);
      if (data) {
        const { channel, recentVideos, avgViews, avgLikes, avgComments, engagementRate, viewToSubRatio } = data;
        const rating = engagementRating(engagementRate);

        // Score components (1-10)
        const likesScore = Math.min(10, Math.round((avgLikes / Math.max(avgViews, 1)) * 100 * 2));
        const commentsScore = Math.min(10, Math.round((avgComments / Math.max(avgViews, 1)) * 100 * 5));

        // Top performing videos
        const topVideos = [...recentVideos]
          .sort((a, b) => (b.likeCount + b.commentCount) - (a.likeCount + a.commentCount))
          .slice(0, 3)
          .map((v) => ({
            title: v.title,
            views: formatCount(v.viewCount),
            likes: formatCount(v.likeCount),
            comments: formatCount(v.commentCount),
            published: new Date(v.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          }));

        return {
          success: true,
          data: {
            channelName: channel.title,
            handle: channel.customUrl || channel.title,
            subscribers: formatCount(channel.subscriberCount),
            engagementRate: `${engagementRate}%`,
            engagementRating: rating,
            averageViewsPerVideo: formatCount(avgViews),
            averageLikesPerVideo: formatCount(avgLikes),
            averageCommentsPerVideo: formatCount(avgComments),
            viewToSubscriberRatio: `${viewToSubRatio}%`,
            videosAnalyzed: recentVideos.length,
            engagementBreakdown: {
              likesScore: Math.max(1, likesScore),
              commentsScore: Math.max(1, commentsScore),
              sharesEstimate: viewToSubRatio > 30 ? "High" : viewToSubRatio > 10 ? "Medium" : "Low",
              communityInteraction: commentsScore >= 5 ? "High" : commentsScore >= 2 ? "Medium" : "Low",
            },
            topPerformingVideos: topVideos,
            thumbnailUrl: channel.thumbnailUrl,
            summary: `${channel.title} has a ${engagementRate}% engagement rate (${rating}). Averaging ${formatCount(avgViews)} views, ${formatCount(avgLikes)} likes, and ${formatCount(avgComments)} comments per video across the last ${recentVideos.length} uploads.`,
          },
          dataSource: "real",
        };
      }
    } catch (error) {
      console.error("[YouTube Engagement Calculator] API error, falling back to AI:", error);
    }
  }

  // ── AI fallback ──────────────────────────────────────────────────────────
  const systemPrompt = `You are a YouTube engagement analytics expert. Estimate the engagement metrics for the given YouTube channel. Return ONLY valid JSON with no markdown formatting, no code fences, and no extra text. Use this exact structure:
{
  "channelName": "string",
  "engagementRate": "string (e.g. '4.5%')",
  "averageViewsPerVideo": "string (e.g. '250K')",
  "averageLikesPerVideo": "string (e.g. '15K')",
  "averageCommentsPerVideo": "string (e.g. '1.2K')",
  "viewToSubscriberRatio": "string (e.g. '12%')",
  "engagementRating": "string (Excellent/Good/Average/Low)",
  "engagementBreakdown": {
    "likesScore": number (1-10),
    "commentsScore": number (1-10),
    "sharesEstimate": "string (High/Medium/Low)",
    "communityInteraction": "string (High/Medium/Low)"
  },
  "summary": "string (brief engagement summary)"
}`;

  const userPrompt = `Estimate the engagement metrics for the YouTube channel: ${handle}.`;

  try {
    const response = await callClaude(systemPrompt, userPrompt);
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      success: true,
      data: { ...parsed, note: "Engagement metrics are AI-estimated. Real-time data was unavailable." },
      dataSource: "ai_estimate",
    };
  } catch (error) {
    return {
      success: false,
      data: { error: "Failed to estimate YouTube engagement metrics.", details: error instanceof Error ? error.message : "Unknown error" },
      dataSource: "ai_estimate",
    };
  }
};

export default handler;
