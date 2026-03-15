// @ts-nocheck
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { userId: user.id };
    if (status) where.status = status;

    const [emails, total] = await Promise.all([
      prisma.outreachEmail.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              handle: true,
              displayName: true,
              avatarUrl: true,
              platform: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.outreachEmail.count({ where }),
    ]);

    // Compute stats
    const [totalEmails, sentCount, openedCount, repliedCount, draftCount] =
      await Promise.all([
        prisma.outreachEmail.count({ where: { userId: user.id } }),
        prisma.outreachEmail.count({
          where: { userId: user.id, status: "SENT" },
        }),
        prisma.outreachEmail.count({
          where: { userId: user.id, status: "OPENED" },
        }),
        prisma.outreachEmail.count({
          where: { userId: user.id, status: "REPLIED" },
        }),
        prisma.outreachEmail.count({
          where: { userId: user.id, status: "DRAFT" },
        }),
      ]);

    return NextResponse.json({
      emails,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: {
        total: totalEmails,
        sent: sentCount,
        opened: openedCount,
        replied: repliedCount,
        drafts: draftCount,
        responseRate:
          sentCount > 0
            ? Math.round(((openedCount + repliedCount) / sentCount) * 100)
            : 0,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[GET /api/outreach]", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch outreach emails" },
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

    if (!body.creatorId || !body.subject || !body.body) {
      return NextResponse.json(
        { error: "creatorId, subject, and body are required" },
        { status: 400 }
      );
    }

    // Verify creator exists
    const creator = await prisma.creator.findUnique({
      where: { id: body.creatorId },
    });
    if (!creator) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      );
    }

    const email = await prisma.outreachEmail.create({
      data: {
        userId: user.id,
        creatorId: body.creatorId,
        subject: body.subject,
        body: body.body,
        status: body.send ? "SENT" : "DRAFT",
        sentAt: body.send ? new Date() : null,
      },
      include: {
        creator: {
          select: {
            id: true,
            handle: true,
            displayName: true,
            platform: true,
          },
        },
      },
    });

    if (body.send) {
      await logActivity(
        user.id,
        "OUTREACH_SENT",
        `Sent outreach to ${creator.displayName || creator.handle}`,
        { outreachId: email.id, creatorId: creator.id }
      );
    }

    return NextResponse.json({ email }, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[POST /api/outreach]", error);
    }
    return NextResponse.json(
      { error: "Failed to create outreach email" },
      { status: 500 }
    );
  }
}
