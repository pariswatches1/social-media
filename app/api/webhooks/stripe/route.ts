// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        // Determine plan from the price ID
        const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;

        let plan: "CREATOR" | "PRO" | "AGENCY" = "PRO";
        if (priceId === process.env.STRIPE_AGENCY_PRICE_ID) {
          plan = "AGENCY";
        } else if (priceId === process.env.STRIPE_CREATOR_PRICE_ID) {
          plan = "CREATOR";
        }

        // Find user by Stripe customer ID and update plan
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            plan,
            stripeSubscriptionId: subscriptionId,
          },
        });

        console.log(`[Stripe] User upgraded to ${plan}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            plan: "FREE",
            stripeSubscriptionId: null,
          },
        });

        console.log("[Stripe] User downgraded to FREE");
        break;
      }
    }
  } catch (error) {
    console.error("[Stripe Webhook] Processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
