// app\api\stripe\connect\refresh\route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe, getBaseUrl } from "@/lib/stripe";

/**
 * REPLACE THIS WITH YOUR REAL DB LOGIC.
 */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getExistingStripeAccountIdForUser(
  clerkUserId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("microsites")
    .select("stripe_account_id")
    .eq("owner_clerk_user_id", clerkUserId)
    .not("stripe_account_id", "is", null)
    .limit(1)
    .maybeSingle();

  return data?.stripe_account_id ?? null;
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.redirect(`${getBaseUrl()}/sign-in`);
    }

    const stripeAccountId = await getExistingStripeAccountIdForUser(userId);

    if (!stripeAccountId) {
      return NextResponse.redirect(
        `${getBaseUrl()}/dashboard?stripe=missing_account`,
      );
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${getBaseUrl()}/api/stripe/connect/refresh`,
      return_url: `${getBaseUrl()}/api/stripe/connect/return`,
      type: "account_onboarding",
      collection_options: {
        fields: "eventually_due",
      },
    });

    return NextResponse.redirect(accountLink.url);
  } catch (error) {
    console.error("Stripe connect refresh error:", error);
    return NextResponse.redirect(
      `${getBaseUrl()}/dashboard?stripe=refresh_error`,
    );
  }
}