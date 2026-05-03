import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function resolveSlugFromHost(hostname: string) {
  const clean = hostname.replace(/^www\./, "");

  if (clean.includes(".ko-host.com")) {
    return clean.replace(".ko-host.com", "");
  }

  return "";
}

async function resolveMicrositeId(supabase: any, micrositeId: string, hostname: string) {
  if (micrositeId) return micrositeId;

  if (!hostname) return "";

  const slug = resolveSlugFromHost(hostname);

  if (!slug) return "";

  const { data: siteRow, error: siteError } = await supabase
    .from("microsites")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (siteError) throw new Error(siteError.message);

  return siteRow?.id ?? "";
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const supabase = getSupabaseAdmin();

    const micrositeId = await resolveMicrositeId(
      supabase,
      String(searchParams.get("micrositeId") ?? ""),
      String(searchParams.get("hostname") ?? ""),
    );

    const pageSlug = String(searchParams.get("pageSlug") ?? "home");
    const linkedButtonId = String(searchParams.get("linkedButtonId") ?? "");

    if (!micrositeId || !linkedButtonId) {
      return NextResponse.json(
        { ok: false, error: "Missing micrositeId/hostname or linkedButtonId" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("general_submissions")
      .select("id, message, fields, created_at")
      .eq("microsite_id", micrositeId)
      .eq("page_slug", pageSlug)
      .eq("linked_button_id", linkedButtonId)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, submissions: data ?? [] });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to load submissions" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const supabase = getSupabaseAdmin();

    const micrositeId = await resolveMicrositeId(
      supabase,
      String(body.micrositeId ?? ""),
      String(body.hostname ?? ""),
    );

    const pageSlug = String(body.pageSlug ?? "home");
    const linkedButtonId = String(body.linkedButtonId ?? "");
    const message = String(body.message ?? "");
    const fields = Array.isArray(body.fields) ? body.fields : [];

    if (!micrositeId || !message) {
      return NextResponse.json(
        { ok: false, error: "Missing micrositeId or message" },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("general_submissions").insert({
      microsite_id: micrositeId,
      page_slug: pageSlug,
      linked_button_id: linkedButtonId,
      message,
      fields,
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to save submission" },
      { status: 500 },
    );
  }
}