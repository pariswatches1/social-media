import { PublishInput, PublishResult } from "./index";

export async function publishToLinkedIn(input: PublishInput, accessToken: string): Promise<PublishResult> {
  try {
    // Get the user's LinkedIn URN
    const meRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const me = await meRes.json();
    if (!me.sub) {
      return { success: false, error: "Could not resolve LinkedIn user ID" };
    }

    const authorUrn = `urn:li:person:${me.sub}`;
    const text = input.hashtags?.length
      ? `${input.content}\n\n${input.hashtags.map((t) => `#${t}`).join(" ")}`
      : input.content;

    const postBody = {
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(postBody),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.message || `LinkedIn API error ${res.status}` };
    }

    const postId = res.headers.get("x-restli-id") || "";
    return { success: true, platformPostId: postId };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "LinkedIn publish failed" };
  }
}
