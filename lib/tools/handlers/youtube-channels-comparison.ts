import { callClaude } from "@/lib/anthropic";
import { fetchYouTubeChannelData, formatCount, engagementRating, hasYouTubeApiKey } from "@/lib/youtube-api";
import type { ToolHandler, ToolResult } from "@/lib/tools/types";

const handler: ToolHandler = async (input): Promise<ToolResult> => {
  const handle = input.handle?.trim();
  const handle2 = input.handle2?.trim();

  if (!handle || !handle2) {
    return {
      success: false,
      data: { error: "Two YouTube channel names are required for comparison." },
      dataSource: "ai_estimate",
    };
  }

  // ── Try real YouTube API first ───────────────────────────────────────────
  if (hasYouTubeApiKey()) {
    try {
      // Fetch both channels in parallel
      const [data1, data2] = await Promise.all([
        fetchYouTubeChannelData(handle),
        fetchYouTubeChannelData(handle2),
      ]);

      if (data1 && data2) {
        const ch1 = data1.channel;
        const ch2 = data2.channel;

        // Determine winners for each category
        const subsWinner = ch1.subscriberCount >= ch2.subscriberCount ? ch1.title : ch2.title;
        const viewsWinner = data1.avgViews >= data2.avgViews ? ch1.title : ch2.title;
        const engagementWinner = data1.engagementRate >= data2.engagementRate ? ch1.title : ch2.title;
        const videosWinner = ch1.videoCount >= ch2.videoCount ? ch1.title : ch2.title;

        // Overall: weighted score
        const score1 =
          (ch1.subscriberCount > ch2.subscriberCount ? 1 : 0) +
          (data1.avgViews > data2.avgViews ? 1 : 0) +
          (data1.engagementRate > data2.engagementRate ? 2 : 0) + // engagement counts double
          (data1.viewToSubRatio > data2.viewToSubRatio ? 1 : 0);
        const score2 = 5 - score1;
        const overallWinner = score1 >= score2 ? ch1.title : ch2.title;

        // Use AI for qualitative comparison based on real data
        let aiSummary = "";
        try {
          const aiPrompt = `Compare these two YouTube channels using their real stats. Write a 2-3 sentence comparison summary.
Channel 1: ${ch1.title} — ${formatCount(ch1.subscriberCount)} subs, ${data1.engagementRate}% engagement, ${formatCount(data1.avgViews)} avg views
Channel 2: ${ch2.title} — ${formatCount(ch2.subscriberCount)} subs, ${data2.engagementRate}% engagement, ${formatCount(data2.avgViews)} avg views
Return ONLY the summary text, no JSON.`;
          aiSummary = await callClaude("You are a YouTube analytics expert. Be concise.", aiPrompt);
        } catch {
          aiSummary = `${overallWinner} leads overall with stronger metrics across key categories.`;
        }

        return {
          success: true,
          data: {
            channel1: {
              name: ch1.title,
              handle: ch1.customUrl || ch1.title,
              subscribers: formatCount(ch1.subscriberCount),
              subscriberCount: ch1.subscriberCount,
              totalViews: formatCount(ch1.viewCount),
              totalVideos: ch1.videoCount,
              avgViews: formatCount(data1.avgViews),
              avgLikes: formatCount(data1.avgLikes),
              avgComments: formatCount(data1.avgComments),
              engagementRate: `${data1.engagementRate}%`,
              engagementRating: engagementRating(data1.engagementRate),
              viewToSubRatio: `${data1.viewToSubRatio}%`,
              country: ch1.country || "Unknown",
              thumbnailUrl: ch1.thumbnailUrl,
            },
            channel2: {
              name: ch2.title,
              handle: ch2.customUrl || ch2.title,
              subscribers: formatCount(ch2.subscriberCount),
              subscriberCount: ch2.subscriberCount,
              totalViews: formatCount(ch2.viewCount),
              totalVideos: ch2.videoCount,
              avgViews: formatCount(data2.avgViews),
              avgLikes: formatCount(data2.avgLikes),
              avgComments: formatCount(data2.avgComments),
              engagementRate: `${data2.engagementRate}%`,
              engagementRating: engagementRating(data2.engagementRate),
              viewToSubRatio: `${data2.viewToSubRatio}%`,
              country: ch2.country || "Unknown",
              thumbnailUrl: ch2.thumbnailUrl,
            },
            comparison: {
              subscribersWinner: subsWinner,
              viewsWinner,
              engagementWinner,
              contentVolumeWinner: videosWinner,
              overallWinner,
            },
            summary: aiSummary,
          },
          dataSource: "real",
        };
      }
    } catch (error) {
      console.error("[YouTube Comparison] API error, falling back to AI:", error);
    }
  }

  // ── AI fallback ──────────────────────────────────────────────────────────
  const systemPrompt = `You are a YouTube analytics expert specializing in channel comparisons. Compare the two given channels. Return ONLY valid JSON with no markdown. Use this structure:
{
  "channel1": {
    "name": "string", "estimatedSubscribers": "string", "contentStyle": "string",
    "estimatedEngagementRate": "string", "growthTrend": "string"
  },
  "channel2": {
    "name": "string", "estimatedSubscribers": "string", "contentStyle": "string",
    "estimatedEngagementRate": "string", "growthTrend": "string"
  },
  "comparison": {
    "subscribersWinner": "string", "contentQualityWinner": "string",
    "engagementWinner": "string", "growthWinner": "string", "overallWinner": "string"
  },
  "summary": "string"
}`;

  const userPrompt = `Compare these two YouTube channels: "${handle}" vs "${handle2}".`;

  try {
    const response = await callClaude(systemPrompt, userPrompt);
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      success: true,
      data: { ...parsed, note: "This comparison uses AI-estimated metrics. Real-time data was unavailable." },
      dataSource: "ai_estimate",
    };
  } catch (error) {
    return {
      success: false,
      data: { error: "Failed to compare YouTube channels.", details: error instanceof Error ? error.message : "Unknown error" },
      dataSource: "ai_estimate",
    };
  }
};

export default handler;
