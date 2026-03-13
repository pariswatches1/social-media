import { callClaude } from "@/lib/anthropic";
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

  const systemPrompt = `You are a YouTube analytics expert. Estimate the subscriber count and related metrics for the given YouTube channel. Return ONLY valid JSON with no markdown formatting, no code fences, and no extra text. Use this exact structure:
{
  "channelName": "string",
  "estimatedSubscribers": "string (e.g. '3.2M')",
  "subscriberCount": number (raw estimated number, e.g. 3200000),
  "subscriberTier": "string (one of: Micro (<10K), Rising (10K-100K), Mid (100K-1M), Macro (1M-10M), Mega (10M+))",
  "estimatedMonthlyGrowth": "string (e.g. '+50K/month')",
  "monthlyGrowthRate": "string (e.g. '1.5%')",
  "channelCategory": "string (e.g. 'Gaming', 'Education', 'Entertainment')",
  "milestoneProgress": "string (e.g. 'Approaching 5M subscribers')",
  "summary": "string (brief subscriber analysis)"
}`;

  const userPrompt = `Estimate the subscriber count and growth metrics for the YouTube channel: ${handle}. Provide your best estimates based on your knowledge.`;

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
        note: "For real-time subscriber data, YouTube API integration coming soon.",
      },
      dataSource: "ai_estimate",
    };
  } catch (error) {
    return {
      success: false,
      data: {
        error: "Failed to estimate YouTube subscriber count.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      dataSource: "ai_estimate",
    };
  }
};

export default handler;
