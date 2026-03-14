import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs/server";
// import prisma from "@/lib/prisma";
// import { ensureUser } from "@/lib/ensure-user";

export async function GET() {
  // TODO: Wire to Prisma — fetch user's campaigns
  return NextResponse.json({ campaigns: [], message: "Campaign API ready" });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // TODO: Wire to Prisma
  // const { userId } = await auth();
  // const user = await ensureUser(userId);
  // const campaign = await prisma.campaign.create({
  //   data: {
  //     userId: user.id,
  //     name: body.name,
  //     description: body.description || "",
  //     goal: body.goal || "",
  //     budget: body.budget || 0,
  //     startDate: body.startDate ? new Date(body.startDate) : null,
  //     endDate: body.endDate ? new Date(body.endDate) : null,
  //     platforms: JSON.stringify(body.platforms || []),
  //     brief: body.brief || "",
  //   },
  // });

  return NextResponse.json({ success: true, message: "Campaign created (stub)" });
}
