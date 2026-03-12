import { PublishInput, PublishResult } from "./index";

export async function publishToTikTok(input: PublishInput, accessToken: string): Promise<PublishResult> {
  try {
    const videoUrl = input.mediaUrls?.[0];
    if (!videoUrl) {
      return { success: false, error: "TikTok requires a video URL to publish" };
    }

    const caption = input.hashtags?.length
      ? `${input.content} ${input.hashtags.map((t) => `#${t}`).join(" ")}`
      : input.content;

    // TikTok Content Posting API — initiate upload
    const initRes = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        post_info: {
          title: caption.slice(0, 150),
          privacy_level: "PUBLIC_TO_EVERYONE",
        },
        source_info: {
          source: "PULL_FROM_URL",
          video_url: videoUrl,
        },
      }),
    });

    const initData = await initRes.json();
    if (initData.error?.code !== "ok" && !initData.data?.publish_id) {
      return {
        success: false,
        error: initData.error?.message || "TikTok publish init failed",
      };
    }

    return { success: true, platformPostId: initData.data?.publish_id };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "TikTok publish failed" };
  }
}
