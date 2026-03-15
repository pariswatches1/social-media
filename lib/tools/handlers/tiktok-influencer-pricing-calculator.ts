import { callClaude } from "@/lib/anthropic";
import type { ToolHandler, ToolResult } from "@/lib/tools/types";

const handler: ToolHandler = async (input): Promise<ToolResult> => {
  const username = (input as any).username?.trim?.() || "";
  const followerCount = (input as any).followerCount || "";
  const engagementRate = (input as any).engagementRate || "";
  const niche = input.niche || "";

  if (!username && !followerCount) {
    return { success: false, data: { error: "A username or follower count is required." }, dataSource: "ai_estimate" };
  }

  const systemPrompt = `You are a TikTok influencer pricing expert. Estimate sponsorship pricing for the given creator. Return ONLY valid JSON:
{
  "username": "string",
  "tierLabel": "string (Nano/Micro/Mid-Tier/Macro/Mega)",
  "pricing": {
    "sponsoredPost": { "low": number, "average": number, "high": number },
    "brandedContent": { "low": number, "average": number, "high": number },
    "liveStream": { "low": number, "average": number, "high": number },
    "duetCollab": { "low": number, "average": number, "high": number },
    "packageDeal": { "low": number, "average": number, "high": number }
  },
  "estimatedCPM": "string (e.g. '$5.50')",
  "estimatedCPE": "string (e.g. '$0.08')",
  "factors": ["string (factors that influence this creator's pricing)"],
  "negotiationTips": ["string"],
  "marketContext": "string (brief market context)"
}`;

  const userPrompt = `Estimate TikTok influencer pricing for: ${username ? "@" + username.replace("@", "") : "a creator"} with ${followerCount || "unknown"} followers, ${engagementRate || "unknown"}% engagement rate, in the ${niche || "general"} niche.`;

  try {
    const response = await callClaude(systemPrompt, userPrompt);
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return { success: true, data: parsed, dataSource: "ai_estimate" };
  } catch (error) {
    return { success: false, data: { error: "Failed to estimate TikTok pricing.", details: error instanceof Error ? error.message : "Unknown error" }, dataSource: "ai_estimate" };
  }
};

export default handler;
