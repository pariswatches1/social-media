import { callClaude } from "@/lib/anthropic";
import { ToolInput, ToolResult, ToolHandler } from "../types";

function cleanJsonResponse(text: string): string {
  return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

const handler: ToolHandler = async (input: ToolInput): Promise<ToolResult> => {
  if (!input.handle) {
    throw new Error("A YouTube channel name or handle is required to find lookalikes.");
  }

  const channel = input.handle.replace(/^@/, "");

  const systemPrompt = `You are a YouTube analytics expert specializing in creator ecosystems and audience overlap. Return ONLY valid JSON with no additional text. Given a YouTube channel, suggest similar channels based on content style, audience demographics, and niche positioning.

Return a JSON object with this exact structure:
{
  "sourceChannel": "<the input channel>",
  "lookalikes": [
    {
      "channelName": "<similar channel name>",
      "handle": "<@handle>",
      "estimatedSubscribers": "<e.g. 800K>",
      "contentStyle": "<how their content compares>",
      "similarityReason": "<specific overlap in content or audience>",
      "overlapScore": "<high | medium | moderate>",
      "uniqueAngle": "<what differentiates them from the source>"
    }
  ],
  "sharedAudienceTraits": ["<trait1>", "<trait2>", "<trait3>"],
  "contentPatterns": ["<pattern1>", "<pattern2>"]
}`;

  const userPrompt = `Find 8 YouTube channels similar to "${channel}". For each, explain the content overlap, why their audiences likely intersect, and what makes each one distinct. Include channels at different subscriber levels. Identify the shared audience traits and content patterns.`;

  const response = await callClaude(systemPrompt, userPrompt);
  const cleaned = cleanJsonResponse(response);

  try {
    const parsed = JSON.parse(cleaned);
    return {
      success: true,
      data: {
        ...parsed,
        disclaimer:
          "These lookalike suggestions are AI-generated based on general knowledge of YouTube content patterns. Actual channel details, subscriber counts, and content should be verified on YouTube.",
      },
      dataSource: "ai_estimate",
    };
  } catch {
    throw new Error("Failed to parse AI response for YouTube lookalike search.");
  }
};

export default handler;
