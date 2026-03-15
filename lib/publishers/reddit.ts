import { PublishInput, PublishResult } from "./index";

export async function publishToReddit(input: PublishInput, accessToken: string): Promise<PublishResult> {
  try {
    const subreddit = input.targetSubreddit;
    if (!subreddit) {
      return { success: false, error: "Reddit requires a target subreddit" };
    }

    const title = input.content.slice(0, 300);
    const text = input.hashtags?.length
      ? `${input.content}\n\n${input.hashtags.map((t) => `#${t}`).join(" ")}`
      : input.content;

    const body = new URLSearchParams({
      sr: subreddit,
      kind: "self",
      title,
      text,
      api_type: "json",
    });

    const res = await fetch("https://oauth.reddit.com/api/submit", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "SIGNAL/1.0",
      },
      body,
    });

    const data = await res.json();
    if (data.json?.errors?.length) {
      return { success: false, error: data.json.errors.map((e: string[]) => e.join(": ")).join("; ") };
    }

    const postUrl = data.json?.data?.url || data.json?.data?.name || "";
    return { success: true, platformPostId: postUrl };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Reddit publish failed" };
  }
}
