// app/api/public/poll/results/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const QuerySchema = z.object({
  micrositeSlug: z.string().min(2).max(40).regex(/^[a-z0-9-]+$/),
  pollId: z.string().uuid(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const micrositeSlug = url.searchParams.get("micrositeSlug") ?? "";
  const pollId = url.searchParams.get("pollId") ?? "";

  const parsed = QuerySchema.safeParse({ micrositeSlug, pollId });
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();

  // Validate microsite is published + not expired
  const { data: site, error: siteErr } = await sb
    .from("microsites")
    .select("id, is_published, expires_at")
    .eq("slug", parsed.data.micrositeSlug)
    .maybeSingle();

  if (siteErr || !site) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const now = new Date();
  const expired = site.expires_at ? new Date(site.expires_at) <= now : false;
  if (!site.is_published || expired) {
    return NextResponse.json({ ok: false, error: "Not available" }, { status: 404 });
  }

  // Validate poll belongs to microsite + results policy
  const { data: poll, error: pollErr } = await sb
    .from("polls")
    .select("id, microsite_id, show_results_public, is_open")
    .eq("id", parsed.data.pollId)
    .maybeSingle();

  if (pollErr || !poll || poll.microsite_id !== site.id) {
    return NextResponse.json({ ok: false, error: "Poll not found" }, { status: 404 });
  }

  if (!poll.show_results_public) {
    return NextResponse.json({ ok: false, error: "Results hidden" }, { status: 403 });
  }

  // Load options
  const { data: options, error: optErr } = await sb
    .from("poll_options")
    .select("id,label,sort_order")
    .eq("poll_id", poll.id)
    .order("sort_order", { ascending: true });

  if (optErr) {
    console.error("poll options lookup failed", optErr);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }

  // Aggregate counts by option_id
  // We avoid SQL RPC for now; do deterministic counts with a grouped select-like approach:
  // Pull votes for this poll (safe cap) and count in memory.
  const { data: votes, error: votesErr } = await sb
    .from("poll_votes")
    .select("option_id")
    .eq("poll_id", poll.id)
    .limit(50000);

  if (votesErr) {
    console.error("poll votes lookup failed", votesErr);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }

  const counts = new Map<string, number>();
  for (const v of votes ?? []) {
    counts.set(v.option_id, (counts.get(v.option_id) ?? 0) + 1);
  }

  const results = (options ?? []).map((o) => ({
    optionId: o.id,
    label: o.label,
    count: counts.get(o.id) ?? 0,
  }));

  const total = results.reduce((sum, r) => sum + r.count, 0);

  return NextResponse.json(
    { ok: true, total, results },
    {
      status: 200,
      headers: {
        // allow quick refreshes but avoid caching stale results too long
        "cache-control": "public, max-age=5",
      },
    }
  );
}