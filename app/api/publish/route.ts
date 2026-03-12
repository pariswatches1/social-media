import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { decrypt } from "@/lib/encrypt";
import { publishPost } from "@/lib/publishers";
import { logActivity } from "@/lib/activity";
import { isTokenExpired, refreshAccessToken } from "@/lib/token-refresh";
import { ensureUser } from "@/lib/ensure-user";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(clerkId);

    const { scheduledPostId } = await request.json();
    if (!scheduledPostId) {
      return NextResponse.json({ error: "scheduledPostId is required" }, { status: 400 });
    }

    const post = await prisma.scheduledPost.findUnique({
      where: { id: scheduledPostId },
    });

    if (!post || post.userId !== user.id) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Get the social account for this platform
    const socialAccount = await prisma.socialAccount.findUnique({
      where: { userId_platform: { userId: user.id, platform: post.platform } },
    });

    if (!socialAccount || !socialAccount.isActive) {
      return NextResponse.json(
        { error: `No active ${post.platform} account connected` },
        { status: 400 }
      );
    }

    // Check token expiry and refresh if needed
    let accessToken: string;
    if (isTokenExpired(socialAccount.tokenExpiresAt) && socialAccount.refreshToken) {
      const newToken = await refreshAccessToken(
        socialAccount.id,
        post.platform,
        socialAccount.refreshToken
      );
      if (!newToken) {
        return NextResponse.json(
          { error: `Your ${post.platform} token has expired. Please reconnect your account in Settings > Accounts.` },
          { status: 400 }
        );
      }
      accessToken = newToken;
    } else {
      accessToken = decrypt(socialAccount.accessToken);
    }

    let hashtags: string[] = [];
    try { hashtags = JSON.parse(post.hashtags); } catch { /* empty */ }

    let mediaUrls: string[] = [];
    try { mediaUrls = JSON.parse(post.mediaUrls); } catch { /* empty */ }

    const result = await publishPost(post.platform, {
      content: post.content,
      hashtags,
      mediaUrls,
    }, accessToken);

    // Create publish log
    await prisma.publishLog.create({
      data: {
        scheduledPostId: post.id,
        platform: post.platform,
        status: result.success ? "SUCCESS" : "FAILED",
        platformPostId: result.platformPostId || null,
        errorMessage: result.error || null,
        completedAt: new Date(),
      },
    });

    // Update post status
    await prisma.scheduledPost.update({
      where: { id: post.id },
      data: {
        status: result.success ? "PUBLISHED" : "FAILED",
        publishedAt: result.success ? new Date() : undefined,
      },
    });

    if (result.success) {
      await logActivity(user.id, "CONTENT_PUBLISHED", `Published to ${post.platform}`, {
        postId: post.id,
        platform: post.platform,
        platformPostId: result.platformPostId,
      });
    }

    return NextResponse.json({
      success: result.success,
      platformPostId: result.platformPostId,
      error: result.error,
    });
  } catch (error) {
    console.error("[Publish API]", error);
    return NextResponse.json({ error: "Publish failed" }, { status: 500 });
  }
}
