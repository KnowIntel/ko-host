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

const verifiedStripeSecretKey: string = stripeSecretKey;
const verifiedWebhookSecret: string = webhookSecret;

const stripe = new Stripe(verifiedStripeSecretKey, {
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
    const rawBody = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("STRIPE WEBHOOK ERROR: Missing stripe-signature header");
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
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
    const designKeyFromMetadata = String(metadata.design_key || "");

    if (!pendingCheckoutId) {
      console.error("STRIPE WEBHOOK ERROR: Missing pending_checkout_id");
      return NextResponse.json(
        { ok: false, error: "Missing pending checkout id" },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: pendingRow, error: pendingError } = await supabaseAdmin
      .from("pending_microsite_checkouts")
      .select("*")
      .eq("id", pendingCheckoutId)
      .single();

    if (pendingError || !pendingRow) {
      console.error("STRIPE WEBHOOK ERROR: Pending row not found", pendingError);
      return NextResponse.json(
        { ok: false, error: "Pending checkout not found" },
        { status: 404 },
      );
    }

    const ownerClerkUserId =
      typeof pendingRow.owner_clerk_user_id === "string"
        ? pendingRow.owner_clerk_user_id
        : "";
    const templateKey =
      typeof pendingRow.template_key === "string" ? pendingRow.template_key : "";
    const title = typeof pendingRow.title === "string" ? pendingRow.title : "";
    const siteVisibility =
      typeof pendingRow.site_visibility === "string"
        ? pendingRow.site_visibility
        : "public";
    const privateMode =
      typeof pendingRow.private_mode === "string"
        ? pendingRow.private_mode
        : "passcode";
    const passcodeHash =
      typeof pendingRow.passcode_hash === "string"
        ? pendingRow.passcode_hash
        : null;
    const selectedDesignKey =
      typeof pendingRow.selected_design_key === "string"
        ? pendingRow.selected_design_key
        : "";

    if (!ownerClerkUserId) {
      return NextResponse.json(
        { ok: false, error: "Missing owner_clerk_user_id" },
        { status: 400 },
      );
    }

    if (!templateKey) {
      return NextResponse.json(
        { ok: false, error: "Missing template_key" },
        { status: 400 },
      );
    }

    if (!pendingRow.slug || typeof pendingRow.slug !== "string") {
      console.error("STRIPE WEBHOOK ERROR: Missing slug");
      return NextResponse.json(
        { ok: false, error: "Missing slug" },
        { status: 400 },
      );
    }

    const slug: string = pendingRow.slug;

    if (
      pendingRow.stripe_session_id &&
      pendingRow.stripe_session_id !== session.id
    ) {
      console.error("STRIPE WEBHOOK ERROR: Session mismatch", {
        expected: pendingRow.stripe_session_id,
        received: session.id,
      });
      return NextResponse.json(
        { ok: false, error: "Session mismatch" },
        { status: 400 },
      );
    }

    if (pendingRow.processed_at) {
      return NextResponse.json({ ok: true });
    }

    const resolvedDesignKey = String(
      selectedDesignKey || designKeyFromMetadata || "blank",
    );

    const { data: conflictingMicrosite, error: conflictingMicrositeError } =
      await supabaseAdmin
        .from("microsites")
        .select("id, owner_clerk_user_id")
        .eq("slug", slug)
        .maybeSingle();

    if (conflictingMicrositeError) {
      console.error(
        "STRIPE WEBHOOK ERROR: slug conflict lookup failed",
        conflictingMicrositeError,
      );
      return NextResponse.json(
        { ok: false, error: conflictingMicrositeError.message },
        { status: 500 },
      );
    }

    if (
      conflictingMicrosite &&
      conflictingMicrosite.owner_clerk_user_id !== ownerClerkUserId
    ) {
      console.error("STRIPE WEBHOOK ERROR: Slug conflict detected", { slug });
      return NextResponse.json(
        { ok: false, error: "Slug already taken" },
        { status: 409 },
      );
    }

    const nowIso = new Date().toISOString();

    const micrositePayload = {
      owner_clerk_user_id: ownerClerkUserId,
      template_key: templateKey,
      slug,
      title,
      status: "published",
      is_active: true,
      is_published: true,
      published_at: nowIso,
      paid_until: addDaysIsoFrom(null, 90),
      site_visibility: siteVisibility,
      private_mode: privateMode,
      passcode_hash: passcodeHash,
      draft: pendingRow.draft ?? null,
      selected_design_key: resolvedDesignKey,
      updated_at: nowIso,
    };

    // ✅ DEBUG LOG (ADDED)
    console.log("🧠 WEBHOOK DATA:", {
      slug,
      ownerClerkUserId,
      templateKey,
      resolvedDesignKey,
    });

    // ✅ FIX: UPSERT (REPLACES INSERT/UPDATE SPLIT)
    const { error: upsertError } = await supabaseAdmin
      .from("microsites")
      .upsert(
        {
          ...micrositePayload,
          created_at: nowIso,
        },
        {
          onConflict: "slug",
        },
      );

    if (upsertError) {
      console.error("STRIPE WEBHOOK ERROR: microsite upsert failed", {
        error: upsertError,
        payload: micrositePayload,
      });

      return NextResponse.json(
        { ok: false, error: upsertError.message },
        { status: 500 },
      );
    }

    console.log("✅ Microsite upsert success:", slug);

    const { error: processedError } = await supabaseAdmin
      .from("pending_microsite_checkouts")
      .update({
        stripe_session_id: session.id,
        processed_at: nowIso,
      })
      .eq("id", pendingCheckoutId);

    if (processedError) {
      console.error(
        "STRIPE WEBHOOK ERROR: pending checkout processed mark failed",
        processedError,
      );
      return NextResponse.json(
        { ok: false, error: processedError.message },
        { status: 500 },
      );
    }

    // ✅ FIX: RELAXED DELETE (was too strict)
const draftDesignKeys = Array.from(
  new Set(
    [selectedDesignKey, resolvedDesignKey, designKeyFromMetadata, "blank"].filter(
      (value): value is string => typeof value === "string" && value.trim().length > 0,
    ),
  ),
);

const { error: deleteDraftError } = await supabaseAdmin
  .from("microsite_drafts")
  .delete()
  .eq("owner_clerk_user_id", ownerClerkUserId)
  .eq("template_key", templateKey)
  .in("design_key", draftDesignKeys);

    if (deleteDraftError) {
      console.error("STRIPE WEBHOOK ERROR: draft delete failed", deleteDraftError);
      return NextResponse.json(
        { ok: false, error: deleteDraftError.message },
        { status: 500 },
      );
    }

    const { error: deletePendingError } = await supabaseAdmin
      .from("pending_microsite_checkouts")
      .delete()
      .eq("id", pendingCheckoutId);

    if (deletePendingError) {
      console.error(
        "STRIPE WEBHOOK ERROR: pending checkout delete failed",
        deletePendingError,
      );
      return NextResponse.json(
        { ok: false, error: deletePendingError.message },
        { status: 500 },
      );
    }

    console.log("STRIPE WEBHOOK SUCCESS:", {
      slug,
      title,
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