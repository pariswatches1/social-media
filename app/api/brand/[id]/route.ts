import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { ensureUser } from "@/lib/ensure-user";

// PUT update a brand profile
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(clerkId);

    const { id } = await params;
    const existing = await prisma.brandProfile.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, voice, tone, audience, guidelines, examples, colors, isDefault } = body;

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.brandProfile.updateMany({
        where: { userId: user.id, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const profile = await prisma.brandProfile.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(voice !== undefined && { voice }),
        ...(tone !== undefined && { tone }),
        ...(audience !== undefined && { audience }),
        ...(guidelines !== undefined && { guidelines }),
        ...(examples !== undefined && { examples }),
        ...(colors !== undefined && { colors }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    await logActivity(user.id, "BRAND_PROFILE_UPDATED", `Updated brand profile "${profile.name}"`, {
      profileId: profile.id,
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("[PUT /api/brand/[id]]", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

// DELETE a brand profile
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(clerkId);

    const { id } = await params;
    const existing = await prisma.brandProfile.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await prisma.brandProfile.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/brand/[id]]", error);
    return NextResponse.json({ error: "Failed to delete profile" }, { status: 500 });
  }
}
