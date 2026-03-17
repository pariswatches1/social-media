// Real Twitter/X data fetcher via RapidAPI

const RAPIDAPI_HOST = "twitter241.p.rapidapi.com";

export interface TwitterProfile {
  username: string;
  displayName: string;
  biography: string;
  followerCount: number;
  followingCount: number;
  tweetCount: number;
  isVerified: boolean;
  profilePicUrl: string | null;
  bannerUrl: string | null;
  location: string | null;
  userId: string;
}

export interface TwitterPost {
  caption: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  mediaType: "text" | "image" | "video" | "carousel";
  timestamp: number;
  engagementRate: number;
}

export interface TwitterData {
  profile: TwitterProfile;
  posts: TwitterPost[];
  topPosts: TwitterPost[];
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
    throw new Error(`Twitter API error: ${res.status}`);
  }

  return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractTweetData(tweet: any, followerCount: number): TwitterPost {
  // Twitter API responses can nest data in various ways
  const legacy = tweet?.legacy || tweet;
  const core = tweet?.core?.user_results?.result?.legacy || {};

  const likeCount = (legacy.favorite_count as number) || 0;
  const commentCount = (legacy.reply_count as number) || 0;
  const shareCount = (legacy.retweet_count as number) || (legacy.quote_count as number) || 0;
  const viewCount = (tweet.views?.count as number) ||
    parseInt(tweet.views?.count || "0", 10) || 0;

  const engagementRate =
    followerCount > 0
      ? ((likeCount + commentCount + shareCount) / followerCount) * 100
      : 0;

  // Determine media type
  const media = legacy.entities?.media || legacy.extended_entities?.media || [];
  let mediaType: TwitterPost["mediaType"] = "text";
  if (media.length > 1) {
    mediaType = "carousel";
  } else if (media.length === 1) {
    mediaType = media[0].type === "video" || media[0].type === "animated_gif" ? "video" : "image";
  }

  // Parse timestamp
  const createdAt = (legacy.created_at as string) || "";
  const timestamp = createdAt ? Math.floor(new Date(createdAt).getTime() / 1000) : 0;

  return {
    caption: (legacy.full_text as string) || (legacy.text as string) || "",
    likeCount,
    commentCount,
    shareCount,
    viewCount,
    mediaType,
    timestamp,
    engagementRate,
  };
}

export async function fetchTwitterData(
  handle: string
): Promise<TwitterData> {
  // Clean the handle
  const cleanHandle = handle.replace(/^@/, "").trim();

  // 1. Fetch user profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileRes = (await rapidApiGet("/user", {
    username: cleanHandle,
  })) as any;

  // Twitter241 API may nest the result
  const userData =
    profileRes?.result?.data?.user?.result ||
    profileRes?.data?.user?.result ||
    profileRes?.user ||
    profileRes?.data ||
    profileRes;

  const legacyUser = userData?.legacy || userData;

  if (!legacyUser || (!legacyUser.screen_name && !legacyUser.name)) {
    throw new Error("Account not found. Check the handle and try again.");
  }

  // Check for suspended/protected
  if (userData?.reason === "Suspended" || legacyUser?.protected) {
    throw new Error(
      legacyUser?.protected
        ? "This account is protected. Analysis requires a public profile."
        : "This account is suspended."
    );
  }

  const userId =
    (userData?.rest_id as string) ||
    (userData?.id_str as string) ||
    (legacyUser?.id_str as string) ||
    "";

  const followerCount = (legacyUser.followers_count as number) || 0;

  const profile: TwitterProfile = {
    username: (legacyUser.screen_name as string) || cleanHandle,
    displayName: (legacyUser.name as string) || "",
    biography: (legacyUser.description as string) || "",
    followerCount,
    followingCount: (legacyUser.friends_count as number) || (legacyUser.following_count as number) || 0,
    tweetCount: (legacyUser.statuses_count as number) || 0,
    isVerified: !!legacyUser.verified || !!userData?.is_blue_verified,
    profilePicUrl:
      (legacyUser.profile_image_url_https as string)?.replace("_normal", "_400x400") ||
      (legacyUser.profile_image_url as string) ||
      null,
    bannerUrl: (legacyUser.profile_banner_url as string) || null,
    location: (legacyUser.location as string) || null,
    userId,
  };

  // 2. Fetch recent tweets (need userId from step 1)
  let posts: TwitterPost[] = [];

  if (userId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tweetsRes = (await rapidApiGet("/user-tweets", {
      user: userId,
      count: "20",
    })) as any;

    // Navigate the Twitter timeline response structure
    const instructions =
      tweetsRes?.result?.timeline?.instructions ||
      tweetsRes?.data?.user?.result?.timeline_v2?.timeline?.instructions ||
      tweetsRes?.timeline?.instructions ||
      [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let rawEntries: any[] = [];
    for (const instruction of instructions) {
      if (instruction.type === "TimelineAddEntries" || instruction.entries) {
        rawEntries = instruction.entries || [];
        break;
      }
    }

    // If the simpler response format is used
    if (rawEntries.length === 0) {
      const simpleTweets =
        tweetsRes?.result?.tweets ||
        tweetsRes?.tweets ||
        tweetsRes?.data ||
        [];
      if (Array.isArray(simpleTweets)) {
        rawEntries = simpleTweets;
      }
    }

    posts = rawEntries
      .slice(0, 20)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((entry: any) => {
        // Timeline entries have nested tweet_results
        const tweetResult =
          entry?.content?.itemContent?.tweet_results?.result ||
          entry?.tweet_results?.result ||
          entry?.content?.tweet_results?.result ||
          entry;
        return tweetResult;
      })
      .filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (tweet: any) =>
          tweet && (tweet.legacy?.full_text || tweet.full_text || tweet.text)
      )
      .map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (tweet: any) => extractTweetData(tweet, followerCount)
      );
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
