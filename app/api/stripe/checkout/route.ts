// app/api/stripe/checkout/route.ts
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

if (!stripeSecretKey) throw new Error("Missing STRIPE_SECRET_KEY");
if (!appUrl) throw new Error("Missing NEXT_PUBLIC_APP_URL");

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2026-02-25.clover",
});

const PUBLISH_PRICE_CENTS = 1200;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    const contentType = req.headers.get("content-type") || "";

    let flow = "";
    let pendingCheckoutId = "";
    let micrositeId = "";
    let slug = "";
    let templateKey = "";
    let designKey = "";

    // CART FIELDS
    let cartItems: any[] = [];
    let subtotal = 0;
    let tax = 0;
    let discount = 0;
    let total = 0;

    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));

      flow = String(body?.flow || "");
      pendingCheckoutId = String(body?.pendingCheckoutId || "");
      micrositeId = String(body?.micrositeId || "");
      slug = String(body?.slug || "");
      templateKey = String(body?.templateKey || "");
      designKey = String(body?.designKey || "");

      cartItems = Array.isArray(body?.cartItems) ? body.cartItems : [];
      subtotal = Number(body?.subtotal || 0);
      tax = Number(body?.tax || 0);
      discount = Number(body?.discount || 0);
      total = Number(body?.total || 0);
    } else {
      const formData = await req.formData();

      flow = String(formData.get("flow") || "");
      pendingCheckoutId = String(formData.get("pendingCheckoutId") || "");
      micrositeId = String(formData.get("micrositeId") || "");
      slug = String(formData.get("slug") || "");
      templateKey = String(formData.get("templateKey") || "");
      designKey = String(formData.get("designKey") || "");
    }

    const supabaseAdmin = getSupabaseAdmin();

    // ============================================================
    // CART CHECKOUT FLOW
    // ============================================================
    if (flow === "cart") {
      if (!cartItems.length || total <= 0) {
        return NextResponse.json(
          { ok: false, error: "Invalid cart" },
          { status: 400 },
        );
      }

      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
        cartItems.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name || "Item",
              description: item.description || undefined,
            },
            unit_amount: Math.round(Number(item.price) * 100),
          },
        }));

      // optional tax line item
      if (tax > 0) {
        line_items.push({
          quantity: 1,
          price_data: {
            currency: "usd",
            product_data: {
              name: "Tax",
            },
            unit_amount: Math.round(tax * 100),
          },
        });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items,
        success_url: `${appUrl}/s/${encodeURIComponent(
          slug,
        )}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/s/${encodeURIComponent(
          slug,
        )}?checkout=cancel`,
        metadata: {
          flow: "cart",
          slug: slug || "",
        },
      });

      if (!session.url) {
        return NextResponse.json(
          { ok: false, error: "Failed to create session" },
          { status: 500 },
        );
      }

      // store cart snapshot
      await supabaseAdmin.from("cart_checkouts").insert({
        stripe_session_id: session.id,
        slug,
        cart_items: cartItems,
        subtotal,
        tax,
        discount,
        total,
        payment_status: "pending",
      });

      return NextResponse.redirect(session.url, 303);
    }

    // ============================================================
    // PUBLISH FLOW (UNCHANGED)
    // ============================================================
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

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

      const resolvedTemplateKey = pendingRow.template_key || templateKey || "";
      const resolvedDesignKey =
        pendingRow.selected_design_key || designKey || "";

      const { data: draftRow } = await supabaseAdmin
        .from("microsite_drafts")
        .select("*")
        .eq("owner_clerk_user_id", userId)
        .eq("template_key", resolvedTemplateKey)
        .eq("design_key", resolvedDesignKey)
        .maybeSingle();

      if (!draftRow) {
        return NextResponse.json(
          { ok: false, error: "Draft missing" },
          { status: 400 },
        );
      }

      await supabaseAdmin
        .from("pending_microsite_checkouts")
        .update({ draft: draftRow.draft })
        .eq("id", pendingRow.id);

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        client_reference_id: pendingRow.id,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: "Ko-Host Publish" },
              unit_amount: PUBLISH_PRICE_CENTS,
            },
            quantity: 1,
          },
        ],
        success_url: `${appUrl}/dashboard/microsites?checkout=success&session_id={CHECKOUT_SESSION_ID}&slug=${encodeURIComponent(
          pendingRow.slug || "",
        )}`,
        cancel_url: `${appUrl}/dashboard/microsites?checkout=cancel&slug=${encodeURIComponent(
          pendingRow.slug || "",
        )}`,
        metadata: {
          flow: "publish",
          owner_clerk_user_id: userId,
          pending_checkout_id: pendingRow.id,
          slug: pendingRow.slug || "",
          template_key: resolvedTemplateKey,
          design_key: resolvedDesignKey,
        },
      });

      await supabaseAdmin
        .from("pending_microsite_checkouts")
        .update({ stripe_session_id: session.id })
        .eq("id", pendingRow.id);

      return NextResponse.redirect(session.url!, 303);
    }

    // ============================================================
    // EXISTING MICROSITE CHECKOUT FLOW
    // ============================================================
    if (micrositeId) {
      const { data: micrositeRow } = await supabaseAdmin
        .from("microsites")
        .select("id, owner_clerk_user_id, slug, title, template_key")
        .eq("id", micrositeId)
        .eq("owner_clerk_user_id", userId)
        .single();

      if (!micrositeRow) {
        return NextResponse.json(
          { ok: false, error: "Invalid request" },
          { status: 400 },
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        client_reference_id: micrositeRow.id,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: "Ko-Host Publish" },
              unit_amount: PUBLISH_PRICE_CENTS,
            },
            quantity: 1,
          },
        ],
        success_url: `${appUrl}/dashboard/microsites?checkout=success&session_id={CHECKOUT_SESSION_ID}&micrositeId=${encodeURIComponent(
          micrositeRow.id,
        )}`,
        cancel_url: `${appUrl}/dashboard/microsites?checkout=cancel&micrositeId=${encodeURIComponent(
          micrositeRow.id,
        )}`,
        metadata: {
          flow: "publish",
          owner_clerk_user_id: userId,
          microsite_id: micrositeRow.id,
          slug: micrositeRow.slug || "",
        },
      });

      return NextResponse.redirect(session.url!, 303);
    }

    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Stripe checkout route error", error);

    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 },
    );
  }
}