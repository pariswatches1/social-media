import { callClaude } from "@/lib/anthropic";
import { ToolInput, ToolResult, ToolHandler } from "../types";

function cleanJsonResponse(text: string): string {
  return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

const handler: ToolHandler = async (input: ToolInput): Promise<ToolResult> => {
  const keyword = input.topic || input.caption || input.niche;
  if (!keyword) {
    throw new Error("A topic, caption, or niche is required to generate hashtags.");
  }

  const isCaption = !!input.caption;

  const systemPrompt = `You are a social media hashtag optimization expert. Return ONLY valid JSON with no additional text. Generate 30 strategically chosen hashtags based on the given input. Categorize them for maximum discoverability and engagement.

Return a JSON object with this exact structure:
{
  "input": "<what was provided>",
  "inputType": "<topic | caption>",
  "hashtags": {
    "popular": [
      {
        "tag": "<#hashtag>",
        "estimatedReach": "<e.g. 1M+>",
        "competition": "<high | medium>"
      }
    ],
    "niche": [
      {
        "tag": "<#hashtag>",
        "estimatedReach": "<e.g. 50K-200K>",
        "competition": "<medium | low>"
      }
    ],
    "brandedUnique": [
      {
        "tag": "<#hashtag>",
        "estimatedReach": "<e.g. under 10K>",
        "competition": "<low>"
      }
    ]
  },
  "usageTips": [
    "<tip 1>",
    "<tip 2>",
    "<tip 3>"
  ],
  "recommendedCount": "<how many to use per post>",
  "bestPlacement": "<in caption vs first comment>"
}`;

  const userPrompt = isCaption
    ? `Generate 30 hashtags optimized for this caption: "${keyword}". Include 10 popular/broad hashtags, 10 niche-specific hashtags, and 10 branded or unique hashtags. Also provide 3 usage tips specific to this type of content.`
    : `Generate 30 hashtags for the topic: "${keyword}". Include 10 popular/broad hashtags with high reach, 10 niche-specific hashtags for targeted audiences, and 10 branded or unique hashtags to stand out. Provide practical usage tips.`;

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
    throw new Error("Failed to parse AI response for hashtag generation.");
  }
};

export default handler;
