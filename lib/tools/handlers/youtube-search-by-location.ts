import { callClaude } from "@/lib/anthropic";
import { searchChannels, formatCount, subscriberTier, hasYouTubeApiKey } from "@/lib/youtube-api";
import type { ToolHandler, ToolResult } from "@/lib/tools/types";

const handler: ToolHandler = async (input): Promise<ToolResult> => {
  const location = input.location || input.country;
  const niche = input.niche || input.topic || "";

  if (!location) {
    throw new Error("A location (city or country) is required.");
  }

  // ── Try real YouTube API first ───────────────────────────────────────────
  if (hasYouTubeApiKey()) {
    try {
      const query = niche ? `${niche} creators ${location}` : `YouTubers from ${location}`;
      const channels = await searchChannels(query, 10);

      if (channels.length > 0) {
        const channelResults = channels
          .sort((a, b) => b.subscriberCount - a.subscriberCount)
          .map((ch) => ({
            channelName: ch.title, handle: ch.customUrl || ch.title,
            subscribers: formatCount(ch.subscriberCount), subscriberCount: ch.subscriberCount,
            subscriberTier: subscriberTier(ch.subscriberCount),
            totalVideos: ch.videoCount, totalViews: formatCount(ch.viewCount),
            country: ch.country || "Unknown", description: ch.description.slice(0, 200),
            thumbnailUrl: ch.thumbnailUrl, channelId: ch.channelId,
          }));

        return {
          success: true,
          data: {
            location, niche: niche || "All niches", channels: channelResults,
            totalFound: channelResults.length,
            note: "Results based on YouTube search. Channel locations are self-reported.",
          },
          dataSource: "real",
        };
      }
    } catch (error) {
      console.error("[YouTube Search by Location] API error, falling back to AI:", error);
    }
  }

  // ── AI fallback ──────────────────────────────────────────────────────────
  const systemPrompt = `You are a YouTube creator discovery specialist. Return ONLY valid JSON. Suggest channels based in a location.
Return: { "location": "string", "niche": "string", "channels": [{ "channelName": "string", "handle": "string", "estimatedSubscribers": "string", "contentStyle": "string", "language": "string", "whyRelevant": "string" }], "locationInsights": { "creatorDensity": "string", "dominantNiches": ["string"], "growthTrend": "string" } }`;

  const userPrompt = `Suggest 10 YouTube channels based in ${location}${niche ? ` in the "${niche}" niche` : ""}.`;
  const response = await callClaude(systemPrompt, userPrompt);
  const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return { success: true, data: { ...parsed, disclaimer: "These are AI-generated suggestions. Verify on YouTube." }, dataSource: "ai_estimate" };
  } catch {
    throw new Error("Failed to parse AI response for YouTube location search.");
  }
};

export default handler;
