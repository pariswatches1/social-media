// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { ensureUser } from "@/lib/ensure-user";

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

    const existing = await prisma.outreachEmail.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    await prisma.outreachEmail.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[DELETE /api/outreach/[id]]", error);
    }
    return NextResponse.json(
      { error: "Failed to delete outreach email" },
      { status: 500 }
    );
  }
}
