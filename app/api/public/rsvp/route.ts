import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { rateLimitOrThrow } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  micrositeSlug: z.string().min(2).max(40).regex(/^[a-z0-9-]+$/),

  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),

  isAttending: z.boolean(),
  mealChoice: z.string().max(80).optional().or(z.literal("")),

  bringingGuest: z.boolean(),
  guestCount: z.number().int().min(0).max(20),
  guestName: z.string().max(120).optional().or(z.literal("")),
  comments: z.string().max(1000).optional().or(z.literal("")),

  company: z.string().max(0).optional().or(z.literal("")),
});

function getClientIp(req: Request): string {
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
        { status: 400 },
      );
    }

    if (parsed.data.company && parsed.data.company.length > 0) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const ip = getClientIp(req);

    await rateLimitOrThrow({
      key: `rsvp:${parsed.data.micrositeSlug}:${ip}`,
      limit: 10,
      windowSeconds: 10 * 60,
    });

    const sb = getSupabaseAdmin();

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
      return NextResponse.json(
        { ok: false, error: "Template not supported" },
        { status: 400 },
      );
    }

    const cleanFirstName = parsed.data.firstName.trim();
    const cleanLastName = parsed.data.lastName.trim();
    const cleanEmail = parsed.data.email?.trim() || null;
    const cleanAddress = parsed.data.address?.trim() || null;
    const cleanMeal = parsed.data.mealChoice?.trim() || null;
    const cleanGuestName = parsed.data.guestName?.trim() || null;
    const cleanComments = parsed.data.comments?.trim() || null;

    const guestCount = parsed.data.isAttending
      ? parsed.data.bringingGuest
        ? Math.max(1, parsed.data.guestCount || 1)
        : 0
      : 0;

    const attendingCount = parsed.data.isAttending ? 1 + guestCount : 0;
    const hasPlusOne = parsed.data.isAttending && parsed.data.bringingGuest && guestCount > 0;

    const { error: insErr } = await sb.from("rsvp_submissions").insert({
      microsite_id: site.id,

      name: `${cleanFirstName} ${cleanLastName}`.trim(),
      email: cleanEmail,
      attending_count: attendingCount,
      has_plus_one: hasPlusOne,
      meal_choice: parsed.data.isAttending ? cleanMeal : null,
      notes: null,

      first_name: cleanFirstName,
      last_name: cleanLastName,
      address: cleanAddress,
      is_attending: parsed.data.isAttending,
      guest_count: guestCount,
      guest_name: cleanGuestName,
      comments: cleanComments,
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