// app/api/public/rsvp/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { rateLimitOrThrow } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  micrositeSlug: z.string().min(2).max(40).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(120),
  email: z.string().email().optional().or(z.literal("")),
  attendingCount: z.number().int().min(0).max(20),
  hasPlusOne: z.boolean(),
  mealChoice: z.string().max(80).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
  // honeypot: should be empty
  company: z.string().max(0).optional().or(z.literal("")),
});

function getClientIp(req: Request): string {
  // Vercel commonly provides x-forwarded-for; first is client
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
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

    // honeypot triggered => pretend success
    if (parsed.data.company && parsed.data.company.length > 0) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const ip = getClientIp(req);
    // Rate limit: 10 submissions per 10 minutes per IP per slug
    await rateLimitOrThrow({
      key: `rsvp:${parsed.data.micrositeSlug}:${ip}`,
      limit: 10,
      windowSeconds: 10 * 60,
    });

    const sb = getSupabaseAdmin();

    // Lookup microsite by slug
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

    if (site.template_key !== "wedding_rsvp") {
      return NextResponse.json({ ok: false, error: "Template not supported" }, { status: 400 });
    }

    const cleanEmail = parsed.data.email?.trim() || null;
    const cleanMeal = parsed.data.mealChoice?.trim() || null;
    const cleanNotes = parsed.data.notes?.trim() || null;

    const { error: insErr } = await sb.from("rsvp_submissions").insert({
      microsite_id: site.id,
      name: parsed.data.name.trim(),
      email: cleanEmail,
      attending_count: parsed.data.attendingCount,
      has_plus_one: parsed.data.hasPlusOne,
      meal_choice: cleanMeal,
      notes: cleanNotes,
    });

    if (insErr) {
      console.error("rsvp insert failed", { insErr });
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

    console.error("public RSVP handler failed", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}