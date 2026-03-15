import { callClaude } from "@/lib/anthropic";
import { ToolInput, ToolResult, ToolHandler } from "../types";

function cleanJsonResponse(text: string): string {
  return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

const handler: ToolHandler = async (input: ToolInput): Promise<ToolResult> => {
  const keyword = input.topic || input.niche;
  if (!keyword) {
    throw new Error("A topic or niche is required to generate content ideas.");
  }

  const systemPrompt = `You are a social media content strategist. Return ONLY valid JSON with no additional text. Generate 10 creative, engaging content ideas for the given topic or niche. Each idea should feel actionable and designed for high engagement.

Return a JSON object with this exact structure:
{
  "topic": "<the topic>",
  "ideas": [
    {
      "title": "<catchy title>",
      "hook": "<opening line or hook to grab attention>",
      "postType": "<carousel | reel | story | single_image | video | thread | live>",
      "angle": "<unique perspective or approach>",
      "estimatedEngagement": "<low | medium | high>",
      "bestTimeToPost": "<suggested timing>"
    }
  ]
}`;

  const userPrompt = `Generate 10 content ideas for: "${keyword}". Mix different post types and angles. Focus on ideas that would perform well in 2025-2026. Include a variety of educational, entertaining, and conversion-focused content.`;

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
    throw new Error("Failed to parse AI response for content ideas.");
  }
};

export default handler;
