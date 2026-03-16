import { callClaude } from "@/lib/anthropic";
import { findChannelByName, formatCount, subscriberTier, hasYouTubeApiKey } from "@/lib/youtube-api";
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
      const channel = await findChannelByName(handle);
      if (channel) {
        const subs = channel.subscriberCount;
        const views = channel.viewCount;
        const videos = channel.videoCount;
        const avgViewsPerVideo = videos > 0 ? Math.round(views / videos) : 0;

        return {
          success: true,
          data: {
            channelName: channel.title,
            handle: channel.customUrl || channel.title,
            subscriberCount: subs,
            estimatedSubscribers: formatCount(subs),
            totalViews: formatCount(views),
            totalVideos: videos,
            subscriberTier: subscriberTier(subs),
            averageViewsPerVideo: formatCount(avgViewsPerVideo),
            channelCategory: channel.keywords ? channel.keywords.split(",")[0]?.trim() || "General" : "General",
            country: channel.country || "Unknown",
            channelCreated: channel.publishedAt ? new Date(channel.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "Unknown",
            thumbnailUrl: channel.thumbnailUrl,
            summary: `${channel.title} has ${formatCount(subs)} subscribers with ${formatCount(views)} total views across ${videos} videos. Average ${formatCount(avgViewsPerVideo)} views per video.`,
          },
          dataSource: "real",
        };
      }
    } catch (error) {
      console.error("[YouTube Subscriber Checker] API error, falling back to AI:", error);
    }
  }

  // ── AI fallback ──────────────────────────────────────────────────────────
  const systemPrompt = `You are a YouTube analytics expert. Estimate the subscriber count and related metrics for the given YouTube channel. Return ONLY valid JSON with no markdown formatting, no code fences, and no extra text. Use this exact structure:
{
  "channelName": "string",
  "estimatedSubscribers": "string (e.g. '3.2M')",
  "subscriberCount": number,
  "subscriberTier": "string (Micro/Rising/Mid/Macro/Mega)",
  "estimatedMonthlyGrowth": "string (e.g. '+50K/month')",
  "monthlyGrowthRate": "string (e.g. '1.5%')",
  "channelCategory": "string",
  "milestoneProgress": "string (e.g. 'Approaching 5M subscribers')",
  "summary": "string (brief subscriber analysis)"
}`;

  const userPrompt = `Estimate the subscriber count and growth metrics for the YouTube channel: ${handle}.`;

  try {
    const response = await callClaude(systemPrompt, userPrompt);
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      success: true,
      data: { ...parsed, note: "These are AI estimates. Real-time data was unavailable." },
      dataSource: "ai_estimate",
    };
  } catch (error) {
    return {
      success: false,
      data: { error: "Failed to check subscriber count.", details: error instanceof Error ? error.message : "Unknown error" },
      dataSource: "ai_estimate",
    };
  }
};

export default handler;
