import { callClaude } from "@/lib/anthropic";
import { ToolInput, ToolResult, ToolHandler } from "../types";

function cleanJsonResponse(text: string): string {
  return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

const handler: ToolHandler = async (input: ToolInput): Promise<ToolResult> => {
  if (!input.platform) {
    throw new Error("A platform is required to calculate influencer pricing.");
  }
  if (!input.followerCount || input.followerCount <= 0) {
    throw new Error("A valid follower count is required to calculate pricing.");
  }

  const engagementRate = input.engagementRate || 3.0;
  const niche = input.niche || "general";

  const systemPrompt = `You are an influencer marketing pricing analyst with deep knowledge of creator economy rates across platforms. Return ONLY valid JSON with no additional text. Calculate realistic pricing estimates based on platform, follower count, engagement rate, and niche. Use industry benchmarks and adjust for engagement quality.

Return a JSON object with this exact structure:
{
  "platform": "<platform>",
  "followerCount": <number>,
  "engagementRate": <number>,
  "niche": "<niche>",
  "tier": "<nano | micro | mid | macro | mega>",
  "pricing": {
    "singlePost": {
      "lowEstimate": <number>,
      "highEstimate": <number>,
      "currency": "USD"
    },
    "story": {
      "lowEstimate": <number>,
      "highEstimate": <number>,
      "currency": "USD"
    },
    "reel": {
      "lowEstimate": <number>,
      "highEstimate": <number>,
      "currency": "USD"
    },
    "packageDeal": {
      "includes": "<what's in the package>",
      "lowEstimate": <number>,
      "highEstimate": <number>,
      "currency": "USD"
    }
  },
  "factors": {
    "engagementMultiplier": "<above/below average and how it affects price>",
    "nicheMultiplier": "<how the niche affects pricing>",
    "platformMultiplier": "<platform-specific pricing notes>"
  },
  "negotiationTips": [
    "<tip 1>",
    "<tip 2>",
    "<tip 3>"
  ],
  "cpmEstimate": "<estimated cost per 1000 impressions>"
}`;

  const userPrompt = `Calculate influencer pricing for a creator on ${input.platform} with ${input.followerCount.toLocaleString()} followers, ${engagementRate}% engagement rate, in the "${niche}" niche. Provide realistic 2025-2026 market rates for a single feed post, story, reel/short-form video, and a package deal (3 posts + 5 stories). Factor in the engagement rate quality and niche premium.`;

  const response = await callClaude(systemPrompt, userPrompt);
  const cleaned = cleanJsonResponse(response);

  try {
    const parsed = JSON.parse(cleaned);
    return {
      success: true,
      data: parsed,
      dataSource: "ai_estimate",
    };
  } catch {
    throw new Error("Failed to parse AI response for influencer pricing.");
  }
};

export default handler;
