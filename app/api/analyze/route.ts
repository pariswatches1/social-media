import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callClaude } from "@/lib/anthropic";
import { checkAndIncrementUsage } from "@/lib/usage";
import prisma from "@/lib/prisma";
import {
  fetchInstagramData,
  type InstagramData,
} from "@/lib/instagram-api";

// Format follower count: 1234 -> "1.2K", 1500000 -> "1.5M"
function formatFollowers(count: number): string {
  if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + "M";
  if (count >= 1_000) return (count / 1_000).toFixed(1) + "K";
  return count.toString();
}

// Build a Claude prompt using REAL Instagram data
function buildInstagramAnalysisPrompt(data: InstagramData): string {
  const postSummaries = data.topPosts
    .map(
      (p, i) =>
        `Post ${i + 1} [${p.mediaType}]: "${p.caption.slice(0, 200)}${p.caption.length > 200 ? "..." : ""}"
  Likes: ${p.likeCount.toLocaleString()} | Comments: ${p.commentCount.toLocaleString()} | Eng. Rate: ${p.engagementRate.toFixed(2)}%`
    )
    .join("\n\n");

  return `Analyze this REAL Instagram account data. Do NOT make up numbers — I'm providing the real metrics. Your job is to provide QUALITATIVE analysis only.

REAL PROFILE DATA:
- Username: @${data.profile.username}
- Full Name: ${data.profile.fullName || "N/A"}
- Bio: "${data.profile.biography}"
- Followers: ${data.profile.followerCount.toLocaleString()}
- Following: ${data.profile.followingCount.toLocaleString()}
- Total Posts: ${data.profile.mediaCount}
- Category: ${data.profile.category || "Not specified"}
- Average Engagement Rate: ${data.avgEngagementRate.toFixed(2)}%

TOP ${data.topPosts.length} PERFORMING POSTS (by engagement rate):
${postSummaries}

Return JSON with this exact shape:
{
  "niche": "their content niche based on bio and post content",
  "contentStyle": "2-4 word description of their content style",
  "outlierAnalysis": [
    {
      "whyItWorked": "2-3 sentence analysis of why this specific post performed well",
      "keyTactic": "short phrase describing the key tactic used",
      "hook": "the opening hook from the caption (first line/sentence)"
    }
  ],
  "contentStrategy": "2-3 sentence summary of their overall content strategy based on the patterns you see",
  "contentIdeas": [
    {
      "title": "idea title inspired by their best content",
      "angle": "the creative angle",
      "hook": "opening hook suggestion",
      "predictedEngagement": "high|medium|viral",
      "postType": "carousel|reel|text|image",
      "viralityScore": 85
    }
  ]
}

Generate analysis for all ${data.topPosts.length} posts in outlierAnalysis (matching the order above), and generate 5 content ideas. Base everything on the REAL data patterns.`;
}

// Merge real Instagram data with Claude's qualitative analysis
function mergeInstagramResult(
  igData: InstagramData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  aiAnalysis: any
) {
  return {
    profile: {
      handle: igData.profile.username,
      platform: "Instagram",
      niche: aiAnalysis.niche || "Content Creator",
      followerEstimate: formatFollowers(igData.profile.followerCount),
      avgEngagement: igData.avgEngagementRate.toFixed(1) + "%",
      contentStyle: aiAnalysis.contentStyle || "Mixed content",
    },
    outliers: igData.topPosts.map((post, i) => ({
      title:
        post.caption.split("\n")[0]?.slice(0, 80) || "Untitled Post",
      hook:
        aiAnalysis.outlierAnalysis?.[i]?.hook ||
        post.caption.split(".")[0]?.slice(0, 100) ||
        "",
      likes: post.likeCount,
      comments: post.commentCount,
      shares: post.shareCount,
      engagementRate: post.engagementRate.toFixed(1) + "%",
      whyItWorked: aiAnalysis.outlierAnalysis?.[i]?.whyItWorked || "",
      contentType: post.mediaType,
      keyTactic: aiAnalysis.outlierAnalysis?.[i]?.keyTactic || "",
    })),
    contentStrategy: aiAnalysis.contentStrategy || "",
    contentIdeas: aiAnalysis.contentIdeas || [],
    dataSource: "real" as const,
  };
}

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

    // ── Instagram: Real data + AI analysis ──
    if (
      platform.toLowerCase() === "instagram" &&
      process.env.RAPIDAPI_KEY
    ) {
      try {
        const igData = await fetchInstagramData(handle);

        const analysisPrompt = buildInstagramAnalysisPrompt(igData);

        const raw = await callClaude(
          `You are a social media intelligence analyst. Respond ONLY with valid JSON, no markdown fences.`,
          analysisPrompt
        );

        const aiAnalysis = JSON.parse(
          raw.replace(/```json\n?|\n?```/g, "").trim()
        );

        const result = mergeInstagramResult(igData, aiAnalysis);

        return NextResponse.json({
          ...result,
          usage: {
            used: usage.used,
            limit: usage.limit,
            plan: usage.plan,
          },
        });
      } catch (igError: unknown) {
        const errorMsg =
          igError instanceof Error ? igError.message : "Unknown error";

        // If it's a user-facing error (private account, not found), return it
        if (
          errorMsg.includes("private") ||
          errorMsg.includes("not found")
        ) {
          return NextResponse.json(
            { error: errorMsg },
            { status: 400 }
          );
        }

        // Otherwise fall through to Claude-only
        console.warn(
          "[/api/analyze] Instagram API failed, falling back to AI-only:",
          errorMsg
        );
      }
    }

    // ── Fallback: Claude-only (all platforms or when Instagram API fails) ──
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
      dataSource: "estimated",
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
