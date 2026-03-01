// app/api/stripe/checkout/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getPriceIdForTemplate } from "@/lib/stripePrices";

const BodySchema = z.object({
  templateKey: z.string().min(1),
  // Optional: if you want to redirect somewhere specific after checkout
  successPath: z.string().optional(),
  cancelPath: z.string().optional()
});

function appUrl(): string {
  const v = process.env.NEXT_PUBLIC_APP_URL;
  if (!v) throw new Error("Missing env var: NEXT_PUBLIC_APP_URL");
  return v.replace(/\/+$/, "");
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { templateKey, successPath, cancelPath } = parsed.data;

    const priceId = getPriceIdForTemplate(templateKey);
    if (!priceId) {
      return NextResponse.json({ error: "Unknown templateKey" }, { status: 400 });
    }

    const sb = getSupabaseAdmin();

    // 1) Find or create Stripe customer for this Clerk user
    const { data: existing, error: existingErr } = await sb
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (existingErr) {
      console.error("stripe_customers lookup failed", { existingErr, userId });
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    let stripeCustomerId = existing?.stripe_customer_id ?? null;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        metadata: { clerk_user_id: userId }
      });

      stripeCustomerId = customer.id;

      const { error: upsertErr } = await sb.from("stripe_customers").upsert(
        {
          clerk_user_id: userId,
          stripe_customer_id: stripeCustomerId
        },
        { onConflict: "clerk_user_id" }
      );

      if (upsertErr) {
        console.error("stripe_customers upsert failed", { upsertErr, userId, stripeCustomerId });
        return NextResponse.json({ error: "DB error" }, { status: 500 });
      }
    }

    // 2) Create Checkout Session
    const successUrl = `${appUrl()}${successPath ?? "/dashboard?checkout=success"}`;
    const cancelUrl = `${appUrl()}${cancelPath ?? "/dashboard?checkout=cancel"}`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      client_reference_id: userId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      // metadata helps webhook reconciliation
      metadata: {
        clerk_user_id: userId,
        template_key: templateKey
      },
      subscription_data: {
        metadata: {
          clerk_user_id: userId,
          template_key: templateKey
        }
      },
      // keep tax OFF for now (you explicitly skipped Stripe Tax)
      automatic_tax: { enabled: false }
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err) {
    console.error("POST /api/stripe/checkout failed", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}