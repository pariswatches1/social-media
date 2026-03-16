// ═══════════════════════════════════════════════════════════════════════════════
// Creator Discovery — Multi-Platform Search Engine
// ═══════════════════════════════════════════════════════════════════════════════
//
// Each platform uses the BEST available API:
//
//   Instagram  → RapidAPI (instagram-scraper-stable-api)     — RAPIDAPI_KEY
//   TikTok     → RapidAPI (tiktok-scraper7 by TIKWM)        — RAPIDAPI_KEY
//   YouTube    → Official YouTube Data API v3 (FREE)         — YOUTUBE_API_KEY
//   Twitter/X  → RapidAPI (twitter-aio)                      — RAPIDAPI_KEY
//   Facebook   → RapidAPI (facebook-scraper3)                — RAPIDAPI_KEY
//   Twitch     → Official Twitch Helix API (FREE)            — TWITCH_CLIENT_ID + SECRET
//   Fallback   → Claude AI (always works)                    — ANTHROPIC_API_KEY
//
// Results are cached in the local Creator table to avoid redundant API calls.
// ═══════════════════════════════════════════════════════════════════════════════

export interface DiscoveredCreator {
  platform: string;
  platformId: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  engagementRate: number;
  trustScore: number;
  avgLikes: number;
  avgComments: number;
  niche: string;
  location: string;
  email: string;
  website: string;
}

export interface SearchFilters {
  query: string;
  platform: string;
  niche: string;
  minFollowers: number;
  maxFollowers: number;
  minEngagement: number;
  minTrust: number;
  page: number;
  limit: number;
}

export interface SearchResult {
  creators: DiscoveredCreator[];
  total: number;
  source: "rapidapi" | "youtube-api" | "twitch-api" | "ai" | "cache";
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function passesFollowerFilter(count: number, min: number, max: number): boolean {
  if (min && count < min) return false;
  if (max && count > max) return false;
  return true;
}

// Shared RapidAPI GET request helper
async function rapidGet(
  host: string,
  path: string,
  params: Record<string, string> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any | null> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) return null;

  const qs = new URLSearchParams(params).toString();
  const url = `https://${host}${path}${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": host,
    },
  });

  if (!res.ok) {
    console.error(`[RapidAPI] ${host}${path} returned ${res.status}`);
    return null;
  }
  return res.json();
}

// Shared RapidAPI POST request helper (for Instagram which uses POST)
async function rapidPost(
  host: string,
  path: string,
  body: Record<string, string>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any | null> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) return null;

  const url = `https://${host}${path}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": host,
    },
    body: new URLSearchParams(body).toString(),
  });

  if (!res.ok) {
    console.error(`[RapidAPI] ${host}${path} returned ${res.status}`);
    return null;
  }
  return res.json();
}

// ═══════════════════════════════════════════════════════════════════════════════
// INSTAGRAM — RapidAPI (instagram-scraper-stable-api)
// Host: instagram-scraper-stable-api.p.rapidapi.com
// Auth: RAPIDAPI_KEY (same key you already have)
// Method: POST (this API uses form-encoded POST requests)
// ═══════════════════════════════════════════════════════════════════════════════

const IG_HOST = "instagram-scraper-stable-api.p.rapidapi.com";

async function searchInstagram(
  filters: SearchFilters
): Promise<DiscoveredCreator[]> {
  const query = filters.query || filters.niche || "influencer";

  // Try search_users endpoint first
  let data = await rapidPost(IG_HOST, "/search_users.php", {
    query,
    count: String(filters.limit),
  });

  // Fallback to ig_search endpoint
  if (!data) {
    data = await rapidPost(IG_HOST, "/ig_search.php", { query });
  }

  if (!data) return [];

  const users = data?.users || data?.data || (Array.isArray(data) ? data : []);
  if (!Array.isArray(users)) return [];

  const creators: DiscoveredCreator[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const user of users as any[]) {
    const followerCount = user.follower_count || user.followers || 0;
    if (!passesFollowerFilter(followerCount, filters.minFollowers, filters.maxFollowers)) continue;

    creators.push({
      platform: "instagram",
      platformId: String(user.pk || user.id || user.username || ""),
      handle: user.username || "",
      displayName: user.full_name || user.username || "",
      avatarUrl: user.profile_pic_url || user.profile_pic_url_hd || "",
      bio: user.biography || "",
      followerCount,
      followingCount: user.following_count || 0,
      postCount: user.media_count || 0,
      engagementRate: user.engagement_rate || 0,
      trustScore: 0,
      avgLikes: user.avg_likes || 0,
      avgComments: user.avg_comments || 0,
      niche: filters.niche || user.category_name || "",
      location: user.city_name || "",
      email: user.public_email || "",
      website: user.external_url || "",
    });
  }

  return creators;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIKTOK — RapidAPI (Tiktok Scraper by TIKWM)
// Host: tiktok-scraper7.p.rapidapi.com
// Auth: RAPIDAPI_KEY (same key)
// Method: GET
// Free: 300 requests/month
// ═══════════════════════════════════════════════════════════════════════════════

const TT_HOST = "tiktok-scraper7.p.rapidapi.com";

async function searchTikTok(
  filters: SearchFilters
): Promise<DiscoveredCreator[]> {
  const query = filters.query || filters.niche || "influencer";

  // GET /search/user — returns TikTok users matching query
  const data = await rapidGet(TT_HOST, "/search/user", {
    query,
    count: String(Math.min(filters.limit, 30)),
  });

  if (!data) return [];

  // TIKWM response format: { data: { user_list: [...] } } or { data: [...] }
  const users =
    data?.data?.user_list ||
    data?.data?.users ||
    data?.user_list ||
    data?.users ||
    data?.data ||
    (Array.isArray(data) ? data : []);

  if (!Array.isArray(users)) return [];

  const creators: DiscoveredCreator[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const item of users as any[]) {
    // TIKWM may wrap user data in a user_info field
    const user = item?.user_info || item?.user || item;
    const stats = item?.stats || user?.stats || user;

    const followerCount =
      stats?.follower_count || stats?.followerCount ||
      user?.follower_count || user?.fans || 0;

    if (!passesFollowerFilter(followerCount, filters.minFollowers, filters.maxFollowers)) continue;

    creators.push({
      platform: "tiktok",
      platformId: String(user.id || user.uid || user.sec_uid || user.unique_id || ""),
      handle: user.unique_id || user.uniqueId || user.username || "",
      displayName: user.nickname || user.unique_id || "",
      avatarUrl:
        user.avatar_thumb?.url_list?.[0] ||
        user.avatar_thumb ||
        user.avatarThumb ||
        user.avatar_medium ||
        user.avatar ||
        "",
      bio: user.signature || user.bio || "",
      followerCount,
      followingCount: stats?.following_count || stats?.followingCount || user?.following_count || 0,
      postCount: stats?.video_count || stats?.videoCount || user?.video_count || user?.aweme_count || 0,
      engagementRate: 0,
      trustScore: 0,
      avgLikes: stats?.heart_count || stats?.total_favorited || 0,
      avgComments: 0,
      niche: filters.niche || "",
      location: user.region || user.country || "",
      email: "",
      website: "",
    });
  }

  return creators;
}

// ═══════════════════════════════════════════════════════════════════════════════
// YOUTUBE — Official YouTube Data API v3 (FREE)
// Base: https://www.googleapis.com/youtube/v3
// Auth: YOUTUBE_API_KEY (free from Google Cloud Console)
// Free: 10,000 quota units/day (~4,950 enriched channels/day)
// Cost per search: 100 units (search) + 1 unit (channel details) = 101 units
// ═══════════════════════════════════════════════════════════════════════════════

async function searchYouTube(
  filters: SearchFilters
): Promise<DiscoveredCreator[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  const query = filters.query || filters.niche || "influencer";
  const maxResults = Math.min(filters.limit, 50); // YouTube max is 50 per page

  try {
    // Step 1: Search for channels (costs 100 quota units)
    const searchParams = new URLSearchParams({
      key: apiKey,
      part: "snippet",
      type: "channel",
      q: query,
      maxResults: String(maxResults),
      order: "relevance",
    });

    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`
    );

    if (!searchRes.ok) {
      console.error(`[YouTube API] Search returned ${searchRes.status}`);
      return [];
    }

    const searchData = await searchRes.json();
    const items = searchData?.items || [];

    if (!Array.isArray(items) || items.length === 0) return [];

    // Step 2: Get channel statistics for all found channels (costs 1 quota unit)
    // Batch up to 50 channel IDs in one request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channelIds = items.map((item: any) => item.snippet?.channelId || item.id?.channelId).filter(Boolean);

    if (channelIds.length === 0) return [];

    const channelParams = new URLSearchParams({
      key: apiKey,
      part: "snippet,statistics,brandingSettings",
      id: channelIds.join(","),
    });

    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?${channelParams.toString()}`
    );

    if (!channelRes.ok) {
      console.error(`[YouTube API] Channels returned ${channelRes.status}`);
      return [];
    }

    const channelData = await channelRes.json();
    const channels = channelData?.items || [];

    const creators: DiscoveredCreator[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const ch of channels as any[]) {
      const stats = ch.statistics || {};
      const snippet = ch.snippet || {};
      const branding = ch.brandingSettings?.channel || {};

      const subscriberCount = parseInt(stats.subscriberCount || "0", 10);
      if (!passesFollowerFilter(subscriberCount, filters.minFollowers, filters.maxFollowers)) continue;

      const viewCount = parseInt(stats.viewCount || "0", 10);
      const videoCount = parseInt(stats.videoCount || "0", 10);

      // Estimate engagement: avg views per video / subscribers * 100
      const estimatedEngagement =
        subscriberCount > 0 && videoCount > 0
          ? ((viewCount / videoCount) / subscriberCount) * 100
          : 0;

      creators.push({
        platform: "youtube",
        platformId: ch.id || "",
        handle: snippet.customUrl || snippet.title || "",
        displayName: snippet.title || "",
        avatarUrl:
          snippet.thumbnails?.medium?.url ||
          snippet.thumbnails?.default?.url || "",
        bio: snippet.description || "",
        followerCount: subscriberCount,
        followingCount: 0, // YouTube doesn't expose subscriptions count
        postCount: videoCount,
        engagementRate: Math.round(estimatedEngagement * 100) / 100,
        trustScore: 0,
        avgLikes: 0, // Would need per-video lookup
        avgComments: 0,
        niche: branding.keywords || filters.niche || "",
        location: snippet.country || branding.country || "",
        email: "", // YouTube doesn't expose email via API
        website: branding.unsubscribedTrailer || "",
      });
    }

    return creators;
  } catch (error) {
    console.error("[YouTube API] Search failed:", error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TWITTER/X — RapidAPI (Twitter AIO by Vapor Tools)
// Host: twitter-aio.p.rapidapi.com
// Auth: RAPIDAPI_KEY (same key)
// Method: GET
// Free: 300 requests/month
// ═══════════════════════════════════════════════════════════════════════════════

const TW_HOST = "twitter-aio.p.rapidapi.com";

async function searchTwitter(
  filters: SearchFilters
): Promise<DiscoveredCreator[]> {
  const query = filters.query || filters.niche || "influencer";

  // GET /search — search for users/tweets
  const data = await rapidGet(TW_HOST, "/search", {
    query,
    section: "people",
    count: String(Math.min(filters.limit, 20)),
  });

  if (!data) return [];

  // Response may contain users in different locations
  const users =
    data?.users ||
    data?.data?.users ||
    data?.results ||
    data?.entries ||
    (Array.isArray(data) ? data : []);

  if (!Array.isArray(users)) return [];

  const creators: DiscoveredCreator[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const user of users as any[]) {
    // Twitter AIO may nest user data under legacy/core fields
    const profile = user?.legacy || user?.core?.user_results?.result?.legacy || user;

    const followerCount =
      profile.followers_count || profile.follower_count || profile.followersCount || 0;

    if (!passesFollowerFilter(followerCount, filters.minFollowers, filters.maxFollowers)) continue;

    const statusCount = profile.statuses_count || profile.tweet_count || 0;
    const favoritesCount = profile.favourites_count || 0;

    creators.push({
      platform: "twitter",
      platformId: String(user.id || user.rest_id || profile.id_str || profile.screen_name || ""),
      handle: profile.screen_name || profile.username || "",
      displayName: profile.name || profile.screen_name || "",
      avatarUrl: (profile.profile_image_url_https || profile.profile_image_url || "").replace("_normal", "_400x400"),
      bio: profile.description || "",
      followerCount,
      followingCount: profile.friends_count || profile.following_count || 0,
      postCount: statusCount,
      engagementRate: 0,
      trustScore: 0,
      avgLikes: favoritesCount > 0 && statusCount > 0 ? Math.round(favoritesCount / statusCount) : 0,
      avgComments: 0,
      niche: filters.niche || "",
      location: profile.location || "",
      email: "",
      website: profile.url || "",
    });
  }

  return creators;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACEBOOK — RapidAPI (Facebook Scraper by krasnoludkolo)
// Host: facebook-scraper3.p.rapidapi.com
// Auth: RAPIDAPI_KEY (same key)
// Method: GET
// Free: 100 requests/month
// ═══════════════════════════════════════════════════════════════════════════════

const FB_HOST = "facebook-scraper3.p.rapidapi.com";

async function searchFacebook(
  filters: SearchFilters
): Promise<DiscoveredCreator[]> {
  const query = filters.query || filters.niche || "influencer";

  // GET /search/pages — search Facebook pages
  const data = await rapidGet(FB_HOST, "/search/pages", {
    query,
  });

  if (!data) return [];

  const pages =
    data?.results ||
    data?.pages ||
    data?.data ||
    (Array.isArray(data) ? data : []);

  if (!Array.isArray(pages)) return [];

  const creators: DiscoveredCreator[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const page of pages as any[]) {
    const followerCount =
      page.followers || page.follower_count || page.fan_count || page.likes || 0;

    if (!passesFollowerFilter(followerCount, filters.minFollowers, filters.maxFollowers)) continue;

    creators.push({
      platform: "facebook",
      platformId: String(page.id || page.page_id || ""),
      handle: page.username || page.vanity || page.name || "",
      displayName: page.name || page.title || "",
      avatarUrl: page.profile_picture || page.avatar || page.image || "",
      bio: page.about || page.description || page.category || "",
      followerCount,
      followingCount: 0,
      postCount: 0,
      engagementRate: 0,
      trustScore: 0,
      avgLikes: 0,
      avgComments: 0,
      niche: page.category || page.category_name || filters.niche || "",
      location: page.location || page.city || "",
      email: page.email || "",
      website: page.website || page.link || "",
    });
  }

  return creators;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TWITCH — Official Twitch Helix API (FREE)
// Base: https://api.twitch.tv/helix
// Auth: TWITCH_CLIENT_ID + TWITCH_CLIENT_SECRET → App Access Token
// Free: Unlimited (reasonable use)
// ═══════════════════════════════════════════════════════════════════════════════

// Cache Twitch app access token in memory (expires after ~60 days)
let twitchToken: { token: string; expiresAt: number } | null = null;

async function getTwitchAppToken(): Promise<string | null> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  // Return cached token if still valid (with 5 min buffer)
  if (twitchToken && twitchToken.expiresAt > Date.now() + 300_000) {
    return twitchToken.token;
  }

  try {
    const res = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      }).toString(),
    });

    if (!res.ok) return null;

    const data = await res.json();
    twitchToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
    };
    return twitchToken.token;
  } catch {
    return null;
  }
}

async function searchTwitch(
  filters: SearchFilters
): Promise<DiscoveredCreator[]> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const token = await getTwitchAppToken();
  if (!clientId || !token) return [];

  const query = filters.query || filters.niche || "gaming";

  try {
    // GET /helix/search/channels — search live channels by query
    const searchParams = new URLSearchParams({
      query,
      first: String(Math.min(filters.limit, 100)), // Twitch max is 100
    });

    const res = await fetch(
      `https://api.twitch.tv/helix/search/channels?${searchParams.toString()}`,
      {
        headers: {
          "Client-Id": clientId,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      console.error(`[Twitch API] Search returned ${res.status}`);
      return [];
    }

    const searchData = await res.json();
    const channels = searchData?.data || [];

    if (!Array.isArray(channels) || channels.length === 0) return [];

    // Get follower counts for each channel (Twitch requires individual calls)
    // Batch the first 20 to conserve rate limits
    const creators: DiscoveredCreator[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const ch of (channels as any[]).slice(0, filters.limit)) {
      // Get follower count via /helix/channels/followers
      let followerCount = 0;
      try {
        const followRes = await fetch(
          `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${ch.id}&first=1`,
          {
            headers: {
              "Client-Id": clientId,
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (followRes.ok) {
          const followData = await followRes.json();
          followerCount = followData?.total || 0;
        }
      } catch {
        // follower count stays 0
      }

      if (!passesFollowerFilter(followerCount, filters.minFollowers, filters.maxFollowers)) continue;

      creators.push({
        platform: "twitch",
        platformId: ch.id || "",
        handle: ch.broadcaster_login || ch.display_name || "",
        displayName: ch.display_name || ch.broadcaster_login || "",
        avatarUrl: ch.thumbnail_url || "",
        bio: ch.title || "", // Channel title (current stream title)
        followerCount,
        followingCount: 0,
        postCount: 0,
        engagementRate: 0,
        trustScore: 0,
        avgLikes: 0,
        avgComments: 0,
        niche: ch.game_name || filters.niche || "",
        location: "",
        email: "",
        website: "",
      });
    }

    return creators;
  } catch (error) {
    console.error("[Twitch API] Search failed:", error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI FALLBACK — Claude (always works)
// ═══════════════════════════════════════════════════════════════════════════════

async function searchViaAI(
  filters: SearchFilters
): Promise<DiscoveredCreator[]> {
  const { callClaude } = await import("@/lib/anthropic");

  const platformText =
    filters.platform === "all"
      ? "Instagram, TikTok, YouTube, Twitter, Facebook, and Twitch"
      : filters.platform;
  const nicheText = filters.niche || filters.query || "general content creation";
  const followersText = filters.minFollowers
    ? `with at least ${filters.minFollowers.toLocaleString()} followers`
    : "";

  const prompt = `Generate ${filters.limit} realistic influencer profiles for the search query.

Search: "${filters.query || "trending creators"}"
Platform(s): ${platformText}
Niche: ${nicheText}
${followersText}
${filters.minEngagement ? `Minimum engagement rate: ${filters.minEngagement}%` : ""}

Return a JSON array of creator objects. Each object must have exactly these fields:
{
  "platform": "instagram" | "tiktok" | "youtube" | "twitter" | "facebook" | "twitch",
  "platformId": "unique_string",
  "handle": "@username",
  "displayName": "Full Name",
  "bio": "Their bio description (1-2 sentences)",
  "followerCount": number,
  "followingCount": number,
  "postCount": number,
  "engagementRate": number (percentage, e.g. 3.5),
  "trustScore": number (0-100),
  "avgLikes": number,
  "avgComments": number,
  "niche": "their niche",
  "location": "City, Country",
  "email": "their@email.com or empty string"
}

IMPORTANT:
- Generate REAL-SOUNDING but clearly AI-estimated profiles
- Use realistic follower counts, engagement rates, and metrics
- Vary the profiles (mix of micro, mid, macro influencers)
- Make handles creative and believable
- Return ONLY the JSON array, no markdown, no explanation`;

  try {
    const response = await callClaude(
      "You are a creator discovery engine that returns JSON arrays of influencer profiles.",
      prompt
    );

    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return [];

    return parsed.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any, i: number) => ({
        platform: p.platform || "instagram",
        platformId: p.platformId || `ai_${Date.now()}_${i}`,
        handle: (p.handle || "").replace(/^@/, ""),
        displayName: p.displayName || p.handle || "",
        avatarUrl: "",
        bio: p.bio || "",
        followerCount: p.followerCount || 0,
        followingCount: p.followingCount || 0,
        postCount: p.postCount || 0,
        engagementRate: p.engagementRate || 0,
        trustScore: p.trustScore || Math.floor(Math.random() * 30) + 60,
        avgLikes: p.avgLikes || 0,
        avgComments: p.avgComments || 0,
        niche: p.niche || filters.niche || "",
        location: p.location || "",
        email: p.email || "",
        website: "",
      })
    );
  } catch (error) {
    console.error("[AI] Creator search failed:", error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRUST SCORE — Heuristic based on available data
// ═══════════════════════════════════════════════════════════════════════════════

export function calculateTrustScore(creator: DiscoveredCreator): number {
  if (creator.trustScore > 0) return creator.trustScore;

  let score = 50;

  // Follower/following ratio
  if (creator.followerCount > 0 && creator.followingCount > 0) {
    const ratio = creator.followerCount / creator.followingCount;
    if (ratio > 10) score += 15;
    else if (ratio > 2) score += 10;
    else if (ratio > 1) score += 5;
    else if (ratio < 0.5) score -= 15;
  }

  // Engagement rate
  if (creator.engagementRate > 0) {
    if (creator.engagementRate >= 1 && creator.engagementRate <= 10) score += 15;
    else if (creator.engagementRate > 10) score -= 5;
    else if (creator.engagementRate < 0.5) score -= 10;
  }

  // Has bio
  if (creator.bio && creator.bio.length > 20) score += 5;

  // Has posts
  if (creator.postCount > 50) score += 5;
  else if (creator.postCount > 10) score += 3;

  // Has email
  if (creator.email) score += 5;

  return Math.max(0, Math.min(100, score));
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SEARCH — Routes to the right API(s) based on platform filter
// ═══════════════════════════════════════════════════════════════════════════════

// Map platform → search function
const PLATFORM_SEARCHERS: Record<string, (f: SearchFilters) => Promise<DiscoveredCreator[]>> = {
  instagram: searchInstagram,
  tiktok: searchTikTok,
  youtube: searchYouTube,
  twitter: searchTwitter,
  facebook: searchFacebook,
  twitch: searchTwitch,
};

export async function searchCreators(
  filters: SearchFilters
): Promise<SearchResult> {
  try {
    let allCreators: DiscoveredCreator[] = [];
    let source: SearchResult["source"] = "rapidapi";

    if (filters.platform !== "all" && PLATFORM_SEARCHERS[filters.platform]) {
      // ── Single platform search ────────────────────────────────────────
      const searcher = PLATFORM_SEARCHERS[filters.platform];
      allCreators = await searcher(filters);

      // Set source based on platform
      if (filters.platform === "youtube") source = "youtube-api";
      else if (filters.platform === "twitch") source = "twitch-api";
      else source = "rapidapi";

    } else {
      // ── "All" platforms — search top platforms in parallel ─────────────
      // Search Instagram, TikTok, YouTube in parallel (the big 3 for influencers)
      // Plus Twitter, Facebook, Twitch if we have keys
      const searches = Object.entries(PLATFORM_SEARCHERS).map(
        async ([platform, searcher]) => {
          try {
            const results = await searcher(filters);
            return results;
          } catch (error) {
            console.error(`[Discovery] ${platform} error:`, error);
            return [] as DiscoveredCreator[];
          }
        }
      );

      const results = await Promise.allSettled(searches);

      for (const result of results) {
        if (result.status === "fulfilled" && result.value.length > 0) {
          allCreators.push(...result.value);
        }
      }

      // Determine source based on what returned data
      if (allCreators.length > 0) source = "rapidapi";
    }

    // ── If real APIs returned results, apply trust scores and return ────
    if (allCreators.length > 0) {
      allCreators = allCreators.map((c) => ({
        ...c,
        trustScore: calculateTrustScore(c),
      }));

      // Sort by follower count descending, limit to requested amount
      allCreators.sort((a, b) => b.followerCount - a.followerCount);
      const limited = allCreators.slice(0, filters.limit);

      console.log(`[Discovery] Returned ${limited.length} creators from ${source} (total found: ${allCreators.length})`);

      return {
        creators: limited,
        total: allCreators.length,
        source,
      };
    }

    // ── All real APIs failed → AI fallback ──────────────────────────────
    console.log("[Discovery] All APIs returned empty, falling back to AI");
    const aiCreators = await searchViaAI(filters);

    if (aiCreators.length > 0) {
      return {
        creators: aiCreators.map((c) => ({
          ...c,
          trustScore: calculateTrustScore(c),
        })),
        total: aiCreators.length,
        source: "ai",
      };
    }

    // Everything failed
    return { creators: [], total: 0, source: "cache" };
  } catch (error) {
    console.error("[Discovery] Search failed:", error);
    return { creators: [], total: 0, source: "cache" };
  }
}
