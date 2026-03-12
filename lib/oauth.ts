/**
 * OAuth configuration for each platform.
 * Each platform has its own authorization URL, token URL, scopes, and profile endpoint.
 */

export interface OAuthConfig {
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientIdEnv: string;
  clientSecretEnv: string;
  profileUrl?: string;
  /** Some platforms use Basic auth for token exchange */
  useBasicAuth?: boolean;
  /** Reddit needs a custom User-Agent */
  customHeaders?: Record<string, string>;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function getCallbackUrl(platform: string): string {
  return `${APP_URL}/api/auth/${platform}/callback`;
}

export const OAUTH_CONFIGS: Record<string, OAuthConfig> = {
  instagram: {
    authUrl: "https://www.facebook.com/v21.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v21.0/oauth/access_token",
    scopes: ["instagram_basic", "instagram_content_publish", "pages_show_list", "pages_read_engagement"],
    clientIdEnv: "INSTAGRAM_CLIENT_ID",
    clientSecretEnv: "INSTAGRAM_CLIENT_SECRET",
    profileUrl: "https://graph.instagram.com/me?fields=id,username,account_type,profile_picture_url",
  },
  twitter: {
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.x.com/2/oauth2/token",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    clientIdEnv: "TWITTER_CLIENT_ID",
    clientSecretEnv: "TWITTER_CLIENT_SECRET",
    profileUrl: "https://api.x.com/2/users/me?user.fields=profile_image_url",
    useBasicAuth: true,
  },
  linkedin: {
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    scopes: ["openid", "profile", "w_member_social"],
    clientIdEnv: "LINKEDIN_CLIENT_ID",
    clientSecretEnv: "LINKEDIN_CLIENT_SECRET",
    profileUrl: "https://api.linkedin.com/v2/userinfo",
  },
  tiktok: {
    authUrl: "https://www.tiktok.com/v2/auth/authorize",
    tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
    scopes: ["user.info.basic", "video.publish"],
    clientIdEnv: "TIKTOK_CLIENT_ID",
    clientSecretEnv: "TIKTOK_CLIENT_SECRET",
  },
  facebook: {
    authUrl: "https://www.facebook.com/v21.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v21.0/oauth/access_token",
    scopes: ["pages_manage_posts", "pages_read_engagement", "pages_show_list"],
    clientIdEnv: "FACEBOOK_CLIENT_ID",
    clientSecretEnv: "FACEBOOK_CLIENT_SECRET",
    profileUrl: "https://graph.facebook.com/me?fields=id,name,picture",
  },
  reddit: {
    authUrl: "https://www.reddit.com/api/v1/authorize",
    tokenUrl: "https://www.reddit.com/api/v1/access_token",
    scopes: ["submit", "identity", "read"],
    clientIdEnv: "REDDIT_CLIENT_ID",
    clientSecretEnv: "REDDIT_CLIENT_SECRET",
    profileUrl: "https://oauth.reddit.com/api/v1/me",
    useBasicAuth: true,
    customHeaders: { "User-Agent": "SIGNAL/1.0" },
  },
};

export function getClientId(platform: string): string {
  const config = OAUTH_CONFIGS[platform];
  if (!config) throw new Error(`Unknown platform: ${platform}`);
  return process.env[config.clientIdEnv] || "";
}

export function getClientSecret(platform: string): string {
  const config = OAUTH_CONFIGS[platform];
  if (!config) throw new Error(`Unknown platform: ${platform}`);
  return process.env[config.clientSecretEnv] || "";
}
