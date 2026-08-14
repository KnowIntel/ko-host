// app\api\dashboard\microsites\[id]\calendar-bookings\[bookingId]\cancel\route.ts

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

    /*
     * Verify that the current Clerk user owns this microsite.
     */
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

    /*
     * Verify the booking belongs to this microsite.
     */
    const { data: booking, error: bookingErr } = await sb
      .from("calendar_bookings")
      .select(
        "id, microsite_id, status, source_slot_id",
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

    /*
     * Make cancellation idempotent.
     *
     * If the booking was already cancelled, simply return to
     * the dashboard page without changing anything.
     */
    if (booking.status === "cancelled") {
      return NextResponse.redirect(
        new URL(
          `/dashboard/microsites/${micrositeId}/calendar-bookings`,
          req.url,
        ),
        303,
      );
    }

    const nowIso = new Date().toISOString();

    /*
     * Cancelling the booking releases the time slot automatically
     * because the unique index only applies where:
     *
     * status = 'confirmed'
     *
     * We therefore do NOT need to modify calendar_booking_slots.
     */
    const { error: updateErr } = await sb
      .from("calendar_bookings")
      .update({
        status: "cancelled",
        updated_at: nowIso,
      })
      .eq("id", bookingId)
      .eq("microsite_id", micrositeId)
      .eq("status", "confirmed");

    if (updateErr) {
      console.error(
        "calendar booking cancellation failed",
        {
          micrositeId,
          bookingId,
          updateErr,
        },
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Failed to cancel booking",
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
      "calendar booking cancel handler failed",
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