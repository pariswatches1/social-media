// Real Instagram data fetcher
// Supports both self-hosted scraper server and RapidAPI as fallback

const RAPIDAPI_HOST = "instagram-scraper-stable-api.p.rapidapi.com";
const SCRAPER_URL = process.env.SCRAPER_URL; // e.g. https://your-scraper.railway.app
const SCRAPER_KEY = process.env.SCRAPER_API_KEY || "";

export interface InstagramProfile {
  username: string;
  fullName: string;
  biography: string;
  followerCount: number;
  followingCount: number;
  mediaCount: number;
  isPrivate: boolean;
  category: string | null;
  profilePicUrl: string | null;
}

export interface InstagramPost {
  caption: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  mediaType: "image" | "video" | "carousel" | "reel";
  timestamp: number;
  playCount: number | null;
  engagementRate: number;
}

export interface InstagramData {
  profile: InstagramProfile;
  posts: InstagramPost[];
  topPosts: InstagramPost[];
  avgEngagementRate: number;
}

// POST request with form data body
async function rapidApiPost(
  endpoint: string,
  body: Record<string, string>
): Promise<unknown> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) {
    throw new Error("RAPIDAPI_KEY is not set");
  }

  const url = `https://${RAPIDAPI_HOST}${endpoint}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "x-rapidapi-key": key,
      "x-rapidapi-host": RAPIDAPI_HOST,
    },
    body: new URLSearchParams(body).toString(),
  });

  if (res.status === 429) {
    throw new Error("Rate limit reached. Please try again in a few minutes.");
  }

  if (res.status === 404) {
    throw new Error("Account not found. Check the handle and try again.");
  }

  if (!res.ok) {
    throw new Error(`Instagram API error: ${res.status}`);
  }

  return res.json();
}

function normalizeMediaType(
  mediaType: number,
  productType?: string
): InstagramPost["mediaType"] {
  // Instagram media types: 1=image, 2=video, 8=carousel/album
  // product_type: "feed" for regular, "clips" for reels, "igtv" for IGTV
  if (mediaType === 8) return "carousel";
  if (mediaType === 2) {
    if (productType === "clips") return "reel";
    return "video";
  }
  return "image";
}

function formatCaption(caption: unknown): string {
  if (!caption) return "";
  if (typeof caption === "string") return caption;
  if (typeof caption === "object" && caption !== null && "text" in caption) {
    return (caption as { text: string }).text || "";
  }
  return "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractPostData(post: any, followerCount: number): InstagramPost {
  const likeCount = (post.like_count as number) || 0;
  const commentCount = (post.comment_count as number) || 0;
  const shareCount = (post.reshare_count as number) || 0;
  const engagementRate =
    followerCount > 0
      ? ((likeCount + commentCount) / followerCount) * 100
      : 0;

  return {
    caption: formatCaption(post.caption),
    likeCount,
    commentCount,
    shareCount,
    mediaType: normalizeMediaType(
      post.media_type as number,
      post.product_type as string | undefined
    ),
    timestamp: (post.taken_at as number) || 0,
    playCount: (post.play_count as number) || null,
    engagementRate,
  };
}

// ── Self-hosted scraper: single call, returns pre-processed data ──
async function fetchFromScraper(
  handle: string
): Promise<InstagramData> {
  const url = `${SCRAPER_URL}/api/instagram/${encodeURIComponent(handle)}`;
  const res = await fetch(url, {
    headers: SCRAPER_KEY ? { "x-api-key": SCRAPER_KEY } : {},
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Scraper error: ${res.status}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (await res.json()) as any;
  const processed = data.processed;

  if (!processed?.profile) {
    throw new Error("Invalid scraper response");
  }

  const profileData = processed.profile;
  const followerCount = profileData.follower_count || 0;

  const profile: InstagramProfile = {
    username: profileData.username || handle,
    fullName: profileData.full_name || "",
    biography: profileData.biography || "",
    followerCount,
    followingCount: profileData.following_count || 0,
    mediaCount: profileData.media_count || 0,
    isPrivate: false,
    category: profileData.category_name || null,
    profilePicUrl: profileData.profile_pic_url_hd || null,
  };

  const posts: InstagramPost[] = (processed.posts || []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p: any) => ({
      caption: p.caption || "",
      likeCount: p.likeCount || 0,
      commentCount: p.commentCount || 0,
      shareCount: p.shareCount || 0,
      mediaType: p.mediaType || "image",
      timestamp: p.timestamp || 0,
      playCount: p.playCount || null,
      engagementRate: p.engagementRate || 0,
    })
  );

  const avgEngagementRate = processed.avg_engagement_rate || 0;

  const topPosts = [...posts]
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, 4);

  return { profile, posts, topPosts, avgEngagementRate };
}

export async function fetchInstagramData(
  handle: string
): Promise<InstagramData> {
  // Clean the handle
  const cleanHandle = handle.replace(/^@/, "").trim();

  // ── Try self-hosted scraper first (unlimited, free) ──
  if (SCRAPER_URL) {
    try {
      return await fetchFromScraper(cleanHandle);
    } catch (scraperErr) {
      console.warn(
        "[Instagram] Scraper failed, falling back to RapidAPI:",
        scraperErr instanceof Error ? scraperErr.message : scraperErr
      );
    }
  }

  // ── Fallback: RapidAPI (limited requests) ──

  // 1. Fetch profile info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileRes = (await rapidApiPost("/ig_get_fb_profile.php", {
    username_or_url: cleanHandle,
    data: "basic",
  })) as any;

  // The response may be the profile directly or wrapped in a data key
  const profileData =
    profileRes?.data || profileRes?.user || profileRes;

  if (!profileData || (!profileData.username && !profileData.full_name)) {
    throw new Error("Account not found. Check the handle and try again.");
  }

  if (profileData.is_private) {
    throw new Error(
      "This account is private. Analysis requires a public profile."
    );
  }

  const followerCount = (profileData.follower_count as number) || 0;

  const profile: InstagramProfile = {
    username: (profileData.username as string) || cleanHandle,
    fullName: (profileData.full_name as string) || "",
    biography: (profileData.biography as string) || "",
    followerCount,
    followingCount: (profileData.following_count as number) || 0,
    mediaCount: (profileData.media_count as number) || 0,
    isPrivate: false,
    category:
      (profileData.category_name as string) ||
      (profileData.category as string) ||
      null,
    profilePicUrl:
      (profileData.profile_pic_url_hd as string) ||
      (profileData.profile_pic_url as string) ||
      null,
  };

  // 2. Fetch recent posts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const postsRes = (await rapidApiPost("/get_ig_user_posts.php", {
    username_or_url: cleanHandle,
    amount: "20",
  })) as any;

  // Posts may be in different locations depending on API version
  // The "Instagram Scraper Stable API" returns { posts: [{ node: {...} }] }
  const rawPostsArray: unknown[] =
    postsRes?.posts ||
    postsRes?.items ||
    postsRes?.data?.items ||
    postsRes?.user_posts ||
    postsRes?.data ||
    [];

  // Unwrap { node: {...} } wrappers if present, then normalize
  const posts: InstagramPost[] = (Array.isArray(rawPostsArray) ? rawPostsArray : [])
    .slice(0, 20)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any) => {
      const post = item?.node || item;
      return extractPostData(post, followerCount);
    });

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
