// app/api/dashboard/microsites/[id]/rsvp/export/route.ts
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
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const micrositeId = params.id;

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
    .select("name,email,attending_count,has_plus_one,meal_choice,notes,created_at")
    .eq("microsite_id", micrositeId)
    .order("created_at", { ascending: true })
    .limit(5000);

  if (rowsErr) {
    console.error("RSVP export query failed", rowsErr);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const header = [
    "created_at",
    "name",
    "email",
    "attending_count",
    "has_plus_one",
    "meal_choice",
    "notes",
  ];

  const lines: string[] = [];
  lines.push(header.join(","));

  for (const r of rows ?? []) {
    lines.push(
      [
        csvEscape(r.created_at),
        csvEscape(r.name),
        csvEscape(r.email),
        csvEscape(r.attending_count),
        csvEscape(r.has_plus_one),
        csvEscape(r.meal_choice),
        csvEscape(r.notes),
      ].join(",")
    );
  }

  const csv = lines.join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="rsvp_${site.slug}.csv"`,
      "cache-control": "no-store",
    },
  });
}