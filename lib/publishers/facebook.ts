import { PublishInput, PublishResult } from "./index";

export async function publishToFacebook(input: PublishInput, accessToken: string): Promise<PublishResult> {
  try {
    // accessToken here is the Page access token (stored during OAuth callback)
    const message = input.hashtags?.length
      ? `${input.content}\n\n${input.hashtags.map((t) => `#${t}`).join(" ")}`
      : input.content;

    // Get Page ID from the token
    const meRes = await fetch(
      `https://graph.facebook.com/v21.0/me?access_token=${accessToken}`
    );
    const meData = await meRes.json();
    const pageId = meData.id;
    if (!pageId) {
      return { success: false, error: "Could not resolve Facebook Page ID" };
    }

    const body: Record<string, string> = { message, access_token: accessToken };

    // If there's an image, attach it as a link (photo post)
    if (input.mediaUrls?.[0]) {
      body.url = input.mediaUrls[0];
      const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error?.message || `Facebook API error ${res.status}` };
      }
      return { success: true, platformPostId: data.post_id || data.id };
    }

    // Text-only feed post
    const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error?.message || `Facebook API error ${res.status}` };
    }

    return { success: true, platformPostId: data.id };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Facebook publish failed" };
  }
}
