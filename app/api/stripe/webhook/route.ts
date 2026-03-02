// app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function mustGetEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function addDays(date: Date, days: number) {
  const ms = days * 24 * 60 * 60 * 1000;
  return new Date(date.getTime() + ms);
}

async function extendMicrositePaidUntil(opts: {
  micrositeId: string;
  daysToAdd: number; // 90
}) {
  const sb = getSupabaseAdmin();

  const { data: site, error: siteErr } = await sb
    .from("microsites")
    .select("id, paid_until")
    .eq("id", opts.micrositeId)
    .maybeSingle();

  if (siteErr || !site) {
    throw new Error(`Microsite not found for paid extension: ${opts.micrositeId}`);
  }

  const now = new Date();
  const currentPaidUntil = site.paid_until ? new Date(site.paid_until) : null;

  // Extend from whichever is later: now OR current paid_until
  const base = currentPaidUntil && currentPaidUntil > now ? currentPaidUntil : now;
  const nextPaidUntil = addDays(base, opts.daysToAdd);

  const { error: upErr } = await sb
    .from("microsites")
    .update({ paid_until: nextPaidUntil.toISOString() })
    .eq("id", opts.micrositeId);

  if (upErr) {
    console.error("microsites paid_until update failed", { upErr, micrositeId: opts.micrositeId });
    throw new Error("microsites paid_until update failed");
  }

  return { nextPaidUntil: nextPaidUntil.toISOString() };
}

async function upsertEntitlementFromSubscription(sub: Stripe.Subscription) {
  // Keep existing logic in place (so current subscription flow still works while we migrate)
  const clerkUserId = (sub.metadata?.clerk_user_id as string) || null;
  const templateKey = (sub.metadata?.template_key as string) || null;
  const stripePriceId =
    (sub.items?.data?.[0]?.price?.id as string | undefined) ?? null;

  if (!clerkUserId || !templateKey) {
    console.warn("subscription missing metadata (clerk_user_id/template_key)", {
      subId: sub.id,
      metadata: sub.metadata,
    });
    return;
  }

  const status =
    sub.status === "active" || sub.status === "trialing" ? "active" : "canceled";

  // Stripe "clover" objects often store period end on the item
  const item = sub.items?.data?.[0];
  const currentPeriodEndUnix =
    (item as any)?.current_period_end ??
    (sub as any)?.current_period_end ??
    null;

  const currentPeriodEnd =
    typeof currentPeriodEndUnix === "number"
      ? new Date(currentPeriodEndUnix * 1000).toISOString()
      : null;

  const sb = getSupabaseAdmin();
  const { error } = await sb.from("entitlements").upsert(
    {
      clerk_user_id: clerkUserId,
      template_key: templateKey,
      status,
      stripe_subscription_id: sub.id,
      stripe_price_id: stripePriceId,
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clerk_user_id,template_key" }
  );

  if (error) {
    console.error("entitlements upsert failed", {
      error,
      clerkUserId,
      templateKey,
      status,
      stripeSubscriptionId: sub.id,
      stripePriceId,
      currentPeriodEnd,
    });
    throw new Error("entitlements upsert failed");
  }
}

export async function POST(req: Request) {
  const sig = (await headers()).get("stripe-signature");
  if (!sig) return NextResponse.json({ ok: false, error: "Missing signature" }, { status: 400 });

  const secret = mustGetEnv("STRIPE_WEBHOOK_SECRET");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ ok: false, error: "Bad signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      // ✅ NEW: handle one-time payment checkout completion for "90 days per microsite"
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // We only extend paid_until for one-time payments (mode=payment)
        if (session.mode !== "payment") break;

        const micrositeId = (session.metadata?.microsite_id as string) || null;
        if (!micrositeId) {
          console.warn("checkout.session.completed missing microsite_id metadata", {
            sessionId: session.id,
            mode: session.mode,
            metadata: session.metadata,
          });
          break;
        }

        const result = await extendMicrositePaidUntil({
          micrositeId,
          daysToAdd: 90,
        });

        console.log("Microsite paid_until extended", {
          micrositeId,
          nextPaidUntil: result.nextPaidUntil,
          sessionId: session.id,
        });

        break;
      }

      // Existing subscription syncing (kept while we migrate UI)
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await upsertEntitlementFromSubscription(sub);
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ ok: true, route: "/api/stripe/webhook" }, { status: 200 });
  } catch (err) {
    console.error("Stripe webhook handler failed", err);
    return NextResponse.json({ ok: false, error: "Webhook handler failed" }, { status: 500 });
  }
}