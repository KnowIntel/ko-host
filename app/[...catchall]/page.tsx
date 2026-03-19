import { headers } from "next/headers";
import { notFound } from "next/navigation";
import BlockRenderer from "@/components/preview/BlockRenderer";
import MicrositeFooterBrand from "@/components/microsite/MicrositeFooterBrand";
import { getDesignPreset } from "@/lib/design-presets/designRegistry";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { BuilderDraft, MicrositeBlock } from "@/lib/templates/builder";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{
    catchall?: string[];
  }>;
};

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
    subtext?: string;
    countdownLabel?: string;
    slugSuggestion?: string;
    pageBackground?: string;
    backgroundMode?: "preset" | "custom-color" | "custom-image";
    customBackgroundColor?: string;
    customBackgroundImageUrl?: string;
    customBackgroundImageName?: string;
    blocks?: MicrositeBlock[];
  } | null;
};

const RESERVED_ROOT_ROUTES = new Set([
  "",
  "sign-in",
  "sign-up",
  "dashboard",
  "templates",
  "after-login-test",
  "api",
  "_next",
  "favicon.ico",
  "manifest.webmanifest",
  "robots.txt",
  "sitemap.xml",
]);

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
    cleanHost === "127.0.0.1" ||
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

function getPathSlug(segments: string[] | undefined) {
  if (!segments || segments.length !== 1) return null;

  const first = (segments[0] || "").trim().toLowerCase();
  if (!first || RESERVED_ROOT_ROUTES.has(first)) return null;

  return first;
}

export default async function PublicSubdomainPage({ params }: Props) {
  const { catchall } = await params;

  const headersList = await headers();
  const host = headersList.get("host") || "";

  const hostSlug = extractSlugFromHost(host);
  const pathSlug = getPathSlug(catchall);
  const slug = hostSlug || pathSlug;

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

  if (!site || !site.is_published || !isPaidActive(site.paid_until)) {
    notFound();
  }

  const designKey = site.selected_design_key || "blank";
  const design = getDesignPreset(designKey);
  const theme = design.theme;

  const blocks = Array.isArray(site.draft?.blocks) ? site.draft.blocks : [];

  const background = resolveBackgroundStyles(site.draft, theme.pageClassName);

  const draft: BuilderDraft = {
    title: site.draft?.title || site.title || "Untitled Microsite",
    subtitle: site.draft?.subtitle || "",
    subtext: site.draft?.subtext || "",
    countdownLabel: site.draft?.countdownLabel || "",
    slugSuggestion: site.draft?.slugSuggestion || "",
    pageBackground: site.draft?.pageBackground || "none",
    blocks,
  };

  return (
    <>
      <main
        className={`min-h-screen ${background.className}`}
        style={background.style}
      >
        <div className={`w-full px-4 py-10 ${theme.containerClassName}`}>
          <div className={theme.blockGapClassName}>
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
      </main>

      <MicrositeFooterBrand />
    </>
  );
}