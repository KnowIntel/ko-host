// app/api/public/poll/vote/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { createHash, randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { rateLimitOrThrow } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  micrositeSlug: z.string().min(2).max(40).regex(/^[a-z0-9-]+$/),
  pollId: z.string().uuid(),
  optionIds: z.array(z.string().uuid()).min(1).max(10),
  // honeypot
  company: z.string().max(0).optional().or(z.literal("")),
});

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

async function getOrSetVisitorId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get("ko_host_vid")?.value;
  if (existing && existing.length >= 16) return existing;

  const vid = randomUUID();
  // 180 days
  jar.set("ko_host_vid", vid, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
  return vid;
}

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid request", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    // honeypot: if filled, pretend success
    if (parsed.data.company && parsed.data.company.length > 0) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const ip = getClientIp(req);

    // Rate limit: 20 vote attempts per 10 minutes per IP per microsite
    await rateLimitOrThrow({
      key: `pollvote:${parsed.data.micrositeSlug}:${ip}`,
      limit: 20,
      windowSeconds: 10 * 60,
    });

    const sb = getSupabaseAdmin();

    // Find site by slug + validate published
    const { data: site, error: siteErr } = await sb
      .from("microsites")
      .select("id, template_key, is_published, expires_at")
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

    // Ensure poll belongs to site + is open
    const { data: poll, error: pollErr } = await sb
      .from("polls")
      .select("id, microsite_id, is_multi_select, is_open")
      .eq("id", parsed.data.pollId)
      .maybeSingle();

    if (pollErr || !poll || poll.microsite_id !== site.id) {
      return NextResponse.json({ ok: false, error: "Poll not found" }, { status: 404 });
    }
    if (!poll.is_open) {
      return NextResponse.json({ ok: false, error: "Poll closed" }, { status: 400 });
    }

    // Enforce option count based on poll type
    const uniqueOptionIds = Array.from(new Set(parsed.data.optionIds));
    if (!poll.is_multi_select && uniqueOptionIds.length !== 1) {
      return NextResponse.json({ ok: false, error: "Select exactly one option" }, { status: 400 });
    }

    // Ensure optionIds belong to this poll
    const { data: options, error: optErr } = await sb
      .from("poll_options")
      .select("id")
      .eq("poll_id", poll.id)
      .in("id", uniqueOptionIds);

    if (optErr) {
      console.error("poll options lookup failed", optErr);
      return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
    }

    if (!options || options.length !== uniqueOptionIds.length) {
      return NextResponse.json({ ok: false, error: "Invalid option selection" }, { status: 400 });
    }

    const vid = await getOrSetVisitorId();
    const fingerprint = sha256(`${poll.id}:${vid}:${ip}`);

    // Insert votes; rely on unique constraint (poll_id, fingerprint) to prevent repeats
    // If multi-select, we insert multiple rows, but still only one "voting session" per fingerprint;
    // we enforce this by inserting first row and failing subsequent inserts via a manual check.
    const { data: already } = await sb
      .from("poll_votes")
      .select("id")
      .eq("poll_id", poll.id)
      .eq("fingerprint", fingerprint)
      .maybeSingle();

    if (already) {
      return NextResponse.json({ ok: false, error: "Already voted" }, { status: 400 });
    }

    const payload = uniqueOptionIds.map((optionId) => ({
      poll_id: poll.id,
      option_id: optionId,
      fingerprint,
    }));

    const { error: insErr } = await sb.from("poll_votes").insert(payload);
    if (insErr) {
      // If a race hits the unique constraint, treat as already voted
      if (String(insErr.code) === "23505") {
        return NextResponse.json({ ok: false, error: "Already voted" }, { status: 400 });
      }
      console.error("poll vote insert failed", insErr);
      return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    const status = typeof err?.status === "number" ? err.status : 500;
    const retryAfter = err?.retryAfter;

    if (status === 429) {
      const res = NextResponse.json({ ok: false, error: "Rate limited" }, { status: 429 });
      if (retryAfter) res.headers.set("retry-after", String(retryAfter));
      return res;
    }

    console.error("public poll vote failed", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}