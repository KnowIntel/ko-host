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
  } catch {}
}

function metaForTemplate(t: TemplateDef): PreviewMeta {
  const setupMins = (t as any).setupMins ?? 3;

  const featuresByKey: Record<string, string[]> = {
    wedding_rsvp: ["RSVP", "Gallery", "Polls", "Announcements"],
    baby_shower: ["Details", "Gallery", "Polls"],
    birthday_party: ["Details", "Gallery", "Polls"],
    family_reunion: ["Schedule", "Gallery", "Polls"],
    memorial_tribute: ["Details", "Gallery"],
    open_house: ["Details", "Photos", "Contact"],
    product_launch: ["Hero section", "Links", "Media"],
    product_launch_waitlist: ["Waitlist form", "Email capture"],
    crowdfunding_campaign: ["Pitch", "Updates", "CTA links"],
    property_listing: ["Photos", "Highlights", "Contact"],
    property_listing_rental: ["Availability", "Requirements", "Contact"],
    resume_portfolio: ["Links", "Bio", "Work showcase"],
    placeholder: ["Basic content blocks"],
  };

  const tags = Array.from(
    new Set([getCategoryForTemplateKey(t.key), ...(t.key.includes("waitlist") ? ["Waitlist"] : [])])
  ).slice(0, 4);

  return {
    tags,
    setupMins,
    features: featuresByKey[t.key] ?? ["Gallery", "Polls"],
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
    const t = allTemplates.find((x) => x.key === templateKey);
    if (!t) return;

    setPreviewTemplate(t);
    setPreviewDescription(getDescription(t));
    setPreviewThumb(thumbToImageUrl(t.thumb));
    setPreviewMeta(metaForTemplate(t));
    setPreviewOpen(true);
  }

  const filteredTemplates = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();

    const recentOrder = new Map<string, number>();
    recent.forEach((k, idx) => recentOrder.set(k, idx));

    const filtered = allTemplates.filter((t) => {
      if (category === "Favorites") return favorites.includes(t.key);
      if (category === "Recently viewed") return recent.includes(t.key);
      if (category !== "All") return getCategoryForTemplateKey(t.key) === category;

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

    if (sort === "A–Z") sorted.sort(byTitle);

    if (sort === "New") {
      sorted.sort((a, b) => {
        const ra = badgeRank(badgeForTemplateKey(a.key), "New");
        const rb = badgeRank(badgeForTemplateKey(b.key), "New");
        if (ra !== rb) return ra - rb;
        return byTitle(a, b);
      });
    }

    if (sort === "Popular") {
      sorted.sort((a, b) => {
        const ra = badgeRank(badgeForTemplateKey(a.key), "Popular");
        const rb = badgeRank(badgeForTemplateKey(b.key), "Popular");
        if (ra !== rb) return ra - rb;
        return byTitle(a, b);
      });
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
      <div style={gridStyle}>
        {filteredTemplates.map((t) => (
          <TemplateCard
            key={t.key}
            templateKey={t.key}
            title={t.title}
            description={getDescription(t)}
            thumbnailUrl={thumbToImageUrl(t.thumb)}
            badge={badgeForTemplateKey(t.key)}
            isFavorite={favorites.includes(t.key)}
            onToggleFavorite={toggleFavorite}
            onPreview={openPreview}
            setupMins={(t as any).setupMins ?? 3}
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