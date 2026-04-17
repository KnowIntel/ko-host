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
      .select("id, draft, slug, stripe_account_id")
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

    const draft =
      microsite.draft && typeof microsite.draft === "object"
        ? microsite.draft
        : null;

    const blocks = Array.isArray((draft as { blocks?: unknown[] } | null)?.blocks)
      ? (((draft as { blocks?: unknown[] }).blocks ?? []) as Array<any>)
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
      typeof data.productName === "string" && data.productName.trim().length > 0
        ? data.productName.trim()
        : "Product";

    const currency =
      typeof data.currency === "string" && data.currency.trim().length > 0
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
      typeof data.redirectUrl === "string" && data.redirectUrl.trim().length > 0
        ? data.redirectUrl.trim()
        : `${getBaseUrl()}/s/${microsite.slug}?checkout=success`;

    const cancelTarget = `${getBaseUrl()}/s/${microsite.slug}?checkout=cancelled`;

    const allowQuantity = Boolean(data.allowQuantity);

    const description =
      typeof data.description === "string" && data.description.trim().length > 0
        ? data.description.trim()
        : undefined;

    const imageUrl =
      typeof data.imageUrl === "string" && data.imageUrl.trim().length > 0
        ? data.imageUrl.trim()
        : undefined;

    const productData: {
      name: string;
      description?: string;
      images?: string[];
    } = {
      name: productName,
    };

    if (description !== undefined) {
      productData.description = description;
    }

    if (imageUrl !== undefined) {
      productData.images = [imageUrl];
    }

    await stripe.accounts.retrieve(stripeAccountId);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency,
            product_data: productData,
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
    const message =
      error instanceof Error ? error.message : "Unknown error";

    console.error("Checkout session error:", error);

    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: message,
      },
      { status: 500 },
    );
  }
}