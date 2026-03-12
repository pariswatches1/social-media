import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { ensureUser } from "@/lib/ensure-user";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(clerkId);

    const { id } = await params;

    const account = await prisma.socialAccount.findUnique({ where: { id } });
    if (!account || account.userId !== user.id) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    await prisma.socialAccount.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/social-accounts/[id]]", error);
    return NextResponse.json({ error: "Failed to disconnect account" }, { status: 500 });
  }
}
