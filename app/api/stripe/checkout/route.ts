// app/api/stripe/checkout/route.ts
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

if (!appUrl) {
  throw new Error("Missing NEXT_PUBLIC_APP_URL");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const contentType = req.headers.get("content-type") || "";

    let pendingCheckoutId = "";
    let micrositeId = "";
    let slug = "";
    let templateKey = "";
    let designKey = "";

    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));

      pendingCheckoutId = String(body?.pendingCheckoutId || "");
      micrositeId = String(body?.micrositeId || "");
      slug = String(body?.slug || "");
      templateKey = String(body?.templateKey || "");
      designKey = String(body?.designKey || "");
    } else {
      const formData = await req.formData();

      pendingCheckoutId = String(formData.get("pendingCheckoutId") || "");
      micrositeId = String(formData.get("micrositeId") || "");
      slug = String(formData.get("slug") || "");
      templateKey = String(formData.get("templateKey") || "");
      designKey = String(formData.get("designKey") || "");
    }

    const supabaseAdmin = getSupabaseAdmin();

    // ============================================================
    // ❌ REMOVED BROKEN DRAFT + SLUG LOGIC
    // ============================================================

    // ============================================================
    // PENDING CHECKOUT FLOW (PRE-CHECKOUT RESERVATION)
    // ============================================================
    if (pendingCheckoutId) {
      const { data: pendingRow, error: pendingError } = await supabaseAdmin
        .from("pending_microsite_checkouts")
        .select("*")
        .eq("id", pendingCheckoutId)
        .eq("owner_clerk_user_id", userId)
        .single();

      if (pendingError || !pendingRow) {
        return NextResponse.json(
          { ok: false, error: "Invalid request" },
          { status: 400 },
        );
      }

      // ----------------------------
      // 🔥 NEW: FETCH REAL DRAFT (CORRECT KEY)
      // ----------------------------
      const { data: draftRow, error: draftError } = await supabaseAdmin
        .from("microsite_drafts")
        .select("*")
        .eq("owner_clerk_user_id", userId)
        .eq("template_key", pendingRow.template_key)
        .eq("design_key", pendingRow.selected_design_key)
        .maybeSingle();

      if (draftError || !draftRow) {
        console.error("❌ Draft not found at checkout");
        return NextResponse.json(
          { ok: false, error: "Draft missing" },
          { status: 400 },
        );
      }

      // ----------------------------
      // 🔥 NEW: COPY DRAFT → PENDING
      // ----------------------------
      await supabaseAdmin
        .from("pending_microsite_checkouts")
        .update({
          draft: draftRow.draft,
        })
        .eq("id", pendingRow.id);

      console.log("✅ Draft copied to pending checkout");

      // ----------------------------
      // 🔒 EXPIRATION SAFETY
      // ----------------------------
      if (
        pendingRow.expires_at &&
        new Date(pendingRow.expires_at) < new Date()
      ) {
        return NextResponse.json(
          { ok: false, error: "Reservation expired" },
          { status: 400 },
        );
      }

      // ----------------------------
      // 🔒 SLUG INTEGRITY CHECK
      // ----------------------------
      if (slug && slug !== pendingRow.slug) {
        return NextResponse.json(
          { ok: false, error: "Slug mismatch" },
          { status: 400 },
        );
      }

      // ----------------------------
      // 🔒 PREVENT DUPLICATE CHECKOUT
      // ----------------------------
      if (pendingRow.stripe_session_id) {
        return NextResponse.json(
          { ok: false, error: "Checkout already initiated" },
          { status: 400 },
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Ko-Host Publish",
              },
              unit_amount: 1200, // ← change this to your price
            },
            quantity: 1,
          },
        ],
        success_url: `${appUrl}/dashboard/microsites?checkout=success&slug=${encodeURIComponent(
          pendingRow.slug,
        )}`,
        cancel_url: `${appUrl}/dashboard/microsites?checkout=cancel&slug=${encodeURIComponent(
          pendingRow.slug,
        )}`,
        metadata: {
          owner_clerk_user_id: userId,
          pending_checkout_id: pendingRow.id,
          slug: pendingRow.slug,
          title: pendingRow.title || "",
          template_key: pendingRow.template_key || "",
          design_key:
            pendingRow.selected_design_key || designKey || "",
        },
      });

      if (!session.url) {
        return NextResponse.json(
          { ok: false, error: "Failed to create checkout session" },
          { status: 500 },
        );
      }

      await supabaseAdmin
        .from("pending_microsite_checkouts")
        .update({
          stripe_session_id: session.id,
        })
        .eq("id", pendingRow.id);

      return NextResponse.redirect(session.url, 303);
    }

    // ============================================================
    // EXISTING MICROSITE CHECKOUT FLOW (UNCHANGED)
    // ============================================================
    if (micrositeId) {
      const { data: micrositeRow, error: micrositeError } =
        await supabaseAdmin
          .from("microsites")
          .select("id, owner_clerk_user_id, slug, title, template_key")
          .eq("id", micrositeId)
          .eq("owner_clerk_user_id", userId)
          .single();

      if (micrositeError || !micrositeRow) {
        return NextResponse.json(
          { ok: false, error: "Invalid request" },
          { status: 400 },
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Ko-Host Publish",
              },
              unit_amount: 1200, // ← change this to your price
            },
            quantity: 1,
          },
        ],
        success_url: `${appUrl}/dashboard/microsites?checkout=success&micrositeId=${encodeURIComponent(
          micrositeRow.id,
        )}`,
        cancel_url: `${appUrl}/dashboard/microsites?checkout=cancel&micrositeId=${encodeURIComponent(
          micrositeRow.id,
        )}`,
        metadata: {
          owner_clerk_user_id: userId,
          microsite_id: micrositeRow.id,
          slug: micrositeRow.slug,
          title: micrositeRow.title || "",
          template_key: micrositeRow.template_key || "",
        },
      });

      if (!session.url) {
        return NextResponse.json(
          { ok: false, error: "Failed to create checkout session" },
          { status: 500 },
        );
      }

      return NextResponse.redirect(session.url, 303);
    }

    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}