//app\api\dashboard\microsites\[id]\calendar-bookings\export\route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(value: unknown) {
  const text =
    value === null || value === undefined
      ? ""
      : String(value);

  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id: micrositeId } = await params;

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
      .select(
        "id, owner_clerk_user_id, slug, title",
      )
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

    const { data: rows, error: rowsErr } = await sb
      .from("calendar_bookings")
      .select(
        [
          "id",
          "block_id",
          "source_slot_id",
          "booking_subject",
          "visitor_name",
          "visitor_email",
          "visitor_phone",
          "choice_id",
          "choice_label",
          "booking_date",
          "start_time",
          "end_time",
          "status",
          "created_at",
          "updated_at",
        ].join(","),
      )
      .eq("microsite_id", micrositeId)
      .order("booking_date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(5000);

    if (rowsErr) {
      console.error(
        "calendar bookings export failed",
        rowsErr,
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Failed to load calendar bookings",
        },
        { status: 500 },
      );
    }

    const header = [
      "Booking ID",
      "Block ID",
      "Slot ID",
      "Subject",
      "Choice",
      "Visitor Name",
      "Visitor Email",
      "Visitor Phone",
      "Booking Date",
      "Start Time",
      "End Time",
      "Status",
      "Submitted At",
      "Updated At",
    ];

    const csvRows = [
      header.map(csvEscape).join(","),
      ...(rows ?? []).map((row: any) =>
        [
          row.id,
          row.block_id,
          row.source_slot_id,
          row.booking_subject,
          row.choice_label,
          row.visitor_name,
          row.visitor_email,
          row.visitor_phone,
          row.booking_date,
          row.start_time,
          row.end_time,
          row.status,
          row.created_at,
          row.updated_at,
        ]
          .map(csvEscape)
          .join(","),
      ),
    ];

    const csv = csvRows.join("\r\n");

    const safeSlug =
      typeof site.slug === "string" && site.slug.trim()
        ? site.slug
            .trim()
            .replace(/[^a-zA-Z0-9-_]/g, "-")
        : "microsite";

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type":
          "text/csv; charset=utf-8",
        "Content-Disposition":
          `attachment; filename="${safeSlug}-calendar-bookings.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(
      "calendar bookings export handler failed",
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