"use client";

import { useEffect, useMemo, useState } from "react";
import TemplateCard from "./TemplateCard";
import TemplatePreviewModal, { type PreviewMeta } from "./TemplatePreviewModal";
import {
  TEMPLATE_DEFS,
  type TemplateDef,
  type TemplateCategory,
} from "@/lib/templates/registry";

function thumbToImageUrl(thumb: string) {
  return `/templates/${thumb}.webp`;
}

const CARD = 140;
const GAP = 12;
const CUSTOM_TEMPLATE_KEY = "custom_template";

export type Category =
  | "All"
  | "Favorites"
  | "Recently viewed"
  | "Events"
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
  const [previewMeta, setPreviewMeta] = useState<PreviewMeta>({
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

  function openPreview(templateKey: string) {
    const t = allTemplates.find((x) => x.key === templateKey);
    if (!t) return;

    setPreviewTemplate(t);
    setPreviewDescription(t.description);
    setPreviewThumb(thumbToImageUrl(t.thumb));
    setPreviewMeta(metaForTemplate(t));
    setPreviewOpen(true);
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
    return {
      display: "grid" as const,
      gap: `${GAP}px`,
      justifyContent: "center" as const,
      paddingLeft: "12px",
      paddingRight: "12px",
      gridTemplateColumns:
        isDesktop || isLandscapeMobile
          ? `repeat(auto-fit, ${CARD}px)`
          : `repeat(2, ${CARD}px)`,
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
            setupMins={t.setupMins ?? 3}
          />
        ))}
      </div>

      <TemplatePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        template={previewTemplate}
        description={previewDescription}
        thumbnailUrl={previewThumb}
        meta={previewMeta}
      />
    </div>
  );
}