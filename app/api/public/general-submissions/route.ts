import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function resolveSlugFromHost(hostname: string) {
  const clean = hostname.replace(/^www\./, "");

  if (clean.includes(".ko-host.com")) {
    return clean.replace(".ko-host.com", "");
  }

  return "";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const supabase = getSupabaseAdmin();

    let micrositeId = String(body.micrositeId ?? "");
    const hostname = String(body.hostname ?? "");
    const pageSlug = String(body.pageSlug ?? "home");
    const linkedButtonId = String(body.linkedButtonId ?? "");
    const message = String(body.message ?? "");
    const fields = Array.isArray(body.fields) ? body.fields : [];

    if (!micrositeId && hostname) {
      const slug = resolveSlugFromHost(hostname);

      if (slug) {
        const { data: siteRow, error: siteError } = await supabase
          .from("microsites")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();

        if (siteError) {
          return NextResponse.json(
            { ok: false, error: siteError.message },
            { status: 500 },
          );
        }

        micrositeId = siteRow?.id ?? "";
      }
    }

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