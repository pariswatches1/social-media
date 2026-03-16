// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { searchCreators, type DiscoveredCreator } from "@/lib/creator-discovery";

// ─── Cache discovered creators in our database ──────────────────────────────

async function cacheCreators(creators: DiscoveredCreator[]): Promise<void> {
  try {
    for (const c of creators) {
      if (!c.handle || !c.platformId) continue;

      await prisma.creator.upsert({
        where: {
          platform_platformId: {
            platform: c.platform,
            platformId: c.platformId,
          },
        },
        update: {
          handle: c.handle,
          displayName: c.displayName || c.handle,
          avatarUrl: c.avatarUrl || "",
          bio: c.bio || "",
          followerCount: c.followerCount || 0,
          followingCount: c.followingCount || 0,
          postCount: c.postCount || 0,
          engagementRate: c.engagementRate || 0,
          trustScore: c.trustScore || 0,
          avgLikes: c.avgLikes || 0,
          avgComments: c.avgComments || 0,
          niche: c.niche || "",
          location: c.location || "",
          email: c.email || "",
          website: c.website || "",
          lastUpdated: new Date(),
        },
        create: {
          platform: c.platform,
          platformId: c.platformId,
          handle: c.handle,
          displayName: c.displayName || c.handle,
          avatarUrl: c.avatarUrl || "",
          bio: c.bio || "",
          followerCount: c.followerCount || 0,
          followingCount: c.followingCount || 0,
          postCount: c.postCount || 0,
          engagementRate: c.engagementRate || 0,
          trustScore: c.trustScore || 0,
          avgLikes: c.avgLikes || 0,
          avgComments: c.avgComments || 0,
          niche: c.niche || "",
          location: c.location || "",
          email: c.email || "",
          website: c.website || "",
        },
      });
    }
  } catch (error) {
    // Caching is best-effort — don't fail the request
    console.error("[Cache] Failed to cache creators:", error);
  }
}

// ─── Check local cache first ─────────────────────────────────────────────────

async function searchLocalCache(params: {
  query: string;
  platform: string;
  niche: string;
  minFollowers: number;
  maxFollowers: number;
  minEngagement: number;
  minTrust: number;
  page: number;
  limit: number;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (params.query) {
    where.OR = [
      { handle: { contains: params.query, mode: "insensitive" } },
      { displayName: { contains: params.query, mode: "insensitive" } },
      { bio: { contains: params.query, mode: "insensitive" } },
      { niche: { contains: params.query, mode: "insensitive" } },
    ];
  }

  if (params.platform && params.platform !== "all") {
    where.platform = params.platform.toLowerCase();
  }

  if (params.minFollowers > 0) {
    where.followerCount = { ...(where.followerCount || {}), gte: params.minFollowers };
  }
  if (params.maxFollowers > 0) {
    where.followerCount = { ...(where.followerCount || {}), lte: params.maxFollowers };
  }
  if (params.minEngagement > 0) {
    where.engagementRate = { gte: params.minEngagement };
  }
  if (params.niche) {
    where.niche = { contains: params.niche, mode: "insensitive" };
  }
  if (params.minTrust > 0) {
    where.trustScore = { gte: params.minTrust };
  }

  const skip = (params.page - 1) * params.limit;

  const [creators, total] = await Promise.all([
    prisma.creator.findMany({
      where,
      orderBy: { followerCount: "desc" },
      skip,
      take: params.limit,
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

  return { creators, total };
}

// ─── GET handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const platform = searchParams.get("platform") || "all";
    const niche = searchParams.get("niche") || "";
    const minFollowers = parseInt(searchParams.get("minFollowers") || "0");
    const maxFollowers = parseInt(searchParams.get("maxFollowers") || "0");
    const minEngagement = parseFloat(searchParams.get("minEngagement") || "0");
    const minTrust = parseInt(searchParams.get("minTrust") || "0");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    const filters = {
      query,
      platform,
      niche,
      minFollowers,
      maxFollowers,
      minEngagement,
      minTrust,
      page,
      limit,
    };

    // ── Step 1: Check local cache first ──────────────────────────────────────
    const cached = await searchLocalCache(filters);

    if (cached.total > 0) {
      return NextResponse.json({
        creators: cached.creators,
        total: cached.total,
        page,
        limit,
        totalPages: Math.ceil(cached.total / limit),
        source: "cache",
      });
    }

    // ── Step 2: No cache hits → search via third-party providers ─────────────
    // Only search if user provided some query/filter
    if (!query && !niche && platform === "all") {
      // No search criteria — return empty with helpful message
      return NextResponse.json({
        creators: [],
        total: 0,
        page: 1,
        limit,
        totalPages: 0,
        source: "none",
        message: "Enter a search query, niche, or select a platform to discover creators.",
      });
    }

    const result = await searchCreators(filters);

    if (result.creators.length > 0) {
      // Cache the results in background (don't block response)
      cacheCreators(result.creators).catch(() => {});

      // Convert to response format with generated IDs for non-cached results
      const responseCreators = result.creators.map((c, i) => ({
        id: `disc_${c.platformId}_${i}`,
        platform: c.platform,
        handle: c.handle,
        displayName: c.displayName || c.handle,
        avatarUrl: c.avatarUrl || null,
        bio: c.bio || null,
        followerCount: c.followerCount,
        engagementRate: c.engagementRate || null,
        trustScore: c.trustScore || null,
        niche: c.niche || null,
        location: c.location || null,
        email: c.email || null,
        avgLikes: c.avgLikes || null,
        avgComments: c.avgComments || null,
        lastUpdated: new Date().toISOString(),
      }));

      return NextResponse.json({
        creators: responseCreators,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
        source: result.source,
      });
    }

    // ── Step 3: All providers returned empty ─────────────────────────────────
    return NextResponse.json({
      creators: [],
      total: 0,
      page: 1,
      limit,
      totalPages: 0,
      source: "none",
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
