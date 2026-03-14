import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  // TODO: Wire to Prisma — fetch user's creator lists
  return NextResponse.json({ lists: [], message: "CRM Lists API ready" });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // TODO: Wire to Prisma — create new creator list
  return NextResponse.json({ success: true, message: "List created (stub)" });
}
