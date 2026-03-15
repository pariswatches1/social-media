// @ts-nocheck
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [lists, total] = await Promise.all([
      prisma.creatorList.findMany({
        where: { userId: user.id },
        include: {
          members: {
            include: {
              creator: {
                select: {
                  id: true,
                  handle: true,
                  displayName: true,
                  avatarUrl: true,
                  platform: true,
                  followerCount: true,
                  engagementRate: true,
                  niche: true,
                  email: true,
                  trustScore: true,
                  location: true,
                },
              },
            },
            orderBy: { addedAt: "desc" },
          },
          _count: { select: { members: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.creatorList.count({ where: { userId: user.id } }),
    ]);

    // Also get total unique creators across all lists
    const totalCreators = await prisma.creatorListMember.count({
      where: { list: { userId: user.id } },
    });

    return NextResponse.json({
      lists,
      total,
      totalCreators,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[GET /api/crm/lists]", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch lists" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(clerkId);
    const body = await req.json();

    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json(
        { error: "List name is required" },
        { status: 400 }
      );
    }

    const list = await prisma.creatorList.create({
      data: {
        userId: user.id,
        name: body.name.trim(),
        description: body.description || "",
        color: body.color || "#06b6d4",
      },
    });

    return NextResponse.json({ list }, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[POST /api/crm/lists]", error);
    }
    return NextResponse.json(
      { error: "Failed to create list" },
      { status: 500 }
    );
  }
}
