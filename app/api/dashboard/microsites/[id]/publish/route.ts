// app/api/dashboard/microsites/[id]/publish/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  publish: z.boolean(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: micrositeId } = await ctx.params;

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();

  const { data: site, error: siteErr } = await sb
    .from("microsites")
    .select("id, owner_clerk_user_id, paid_until, is_published")
    .eq("id", micrositeId)
    .maybeSingle();

  if (siteErr || !site) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  if (site.owner_clerk_user_id !== userId) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  // If publishing, require active paid_until
  if (parsed.data.publish) {
    const now = new Date();
    const paidActive = site.paid_until ? new Date(site.paid_until) > now : false;
    if (!paidActive) {
      return NextResponse.json(
        { ok: false, error: "Payment required to publish" },
        { status: 402 }
      );
    }
  }

  const { error: upErr } = await sb
    .from("microsites")
    .update({ is_published: parsed.data.publish })
    .eq("id", micrositeId);

  if (upErr) {
    console.error("publish toggle failed", upErr);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, micrositeId, is_published: parsed.data.publish },
    { status: 200 }
  );
}