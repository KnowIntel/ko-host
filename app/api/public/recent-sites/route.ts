// app/api/public/recent-sites/route.ts
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("microsites")
      .select(`
        id,
        slug,
        title,
        template_key,
        created_at,
        published_at,
        broadcast_on_homepage,
        microsite_pages (
          id,
          is_homepage,
          draft
        )
      `)
      .eq("is_published", true)
      .eq("is_active", true)
      .eq("site_visibility", "public")
      .eq("broadcast_on_homepage", true)
      .order("published_at", { ascending: false })
      .limit(24);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message || "Failed to load recent sites." },
        { status: 500 },
      );
    }

    const sites = (data || []).map((site: any) => {
      const homepage =
        Array.isArray(site.microsite_pages)
          ? site.microsite_pages.find((page: any) => page?.is_homepage) ||
            site.microsite_pages[0]
          : null;

      const draft = homepage?.draft && typeof homepage.draft === "object"
        ? homepage.draft
        : null;

      const previewImageUrl =
        draft?.pageBackgroundImage ||
        draft?.blocks?.find?.((block: any) => block?.type === "image")?.data?.image?.url ||
        draft?.blocks?.find?.((block: any) => block?.type === "listing")?.data?.image?.url ||
        draft?.blocks?.find?.((block: any) => block?.type === "gallery")?.data?.images?.[0]?.url ||
        draft?.blocks?.find?.((block: any) => block?.type === "image_carousel")?.data?.items?.[0]?.imageUrl ||
        null;

      return {
        id: String(site.id),
        slug: String(site.slug || ""),
        title: String(site.title || ""),
        templateKey: site.template_key ? String(site.template_key) : null,
        previewImageUrl,
      };
    });

    return NextResponse.json({
      ok: true,
      sites,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}