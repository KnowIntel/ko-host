// \app\api\stripe\webhook\route.ts
import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

if (!webhookSecret) {
  throw new Error("Missing STRIPE_WEBHOOK_SECRET");
}

const verifiedWebhookSecret: string = webhookSecret;

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2026-02-25.clover",
});

function addDaysIsoFrom(baseIso: string | null, days: number) {
  const base = baseIso ? new Date(baseIso) : new Date();
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      verifiedWebhookSecret,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook verification failed";

    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ ok: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const metadata = session.metadata || {};

  const pendingCheckoutId = String(metadata.pending_checkout_id || "");
  const designKey = String(metadata.design_key || "");

  const supabaseAdmin = getSupabaseAdmin();

  if (!pendingCheckoutId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { data: pendingRow } = await supabaseAdmin
    .from("pending_microsite_checkouts")
    .select("*")
    .eq("id", pendingCheckoutId)
    .single();

  if (!pendingRow) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const insertRow = {
    owner_clerk_user_id: pendingRow.owner_clerk_user_id,
    owner_email: pendingRow.owner_email ?? null,
    template_key: pendingRow.template_key,
    slug: pendingRow.slug,
    title: pendingRow.title,
    is_published: false,
    paid_until: addDaysIsoFrom(null, 90),
    site_visibility: pendingRow.site_visibility || "public",
    private_mode: Boolean(pendingRow.private_mode),
    passcode_hash: pendingRow.passcode_hash || null,
    draft: pendingRow.draft ?? null,
    selected_design_key: pendingRow.selected_design_key || designKey || "blank",
  };

  await supabaseAdmin.from("microsites").insert(insertRow);

  await supabaseAdmin
    .from("pending_microsite_checkouts")
    .delete()
    .eq("id", pendingCheckoutId);

  return NextResponse.json({ ok: true });
}