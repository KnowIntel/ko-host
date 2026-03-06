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
  ctx: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const raw = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();

  const { data: site, error: siteErr } = await sb
    .from("microsites")
    .select("id, owner_clerk_user_id")
    .eq("id", id)
    .maybeSingle();

  if (siteErr || !site) {
    return NextResponse.json({ ok: false, error: "Microsite not found" }, { status: 404 });
  }

  if (site.owner_clerk_user_id !== userId) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const { error: upErr } = await sb
    .from("microsites")
    .update({ is_favorite: parsed.data.isFavorite })
    .eq("id", id);

  if (upErr) {
    return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}