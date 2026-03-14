import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { ensureUser } from "@/lib/ensure-user";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(clerkId);
    const { id: listId } = await params;
    const body = await req.json();
    const { creatorId } = body;

    if (!creatorId) {
      return NextResponse.json({ error: "creatorId is required" }, { status: 400 });
    }

    // Verify list belongs to user
    const list = await prisma.creatorList.findFirst({
      where: { id: listId, userId: user.id },
    });
    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    // Check if creator already in list
    const existing = await prisma.creatorListMember.findFirst({
      where: { listId, creatorId },
    });
    if (existing) {
      return NextResponse.json({ message: "Creator already in list", member: existing }, { status: 409 });
    }

    const member = await prisma.creatorListMember.create({
      data: {
        listId,
        creatorId,
      },
      include: {
        creator: {
          select: {
            id: true,
            handle: true,
            displayName: true,
            avatarUrl: true,
            platform: true,
          },
        },
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[POST /api/crm/lists/[id]/members]", error);
    }
    return NextResponse.json(
      { error: "Failed to add member to list" },
      { status: 500 }
    );
  }
}
