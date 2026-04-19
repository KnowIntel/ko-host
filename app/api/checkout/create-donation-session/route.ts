import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripe, toCents, calcPlatformFee, getBaseUrl } from "@/lib/stripe";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const micrositeId =
      body && typeof body === "object" && typeof body.micrositeId === "string"
        ? body.micrositeId
        : null;

    const blockId =
      body && typeof body === "object" && typeof body.blockId === "string"
        ? body.blockId
        : null;

    const label =
      body && typeof body === "object" && typeof body.label === "string"
        ? body.label.trim()
        : "Donation";

    const amount =
      body && typeof body === "object" && typeof body.amount === "number"
        ? body.amount
        : 0;

    if (!micrositeId) {
      return NextResponse.json(
        { error: "Missing micrositeId" },
        { status: 400 },
      );
    }

    if (!blockId) {
      return NextResponse.json(
        { error: "Missing blockId" },
        { status: 400 },
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid donation amount" },
        { status: 400 },
      );
    }

    const { data: microsite, error: micrositeError } = await supabase
      .from("microsites")
      .select("id, slug, stripe_account_id")
      .eq("id", micrositeId)
      .single();

    if (micrositeError || !microsite) {
      return NextResponse.json(
        { error: "Microsite not found" },
        { status: 404 },
      );
    }

    const stripeAccountId =
      typeof microsite.stripe_account_id === "string" &&
      microsite.stripe_account_id.trim().length > 0
        ? microsite.stripe_account_id.trim()
        : null;

    if (!stripeAccountId) {
      return NextResponse.json(
        { error: "Stripe not connected" },
        { status: 400 },
      );
    }

    const account = await stripe.accounts.retrieve(stripeAccountId);

    if (!account.charges_enabled) {
      return NextResponse.json(
        { error: "Stripe onboarding not complete" },
        { status: 400 },
      );
    }

    const amountCents = toCents(amount);
    const fee = calcPlatformFee(amountCents);

    const successTarget = `${getBaseUrl()}/s/${microsite.slug}?donation=success`;
    const cancelTarget = `${getBaseUrl()}/s/${microsite.slug}?donation=cancelled`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: label || "Donation",
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: successTarget,
      cancel_url: cancelTarget,
      billing_address_collection: "auto",
      phone_number_collection: {
        enabled: false,
      },
      customer_creation: "always",
      payment_intent_data: {
        application_fee_amount: fee,
        transfer_data: {
          destination: stripeAccountId,
        },
      },
      metadata: {
        flow: "donation",
        micrositeId,
        blockId,
        stripeAccountId,
        donationLabel: label || "Donation",
        donationAmount: String(amount),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    console.error("Donation checkout session error:", error);

    return NextResponse.json(
      {
        error: "Failed to create donation checkout session",
        details: message,
      },
      { status: 500 },
    );
  }
}