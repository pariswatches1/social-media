import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET activity feed
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
    const page = parseInt(searchParams.get("page") || "1");
    const type = searchParams.get("type");
    const limit = 20;

    const where: Record<string, unknown> = { userId: user.id };
    if (type) where.type = type;

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activity.count({ where }),
    ]);

    return NextResponse.json({
      activities,
      total,
      totalPages: Math.ceil(total / limit),
      page,
    });
  } catch (error) {
    console.error("[GET /api/inbox]", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
