// app/api/public/poll/results/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createHash } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { BuilderDraft } from "@/lib/templates/builder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const QuerySchema = z.object({
  micrositeSlug: z.string().min(2).max(40).regex(/^[a-z0-9-]+$/),
  pollId: z.string().uuid(),
});

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function deterministicUuid(seed: string) {
  const hex = createHash("sha256").update(seed).digest("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `4${hex.slice(13, 16)}`,
    `${((parseInt(hex.slice(16, 18), 16) & 0x3f) | 0x80)
      .toString(16)
      .padStart(2, "0")}${hex.slice(18, 20)}`,
    hex.slice(20, 32),
  ].join("-");
}

async function ensurePublishedPollExists(args: {
  micrositeId: string;
  pollId: string;
}) {
  const sb = getSupabaseAdmin();

  const { data: pageRows, error: pageErr } = await sb
    .from("microsite_pages")
    .select("id, draft, display_order, created_at")
    .eq("microsite_id", args.micrositeId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(1);

  if (pageErr) throw pageErr;

  const homeDraft =
    ((pageRows?.[0] as { draft?: BuilderDraft | null } | undefined)?.draft ??
      null) as BuilderDraft | null;

  const { data: micrositeRow, error: micrositeErr } = await sb
    .from("microsites")
    .select("draft")
    .eq("id", args.micrositeId)
    .maybeSingle();

  if (micrositeErr) throw micrositeErr;

  const fallbackDraft = (micrositeRow?.draft ?? null) as BuilderDraft | null;

  const draft =
    (homeDraft && Array.isArray(homeDraft.blocks) ? homeDraft : null) ??
    fallbackDraft ??
    null;

  const pollBlock = Array.isArray(draft?.blocks)
    ? draft!.blocks.find((block: any) => {
        if (block?.type !== "poll") return false;

        const originalPollId = String(block?.id || "");
        const derivedPollId = isUuid(originalPollId)
          ? originalPollId
          : deterministicUuid(`poll:${args.micrositeId}:${originalPollId}`);

        return derivedPollId === args.pollId;
      })
    : null;

  if (!pollBlock) return false;

  const originalPollId = String((pollBlock as any).id || "");
  const finalPollId = isUuid(originalPollId)
    ? originalPollId
    : deterministicUuid(`poll:${args.micrositeId}:${originalPollId}`);

  const { error: insertPollError } = await sb.from("polls").upsert(
    {
      id: finalPollId,
      microsite_id: args.micrositeId,
      is_multi_select: false,
      is_open: true,
      show_results_public: true,
    },
    { onConflict: "id" },
  );

  if (insertPollError) throw insertPollError;

  const optionRows = (Array.isArray((pollBlock as any)?.data?.options)
    ? (pollBlock as any).data.options
    : []
  ).map((option: any, index: number) => {
    const originalOptionId = String(option?.id || "");
    const finalOptionId = isUuid(originalOptionId)
      ? originalOptionId
      : deterministicUuid(
          `poll-option:${args.micrositeId}:${originalPollId}:${originalOptionId}`,
        );

    return {
      id: finalOptionId,
      poll_id: finalPollId,
      label: option.text || "Option",
      sort_order: index,
    };
  });

  if (optionRows.length > 0) {
    const { error: insertOptionsError } = await sb
      .from("poll_options")
      .upsert(optionRows, { onConflict: "id" });

    if (insertOptionsError) throw insertOptionsError;
  }

  return true;
}

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
  let { data: poll, error: pollErr } = await sb
    .from("polls")
    .select("id, microsite_id, show_results_public, is_open")
    .eq("id", parsed.data.pollId)
    .maybeSingle();

  if (!poll && !pollErr) {
    try {
      await ensurePublishedPollExists({
        micrositeId: site.id,
        pollId: parsed.data.pollId,
      });

      const retry = await sb
        .from("polls")
        .select("id, microsite_id, show_results_public, is_open")
        .eq("id", parsed.data.pollId)
        .maybeSingle();

      poll = retry.data;
      pollErr = retry.error;
    } catch (syncErr) {
      console.error("poll results self-heal failed", syncErr);
    }
  }

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