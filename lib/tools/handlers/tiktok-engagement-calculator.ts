import { callClaude } from "@/lib/anthropic";
import type { ToolHandler, ToolResult } from "@/lib/tools/types";

const handler: ToolHandler = async (input): Promise<ToolResult> => {
  const username = (input as any).username?.trim();
  if (!username) {
    return { success: false, data: { error: "A TikTok username is required." }, dataSource: "ai_estimate" };
  }

  const systemPrompt = `You are a TikTok analytics expert. Estimate engagement metrics for the given TikTok creator. Return ONLY valid JSON:
{
  "username": "string",
  "engagementRate": "string (e.g. '8.2%')",
  "averageLikes": "string (e.g. '45K')",
  "averageComments": "string (e.g. '1.2K')",
  "averageShares": "string (e.g. '3.5K')",
  "averageViews": "string (e.g. '500K')",
  "estimatedFollowers": "string (e.g. '2.1M')",
  "totalPosts": "string (e.g. '340')",
  "rating": "string (one of: Excellent, Good, Average, Poor)",
  "benchmarks": {
    "vsNiche": "string (e.g. '2.3x above average')",
    "vsPlatform": "string (e.g. '1.5x above average')"
  },
  "contentBreakdown": [
    { "type": "string", "percentage": number, "avgEngagement": "string" }
  ],
  "bestPostingTimes": ["string"],
  "summary": "string"
}`;

  const userPrompt = `Estimate TikTok engagement metrics for: @${username.replace("@", "")}`;

  try {
    const response = await callClaude(systemPrompt, userPrompt);
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return { success: true, data: parsed, dataSource: "ai_estimate" };
  } catch (error) {
    return { success: false, data: { error: "Failed to estimate TikTok engagement.", details: error instanceof Error ? error.message : "Unknown error" }, dataSource: "ai_estimate" };
  }
};

export default handler;
