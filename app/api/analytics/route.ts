import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { ensureUser } from "@/lib/ensure-user";

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(clerkId);
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30d";

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (range) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "12m":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Fetch real data from multiple sources in parallel
    const [
      publishedPosts,
      campaignCount,
      activeCampaigns,
      creatorCount,
      recentActivity,
      socialAccounts,
    ] = await Promise.all([
      // Published posts with their logs
      prisma.scheduledPost.findMany({
        where: {
          userId: user.id,
          status: "PUBLISHED",
          publishedAt: { gte: startDate },
        },
        include: { publishLogs: true },
        orderBy: { publishedAt: "desc" },
      }),
      // Total campaigns
      prisma.campaign.count({ where: { userId: user.id } }),
      // Active campaigns
      prisma.campaign.count({
        where: { userId: user.id, status: "ACTIVE" },
      }),
      // Creators in user's lists
      prisma.creatorListMember.count({
        where: { list: { userId: user.id } },
      }),
      // Recent activity for content performance
      prisma.activity.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      // Connected social accounts
      prisma.socialAccount.findMany({
        where: { userId: user.id, isActive: true },
        select: { platform: true, accountName: true },
      }),
    ]);

    // Calculate overview stats
    const totalPublished = publishedPosts.length;
    const successfulPublishes = publishedPosts.filter((p) =>
      p.publishLogs.some((l) => l.status === "SUCCESS")
    ).length;
    const publishRate =
      totalPublished > 0
        ? Math.round((successfulPublishes / totalPublished) * 100)
        : 0;

    // Platform breakdown from published posts
    const platformCounts: Record<string, number> = {};
    publishedPosts.forEach((post) => {
      const p = post.platform.toLowerCase();
      platformCounts[p] = (platformCounts[p] || 0) + 1;
    });

    const totalPlatformPosts = Object.values(platformCounts).reduce(
      (a, b) => a + b,
      0
    );
    const platformBreakdown = Object.entries(platformCounts)
      .map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count,
        pct:
          totalPlatformPosts > 0
            ? Math.round((count / totalPlatformPosts) * 100)
            : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Top content — last 5 published posts
    const topContent = publishedPosts.slice(0, 5).map((post) => ({
      id: post.id,
      text: post.content.slice(0, 120),
      platform: post.platform,
      publishedAt: post.publishedAt,
      status: post.publishLogs[0]?.status || "UNKNOWN",
    }));

    // Activity type breakdown
    const activityCounts: Record<string, number> = {};
    recentActivity.forEach((a) => {
      activityCounts[a.type] = (activityCounts[a.type] || 0) + 1;
    });

    return NextResponse.json({
      overview: {
        totalPublished,
        publishRate,
        activeCampaigns,
        activeCreators: creatorCount,
        totalCampaigns: campaignCount,
        connectedAccounts: socialAccounts.length,
      },
      platformBreakdown,
      topContent,
      activityBreakdown: activityCounts,
      connectedPlatforms: socialAccounts.map((a) => ({
        platform: a.platform,
        name: a.accountName,
      })),
      range,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[GET /api/analytics]", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
