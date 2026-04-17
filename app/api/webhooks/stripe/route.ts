import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  }
  return secret;
}

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 },
      );
    }

    const body = await req.text();

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        getWebhookSecret(),
      );
    } catch (error) {
      return NextResponse.json(
        {
          error: "Webhook signature verification failed",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 400 },
      );
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log("STRIPE CHECKOUT COMPLETED", {
          sessionId: session.id,
          paymentStatus: session.payment_status,
          micrositeId: session.metadata?.micrositeId ?? null,
          blockId: session.metadata?.blockId ?? null,
          stripeAccountId: session.metadata?.stripeAccountId ?? null,
          productName: session.metadata?.productName ?? null,
          customerEmail:
            session.customer_details?.email ?? session.customer_email ?? null,
          amountTotal: session.amount_total ?? null,
        });

        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Webhook handler failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}