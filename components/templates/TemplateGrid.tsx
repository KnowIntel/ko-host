"use client";

import { useEffect, useMemo, useState } from "react";
import TemplateCard from "./TemplateCard";
import TemplatePreviewModal, { type PreviewMeta } from "./TemplatePreviewModal";
import { TEMPLATE_DEFS, type TemplateDef } from "@/lib/templates/registry";

function thumbToImageUrl(thumb: string) {
  return `/templates/${thumb}.png`;
}

const CARD = 140;
const GAP = 12;

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

function safeBadge(badge: any): Badge {
  if (badge === "Popular" || badge === "New") return badge;
  return null;
}

function safeMeta(t: TemplateDef): PreviewMeta {
  const tags = Array.isArray((t as any).tags) ? ((t as any).tags as string[]) : [];
  const setupMins = typeof (t as any).setupMins === "number" ? (t as any).setupMins : 3;
  const features = Array.isArray((t as any).features) ? ((t as any).features as string[]) : [];

  return {
    tags: tags.slice(0, 4),
    setupMins,
    features: features.length ? features : ["Gallery", "Links", "Contact"],
  };
}

export default function TemplateGrid(props: {
  searchQuery: string;
  category: Category;
  sort: Sort;
  onCountChange?: (count: number) => void;
}) {
  const { searchQuery, category, sort, onCountChange } = props;

  const allTemplates: TemplateDef[] = useMemo(() => {
    return Array.isArray(TEMPLATE_DEFS) ? TEMPLATE_DEFS : [];
  }, []);

useEffect(() => {
  const keys = allTemplates.map(t => t.key);
  const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
  if (dupes.length) console.warn("DUPLICATE TEMPLATE KEYS:", dupes);
}, [allTemplates]);
  
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateDef | null>(null);
  const [previewThumb, setPreviewThumb] = useState("");
  const [previewMeta, setPreviewMeta] = useState<PreviewMeta>({
    tags: [],
    setupMins: 3,
    features: [],
  });

  // layout state
  const [isDesktop, setIsDesktop] = useState(false);
  const [isPortrait, setIsPortrait] = useState(true);

  useEffect(() => {
    setFavorites(readStringArray("kht:favorites"));
    setRecent(readStringArray("kht:recent"));
  }, []);

  useEffect(() => {
    const refresh = () => setRecent(readStringArray("kht:recent"));
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    window.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
      window.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  useEffect(() => {
    function compute() {
      const w = window.innerWidth || 0;
      setIsDesktop(w >= 1024);

      const mq = window.matchMedia?.("(orientation: portrait)");
      setIsPortrait(mq ? mq.matches : true);
    }

    compute();

    const mq = window.matchMedia?.("(orientation: portrait)");
    const onOrient = () => compute();

    window.addEventListener("resize", compute);
    mq?.addEventListener?.("change", onOrient);

    return () => {
      window.removeEventListener("resize", compute);
      mq?.removeEventListener?.("change", onOrient);
    };
  }, []);

  function toggleFavorite(key: string) {
    setFavorites((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      writeStringArray("kht:favorites", next);
      return next;
    });
  }

  function openPreview(templateKey: string) {
    const t = allTemplates.find((x) => x.key === templateKey);
    if (!t) return;

    setPreviewTemplate(t);
    setPreviewThumb(thumbToImageUrl(t.thumb));
    setPreviewMeta(safeMeta(t));
    setPreviewOpen(true);
  }

  const filteredTemplates = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();

    const recentOrder = new Map<string, number>();
    recent.forEach((k, idx) => recentOrder.set(k, idx));

    const filtered = allTemplates.filter((t) => {
      // Category filtering (registry-driven)
      const tCategory = (t as any).category as string | undefined;

      if (category === "Favorites") return favorites.includes(t.key);
      if (category === "Recently viewed") return recent.includes(t.key);
      if (category !== "All") return (tCategory || "Personal") === category;

      if (!q) return true;

      const hay = [t.title || "", t.description || "", t.key || "", tCategory || ""]
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });

    const byTitle = (a: TemplateDef, b: TemplateDef) =>
      (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: "base" });

    const badgeOf = (t: TemplateDef) => safeBadge((t as any).badge);

    const badgeRank = (b: Badge, target: "New" | "Popular") =>
      b === target ? 0 : b === null ? 2 : 1;

    const sorted = [...filtered];

    if (category === "Recently viewed") {
      sorted.sort((a, b) => {
        const ra = recentOrder.get(a.key) ?? 9999;
        const rb = recentOrder.get(b.key) ?? 9999;
        return ra - rb;
      });
      return sorted;
    }

    if (sort === "A–Z") sorted.sort(byTitle);

    if (sort === "New") {
      sorted.sort((a, b) => {
        const ra = badgeRank(badgeOf(a), "New");
        const rb = badgeRank(badgeOf(b), "New");
        if (ra !== rb) return ra - rb;
        return byTitle(a, b);
      });
    }

    if (sort === "Popular") {
      sorted.sort((a, b) => {
        const ra = badgeRank(badgeOf(a), "Popular");
        const rb = badgeRank(badgeOf(b), "Popular");
        if (ra !== rb) return ra - rb;
        return byTitle(a, b);
      });
    }

    return sorted;
  }, [allTemplates, searchQuery, category, sort, favorites, recent]);

  useEffect(() => {
    onCountChange?.(filteredTemplates.length);
  }, [filteredTemplates.length, onCountChange]);

  const gridStyle = useMemo(() => {
    // ✅ Portrait phones: 2 columns fixed
    const mobilePortraitCols = `repeat(2, ${CARD}px)`;

    // ✅ Landscape phones/tablets: flow dynamically
    const mobileLandscapeCols = `repeat(auto-fit, ${CARD}px)`;

    // ✅ Desktop: dynamic
    const desktopCols = `repeat(auto-fit, ${CARD}px)`;

    return {
      display: "grid" as const,
      gap: `${GAP}px`,
      justifyContent: "center" as const,
      paddingLeft: "12px",
      paddingRight: "12px",
      gridTemplateColumns: isDesktop
        ? desktopCols
        : isPortrait
        ? mobilePortraitCols
        : mobileLandscapeCols,
    };
  }, [isDesktop, isPortrait]);

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
            badge={safeBadge((t as any).badge)}
            isFavorite={favorites.includes(t.key)}
            onToggleFavorite={toggleFavorite}
            onPreview={openPreview}
            setupMins={typeof (t as any).setupMins === "number" ? (t as any).setupMins : 3}
          />
        ))}
      </div>

      <TemplatePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        template={previewTemplate}
        description={previewTemplate?.description || ""}
        thumbnailUrl={previewThumb}
        meta={previewMeta}
      />
    </div>
  );
}