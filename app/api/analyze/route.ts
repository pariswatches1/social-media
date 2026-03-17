import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callClaude } from "@/lib/anthropic";
import { checkAndIncrementUsage } from "@/lib/usage";
import { ensureUser } from "@/lib/ensure-user";
import {
  fetchInstagramData,
  type InstagramData,
} from "@/lib/instagram-api";
import {
  fetchTikTokData,
  type TikTokData,
} from "@/lib/tiktok-api";
import {
  fetchYouTubeData,
  type YouTubeRapidData,
} from "@/lib/youtube-rapidapi";
import {
  fetchTwitterData,
  type TwitterData,
} from "@/lib/twitter-api";

// Format follower count: 1234 -> "1.2K", 1500000 -> "1.5M"
function formatFollowers(count: number): string {
  if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + "M";
  if (count >= 1_000) return (count / 1_000).toFixed(1) + "K";
  return count.toString();
}

// ═══════════════════════════════════════════════════════════════════════════════
// INSTAGRAM
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// TIKTOK
// ═══════════════════════════════════════════════════════════════════════════════

function buildTikTokAnalysisPrompt(data: TikTokData): string {
  const postSummaries = data.topPosts
    .map(
      (p, i) =>
        `Video ${i + 1}: "${p.caption.slice(0, 200)}${p.caption.length > 200 ? "..." : ""}"
  Likes: ${p.likeCount.toLocaleString()} | Comments: ${p.commentCount.toLocaleString()} | Shares: ${p.shareCount.toLocaleString()} | Plays: ${p.playCount.toLocaleString()} | Eng. Rate: ${p.engagementRate.toFixed(2)}%`
    )
    .join("\n\n");

  return `Analyze this REAL TikTok account data. Do NOT make up numbers — I'm providing the real metrics. Your job is to provide QUALITATIVE analysis only.

REAL PROFILE DATA:
- Username: @${data.profile.username}
- Display Name: ${data.profile.nickname || "N/A"}
- Bio: "${data.profile.biography}"
- Followers: ${data.profile.followerCount.toLocaleString()}
- Following: ${data.profile.followingCount.toLocaleString()}
- Total Hearts: ${data.profile.heartCount.toLocaleString()}
- Total Videos: ${data.profile.videoCount}
- Average Engagement Rate: ${data.avgEngagementRate.toFixed(2)}%

TOP ${data.topPosts.length} PERFORMING VIDEOS (by engagement rate):
${postSummaries}

Return JSON with this exact shape:
{
  "niche": "their content niche based on bio and video content",
  "contentStyle": "2-4 word description of their content style",
  "contentCategories": ["category1", "category2", "category3", "category4", "category5"],
  "outlierAnalysis": [
    {
      "whyItWorked": "2-3 sentence analysis of why this specific video performed well",
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
      "postType": "video|duet|stitch",
      "viralityScore": 85
    }
  ]
}

For contentCategories, list 4-6 content theme categories that describe this account.

Generate analysis for all ${data.topPosts.length} videos in outlierAnalysis (matching the order above), and generate 5 content ideas. Base everything on the REAL data patterns.`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// YOUTUBE
// ═══════════════════════════════════════════════════════════════════════════════

function buildYouTubeAnalysisPrompt(data: YouTubeRapidData): string {
  const videoSummaries = data.topPosts
    .map(
      (v, i) =>
        `Video ${i + 1} [${v.mediaType}]: "${v.title.slice(0, 200)}${v.title.length > 200 ? "..." : ""}"
  Views: ${v.viewCount.toLocaleString()} | Likes: ${v.likeCount.toLocaleString()} | Comments: ${v.commentCount.toLocaleString()} | Eng. Rate: ${v.engagementRate.toFixed(2)}%`
    )
    .join("\n\n");

  return `Analyze this REAL YouTube channel data. Do NOT make up numbers — I'm providing the real metrics. Your job is to provide QUALITATIVE analysis only.

REAL CHANNEL DATA:
- Handle: @${data.profile.handle}
- Channel Name: ${data.profile.channelName}
- Description: "${data.profile.description.slice(0, 500)}"
- Subscribers: ${data.profile.subscriberCount.toLocaleString()}
- Total Videos: ${data.profile.videoCount}
- Total Views: ${data.profile.viewCount.toLocaleString()}
- Country: ${data.profile.country || "Not specified"}
- Average Engagement Rate: ${data.avgEngagementRate.toFixed(2)}%

TOP ${data.topPosts.length} PERFORMING VIDEOS (by engagement rate):
${videoSummaries}

Return JSON with this exact shape:
{
  "niche": "their content niche based on channel info and video titles",
  "contentStyle": "2-4 word description of their content style",
  "contentCategories": ["category1", "category2", "category3", "category4", "category5"],
  "outlierAnalysis": [
    {
      "whyItWorked": "2-3 sentence analysis of why this specific video performed well",
      "keyTactic": "short phrase describing the key tactic used",
      "hook": "the opening hook or title strategy"
    }
  ],
  "contentStrategy": "2-3 sentence summary of their overall content strategy based on the patterns you see",
  "contentIdeas": [
    {
      "title": "idea title inspired by their best content",
      "angle": "the creative angle",
      "hook": "opening hook or title suggestion",
      "predictedEngagement": "high|medium|viral",
      "postType": "video|short|livestream",
      "viralityScore": 85
    }
  ]
}

For contentCategories, list 4-6 content theme categories that describe this channel.

Generate analysis for all ${data.topPosts.length} videos in outlierAnalysis (matching the order above), and generate 5 content ideas. Base everything on the REAL data patterns.`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TWITTER / X
// ═══════════════════════════════════════════════════════════════════════════════

function buildTwitterAnalysisPrompt(data: TwitterData): string {
  const tweetSummaries = data.topPosts
    .map(
      (t, i) =>
        `Tweet ${i + 1} [${t.mediaType}]: "${t.caption.slice(0, 280)}${t.caption.length > 280 ? "..." : ""}"
  Likes: ${t.likeCount.toLocaleString()} | Replies: ${t.commentCount.toLocaleString()} | Retweets: ${t.shareCount.toLocaleString()} | Views: ${t.viewCount.toLocaleString()} | Eng. Rate: ${t.engagementRate.toFixed(2)}%`
    )
    .join("\n\n");

  return `Analyze this REAL Twitter/X account data. Do NOT make up numbers — I'm providing the real metrics. Your job is to provide QUALITATIVE analysis only.

REAL PROFILE DATA:
- Username: @${data.profile.username}
- Display Name: ${data.profile.displayName || "N/A"}
- Bio: "${data.profile.biography}"
- Followers: ${data.profile.followerCount.toLocaleString()}
- Following: ${data.profile.followingCount.toLocaleString()}
- Total Tweets: ${data.profile.tweetCount.toLocaleString()}
- Location: ${data.profile.location || "Not specified"}
- Average Engagement Rate: ${data.avgEngagementRate.toFixed(2)}%

TOP ${data.topPosts.length} PERFORMING TWEETS (by engagement rate):
${tweetSummaries}

Return JSON with this exact shape:
{
  "niche": "their content niche based on bio and tweet content",
  "contentStyle": "2-4 word description of their content style",
  "contentCategories": ["category1", "category2", "category3", "category4", "category5"],
  "outlierAnalysis": [
    {
      "whyItWorked": "2-3 sentence analysis of why this specific tweet performed well",
      "keyTactic": "short phrase describing the key tactic used",
      "hook": "the opening hook from the tweet"
    }
  ],
  "contentStrategy": "2-3 sentence summary of their overall content strategy based on the patterns you see",
  "contentIdeas": [
    {
      "title": "idea title inspired by their best content",
      "angle": "the creative angle",
      "hook": "opening hook suggestion",
      "predictedEngagement": "high|medium|viral",
      "postType": "text|image|video|thread",
      "viralityScore": 85
    }
  ]
}

For contentCategories, list 4-6 content theme categories that describe this account.

Generate analysis for all ${data.topPosts.length} tweets in outlierAnalysis (matching the order above), and generate 5 content ideas. Base everything on the REAL data patterns.`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

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

// Generic posting frequency from posts with timestamps
function getPostingFrequency(posts: { timestamp: number }[]): { postsPerWeek: number; label: string } {
  if (posts.length < 2) return { postsPerWeek: 0, label: "Unknown" };
  const sorted = [...posts].sort((a, b) => a.timestamp - b.timestamp);
  const spanDays = (sorted[sorted.length - 1].timestamp - sorted[0].timestamp) / 86400;
  if (spanDays <= 0) return { postsPerWeek: posts.length, label: `${posts.length}/week` };
  const perWeek = (posts.length / spanDays) * 7;
  return { postsPerWeek: Math.round(perWeek * 10) / 10, label: `~${perWeek.toFixed(1)}/week` };
}

// Generic content type breakdown
function getContentMix(posts: { mediaType: string }[]): { type: string; count: number; pct: number }[] {
  if (posts.length === 0) return [];
  const counts: Record<string, number> = {};
  posts.forEach(p => { counts[p.mediaType] = (counts[p.mediaType] || 0) + 1; });
  return Object.entries(counts)
    .map(([type, count]) => ({ type, count, pct: Math.round((count / posts.length) * 100) }))
    .sort((a, b) => b.count - a.count);
}

// Compute estimated reach + price + quality for any platform
function computeDerivedMetrics(
  followerCount: number,
  er: number,
  postsPerWeek: number,
  contentMixLength: number,
  totalMediaCount: number,
) {
  // Estimated reach
  const reachLow = Math.round(followerCount * (er / 100) * 0.6);
  const reachHigh = Math.round(followerCount * (er / 100) * 1.8);
  const reachPct = ((er / 100) * 100).toFixed(2);

  // Estimated price (industry standard CPM)
  const fc = followerCount;
  const baseCPM = fc > 1_000_000 ? 15 : fc > 500_000 ? 20 : fc > 100_000 ? 25 : fc > 50_000 ? 30 : fc > 10_000 ? 40 : 50;
  const avgReach = (reachLow + reachHigh) / 2;
  const estPriceMid = Math.round((avgReach / 1000) * baseCPM);
  const estPriceLow = Math.round(estPriceMid * 0.5);
  const estPriceHigh = Math.round(estPriceMid * 1.5);
  const cpm = avgReach > 0 ? ((estPriceMid / (avgReach / 1000))).toFixed(2) : "0.00";

  // Account quality score (0-100)
  const erScore = Math.min(er * 10, 30);
  const freqScore = Math.min(postsPerWeek * 5, 20);
  const mixScore = contentMixLength >= 2 ? 15 : 8;
  const volScore = Math.min(totalMediaCount / 20, 20);
  const sizeScore = fc > 0 ? Math.min(Math.log10(fc) * 3, 15) : 0;
  const qualityScore = Math.min(Math.round(erScore + freqScore + mixScore + volScore + sizeScore), 100);
  const qualityLabel = qualityScore >= 80 ? "Excellent" : qualityScore >= 60 ? "Good" : qualityScore >= 40 ? "Average" : "Below Average";
  const qualityLevel = qualityScore >= 80 ? "excellent" : qualityScore >= 60 ? "good" : qualityScore >= 40 ? "average" : "below";

  return {
    estimatedReach: {
      low: reachLow,
      high: reachHigh,
      pctOfFollowers: reachPct,
      level: er >= 3 ? "excellent" : er >= 1.5 ? "good" : er >= 0.8 ? "average" : "below",
      label: er >= 3 ? "Excellent" : er >= 1.5 ? "Good" : er >= 0.8 ? "Average" : "Below Average",
    },
    estimatedPrice: {
      low: estPriceLow,
      mid: estPriceMid,
      high: estPriceHigh,
      cpm,
      currency: "USD",
    },
    accountQuality: {
      score: qualityScore,
      label: qualityLabel,
      level: qualityLevel,
      breakdown: {
        engagement: Math.round(erScore),
        frequency: Math.round(freqScore),
        contentDiversity: mixScore,
        volume: Math.round(volScore),
        audienceSize: Math.round(sizeScore),
      },
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MERGE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

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

  const totalLikes = igData.posts.reduce((s, p) => s + p.likeCount, 0);
  const totalComments = igData.posts.reduce((s, p) => s + p.commentCount, 0);
  const totalShares = igData.posts.reduce((s, p) => s + p.shareCount, 0);
  const postCount = igData.posts.length || 1;

  const derived = computeDerivedMetrics(
    igData.profile.followerCount, er, freq.postsPerWeek, contentMix.length, igData.profile.mediaCount
  );

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
    ...derived,
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

// Merge real TikTok data with Claude's qualitative analysis
function mergeTikTokResult(
  ttData: TikTokData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  aiAnalysis: any
) {
  const er = ttData.avgEngagementRate;
  const engRating = rateEngagement(er, ttData.profile.followerCount);
  const freq = getPostingFrequency(ttData.posts);
  const contentMix = getContentMix(ttData.posts);

  const totalLikes = ttData.posts.reduce((s, p) => s + p.likeCount, 0);
  const totalComments = ttData.posts.reduce((s, p) => s + p.commentCount, 0);
  const totalShares = ttData.posts.reduce((s, p) => s + p.shareCount, 0);
  const postCount = ttData.posts.length || 1;

  const derived = computeDerivedMetrics(
    ttData.profile.followerCount, er, freq.postsPerWeek, contentMix.length, ttData.profile.videoCount
  );

  return {
    profile: {
      handle: ttData.profile.username,
      fullName: ttData.profile.nickname,
      platform: "TikTok",
      niche: aiAnalysis.niche || "Content Creator",
      bio: ttData.profile.biography,
      followerCount: ttData.profile.followerCount,
      followingCount: ttData.profile.followingCount,
      mediaCount: ttData.profile.videoCount,
      followerEstimate: formatFollowers(ttData.profile.followerCount),
      avgEngagement: er.toFixed(2) + "%",
      avgEngagementRaw: Math.round(er * 100) / 100,
      contentStyle: aiAnalysis.contentStyle || "Short-form video",
      category: aiAnalysis.niche || "Content Creator",
      profilePicUrl: ttData.profile.profilePicUrl,
      heartCount: ttData.profile.heartCount,
    },
    stats: {
      avgLikes: Math.round(totalLikes / postCount),
      avgComments: Math.round(totalComments / postCount),
      avgShares: Math.round(totalShares / postCount),
      engagementRating: engRating,
      postingFrequency: freq,
      contentMix,
      totalPostsAnalyzed: ttData.posts.length,
    },
    ...derived,
    contentCategories: aiAnalysis.contentCategories || [],
    outliers: ttData.topPosts.map((post, i) => ({
      title:
        post.caption.split("\n")[0]?.slice(0, 80) || "Untitled Video",
      hook:
        aiAnalysis.outlierAnalysis?.[i]?.hook ||
        post.caption.split(".")[0]?.slice(0, 100) ||
        "",
      likes: post.likeCount,
      comments: post.commentCount,
      shares: post.shareCount,
      plays: post.playCount,
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

// Merge real YouTube data with Claude's qualitative analysis
function mergeYouTubeResult(
  ytData: YouTubeRapidData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  aiAnalysis: any
) {
  const er = ytData.avgEngagementRate;
  const engRating = rateEngagement(er, ytData.profile.subscriberCount);
  const freq = getPostingFrequency(ytData.posts);
  const contentMix = getContentMix(ytData.posts);

  const totalViews = ytData.posts.reduce((s, v) => s + v.viewCount, 0);
  const totalLikes = ytData.posts.reduce((s, v) => s + v.likeCount, 0);
  const totalComments = ytData.posts.reduce((s, v) => s + v.commentCount, 0);
  const postCount = ytData.posts.length || 1;

  const derived = computeDerivedMetrics(
    ytData.profile.subscriberCount, er, freq.postsPerWeek, contentMix.length, ytData.profile.videoCount
  );

  return {
    profile: {
      handle: ytData.profile.handle,
      fullName: ytData.profile.channelName,
      platform: "YouTube",
      niche: aiAnalysis.niche || "Content Creator",
      bio: ytData.profile.description,
      followerCount: ytData.profile.subscriberCount,
      followingCount: 0,
      mediaCount: ytData.profile.videoCount,
      followerEstimate: formatFollowers(ytData.profile.subscriberCount),
      avgEngagement: er.toFixed(2) + "%",
      avgEngagementRaw: Math.round(er * 100) / 100,
      contentStyle: aiAnalysis.contentStyle || "Video content",
      category: aiAnalysis.niche || "Content Creator",
      profilePicUrl: ytData.profile.profilePicUrl,
      totalViews: ytData.profile.viewCount,
      country: ytData.profile.country,
    },
    stats: {
      avgViews: Math.round(totalViews / postCount),
      avgLikes: Math.round(totalLikes / postCount),
      avgComments: Math.round(totalComments / postCount),
      avgShares: 0,
      engagementRating: engRating,
      postingFrequency: freq,
      contentMix,
      totalPostsAnalyzed: ytData.posts.length,
    },
    ...derived,
    contentCategories: aiAnalysis.contentCategories || [],
    outliers: ytData.topPosts.map((video, i) => ({
      title: video.title.slice(0, 80) || "Untitled Video",
      hook:
        aiAnalysis.outlierAnalysis?.[i]?.hook ||
        video.title.slice(0, 100) ||
        "",
      views: video.viewCount,
      likes: video.likeCount,
      comments: video.commentCount,
      shares: 0,
      engagementRate: video.engagementRate.toFixed(1) + "%",
      engagementRateRaw: Math.round(video.engagementRate * 100) / 100,
      whyItWorked: aiAnalysis.outlierAnalysis?.[i]?.whyItWorked || "",
      contentType: video.mediaType,
      keyTactic: aiAnalysis.outlierAnalysis?.[i]?.keyTactic || "",
      timestamp: video.timestamp,
      duration: video.duration,
    })),
    contentStrategy: aiAnalysis.contentStrategy || "",
    contentIdeas: aiAnalysis.contentIdeas || [],
    dataSource: "real" as const,
  };
}

// Merge real Twitter data with Claude's qualitative analysis
function mergeTwitterResult(
  twData: TwitterData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  aiAnalysis: any
) {
  const er = twData.avgEngagementRate;
  const engRating = rateEngagement(er, twData.profile.followerCount);
  const freq = getPostingFrequency(twData.posts);
  const contentMix = getContentMix(twData.posts);

  const totalLikes = twData.posts.reduce((s, p) => s + p.likeCount, 0);
  const totalComments = twData.posts.reduce((s, p) => s + p.commentCount, 0);
  const totalShares = twData.posts.reduce((s, p) => s + p.shareCount, 0);
  const postCount = twData.posts.length || 1;

  const derived = computeDerivedMetrics(
    twData.profile.followerCount, er, freq.postsPerWeek, contentMix.length, twData.profile.tweetCount
  );

  return {
    profile: {
      handle: twData.profile.username,
      fullName: twData.profile.displayName,
      platform: "Twitter",
      niche: aiAnalysis.niche || "Content Creator",
      bio: twData.profile.biography,
      followerCount: twData.profile.followerCount,
      followingCount: twData.profile.followingCount,
      mediaCount: twData.profile.tweetCount,
      followerEstimate: formatFollowers(twData.profile.followerCount),
      avgEngagement: er.toFixed(2) + "%",
      avgEngagementRaw: Math.round(er * 100) / 100,
      contentStyle: aiAnalysis.contentStyle || "Mixed content",
      category: aiAnalysis.niche || "Content Creator",
      profilePicUrl: twData.profile.profilePicUrl,
      location: twData.profile.location,
    },
    stats: {
      avgLikes: Math.round(totalLikes / postCount),
      avgComments: Math.round(totalComments / postCount),
      avgShares: Math.round(totalShares / postCount),
      engagementRating: engRating,
      postingFrequency: freq,
      contentMix,
      totalPostsAnalyzed: twData.posts.length,
    },
    ...derived,
    contentCategories: aiAnalysis.contentCategories || [],
    outliers: twData.topPosts.map((post, i) => ({
      title:
        post.caption.split("\n")[0]?.slice(0, 80) || "Untitled Tweet",
      hook:
        aiAnalysis.outlierAnalysis?.[i]?.hook ||
        post.caption.split(".")[0]?.slice(0, 100) ||
        "",
      likes: post.likeCount,
      comments: post.commentCount,
      shares: post.shareCount,
      views: post.viewCount,
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

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTE HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

const CLAUDE_SYSTEM = `You are a social media intelligence analyst. Respond ONLY with valid JSON, no markdown fences.`;

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

    const platformLower = platform.toLowerCase();
    const hasRapidApiKey = !!process.env.RAPIDAPI_KEY;

    // ── Instagram: Real data + AI analysis ──
    if (platformLower === "instagram" && hasRapidApiKey) {
      try {
        const igData = await fetchInstagramData(handle);
        const analysisPrompt = buildInstagramAnalysisPrompt(igData);
        const raw = await callClaude(CLAUDE_SYSTEM, analysisPrompt);
        const aiAnalysis = JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim());
        const result = mergeInstagramResult(igData, aiAnalysis);

        return NextResponse.json({
          ...result,
          usage: { used: usage.used, limit: usage.limit, plan: usage.plan },
        });
      } catch (igError: unknown) {
        const errorMsg = igError instanceof Error ? igError.message : "Unknown error";
        if (errorMsg.includes("private") || errorMsg.includes("not found")) {
          return NextResponse.json({ error: errorMsg }, { status: 400 });
        }
        console.warn("[/api/analyze] Instagram API failed, falling back to AI-only:", errorMsg);
      }
    }

    // ── TikTok: Real data + AI analysis ──
    if (platformLower === "tiktok" && hasRapidApiKey) {
      try {
        const ttData = await fetchTikTokData(handle);
        const analysisPrompt = buildTikTokAnalysisPrompt(ttData);
        const raw = await callClaude(CLAUDE_SYSTEM, analysisPrompt);
        const aiAnalysis = JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim());
        const result = mergeTikTokResult(ttData, aiAnalysis);

        return NextResponse.json({
          ...result,
          usage: { used: usage.used, limit: usage.limit, plan: usage.plan },
        });
      } catch (ttError: unknown) {
        const errorMsg = ttError instanceof Error ? ttError.message : "Unknown error";
        if (errorMsg.includes("not found")) {
          return NextResponse.json({ error: errorMsg }, { status: 400 });
        }
        console.warn("[/api/analyze] TikTok API failed, falling back to AI-only:", errorMsg);
      }
    }

    // ── YouTube: Real data + AI analysis ──
    if (platformLower === "youtube" && hasRapidApiKey) {
      try {
        const ytData = await fetchYouTubeData(handle);
        const analysisPrompt = buildYouTubeAnalysisPrompt(ytData);
        const raw = await callClaude(CLAUDE_SYSTEM, analysisPrompt);
        const aiAnalysis = JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim());
        const result = mergeYouTubeResult(ytData, aiAnalysis);

        return NextResponse.json({
          ...result,
          usage: { used: usage.used, limit: usage.limit, plan: usage.plan },
        });
      } catch (ytError: unknown) {
        const errorMsg = ytError instanceof Error ? ytError.message : "Unknown error";
        if (errorMsg.includes("not found")) {
          return NextResponse.json({ error: errorMsg }, { status: 400 });
        }
        console.warn("[/api/analyze] YouTube API failed, falling back to AI-only:", errorMsg);
      }
    }

    // ── Twitter / X: Real data + AI analysis ──
    if ((platformLower === "twitter" || platformLower === "x") && hasRapidApiKey) {
      try {
        const twData = await fetchTwitterData(handle);
        const analysisPrompt = buildTwitterAnalysisPrompt(twData);
        const raw = await callClaude(CLAUDE_SYSTEM, analysisPrompt);
        const aiAnalysis = JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim());
        const result = mergeTwitterResult(twData, aiAnalysis);

        return NextResponse.json({
          ...result,
          usage: { used: usage.used, limit: usage.limit, plan: usage.plan },
        });
      } catch (twError: unknown) {
        const errorMsg = twError instanceof Error ? twError.message : "Unknown error";
        if (errorMsg.includes("not found") || errorMsg.includes("protected") || errorMsg.includes("suspended")) {
          return NextResponse.json({ error: errorMsg }, { status: 400 });
        }
        console.warn("[/api/analyze] Twitter API failed, falling back to AI-only:", errorMsg);
      }
    }

    // ── Fallback: Claude-only (all platforms or when APIs fail) ──
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
