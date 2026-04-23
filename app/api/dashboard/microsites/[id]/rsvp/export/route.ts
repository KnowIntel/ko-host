import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  const needsQuotes = /[",\n\r]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: micrositeId } = await ctx.params;

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();

  const { data: site, error: siteErr } = await sb
    .from("microsites")
    .select("id, owner_clerk_user_id, slug, template_key")
    .eq("id", micrositeId)
    .maybeSingle();

  if (siteErr || !site) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (site.owner_clerk_user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (site.template_key !== "wedding_rsvp") {
    return NextResponse.json({ error: "Unsupported template" }, { status: 400 });
  }

  const { data: rows, error: rowsErr } = await sb
    .from("rsvp_submissions")
    .select(
      "created_at, first_name, last_name, name, email, address, is_attending, guest_count, guest_name, attending_count, has_plus_one, meal_choice, comments, notes",
    )
    .eq("microsite_id", micrositeId)
    .order("created_at", { ascending: true })
    .limit(5000);

  if (rowsErr) {
    console.error("RSVP export query failed", rowsErr);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const header = [
    "created_at",
    "first_name",
    "last_name",
    "email",
    "address",
    "is_attending",
    "guest_count",
    "guest_name",
    "attending_count",
    "has_plus_one",
    "meal_choice",
    "comments",
  ];

  const lines: string[] = [];
  lines.push(header.join(","));

  for (const r of rows ?? []) {
    const row = r as {
      created_at?: string | null;
      first_name?: string | null;
      last_name?: string | null;
      name?: string | null;
      email?: string | null;
      address?: string | null;
      is_attending?: boolean | null;
      guest_count?: number | null;
      guest_name?: string | null;
      attending_count?: number | null;
      has_plus_one?: boolean | null;
      meal_choice?: string | null;
      comments?: string | null;
      notes?: string | null;
    };

    const fallbackFirst =
      row.first_name ?? (row.name ? row.name.split(" ")[0] : null);
    const fallbackLast =
      row.last_name ??
      (row.name ? row.name.split(" ").slice(1).join(" ") || null : null);

    lines.push(
      [
        csvEscape(row.created_at),
        csvEscape(fallbackFirst),
        csvEscape(fallbackLast),
        csvEscape(row.email),
        csvEscape(row.address),
        csvEscape(row.is_attending),
        csvEscape(row.guest_count),
        csvEscape(row.guest_name),
        csvEscape(row.attending_count),
        csvEscape(row.has_plus_one),
        csvEscape(row.meal_choice),
        csvEscape(row.comments),
      ].join(",")
    );
  }

  const csv = lines.join("\n");
  const filename = `rsvp_${site.slug}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}