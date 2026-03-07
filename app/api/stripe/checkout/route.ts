import Stripe from "stripe";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
const priceId = process.env.STRIPE_PRICE_ID_MICROSITE;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

if (!appUrl) {
  throw new Error("Missing NEXT_PUBLIC_APP_URL");
}

if (!priceId) {
  throw new Error("Missing STRIPE_PRICE_ID_MICROSITE");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";

    let pendingCheckoutId = "";
    let micrositeId = "";
    let slug = "";
    let templateKey = "";

    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));

      pendingCheckoutId = String(body?.pendingCheckoutId || "");
      micrositeId = String(body?.micrositeId || "");
      slug = String(body?.slug || "");
      templateKey = String(body?.templateKey || "");
    } else {
      const formData = await req.formData();

      pendingCheckoutId = String(formData.get("pendingCheckoutId") || "");
      micrositeId = String(formData.get("micrositeId") || "");
      slug = String(formData.get("slug") || "");
      templateKey = String(formData.get("templateKey") || "");
    }

    const supabaseAdmin = getSupabaseAdmin();

    if (pendingCheckoutId) {
      const { data: pendingRow, error: pendingError } = await supabaseAdmin
        .from("pending_microsite_checkouts")
        .select("id, owner_clerk_user_id, slug, title, template_key")
        .eq("id", pendingCheckoutId)
        .eq("owner_clerk_user_id", userId)
        .single();

      if (pendingError || !pendingRow) {
        return NextResponse.json(
          { ok: false, error: "Invalid request" },
          { status: 400 },
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price: priceId,
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

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price: priceId,
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

    if (slug) {
      const { data: pendingBySlug, error: pendingBySlugError } = await supabaseAdmin
        .from("pending_microsite_checkouts")
        .select("id, owner_clerk_user_id, slug, title, template_key")
        .eq("slug", slug)
        .eq("owner_clerk_user_id", userId)
        .maybeSingle();

      if (!pendingBySlugError && pendingBySlug) {
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          success_url: `${appUrl}/dashboard/microsites?checkout=success&slug=${encodeURIComponent(
            pendingBySlug.slug,
          )}`,
          cancel_url: `${appUrl}/dashboard/microsites?checkout=cancel&slug=${encodeURIComponent(
            pendingBySlug.slug,
          )}`,
          metadata: {
            owner_clerk_user_id: userId,
            pending_checkout_id: pendingBySlug.id,
            slug: pendingBySlug.slug,
            title: pendingBySlug.title || "",
            template_key: pendingBySlug.template_key || templateKey || "",
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

      const { data: micrositeBySlug, error: micrositeBySlugError } = await supabaseAdmin
        .from("microsites")
        .select("id, owner_clerk_user_id, slug, title, template_key")
        .eq("slug", slug)
        .eq("owner_clerk_user_id", userId)
        .maybeSingle();

      if (!micrositeBySlugError && micrositeBySlug) {
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          success_url: `${appUrl}/dashboard/microsites?checkout=success&micrositeId=${encodeURIComponent(
            micrositeBySlug.id,
          )}`,
          cancel_url: `${appUrl}/dashboard/microsites?checkout=cancel&micrositeId=${encodeURIComponent(
            micrositeBySlug.id,
          )}`,
          metadata: {
            owner_clerk_user_id: userId,
            microsite_id: micrositeBySlug.id,
            slug: micrositeBySlug.slug,
            title: micrositeBySlug.title || "",
            template_key: micrositeBySlug.template_key || templateKey || "",
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
    }

    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}