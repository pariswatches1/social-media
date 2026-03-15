import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { ensureUser } from "@/lib/ensure-user";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(clerkId);

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      scheduledPost: { userId: user.id },
    };
    if (postId) {
      where.scheduledPostId = postId;
    }

    const [logs, total] = await Promise.all([
      prisma.publishLog.findMany({
        where,
        orderBy: { attemptedAt: "desc" },
        skip,
        take: limit,
        include: {
          scheduledPost: {
            select: { content: true, platform: true },
          },
        },
      }),
      prisma.publishLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[Publish Log API]", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
