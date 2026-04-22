import { randomUUID } from "crypto";
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
  discountType?: "flat" | "percent";
  buttonText?: string;
  emptyMessage?: string;
  currency?: string;
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
    const currency =
      typeof cartData.currency === "string" && cartData.currency.trim().length > 0
        ? cartData.currency.trim().toLowerCase()
        : "usd";

const items =
  body &&
  typeof body === "object" &&
  Array.isArray(body.items)
    ? body.items
    : [];

if (!items.length) {
  return NextResponse.json(
    { error: "No cart items provided" },
    { status: 400 },
  );
}

const lineItems: CartSessionLineItem[] = items
  .map((item: any) => {
    const title =
      typeof item.title === "string" && item.title.trim()
        ? item.title.trim()
        : "Item";

    const description =
      typeof item.description === "string" && item.description.trim()
        ? item.description.trim()
        : undefined;

    const price =
      typeof item.price === "number" && Number.isFinite(item.price)
        ? Math.max(0, item.price)
        : 0;

    const quantity =
      typeof item.quantity === "number" && Number.isFinite(item.quantity)
        ? Math.max(1, Math.floor(item.quantity))
        : 1;

    if (price <= 0) return null;

    return {
      price_data: {
        currency,
        product_data: {
          name: title,
          ...(description ? { description } : {}),
        },
        unit_amount: toCents(price),
      },
      quantity,
    };
  })
  .filter(Boolean) as CartSessionLineItem[];

if (!lineItems.length) {
  return NextResponse.json(
    { error: "No valid cart items" },
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

   const taxCents = Math.round(subtotal * taxRate);

const discount =
  typeof cartData.discount === "number" && Number.isFinite(cartData.discount)
    ? Math.max(0, cartData.discount)
    : 0;

const discountType = cartData.discountType === "percent" ? "percent" : "flat";

const discountCents =
  discountType === "percent"
    ? Math.round((subtotal + taxCents) * (discount / 100))
    : toCents(discount);

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
              currency,
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
    flow: "cart",
    micrositeId,
    blockId,
    stripeAccountId,
  },
});

const cartItemsForDb = items.map((item: any) => ({
  id:
    typeof item.id === "string" && item.id.trim().length > 0
      ? item.id
      : randomUUID(),
  name:
    typeof item.title === "string" && item.title.trim().length > 0
      ? item.title.trim()
      : "Item",
  description:
    typeof item.description === "string" ? item.description : "",
  price:
    typeof item.price === "number" && Number.isFinite(item.price)
      ? Math.max(0, item.price)
      : 0,
  quantity:
    typeof item.quantity === "number" && Number.isFinite(item.quantity)
      ? Math.max(1, Math.floor(item.quantity))
      : 1,
}));

const { error: cartInsertError } = await supabase
  .from("cart_checkouts")
  .insert({
    stripe_session_id: session.id,
    slug: microsite.slug,
    cart_items: cartItemsForDb,
    subtotal: subtotal / 100,
    tax: taxCents / 100,
    discount: discountCents / 100,
    total: adjustedTotal / 100,
    currency,
    payment_status: "pending",
  });

if (cartInsertError) {
  console.error("Failed to create cart checkout row:", cartInsertError);

  return NextResponse.json(
    {
      error: "Failed to create cart checkout record",
      details: cartInsertError.message,
    },
    { status: 500 },
  );
}

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