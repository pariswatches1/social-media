import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getStripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { ensureUser } from "@/lib/ensure-user";

const VALID_PLANS = ["CREATOR", "PRO", "AGENCY"] as const;
type PaidPlan = (typeof VALID_PLANS)[number];

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body as { plan: string };

    // Validate plan at runtime
    if (!VALID_PLANS.includes(plan as PaidPlan)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be CREATOR, PRO, or AGENCY." },
        { status: 400 }
      );
    }

    const priceMap: Record<string, string | undefined> = {
      CREATOR: process.env.STRIPE_CREATOR_PRICE_ID,
      PRO: process.env.STRIPE_PRO_PRICE_ID,
      AGENCY: process.env.STRIPE_AGENCY_PRICE_ID,
    };
    const priceId = priceMap[plan];

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID not configured for this plan" },
        { status: 500 }
      );
    }

    // ensureUser fetches real email from Clerk — no fake emails
    const user = await ensureUser(clerkId);

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: user.email || undefined,
        metadata: { clerkId },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { clerkId },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[/api/stripe/checkout]", error);
    }
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
