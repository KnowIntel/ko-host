import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: microsite, error: micrositeError } = await supabase
      .from("microsites")
      .select("id, slug, title, owner_clerk_user_id")
      .eq("id", id)
      .eq("owner_clerk_user_id", userId)
      .maybeSingle();

    if (micrositeError || !microsite) {
      return NextResponse.json(
        { error: "Microsite not found." },
        { status: 404 },
      );
    }

    const { data: cartRows, error: cartError } = await supabase
      .from("cart_checkouts")
      .select("buyer_email, buyer_name")
      .eq("slug", microsite.slug)
      .not("buyer_email", "is", null);

    if (cartError) {
      return NextResponse.json(
        { error: "Failed to load cart recipients." },
        { status: 500 },
      );
    }

    const { data: donationRows, error: donationError } = await supabase
      .from("donation_checkouts")
      .select("buyer_email, buyer_name")
      .eq("microsite_id", microsite.id)
      .not("buyer_email", "is", null);

    if (donationError) {
      return NextResponse.json(
        { error: "Failed to load donation recipients." },
        { status: 500 },
      );
    }

    const map = new Map<
      string,
      { email: string; source: "cart" | "donation"; label: string }
    >();

    for (const row of cartRows ?? []) {
      const email =
        typeof row?.buyer_email === "string" ? row.buyer_email.trim().toLowerCase() : "";
      if (!email) continue;

      const buyerName =
        typeof row?.buyer_name === "string" && row.buyer_name.trim()
          ? row.buyer_name.trim()
          : "Cart customer";

      if (!map.has(email)) {
        map.set(email, {
          email,
          source: "cart",
          label: `${buyerName} • Cart`,
        });
      }
    }

    for (const row of donationRows ?? []) {
      const email =
        typeof row?.buyer_email === "string" ? row.buyer_email.trim().toLowerCase() : "";
      if (!email) continue;

      const buyerName =
        typeof row?.buyer_name === "string" && row.buyer_name.trim()
          ? row.buyer_name.trim()
          : "Donor";

      if (!map.has(email)) {
        map.set(email, {
          email,
          source: "donation",
          label: `${buyerName} • Donation`,
        });
      }
    }

    return NextResponse.json({
      recipients: Array.from(map.values()),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected server error",
      },
      { status: 500 },
    );
  }
}