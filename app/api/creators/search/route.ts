// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const platform = searchParams.get("platform") || "all";
    const minFollowers = parseInt(searchParams.get("minFollowers") || "0");
    const maxFollowers = parseInt(searchParams.get("maxFollowers") || "0");
    const minEngagement = parseFloat(searchParams.get("minEngagement") || "0");
    const niche = searchParams.get("niche") || "";
    const minTrust = parseInt(searchParams.get("minTrust") || "0");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const skip = (page - 1) * limit;

    // Build Prisma where clause from filters
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (query) {
      where.OR = [
        { handle: { contains: query, mode: "insensitive" } },
        { displayName: { contains: query, mode: "insensitive" } },
        { bio: { contains: query, mode: "insensitive" } },
        { niche: { contains: query, mode: "insensitive" } },
      ];
    }

    if (platform && platform !== "all") {
      where.platform = platform.toLowerCase();
    }

    if (minFollowers > 0) {
      where.followerCount = { ...(where.followerCount || {}), gte: minFollowers };
    }
    if (maxFollowers > 0) {
      where.followerCount = { ...(where.followerCount || {}), lte: maxFollowers };
    }

    if (minEngagement > 0) {
      where.engagementRate = { gte: minEngagement };
    }

    if (niche) {
      where.niche = { contains: niche, mode: "insensitive" };
    }

    if (minTrust > 0) {
      where.trustScore = { gte: minTrust };
    }

    const [creators, total] = await Promise.all([
      prisma.creator.findMany({
        where,
        orderBy: { followerCount: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          platform: true,
          handle: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          followerCount: true,
          engagementRate: true,
          trustScore: true,
          niche: true,
          location: true,
          email: true,
          avgLikes: true,
          avgComments: true,
          lastUpdated: true,
        },
      }),
      prisma.creator.count({ where }),
    ]);

    return NextResponse.json({
      creators,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[GET /api/creators/search]", error);
    }
    return NextResponse.json(
      { error: "Failed to search creators" },
      { status: 500 }
    );
  }
}
