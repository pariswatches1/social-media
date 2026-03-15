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
      return NextResponse.redirect(new URL("/settings/accounts?error=facebook_denied", request.url));
    }

    const state = searchParams.get("state");
    const storedState = request.cookies.get("oauth_state_facebook")?.value;
    if (!state || !storedState || state !== storedState) {
      return NextResponse.redirect(new URL("/settings/accounts?error=facebook_state", request.url));
    }

    const config = OAUTH_CONFIGS.facebook;
    const tokenRes = await fetch(
      `${config.tokenUrl}?${new URLSearchParams({
        client_id: getClientId("facebook"),
        client_secret: getClientSecret("facebook"),
        redirect_uri: getCallbackUrl("facebook"),
        code,
      })}`,
      { method: "GET" }
    );

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("[Facebook OAuth] Token exchange failed:", tokenData);
      return NextResponse.redirect(new URL("/settings/accounts?error=facebook_token", request.url));
    }

    // Fetch Facebook profile
    let accountId = "";
    let accountName = "";
    let accountAvatar = "";
    try {
      const profileRes = await fetch(config.profileUrl!, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profile = await profileRes.json();
      accountId = profile.id || "";
      accountName = profile.name || "";
      accountAvatar = profile.picture?.data?.url || "";
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error("[Facebook OAuth] profile fetch failed:", err);
    }

    // Get the page token for posting — Facebook requires page access tokens
    let pageAccessToken = tokenData.access_token;
    let pageId = "";
    try {
      const pagesRes = await fetch(
        `https://graph.facebook.com/v21.0/me/accounts?access_token=${tokenData.access_token}`
      );
      const pagesData = await pagesRes.json();
      if (pagesData.data && pagesData.data.length > 0) {
        pageAccessToken = pagesData.data[0].access_token;
        pageId = pagesData.data[0].id;
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error("[Facebook OAuth] pages lookup failed:", err);
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.redirect(new URL("/settings/accounts?error=user_not_found", request.url));
    }

    await prisma.socialAccount.upsert({
      where: { userId_platform: { userId: user.id, platform: "facebook" } },
      update: {
        accessToken: encrypt(pageAccessToken),
        refreshToken: null,
        accountId: pageId || accountId,
        accountName,
        accountAvatar,
        tokenExpiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
        isActive: true,
        connectedAt: new Date(),
      },
      create: {
        userId: user.id,
        platform: "facebook",
        accessToken: encrypt(pageAccessToken),
        refreshToken: null,
        accountId: pageId || accountId,
        accountName,
        accountAvatar,
        scope: config.scopes.join(","),
        tokenExpiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
      },
    });

    const response = NextResponse.redirect(new URL("/settings/accounts?connected=facebook", request.url));
    response.cookies.delete("oauth_state_facebook");
    return response;
  } catch (error) {
    console.error("[Facebook OAuth callback]", error);
    return NextResponse.redirect(new URL("/settings/accounts?error=facebook_error", request.url));
  }
}
