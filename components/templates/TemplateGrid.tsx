"use client";

import { useEffect, useMemo, useState } from "react";
import TemplateCard from "./TemplateCard";
import { TEMPLATE_DEFS, type TemplateDef } from "@/lib/templates/registry";

function thumbToImageUrl(thumb: string) {
  return `/templates/${thumb}.png`;
}

const CARD = 140; // must match TemplateCard
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

function badgeForTemplateKey(key: string): Badge {
  if (
    key === "wedding_rsvp" ||
    key === "property_listing_rental" ||
    key === "product_launch_waitlist"
  )
    return "Popular";
  if (key === "open_house" || key === "crowdfunding_campaign") return "New";
  return null;
}

/**
 * Short “marketplace style” descriptions (override registry where present)
 */
const DESC: Record<string, string> = {
  wedding_rsvp: "Invite everyone. Track RSVPs.",
  wedding: "Invite everyone. Track RSVPs.",

  baby_shower: "Share details. Collect RSVPs.",
  birthday_party: "Party info + RSVP in one link.",
  family_reunion: "Schedule, location, and updates.",
  memorial_tribute: "Share memories and announcements.",

  open_house: "Show details. Capture leads fast.",
  property_listing: "Photos, highlights, and inquiries.",
  rental_listing: "List it. Screen it. Fill it.",
  property_listing_rental: "Availability, pricing, and apply.",

  product_launch: "Launch info, links, and updates.",
  product_launch_waitlist: "Collect waitlist signups fast.",
  event_waitlist: "Signups now. Notifications later.",
  crowdfunding_campaign: "Pitch it. Fund it. Update it.",

  resume_portfolio: "Your story, links, and work.",
  resume_portfolio_temp: "Your story, links, and work.",

  placeholder: "A clean page in minutes.",
};

function getDescription(t: TemplateDef) {
  if (DESC[t.key]) return DESC[t.key];

  const raw = (t as any).description as string | undefined;
  const fromRegistry = raw?.trim();
  if (fromRegistry) return fromRegistry;

  return "A clean page in minutes.";
}

const CATEGORY_BY_KEY: Record<
  string,
  Exclude<Category, "All" | "Favorites" | "Recently viewed">
> = {
  // Events
  wedding_rsvp: "Events",
  wedding: "Events",
  baby_shower: "Events",
  birthday_party: "Events",
  family_reunion: "Events",
  memorial_tribute: "Events",
  open_house: "Events",
  event_waitlist: "Events",

  // Business
  product_launch: "Business",
  product_launch_waitlist: "Business",
  crowdfunding_campaign: "Business",

  // Real Estate
  property_listing: "Real Estate",
  property_listing_rental: "Real Estate",
  rental_listing: "Real Estate",

  // Career
  resume_portfolio: "Career",
  resume_portfolio_temp: "Career",

  // Personal / misc
  placeholder: "Personal",
};

function getCategoryForTemplateKey(
  key: string
): Exclude<Category, "All" | "Favorites" | "Recently viewed"> {
  return CATEGORY_BY_KEY[key] || "Personal";
}

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
  } catch {
    // ignore
  }
}

export default function TemplateGrid(props: {
  searchQuery: string;
  category: Category;
  sort: Sort;
  onCountChange?: (count: number) => void;
}) {
  const { searchQuery, category, sort, onCountChange } = props;

  // IMPORTANT: do not filter here (keep registry as source of truth)
  const allTemplates: TemplateDef[] = useMemo(() => {
    return Array.isArray(TEMPLATE_DEFS) ? TEMPLATE_DEFS : [];
  }, []);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(readStringArray("kht:favorites"));
    setRecent(readStringArray("kht:recent"));
  }, []);

  // Keep recent fresh (back nav / tab focus)
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

  function toggleFavorite(key: string) {
    setFavorites((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      writeStringArray("kht:favorites", next);
      return next;
    });
  }

  function openPreview(templateKey: string) {
    // If your TemplateCard already triggers the modal via onPreview, keep it.
    // This function is here so TemplateGrid compiles regardless of modal wiring.
    // eslint-disable-next-line no-console
    console.log("preview", templateKey);
  }

  const filteredTemplates = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();

    const recentOrder = new Map<string, number>();
    recent.forEach((k, idx) => recentOrder.set(k, idx));

    const filtered = allTemplates.filter((t) => {
      // category filter
      if (category === "Favorites") {
        if (!favorites.includes(t.key)) return false;
      } else if (category === "Recently viewed") {
        if (!recent.includes(t.key)) return false;
      } else if (category !== "All") {
        const cat = getCategoryForTemplateKey(t.key);
        if (cat !== category) return false;
      }

      // search filter
      if (!q) return true;

      const catForSearch = getCategoryForTemplateKey(t.key);
      const hay = [t.title || "", getDescription(t) || "", t.key || "", catForSearch]
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });

    const byTitle = (a: TemplateDef, b: TemplateDef) =>
      (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: "base" });

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

    if (sort === "A–Z") {
      sorted.sort(byTitle);
    } else if (sort === "New") {
      sorted.sort((a, b) => {
        const ra = badgeRank(badgeForTemplateKey(a.key), "New");
        const rb = badgeRank(badgeForTemplateKey(b.key), "New");
        if (ra !== rb) return ra - rb;
        return byTitle(a, b);
      });
    } else if (sort === "Popular") {
      sorted.sort((a, b) => {
        const ra = badgeRank(badgeForTemplateKey(a.key), "Popular");
        const rb = badgeRank(badgeForTemplateKey(b.key), "Popular");
        if (ra !== rb) return ra - rb;
        return byTitle(a, b);
      });
    } else {
      // Recommended: keep registry order
    }

    return sorted;
  }, [allTemplates, searchQuery, category, sort, favorites, recent]);

  useEffect(() => {
    onCountChange?.(filteredTemplates.length);
  }, [filteredTemplates.length, onCountChange]);

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    function compute() {
      const w = window.innerWidth || 0;
      setIsDesktop(w >= 1024);
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
      gridTemplateColumns: isDesktop
        ? `repeat(auto-fit, ${CARD}px)`
        : `repeat(3, ${CARD}px)`,
    };
  }, [isDesktop]);

  return (
    <div className="mt-6 w-full">
      {filteredTemplates.length === 0 ? (
        <div className="mx-auto max-w-2xl rounded-xl border border-neutral-200 bg-white/70 p-4 text-sm text-neutral-700 backdrop-blur">
          No templates match your search.
        </div>
      ) : null}

      <div style={gridStyle}>
        {filteredTemplates.map((t) => (
          <TemplateCard
            key={t.key}
            templateKey={t.key}
            title={t.title}
            description={getDescription(t)}
            thumbnailUrl={thumbToImageUrl(t.thumb)}
            badge={badgeForTemplateKey(t.key) ?? undefined}
            isFavorite={favorites.includes(t.key)}
            onToggleFavorite={toggleFavorite}
            onPreview={openPreview}
          />
        ))}
      </div>
    </div>
  );
}