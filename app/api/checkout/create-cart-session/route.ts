import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripe, toCents, calcPlatformFee, getBaseUrl } from "@/lib/stripe";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type ListingBlockData = {
  title?: string;
  description?: string;
  price?: number;
  addToCart?: boolean;
};

type CartBlockData = {
  heading?: string;
  taxRate?: number;
  discount?: number;
  buttonText?: string;
};

type CartSessionLineItem = {
  price_data: {
    currency: string;
    product_data: {
      name: string;
      description?: string;
    };
    unit_amount: number;
  };
  quantity: number;
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

    const account = await stripe.accounts.retrieve(stripeAccountId);

    if (!account.charges_enabled) {
      return NextResponse.json(
        { error: "Stripe onboarding not complete" },
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

    const cartBlock = blocks.find(
      (block) => block && block.id === blockId && block.type === "cart",
    );

    if (!cartBlock || !cartBlock.data) {
      return NextResponse.json(
        { error: "Cart block not found" },
        { status: 404 },
      );
    }

    const cartData = cartBlock.data as CartBlockData;

    const listingBlocks = blocks.filter(
      (block) => block && block.type === "listing" && block.data?.addToCart,
    );

    if (!listingBlocks.length) {
      return NextResponse.json(
        { error: "No cart items found" },
        { status: 400 },
      );
    }

    const lineItems: CartSessionLineItem[] =
      listingBlocks.reduce<CartSessionLineItem[]>((acc, block) => {
        const data = block.data as ListingBlockData;

        const title =
          typeof data.title === "string" && data.title.trim().length > 0
            ? data.title.trim()
            : "Item";

        const description =
          typeof data.description === "string" &&
          data.description.trim().length > 0
            ? data.description.trim()
            : undefined;

        const price =
          typeof data.price === "number" && Number.isFinite(data.price)
            ? Math.max(0, data.price)
            : 0;

        if (price <= 0) return acc;

        const unitAmount = toCents(price);

        acc.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: title,
              ...(description ? { description } : {}),
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        });

        return acc;
      }, []);

    if (!lineItems.length) {
      return NextResponse.json(
        { error: "No valid cart items found" },
        { status: 400 },
      );
    }

    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.price_data.unit_amount * item.quantity,
      0,
    );

    const taxRate =
      typeof cartData.taxRate === "number" && Number.isFinite(cartData.taxRate)
        ? Math.max(0, cartData.taxRate)
        : 0;

    const taxCents = Math.round(subtotal * (taxRate / 100));

    const discount =
  typeof cartData.discount === "number" && Number.isFinite(cartData.discount)
    ? Math.max(0, cartData.discount)
    : 0;

const discountCents = toCents(discount);
const adjustedTotal = Math.max(0, subtotal + taxCents - discountCents);
    const fee = calcPlatformFee(adjustedTotal);

    const successTarget = `${getBaseUrl()}/s/${microsite.slug}?cart=success`;
    const cancelTarget = `${getBaseUrl()}/s/${microsite.slug}?cart=cancelled`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        ...lineItems,
        ...(taxCents > 0
          ? [
              {
                price_data: {
                  currency: "usd",
                  product_data: {
                    name: "Tax",
                  },
                  unit_amount: taxCents,
                },
                quantity: 1,
              } as CartSessionLineItem,
            ]
          : []),
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
        micrositeId,
        blockId,
        stripeAccountId,
        checkoutType: "cart",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    console.error("Cart checkout session error:", error);

    return NextResponse.json(
      {
        error: "Failed to create cart checkout session",
        details: message,
      },
      { status: 500 },
    );
  }
}