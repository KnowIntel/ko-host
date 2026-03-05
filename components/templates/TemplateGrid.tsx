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

const POPULAR_KEYS = new Set<string>([
  "wedding_rsvp",
  "property_listing_rental",
  "product_launch_waitlist",
  "investor_pitch",
  "business_card",
  "service_promo",
  "for_sale_by_owner",
]);

const NEW_KEYS = new Set<string>([
  "open_house",
  "crowdfunding_campaign",
  "beta_testing",
  "private_discord",
  "community_alert",
  "job_fair",
]);

function badgeForTemplateKey(key: string): Badge {
  if (POPULAR_KEYS.has(key)) return "Popular";
  if (NEW_KEYS.has(key)) return "New";
  return null;
}

/**
 * Marketplace descriptions (override registry where present)
 */
const DESC: Record<string, string> = {
  // Existing
  wedding_rsvp: "Invite everyone. Track RSVPs.",
  baby_shower: "Share details. Collect RSVPs.",
  birthday_party: "Party info + RSVP in one link.",
  family_reunion: "Schedule, location, and updates.",
  memorial_tribute: "Share memories and announcements.",
  open_house: "Show details. Capture leads fast.",
  product_launch: "Launch info, links, and updates.",
  product_launch_waitlist: "Collect waitlist signups fast.",
  crowdfunding_campaign: "Pitch it. Fund it. Update it.",
  property_listing: "Photos, highlights, and inquiries.",
  property_listing_rental: "Availability, pricing, and apply.",
  resume_portfolio: "Your story, links, and work.",

  // New
  beta_testing: "Recruit testers. Collect feedback.",
  business_card: "A clean, shareable digital card.",
  church_event: "Details, schedule, and updates.",
  commercial_leasing: "Availability, highlights, inquiries.",
  community_alert: "Post urgent updates fast.",
  companion_service: "Service overview + contact.",
  conference: "Agenda, speakers, venue, links.",
  contractor_portfolio: "Showcase work + services.",
  creator_portfolio: "Links, media, and highlights.",
  divorce_announcement: "Share a respectful update.",
  election_campaign: "Platform, events, and volunteers.",
  engagement_announcement: "Share the news + details.",
  exploration_guide: "Itinerary, maps, and tips.",
  for_sale_by_owner: "Photos, details, direct inquiries.",
  nft_drop: "Drop details, links, roadmap.",
  gender_reveal: "Details + RSVP + updates.",
  graduation: "Ceremony details + photos.",
  group_trip: "Itinerary + group updates.",
  hoa_announcement: "Notices, rules, updates.",
  investor_pitch: "Deck link, traction, contact.",
  job_fair: "Schedule, details, registration.",
  merchant_drop: "Drop info, links, promo.",
  pet_adoption: "Meet the pet + interest.",
  private_discord: "Invite details + join link.",
  relocation: "Moving update + timeline.",
  service_promo: "Offer, pricing, contact.",
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
  baby_shower: "Events",
  birthday_party: "Events",
  family_reunion: "Events",
  memorial_tribute: "Events",
  open_house: "Events",
  church_event: "Events",
  conference: "Events",
  gender_reveal: "Events",
  graduation: "Events",
  group_trip: "Events",
  engagement_announcement: "Events",

  // Business
  product_launch: "Business",
  product_launch_waitlist: "Business",
  crowdfunding_campaign: "Business",
  beta_testing: "Business",
  business_card: "Business",
  community_alert: "Business",
  investor_pitch: "Business",
  merchant_drop: "Business",
  nft_drop: "Business",
  private_discord: "Business",
  service_promo: "Business",
  election_campaign: "Business",
  job_fair: "Business",
  companion_service: "Business",

  // Real Estate
  property_listing: "Real Estate",
  property_listing_rental: "Real Estate",
  commercial_leasing: "Real Estate",
  for_sale_by_owner: "Real Estate",
  relocation: "Real Estate",
  hoa_announcement: "Real Estate",

  // Career
  resume_portfolio: "Career",
  contractor_portfolio: "Career",
  creator_portfolio: "Career",

  // Personal
  divorce_announcement: "Personal",
  exploration_guide: "Personal",
  pet_adoption: "Personal",
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
    // Existing
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

    // New
    beta_testing: ["Signup", "Feedback link", "Updates"],
    business_card: ["Links", "Contact", "Socials"],
    church_event: ["Schedule", "Directions", "Updates"],
    commercial_leasing: ["Photos", "Availability", "Inquiries"],
    community_alert: ["Announcement", "Links", "Contact"],
    companion_service: ["Services", "Availability", "Contact"],
    conference: ["Agenda", "Speakers", "Venue info"],
    contractor_portfolio: ["Projects", "Services", "Contact"],
    creator_portfolio: ["Links", "Media", "Highlights"],
    divorce_announcement: ["Announcement", "FAQ", "Contact"],
    election_campaign: ["Platform", "Events", "Volunteer CTA"],
    engagement_announcement: ["Announcement", "Photos", "Details"],
    exploration_guide: ["Itinerary", "Maps", "Recommendations"],
    for_sale_by_owner: ["Photos", "Details", "Contact"],
    nft_drop: ["Mint link", "Roadmap", "Links"],
    gender_reveal: ["Event details", "RSVP", "Updates"],
    graduation: ["Event details", "Photos", "Updates"],
    group_trip: ["Itinerary", "Packing list", "Updates"],
    hoa_announcement: ["Notice", "Rules", "Updates"],
    investor_pitch: ["Deck link", "Traction", "Contact"],
    job_fair: ["Schedule", "Registration", "Location"],
    merchant_drop: ["Drop details", "Links", "Promo"],
    pet_adoption: ["Bio", "Photos", "Interest CTA"],
    private_discord: ["Rules", "Invite link", "Updates"],
    relocation: ["Timeline", "New info", "Updates"],
    service_promo: ["Offer", "Pricing", "Contact"],
  };

  const tags = Array.from(
    new Set([
      getCategoryForTemplateKey(t.key),
      ...(t.key.includes("waitlist") ? ["Waitlist"] : []),
      ...(t.key.includes("portfolio") ? ["Portfolio"] : []),
    ])
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
      gridTemplateColumns: isDesktop ? `repeat(auto-fit, ${CARD}px)` : `repeat(3, ${CARD}px)`,
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