import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

// GET scheduled posts with filters
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const platform = searchParams.get("platform");
    const month = searchParams.get("month"); // YYYY-MM format
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;

    const where: Record<string, unknown> = { userId: user.id };
    if (status) where.status = status;
    if (platform) where.platform = platform;

    if (month) {
      const [year, mo] = month.split("-").map(Number);
      const start = new Date(year, mo - 1, 1);
      const end = new Date(year, mo, 1);
      where.scheduledFor = { gte: start, lt: end };
    }

    const [posts, total] = await Promise.all([
      prisma.scheduledPost.findMany({
        where,
        orderBy: { scheduledFor: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.scheduledPost.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      total,
      totalPages: Math.ceil(total / limit),
      page,
    });
  } catch (error) {
    console.error("[GET /api/schedule]", error);
    return NextResponse.json({ error: "Failed to fetch scheduled posts" }, { status: 500 });
  }
}

// POST create a new scheduled post
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      content,
      platform,
      hashtags,
      imagePrompt,
      scheduledFor,
      status,
      brandProfileId,
      calendarColor,
      notes,
      tags,
    } = body;

    if (!content || !platform) {
      return NextResponse.json({ error: "Content and platform are required" }, { status: 400 });
    }

    const post = await prisma.scheduledPost.create({
      data: {
        userId: user.id,
        content,
        platform,
        hashtags: hashtags || "[]",
        imagePrompt: imagePrompt || "",
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        status: status || "DRAFT",
        brandProfileId: brandProfileId || null,
        calendarColor: calendarColor || "#06b6d4",
        notes: notes || "",
        tags: tags || "[]",
      },
    });

    await logActivity(user.id, "CONTENT_SCHEDULED", `Scheduled ${platform} post`, {
      postId: post.id,
      platform,
      status: post.status,
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("[POST /api/schedule]", error);
    return NextResponse.json({ error: "Failed to create scheduled post" }, { status: 500 });
  }
}
