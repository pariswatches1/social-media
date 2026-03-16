// ═══════════════════════════════════════════════════════════════════════════════
// YouTube Data API v3 — Real data fetcher
// Uses the official Google YouTube API (FREE — 10,000 quota units/day)
//
// Quota costs:
//   search.list       = 100 units per call (returns up to 50 results)
//   channels.list     = 1 unit per call (batch up to 50 IDs)
//   videos.list       = 1 unit per call (batch up to 50 IDs)
//   search + channels = 101 units for 50 enriched channels
//   10,000 units/day  ≈ 4,950 enriched channels/day
// ═══════════════════════════════════════════════════════════════════════════════

const YT_BASE = "https://www.googleapis.com/youtube/v3";

function getApiKey(): string | null {
  return process.env.YOUTUBE_API_KEY || null;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface YouTubeChannel {
  channelId: string;
  title: string;
  description: string;
  customUrl: string;
  thumbnailUrl: string;
  country: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  publishedAt: string;
  keywords: string;
}

export interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
}

export interface YouTubeChannelData {
  channel: YouTubeChannel;
  recentVideos: YouTubeVideo[];
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
  viewToSubRatio: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ytGet(endpoint: string, params: Record<string, string>): Promise<any | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const qs = new URLSearchParams({ key: apiKey, ...params }).toString();
  const url = `${YT_BASE}/${endpoint}?${qs}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[YouTube API] ${endpoint} returned ${res.status}`);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error(`[YouTube API] ${endpoint} failed:`, error);
    return null;
  }
}

// ─── Core functions ──────────────────────────────────────────────────────────

/**
 * Search for YouTube channels by keyword.
 * Costs: 100 quota units (search) + 1 unit (channel details) = 101 units for up to 50 channels
 */
export async function searchChannels(query: string, maxResults = 10): Promise<YouTubeChannel[]> {
  // Step 1: Search for channels (100 units)
  const searchData = await ytGet("search", {
    part: "snippet",
    type: "channel",
    q: query,
    maxResults: String(Math.min(maxResults, 50)),
    order: "relevance",
  });

  if (!searchData?.items?.length) return [];

  // Extract channel IDs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelIds = searchData.items
    .map((item: any) => item.snippet?.channelId || item.id?.channelId)
    .filter(Boolean);

  if (channelIds.length === 0) return [];

  // Step 2: Get full channel details (1 unit)
  return getChannelsByIds(channelIds);
}

/**
 * Get channel details by channel IDs (batch up to 50).
 * Costs: 1 quota unit regardless of how many IDs
 */
export async function getChannelsByIds(channelIds: string[]): Promise<YouTubeChannel[]> {
  const channelData = await ytGet("channels", {
    part: "snippet,statistics,brandingSettings",
    id: channelIds.join(","),
  });

  if (!channelData?.items?.length) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return channelData.items.map((ch: any) => {
    const snippet = ch.snippet || {};
    const stats = ch.statistics || {};
    const branding = ch.brandingSettings?.channel || {};

    return {
      channelId: ch.id,
      title: snippet.title || "",
      description: snippet.description || "",
      customUrl: snippet.customUrl || "",
      thumbnailUrl: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || "",
      country: snippet.country || branding.country || "",
      subscriberCount: parseInt(stats.subscriberCount || "0", 10),
      viewCount: parseInt(stats.viewCount || "0", 10),
      videoCount: parseInt(stats.videoCount || "0", 10),
      publishedAt: snippet.publishedAt || "",
      keywords: branding.keywords || "",
    };
  });
}

/**
 * Find a channel by name — searches and returns the best match.
 * Costs: 101 quota units
 */
export async function findChannelByName(name: string): Promise<YouTubeChannel | null> {
  const channels = await searchChannels(name, 5);
  if (channels.length === 0) return null;

  // Try to find exact or close match
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const exactMatch = channels.find((ch) => {
    const title = ch.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    const customUrl = (ch.customUrl || "").toLowerCase().replace(/[^a-z0-9@]/g, "").replace("@", "");
    return title === normalized || customUrl === normalized;
  });

  return exactMatch || channels[0];
}

/**
 * Get recent videos for a channel with stats.
 * Costs: 100 units (search) + 1 unit (video details) = 101 units
 */
export async function getRecentVideos(channelId: string, maxResults = 10): Promise<YouTubeVideo[]> {
  // Step 1: Search for recent videos from this channel (100 units)
  const searchData = await ytGet("search", {
    part: "snippet",
    channelId,
    type: "video",
    order: "date",
    maxResults: String(Math.min(maxResults, 50)),
  });

  if (!searchData?.items?.length) return [];

  // Extract video IDs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const videoIds = searchData.items
    .map((item: any) => item.id?.videoId)
    .filter(Boolean);

  if (videoIds.length === 0) return [];

  // Step 2: Get video statistics (1 unit)
  const videoData = await ytGet("videos", {
    part: "snippet,statistics,contentDetails",
    id: videoIds.join(","),
  });

  if (!videoData?.items?.length) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return videoData.items.map((v: any) => {
    const snippet = v.snippet || {};
    const stats = v.statistics || {};

    return {
      videoId: v.id,
      title: snippet.title || "",
      description: (snippet.description || "").slice(0, 300),
      publishedAt: snippet.publishedAt || "",
      thumbnailUrl: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || "",
      viewCount: parseInt(stats.viewCount || "0", 10),
      likeCount: parseInt(stats.likeCount || "0", 10),
      commentCount: parseInt(stats.commentCount || "0", 10),
      duration: v.contentDetails?.duration || "",
    };
  });
}

/**
 * Get full channel data with recent videos and engagement metrics.
 * Costs: 101 (find channel) + 101 (recent videos) = 202 quota units
 * At 10,000/day = ~49 full analyses per day
 */
export async function fetchYouTubeChannelData(channelName: string): Promise<YouTubeChannelData | null> {
  const channel = await findChannelByName(channelName);
  if (!channel) return null;

  const recentVideos = await getRecentVideos(channel.channelId, 10);

  // Calculate engagement metrics from real video data
  let avgViews = 0;
  let avgLikes = 0;
  let avgComments = 0;

  if (recentVideos.length > 0) {
    avgViews = Math.round(recentVideos.reduce((s, v) => s + v.viewCount, 0) / recentVideos.length);
    avgLikes = Math.round(recentVideos.reduce((s, v) => s + v.likeCount, 0) / recentVideos.length);
    avgComments = Math.round(recentVideos.reduce((s, v) => s + v.commentCount, 0) / recentVideos.length);
  }

  // Engagement rate = (avg likes + avg comments) / subscriber count * 100
  const engagementRate =
    channel.subscriberCount > 0
      ? ((avgLikes + avgComments) / channel.subscriberCount) * 100
      : 0;

  // View-to-subscriber ratio = avg views / subscribers * 100
  const viewToSubRatio =
    channel.subscriberCount > 0
      ? (avgViews / channel.subscriberCount) * 100
      : 0;

  return {
    channel,
    recentVideos,
    avgViews,
    avgLikes,
    avgComments,
    engagementRate: Math.round(engagementRate * 100) / 100,
    viewToSubRatio: Math.round(viewToSubRatio * 100) / 100,
  };
}

// ─── Formatting helpers ──────────────────────────────────────────────────────

export function formatCount(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export function engagementRating(rate: number): string {
  if (rate >= 8) return "Excellent";
  if (rate >= 4) return "Good";
  if (rate >= 2) return "Average";
  return "Low";
}

export function subscriberTier(subs: number): string {
  if (subs >= 10_000_000) return "Mega (10M+)";
  if (subs >= 1_000_000) return "Macro (1M-10M)";
  if (subs >= 100_000) return "Mid (100K-1M)";
  if (subs >= 10_000) return "Rising (10K-100K)";
  return "Micro (<10K)";
}

/**
 * Check if YouTube API key is configured
 */
export function hasYouTubeApiKey(): boolean {
  return !!process.env.YOUTUBE_API_KEY;
}
