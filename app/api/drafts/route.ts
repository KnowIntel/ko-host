// app/api/drafts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const templateKey = req.nextUrl.searchParams.get("templateKey") || "";
    const designKey = req.nextUrl.searchParams.get("designKey") || "blank";

    if (!templateKey) {
      return NextResponse.json(
        { ok: false, error: "Missing templateKey" },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("microsite_drafts")
      .select("*")
      .eq("owner_clerk_user_id", userId)
      .eq("template_key", templateKey)
      .eq("design_key", designKey)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      draftRow: data ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const templateKey = String(body?.templateKey || "");
    const designKey = String(body?.designKey || "blank");
    const draft = body?.draft;

    if (!templateKey) {
      return NextResponse.json(
        { ok: false, error: "Missing templateKey" },
        { status: 400 },
      );
    }

    if (!draft || typeof draft !== "object") {
      return NextResponse.json(
        { ok: false, error: "Missing draft payload" },
        { status: 400 },
      );
    }

    const title = typeof draft.title === "string" ? draft.title : null;

    // IMPORTANT:
    // This value is saved as a user preference only.
    // It does NOT reserve, hold, validate, or claim the slug.
    const slugPreference =
      typeof draft.slugSuggestion === "string" && draft.slugSuggestion.trim()
        ? draft.slugSuggestion.trim()
        : null;

    const supabaseAdmin = getSupabaseAdmin();

    const payload = {
      owner_clerk_user_id: userId,
      template_key: templateKey,
      design_key: designKey,
      title,
      slug_suggestion: slugPreference,
      draft,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("microsite_drafts")
      .upsert(payload, {
        onConflict: "owner_clerk_user_id,template_key,design_key",
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      draftRow: data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}