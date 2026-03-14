import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const platform = searchParams.get("platform") || "all";
  const minFollowers = parseInt(searchParams.get("minFollowers") || "0");
  const maxFollowers = parseInt(searchParams.get("maxFollowers") || "999999999");
  const minEngagement = parseFloat(searchParams.get("minEngagement") || "0");
  const niche = searchParams.get("niche") || "";
  const minTrust = parseInt(searchParams.get("minTrust") || "0");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  // TODO: Replace with Phyllo API integration for 350M+ creator profiles
  // Phase 1: Phyllo API (~$0.02-0.10 per call)
  // Phase 2: Supplement with proprietary data
  // Phase 3: Full self-hosted database

  return NextResponse.json({
    creators: [],
    total: 0,
    page,
    limit,
    message: "Connect Phyllo API for live creator data",
  });
}
