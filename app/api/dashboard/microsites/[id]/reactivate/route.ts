// app/api/dashboard/microsites/[id]/reactivate/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function isPaidActive(paidUntil: string | null) {
  if (!paidUntil) return false;
  return new Date(paidUntil).getTime() > Date.now();
}

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized." },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    const supabaseAdmin = getSupabaseAdmin();

    const { data: microsite, error: micrositeError } = await supabaseAdmin
      .from("microsites")
      .select("id, owner_clerk_user_id, paid_until")
      .eq("id", id)
      .eq("owner_clerk_user_id", userId)
      .single();

    if (micrositeError || !microsite) {
      return NextResponse.json(
        { ok: false, error: "Microsite not found." },
        { status: 404 },
      );
    }

    const shouldPublish = isPaidActive(microsite.paid_until);

    const { error: updateError } = await supabaseAdmin
      .from("microsites")
      .update({
        is_active: true,
        is_published: shouldPublish,
      })
      .eq("id", id)
      .eq("owner_clerk_user_id", userId);

    if (updateError) {
      return NextResponse.json(
        { ok: false, error: updateError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      published: shouldPublish,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}