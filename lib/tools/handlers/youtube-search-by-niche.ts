import { callClaude } from "@/lib/anthropic";
import { searchChannels, formatCount, subscriberTier, engagementRating, hasYouTubeApiKey, getRecentVideos } from "@/lib/youtube-api";
import type { ToolHandler, ToolResult } from "@/lib/tools/types";

const handler: ToolHandler = async (input): Promise<ToolResult> => {
  const niche = input.niche || input.topic;
  if (!niche) {
    throw new Error("A niche keyword is required to search YouTube channels.");
  }

  // ── Try real YouTube API first ───────────────────────────────────────────
  if (hasYouTubeApiKey()) {
    try {
      const channels = await searchChannels(`${niche} creators`, 10);

      if (channels.length > 0) {
        // Enrich top 5 with engagement data (conserve quota)
        const enrichedChannels = await Promise.all(
          channels.slice(0, 5).map(async (ch) => {
            try {
              const videos = await getRecentVideos(ch.channelId, 5);
              const avgViews = videos.length > 0
                ? Math.round(videos.reduce((s, v) => s + v.viewCount, 0) / videos.length) : 0;
              const avgLikes = videos.length > 0
                ? Math.round(videos.reduce((s, v) => s + v.likeCount, 0) / videos.length) : 0;
              const avgComments = videos.length > 0
                ? Math.round(videos.reduce((s, v) => s + v.commentCount, 0) / videos.length) : 0;
              const engRate = ch.subscriberCount > 0
                ? ((avgLikes + avgComments) / ch.subscriberCount) * 100 : 0;

              return {
                channelName: ch.title, handle: ch.customUrl || ch.title,
                subscribers: formatCount(ch.subscriberCount), subscriberCount: ch.subscriberCount,
                subscriberTier: subscriberTier(ch.subscriberCount),
                averageViews: formatCount(avgViews),
                engagementRate: `${Math.round(engRate * 100) / 100}%`,
                engagementRating: engagementRating(engRate),
                totalVideos: ch.videoCount, country: ch.country || "Unknown",
                description: ch.description.slice(0, 200), thumbnailUrl: ch.thumbnailUrl,
                channelId: ch.channelId,
              };
            } catch {
              return {
                channelName: ch.title, handle: ch.customUrl || ch.title,
                subscribers: formatCount(ch.subscriberCount), subscriberCount: ch.subscriberCount,
                subscriberTier: subscriberTier(ch.subscriberCount),
                averageViews: "N/A", engagementRate: "N/A", engagementRating: "Unknown",
                totalVideos: ch.videoCount, country: ch.country || "Unknown",
                description: ch.description.slice(0, 200), thumbnailUrl: ch.thumbnailUrl,
                channelId: ch.channelId,
              };
            }
          })
        );

        const remaining = channels.slice(5).map((ch) => ({
          channelName: ch.title, handle: ch.customUrl || ch.title,
          subscribers: formatCount(ch.subscriberCount), subscriberCount: ch.subscriberCount,
          subscriberTier: subscriberTier(ch.subscriberCount),
          averageViews: "N/A", engagementRate: "N/A", engagementRating: "Unknown",
          totalVideos: ch.videoCount, country: ch.country || "Unknown",
          description: ch.description.slice(0, 200), thumbnailUrl: ch.thumbnailUrl,
          channelId: ch.channelId,
        }));

        const allChannels = [...enrichedChannels, ...remaining]
          .sort((a, b) => b.subscriberCount - a.subscriberCount);

        return {
          success: true,
          data: {
            niche, channels: allChannels, totalFound: allChannels.length,
            nicheInsights: {
              saturation: allChannels.length >= 10 ? "high" : allChannels.length >= 5 ? "moderate" : "low",
              topChannelSubscribers: formatCount(allChannels[0]?.subscriberCount || 0),
              avgSubscribers: formatCount(Math.round(allChannels.reduce((s, c) => s + c.subscriberCount, 0) / allChannels.length)),
            },
          },
          dataSource: "real",
        };
      }
    } catch (error) {
      console.error("[YouTube Search by Niche] API error, falling back to AI:", error);
    }
  }

  // ── AI fallback ──────────────────────────────────────────────────────────
  const systemPrompt = `You are a YouTube creator discovery specialist. Return ONLY valid JSON. Suggest YouTube channels in a given niche.
Return: { "niche": "string", "channels": [{ "channelName": "string", "handle": "string", "estimatedSubscribers": "string", "contentStyle": "string", "uploadFrequency": "string", "averageViews": "string", "audienceType": "string", "standoutContent": "string" }], "nicheInsights": { "saturation": "string", "growthTrend": "string", "topContentFormats": ["string"] } }`;

  const userPrompt = `Suggest 10 YouTube channels in the "${niche}" niche.`;
  const response = await callClaude(systemPrompt, userPrompt);
  const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return { success: true, data: { ...parsed, disclaimer: "These are AI-generated suggestions. Verify on YouTube." }, dataSource: "ai_estimate" };
  } catch {
    throw new Error("Failed to parse AI response for YouTube niche search.");
  }
};

export default handler;
