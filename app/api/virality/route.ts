import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callClaude } from "@/lib/anthropic";
import { ensureUser } from "@/lib/ensure-user";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(clerkId);
    const body = await req.json();
    const { inputType, content, platform } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required for scoring" },
        { status: 400 }
      );
    }

    if (!platform || typeof platform !== "string") {
      return NextResponse.json(
        { error: "Platform is required" },
        { status: 400 }
      );
    }

    // Sanitize content for the AI prompt
    const safeContent = content.slice(0, 5000);
    const safePlatform = platform.replace(/[^a-zA-Z ]/g, "").slice(0, 30);

    // Call Claude for real AI scoring
    const raw = await callClaude(
      `You are a viral content scoring engine. You analyze social media content and predict its virality potential on a 0-100 scale. You must respond with ONLY valid JSON, no markdown fences, no extra text. Be honest and critical — most content scores 40-70. Only truly exceptional hooks and formats score 80+.`,
      `Score this ${safePlatform} content for virality potential.

Content type: ${inputType || "text"}
Platform: ${safePlatform}
Content:
"""
${safeContent}
"""

Analyze the content and return JSON with this exact shape:
{
  "overallScore": <0-100 integer>,
  "hookScore": <0-100 integer — how strong is the opening hook?>,
  "formatScore": <0-100 integer — how well does the format fit ${safePlatform}?>,
  "trendScore": <0-100 integer — how aligned with current trends?>,
  "timingScore": <0-100 integer — general timing/relevance score>,
  "engagementScore": <0-100 integer — predicted engagement potential>,
  "suggestions": [
    "specific, actionable suggestion 1 based on the actual content",
    "specific, actionable suggestion 2 based on the actual content",
    "specific, actionable suggestion 3 based on the actual content",
    "specific, actionable suggestion 4 based on the actual content"
  ],
  "analysis": "2-3 sentence analysis of the content's strengths and weaknesses"
}

Be specific to THIS content. Don't give generic advice.`
    );

    const parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim());

    // Validate and clamp scores
    const clamp = (v: unknown) =>
      Math.max(0, Math.min(100, typeof v === "number" ? Math.round(v) : 50));

    const result = {
      overallScore: clamp(parsed.overallScore),
      hookScore: clamp(parsed.hookScore),
      formatScore: clamp(parsed.formatScore),
      trendScore: clamp(parsed.trendScore),
      timingScore: clamp(parsed.timingScore),
      engagementScore: clamp(parsed.engagementScore),
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.filter(
            (s: unknown) => typeof s === "string" && s.trim()
          ).slice(0, 6)
        : [],
      analysis: typeof parsed.analysis === "string" ? parsed.analysis : "",
    };

    // Save to database
    await prisma.viralityAnalysis.create({
      data: {
        userId: user.id,
        inputType: inputType || "text",
        inputContent: safeContent,
        platform: safePlatform,
        overallScore: result.overallScore,
        hookScore: result.hookScore,
        formatScore: result.formatScore,
        trendScore: result.trendScore,
        timingScore: result.timingScore,
        engagementScore: result.engagementScore,
        suggestions: JSON.stringify(result.suggestions),
        breakdown: JSON.stringify({
          analysis: result.analysis,
        }),
      },
    });

    await logActivity(user.id, "VIRALITY_SCORED", `Scored content: ${result.overallScore}/100`, {
      platform: safePlatform,
      score: result.overallScore,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[POST /api/virality]", error);
    }
    return NextResponse.json(
      { error: "Failed to score content. Please try again." },
      { status: 500 }
    );
  }
}

// GET: Fetch user's scoring history
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(clerkId);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      prisma.viralityAnalysis.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.viralityAnalysis.count({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      history,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[GET /api/virality]", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch scoring history" },
      { status: 500 }
    );
  }
}
