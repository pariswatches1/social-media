import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { decrypt } from "@/lib/encrypt";
import { publishPost } from "@/lib/publishers";
import { isTokenExpired, refreshAccessToken } from "@/lib/token-refresh";

const MAX_RETRIES = 3;

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized triggers
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find scheduled posts that are due + failed posts eligible for retry
    const duePosts = await prisma.scheduledPost.findMany({
      where: {
        OR: [
          { status: "SCHEDULED", scheduledFor: { lte: now } },
          { status: "FAILED" },
        ],
      },
      include: {
        user: { include: { socialAccounts: true } },
        publishLogs: { orderBy: { attemptedAt: "desc" }, take: 1 },
      },
      take: 50,
    });

    const results: { postId: string; platform: string; success: boolean; error?: string }[] = [];

    for (const post of duePosts) {
      // Skip failed posts that have exceeded retry limit
      if (post.status === "FAILED") {
        const attemptCount = await prisma.publishLog.count({
          where: { scheduledPostId: post.id },
        });
        if (attemptCount >= MAX_RETRIES) {
          continue; // Max retries reached, skip
        }
      }

      const socialAccount = post.user.socialAccounts.find(
        (sa) => sa.platform === post.platform && sa.isActive
      );

      if (!socialAccount) {
        await prisma.scheduledPost.update({
          where: { id: post.id },
          data: { status: "FAILED" },
        });
        await prisma.publishLog.create({
          data: {
            scheduledPostId: post.id,
            platform: post.platform,
            status: "FAILED",
            errorMessage: `No active ${post.platform} account connected`,
            completedAt: new Date(),
          },
        });
        results.push({ postId: post.id, platform: post.platform, success: false, error: "No account" });
        continue;
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
          await prisma.publishLog.create({
            data: {
              scheduledPostId: post.id,
              platform: post.platform,
              status: "FAILED",
              errorMessage: `Token expired and refresh failed for ${post.platform}. Please reconnect your account.`,
              completedAt: new Date(),
            },
          });
          await prisma.scheduledPost.update({
            where: { id: post.id },
            data: { status: "FAILED" },
          });
          results.push({ postId: post.id, platform: post.platform, success: false, error: "Token refresh failed" });
          continue;
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

      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: {
          status: result.success ? "PUBLISHED" : "FAILED",
          publishedAt: result.success ? new Date() : undefined,
        },
      });

      results.push({
        postId: post.id,
        platform: post.platform,
        success: result.success,
        error: result.error,
      });
    }

    return NextResponse.json({
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error("[Cron Publish]", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
