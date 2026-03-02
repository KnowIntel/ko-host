// app/api/stripe/checkout/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getPriceIdForTemplate } from "@/lib/stripePrices";

const JsonBodySchema = z.object({
  templateKey: z.string().min(1),
  successPath: z.string().optional(),
  cancelPath: z.string().optional()
});

const FormSchema = z.object({
  templateKey: z.string().min(1)
});

function appUrl(): string {
  const v = process.env.NEXT_PUBLIC_APP_URL;
  if (!v) throw new Error("Missing env var: NEXT_PUBLIC_APP_URL");
  return v.replace(/\/+$/, "");
}

async function parseRequest(req: Request): Promise<{
  templateKey: string;
  successPath?: string;
  cancelPath?: string;
  wantsRedirect: boolean;
}> {
  const contentType = req.headers.get("content-type") || "";

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await req.formData();
    const parsed = FormSchema.parse({
      templateKey: String(form.get("templateKey") ?? "")
    });
    return { templateKey: parsed.templateKey, wantsRedirect: true };
  }

  const json = await req.json().catch(() => null);
  const parsed = JsonBodySchema.parse(json);
  return { ...parsed, wantsRedirect: false };
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { templateKey, successPath, cancelPath, wantsRedirect } =
      await parseRequest(req);

    const priceId = getPriceIdForTemplate(templateKey);
    if (!priceId) {
      return NextResponse.json({ error: "Unknown templateKey" }, { status: 400 });
    }

    const sb = getSupabaseAdmin();

    // 🚨 SERVER-SIDE ENTITLEMENT GUARD
    const { data: entitlement } = await sb
      .from("entitlements")
      .select("*")
      .eq("clerk_user_id", userId)
      .eq("template_key", templateKey)
      .maybeSingle();

    const now = new Date();

    if (
      entitlement &&
      entitlement.status === "active" &&
      entitlement.current_period_end &&
      new Date(entitlement.current_period_end) > now
    ) {
      return NextResponse.json(
        { error: "Subscription already active" },
        { status: 400 }
      );
    }

    // Find or create Stripe customer
    const { data: existing } = await sb
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    let stripeCustomerId = existing?.stripe_customer_id ?? null;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        metadata: { clerk_user_id: userId }
      });

      stripeCustomerId = customer.id;

      await sb.from("stripe_customers").upsert(
        { clerk_user_id: userId, stripe_customer_id: stripeCustomerId },
        { onConflict: "clerk_user_id" }
      );
    }

    const successUrl = `${appUrl()}${successPath ?? "/dashboard?checkout=success"}`;
    const cancelUrl = `${appUrl()}${cancelPath ?? "/dashboard?checkout=cancel"}`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      client_reference_id: userId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        clerk_user_id: userId,
        template_key: templateKey
      },
      subscription_data: {
        metadata: {
          clerk_user_id: userId,
          template_key: templateKey
        }
      }
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe session missing url" },
        { status: 500 }
      );
    }

    if (wantsRedirect) {
      return NextResponse.redirect(session.url, 303);
    }

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("POST /api/stripe/checkout failed", err);
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}