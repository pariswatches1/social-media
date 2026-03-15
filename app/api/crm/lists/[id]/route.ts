// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { ensureUser } from "@/lib/ensure-user";

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

    const existing = await prisma.creatorList.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    const list = await prisma.creatorList.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.color !== undefined && { color: body.color }),
      },
    });

    return NextResponse.json({ list });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[PUT /api/crm/lists/[id]]", error);
    }
    return NextResponse.json(
      { error: "Failed to update list" },
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

    const existing = await prisma.creatorList.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    // Cascade delete handles members automatically
    await prisma.creatorList.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[DELETE /api/crm/lists/[id]]", error);
    }
    return NextResponse.json(
      { error: "Failed to delete list" },
      { status: 500 }
    );
  }
}
