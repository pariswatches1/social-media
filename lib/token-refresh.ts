import prisma from "./prisma";
import { encrypt, decrypt } from "./encrypt";
import { OAUTH_CONFIGS, getClientId, getClientSecret } from "./oauth";

/**
 * Check if a token is expired (or expiring in the next 5 minutes).
 */
export function isTokenExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false; // No expiry means long-lived
  const bufferMs = 5 * 60 * 1000; // 5 minute buffer
  return new Date(expiresAt.getTime() - bufferMs) <= new Date();
}

/**
 * Refresh an access token using the platform's refresh token flow.
 * Returns the new access token, or null if refresh failed.
 */
export async function refreshAccessToken(
  socialAccountId: string,
  platform: string,
  refreshTokenEncrypted: string
): Promise<string | null> {
  const config = OAUTH_CONFIGS[platform];
  if (!config) return null;

  const refreshToken = decrypt(refreshTokenEncrypted);
  if (!refreshToken) return null;

  try {
    let tokenRes: Response;

    if (platform === "twitter") {
      const basicAuth = Buffer.from(`${getClientId("twitter")}:${getClientSecret("twitter")}`).toString("base64");
      tokenRes = await fetch(config.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basicAuth}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });
    } else if (platform === "reddit") {
      const basicAuth = Buffer.from(`${getClientId("reddit")}:${getClientSecret("reddit")}`).toString("base64");
      tokenRes = await fetch(config.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basicAuth}`,
          "User-Agent": "SIGNAL/1.0",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });
    } else if (platform === "tiktok") {
      tokenRes = await fetch(config.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key: getClientId("tiktok"),
          client_secret: getClientSecret("tiktok"),
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });
    } else if (platform === "linkedin") {
      tokenRes = await fetch(config.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: getClientId("linkedin"),
          client_secret: getClientSecret("linkedin"),
        }),
      });
    } else {
      // Instagram / Facebook — use long-lived token exchange
      tokenRes = await fetch(
        `https://graph.facebook.com/v21.0/oauth/access_token?` +
        new URLSearchParams({
          grant_type: "fb_exchange_token",
          client_id: getClientId(platform),
          client_secret: getClientSecret(platform),
          fb_exchange_token: refreshToken,
        }),
        { method: "GET" }
      );
    }

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error(`[Token Refresh] ${platform} refresh failed:`, tokenData);
      return null;
    }

    // Update the stored token
    await prisma.socialAccount.update({
      where: { id: socialAccountId },
      data: {
        accessToken: encrypt(tokenData.access_token),
        refreshToken: tokenData.refresh_token ? encrypt(tokenData.refresh_token) : undefined,
        tokenExpiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : undefined,
      },
    });

    return tokenData.access_token;
  } catch (err) {
    console.error(`[Token Refresh] ${platform} error:`, err);
    return null;
  }
}
