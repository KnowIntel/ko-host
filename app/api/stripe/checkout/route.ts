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

const PUBLISH_PRICE_CENTS = 1200;

function buildDashboardUrl(params: Record<string, string>) {
  const url = new URL("/dashboard/microsites", appUrl);

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

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
    // PENDING CHECKOUT FLOW (PRE-PUBLISH)
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

      if (
        pendingRow.expires_at &&
        new Date(pendingRow.expires_at).getTime() < Date.now()
      ) {
        return NextResponse.json(
          { ok: false, error: "Reservation expired" },
          { status: 400 },
        );
      }

      if (slug && slug !== pendingRow.slug) {
        return NextResponse.json(
          { ok: false, error: "Slug mismatch" },
          { status: 400 },
        );
      }

      if (pendingRow.stripe_session_id) {
        return NextResponse.json(
          { ok: false, error: "Checkout already initiated" },
          { status: 400 },
        );
      }

      const resolvedTemplateKey =
        pendingRow.template_key || templateKey || "";
      const resolvedDesignKey =
        pendingRow.selected_design_key || designKey || "";

      const { data: draftRow, error: draftError } = await supabaseAdmin
        .from("microsite_drafts")
        .select("*")
        .eq("owner_clerk_user_id", userId)
        .eq("template_key", resolvedTemplateKey)
        .eq("design_key", resolvedDesignKey)
        .maybeSingle();

      if (draftError || !draftRow) {
        console.error("Draft not found at publish checkout", {
          userId,
          templateKey: resolvedTemplateKey,
          designKey: resolvedDesignKey,
          draftError,
        });

        return NextResponse.json(
          { ok: false, error: "Draft missing" },
          { status: 400 },
        );
      }

      const { error: updatePendingError } = await supabaseAdmin
        .from("pending_microsite_checkouts")
        .update({
          draft: draftRow.draft,
        })
        .eq("id", pendingRow.id);

      if (updatePendingError) {
        console.error("Failed to copy draft into pending checkout", {
          pendingCheckoutId: pendingRow.id,
          updatePendingError,
        });

        return NextResponse.json(
          { ok: false, error: "Failed to prepare checkout" },
          { status: 500 },
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        client_reference_id: pendingRow.id,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Ko-Host Publish",
              },
              unit_amount: PUBLISH_PRICE_CENTS,
            },
            quantity: 1,
          },
        ],
        success_url: buildDashboardUrl({
          checkout: "success",
          session_id: "{CHECKOUT_SESSION_ID}",
          slug: pendingRow.slug || "",
        }),
        cancel_url: buildDashboardUrl({
          checkout: "cancel",
          slug: pendingRow.slug || "",
        }),
        metadata: {
          flow: "publish",
          owner_clerk_user_id: userId,
          pending_checkout_id: pendingRow.id,
          pendingCheckoutId: pendingRow.id,
          microsite_id: "",
          micrositeId: "",
          slug: pendingRow.slug || "",
          title: pendingRow.title || "",
          template_key: resolvedTemplateKey,
          templateKey: resolvedTemplateKey,
          design_key: resolvedDesignKey,
          designKey: resolvedDesignKey,
        },
      });

      if (!session.url) {
        return NextResponse.json(
          { ok: false, error: "Failed to create checkout session" },
          { status: 500 },
        );
      }

      const { error: storeSessionError } = await supabaseAdmin
        .from("pending_microsite_checkouts")
        .update({
          stripe_session_id: session.id,
        })
        .eq("id", pendingRow.id);

      if (storeSessionError) {
        console.error("Failed to store Stripe session ID", {
          pendingCheckoutId: pendingRow.id,
          sessionId: session.id,
          storeSessionError,
        });

        return NextResponse.json(
          { ok: false, error: "Failed to persist checkout session" },
          { status: 500 },
        );
      }

      return NextResponse.redirect(session.url, 303);
    }

    // ============================================================
    // EXISTING MICROSITE CHECKOUT FLOW
    // ============================================================
    if (micrositeId) {
      const { data: micrositeRow, error: micrositeError } = await supabaseAdmin
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

      const resolvedTemplateKey =
        micrositeRow.template_key || templateKey || "";

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        client_reference_id: micrositeRow.id,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Ko-Host Publish",
              },
              unit_amount: PUBLISH_PRICE_CENTS,
            },
            quantity: 1,
          },
        ],
        success_url: buildDashboardUrl({
          checkout: "success",
          session_id: "{CHECKOUT_SESSION_ID}",
          micrositeId: micrositeRow.id,
        }),
        cancel_url: buildDashboardUrl({
          checkout: "cancel",
          micrositeId: micrositeRow.id,
        }),
        metadata: {
          flow: "publish",
          owner_clerk_user_id: userId,
          pending_checkout_id: "",
          pendingCheckoutId: "",
          microsite_id: micrositeRow.id,
          micrositeId: micrositeRow.id,
          slug: micrositeRow.slug || "",
          title: micrositeRow.title || "",
          template_key: resolvedTemplateKey,
          templateKey: resolvedTemplateKey,
          design_key: designKey || "",
          designKey: designKey || "",
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
    console.error("Stripe publish checkout route error", error);

    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}