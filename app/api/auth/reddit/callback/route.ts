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
      return NextResponse.redirect(new URL("/settings/accounts?error=reddit_denied", request.url));
    }

    const state = searchParams.get("state");
    const storedState = request.cookies.get("oauth_state_reddit")?.value;
    if (!state || !storedState || state !== storedState) {
      return NextResponse.redirect(new URL("/settings/accounts?error=reddit_state", request.url));
    }

    const config = OAUTH_CONFIGS.reddit;
    const basicAuth = Buffer.from(`${getClientId("reddit")}:${getClientSecret("reddit")}`).toString("base64");

    const tokenRes = await fetch(config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
        "User-Agent": "SIGNAL/1.0",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: getCallbackUrl("reddit"),
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("[Reddit OAuth] Token exchange failed:", tokenData);
      return NextResponse.redirect(new URL("/settings/accounts?error=reddit_token", request.url));
    }

    // Fetch Reddit profile
    let accountId = "";
    let accountName = "";
    let accountAvatar = "";
    try {
      const profileRes = await fetch(config.profileUrl!, {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "User-Agent": "SIGNAL/1.0",
        },
      });
      const profile = await profileRes.json();
      accountId = profile.id || "";
      accountName = profile.name || "";
      accountAvatar = profile.icon_img?.split("?")[0] || profile.snoovatar_img || "";
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error("[Reddit OAuth] profile fetch failed:", err);
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.redirect(new URL("/settings/accounts?error=user_not_found", request.url));
    }

    await prisma.socialAccount.upsert({
      where: { userId_platform: { userId: user.id, platform: "reddit" } },
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
        platform: "reddit",
        accessToken: encrypt(tokenData.access_token),
        refreshToken: tokenData.refresh_token ? encrypt(tokenData.refresh_token) : null,
        accountId,
        accountName,
        accountAvatar,
        scope: config.scopes.join(" "),
        tokenExpiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
      },
    });

    const response = NextResponse.redirect(new URL("/settings/accounts?connected=reddit", request.url));
    response.cookies.delete("oauth_state_reddit");
    return response;
  } catch (error) {
    console.error("[Reddit OAuth callback]", error);
    return NextResponse.redirect(new URL("/settings/accounts?error=reddit_error", request.url));
  }
}
