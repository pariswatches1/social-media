import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getStripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body as { plan: "PRO" | "AGENCY" };

    const priceId =
      plan === "AGENCY"
        ? process.env.STRIPE_AGENCY_PRICE_ID
        : process.env.STRIPE_PRO_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID not configured" },
        { status: 500 }
      );
    }

    // Get or create Stripe customer
    let user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      user = await prisma.user.create({
        data: { clerkId, email: `${clerkId}@signal.user` },
      });
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await getStripe().customers.create({
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
    console.error("[/api/stripe/checkout]", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
