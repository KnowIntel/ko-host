// app/api/dashboard/microsites/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();

  const { data, error } = await sb
    .from("microsites")
    .select(`
      id,
      slug,
      title,
      template_key,
      selected_design_key,
      is_published,
      paid_until,
      draft
    `)
    .eq("id", id)
    .eq("owner_clerk_user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: "Microsite not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    microsite: data,
  });
}