// app\api\stripe\connect\return\route.ts

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

    const account = await stripe.accounts.retrieve(stripeAccountId);

    const isReady =
      Boolean(account.details_submitted) &&
      (!account.requirements ||
        !account.requirements.currently_due ||
        account.requirements.currently_due.length === 0);

    return NextResponse.redirect(
      `${getBaseUrl()}/dashboard?stripe=${
        isReady ? "connected" : "incomplete"
      }`,
    );
  } catch (error) {
    console.error("Stripe connect return error:", error);
    return NextResponse.redirect(
      `${getBaseUrl()}/dashboard?stripe=return_error`,
    );
  }
}