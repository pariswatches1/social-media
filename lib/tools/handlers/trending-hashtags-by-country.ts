import { callClaude } from "@/lib/anthropic";
import { ToolInput, ToolResult, ToolHandler } from "../types";

function cleanJsonResponse(text: string): string {
  return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

const handler: ToolHandler = async (input: ToolInput): Promise<ToolResult> => {
  if (!input.country) {
    throw new Error("A country is required to find trending hashtags.");
  }

  const niche = input.niche || "general";

  const systemPrompt = `You are a social media hashtag analyst specializing in regional trends. Return ONLY valid JSON with no additional text. Generate hashtags that would be trending or commonly used in a specific country and niche. Organize them into three tiers based on estimated volume. Use realistic post count estimates.

Return a JSON object with this exact structure:
{
  "country": "<the country>",
  "niche": "<the niche>",
  "hashtags": {
    "highVolume": [
      {
        "tag": "<#hashtag>",
        "estimatedPosts": "<e.g. 5M+>",
        "trend": "<rising | stable | seasonal>"
      }
    ],
    "mediumVolume": [
      {
        "tag": "<#hashtag>",
        "estimatedPosts": "<e.g. 100K-500K>",
        "trend": "<rising | stable | seasonal>"
      }
    ],
    "niche": [
      {
        "tag": "<#hashtag>",
        "estimatedPosts": "<e.g. 10K-50K>",
        "trend": "<rising | stable | emerging>"
      }
    ]
  },
  "strategy": "<brief tip on how to mix these tiers for maximum reach>"
}`;

  const userPrompt = `Generate 30 trending hashtags for the "${niche}" niche in ${input.country}. Split them into 3 tiers: 10 high-volume hashtags (millions of posts), 10 medium-volume (100K-1M posts), and 10 niche-specific (under 100K posts). Include local language hashtags if applicable. Provide estimated post counts and trend direction for each.`;

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
    throw new Error("Failed to parse AI response for trending hashtags.");
  }
};

export default handler;
