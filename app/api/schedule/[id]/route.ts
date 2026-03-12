import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { ensureUser } from "@/lib/ensure-user";

// PUT update a scheduled post
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(clerkId);

    const { id } = await params;
    const existing = await prisma.scheduledPost.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
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
      approvedBy,
      publishedAt,
    } = body;

    const post = await prisma.scheduledPost.update({
      where: { id },
      data: {
        ...(content !== undefined && { content }),
        ...(platform !== undefined && { platform }),
        ...(hashtags !== undefined && { hashtags }),
        ...(imagePrompt !== undefined && { imagePrompt }),
        ...(scheduledFor !== undefined && { scheduledFor: scheduledFor ? new Date(scheduledFor) : null }),
        ...(status !== undefined && { status }),
        ...(brandProfileId !== undefined && { brandProfileId }),
        ...(calendarColor !== undefined && { calendarColor }),
        ...(notes !== undefined && { notes }),
        ...(tags !== undefined && { tags }),
        ...(approvedBy !== undefined && { approvedBy }),
        ...(publishedAt !== undefined && { publishedAt: publishedAt ? new Date(publishedAt) : null }),
      },
    });

    if (status === "PUBLISHED" && existing.status !== "PUBLISHED") {
      await logActivity(user.id, "CONTENT_PUBLISHED", `Published ${post.platform} post`, {
        postId: post.id,
        platform: post.platform,
      });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("[PUT /api/schedule/[id]]", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

// DELETE a scheduled post
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(clerkId);

    const { id } = await params;
    const existing = await prisma.scheduledPost.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.scheduledPost.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/schedule/[id]]", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
