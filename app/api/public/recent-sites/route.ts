// app/api/public/recent-sites/route.ts
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function extractPreviewImageUrlFromDraft(draft: any): string | null {
  if (!draft || typeof draft !== "object") return null;

  const blocks = Array.isArray(draft.blocks) ? draft.blocks : [];

  for (const block of blocks) {
    if (!block || typeof block !== "object") continue;

    if (block.type === "image" && block.data?.image?.url) {
      return block.data.image.url;
    }

    if (block.type === "listing" && block.data?.image?.url) {
      return block.data.image.url;
    }

    if (block.type === "gallery" && Array.isArray(block.data?.images)) {
      const firstGalleryImage = block.data.images.find((img: any) => img?.url);
      if (firstGalleryImage?.url) return firstGalleryImage.url;
    }

    if (
      block.type === "image_carousel" &&
      Array.isArray(block.data?.items)
    ) {
      const firstCarouselImage = block.data.items.find(
        (item: any) => item?.imageUrl,
      );
      if (firstCarouselImage?.imageUrl) return firstCarouselImage.imageUrl;
    }

    if (block.type === "festiveBackground" && block.data?.image?.url) {
      return block.data.image.url;
    }
  }

  if (
    typeof draft.pageBackgroundImage === "string" &&
    draft.pageBackgroundImage.trim()
  ) {
    return draft.pageBackgroundImage;
  }

  return null;
}

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data: microsites, error: micrositesError } = await supabaseAdmin
      .from("microsites")
      .select(`
        id,
        slug,
        title,
        template_key,
        selected_design_key,
        published_at,
        created_at,
        draft,
        homepage_thumbnail_url
      `)
      .eq("broadcast_on_homepage", true)
      .eq("is_published", true)
      .eq("is_active", true)
      .eq("site_visibility", "public")
      .order("published_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(24);

    if (micrositesError) {
      console.error(
        "RECENT SITES API ERROR: microsites lookup failed",
        micrositesError,
      );

      return NextResponse.json(
        { ok: false, error: micrositesError.message, sites: [] },
        { status: 500 },
      );
    }

    if (!microsites?.length) {
      return NextResponse.json({ ok: true, sites: [] });
    }

const dedupedSites = [];
const seenSiteKeys = new Set<string>();

for (const site of microsites) {
  const uniqueKey = site.slug;

  if (seenSiteKeys.has(uniqueKey)) continue;
  seenSiteKeys.add(uniqueKey);

  dedupedSites.push({
    id: site.id,
    slug: site.slug,
    title: site.title || site.slug,
    previewImageUrl:
      site.homepage_thumbnail_url ||
      extractPreviewImageUrlFromDraft(site.draft ?? null),
    templateKey: site.template_key ?? null,
  });

  if (dedupedSites.length >= 24) break;
}

return NextResponse.json({
  ok: true,
  sites: dedupedSites,
});
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    console.error("RECENT SITES API FATAL:", message);

    return NextResponse.json(
      { ok: false, error: message, sites: [] },
      { status: 500 },
    );
  }
}