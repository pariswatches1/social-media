import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callClaude } from "@/lib/anthropic";
import { checkAndIncrementUsage } from "@/lib/usage";
import { ensureUser } from "@/lib/ensure-user";
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
  "contentCategories": ["category1", "category2", "category3", "category4", "category5"],
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

For contentCategories, list 4-6 content theme categories that describe this account (e.g. "Luxury Cars", "Lifestyle", "Technology", "Adventure", "Fashion").

Generate analysis for all ${data.topPosts.length} posts in outlierAnalysis (matching the order above), and generate 5 content ideas. Base everything on the REAL data patterns.`;
}

// Rate engagement compared to similar-sized accounts
function rateEngagement(er: number, followers: number): { label: string; level: "excellent" | "good" | "average" | "below" } {
  // Benchmarks vary by follower tier
  const thresholds = followers > 1_000_000
    ? { excellent: 3, good: 1.5, average: 0.8 }
    : followers > 100_000
    ? { excellent: 4, good: 2, average: 1 }
    : followers > 10_000
    ? { excellent: 5, good: 3, average: 1.5 }
    : { excellent: 7, good: 4, average: 2 };

  if (er >= thresholds.excellent) return { label: "Excellent", level: "excellent" };
  if (er >= thresholds.good) return { label: "Good", level: "good" };
  if (er >= thresholds.average) return { label: "Average", level: "average" };
  return { label: "Below Average", level: "below" };
}

// Compute posting frequency
function getPostingFrequency(posts: InstagramData["posts"]): { postsPerWeek: number; label: string } {
  if (posts.length < 2) return { postsPerWeek: 0, label: "Unknown" };
  const sorted = [...posts].sort((a, b) => a.timestamp - b.timestamp);
  const spanDays = (sorted[sorted.length - 1].timestamp - sorted[0].timestamp) / 86400;
  if (spanDays <= 0) return { postsPerWeek: posts.length, label: `${posts.length}/week` };
  const perWeek = (posts.length / spanDays) * 7;
  return { postsPerWeek: Math.round(perWeek * 10) / 10, label: `~${perWeek.toFixed(1)}/week` };
}

// Content type breakdown
function getContentMix(posts: InstagramData["posts"]): { type: string; count: number; pct: number }[] {
  const counts: Record<string, number> = {};
  posts.forEach(p => { counts[p.mediaType] = (counts[p.mediaType] || 0) + 1; });
  return Object.entries(counts)
    .map(([type, count]) => ({ type, count, pct: Math.round((count / posts.length) * 100) }))
    .sort((a, b) => b.count - a.count);
}

// Merge real Instagram data with Claude's qualitative analysis
function mergeInstagramResult(
  igData: InstagramData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  aiAnalysis: any
) {
  const er = igData.avgEngagementRate;
  const engRating = rateEngagement(er, igData.profile.followerCount);
  const freq = getPostingFrequency(igData.posts);
  const contentMix = getContentMix(igData.posts);

  // Compute averages from all posts
  const totalLikes = igData.posts.reduce((s, p) => s + p.likeCount, 0);
  const totalComments = igData.posts.reduce((s, p) => s + p.commentCount, 0);
  const totalShares = igData.posts.reduce((s, p) => s + p.shareCount, 0);
  const postCount = igData.posts.length || 1;

  return {
    profile: {
      handle: igData.profile.username,
      fullName: igData.profile.fullName,
      platform: "Instagram",
      niche: aiAnalysis.niche || "Content Creator",
      bio: igData.profile.biography,
      followerCount: igData.profile.followerCount,
      followingCount: igData.profile.followingCount,
      mediaCount: igData.profile.mediaCount,
      followerEstimate: formatFollowers(igData.profile.followerCount),
      avgEngagement: er.toFixed(2) + "%",
      avgEngagementRaw: Math.round(er * 100) / 100,
      contentStyle: aiAnalysis.contentStyle || "Mixed content",
      category: igData.profile.category || aiAnalysis.niche || "Content Creator",
      profilePicUrl: igData.profile.profilePicUrl,
    },
    stats: {
      avgLikes: Math.round(totalLikes / postCount),
      avgComments: Math.round(totalComments / postCount),
      avgShares: Math.round(totalShares / postCount),
      engagementRating: engRating,
      postingFrequency: freq,
      contentMix,
      totalPostsAnalyzed: igData.posts.length,
    },
    contentCategories: aiAnalysis.contentCategories || [],
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
      engagementRateRaw: Math.round(post.engagementRate * 100) / 100,
      whyItWorked: aiAnalysis.outlierAnalysis?.[i]?.whyItWorked || "",
      contentType: post.mediaType,
      keyTactic: aiAnalysis.outlierAnalysis?.[i]?.keyTactic || "",
      timestamp: post.timestamp,
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

    // Ensure user exists in DB (fetches real email from Clerk)
    await ensureUser(clerkId);

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
    // Sanitize handle to prevent prompt injection
    const safeHandle = handle.replace(/[^a-zA-Z0-9_.@-]/g, "").slice(0, 100);
    const safePlatform = platform.replace(/[^a-zA-Z]/g, "").slice(0, 30);

    const raw = await callClaude(
      `You are a social media intelligence analyst. Respond ONLY with valid JSON, no markdown fences. Mark all estimates clearly. Never invent exact follower counts — use ranges.`,
      `Analyze the ${safePlatform} account "${safeHandle}". Because we cannot access this platform's API directly, provide your best assessment based on what you know about this creator. Clearly label all data as estimates.
Return JSON with this exact shape:
{
  "profile": {
    "handle": "${safeHandle}",
    "platform": "${safePlatform}",
    "niche": "...",
    "followerEstimate": "estimated range, e.g. 10K-50K",
    "avgEngagement": "estimated, e.g. ~3-5%",
    "contentStyle": "..."
  },
  "outliers": [
    {
      "title": "likely high-performing content theme",
      "hook": "suggested opening hook",
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "engagementRate": "estimated",
      "whyItWorked": "2-3 sentence analysis of why this type of content performs well in this niche",
      "contentType": "carousel|reel|text|image",
      "keyTactic": "short phrase"
    }
  ],
  "contentStrategy": "2-3 sentence summary of recommended strategy for this niche and platform",
  "contentIdeas": [
    {
      "title": "idea title",
      "angle": "the creative angle",
      "hook": "opening hook suggestion",
      "predictedEngagement": "high|medium|viral",
      "postType": "carousel|reel|text|image",
      "viralityScore": 75
    }
  ]
}
Generate 4 content themes in outliers and 5 content ideas. Base everything on platform-specific best practices for this niche.`
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
