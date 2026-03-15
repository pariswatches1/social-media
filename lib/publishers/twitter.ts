import { PublishInput, PublishResult } from "./index";

export async function publishToTwitter(input: PublishInput, accessToken: string): Promise<PublishResult> {
  try {
    const text = input.hashtags?.length
      ? `${input.content}\n\n${input.hashtags.map((t) => `#${t}`).join(" ")}`
      : input.content;

    const body: Record<string, unknown> = { text };

    // Twitter media upload requires a separate endpoint — for v1 we send text-only
    const res = await fetch("https://api.x.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.detail || data.title || JSON.stringify(data) };
    }

    return { success: true, platformPostId: data.data?.id };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Twitter publish failed" };
  }
}
