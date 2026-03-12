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
      return NextResponse.redirect(new URL("/settings/accounts?error=linkedin_denied", request.url));
    }

    const config = OAUTH_CONFIGS.linkedin;
    const tokenRes = await fetch(config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: getCallbackUrl("linkedin"),
        client_id: getClientId("linkedin"),
        client_secret: getClientSecret("linkedin"),
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("[LinkedIn OAuth] Token exchange failed:", tokenData);
      return NextResponse.redirect(new URL("/settings/accounts?error=linkedin_token", request.url));
    }

    // Fetch profile using OpenID userinfo
    let accountId = "";
    let accountName = "";
    let accountAvatar = "";
    try {
      const profileRes = await fetch(config.profileUrl!, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profile = await profileRes.json();
      accountId = profile.sub || "";
      accountName = profile.name || "";
      accountAvatar = profile.picture || "";
    } catch {
      // best-effort
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.redirect(new URL("/settings/accounts?error=user_not_found", request.url));
    }

    await prisma.socialAccount.upsert({
      where: { userId_platform: { userId: user.id, platform: "linkedin" } },
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
        platform: "linkedin",
        accessToken: encrypt(tokenData.access_token),
        refreshToken: tokenData.refresh_token ? encrypt(tokenData.refresh_token) : null,
        accountId,
        accountName,
        accountAvatar,
        scope: config.scopes.join(" "),
        tokenExpiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
      },
    });

    return NextResponse.redirect(new URL("/settings/accounts?connected=linkedin", request.url));
  } catch (error) {
    console.error("[LinkedIn OAuth callback]", error);
    return NextResponse.redirect(new URL("/settings/accounts?error=linkedin_error", request.url));
  }
}
