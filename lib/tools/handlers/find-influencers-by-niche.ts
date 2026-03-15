import { callClaude } from "@/lib/anthropic";
import { ToolInput, ToolResult, ToolHandler } from "../types";

function cleanJsonResponse(text: string): string {
  return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

const handler: ToolHandler = async (input: ToolInput): Promise<ToolResult> => {
  const niche = input.niche || input.topic;
  if (!niche) {
    throw new Error("A niche keyword is required to find influencers.");
  }

  const systemPrompt = `You are an influencer discovery specialist. Return ONLY valid JSON with no additional text. Suggest influencers who are prominent in a given niche. Base your suggestions on well-known creators, common content styles, and typical engagement patterns for the niche. Be realistic and varied in your suggestions.

Return a JSON object with this exact structure:
{
  "niche": "<the niche>",
  "influencers": [
    {
      "name": "<creator name>",
      "handle": "<likely social handle>",
      "platform": "<instagram | tiktok | youtube | twitter>",
      "estimatedFollowers": "<e.g. 250K>",
      "engagementStyle": "<how they engage: e.g. educational reels, lifestyle vlogs, tutorial threads>",
      "contentThemes": ["<theme1>", "<theme2>"],
      "audienceDemographic": "<who follows them>",
      "collaborationFit": "<what brands they'd work well with>"
    }
  ]
}`;

  const userPrompt = `Find 10 influencers in the "${niche}" niche. Include creators across different platforms and follower tiers. For each, describe their engagement style, typical content themes, and what kind of brand collaborations they'd be a good fit for. Mix well-known names with emerging creators.`;

  const response = await callClaude(systemPrompt, userPrompt);
  const cleaned = cleanJsonResponse(response);

  try {
    const parsed = JSON.parse(cleaned);
    return {
      success: true,
      data: {
        ...parsed,
        disclaimer:
          "These influencer profiles are AI-generated suggestions based on general niche knowledge. Handles, follower counts, and content details are estimates and should be verified on each platform.",
      },
      dataSource: "ai_estimate",
    };
  } catch {
    throw new Error("Failed to parse AI response for niche influencer search.");
  }
};

export default handler;
