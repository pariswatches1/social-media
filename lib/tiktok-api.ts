// Real TikTok data fetcher via RapidAPI

const RAPIDAPI_HOST = "tiktok-scraper7.p.rapidapi.com";

export interface TikTokProfile {
  username: string;
  nickname: string;
  biography: string;
  followerCount: number;
  followingCount: number;
  heartCount: number;
  videoCount: number;
  isVerified: boolean;
  profilePicUrl: string | null;
}

export interface TikTokPost {
  caption: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  playCount: number;
  mediaType: "video";
  timestamp: number;
  engagementRate: number;
}

export interface TikTokData {
  profile: TikTokProfile;
  posts: TikTokPost[];
  topPosts: TikTokPost[];
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
    throw new Error("Account not found. Check the handle and try again.");
  }

  if (!res.ok) {
    throw new Error(`TikTok API error: ${res.status}`);
  }

  return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractPostData(item: any, followerCount: number): TikTokPost {
  const likeCount = (item.diggCount as number) || (item.stats?.diggCount as number) || 0;
  const commentCount = (item.commentCount as number) || (item.stats?.commentCount as number) || 0;
  const shareCount = (item.shareCount as number) || (item.stats?.shareCount as number) || 0;
  const playCount = (item.playCount as number) || (item.stats?.playCount as number) || 0;

  const engagementRate =
    followerCount > 0
      ? ((likeCount + commentCount + shareCount) / followerCount) * 100
      : 0;

  return {
    caption: (item.desc as string) || (item.title as string) || "",
    likeCount,
    commentCount,
    shareCount,
    playCount,
    mediaType: "video",
    timestamp: (item.createTime as number) || 0,
    engagementRate,
  };
}

export async function fetchTikTokData(
  handle: string
): Promise<TikTokData> {
  // Clean the handle
  const cleanHandle = handle.replace(/^@/, "").trim();

  // 1. Fetch user profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileRes = (await rapidApiGet("/user/info", {
    unique_id: cleanHandle,
  })) as any;

  const userData =
    profileRes?.data?.user || profileRes?.user || profileRes?.data || profileRes;
  const statsData =
    profileRes?.data?.stats || profileRes?.stats || {};

  if (!userData || (!userData.uniqueId && !userData.nickname)) {
    throw new Error("Account not found. Check the handle and try again.");
  }

  const followerCount = (statsData.followerCount as number) || (userData.followerCount as number) || 0;

  const profile: TikTokProfile = {
    username: (userData.uniqueId as string) || cleanHandle,
    nickname: (userData.nickname as string) || "",
    biography: (userData.signature as string) || "",
    followerCount,
    followingCount: (statsData.followingCount as number) || (userData.followingCount as number) || 0,
    heartCount: (statsData.heartCount as number) || (statsData.heart as number) || 0,
    videoCount: (statsData.videoCount as number) || 0,
    isVerified: !!userData.verified,
    profilePicUrl: (userData.avatarLarger as string) || (userData.avatarMedium as string) || null,
  };

  // 2. Fetch recent posts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const postsRes = (await rapidApiGet("/user/posts", {
    unique_id: cleanHandle,
    count: "20",
  })) as any;

  const rawPosts: unknown[] =
    postsRes?.data?.videos || postsRes?.videos || postsRes?.data || postsRes?.items || [];

  const posts: TikTokPost[] = (Array.isArray(rawPosts) ? rawPosts : [])
    .slice(0, 20)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any) => extractPostData(item, followerCount));

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
