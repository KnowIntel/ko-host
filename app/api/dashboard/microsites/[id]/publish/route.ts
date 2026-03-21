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

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: micrositeId } = await ctx.params;

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 }
    );
  }

  const publish = parsed.data.publish;
  const sb = getSupabaseAdmin();

  const { data: site, error: siteErr } = await sb
    .from("microsites")
    .select("id, owner_clerk_user_id, paid_until, is_published, status")
    .eq("id", micrositeId)
    .maybeSingle();

  if (siteErr || !site) {
    return NextResponse.json(
      { ok: false, error: "Not found" },
      { status: 404 }
    );
  }

  if (site.owner_clerk_user_id !== userId) {
    return NextResponse.json(
      { ok: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  if (publish) {
    const now = new Date();
    const paidActive = site.paid_until ? new Date(site.paid_until) > now : false;

    if (!paidActive) {
      return NextResponse.json(
        { ok: false, error: "Payment required to publish" },
        { status: 402 }
      );
    }
  }

  const nowIso = new Date().toISOString();

  const updatePayload: Record<string, unknown> = {
  is_published: publish,
  status: publish ? "published" : "draft",
  updated_at: nowIso,
};

if (publish) {
  updatePayload.published_at = nowIso;
  updatePayload.is_active = true;
} else {
  updatePayload.published_at = null;
}

  const { data: updated, error: upErr } = await sb
    .from("microsites")
    .update(updatePayload)
    .eq("id", micrositeId)
    .eq("owner_clerk_user_id", userId)
    .select("id, slug, is_published, status, paid_until, published_at, updated_at")
    .single();

  if (upErr) {
    console.error("publish toggle failed", upErr);
    return NextResponse.json(
      { ok: false, error: upErr.message || "Server error" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      microsite: updated,
    },
    { status: 200 }
  );
}