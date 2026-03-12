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
      return NextResponse.redirect(new URL("/settings/accounts?error=instagram_denied", request.url));
    }

    const config = OAUTH_CONFIGS.instagram;
    // Exchange code for token
    const tokenRes = await fetch(config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: getClientId("instagram"),
        client_secret: getClientSecret("instagram"),
        grant_type: "authorization_code",
        redirect_uri: getCallbackUrl("instagram"),
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("[Instagram OAuth] Token exchange failed:", tokenData);
      return NextResponse.redirect(new URL("/settings/accounts?error=instagram_token", request.url));
    }

    // Get long-lived token
    const longLivedRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${getClientId("instagram")}&client_secret=${getClientSecret("instagram")}&fb_exchange_token=${tokenData.access_token}`
    );
    const longLivedData = await longLivedRes.json();
    const accessToken = longLivedData.access_token || tokenData.access_token;
    const expiresIn = longLivedData.expires_in || tokenData.expires_in;

    // Fetch Instagram profile via pages
    let accountId = "";
    let accountName = "";
    let accountAvatar = "";
    try {
      // Get pages, then get Instagram business account
      const pagesRes = await fetch(`https://graph.facebook.com/v21.0/me/accounts?access_token=${accessToken}`);
      const pagesData = await pagesRes.json();
      if (pagesData.data?.[0]) {
        const pageId = pagesData.data[0].id;
        const igRes = await fetch(`https://graph.facebook.com/v21.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`);
        const igData = await igRes.json();
        if (igData.instagram_business_account?.id) {
          const igId = igData.instagram_business_account.id;
          const profileRes = await fetch(`https://graph.instagram.com/${igId}?fields=id,username,profile_picture_url&access_token=${accessToken}`);
          const profile = await profileRes.json();
          accountId = profile.id || igId;
          accountName = profile.username || "";
          accountAvatar = profile.profile_picture_url || "";
        }
      }
    } catch {
      // Profile fetch is best-effort
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.redirect(new URL("/settings/accounts?error=user_not_found", request.url));
    }

    await prisma.socialAccount.upsert({
      where: { userId_platform: { userId: user.id, platform: "instagram" } },
      update: {
        accessToken: encrypt(accessToken),
        accountId,
        accountName,
        accountAvatar,
        tokenExpiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
        isActive: true,
        connectedAt: new Date(),
      },
      create: {
        userId: user.id,
        platform: "instagram",
        accessToken: encrypt(accessToken),
        accountId,
        accountName,
        accountAvatar,
        scope: OAUTH_CONFIGS.instagram.scopes.join(","),
        tokenExpiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
      },
    });

    return NextResponse.redirect(new URL("/settings/accounts?connected=instagram", request.url));
  } catch (error) {
    console.error("[Instagram OAuth callback]", error);
    return NextResponse.redirect(new URL("/settings/accounts?error=instagram_error", request.url));
  }
}
