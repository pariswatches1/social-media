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

  const systemPrompt = `You are a YouTube engagement analytics expert. Estimate the engagement metrics for the given YouTube channel. Return ONLY valid JSON with no markdown formatting, no code fences, and no extra text. Use this exact structure:
{
  "channelName": "string",
  "engagementRate": "string (e.g. '4.5%')",
  "averageViewsPerVideo": "string (e.g. '250K')",
  "averageLikesPerVideo": "string (e.g. '15K')",
  "averageCommentsPerVideo": "string (e.g. '1.2K')",
  "viewToSubscriberRatio": "string (e.g. '12%')",
  "engagementRating": "string (one of: Excellent, Good, Average, Low)",
  "engagementBreakdown": {
    "likesScore": number (1-10),
    "commentsScore": number (1-10),
    "sharesEstimate": "string (High/Medium/Low)",
    "communityInteraction": "string (High/Medium/Low)"
  },
  "summary": "string (brief engagement summary)"
}`;

  const userPrompt = `Estimate the engagement metrics for the YouTube channel: ${handle}. Provide your best estimates based on your knowledge of this channel.`;

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
        note: "Engagement metrics are AI-estimated. For precise real-time data, YouTube API integration is coming soon.",
      },
      dataSource: "ai_estimate",
    };
  } catch (error) {
    return {
      success: false,
      data: {
        error: "Failed to estimate YouTube engagement metrics.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      dataSource: "ai_estimate",
    };
  }
};

export default handler;
