import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "knowintelligentlife@gmail.com";

function escapeCsv(value: unknown) {
  const str = String(value ?? "");
  return `"${str.replaceAll('"', '""')}"`;
}

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";

  const headers = Object.keys(rows[0]);

  return [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(",")),
  ].join("\n");
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ type: string }> },
) {
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type } = await ctx.params;
  const supabase = getSupabaseAdmin();

  let rows: Record<string, unknown>[] = [];
  let filename = `${type}.csv`;

  if (type === "support") {
    const { data } = await supabase
      .from("support_requests")
      .select("id,name,email,status,priority,category,assigned_to,created_at");

    rows = data ?? [];
  }

  if (type === "claims") {
    const { data } = await supabase
      .from("claim_offer_requests")
      .select("id,name,email,status,priority,assigned_to,deadline,created_at");

    rows = data ?? [];
  }

  if (type === "microsites") {
    const { data } = await supabase
      .from("microsites")
      .select("id,slug,title,owner_clerk_user_id,owner_email,template_key,selected_design_key,is_published,is_active,paid_until,created_at")
      .eq("is_preset", false);

    rows = data ?? [];
  }

  if (type === "users") {
    const { data } = await supabase
      .from("microsites")
      .select("owner_clerk_user_id,owner_email,id,is_published,is_active,created_at")
      .eq("is_preset", false);

    const owners = new Map<string, Record<string, unknown>>();

    for (const site of data ?? []) {
      const ownerId = site.owner_clerk_user_id || "unknown";

      if (!owners.has(ownerId)) {
        owners.set(ownerId, {
          owner_clerk_user_id: ownerId,
          owner_email: site.owner_email || "Unknown",
          microsite_count: 0,
          published_count: 0,
          active_count: 0,
          first_seen: site.created_at,
        });
      }

      const owner = owners.get(ownerId)!;

      owner.microsite_count = Number(owner.microsite_count) + 1;

      if (site.is_published) {
        owner.published_count = Number(owner.published_count) + 1;
      }

      if (site.is_active) {
        owner.active_count = Number(owner.active_count) + 1;
      }

      if (
        site.created_at &&
        (!owner.first_seen ||
          new Date(site.created_at).getTime() <
            new Date(String(owner.first_seen)).getTime())
      ) {
        owner.first_seen = site.created_at;
      }
    }

    rows = Array.from(owners.values());
  }

  if (!["support", "claims", "microsites", "users"].includes(type)) {
    return NextResponse.json({ error: "Unsupported export type" }, { status: 400 });
  }

  const csv = toCsv(rows);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}