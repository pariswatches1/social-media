import { callClaude } from "@/lib/anthropic";
import type { ToolHandler, ToolResult } from "@/lib/tools/types";

const handler: ToolHandler = async (input): Promise<ToolResult> => {
  const handle1 = (input as any).handle1?.trim();
  const handle2 = input.handle2?.trim();
  if (!handle1 || !handle2) {
    return { success: false, data: { error: "Two TikTok usernames are required." }, dataSource: "ai_estimate" };
  }

  const systemPrompt = `You are a TikTok comparison analyst. Compare two TikTok creators side by side. Return ONLY valid JSON:
{
  "account1": {
    "username": "string",
    "followers": "string",
    "engagementRate": "string",
    "avgViews": "string",
    "contentStyle": "string",
    "postingFrequency": "string",
    "growthTrend": "string"
  },
  "account2": {
    "username": "string",
    "followers": "string",
    "engagementRate": "string",
    "avgViews": "string",
    "contentStyle": "string",
    "postingFrequency": "string",
    "growthTrend": "string"
  },
  "comparison": [
    { "metric": "string", "account1Value": "string", "account2Value": "string", "winner": "string (username)" }
  ],
  "overallWinner": "string (username)",
  "winnerReason": "string",
  "summary": "string"
}`;

  const userPrompt = `Compare these two TikTok accounts: @${handle1.replace("@", "")} vs @${handle2.replace("@", "")}`;

  try {
    const response = await callClaude(systemPrompt, userPrompt);
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return { success: true, data: parsed, dataSource: "ai_estimate" };
  } catch (error) {
    return { success: false, data: { error: "Failed to compare TikTok accounts.", details: error instanceof Error ? error.message : "Unknown error" }, dataSource: "ai_estimate" };
  }
};

export default handler;
