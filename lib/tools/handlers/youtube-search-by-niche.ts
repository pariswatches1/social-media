import { callClaude } from "@/lib/anthropic";
import { ToolInput, ToolResult, ToolHandler } from "../types";

function cleanJsonResponse(text: string): string {
  return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

const handler: ToolHandler = async (input: ToolInput): Promise<ToolResult> => {
  const niche = input.niche || input.topic;
  if (!niche) {
    throw new Error("A niche keyword is required to search YouTube channels.");
  }

  const systemPrompt = `You are a YouTube creator discovery specialist. Return ONLY valid JSON with no additional text. Suggest YouTube channels that are prominent in a given niche. Include a mix of channel sizes and content approaches. Base suggestions on well-known creators and typical content patterns.

Return a JSON object with this exact structure:
{
  "niche": "<the niche>",
  "channels": [
    {
      "channelName": "<channel name>",
      "handle": "<@handle if known>",
      "estimatedSubscribers": "<e.g. 1.2M>",
      "contentStyle": "<what kind of videos they make>",
      "uploadFrequency": "<e.g. 2x per week>",
      "averageViews": "<estimated avg views per video>",
      "audienceType": "<who watches them>",
      "standoutContent": "<their most notable series or video type>"
    }
  ],
  "nicheInsights": {
    "saturation": "<low | moderate | high | oversaturated>",
    "growthTrend": "<growing | stable | declining>",
    "topContentFormats": ["<format1>", "<format2>"]
  }
}`;

  const userPrompt = `Suggest 10 YouTube channels in the "${niche}" niche. Include a range from smaller creators (10K-100K subs) to larger ones (1M+). For each, describe their content approach, upload frequency, and what makes them stand out. Also provide insights on the niche's saturation and growth trend.`;

  const response = await callClaude(systemPrompt, userPrompt);
  const cleaned = cleanJsonResponse(response);

  try {
    const parsed = JSON.parse(cleaned);
    return {
      success: true,
      data: {
        ...parsed,
        disclaimer:
          "These YouTube channel suggestions are AI-generated estimates. Channel names, subscriber counts, and content details should be verified on YouTube.",
      },
      dataSource: "ai_estimate",
    };
  } catch {
    throw new Error("Failed to parse AI response for YouTube niche search.");
  }
};

export default handler;
