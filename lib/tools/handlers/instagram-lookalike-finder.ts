import { callClaude } from "@/lib/anthropic";
import { ToolInput, ToolResult, ToolHandler } from "../types";

function cleanJsonResponse(text: string): string {
  return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

const handler: ToolHandler = async (input: ToolInput): Promise<ToolResult> => {
  if (!input.handle) {
    throw new Error("An Instagram handle is required to find lookalike accounts.");
  }

  const handle = input.handle.replace(/^@/, "");

  const systemPrompt = `You are an Instagram analytics expert. Return ONLY valid JSON with no additional text. Given an Instagram handle, suggest similar accounts based on likely content patterns, audience overlap, and niche positioning. Base your suggestions on publicly known creators and typical content archetypes.

Return a JSON object with this exact structure:
{
  "sourceHandle": "<the input handle>",
  "lookalikes": [
    {
      "handle": "<@similar_account>",
      "name": "<creator name>",
      "estimatedFollowers": "<e.g. 120K>",
      "contentStyle": "<description of their content approach>",
      "similarityReason": "<why they're similar to the source>",
      "overlapScore": "<high | medium | moderate>",
      "uniqueDifferentiator": "<what makes them distinct>"
    }
  ],
  "commonThemes": ["<theme1>", "<theme2>", "<theme3>"]
}`;

  const userPrompt = `Find 8 Instagram accounts similar to @${handle}. For each lookalike, explain the content style overlap and what makes them comparable. Include accounts at various follower levels. Identify the common themes that connect these accounts.`;

  const response = await callClaude(systemPrompt, userPrompt);
  const cleaned = cleanJsonResponse(response);

  try {
    const parsed = JSON.parse(cleaned);
    return {
      success: true,
      data: {
        ...parsed,
        disclaimer:
          "These lookalike suggestions are AI-generated based on general knowledge of content patterns and creator archetypes. Actual account details, follower counts, and content should be verified on Instagram.",
      },
      dataSource: "ai_estimate",
    };
  } catch {
    throw new Error("Failed to parse AI response for Instagram lookalike search.");
  }
};

export default handler;
