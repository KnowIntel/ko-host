import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  isFavorite: z.boolean(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;

  const raw = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  const { data: microsite, error: micrositeError } = await supabase
    .from("microsites")
    .select("id, owner_clerk_user_id, is_favorite")
    .eq("id", id)
    .maybeSingle();

  if (micrositeError) {
    return NextResponse.json(
      { ok: false, error: micrositeError.message },
      { status: 500 }
    );
  }

  if (!microsite) {
    return NextResponse.json(
      { ok: false, error: "Microsite not found" },
      { status: 404 }
    );
  }

  if (microsite.owner_clerk_user_id !== userId) {
    return NextResponse.json(
      { ok: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  const { data: updated, error: updateError } = await supabase
    .from("microsites")
    .update({
      is_favorite: parsed.data.isFavorite,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("owner_clerk_user_id", userId)
    .select("id, is_favorite")
    .single();

  if (updateError) {
    return NextResponse.json(
      { ok: false, error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    microsite: updated,
  });
}