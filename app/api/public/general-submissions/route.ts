import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const micrositeId = String(body.micrositeId ?? "");
    const pageSlug = String(body.pageSlug ?? "home");
    const linkedButtonId = String(body.linkedButtonId ?? "");
    const message = String(body.message ?? "");
    const fields = Array.isArray(body.fields) ? body.fields : [];

    if (!micrositeId || !message) {
      return NextResponse.json(
        { error: "Missing micrositeId or message" },
        { status: 400 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { error } = await supabase.from("general_submissions").insert({
      microsite_id: micrositeId,
      page_slug: pageSlug,
      linked_button_id: linkedButtonId,
      message,
      fields,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to save submission" },
      { status: 500 },
    );
  }
}