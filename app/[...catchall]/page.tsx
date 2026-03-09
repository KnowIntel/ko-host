import { headers } from "next/headers";
import { notFound } from "next/navigation";
import BlockRenderer from "@/components/preview/BlockRenderer";
import MicrositeBrand from "@/components/microsite/MicrositeBrand";
import { getDesignPreset } from "@/lib/design-presets/designRegistry";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { MicrositeBlock } from "@/lib/templates/builder";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type MicrositeRow = {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  paid_until: string | null;
  site_visibility?: string | null;
  selected_design_key?: string | null;
  draft?: {
    title?: string;
    subtitle?: string;
    slugSuggestion?: string;
    pageBackground?: string;
    backgroundMode?: "preset" | "custom-color" | "custom-image";
    customBackgroundColor?: string;
    customBackgroundImageUrl?: string;
    customBackgroundImageName?: string;
    blocks?: MicrositeBlock[];
  } | null;
};

function isPaidActive(paidUntil: string | null) {
  if (!paidUntil) return false;
  return new Date(paidUntil).getTime() > Date.now();
}

function extractSlugFromHost(host: string) {
  const cleanHost = host.split(":")[0].toLowerCase();

  if (
    cleanHost === "ko-host.com" ||
    cleanHost === "www.ko-host.com" ||
    cleanHost === "localhost" ||
    cleanHost.endsWith(".vercel.app")
  ) {
    return null;
  }

  if (cleanHost.endsWith(".ko-host.com")) {
    const parts = cleanHost.split(".");
    if (parts.length >= 3) {
      return parts[0];
    }
  }

  return null;
}

function sanitizeHexColor(value: string | undefined, fallback = "#7c3aed") {
  const raw = (value || "").trim();
  const normalized = raw.startsWith("#") ? raw : `#${raw}`;
  return /^#([0-9a-fA-F]{6})$/.test(normalized) ? normalized : fallback;
}

function resolvePresetBackgroundClassName(
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

function resolveBackgroundStyles(
  draft: MicrositeRow["draft"],
  fallbackClassName: string,
) {
  const backgroundMode = draft?.backgroundMode || "preset";

  if (backgroundMode === "custom-color") {
    return {
      className: "",
      style: {
        background: sanitizeHexColor(draft?.customBackgroundColor),
      } as React.CSSProperties,
    };
  }

  if (
    backgroundMode === "custom-image" &&
    draft?.customBackgroundImageUrl?.trim()
  ) {
    return {
      className: "",
      style: {
        backgroundImage: `url("${draft.customBackgroundImageUrl}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      } as React.CSSProperties,
    };
  }

  return {
    className: resolvePresetBackgroundClassName(
      draft?.pageBackground,
      fallbackClassName,
    ),
    style: undefined,
  };
}

export default async function PublicSubdomainPage() {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const slug = extractSlugFromHost(host);

  if (!slug) {
    notFound();
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("microsites")
    .select(
      "id, slug, title, is_published, paid_until, site_visibility, selected_design_key, draft",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    notFound();
  }

  const site = data as MicrositeRow | null;

  if (!site) {
    notFound();
  }

  if (!site.is_published) {
    notFound();
  }

  if (!isPaidActive(site.paid_until)) {
    notFound();
  }

  const designKey = site.selected_design_key || "blank";
  const design = getDesignPreset(designKey);
  const theme = design.theme;

  const blocks = Array.isArray(site.draft?.blocks) ? site.draft.blocks : [];
  const pageTitle = site.title || site.draft?.title || "Untitled Microsite";
  const pageSubtitle = site.draft?.subtitle || "";
  const background = resolveBackgroundStyles(site.draft, theme.pageClassName);

  return (
    <main
      className={`min-h-screen ${background.className}`}
      style={background.style}
    >
      <div className={`w-full px-4 py-10 ${theme.containerClassName}`}>
        <div className={theme.blockGapClassName}>
          <div className={theme.titleWrapClassName}>
            <h1
              className={theme.headingClassName}
              style={{ fontFamily: "var(--font-great-vibes)" }}
            >
              {pageTitle}
            </h1>

            {pageSubtitle ? (
              <p
                className={`mt-3 ${theme.bodyClassName}`}
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                {pageSubtitle}
              </p>
            ) : null}
          </div>

          {blocks.length > 0 ? (
            blocks.map((block) => (
              <div key={block.id} className={theme.sectionClassName}>
                <BlockRenderer block={block} designKey={designKey} />
              </div>
            ))
          ) : (
            <div className={theme.sectionClassName}>
              <h2 className={theme.subheadingClassName}>No content yet</h2>
              <p className={`mt-2 ${theme.bodyClassName}`}>
                This microsite has no saved builder blocks yet.
              </p>
            </div>
          )}
        </div>
      </div>

      <MicrositeBrand />
    </main>
  );
}