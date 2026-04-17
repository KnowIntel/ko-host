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
      .select("id, owner_clerk_user_id")
      .eq("id", id)
      .single();

    if (micrositeError || !microsite) {
      return NextResponse.json({ error: "Microsite not found" }, { status: 404 });
    }

    if (microsite.owner_clerk_user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: payments, error: paymentsError } = await supabase
      .from("checkout_payments_with_microsite")
      .select("*")
      .eq("microsite_id", id)
      .order("created_at", { ascending: false });

    if (paymentsError) {
      return NextResponse.json(
        { error: "Failed to load payments", details: paymentsError.message },
        { status: 500 },
      );
    }

    const paidPayments = (payments ?? []).filter(
      (p) => p.payment_status === "paid",
    );

    const grossCents = paidPayments.reduce(
      (sum, p) => sum + (typeof p.amount_total === "number" ? p.amount_total : 0),
      0,
    );

    return NextResponse.json({
      payments: payments ?? [],
      summary: {
        totalPayments: paidPayments.length,
        grossCents,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Payments route failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}