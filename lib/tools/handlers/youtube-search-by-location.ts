import { callClaude } from "@/lib/anthropic";
import { ToolInput, ToolResult, ToolHandler } from "../types";

function cleanJsonResponse(text: string): string {
  return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

const handler: ToolHandler = async (input: ToolInput): Promise<ToolResult> => {
  if (!input.location) {
    throw new Error("A location is required to search for YouTube channels.");
  }

  const niche = input.niche || "general";

  const systemPrompt = `You are a YouTube regional content analyst. Return ONLY valid JSON with no additional text. Suggest YouTube channels that are based in or strongly associated with a specific location. Consider local language content, regional topics, and creators known to be from that area.

Return a JSON object with this exact structure:
{
  "location": "<the location>",
  "niche": "<the niche>",
  "channels": [
    {
      "channelName": "<channel name>",
      "handle": "<@handle>",
      "estimatedSubscribers": "<e.g. 500K>",
      "language": "<primary content language>",
      "contentFocus": "<what they cover>",
      "locationRelevance": "<how they're connected to the location>",
      "audienceRegion": "<where most viewers are from>",
      "notableFor": "<what makes them stand out in this region>"
    }
  ],
  "regionalInsights": {
    "dominantLanguage": "<main content language in region>",
    "popularCategories": ["<category1>", "<category2>"],
    "marketNotes": "<observations about the YouTube market in this region>"
  }
}`;

  const userPrompt = `Suggest 10 YouTube channels from or associated with "${input.location}" in the "${niche}" niche. Include both local-language and English-language creators if applicable. Mix subscriber levels from emerging (10K-100K) to established (500K+). Note the primary language of each channel and why they're relevant to the region.`;

  const response = await callClaude(systemPrompt, userPrompt);
  const cleaned = cleanJsonResponse(response);

  try {
    const parsed = JSON.parse(cleaned);
    return {
      success: true,
      data: {
        ...parsed,
        disclaimer:
          "These YouTube channel suggestions are AI-generated based on general knowledge of the region and niche. Channel names, subscriber counts, locations, and content details should be verified on YouTube.",
      },
      dataSource: "ai_estimate",
    };
  } catch {
    throw new Error("Failed to parse AI response for location-based YouTube search.");
  }
};

export default handler;
