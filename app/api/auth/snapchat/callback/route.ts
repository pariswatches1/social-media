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
      return NextResponse.redirect(new URL("/settings/accounts?error=snapchat_denied", request.url));
    }

    const codeVerifier = request.cookies.get("snapchat_code_verifier")?.value;
    if (!codeVerifier) {
      return NextResponse.redirect(new URL("/settings/accounts?error=snapchat_state", request.url));
    }

    const state = searchParams.get("state");
    const storedState = request.cookies.get("oauth_state_snapchat")?.value;
    if (!state || !storedState || state !== storedState) {
      return NextResponse.redirect(new URL("/settings/accounts?error=snapchat_state", request.url));
    }

    const config = OAUTH_CONFIGS.snapchat;
    const clientId = getClientId("snapchat");
    const clientSecret = getClientSecret("snapchat");

    // Snapchat uses Basic auth for token exchange
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const tokenRes = await fetch(config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        redirect_uri: getCallbackUrl("snapchat"),
        code_verifier: codeVerifier,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("[Snapchat OAuth] Token exchange failed:", tokenData);
      return NextResponse.redirect(new URL("/settings/accounts?error=snapchat_token", request.url));
    }

    // Fetch Snapchat profile
    let accountId = "";
    let accountName = "";
    let accountAvatar = "";
    try {
      const profileRes = await fetch("https://kit.snapchat.com/v1/me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profileData = await profileRes.json();
      if (profileData.data) {
        accountId = profileData.data.me?.externalId || "";
        accountName = profileData.data.me?.displayName || "";
        accountAvatar = profileData.data.me?.bitmoji?.avatar || "";
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error("[Snapchat OAuth] profile fetch failed:", err);
      accountId = tokenData.scope || "snapchat_user";
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.redirect(new URL("/settings/accounts?error=user_not_found", request.url));
    }

    await prisma.socialAccount.upsert({
      where: { userId_platform: { userId: user.id, platform: "snapchat" } },
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
        platform: "snapchat",
        accessToken: encrypt(tokenData.access_token),
        refreshToken: tokenData.refresh_token ? encrypt(tokenData.refresh_token) : null,
        accountId,
        accountName,
        accountAvatar,
        scope: config.scopes.join(","),
        tokenExpiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
      },
    });

    const response = NextResponse.redirect(new URL("/settings/accounts?connected=snapchat", request.url));
    response.cookies.delete("snapchat_code_verifier");
    response.cookies.delete("oauth_state_snapchat");
    return response;
  } catch (error) {
    console.error("[Snapchat OAuth callback]", error);
    return NextResponse.redirect(new URL("/settings/accounts?error=snapchat_error", request.url));
  }
}
