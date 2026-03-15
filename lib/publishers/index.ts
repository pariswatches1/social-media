import { publishToTwitter } from "./twitter";
import { publishToLinkedIn } from "./linkedin";
import { publishToInstagram } from "./instagram";
import { publishToTikTok } from "./tiktok";
import { publishToFacebook } from "./facebook";
import { publishToReddit } from "./reddit";

export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  error?: string;
}

export interface PublishInput {
  content: string;
  hashtags?: string[];
  mediaUrls?: string[];
  targetSubreddit?: string;
}

/**
 * Publish a post to a social platform.
 */
export async function publishPost(
  platform: string,
  input: PublishInput,
  accessToken: string,
): Promise<PublishResult> {
  switch (platform) {
    case "twitter":
      return publishToTwitter(input, accessToken);
    case "linkedin":
      return publishToLinkedIn(input, accessToken);
    case "instagram":
      return publishToInstagram(input, accessToken);
    case "tiktok":
      return publishToTikTok(input, accessToken);
    case "facebook":
      return publishToFacebook(input, accessToken);
    case "reddit":
      return publishToReddit(input, accessToken);
    default:
      return { success: false, error: `Unknown platform: ${platform}` };
  }
}
