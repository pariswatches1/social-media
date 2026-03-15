import { callClaude } from "@/lib/anthropic";
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

  const systemPrompt = `You are a YouTube analytics expert specializing in channel comparisons. Compare the two given YouTube channels across multiple dimensions. Return ONLY valid JSON with no markdown formatting, no code fences, and no extra text. Use this exact structure:
{
  "channel1": {
    "name": "string",
    "estimatedSubscribers": "string (e.g. '2.5M')",
    "contentStyle": "string",
    "estimatedEngagementRate": "string (e.g. '5.2%')",
    "growthTrend": "string (Growing/Stable/Declining)"
  },
  "channel2": {
    "name": "string",
    "estimatedSubscribers": "string",
    "contentStyle": "string",
    "estimatedEngagementRate": "string",
    "growthTrend": "string"
  },
  "comparison": {
    "subscribersWinner": "string (channel name)",
    "contentQualityWinner": "string (channel name)",
    "engagementWinner": "string (channel name)",
    "growthWinner": "string (channel name)",
    "overallWinner": "string (channel name)"
  },
  "contentStyleComparison": "string (detailed comparison)",
  "engagementComparison": "string (detailed comparison)",
  "growthComparison": "string (detailed comparison)",
  "summary": "string (overall comparison summary)"
}`;

  const userPrompt = `Compare these two YouTube channels: "${handle}" vs "${handle2}". Provide your best estimates and analysis based on your knowledge of both channels.`;

  try {
    const response = await callClaude(systemPrompt, userPrompt);
    const cleaned = response
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const parsed = JSON.parse(cleaned);

    return {
      success: true,
      data: {
        ...parsed,
        note: "This comparison uses AI-estimated metrics. For precise real-time data, YouTube API integration is coming soon.",
      },
      dataSource: "ai_estimate",
    };
  } catch (error) {
    return {
      success: false,
      data: {
        error: "Failed to compare YouTube channels.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      dataSource: "ai_estimate",
    };
  }
};

export default handler;
