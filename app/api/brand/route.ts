import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

// GET all brand profiles for the current user
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profiles = await prisma.brandProfile.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error("[GET /api/brand]", error);
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
  }
}

// POST create a new brand profile
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
    const { name, voice, tone, audience, guidelines, examples, colors, isDefault } = body;

    if (!name || !voice || !tone) {
      return NextResponse.json({ error: "Name, voice, and tone are required" }, { status: 400 });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.brandProfile.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const profile = await prisma.brandProfile.create({
      data: {
        userId: user.id,
        name,
        voice,
        tone,
        audience: audience || "",
        guidelines: guidelines || "",
        examples: examples || "",
        colors: colors || "",
        isDefault: isDefault || false,
      },
    });

    await logActivity(user.id, "BRAND_PROFILE_CREATED", `Created brand profile "${name}"`, {
      profileId: profile.id,
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("[POST /api/brand]", error);
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }
}
