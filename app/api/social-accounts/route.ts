import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { ensureUser } from "@/lib/ensure-user";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(clerkId);

    const accounts = await prisma.socialAccount.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        platform: true,
        accountId: true,
        accountName: true,
        accountAvatar: true,
        scope: true,
        isActive: true,
        connectedAt: true,
      },
      orderBy: { connectedAt: "desc" },
    });

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("[GET /api/social-accounts]", error);
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
  }
}
