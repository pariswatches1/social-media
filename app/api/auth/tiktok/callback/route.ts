import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { encrypt } from "@/lib/encrypt";
import { OAUTH_CONFIGS, getClientId, getClientSecret, getCallbackUrl } from "@/lib/oauth";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error || !code) {
      return NextResponse.redirect(new URL("/settings/accounts?error=tiktok_denied", request.url));
    }

    const codeVerifier = request.cookies.get("tiktok_code_verifier")?.value;
    if (!codeVerifier) {
      return NextResponse.redirect(new URL("/settings/accounts?error=tiktok_state", request.url));
    }

    const state = searchParams.get("state");
    const storedState = request.cookies.get("oauth_state_tiktok")?.value;
    if (!state || !storedState || state !== storedState) {
      return NextResponse.redirect(new URL("/settings/accounts?error=tiktok_state", request.url));
    }

    const config = OAUTH_CONFIGS.tiktok;
    const tokenRes = await fetch(config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: getClientId("tiktok"),
        client_secret: getClientSecret("tiktok"),
        code,
        grant_type: "authorization_code",
        redirect_uri: getCallbackUrl("tiktok"),
        code_verifier: codeVerifier,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("[TikTok OAuth] Token exchange failed:", tokenData);
      return NextResponse.redirect(new URL("/settings/accounts?error=tiktok_token", request.url));
    }

    // Fetch TikTok profile
    let accountId = "";
    let accountName = "";
    let accountAvatar = "";
    try {
      const profileRes = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profileData = await profileRes.json();
      if (profileData.data?.user) {
        accountId = profileData.data.user.open_id || tokenData.open_id || "";
        accountName = profileData.data.user.display_name || "";
        accountAvatar = profileData.data.user.avatar_url || "";
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error("[TikTok OAuth] profile fetch failed:", err);
      accountId = tokenData.open_id || "";
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.redirect(new URL("/settings/accounts?error=user_not_found", request.url));
    }

    await prisma.socialAccount.upsert({
      where: { userId_platform: { userId: user.id, platform: "tiktok" } },
      update: {
        accessToken: encrypt(tokenData.access_token),
        refreshToken: tokenData.refresh_token ? encrypt(tokenData.refresh_token) : null,
        accountId,
        accountName,
        accountAvatar,
        tokenExpiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
        isActive: true,
        connectedAt: new Date(),
      },
      create: {
        userId: user.id,
        platform: "tiktok",
        accessToken: encrypt(tokenData.access_token),
        refreshToken: tokenData.refresh_token ? encrypt(tokenData.refresh_token) : null,
        accountId,
        accountName,
        accountAvatar,
        scope: config.scopes.join(","),
        tokenExpiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
      },
    });

    const response = NextResponse.redirect(new URL("/settings/accounts?connected=tiktok", request.url));
    response.cookies.delete("tiktok_code_verifier");
    response.cookies.delete("oauth_state_tiktok");
    return response;
  } catch (error) {
    console.error("[TikTok OAuth callback]", error);
    return NextResponse.redirect(new URL("/settings/accounts?error=tiktok_error", request.url));
  }
}
