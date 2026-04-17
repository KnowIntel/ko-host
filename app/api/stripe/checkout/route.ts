import Stripe from "stripe";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

if (!appUrl) {
  throw new Error("Missing NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_BASE_URL");
}

const stripe = new Stripe(stripeSecretKey);

const MICROSITE_PRICE_CENTS = 1000; // $10.00
const MICROSITE_CURRENCY = "usd";

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

    const micrositeLineItem = {
      price_data: {
        currency: MICROSITE_CURRENCY,
        product_data: {
          name: "Ko-Host Microsite",
          description: "Publish or extend your microsite for 90 days",
        },
        unit_amount: MICROSITE_PRICE_CENTS,
      },
      quantity: 1,
    } as const;

    // ============================================================
    // PENDING CHECKOUT FLOW (PUBLISH NEW MICROSITE)
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
        new Date(pendingRow.expires_at) < new Date()
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

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [micrositeLineItem],
        success_url: `${appUrl}/dashboard/microsites?checkout=success&slug=${encodeURIComponent(
          pendingRow.slug,
        )}`,
        cancel_url: `${appUrl}/dashboard/microsites?checkout=cancel&slug=${encodeURIComponent(
          pendingRow.slug,
        )}`,
        metadata: {
          checkout_kind: "pending_microsite_publish",
          owner_clerk_user_id: userId,
          pending_checkout_id: pendingRow.id,
          slug: pendingRow.slug,
          title: pendingRow.title || "",
          template_key: pendingRow.template_key || "",
          design_key: pendingRow.design_key || "",
        },
      });

      if (!session.url) {
        return NextResponse.json(
          { ok: false, error: "Failed to create checkout session" },
          { status: 500 },
        );
      }

      if (contentType.includes("application/json")) {
        return NextResponse.json({
          ok: true,
          url: session.url,
        });
      }

      return NextResponse.redirect(session.url, { status: 303 });
    }

    // ============================================================
    // EXISTING MICROSITE FLOW (EXTEND 90 DAYS)
    // ============================================================
    if (micrositeId) {
      const { data: microsite, error: micrositeError } = await supabaseAdmin
        .from("microsites")
        .select("id, slug, title, owner_clerk_user_id")
        .eq("id", micrositeId)
        .single();

      if (micrositeError || !microsite) {
        return NextResponse.json(
          { ok: false, error: "Microsite not found" },
          { status: 404 },
        );
      }

      if (microsite.owner_clerk_user_id !== userId) {
        return NextResponse.json(
          { ok: false, error: "Unauthorized" },
          { status: 401 },
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [micrositeLineItem],
        success_url: `${appUrl}/dashboard/microsites?checkout=success&micrositeId=${encodeURIComponent(
          microsite.id,
        )}`,
        cancel_url: `${appUrl}/dashboard/microsites?checkout=cancel&micrositeId=${encodeURIComponent(
          microsite.id,
        )}`,
        metadata: {
          checkout_kind: "microsite_extend",
          owner_clerk_user_id: userId,
          microsite_id: microsite.id,
          slug: microsite.slug,
          title: microsite.title || "",
        },
      });

      if (!session.url) {
        return NextResponse.json(
          { ok: false, error: "Failed to create checkout session" },
          { status: 500 },
        );
      }

      if (contentType.includes("application/json")) {
        return NextResponse.json({
          ok: true,
          url: session.url,
        });
      }

      return NextResponse.redirect(session.url, { status: 303 });
    }

    return NextResponse.json(
      { ok: false, error: "Missing checkout target" },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unexpected error",
      },
      { status: 500 },
    );
  }
}