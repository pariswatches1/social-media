import { callClaude } from "@/lib/anthropic";
import type { ToolHandler, ToolResult } from "@/lib/tools/types";

const handler: ToolHandler = async (input): Promise<ToolResult> => {
  const handle = input.handle?.trim();
  if (!handle) {
    return {
      success: false,
      data: { error: "A YouTube channel name or URL is required." },
      dataSource: "ai_estimate",
    };
  }

  const systemPrompt = `You are a YouTube analytics expert. Analyze the given YouTube channel and return your best estimate of its metrics and quality. Return ONLY valid JSON with no markdown formatting, no code fences, and no extra text. Use this exact structure:
{
  "channelName": "string",
  "qualityScore": number (1-100),
  "estimatedSubscribers": "string (e.g. '1.2M')",
  "estimatedTotalViews": "string (e.g. '500M')",
  "uploadFrequency": "string (e.g. '2-3 videos per week')",
  "contentQualityAssessment": "string (detailed assessment)",
  "audienceEngagementLevel": "string (High/Medium/Low with explanation)",
  "growthTrajectory": "string (Growing/Stable/Declining with explanation)",
  "improvements": ["string", "string", "string"]
}`;

  const userPrompt = `Analyze the YouTube channel: ${handle}. Provide your best estimates for all metrics based on your knowledge.`;

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
        note: "These metrics are AI-estimated based on publicly available knowledge. For precise real-time data, YouTube API integration is coming soon.",
      },
      dataSource: "ai_estimate",
    };
  } catch (error) {
    return {
      success: false,
      data: {
        error: "Failed to analyze YouTube channel quality.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      dataSource: "ai_estimate",
    };
  }
};

export default handler;
