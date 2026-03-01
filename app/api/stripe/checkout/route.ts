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

  // HTML <form> POST
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const raw = {
      templateKey: String(form.get("templateKey") ?? "")
    };
    const parsed = FormSchema.parse(raw);
    return { templateKey: parsed.templateKey, wantsRedirect: true };
  }

  // JSON POST
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

    const { templateKey, successPath, cancelPath, wantsRedirect } = await parseRequest(req);

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
        { clerk_user_id: userId, stripe_customer_id: stripeCustomerId },
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
      automatic_tax: { enabled: false }
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe session missing url" }, { status: 500 });
    }

    // If this came from an HTML form, redirect the browser straight to Stripe
    if (wantsRedirect) {
      return NextResponse.redirect(session.url, 303);
    }

    // JSON clients can use the url
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    const msg = typeof err?.message === "string" ? err.message : "Server error";
    console.error("POST /api/stripe/checkout failed", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}