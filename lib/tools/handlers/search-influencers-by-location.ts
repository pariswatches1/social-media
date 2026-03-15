import { callClaude } from "@/lib/anthropic";
import { ToolInput, ToolResult, ToolHandler } from "../types";

function cleanJsonResponse(text: string): string {
  return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

const handler: ToolHandler = async (input: ToolInput): Promise<ToolResult> => {
  if (!input.location) {
    throw new Error("A location is required to search for influencers.");
  }

  const niche = input.niche || "general";

  const systemPrompt = `You are an influencer marketing research assistant. Return ONLY valid JSON with no additional text. Suggest influencers who are likely based in or closely associated with a given location. Base suggestions on publicly known creators, common content patterns, and regional trends. Be realistic with follower estimates.

Return a JSON object with this exact structure:
{
  "location": "<the location>",
  "niche": "<the niche>",
  "influencers": [
    {
      "name": "<creator name>",
      "handle": "<likely social handle>",
      "platform": "<instagram | tiktok | youtube | twitter>",
      "estimatedFollowers": "<e.g. 50K-100K>",
      "contentFocus": "<what they post about>",
      "relevanceReason": "<why they're relevant to this location and niche>"
    }
  ],
  "searchCriteria": {
    "location": "<location>",
    "niche": "<niche>",
    "radius": "Metro area"
  }
}`;

  const userPrompt = `Suggest 10 influencers likely based in or associated with "${input.location}" in the "${niche}" niche. Include a mix of micro-influencers (10K-50K), mid-tier (50K-500K), and macro (500K+) if plausible for the region. Focus on creators who would be relevant for local brand partnerships.`;

  const response = await callClaude(systemPrompt, userPrompt);
  const cleaned = cleanJsonResponse(response);

  try {
    const parsed = JSON.parse(cleaned);
    return {
      success: true,
      data: {
        ...parsed,
        disclaimer:
          "These influencer suggestions are AI-generated estimates based on general knowledge of the region and niche. Actual accounts, follower counts, and locations should be verified independently.",
      },
      dataSource: "ai_estimate",
    };
  } catch {
    throw new Error("Failed to parse AI response for location-based influencer search.");
  }
};

export default handler;
