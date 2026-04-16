import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripe, toCents, calcPlatformFee, getBaseUrl } from "@/lib/stripe";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type CheckoutBlockData = {
  productName: string;
  price: number;
  currency: string;
  allowQuantity: boolean;
  description?: string;
  imageUrl?: string;
  buttonText?: string;
  successMessage?: string;
  redirectUrl?: string;
  collectEmail?: boolean;
  collectName?: boolean;
  collectAddress?: boolean;
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const blockId =
      body && typeof body === "object" && typeof body.blockId === "string"
        ? body.blockId
        : null;

    const micrositeId =
      body && typeof body === "object" && typeof body.micrositeId === "string"
        ? body.micrositeId
        : null;

    if (!blockId) {
      return NextResponse.json({ error: "Missing blockId" }, { status: 400 });
    }

    if (!micrositeId) {
      return NextResponse.json(
        { error: "Checkout only works on a live microsite right now." },
        { status: 400 },
      );
    }

    const { data: microsite, error: micrositeError } = await supabase
      .from("microsites")
      .select("id, draft, slug, stripe_account_id, site_visibility")
      .eq("id", micrositeId)
      .single();

    if (micrositeError || !microsite) {
      return NextResponse.json(
        { error: "Microsite not found" },
        { status: 404 },
      );
    }

    const stripeAccountId = microsite.stripe_account_id ?? null;

    if (!stripeAccountId) {
      return NextResponse.json(
        { error: "Stripe not connected" },
        { status: 400 },
      );
    }

    const draft =
      microsite.draft && typeof microsite.draft === "object"
        ? microsite.draft
        : null;

    const blocks = Array.isArray((draft as any)?.blocks)
      ? ((draft as any).blocks as Array<any>)
      : [];

    const checkoutBlock = blocks.find(
      (block) => block && block.id === blockId && block.type === "checkout",
    );

    if (!checkoutBlock || !checkoutBlock.data) {
      return NextResponse.json(
        { error: "Checkout block not found" },
        { status: 404 },
      );
    }

    const data = checkoutBlock.data as CheckoutBlockData;

    const productName =
      typeof data.productName === "string" && data.productName.trim()
        ? data.productName.trim()
        : "Product";

    const currency =
      typeof data.currency === "string" && data.currency.trim()
        ? data.currency.trim().toLowerCase()
        : "usd";

    const price =
      typeof data.price === "number" && Number.isFinite(data.price)
        ? Math.max(0, data.price)
        : 0;

    if (price <= 0) {
      return NextResponse.json(
        { error: "Invalid checkout price" },
        { status: 400 },
      );
    }

    const amount = toCents(price);
    const fee = calcPlatformFee(amount);

    const successTarget =
      typeof data.redirectUrl === "string" && data.redirectUrl.trim()
        ? data.redirectUrl.trim()
        : `${getBaseUrl()}/s/${microsite.slug}?checkout=success`;

    const cancelTarget = `${getBaseUrl()}/s/${microsite.slug}?checkout=cancelled`;

    const allowQuantity = Boolean(data.allowQuantity);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: productName,
              description:
                typeof data.description === "string" && data.description.trim()
                  ? data.description.trim()
                  : undefined,
              images:
                typeof data.imageUrl === "string" && data.imageUrl.trim()
                  ? [data.imageUrl.trim()]
                  : undefined,
            },
            unit_amount: amount,
          },
          quantity: 1,
          adjustable_quantity: allowQuantity
            ? {
                enabled: true,
                minimum: 1,
                maximum: 25,
              }
            : undefined,
        },
      ],
      success_url: successTarget,
      cancel_url: cancelTarget,
      billing_address_collection: data.collectAddress ? "required" : "auto",
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
        micrositeId,
        blockId,
        stripeAccountId,
        productName,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout session error:", error);

    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}