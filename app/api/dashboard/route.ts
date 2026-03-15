// @ts-nocheck
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { ensureUser } from "@/lib/ensure-user";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(clerkId);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      savedCount,
      scheduledCount,
      publishedCount,
      brandCount,
      recentActivity,
      upcomingPosts,
    ] = await Promise.all([
      prisma.savedContent.count({ where: { userId: user.id } }),
      prisma.scheduledPost.count({ where: { userId: user.id, status: { in: ["SCHEDULED", "DRAFT"] } } }),
      prisma.scheduledPost.count({ where: { userId: user.id, status: "PUBLISHED" } }),
      prisma.brandProfile.count({ where: { userId: user.id } }),
      prisma.activity.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.scheduledPost.findMany({
        where: {
          userId: user.id,
          status: "SCHEDULED",
          scheduledFor: { gte: now },
        },
        orderBy: { scheduledFor: "asc" },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      stats: {
        savedCount,
        scheduledCount,
        publishedCount,
        brandCount,
        analysesUsed: user.analysesUsed,
        generationsUsed: user.generationsUsed,
        plan: user.plan,
      },
      recentActivity,
      upcomingPosts,
    });
  } catch (error) {
    console.error("[GET /api/dashboard]", error);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
