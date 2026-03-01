// app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs"; // MUST be node for Stripe webhook verification

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function templateKeyFromPriceId(priceId: string | null | undefined): string | null {
  if (!priceId) return null;

  const map: Array<[string, string]> = [
    ["wedding_rsvp", mustGetEnv("STRIPE_PRICE_WEDDING")],
    ["party_birthday", mustGetEnv("STRIPE_PRICE_PARTY")],
    ["baby_shower", mustGetEnv("STRIPE_PRICE_BABY")],
    ["family_reunion", mustGetEnv("STRIPE_PRICE_REUNION")],
    ["memorial_tribute", mustGetEnv("STRIPE_PRICE_MEMORIAL")],
    ["property_listing", mustGetEnv("STRIPE_PRICE_PROPERTY")],
    ["open_house", mustGetEnv("STRIPE_PRICE_OPENHOUSE")],
    ["product_launch", mustGetEnv("STRIPE_PRICE_LAUNCH")],
    ["crowdfunding_campaign", mustGetEnv("STRIPE_PRICE_CROWD")],
    ["resume_portfolio", mustGetEnv("STRIPE_PRICE_RESUME")]
  ];

  const found = map.find(([, pid]) => pid === priceId);
  return found ? found[0] : null;
}

async function upsertEntitlement(args: {
  clerkUserId: string;
  templateKey: string;
  status: string;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  currentPeriodEnd: string | null; // ISO
}) {
  const sb = getSupabaseAdmin();

  const { error } = await sb.from("entitlements").upsert(
    {
      clerk_user_id: args.clerkUserId,
      template_key: args.templateKey,
      status: args.status,
      stripe_subscription_id: args.stripeSubscriptionId,
      stripe_price_id: args.stripePriceId,
      current_period_end: args.currentPeriodEnd
    },
    { onConflict: "clerk_user_id,template_key" }
  );

  if (error) {
    console.error("entitlements upsert failed", { error, ...args });
    throw new Error("entitlements upsert failed");
  }
}

function toIsoFromUnixSeconds(unixSeconds: number | null | undefined): string | null {
  if (!unixSeconds) return null;
  return new Date(unixSeconds * 1000).toISOString();
}

export async function POST(req: Request) {
  try {
    const webhookSecret = mustGetEnv("STRIPE_WEBHOOK_SECRET");

    // IMPORTANT: raw body for signature verification
    const rawBody = await req.text();
    const sig = req.headers.get("stripe-signature");
    if (!sig) return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      console.error("Stripe webhook signature verification failed", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const clerkUserId =
          (session.metadata?.clerk_user_id as string | undefined) ??
          (session.client_reference_id as string | null) ??
          null;

        const templateKey = (session.metadata?.template_key as string | undefined) ?? null;

        if (!clerkUserId || !templateKey) {
          console.log("checkout.session.completed: missing metadata; skipping", {
            clerkUserId,
            templateKey,
            sessionId: session.id
          });
          break;
        }

        await upsertEntitlement({
          clerkUserId,
          templateKey,
          status: "checkout_completed",
          stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : null,
          stripePriceId: null,
          currentPeriodEnd: null
        });

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        // Stripe SDK type mismatch fix: treat the payload as unknown-ish at runtime
        const sub = event.data.object as Stripe.Subscription;

        const clerkUserId = (sub.metadata?.clerk_user_id as string | undefined) ?? null;

        const firstItem = sub.items?.data?.[0];
        const priceId = firstItem?.price?.id ?? null;

        const templateKey =
          (sub.metadata?.template_key as string | undefined) ??
          templateKeyFromPriceId(priceId);

        if (!clerkUserId || !templateKey) {
          console.error("subscription event missing clerkUserId/templateKey", {
            type: event.type,
            subId: (sub as any)?.id,
            clerkUserId,
            templateKey,
            priceId
          });
          break;
        }

        const status = (sub as any)?.status ?? "unknown";

        // Some Stripe SDK typings omit current_period_end; read safely from runtime payload.
        const currentPeriodEndUnix = (sub as any)?.current_period_end as number | undefined;

        await upsertEntitlement({
          clerkUserId,
          templateKey,
          status,
          stripeSubscriptionId: (sub as any)?.id ?? null,
          stripePriceId: priceId,
          currentPeriodEnd: toIsoFromUnixSeconds(currentPeriodEndUnix)
        });

        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("Stripe webhook handler failed", err);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }
}