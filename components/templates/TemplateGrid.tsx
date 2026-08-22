// components\templates\TemplateGrid.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import TemplateCard from "./TemplateCard";
import { getTemplateLayoutRegistry } from "@/lib/templates/layout-presets/layoutRegistry";
import TemplatePreviewModal, {
  type PreviewMeta,
  type TemplateDesignPreview,
} from "./TemplatePreviewModal";
import {
  TEMPLATE_DEFS,
  type TemplateDef,
  type TemplateCategory,
} from "@/lib/templates/registry";

function thumbToImageUrl(thumb: string) {
  return `/templates/${thumb}.webp`;
}

const MOBILE_CARD = 152;
const DESKTOP_CARD = 228;

const MOBILE_GAP = 12;
const DESKTOP_GAP = 18;
const CUSTOM_TEMPLATE_KEY = "custom_template";

export type Category =
  | "All"
  | "Favorites"
  | "Recently viewed"
  | "Events"
  | "Entertainment"
  | "Business"
  | "Real Estate"
  | "Personal"
  | "Career";

export type Sort = "Recommended" | "A–Z" | "New" | "Popular";

type Badge = "Popular" | "New" | null;

function readStringArray(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeStringArray(key: string, arr: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(arr));
  } catch {}
}

function getCategoryForTemplate(
  t: TemplateDef,
): Exclude<Category, "All" | "Favorites" | "Recently viewed"> {
  return t.category as TemplateCategory;
}

function metaForTemplate(t: TemplateDef): PreviewMeta {
  return {
    tags: t.tags ?? [t.category],
    setupMins: t.setupMins ?? 3,
    features: t.features ?? ["Announcement", "Links", "Contact"],
  };
}

function moveCustomTemplateLast(list: TemplateDef[]) {
  const custom = list.find((t) => t.key === CUSTOM_TEMPLATE_KEY);
  if (!custom) return list;

  return [...list.filter((t) => t.key !== CUSTOM_TEMPLATE_KEY), custom];
}

function getDesignCount(templateKey: string) {
  return getTemplateLayoutRegistry(templateKey as any)?.layouts.length ?? 0;
}

function formatBlockTypeLabel(blockType: string) {
  const labels: Record<string, string> = {
    label: "Text Label",
    text_fx: "Text Effects",
    rich_text: "Rich Text",
    image: "Image",
    image_carousel: "Image Carousel",
    gallery: "Gallery",
    video: "Video",
    audio: "Audio",
    icon: "Icon",
    frame: "Frame",
    shape: "Shape",
    wave: "Wave",

    cta: "Button",
    links: "Navigation Links",
    link_hub: "Link Hub",

    form_field: "Input Field",
    option_button: "Option Button",
    poll: "Poll",
    rsvp: "RSVP",
    enrollment_board: "Enrollment Board",
    faq: "FAQ",
    listing: "Listing",

    checklist: "Checklist",
    schedule_agenda: "Schedule / Agenda",
    calendar_event: "Calendar Event",
    timeline: "Timeline",
    map_location: "Map / Location",

    visitor_counter: "Visitor Counter",
    progress_bar: "Progress Meter",
    countdown: "Countdown",
    statistic_cards: "Statistic Cards",
    comparison_table: "Comparison Table",

    donation: "Donation",
    registry: "Registry",
    cart: "Cart",
    checkout: "Checkout",

    file_share: "File Share",
    spreadsheet: "Spreadsheet",
    post_board: "Post Board",
    thread: "Thread",

    content_panel: "Content Panel",
    process_flow: "Process Flow",
    circular_hub: "Circular Hub",
    data_pyramid: "Data Pyramid",
    formula_board: "Formula Board",
    story_cards: "Story Cards",
    interactive_hotspots: "Interactive Hotspots",

    tournament_display: "Tournament Display",
    speed_dating: "Speed Dating",
    spin_wheel: "Spin Wheel",
    pop_balloon: "Pop Balloon",
    puzzle: "Puzzle",
  };

  if (labels[blockType]) {
    return labels[blockType];
  }

  return String(blockType || "Block")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeLayoutThumbnail(value: unknown) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return "";
  }

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("/")
  ) {
    return raw;
  }

  return `/${raw.replace(/^\/+/, "")}`;
}

function getLayoutBlocks(layout: any) {
  if (Array.isArray(layout?.blocks)) {
    return layout.blocks;
  }

  if (Array.isArray(layout?.draft?.blocks)) {
    return layout.draft.blocks;
  }

  if (Array.isArray(layout?.data?.blocks)) {
    return layout.data.blocks;
  }

  if (Array.isArray(layout?.preset?.blocks)) {
    return layout.preset.blocks;
  }

  return [];
}

function getUniqueLayoutFeatures(layout: any) {
  const blocks = getLayoutBlocks(layout);

return Array.from(
  new Set<string>(
    blocks
      .map((block: any) =>
        String(block?.type ?? "").trim(),
      )
      .filter(
        (blockType: string) =>
          blockType.length > 0,
      ),
  ),
).map((blockType: string) =>
  formatBlockTypeLabel(blockType),
);
}

function getLayoutDemoUrl(layout: any) {
  const explicitUrl = String(
    layout?.demoUrl ??
      layout?.demoURL ??
      "",
  ).trim();

  if (explicitUrl) {
    return explicitUrl;
  }

  const demoSlug = String(
    layout?.demoSlug ??
      layout?.demoSiteSlug ??
      layout?.slug ??
      "",
  )
    .trim()
    .toLowerCase();

  if (!demoSlug) {
    return "";
  }

  return `https://${demoSlug}.ko-host.com/s/demo`;
}

function getTemplateDesignPreviews(
  templateKey: string,
): TemplateDesignPreview[] {
  const registry =
    getTemplateLayoutRegistry(
      templateKey as any,
    );

  const layouts =
    Array.isArray(registry?.layouts)
      ? registry.layouts
      : [];

  return layouts
    .filter((layout: any) => {
      const designKey = String(
        layout?.designKey ?? "",
      )
        .trim()
        .toLowerCase();

      const label = String(
        layout?.card?.label ?? "",
      )
        .trim()
        .toLowerCase();

      return !(
        designKey === "blank" ||
        designKey === "default" ||
        designKey === "starter" ||
        designKey === "custom" ||
        label === "blank" ||
        label === "blank design" ||
        label === "start blank" ||
        label === "custom"
      );
    })
    .map(
      (
        layout: any,
        index: number,
      ): TemplateDesignPreview => {
        const designKey = String(
          layout?.designKey ??
            `${templateKey}-${index}`,
        ).trim();

        const label = String(
          layout?.card?.label ??
            `Design ${index + 1}`,
        ).trim();

        const thumbnailUrl = String(
          layout?.card?.thumbnail ??
            "",
        ).trim();

        const demoSlug =
          `${templateKey}-${designKey}-preset`;

        return {
          id: designKey,
          label,
          thumbnailUrl,
          demoUrl:
            `https://ko-host.com/s/${demoSlug}`,
          features: [],
        };
      },
    )
    .filter(
      (design) =>
        Boolean(
          design.thumbnailUrl,
        ),
    );
}

export default function TemplateGrid(props: {
  searchQuery: string;
  category: Category;
  sort: Sort;
  onCountChange?: (count: number) => void;
}) {
  const { searchQuery, category, sort, onCountChange } = props;

  const allTemplates: TemplateDef[] = useMemo(() => {
    const defs = Array.isArray(TEMPLATE_DEFS) ? TEMPLATE_DEFS : [];
    return moveCustomTemplateLast(defs);
  }, []);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateDef | null>(null);
  const [previewDescription, setPreviewDescription] = useState("");
const [previewThumb, setPreviewThumb] = useState("");

const [
  previewDesigns,
  setPreviewDesigns,
] = useState<
  TemplateDesignPreview[]
>([]);

const [previewMeta, setPreviewMeta] =
  useState<PreviewMeta>({
    tags: [],
    setupMins: 3,
    features: [],
  });

  useEffect(() => {
    setFavorites(readStringArray("kht:favorites"));
    setRecent(readStringArray("kht:recent"));
  }, []);

  useEffect(() => {
    const refresh = () => setRecent(readStringArray("kht:recent"));

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  function toggleFavorite(key: string) {
    setFavorites((prev) => {
      const next = prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key];

      writeStringArray("kht:favorites", next);
      return next;
    });
  }

async function openPreview(
  templateKey: string,
) {
  const t =
    allTemplates.find(
      (template) =>
        template.key ===
        templateKey,
    );

  if (!t) {
    return;
  }

  const initialDesignPreviews =
    getTemplateDesignPreviews(
      templateKey,
    );

  setPreviewTemplate(t);

  setPreviewDescription(
    t.description,
  );

  setPreviewThumb(
    thumbToImageUrl(
      t.thumb,
    ),
  );

  setPreviewMeta(
    metaForTemplate(t),
  );

  /*
   * Open immediately so the user does not wait
   * for the demo feature lookups.
   */
  setPreviewDesigns(
    initialDesignPreviews,
  );

  setPreviewOpen(true);

  const hydratedDesignPreviews:
    TemplateDesignPreview[] =
    await Promise.all(
      initialDesignPreviews.map(
        async (
          design,
        ): Promise<TemplateDesignPreview> => {
          const demoSlug =
            `${templateKey}-${design.id}-preset`;

          try {
            const res =
              await fetch(
                `/api/public/template-demo-features?slug=${encodeURIComponent(
                  demoSlug,
                )}`,
                {
                  method: "GET",
                  cache: "no-store",
                },
              );

            const data: unknown =
              await res
                .json()
                .catch(
                  () => ({}),
                );

            if (
              !res.ok ||
              typeof data !==
                "object" ||
              data === null ||
              !Array.isArray(
                (
                  data as {
                    features?: unknown;
                  }
                ).features,
              )
            ) {
              return {
  ...design,
  features: t.features ?? [],
};
            }

            const rawFeatures =
              (
                data as {
                  features: unknown[];
                }
              ).features;

            const normalizedFeatures:
              string[] =
              rawFeatures
                .map(
                  (
                    feature: unknown,
                  ) =>
                    String(
                      feature ?? "",
                    ).trim(),
                )
                .filter(
                  (
                    feature: string,
                  ) =>
                    feature.length >
                    0,
                );

            const uniqueFeatures:
              string[] =
              Array.from(
                new Set<string>(
                  normalizedFeatures,
                ),
              );

return {
  ...design,

  features:
    uniqueFeatures.length > 0
      ? uniqueFeatures
      : (t.features ?? []),
};
          } catch {
  return {
    ...design,
    features: t.features ?? [],
  };
}
        },
      ),
    );

  setPreviewDesigns(
    hydratedDesignPreviews,
  );
}

  const filteredTemplates = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();

    const recentOrder = new Map<string, number>();
    recent.forEach((k, idx) => recentOrder.set(k, idx));

    const filtered = allTemplates.filter((t) => {
      const catForTemplate = getCategoryForTemplate(t);

      if (category === "Favorites" && !favorites.includes(t.key)) {
        return false;
      }

      if (category === "Recently viewed" && !recent.includes(t.key)) {
        return false;
      }

      if (
        category !== "All" &&
        category !== "Favorites" &&
        category !== "Recently viewed" &&
        catForTemplate !== category
      ) {
        return false;
      }

      if (!q) return true;

      const hay = [
        t.title || "",
        t.description || "",
        t.key || "",
        t.demoSlug || "",
        t.thumb || "",
        catForTemplate,
        ...(t.tags || []),
        ...(t.features || []),
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });

    const byTitle = (a: TemplateDef, b: TemplateDef) =>
      (a.title || "").localeCompare(b.title || "", undefined, {
        sensitivity: "base",
      });

    const badgeRank = (b: Badge, target: "New" | "Popular") =>
      b === target ? 0 : b === null ? 2 : 1;

    const sorted = [...filtered];

    if (category === "Recently viewed") {
      sorted.sort((a, b) => {
        const ra = recentOrder.get(a.key) ?? 9999;
        const rb = recentOrder.get(b.key) ?? 9999;
        if (ra !== rb) return ra - rb;

        if (a.key === CUSTOM_TEMPLATE_KEY) return 1;
        if (b.key === CUSTOM_TEMPLATE_KEY) return -1;

        return 0;
      });

      return moveCustomTemplateLast(sorted);
    }

    if (sort === "A–Z") {
      sorted.sort(byTitle);
      return moveCustomTemplateLast(sorted);
    }

    if (sort === "New") {
      sorted.sort((a, b) => {
        const ra = badgeRank(a.badge ?? null, "New");
        const rb = badgeRank(b.badge ?? null, "New");
        if (ra !== rb) return ra - rb;
        return byTitle(a, b);
      });
      return moveCustomTemplateLast(sorted);
    }

    if (sort === "Popular") {
      sorted.sort((a, b) => {
        const ra = badgeRank(a.badge ?? null, "Popular");
        const rb = badgeRank(b.badge ?? null, "Popular");
        if (ra !== rb) return ra - rb;
        return byTitle(a, b);
      });
      return moveCustomTemplateLast(sorted);
    }

    return moveCustomTemplateLast(sorted);
  }, [allTemplates, searchQuery, category, sort, favorites, recent]);

  useEffect(() => {
    onCountChange?.(filteredTemplates.length);
  }, [filteredTemplates.length, onCountChange]);

  const [isDesktop, setIsDesktop] = useState(false);
  const [isLandscapeMobile, setIsLandscapeMobile] = useState(false);

  useEffect(() => {
    function compute() {
      const w = window.innerWidth || 0;
      const h = window.innerHeight || 0;
      setIsDesktop(w >= 1024);
      setIsLandscapeMobile(w < 1024 && w > h);
    }

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

const gridStyle = useMemo(() => {
  const useLargeCards =
    isDesktop || isLandscapeMobile;

  const cardWidth = useLargeCards
    ? DESKTOP_CARD
    : MOBILE_CARD;

  const gap = useLargeCards
    ? DESKTOP_GAP
    : MOBILE_GAP;

  return {
    display: "grid" as const,
    gap: `${gap}px`,
    justifyContent: "center" as const,

    paddingLeft: useLargeCards
      ? "18px"
      : "12px",

    paddingRight: useLargeCards
      ? "18px"
      : "12px",

    gridTemplateColumns: useLargeCards
      ? `repeat(auto-fit, ${cardWidth}px)`
      : `repeat(2, ${cardWidth}px)`,
  };
}, [isDesktop, isLandscapeMobile]);

  return (
    <div className="mt-6 w-full">
      <div style={gridStyle}>
        {filteredTemplates.map((t) => (
          <TemplateCard
            key={t.key}
            templateKey={t.key}
            title={t.title}
            description={t.description}
            thumbnailUrl={thumbToImageUrl(t.thumb)}
            badge={t.badge ?? null}
            isFavorite={favorites.includes(t.key)}
            onToggleFavorite={toggleFavorite}
            onPreview={openPreview}
            designCount={getDesignCount(t.key)}
          />
        ))}
      </div>

<TemplatePreviewModal
  open={previewOpen}
onClose={() => {
  setPreviewOpen(false);
  setPreviewDesigns([]);
}}
  template={
    previewTemplate
  }
  description={
    previewDescription
  }
  thumbnailUrl={
    previewThumb
  }
  meta={
    previewMeta
  }
  designPreviews={
    previewDesigns
  }
/>
    </div>
  );
}