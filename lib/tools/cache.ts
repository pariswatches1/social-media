import { fetchInstagramData, type InstagramData } from "@/lib/instagram-api";

const cache = new Map<string, { data: InstagramData; expiresAt: number }>();
const TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function getCachedInstagramData(handle: string): Promise<InstagramData> {
  const key = handle.toLowerCase().replace(/^@/, "").trim();
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && now < cached.expiresAt) {
    return cached.data;
  }

  const data = await fetchInstagramData(key);
  cache.set(key, { data, expiresAt: now + TTL });
  return data;
}
