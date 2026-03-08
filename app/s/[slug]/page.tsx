import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getDesignPreset } from "@/lib/design-presets/designRegistry";
import BlockRenderer from "@/components/preview/BlockRenderer";
import type { MicrositeBlock } from "@/lib/templates/builder";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type MicrositeRow = {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  paid_until: string | null;
  selected_design_key?: string | null;
  draft?: {
    title?: string;
    slugSuggestion?: string;
    pageBackground?: string;
    blocks?: MicrositeBlock[];
  } | null;
};

function isPaidActive(paidUntil: string | null) {
  if (!paidUntil) return false;
  return new Date(paidUntil).getTime() > Date.now();
}

function resolvePageBackground(
  pageBackground: string | undefined,
  fallbackClassName: string,
) {
  switch (pageBackground) {
    case "soft-blue":
      return "bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#dbeafe_100%)]";
    case "sunset":
      return "bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_45%,#fde68a_100%)]";
    case "mint":
      return "bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_50%,#d1fae5_100%)]";
    case "lavender":
      return "bg-[linear-gradient(135deg,#f5f3ff_0%,#ffffff_50%,#e9d5ff_100%)]";
    case "rose":
      return "bg-[linear-gradient(135deg,#fff1f2_0%,#ffffff_50%,#fecdd3_100%)]";
    case "dark-glow":
      return "bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_30%),linear-gradient(180deg,#0f172a_0%,#111827_100%)]";
    case "none":
    default:
      return fallbackClassName;
  }
}

export default async function PublicMicrositePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("microsites")
    .select("id, slug, title, is_published, paid_until, selected_design_key, draft")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    notFound();
  }

  const site = data as MicrositeRow;

  if (!isPaidActive(site.paid_until)) {
    notFound();
  }

  const designKey = site.selected_design_key || "blank";
  const design = getDesignPreset(designKey);
  const theme = design.theme;

  const blocks = Array.isArray(site.draft?.blocks) ? site.draft.blocks : [];
  const pageTitle = site.title || site.draft?.title || "Untitled Microsite";
  const pageBackgroundClassName = resolvePageBackground(
    site.draft?.pageBackground,
    theme.pageClassName,
  );

  return (
    <main className={`min-h-screen ${pageBackgroundClassName}`}>
      <div className={`w-full px-4 py-10 ${theme.containerClassName}`}>
        <div className={theme.blockGapClassName}>
          <div className={theme.titleWrapClassName}>
            <div className={theme.mutedTextClassName}>Ko-Host Site</div>
            <h1 className={`mt-3 ${theme.headingClassName}`}>{pageTitle}</h1>
            <div className={`mt-3 ${theme.bodyClassName}`}>/s/{site.slug}</div>
          </div>

          {blocks.map((block) => (
            <div key={block.id} className={theme.sectionClassName}>
              <BlockRenderer block={block} designKey={designKey} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}