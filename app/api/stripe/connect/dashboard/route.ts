import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

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

    // Verify ownership + get stripe account
    const { data: microsite, error } = await supabase
      .from("microsites")
      .select("owner_clerk_user_id, stripe_account_id")
      .eq("id", micrositeId)
      .single();

    if (error || !microsite) {
      return NextResponse.json(
        { error: "Microsite not found" },
        { status: 404 },
      );
    }

    if (microsite.owner_clerk_user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const stripeAccountId =
      typeof microsite.stripe_account_id === "string"
        ? microsite.stripe_account_id
        : null;

    if (!stripeAccountId) {
      return NextResponse.json(
        { error: "Stripe not connected" },
        { status: 400 },
      );
    }

    // 🔥 THIS IS THE KEY
    const loginLink = await stripe.accounts.createLoginLink(
      stripeAccountId,
    );

    return NextResponse.json({ url: loginLink.url });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create Stripe dashboard link",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}