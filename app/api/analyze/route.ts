import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callClaude } from "@/lib/anthropic";
import { checkAndIncrementUsage } from "@/lib/usage";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user exists in DB
    await prisma.user.upsert({
      where: { clerkId },
      update: {},
      create: { clerkId, email: `${clerkId}@signal.user` },
    });

    // Check usage limits
    const usage = await checkAndIncrementUsage(clerkId);
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: "Usage limit reached",
          reason: usage.reason,
          used: usage.used,
          limit: usage.limit,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { handle, platform } = body;

    if (!handle || !platform) {
      return NextResponse.json(
        { error: "Missing handle or platform" },
        { status: 400 }
      );
    }

    const raw = await callClaude(
      `You are a social media intelligence analyst. Respond ONLY with valid JSON, no markdown fences.`,
      `Analyze the ${platform} account "${handle}" and generate a realistic content intelligence report.
Return JSON with this exact shape:
{
  "profile": {
    "handle": "${handle}",
    "platform": "${platform}",
    "niche": "...",
    "followerEstimate": "...",
    "avgEngagement": "...",
    "contentStyle": "..."
  },
  "outliers": [
    {
      "title": "post title / first line",
      "hook": "the opening hook sentence",
      "likes": 1234,
      "comments": 123,
      "shares": 45,
      "engagementRate": "4.2%",
      "whyItWorked": "2-3 sentence analysis",
      "contentType": "carousel|reel|text|image",
      "keyTactic": "short phrase"
    }
  ],
  "contentStrategy": "2-3 sentence summary of their overall strategy",
  "contentIdeas": [
    {
      "title": "idea title",
      "angle": "the creative angle",
      "hook": "opening hook suggestion",
      "predictedEngagement": "high|medium|viral",
      "postType": "carousel|reel|text|image",
      "viralityScore": 85
    }
  ]
}
Generate 4 outliers and 5 content ideas. Make it realistic and specific to their likely niche.`
    );

    const parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim());

    return NextResponse.json({
      ...parsed,
      usage: { used: usage.used, limit: usage.limit, plan: usage.plan },
    });
  } catch (error) {
    console.error("[/api/analyze]", error);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
