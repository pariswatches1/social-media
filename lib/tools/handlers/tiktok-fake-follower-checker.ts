import { callClaude } from "@/lib/anthropic";
import type { ToolHandler, ToolResult } from "@/lib/tools/types";

const handler: ToolHandler = async (input): Promise<ToolResult> => {
  const username = (input as any).username?.trim();
  if (!username) {
    return { success: false, data: { error: "A TikTok username is required." }, dataSource: "ai_estimate" };
  }

  const systemPrompt = `You are a TikTok fraud detection specialist. Analyze the given account for fake followers. Return ONLY valid JSON:
{
  "username": "string",
  "authenticityScore": number (0-100),
  "riskLevel": "string (Low/Medium/High/Critical)",
  "followerBreakdown": {
    "real": number (percentage),
    "suspicious": number (percentage),
    "inactive": number (percentage)
  },
  "suspiciousIndicators": [
    { "indicator": "string", "severity": "string (Low/Medium/High)", "details": "string" }
  ],
  "redFlags": ["string"],
  "positiveSignals": ["string"],
  "recommendation": "string",
  "estimatedRealFollowers": "string"
}`;

  const userPrompt = `Analyze TikTok account @${username.replace("@", "")} for fake followers and bot activity.`;

  try {
    const response = await callClaude(systemPrompt, userPrompt);
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return { success: true, data: parsed, dataSource: "ai_estimate" };
  } catch (error) {
    return { success: false, data: { error: "Failed to check TikTok fake followers.", details: error instanceof Error ? error.message : "Unknown error" }, dataSource: "ai_estimate" };
  }
};

export default handler;
