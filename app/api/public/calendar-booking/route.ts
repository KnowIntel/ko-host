import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { rateLimitOrThrow } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AvailabilityQuerySchema = z.object({
  micrositeSlug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/),

  blockId: z.string().min(1).max(200),
});

const BodySchema = z.object({
  micrositeSlug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/),

  blockId: z.string().min(1).max(200),

  sourceSlotId: z.string().min(1).max(200),

  bookingSubject: z.string().min(1).max(200),

  visitorName: z.string().min(1).max(160),
  visitorEmail: z.string().email().max(200),
  visitorPhone: z.string().max(80).optional().or(z.literal("")),

  choiceId: z.string().max(200).optional().or(z.literal("")),
  choiceLabel: z.string().max(200).optional().or(z.literal("")),

  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),

  startTime: z.string().regex(/^\d{2}:\d{2}$/),

  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional()
    .or(z.literal("")),

  company: z.string().max(0).optional().or(z.literal("")),
});

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");

  if (xff) {
    return xff.split(",")[0].trim();
  }

  return "unknown";
}

async function getPublishedMicrosite(
  sb: ReturnType<typeof getSupabaseAdmin>,
  micrositeSlug: string,
) {
  const { data: site, error: siteErr } = await sb
    .from("microsites")
    .select("id, is_published, expires_at")
    .eq("slug", micrositeSlug)
    .maybeSingle();

  if (siteErr || !site) {
    return {
      site: null,
      error: "Not found",
      status: 404,
    } as const;
  }

  const now = new Date();

  const expired = site.expires_at
    ? new Date(site.expires_at) <= now
    : false;

  if (!site.is_published || expired) {
    return {
      site: null,
      error: "Not available",
      status: 404,
    } as const;
  }

  return {
    site,
    error: null,
    status: 200,
  } as const;
}

/*
 * GET
 *
 * Returns confirmed/booked source slot IDs for one Professional
 * Calendar Event block.
 *
 * No visitor information is returned publicly.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const parsed = AvailabilityQuerySchema.safeParse({
      micrositeSlug: url.searchParams.get("micrositeSlug") ?? "",
      blockId: url.searchParams.get("blockId") ?? "",
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid request",
          issues: parsed.error.issues,
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const ip = getClientIp(req);

    await rateLimitOrThrow({
      key: `calendar-availability:${parsed.data.micrositeSlug}:${ip}`,
      limit: 60,
      windowSeconds: 10 * 60,
    });

    const sb = getSupabaseAdmin();

    const siteResult = await getPublishedMicrosite(
      sb,
      parsed.data.micrositeSlug,
    );

    if (!siteResult.site) {
      return NextResponse.json(
        {
          ok: false,
          error: siteResult.error,
        },
        {
          status: siteResult.status,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

/*
 * Load the currently enabled slots for this Professional
 * Calendar block.
 *
 * This prevents stale/removed Builder slots from being treated
 * as valid public availability.
 */
const { data: enabledSlots, error: slotsErr } = await sb
  .from("calendar_booking_slots")
  .select("source_slot_id")
  .eq("microsite_id", siteResult.site.id)
  .eq("block_id", parsed.data.blockId)
  .eq("enabled", true);

if (slotsErr) {
  console.error("calendar enabled slots lookup failed", {
    slotsErr,
  });

  return NextResponse.json(
    {
      ok: false,
      error: "Server error",
    },
    {
      status: 500,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

const enabledSlotIds = new Set(
  (enabledSlots ?? [])
    .map((slot) =>
      typeof slot.source_slot_id === "string"
        ? slot.source_slot_id
        : "",
    )
    .filter(Boolean),
);

/*
 * Load confirmed bookings for this block.
 */
const { data: bookings, error: bookingErr } = await sb
  .from("calendar_bookings")
  .select("source_slot_id")
  .eq("microsite_id", siteResult.site.id)
  .eq("block_id", parsed.data.blockId)
  .eq("status", "confirmed");

if (bookingErr) {
  console.error("calendar availability lookup failed", {
    bookingErr,
  });

  return NextResponse.json(
    {
      ok: false,
      error: "Server error",
    },
    {
      status: 500,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

const bookedSlotIds = Array.from(
  new Set(
    (bookings ?? [])
      .map((booking) =>
        typeof booking.source_slot_id === "string"
          ? booking.source_slot_id
          : "",
      )
      .filter(
        (sourceSlotId) =>
          Boolean(sourceSlotId) &&
          enabledSlotIds.has(sourceSlotId),
      ),
  ),
);

    return NextResponse.json(
      {
        ok: true,
        bookedSlotIds,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (err: any) {
    const status =
      typeof err?.status === "number"
        ? err.status
        : 500;

    const retryAfter = err?.retryAfter;

    if (status === 429) {
      const res = NextResponse.json(
        {
          ok: false,
          error: "Rate limited",
        },
        {
          status: 429,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );

      if (retryAfter) {
        res.headers.set(
          "retry-after",
          String(retryAfter),
        );
      }

      return res;
    }

    console.error(
      "public calendar availability handler failed",
      err,
    );

    return NextResponse.json(
      {
        ok: false,
        error: "Server error",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}

/*
 * POST
 *
 * Creates one confirmed Professional Calendar booking.
 */
export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid request",
          issues: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    if (parsed.data.company && parsed.data.company.length > 0) {
      return NextResponse.json(
        {
          ok: true,
        },
        { status: 200 },
      );
    }

    const ip = getClientIp(req);

    await rateLimitOrThrow({
      key: `calendar-booking:${parsed.data.micrositeSlug}:${ip}`,
      limit: 10,
      windowSeconds: 10 * 60,
    });

    const sb = getSupabaseAdmin();

    const siteResult = await getPublishedMicrosite(
      sb,
      parsed.data.micrositeSlug,
    );

    if (!siteResult.site) {
      return NextResponse.json(
        {
          ok: false,
          error: siteResult.error,
        },
        { status: siteResult.status },
      );
    }

    const cleanName = parsed.data.visitorName.trim();

    const cleanEmail = parsed.data.visitorEmail
      .trim()
      .toLowerCase();

    const cleanPhone =
      parsed.data.visitorPhone?.trim() || null;

    const cleanChoiceId =
      parsed.data.choiceId?.trim() || null;

    const cleanChoiceLabel =
      parsed.data.choiceLabel?.trim() || null;

    /*
     * Make sure the requested slot exists for this
     * microsite + Calendar Event block.
     */
    const { data: slot, error: slotErr } = await sb
      .from("calendar_booking_slots")
      .select(
        "id, source_slot_id, booking_date, start_time, end_time, enabled",
      )
      .eq("microsite_id", siteResult.site.id)
      .eq("block_id", parsed.data.blockId)
      .eq("source_slot_id", parsed.data.sourceSlotId)
      .maybeSingle();

    if (slotErr) {
      console.error("calendar slot lookup failed", {
        slotErr,
      });

      return NextResponse.json(
        {
          ok: false,
          error: "Server error",
        },
        { status: 500 },
      );
    }

    if (!slot || slot.enabled !== true) {
      return NextResponse.json(
        {
          ok: false,
          error: "Time slot is no longer available",
          code: "SLOT_TAKEN",
        },
        { status: 409 },
      );
    }

    const slotDate = String(slot.booking_date);

    const slotStartTime = String(
      slot.start_time,
    ).slice(0, 5);

    const slotEndTime = slot.end_time
      ? String(slot.end_time).slice(0, 5)
      : "";

    /*
     * Prevent the browser from changing the date/time
     * while submitting a legitimate slot ID.
     */
    if (
      slotDate !== parsed.data.bookingDate ||
      slotStartTime !== parsed.data.startTime ||
      slotEndTime !== (parsed.data.endTime || "")
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Time slot details do not match",
        },
        { status: 400 },
      );
    }

    /*
     * Attempt the booking.
     *
     * uq_calendar_bookings_confirmed_slot remains the
     * final database-level protection against two visitors
     * booking the same slot simultaneously.
     */
    const { data: booking, error: bookingErr } = await sb
      .from("calendar_bookings")
      .insert({
        microsite_id: siteResult.site.id,
        block_id: parsed.data.blockId,

        slot_id: slot.id,
        source_slot_id: parsed.data.sourceSlotId,

        booking_subject:
          parsed.data.bookingSubject.trim(),

        visitor_name: cleanName,
        visitor_email: cleanEmail,
        visitor_phone: cleanPhone,

        choice_id: cleanChoiceId,
        choice_label: cleanChoiceLabel,

        booking_date: parsed.data.bookingDate,
        start_time: parsed.data.startTime,
        end_time: parsed.data.endTime || null,

        status: "confirmed",
      })
      .select(
        "id, booking_date, start_time, end_time, booking_subject",
      )
      .single();

    if (bookingErr) {
      const postgresCode =
        typeof bookingErr.code === "string"
          ? bookingErr.code
          : "";

      if (postgresCode === "23505") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "That time was just booked by someone else",
            code: "SLOT_TAKEN",
          },
          { status: 409 },
        );
      }

      console.error("calendar booking insert failed", {
        bookingErr,
      });

      return NextResponse.json(
        {
          ok: false,
          error: "Server error",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        ok: true,

        booking: {
          id: booking.id,

          bookingDate:
            booking.booking_date,

          startTime: String(
            booking.start_time,
          ).slice(0, 5),

          endTime: booking.end_time
            ? String(booking.end_time).slice(0, 5)
            : "",

          bookingSubject:
            booking.booking_subject,
        },
      },
      { status: 200 },
    );
  } catch (err: any) {
    const status =
      typeof err?.status === "number"
        ? err.status
        : 500;

    const retryAfter = err?.retryAfter;

    if (status === 429) {
      const res = NextResponse.json(
        {
          ok: false,
          error: "Rate limited",
        },
        { status: 429 },
      );

      if (retryAfter) {
        res.headers.set(
          "retry-after",
          String(retryAfter),
        );
      }

      return res;
    }

    console.error(
      "public calendar booking handler failed",
      err,
    );

    return NextResponse.json(
      {
        ok: false,
        error: "Server error",
      },
      { status: 500 },
    );
  }
} 