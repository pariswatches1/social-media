import { callClaude } from "@/lib/anthropic";
import type { ToolHandler, ToolResult } from "@/lib/tools/types";

const handler: ToolHandler = async (input): Promise<ToolResult> => {
  const username = (input as any).username?.trim();
  if (!username) {
    return { success: false, data: { error: "A TikTok username is required." }, dataSource: "ai_estimate" };
  }

  const systemPrompt = `You are a TikTok account quality analyst. Evaluate the given TikTok account. Return ONLY valid JSON:
{
  "username": "string",
  "qualityScore": number (0-100),
  "accountTier": "string (Elite/Strong/Average/Needs Work)",
  "metrics": {
    "followers": "string",
    "avgViews": "string",
    "engagementRate": "string",
    "postingFrequency": "string (e.g. '3x per week')",
    "growthRate": "string (e.g. '+12% monthly')",
    "contentConsistency": "string (High/Medium/Low)"
  },
  "strengths": ["string"],
  "improvements": ["string"],
  "audienceInsights": {
    "primaryAge": "string",
    "topRegions": ["string"],
    "peakActivity": "string",
    "audienceQuality": "string (Genuine/Mixed/Suspect)"
  },
  "summary": "string"
}`;

  const userPrompt = `Evaluate TikTok account quality for: @${username.replace("@", "")}`;

  try {
    const response = await callClaude(systemPrompt, userPrompt);
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return { success: true, data: parsed, dataSource: "ai_estimate" };
  } catch (error) {
    return { success: false, data: { error: "Failed to check TikTok account quality.", details: error instanceof Error ? error.message : "Unknown error" }, dataSource: "ai_estimate" };
  }
};

export default handler;
