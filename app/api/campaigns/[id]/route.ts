import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { ensureUser } from "@/lib/ensure-user";
import { logActivity } from "@/lib/activity";

const VALID_STATUSES = ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(clerkId);
    const { id } = await params;

    const campaign = await prisma.campaign.findFirst({
      where: { id, userId: user.id },
      include: {
        creators: {
          include: {
            creator: true,
            deliverables: true,
          },
        },
        deliverables: true,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[GET /api/campaigns/[id]]", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(clerkId);
    const { id } = await params;
    const body = await req.json();

    // Verify ownership
    const existing = await prisma.campaign.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Validate status if provided
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.goal !== undefined && { goal: body.goal }),
        ...(body.budget !== undefined && { budget: body.budget }),
        ...(body.startDate !== undefined && {
          startDate: body.startDate ? new Date(body.startDate) : null,
        }),
        ...(body.endDate !== undefined && {
          endDate: body.endDate ? new Date(body.endDate) : null,
        }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.brief !== undefined && { brief: body.brief }),
        ...(body.platforms !== undefined && {
          platforms: JSON.stringify(body.platforms),
        }),
        ...(body.hashtags !== undefined && {
          hashtags: JSON.stringify(body.hashtags),
        }),
      },
    });

    await logActivity(user.id, "CAMPAIGN_UPDATED", `Updated campaign: ${campaign.name}`, {
      campaignId: campaign.id,
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[PUT /api/campaigns/[id]]", error);
    }
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(clerkId);
    const { id } = await params;

    const existing = await prisma.campaign.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    await prisma.campaign.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[DELETE /api/campaigns/[id]]", error);
    }
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
