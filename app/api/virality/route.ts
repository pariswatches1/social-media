import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { inputType, content, platform } = body;

  // TODO: Wire to AI scoring pipeline
  // Phase 1 (MVP): GPT-4o with structured scoring prompt
  // Phase 2: Fine-tuned XGBoost/LightGBM on post performance data
  //
  // Features to score:
  // - Hook type and strength
  // - Content length and format fit for platform
  // - Emoji density, hashtag count/type
  // - Trend alignment (cross-ref with trending topics)
  // - Posting time optimization
  // - Engagement prediction based on historical data

  // Mock response for now
  const mockScore = Math.floor(Math.random() * 40) + 55;

  return NextResponse.json({
    overallScore: mockScore,
    hookScore: Math.floor(Math.random() * 30) + 65,
    formatScore: Math.floor(Math.random() * 30) + 60,
    trendScore: Math.floor(Math.random() * 30) + 65,
    timingScore: Math.floor(Math.random() * 30) + 55,
    engagementScore: Math.floor(Math.random() * 30) + 60,
    suggestions: [
      "Add a question in the first line to boost engagement by ~23%",
      "This format performs 2.4x better as a carousel on Instagram",
      "Posting between 6-8pm EST would increase reach by ~18%",
      "Add 3-5 niche hashtags for 40% more targeted reach",
    ],
    message: "Scored with mock model — connect AI pipeline for real scoring",
  });
}
