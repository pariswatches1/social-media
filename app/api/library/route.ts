import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

// GET all saved content for the current user
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
    const platform = searchParams.get("platform");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 12;

    const where: Record<string, unknown> = { userId: user.id };
    if (platform) where.platform = platform;
    if (search) {
      where.OR = [
        { topic: { contains: search, mode: "insensitive" } },
        { copy: { contains: search, mode: "insensitive" } },
        { hook: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.savedContent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.savedContent.count({ where }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[GET /api/library]", error);
    return NextResponse.json({ error: "Failed to fetch library" }, { status: 500 });
  }
}

// POST save content to library
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
    const { topic, platform, copy, hook, cta, hashtags, viralityScore, tone, postType, imagePrompt, brandProfileId, tags } = body;

    if (!topic || !platform || !copy) {
      return NextResponse.json({ error: "Topic, platform, and copy are required" }, { status: 400 });
    }

    const item = await prisma.savedContent.create({
      data: {
        userId: user.id,
        topic,
        platform,
        copy,
        hook: hook || "",
        cta: cta || "",
        hashtags: JSON.stringify(hashtags || []),
        viralityScore: viralityScore || 0,
        tone: tone || "",
        postType: postType || "",
        imagePrompt: imagePrompt || "",
        brandProfileId: brandProfileId || null,
        tags: JSON.stringify(tags || []),
      },
    });

    await logActivity(user.id, "CONTENT_SAVED", `Saved content for ${platform}: "${topic.slice(0, 40)}"`, {
      contentId: item.id,
      platform,
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("[POST /api/library]", error);
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }
}
