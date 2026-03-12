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
      return NextResponse.redirect(new URL("/settings/accounts?error=twitter_denied", request.url));
    }

    const codeVerifier = request.cookies.get("twitter_code_verifier")?.value;
    if (!codeVerifier) {
      return NextResponse.redirect(new URL("/settings/accounts?error=twitter_state", request.url));
    }

    const config = OAUTH_CONFIGS.twitter;
    const credentials = Buffer.from(`${getClientId("twitter")}:${getClientSecret("twitter")}`).toString("base64");

    const tokenRes = await fetch(config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: getCallbackUrl("twitter"),
        code_verifier: codeVerifier,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("[Twitter OAuth] Token exchange failed:", tokenData);
      return NextResponse.redirect(new URL("/settings/accounts?error=twitter_token", request.url));
    }

    // Fetch profile
    let accountId = "";
    let accountName = "";
    let accountAvatar = "";
    try {
      const profileRes = await fetch(config.profileUrl!, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profileData = await profileRes.json();
      if (profileData.data) {
        accountId = profileData.data.id;
        accountName = `@${profileData.data.username}`;
        accountAvatar = profileData.data.profile_image_url || "";
      }
    } catch {
      // best-effort
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.redirect(new URL("/settings/accounts?error=user_not_found", request.url));
    }

    await prisma.socialAccount.upsert({
      where: { userId_platform: { userId: user.id, platform: "twitter" } },
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
        platform: "twitter",
        accessToken: encrypt(tokenData.access_token),
        refreshToken: tokenData.refresh_token ? encrypt(tokenData.refresh_token) : null,
        accountId,
        accountName,
        accountAvatar,
        scope: config.scopes.join(" "),
        tokenExpiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
      },
    });

    const response = NextResponse.redirect(new URL("/settings/accounts?connected=twitter", request.url));
    response.cookies.delete("twitter_code_verifier");
    return response;
  } catch (error) {
    console.error("[Twitter OAuth callback]", error);
    return NextResponse.redirect(new URL("/settings/accounts?error=twitter_error", request.url));
  }
}
