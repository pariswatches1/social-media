import { PublishInput, PublishResult } from "./index";

export async function publishToInstagram(input: PublishInput, accessToken: string): Promise<PublishResult> {
  try {
    // Instagram Graph API requires a media container, then publish.
    // For text-only posts Instagram requires an image — we'll handle image_url if provided.
    const imageUrl = input.mediaUrls?.[0];
    if (!imageUrl) {
      return { success: false, error: "Instagram requires at least one image URL to publish" };
    }

    const caption = input.hashtags?.length
      ? `${input.content}\n\n${input.hashtags.map((t) => `#${t}`).join(" ")}`
      : input.content;

    // Step 1: Get Instagram Business Account ID via Pages
    const pagesRes = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?access_token=${accessToken}`
    );
    const pagesData = await pagesRes.json();
    const page = pagesData.data?.[0];
    if (!page) {
      return { success: false, error: "No Facebook Page found for this account" };
    }

    const igRes = await fetch(
      `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${accessToken}`
    );
    const igData = await igRes.json();
    const igAccountId = igData.instagram_business_account?.id;
    if (!igAccountId) {
      return { success: false, error: "No Instagram Business account linked to your Facebook Page" };
    }

    // Step 2: Create media container
    const containerRes = await fetch(
      `https://graph.facebook.com/v21.0/${igAccountId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: imageUrl,
          caption,
          access_token: accessToken,
        }),
      }
    );
    const containerData = await containerRes.json();
    if (!containerData.id) {
      return { success: false, error: containerData.error?.message || "Failed to create media container" };
    }

    // Step 3: Publish the container
    const publishRes = await fetch(
      `https://graph.facebook.com/v21.0/${igAccountId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: containerData.id,
          access_token: accessToken,
        }),
      }
    );
    const publishData = await publishRes.json();
    if (!publishData.id) {
      return { success: false, error: publishData.error?.message || "Failed to publish to Instagram" };
    }

    return { success: true, platformPostId: publishData.id };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Instagram publish failed" };
  }
}
