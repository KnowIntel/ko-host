import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
        { status: 400 }
      );
    }

    const body = await req.text();

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        getWebhookSecret()
      );
    } catch (error) {
      return NextResponse.json(
        {
          error: "Webhook signature verification failed",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 400 }
      );
    }

    switch (event.type) {
      /**
       * ✅ CHECKOUT COMPLETED
       */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const stripeSessionId = session.id;

        const stripePaymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null;

        const micrositeId =
          typeof session.metadata?.micrositeId === "string"
            ? session.metadata.micrositeId
            : null;

        const blockId =
          typeof session.metadata?.blockId === "string"
            ? session.metadata.blockId
            : null;

        const stripeAccountId =
          typeof session.metadata?.stripeAccountId === "string"
            ? session.metadata.stripeAccountId
            : null;

        const productName =
          typeof session.metadata?.productName === "string"
            ? session.metadata.productName
            : null;

        const customerEmail =
          typeof session.customer_details?.email === "string"
            ? session.customer_details.email
            : typeof session.customer_email === "string"
            ? session.customer_email
            : null;

        const customerName =
          typeof session.customer_details?.name === "string"
            ? session.customer_details.name
            : null;

        const amountTotal =
          typeof session.amount_total === "number"
            ? session.amount_total
            : null;

        const currency =
          typeof session.currency === "string"
            ? session.currency
            : null;

        const paymentStatus =
          typeof session.payment_status === "string"
            ? session.payment_status
            : null;

        const { error: upsertError } = await supabase
          .from("checkout_payments")
          .upsert(
            {
              stripe_session_id: stripeSessionId,
              stripe_payment_intent_id: stripePaymentIntentId,
              microsite_id: micrositeId,
              block_id: blockId,
              stripe_account_id: stripeAccountId,
              product_name: productName,
              customer_email: customerEmail,
              customer_name: customerName,
              amount_total: amountTotal,
              currency,
              payment_status: paymentStatus,
            },
            {
              onConflict: "stripe_session_id",
            }
          );

        if (upsertError) {
          console.error("Failed to save checkout payment", upsertError);

          return NextResponse.json(
            {
              error: "Failed to save checkout payment",
              details: upsertError.message,
            },
            { status: 500 }
          );
        }

        console.log("STRIPE CHECKOUT COMPLETED", {
          stripeSessionId,
          stripePaymentIntentId,
          micrositeId,
          blockId,
          stripeAccountId,
          productName,
          customerEmail,
          customerName,
          amountTotal,
          currency,
          paymentStatus,
        });

        break;
      }

      /**
       * ✅ NEW: STRIPE ACCOUNT UPDATED (SYNC STATUS)
       */
      case "account.updated": {
        const account = event.data.object as Stripe.Account;

        const stripeAccountId = account.id;
        const chargesEnabled = account.charges_enabled === true;

        console.log("STRIPE ACCOUNT UPDATED", {
          stripeAccountId,
          chargesEnabled,
        });

        const { error } = await supabase
          .from("microsites")
          .update({
            stripe_charges_enabled: chargesEnabled,
          })
          .eq("stripe_account_id", stripeAccountId);

        if (error) {
          console.error(
            "Failed to update stripe_charges_enabled",
            error
          );
        }

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
      { status: 500 }
    );
  }
}