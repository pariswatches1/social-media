import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  // TODO: Wire to Prisma — fetch user's outreach emails
  return NextResponse.json({ emails: [], message: "Outreach API ready" });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // TODO: Wire to Prisma + SendGrid/Resend for email sending
  // const email = await prisma.outreachEmail.create({ ... });
  // await resend.emails.send({ ... });
  return NextResponse.json({ success: true, message: "Outreach email created (stub)" });
}
