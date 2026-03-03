import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type ReorderItem = { id: string; sort_order: number };

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const { id: micrositeId } = await ctx.params;
    const body = await req.json().catch(() => null);

    const items = Array.isArray(body?.items) ? (body.items as ReorderItem[]) : [];
    if (items.length === 0) return NextResponse.json({ ok: false, error: "Missing items" }, { status: 400 });

    // basic validation
    for (const it of items) {
      if (!it?.id || typeof it.sort_order !== "number" || !Number.isFinite(it.sort_order)) {
        return NextResponse.json({ ok: false, error: "Invalid items payload" }, { status: 400 });
      }
    }

    const sb = getSupabaseAdmin();

    const { data: site, error: siteErr } = await sb
      .from("microsites")
      .select("id, owner_clerk_user_id")
      .eq("id", micrositeId)
      .maybeSingle();

    if (siteErr || !site) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    if (site.owner_clerk_user_id !== userId) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

    // Ensure all ids belong to this microsite
    const ids = items.map((i) => i.id);
    const { data: existing, error: exErr } = await sb
      .from("gallery_items")
      .select("id")
      .eq("microsite_id", micrositeId)
      .in("id", ids);

    if (exErr) return NextResponse.json({ ok: false, error: exErr.message }, { status: 500 });

    const existingIds = new Set((existing ?? []).map((r) => r.id));
    if (existingIds.size !== ids.length) {
      return NextResponse.json({ ok: false, error: "One or more items not found" }, { status: 404 });
    }

    // Update in a simple loop (small n). Cheap + reliable.
    for (const it of items) {
      const { error: upErr } = await sb
        .from("gallery_items")
        .update({ sort_order: it.sort_order })
        .eq("microsite_id", micrositeId)
        .eq("id", it.id);

      if (upErr) return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("gallery reorder fatal:", e);
    return NextResponse.json({ ok: false, error: e?.message ?? "Error" }, { status: 500 });
  }
}