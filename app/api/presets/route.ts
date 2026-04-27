import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function stripNestedPagesFromDraft(value: any) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const { pages: _pages, ...draftWithoutNestedPages } = value;
  return draftWithoutNestedPages;
}

export async function GET(req: NextRequest) {
  try {
    const templateKey = String(
      req.nextUrl.searchParams.get("templateKey") || "",
    ).trim();

    const designKey = String(
      req.nextUrl.searchParams.get("designKey") || "blank",
    ).trim();

    if (!templateKey || !designKey) {
      return NextResponse.json(
        { ok: false, error: "Missing templateKey or designKey." },
        { status: 400 },
      );
    }

    const presetKey = `${templateKey}:${designKey}`;
    const supabaseAdmin = getSupabaseAdmin();

    const { data: microsite, error } = await supabaseAdmin
      .from("microsites")
      .select("id, slug, title, template_key, selected_design_key, draft, preset_key")
      .eq("is_preset", true)
      .eq("preset_key", presetKey)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    if (!microsite) {
      return NextResponse.json(
        { ok: false, error: "Preset not found." },
        { status: 404 },
      );
    }

    const { data: pages, error: pagesError } = await supabaseAdmin
      .from("microsite_pages")
      .select("id, slug, title, display_order, draft")
      .eq("microsite_id", microsite.id)
      .eq("is_preset", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (pagesError) {
      return NextResponse.json(
        { ok: false, error: pagesError.message },
        { status: 500 },
      );
    }

    const normalizedPages = (pages || []).map((page, index) => ({
      id: page.slug === "home" ? "home" : page.id,
      slug: page.slug,
      title: page.title || page.slug,
      display_order: page.display_order ?? index,
      draft: {
        ...stripNestedPagesFromDraft(page.draft),
        slugSuggestion: microsite.slug,
      },
    }));

    const homePage =
      normalizedPages.find((page) => page.slug === "home") || normalizedPages[0];

    const homeDraft = stripNestedPagesFromDraft(
      homePage?.draft || microsite.draft || {},
    );

    const draft = {
      ...homeDraft,
      slugSuggestion: microsite.slug,
      pages: normalizedPages,
    };

    return NextResponse.json({
      ok: true,
      draft,
      micrositeSlug: microsite.slug,
      presetKey,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}