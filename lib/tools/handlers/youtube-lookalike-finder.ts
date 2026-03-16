import { callClaude } from "@/lib/anthropic";
import { findChannelByName, searchChannels, formatCount, subscriberTier, hasYouTubeApiKey } from "@/lib/youtube-api";
import type { ToolHandler, ToolResult } from "@/lib/tools/types";

const handler: ToolHandler = async (input): Promise<ToolResult> => {
  const handle = input.handle?.trim();
  if (!handle) {
    throw new Error("A YouTube channel name is required to find lookalikes.");
  }

  // ── Try real YouTube API + AI ────────────────────────────────────────────
  if (hasYouTubeApiKey()) {
    try {
      const sourceChannel = await findChannelByName(handle);

      if (sourceChannel) {
        // Build search query from channel keywords/description
        const keywords = sourceChannel.keywords
          ? sourceChannel.keywords.split(/[,\s]+/).filter(Boolean).slice(0, 3).join(" ")
          : sourceChannel.title;

        const searchQuery = `${keywords} ${sourceChannel.description.split(" ").slice(0, 5).join(" ")}`;
        const similarChannels = await searchChannels(searchQuery, 15);

        // Filter out source, sort by subscriber proximity
        const lookalikes = similarChannels
          .filter((ch) => ch.channelId !== sourceChannel.channelId)
          .sort((a, b) => {
            const diffA = Math.abs(a.subscriberCount - sourceChannel.subscriberCount);
            const diffB = Math.abs(b.subscriberCount - sourceChannel.subscriberCount);
            return diffA - diffB;
          })
          .slice(0, 10)
          .map((ch) => ({
            channelName: ch.title, handle: ch.customUrl || ch.title,
            subscribers: formatCount(ch.subscriberCount), subscriberCount: ch.subscriberCount,
            subscriberTier: subscriberTier(ch.subscriberCount),
            totalVideos: ch.videoCount, totalViews: formatCount(ch.viewCount),
            country: ch.country || "Unknown", description: ch.description.slice(0, 200),
            thumbnailUrl: ch.thumbnailUrl, channelId: ch.channelId,
          }));

        if (lookalikes.length > 0) {
          let aiExplanation = "";
          try {
            const aiPrompt = `"${sourceChannel.title}" (${formatCount(sourceChannel.subscriberCount)} subs) has lookalike channels: ${lookalikes.slice(0, 5).map(c => c.channelName).join(", ")}. Write 1-2 sentences on what they share.`;
            aiExplanation = await callClaude("You are a YouTube analyst. Be concise.", aiPrompt);
          } catch {
            aiExplanation = `These channels share similar content themes with ${sourceChannel.title}.`;
          }

          return {
            success: true,
            data: {
              sourceChannel: {
                name: sourceChannel.title, handle: sourceChannel.customUrl || sourceChannel.title,
                subscribers: formatCount(sourceChannel.subscriberCount),
                totalViews: formatCount(sourceChannel.viewCount), thumbnailUrl: sourceChannel.thumbnailUrl,
              },
              lookalikes, totalFound: lookalikes.length, explanation: aiExplanation,
            },
            dataSource: "real",
          };
        }
      }
    } catch (error) {
      console.error("[YouTube Lookalike Finder] API error, falling back to AI:", error);
    }
  }

  // ── AI fallback ──────────────────────────────────────────────────────────
  const systemPrompt = `You are a YouTube creator discovery specialist. Find similar channels. Return ONLY valid JSON:
{ "sourceChannel": { "name": "string", "estimatedSubscribers": "string", "contentStyle": "string" }, "lookalikes": [{ "channelName": "string", "handle": "string", "estimatedSubscribers": "string", "contentStyle": "string", "whySimilar": "string", "audienceOverlap": "string (High/Medium/Low)" }], "explanation": "string" }`;

  const userPrompt = `Find 8 YouTube channels similar to "${handle}".`;
  const response = await callClaude(systemPrompt, userPrompt);
  const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return { success: true, data: { ...parsed, disclaimer: "These are AI-generated suggestions. Verify on YouTube." }, dataSource: "ai_estimate" };
  } catch {
    throw new Error("Failed to parse AI response for YouTube lookalike finder.");
  }
};

export default handler;
