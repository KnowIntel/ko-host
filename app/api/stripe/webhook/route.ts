// app/api/stripe/webhook/route.ts
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
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("STRIPE WEBHOOK ERROR: Missing stripe-signature header");
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

      console.error("STRIPE WEBHOOK VERIFY ERROR:", message);
      return NextResponse.json({ ok: false, error: message }, { status: 400 });
    }

    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ ok: true });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};

    const pendingCheckoutId = String(metadata.pending_checkout_id || "");
    const designKey = String(metadata.design_key || "");

    console.log("STRIPE WEBHOOK RECEIVED:", {
      eventType: event.type,
      pendingCheckoutId,
      designKey,
      metadata,
      stripeSessionId: session.id,
    });

    if (!pendingCheckoutId) {
      console.error("STRIPE WEBHOOK ERROR: Missing pending_checkout_id");
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // ============================================================
    // FETCH PENDING CHECKOUT
    // ============================================================
    const { data: pendingRow, error: pendingError } = await supabaseAdmin
      .from("pending_microsite_checkouts")
      .select("*")
      .eq("id", pendingCheckoutId)
      .single();

    if (pendingError || !pendingRow) {
      console.error("STRIPE WEBHOOK ERROR: Pending row not found", pendingError);
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    // ============================================================
    // 🔒 IDEMPOTENCY CHECK (CRITICAL)
    // Prevent duplicate processing of same Stripe session
    // ============================================================
    if (pendingRow.stripe_session_id && pendingRow.stripe_session_id !== session.id) {
      console.error("STRIPE WEBHOOK ERROR: Session mismatch");
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    if (pendingRow.processed_at) {
      // Already handled → safe exit
      return NextResponse.json({ ok: true });
    }

    const resolvedDesignKey = String(
      pendingRow.selected_design_key || designKey || "blank",
    );

    // ============================================================
    // 🔒 FINAL SLUG OWNERSHIP CHECK (CRITICAL)
    // Prevent duplicate slug across users
    // ============================================================
    const { data: conflictingMicrosite } = await supabaseAdmin
      .from("microsites")
      .select("id, owner_clerk_user_id")
      .eq("slug", pendingRow.slug)
      .maybeSingle();

    if (
      conflictingMicrosite &&
      conflictingMicrosite.owner_clerk_user_id !==
        pendingRow.owner_clerk_user_id
    ) {
      console.error("STRIPE WEBHOOK ERROR: Slug conflict detected", {
        slug: pendingRow.slug,
      });

      return NextResponse.json(
        { ok: false, error: "Slug already taken" },
        { status: 409 },
      );
    }

    const micrositePayload = {
      owner_clerk_user_id: pendingRow.owner_clerk_user_id,
      template_key: pendingRow.template_key,
      slug: pendingRow.slug,
      title: pendingRow.title,
      is_active: true,
      is_published: true,
      paid_until: addDaysIsoFrom(null, 90),
      site_visibility: pendingRow.site_visibility || "public",
      private_mode: Boolean(pendingRow.private_mode),
      passcode_hash: pendingRow.passcode_hash || null,
      draft: pendingRow.draft ?? null,
      selected_design_key: resolvedDesignKey,
    };

    // ============================================================
    // UPSERT MICROSITE (SAFE)
    // ============================================================
    const { data: existingMicrosite, error: existingMicrositeError } =
      await supabaseAdmin
        .from("microsites")
        .select("id")
        .eq("owner_clerk_user_id", pendingRow.owner_clerk_user_id)
        .eq("slug", pendingRow.slug)
        .maybeSingle();

    if (existingMicrositeError) {
      console.error(
        "STRIPE WEBHOOK ERROR: existing microsite lookup failed",
        existingMicrositeError,
      );
      return NextResponse.json(
        { ok: false, error: existingMicrositeError.message },
        { status: 500 },
      );
    }

    if (existingMicrosite?.id) {
      const { error: updateError } = await supabaseAdmin
        .from("microsites")
        .update(micrositePayload)
        .eq("id", existingMicrosite.id);

      if (updateError) {
        console.error(
          "STRIPE WEBHOOK ERROR: microsite update failed",
          updateError,
        );
        return NextResponse.json(
          { ok: false, error: updateError.message },
          { status: 500 },
        );
      }
    } else {
      const { error: insertError } = await supabaseAdmin
        .from("microsites")
        .insert(micrositePayload);

      if (insertError) {
        console.error(
          "STRIPE WEBHOOK ERROR: microsite insert failed",
          insertError,
        );
        return NextResponse.json(
          { ok: false, error: insertError.message },
          { status: 500 },
        );
      }
    }

    // ============================================================
    // MARK PENDING AS PROCESSED (IMPORTANT)
    // ============================================================
    await supabaseAdmin
      .from("pending_microsite_checkouts")
      .update({
        processed_at: new Date().toISOString(),
      })
      .eq("id", pendingCheckoutId);

    // ============================================================
    // CLEANUP
    // ============================================================
    await supabaseAdmin
      .from("pending_microsite_checkouts")
      .delete()
      .eq("id", pendingCheckoutId);

    await supabaseAdmin
      .from("microsite_drafts")
      .delete()
      .eq("owner_clerk_user_id", pendingRow.owner_clerk_user_id)
      .eq("template_key", pendingRow.template_key)
      .eq("design_key", resolvedDesignKey);

    console.log("STRIPE WEBHOOK SUCCESS:", {
      slug: pendingRow.slug,
      title: pendingRow.title,
      stripeSessionId: session.id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    console.error("STRIPE WEBHOOK FATAL ERROR:", message);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}