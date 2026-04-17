import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe, getBaseUrl } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function saveStripeAccountIdForUser(
  clerkUserId: string,
  stripeAccountId: string,
): Promise<void> {
  const { error } = await supabase
    .from("microsites")
    .update({ stripe_account_id: stripeAccountId })
    .eq("owner_clerk_user_id", clerkUserId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const account = await stripe.accounts.create({
      type: "express",
      metadata: {
        clerkUserId: userId,
      },
    });

    const stripeAccountId = account.id;
    await saveStripeAccountIdForUser(userId, stripeAccountId);

    const baseUrl = getBaseUrl();

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${baseUrl}/api/stripe/connect/refresh`,
      return_url: `${baseUrl}/api/stripe/connect/return`,
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