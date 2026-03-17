// Real YouTube data fetcher via RapidAPI (yt-api.p.rapidapi.com)
// Used by the analyze route for creator analysis with real data

const RAPIDAPI_HOST = "yt-api.p.rapidapi.com";

export interface YouTubeRapidProfile {
  handle: string;
  channelName: string;
  description: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  isVerified: boolean;
  channelId: string;
  profilePicUrl: string | null;
  bannerUrl: string | null;
  country: string | null;
}

export interface YouTubeRapidVideo {
  title: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  mediaType: "video" | "short";
  timestamp: number;
  duration: string;
  engagementRate: number;
}

export interface YouTubeRapidData {
  profile: YouTubeRapidProfile;
  posts: YouTubeRapidVideo[];
  topPosts: YouTubeRapidVideo[];
  avgEngagementRate: number;
}

async function rapidApiGet(
  endpoint: string,
  params: Record<string, string>
): Promise<unknown> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) {
    throw new Error("RAPIDAPI_KEY is not set");
  }

  const qs = new URLSearchParams(params).toString();
  const url = `https://${RAPIDAPI_HOST}${endpoint}?${qs}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "x-rapidapi-key": key,
      "x-rapidapi-host": RAPIDAPI_HOST,
    },
  });

  if (res.status === 429) {
    throw new Error("Rate limit reached. Please try again in a few minutes.");
  }

  if (res.status === 404) {
    throw new Error("Channel not found. Check the handle and try again.");
  }

  if (!res.ok) {
    throw new Error(`YouTube API error: ${res.status}`);
  }

  return res.json();
}

export async function fetchYouTubeData(
  handle: string
): Promise<YouTubeRapidData> {
  // Clean the handle — ensure it has @ prefix for the API
  const cleanHandle = handle.replace(/^@/, "").trim();
  const handleWithAt = `@${cleanHandle}`;

  // 1. Fetch channel about info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aboutRes = (await rapidApiGet("/channel/about", {
    handle: handleWithAt,
  })) as any;

  const channelData = aboutRes?.data || aboutRes;

  if (!channelData || (!channelData.channelId && !channelData.title && !channelData.name)) {
    throw new Error("Channel not found. Check the handle and try again.");
  }

  const channelId =
    (channelData.channelId as string) ||
    (channelData.channel_id as string) ||
    "";

  const subscriberCount =
    (channelData.subscriberCount as number) ||
    (channelData.subscribers as number) ||
    parseSubscriberText(channelData.subscriberCountText || channelData.subscribersText || "0");

  const viewCount =
    (channelData.viewCount as number) ||
    (channelData.views as number) ||
    parseNumericText(channelData.viewCountText || "0");

  const profile: YouTubeRapidProfile = {
    handle: cleanHandle,
    channelName: (channelData.title as string) || (channelData.name as string) || cleanHandle,
    description: (channelData.description as string) || "",
    subscriberCount,
    videoCount: (channelData.videoCount as number) || (channelData.videos as number) || 0,
    viewCount,
    isVerified: !!channelData.isVerified || !!channelData.badges?.length,
    channelId,
    profilePicUrl:
      (channelData.avatar as string) ||
      channelData?.avatar?.[0]?.url ||
      channelData?.thumbnail?.[0]?.url ||
      null,
    bannerUrl:
      (channelData.banner as string) ||
      channelData?.banner?.[0]?.url ||
      null,
    country: (channelData.country as string) || null,
  };

  // 2. Fetch recent videos (need channelId from step 1)
  let posts: YouTubeRapidVideo[] = [];

  if (channelId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const videosRes = (await rapidApiGet("/channel/videos", {
      id: channelId,
    })) as any;

    const rawVideos: unknown[] =
      videosRes?.data || videosRes?.videos || videosRes?.items || [];

    posts = (Array.isArray(rawVideos) ? rawVideos : [])
      .slice(0, 20)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => extractVideoData(item, subscriberCount));
  }

  // Calculate average engagement
  const avgEngagementRate =
    posts.length > 0
      ? posts.reduce((sum, p) => sum + p.engagementRate, 0) / posts.length
      : 0;

  // Sort by engagement rate descending, pick top 4
  const topPosts = [...posts]
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, 4);

  return {
    profile,
    posts,
    topPosts,
    avgEngagementRate,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractVideoData(item: any, subscriberCount: number): YouTubeRapidVideo {
  const viewCount = (item.viewCount as number) || parseNumericText(item.viewCountText || item.views || "0");
  const likeCount = (item.likeCount as number) || 0;
  const commentCount = (item.commentCount as number) || 0;

  // Engagement rate = (likes + comments) / subscribers * 100
  const engagementRate =
    subscriberCount > 0
      ? ((likeCount + commentCount) / subscriberCount) * 100
      : viewCount > 0
      ? ((likeCount + commentCount) / viewCount) * 100
      : 0;

  // Determine if it's a short based on duration
  const durationStr = (item.lengthText as string) || (item.duration as string) || "";
  const isShort = item.isShort || (parseDurationSeconds(durationStr) > 0 && parseDurationSeconds(durationStr) <= 60);

  return {
    title: (item.title as string) || "",
    viewCount,
    likeCount,
    commentCount,
    mediaType: isShort ? "short" : "video",
    timestamp: (item.publishedTimeText as string)
      ? estimateTimestamp(item.publishedTimeText as string)
      : (item.publishDate as number) || 0,
    duration: durationStr,
    engagementRate,
  };
}

function parseSubscriberText(text: string): number {
  if (!text) return 0;
  const clean = text.replace(/[^0-9.KMBkmb]/g, "");
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  if (/[Bb]/.test(clean)) return Math.round(num * 1_000_000_000);
  if (/[Mm]/.test(clean)) return Math.round(num * 1_000_000);
  if (/[Kk]/.test(clean)) return Math.round(num * 1_000);
  return Math.round(num);
}

function parseNumericText(text: string | number): number {
  if (typeof text === "number") return text;
  if (!text) return 0;
  const clean = text.replace(/[^0-9]/g, "");
  return parseInt(clean, 10) || 0;
}

function parseDurationSeconds(text: string): number {
  if (!text) return 0;
  const parts = text.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

function estimateTimestamp(publishedText: string): number {
  const now = Math.floor(Date.now() / 1000);
  const match = publishedText.match(/(\d+)\s*(second|minute|hour|day|week|month|year)/i);
  if (!match) return now;
  const amount = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = {
    second: 1,
    minute: 60,
    hour: 3600,
    day: 86400,
    week: 604800,
    month: 2592000,
    year: 31536000,
  };
  return now - amount * (multipliers[unit] || 0);
}
