"use client";

import { useEffect, useMemo, useState } from "react";
import TemplateCard from "./TemplateCard";
import TemplatePreviewModal, { type PreviewMeta } from "./TemplatePreviewModal";
import { TEMPLATE_DEFS, type TemplateDef } from "@/lib/templates/registry";

function thumbToImageUrl(thumb: string) {
  return `/templates/${thumb}.png`;
}

const CARD = 140; // must match TemplateCard
const GAP = 12;

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
 * Short marketplace descriptions (override registry)
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

/**
 * Preview metadata
 */
const PREVIEW_META: Record<string, PreviewMeta> = {
  wedding_rsvp: {
    tags: ["RSVP", "Events"],
    setupMins: 2,
    features: ["RSVP collection", "Event details + schedule", "Shareable link"],
  },
  wedding: {
    tags: ["RSVP", "Events"],
    setupMins: 2,
    features: ["RSVP collection", "Event details + schedule", "Shareable link"],
  },
  baby_shower: {
    tags: ["RSVP", "Events"],
    setupMins: 2,
    features: ["RSVP collection", "Gift / registry links", "Event details"],
  },
  birthday_party: {
    tags: ["RSVP", "Events"],
    setupMins: 2,
    features: ["RSVP collection", "Location + time", "Bring / notes section"],
  },
  family_reunion: {
    tags: ["Events"],
    setupMins: 3,
    features: ["Schedule & locations", "Updates section", "Contact info"],
  },
  memorial_tribute: {
    tags: ["Personal"],
    setupMins: 3,
    features: [
      "Announcement details",
      "Photo + message section",
      "Shareable tribute link",
    ],
  },

  open_house: {
    tags: ["Leads", "Events", "Real Estate"],
    setupMins: 3,
    features: ["Property highlights", "Lead capture", "Date/time + location"],
  },
  property_listing: {
    tags: ["Listing", "Real Estate"],
    setupMins: 4,
    features: ["Photo gallery", "Highlights & specs", "Inquiry button"],
  },
  rental_listing: {
    tags: ["Listing", "Real Estate"],
    setupMins: 4,
    features: ["Availability + pricing", "Photo gallery", "Inquiry button"],
  },
  property_listing_rental: {
    tags: ["Apply", "Real Estate"],
    setupMins: 5,
    features: ["Availability + pricing", "Apply / inquiry CTA", "Screening info section"],
  },

  product_launch: {
    tags: ["Launch", "Business"],
    setupMins: 3,
    features: ["Launch details", "Links + media", "Updates section"],
  },
  product_launch_waitlist: {
    tags: ["Waitlist", "Business"],
    setupMins: 3,
    features: ["Waitlist signup", "Value prop section", "Email capture"],
  },
  event_waitlist: {
    tags: ["Waitlist", "Events"],
    setupMins: 2,
    features: ["Signup list", "Basic details", "Confirmation messaging"],
  },
  crowdfunding_campaign: {
    tags: ["Fundraising", "Business"],
    setupMins: 4,
    features: ["Pitch section", "Donation / pledge links", "Updates section"],
  },

  resume_portfolio: {
    tags: ["Portfolio", "Career"],
    setupMins: 5,
    features: ["Bio + links", "Projects section", "Contact CTA"],
  },
  resume_portfolio_temp: {
    tags: ["Portfolio", "Career"],
    setupMins: 5,
    features: ["Bio + links", "Projects section", "Contact CTA"],
  },

  placeholder: {
    tags: ["Simple", "Personal"],
    setupMins: 1,
    features: ["Clean layout", "Title + sections", "Shareable link"],
  },
};

function getPreviewMeta(t: TemplateDef): PreviewMeta {
  return (
    PREVIEW_META[t.key] || {
      tags: ["Template"],
      setupMins: 3,
      features: ["Fast setup", "Mobile-friendly", "Shareable link"],
    }
  );
}

/**
 * Categories
 */
export type Category =
  | "All"
  | "Favorites"
  | "Recently viewed"
  | "Events"
  | "Business"
  | "Real Estate"
  | "Personal"
  | "Career";

const CATEGORY_BY_KEY: Record<
  string,
  Exclude<Category, "All" | "Favorites" | "Recently viewed">
> = {
  wedding_rsvp: "Events",
  wedding: "Events",
  baby_shower: "Events",
  birthday_party: "Events",
  family_reunion: "Events",
  memorial_tribute: "Events",
  open_house: "Events",
  event_waitlist: "Events",

  product_launch: "Business",
  product_launch_waitlist: "Business",
  crowdfunding_campaign: "Business",

  property_listing: "Real Estate",
  property_listing_rental: "Real Estate",
  rental_listing: "Real Estate",

  resume_portfolio: "Career",
  resume_portfolio_temp: "Career",

  placeholder: "Personal",
};

function getCategoryForTemplateKey(
  key: string
): Exclude<Category, "All" | "Favorites" | "Recently viewed"> {
  return CATEGORY_BY_KEY[key] || "Personal";
}

export type Sort = "Recommended" | "A–Z" | "New" | "Popular";

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

type StatsMap = Record<string, { views: number; creates: number; updatedAt: number }>;

function readStats(): StatsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem("kht:stats");
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function popularityScore(stats: StatsMap, key: string) {
  const s = stats[key];
  if (!s) return 0;
  // weight creates higher than views
  const views = Number(s.views || 0);
  const creates = Number(s.creates || 0);
  return creates * 5 + views * 1;
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

  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [stats, setStats] = useState<StatsMap>({});

  useEffect(() => {
    setFavorites(readStringArray("kht:favorites"));
    setRecent(readStringArray("kht:recent"));
    setStats(readStats());
  }, []);

  // keep Recently viewed + stats fresh (back nav, tab focus)
  useEffect(() => {
    const refresh = () => {
      setRecent(readStringArray("kht:recent"));
      setStats(readStats());
    };
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

  const effectiveCategory: Category = useMemo(() => {
    if (category === "Favorites" && favorites.length === 0) return "All";
    if (category === "Recently viewed" && recent.length === 0) return "All";
    return category;
  }, [category, favorites.length, recent.length]);

  // Modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewKey, setPreviewKey] = useState<string | null>(null);

  const previewTemplate = useMemo(() => {
    if (!previewKey) return null;
    return allTemplates.find((t) => t.key === previewKey) || null;
  }, [allTemplates, previewKey]);

  const filteredTemplates = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();

    // for "Recently viewed", keep recency order
    const recentOrder = new Map<string, number>();
    recent.forEach((k, idx) => recentOrder.set(k, idx));

    const filtered = allTemplates.filter((t) => {
      if (effectiveCategory === "Favorites") {
        if (!favorites.includes(t.key)) return false;
      } else if (effectiveCategory === "Recently viewed") {
        if (!recent.includes(t.key)) return false;
      } else if (effectiveCategory !== "All") {
        const cat = getCategoryForTemplateKey(t.key);
        if (cat !== effectiveCategory) return false;
      }

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

    if (effectiveCategory === "Recently viewed") {
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
      // ✅ REAL popularity sort (creates weighted > views)
      sorted.sort((a, b) => {
        const pa = popularityScore(stats, a.key);
        const pb = popularityScore(stats, b.key);
        if (pa !== pb) return pb - pa;
        return byTitle(a, b);
      });
    } else {
      // Recommended: keep registry order
    }

    return sorted;
  }, [allTemplates, searchQuery, effectiveCategory, sort, favorites, recent, stats]);

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

  function openPreview(key: string) {
    setPreviewKey(key);
    setPreviewOpen(true);
  }

  function closePreview() {
    setPreviewOpen(false);
  }

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
            thumbnailUrl={thumbToImageUrl((t as any).thumb)}
            badge={badgeForTemplateKey(t.key)}
            isFavorite={favorites.includes(t.key)}
            onToggleFavorite={toggleFavorite}
            onPreview={openPreview}
          />
        ))}
      </div>

      <TemplatePreviewModal
        open={previewOpen}
        onClose={closePreview}
        template={previewTemplate}
        description={previewTemplate ? getDescription(previewTemplate) : ""}
        thumbnailUrl={
          previewTemplate
            ? thumbToImageUrl((previewTemplate as any).thumb)
            : "/templates/placeholder.png"
        }
        meta={
          previewTemplate
            ? getPreviewMeta(previewTemplate)
            : {
                tags: ["Template"],
                setupMins: 3,
                features: ["Fast setup", "Mobile-friendly", "Shareable link"],
              }
        }
      />
    </div>
  );
}