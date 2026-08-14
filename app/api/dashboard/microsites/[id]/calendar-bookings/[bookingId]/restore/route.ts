// app\api\dashboard\microsites\[id]\calendar-bookings\[bookingId]\restore\route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      bookingId: string;
    }>;
  },
) {
  try {
    const { id: micrositeId, bookingId } = await params;

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const sb = getSupabaseAdmin();

    const { data: site, error: siteErr } = await sb
      .from("microsites")
      .select("id, owner_clerk_user_id")
      .eq("id", micrositeId)
      .maybeSingle();

    if (siteErr || !site) {
      return NextResponse.json(
        {
          ok: false,
          error: "Microsite not found",
        },
        { status: 404 },
      );
    }

    if (site.owner_clerk_user_id !== userId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Forbidden",
        },
        { status: 403 },
      );
    }

    const { data: booking, error: bookingErr } = await sb
      .from("calendar_bookings")
      .select(
        "id, microsite_id, block_id, source_slot_id, status",
      )
      .eq("id", bookingId)
      .eq("microsite_id", micrositeId)
      .maybeSingle();

    if (bookingErr || !booking) {
      return NextResponse.json(
        {
          ok: false,
          error: "Booking not found",
        },
        { status: 404 },
      );
    }

if (booking.status === "confirmed") {
  return NextResponse.redirect(
    new URL(
      `/dashboard/microsites/${micrositeId}/calendar-bookings`,
      req.url,
    ),
    303,
  );
}

/*
 * Make sure the original Professional Calendar slot
 * still exists and is enabled.
 *
 * A slot may have been removed or disabled by the site owner
 * after this booking was cancelled.
 */
const { data: slot, error: slotErr } = await sb
  .from("calendar_booking_slots")
  .select("id, enabled")
  .eq("microsite_id", micrositeId)
  .eq("block_id", booking.block_id)
  .eq("source_slot_id", booking.source_slot_id)
  .maybeSingle();

if (slotErr) {
  console.error(
    "calendar booking restore slot lookup failed",
    {
      micrositeId,
      bookingId,
      slotErr,
    },
  );

  return NextResponse.json(
    {
      ok: false,
      error: "Unable to verify time slot",
    },
    { status: 500 },
  );
}

if (!slot || slot.enabled !== true) {
  return NextResponse.json(
    {
      ok: false,
      error:
        "This time slot is no longer available on the calendar.",
      code: "SLOT_UNAVAILABLE",
    },
    { status: 409 },
  );
}

/*
 * Before restoring, make sure another confirmed booking
 * has not claimed this slot since this booking was cancelled.
 */
const { data: conflictingBooking, error: conflictErr } = await sb
      .from("calendar_bookings")
      .select("id")
      .eq("microsite_id", micrositeId)
      .eq("block_id", booking.block_id)
      .eq("source_slot_id", booking.source_slot_id)
      .eq("status", "confirmed")
      .neq("id", bookingId)
      .maybeSingle();

    if (conflictErr) {
      console.error(
        "calendar booking restore conflict check failed",
        {
          micrositeId,
          bookingId,
          conflictErr,
        },
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Unable to verify slot availability",
        },
        { status: 500 },
      );
    }

    if (conflictingBooking) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "This time slot has already been booked by someone else.",
          code: "SLOT_TAKEN",
        },
        { status: 409 },
      );
    }

    const nowIso = new Date().toISOString();

    const { error: updateErr } = await sb
      .from("calendar_bookings")
      .update({
        status: "confirmed",
        updated_at: nowIso,
      })
      .eq("id", bookingId)
      .eq("microsite_id", micrositeId)
      .eq("status", "cancelled");

    if (updateErr) {
      const postgresCode =
        typeof updateErr.code === "string"
          ? updateErr.code
          : "";

      /*
       * The database unique index is still the final protection
       * against two confirmed bookings claiming the same slot.
       */
      if (postgresCode === "23505") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "This time slot has already been booked by someone else.",
            code: "SLOT_TAKEN",
          },
          { status: 409 },
        );
      }

      console.error(
        "calendar booking restore failed",
        {
          micrositeId,
          bookingId,
          updateErr,
        },
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Failed to restore booking",
        },
        { status: 500 },
      );
    }

    return NextResponse.redirect(
      new URL(
        `/dashboard/microsites/${micrositeId}/calendar-bookings`,
        req.url,
      ),
      303,
    );
  } catch (error) {
    console.error(
      "calendar booking restore handler failed",
      error,
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