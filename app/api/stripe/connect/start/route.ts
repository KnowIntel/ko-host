import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe, getBaseUrl } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function saveStripeAccountIdForMicrosite(
  micrositeId: string,
  clerkUserId: string,
  stripeAccountId: string,
): Promise<void> {
  const { error } = await supabase
    .from("microsites")
    .update({ stripe_account_id: stripeAccountId })
    .eq("id", micrositeId)
    .eq("owner_clerk_user_id", clerkUserId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);

    const micrositeId =
      body && typeof body === "object" && typeof body.micrositeId === "string"
        ? body.micrositeId
        : null;

    if (!micrositeId) {
      return NextResponse.json(
        { error: "Missing micrositeId" },
        { status: 400 },
      );
    }

    const { data: microsite, error: micrositeError } = await supabase
      .from("microsites")
      .select("id, slug, owner_clerk_user_id, stripe_account_id")
      .eq("id", micrositeId)
      .eq("owner_clerk_user_id", userId)
      .single();

    if (micrositeError || !microsite) {
      return NextResponse.json(
        { error: "Microsite not found" },
        { status: 404 },
      );
    }

    let stripeAccountId =
      typeof microsite.stripe_account_id === "string" &&
      microsite.stripe_account_id.trim().length > 0
        ? microsite.stripe_account_id.trim()
        : null;

    if (!stripeAccountId) {
      const { data: existingMicrositeWithStripe } = await supabase
        .from("microsites")
        .select("stripe_account_id")
        .eq("owner_clerk_user_id", userId)
        .not("stripe_account_id", "is", null)
        .limit(1)
        .maybeSingle();

      stripeAccountId =
        typeof existingMicrositeWithStripe?.stripe_account_id === "string" &&
        existingMicrositeWithStripe.stripe_account_id.trim().length > 0
          ? existingMicrositeWithStripe.stripe_account_id.trim()
          : null;
    }

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        metadata: {
          clerkUserId: userId,
          micrositeId,
        },
      });

      stripeAccountId = account.id;
    }

    await saveStripeAccountIdForMicrosite(micrositeId, userId, stripeAccountId);

    const baseUrl = getBaseUrl();

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${baseUrl}/api/stripe/connect/refresh?micrositeId=${encodeURIComponent(micrositeId)}`,
      return_url: `${baseUrl}/dashboard/microsites/${encodeURIComponent(micrositeId)}?stripe=connected`,
      type: "account_onboarding",
      collection_options: {
        fields: "eventually_due",
      },
    });

    return NextResponse.json({
      url: accountLink.url,
      stripeAccountId,
    });
  } catch (error) {
    console.error("Stripe connect start error:", error);

    return NextResponse.json(
      {
        error: "Failed to start Stripe onboarding",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}