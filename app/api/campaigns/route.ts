import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { ensureUser } from "@/lib/ensure-user";
import { logActivity } from "@/lib/activity";

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(clerkId);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: user.id };
    if (status) where.status = status;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          creators: {
            include: {
              creator: {
                select: {
                  id: true,
                  handle: true,
                  displayName: true,
                  avatarUrl: true,
                  platform: true,
                  followerCount: true,
                },
              },
            },
          },
          deliverables: {
            select: {
              id: true,
              type: true,
              platform: true,
              status: true,
            },
          },
          _count: {
            select: {
              creators: true,
              deliverables: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.campaign.count({ where }),
    ]);

    return NextResponse.json({
      campaigns,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[GET /api/campaigns]", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
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

    // Validate required fields
    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json(
        { error: "Campaign name is required" },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.create({
      data: {
        userId: user.id,
        name: body.name.trim(),
        description: body.description || "",
        goal: body.goal || "",
        budget: typeof body.budget === "number" ? body.budget : 0,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        platforms: JSON.stringify(body.platforms || []),
        brief: body.brief || "",
        hashtags: JSON.stringify(body.hashtags || []),
      },
    });

    await logActivity(user.id, "CAMPAIGN_CREATED", `Created campaign: ${campaign.name}`, {
      campaignId: campaign.id,
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[POST /api/campaigns]", error);
    }
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
