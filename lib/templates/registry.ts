export type TemplateKey =
  // Existing
  | "baby_shower"
  | "crowdfunding_campaign"
  | "family_reunion"
  | "memorial_tribute"
  | "open_house"
  | "birthday_party"
  | "product_launch"
  | "product_launch_waitlist"
  | "property_listing"
  | "property_listing_rental"
  | "resume_portfolio"
  | "wedding_rsvp"
  // New
  | "beta_testing"
  | "business_card"
  | "church_event"
  | "commercial_leasing"
  | "community_alert"
  | "companion_service"
  | "conference"
  | "contractor_portfolio"
  | "creator_portfolio"
  | "divorce_announcement"
  | "election_campaign"
  | "engagement_announcement"
  | "exploration_guide"
  | "for_sale_by_owner"
  | "nft_drop"
  | "gender_reveal"
  | "graduation"
  | "group_trip"
  | "hoa_announcement"
  | "investor_pitch"
  | "job_fair"
  | "merchant_drop"
  | "pet_adoption"
  | "private_discord"
  | "relocation"
  | "service_promo";

export const TEMPLATE_CATEGORIES = ["Events", "Business", "Real Estate", "Personal", "Career"] as const;
export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

export type TemplateBadge = "Popular" | "New" | null;

export type TemplateDef = {
  key: TemplateKey; // MUST match public.templates.template_key
  title: string;
  description: string; // marketplace description (TemplateGrid uses this directly)
  thumb: string; // filename (without extension) in /public/templates/
  setupMins: number;
  demoSlug: string; // used for /demo links (subdomain/demo)

  // ✅ registry-driven display fields
  category: TemplateCategory;
  badge?: TemplateBadge;
  features?: string[];
  tags?: string[];

  defaultDraft: {
    title: string;
    slugSuggestion: string;
  };
};

// -------------------------
// Centralized defaults (ONLY HERE; TemplateGrid stays dumb)
// -------------------------

const POPULAR_KEYS = new Set<TemplateKey>([
  "wedding_rsvp",
  "property_listing_rental",
  "product_launch_waitlist",
  "investor_pitch",
  "business_card",
  "service_promo",
  "for_sale_by_owner",
]);

const NEW_KEYS = new Set<TemplateKey>([
  "open_house",
  "crowdfunding_campaign",
  "beta_testing",
  "private_discord",
  "community_alert",
  "job_fair",
]);

function inferBadge(key: TemplateKey): TemplateBadge {
  if (POPULAR_KEYS.has(key)) return "Popular";
  if (NEW_KEYS.has(key)) return "New";
  return null;
}

function inferCategory(key: TemplateKey): TemplateCategory {
  // Events
  if (
    key === "wedding_rsvp" ||
    key === "baby_shower" ||
    key === "birthday_party" ||
    key === "family_reunion" ||
    key === "memorial_tribute" ||
    key === "open_house" ||
    key === "church_event" ||
    key === "conference" ||
    key === "gender_reveal" ||
    key === "graduation" ||
    key === "group_trip" ||
    key === "engagement_announcement"
  )
    return "Events";

  // Business
  if (
    key === "product_launch" ||
    key === "product_launch_waitlist" ||
    key === "crowdfunding_campaign" ||
    key === "beta_testing" ||
    key === "business_card" ||
    key === "community_alert" ||
    key === "investor_pitch" ||
    key === "merchant_drop" ||
    key === "nft_drop" ||
    key === "private_discord" ||
    key === "service_promo" ||
    key === "election_campaign" ||
    key === "job_fair" ||
    key === "companion_service"
  )
    return "Business";

  // Real Estate
  if (
    key === "property_listing" ||
    key === "property_listing_rental" ||
    key === "commercial_leasing" ||
    key === "for_sale_by_owner" ||
    key === "relocation" ||
    key === "hoa_announcement"
  )
    return "Real Estate";

  // Career
  if (key === "resume_portfolio" || key === "contractor_portfolio" || key === "creator_portfolio")
    return "Career";

  // Personal
  return "Personal";
}

function inferFeatures(key: TemplateKey): string[] {
  const map: Partial<Record<TemplateKey, string[]>> = {
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

  return map[key] ?? ["Gallery", "Polls"];
}

function inferTags(t: TemplateDef): string[] {
  const tags = new Set<string>();
  tags.add(t.category);
  if (t.key.includes("waitlist")) tags.add("Waitlist");
  if (t.key.includes("portfolio")) tags.add("Portfolio");
  if (t.badge === "Popular") tags.add("Popular");
  if (t.badge === "New") tags.add("New");
  return Array.from(tags).slice(0, 4);
}

function applyRegistryDefaults(input: Omit<TemplateDef, "category" | "badge" | "features" | "tags"> & Partial<Pick<TemplateDef, "category" | "badge" | "features" | "tags">>): TemplateDef {
  const category = input.category ?? inferCategory(input.key);
  const badge = (input.badge ?? inferBadge(input.key)) as TemplateBadge;
  const features = input.features ?? inferFeatures(input.key);

  const base: TemplateDef = {
    ...input,
    category,
    badge,
    features,
    tags: input.tags ?? [],
  };

  base.tags = base.tags.length ? base.tags : inferTags(base);
  return base;
}

// -------------------------
// Templates
// -------------------------

const RAW_TEMPLATE_DEFS: Array<
  Omit<TemplateDef, "category" | "badge" | "features" | "tags"> &
    Partial<Pick<TemplateDef, "category" | "badge" | "features" | "tags">>
> = [
  // Existing templates
  {
    key: "wedding_rsvp",
    title: "Wedding",
    description: "Invite everyone. Track RSVPs.",
    thumb: "wedding",
    setupMins: 5,
    demoSlug: "wedding",
    defaultDraft: { title: "Our Wedding", slugSuggestion: "ourwedding" },
  },
  {
    key: "baby_shower",
    title: "Baby Shower",
    description: "Share details. Collect RSVPs.",
    thumb: "baby",
    setupMins: 4,
    demoSlug: "baby",
    defaultDraft: { title: "Baby Shower", slugSuggestion: "babyshower" },
  },
  {
    key: "birthday_party",
    title: "Birthday",
    description: "Party info + RSVP in one link.",
    thumb: "party",
    setupMins: 3,
    demoSlug: "birthday",
    defaultDraft: { title: "Party Time", slugSuggestion: "partytime" },
  },
  {
    key: "family_reunion",
    title: "Reunion",
    description: "Schedule, location, and updates.",
    thumb: "reunion",
    setupMins: 4,
    demoSlug: "reunion",
    defaultDraft: { title: "Family Reunion", slugSuggestion: "familyreunion" },
  },
  {
    key: "memorial_tribute",
    title: "Memorial",
    description: "Share details and memories respectfully.",
    thumb: "memorial",
    setupMins: 6,
    demoSlug: "memorial",
    defaultDraft: { title: "In Loving Memory", slugSuggestion: "inmemory" },
  },
  {
    key: "open_house",
    title: "Open House",
    description: "Show details. Capture leads fast.",
    thumb: "openhouse",
    setupMins: 3,
    demoSlug: "openhouse",
    defaultDraft: { title: "Open House", slugSuggestion: "openhouse" },
  },
  {
    key: "product_launch",
    title: "Product Launch",
    description: "Launch info, links, and updates.",
    thumb: "launch",
    setupMins: 4,
    demoSlug: "launch",
    defaultDraft: { title: "Product Launch", slugSuggestion: "productlaunch" },
  },
  {
    key: "product_launch_waitlist",
    title: "Waitlist",
    description: "Collect waitlist signups fast.",
    thumb: "waitlist",
    setupMins: 2,
    demoSlug: "waitlist",
    defaultDraft: { title: "Join the Waitlist", slugSuggestion: "waitlist" },
  },
  {
    key: "crowdfunding_campaign",
    title: "Crowdfunding",
    description: "Pitch it. Fund it. Update it.",
    thumb: "crowdfunding",
    setupMins: 5,
    demoSlug: "crowdfunding",
    defaultDraft: { title: "Support Our Campaign", slugSuggestion: "campaign" },
  },
  {
    key: "property_listing",
    title: "Property Listing",
    description: "Photos, highlights, and inquiries.",
    thumb: "property",
    setupMins: 4,
    demoSlug: "property",
    defaultDraft: { title: "Property Listing", slugSuggestion: "listing" },
  },
  {
    key: "property_listing_rental",
    title: "Rental Listing",
    description: "Availability, pricing, and apply.",
    thumb: "rental",
    setupMins: 4,
    demoSlug: "rental",
    defaultDraft: { title: "Rental Listing", slugSuggestion: "rental" },
  },
  {
    key: "resume_portfolio",
    title: "Portfolio",
    description: "Your story, links, and work.",
    thumb: "resume",
    setupMins: 3,
    demoSlug: "portfolio",
    defaultDraft: { title: "My Portfolio", slugSuggestion: "myportfolio" },
  },

  // New templates
  {
    key: "beta_testing",
    title: "Beta Testing",
    description: "Recruit testers. Collect feedback.",
    thumb: "betaprogram",
    setupMins: 3,
    demoSlug: "beta",
    defaultDraft: { title: "Join Our Beta", slugSuggestion: "betatesters" },
  },
  {
    key: "business_card",
    title: "Business Card",
    description: "A clean, shareable digital card.",
    thumb: "businesscard",
    setupMins: 2,
    demoSlug: "card",
    defaultDraft: { title: "Connect With Me", slugSuggestion: "mycard" },
  },
  {
    key: "church_event",
    title: "Church Event",
    description: "Details, schedule, and updates.",
    thumb: "churchevent",
    setupMins: 3,
    demoSlug: "church",
    defaultDraft: { title: "Church Event", slugSuggestion: "churchevent" },
  },
  {
    key: "commercial_leasing",
    title: "Commercial Leasing",
    description: "Availability, highlights, inquiries.",
    thumb: "commerciallease",
    setupMins: 4,
    demoSlug: "lease",
    defaultDraft: { title: "Commercial Space", slugSuggestion: "commerciallease" },
  },
  {
    key: "community_alert",
    title: "Community Alert",
    description: "Post urgent updates fast.",
    thumb: "communityalert",
    setupMins: 2,
    demoSlug: "alert",
    defaultDraft: { title: "Community Alert", slugSuggestion: "communityalert" },
  },
  {
    key: "companion_service",
    title: "Companion Service",
    description: "Service overview + contact.",
    thumb: "companionservice",
    setupMins: 3,
    demoSlug: "companion",
    defaultDraft: { title: "Companion Service", slugSuggestion: "companion" },
  },
  {
    key: "conference",
    title: "Conference",
    description: "Agenda, speakers, venue, links.",
    thumb: "conference",
    setupMins: 5,
    demoSlug: "conf",
    defaultDraft: { title: "Conference", slugSuggestion: "conference" },
  },
  {
    key: "contractor_portfolio",
    title: "Contractor Portfolio",
    description: "Showcase work + services.",
    thumb: "contractor",
    setupMins: 4,
    demoSlug: "contractor",
    defaultDraft: { title: "My Work", slugSuggestion: "contractor" },
  },
  {
    key: "creator_portfolio",
    title: "Creator Portfolio",
    description: "Links, media, and highlights.",
    thumb: "creators",
    setupMins: 3,
    demoSlug: "creator",
    defaultDraft: { title: "Creator Portfolio", slugSuggestion: "creator" },
  },
  {
    key: "divorce_announcement",
    title: "Divorce Announcement",
    description: "Share a respectful update.",
    thumb: "divorce",
    setupMins: 2,
    demoSlug: "divorce",
    defaultDraft: { title: "Update", slugSuggestion: "announcement" },
  },
  {
    key: "election_campaign",
    title: "Election Campaign",
    description: "Platform, events, and volunteers.",
    thumb: "election",
    setupMins: 5,
    demoSlug: "election",
    defaultDraft: { title: "Campaign", slugSuggestion: "campaign" },
  },
  {
    key: "engagement_announcement",
    title: "Engagement",
    description: "Share the news + details.",
    thumb: "engagement",
    setupMins: 3,
    demoSlug: "engagement",
    defaultDraft: { title: "We’re Engaged!", slugSuggestion: "engaged" },
  },
  {
    key: "exploration_guide",
    title: "Exploration Guide",
    description: "Itinerary, maps, and tips.",
    thumb: "exploration",
    setupMins: 4,
    demoSlug: "explore",
    defaultDraft: { title: "Exploration Guide", slugSuggestion: "explore" },
  },
  {
    key: "for_sale_by_owner",
    title: "For Sale By Owner",
    description: "Photos, details, direct inquiries.",
    thumb: "fsbo",
    setupMins: 4,
    demoSlug: "fsbo",
    defaultDraft: { title: "For Sale", slugSuggestion: "forsale" },
  },
  {
    key: "nft_drop",
    title: "NFT Drop",
    description: "Drop details, links, roadmap.",
    thumb: "nftdrop",
    setupMins: 4,
    demoSlug: "nft",
    defaultDraft: { title: "NFT Drop", slugSuggestion: "nftdrop" },
  },
  {
    key: "gender_reveal",
    title: "Gender Reveal",
    description: "Details + RSVP + updates.",
    thumb: "genderreveal",
    setupMins: 3,
    demoSlug: "reveal",
    defaultDraft: { title: "Gender Reveal", slugSuggestion: "genderreveal" },
  },
  {
    key: "graduation",
    title: "Graduation",
    description: "Ceremony details + photos.",
    thumb: "graduation",
    setupMins: 3,
    demoSlug: "grad",
    defaultDraft: { title: "Graduation", slugSuggestion: "graduation" },
  },
  {
    key: "group_trip",
    title: "Group Trip",
    description: "Itinerary + group updates.",
    thumb: "grouptrip",
    setupMins: 4,
    demoSlug: "trip",
    defaultDraft: { title: "Group Trip", slugSuggestion: "grouptrip" },
  },
  {
    key: "hoa_announcement",
    title: "HOA Announcement",
    description: "Notices, rules, updates.",
    thumb: "hoaannouncement",
    setupMins: 2,
    demoSlug: "hoa",
    defaultDraft: { title: "HOA Update", slugSuggestion: "hoaupdate" },
  },
  {
    key: "investor_pitch",
    title: "Investor Pitch",
    description: "Deck link, traction, contact.",
    thumb: "investorpitch",
    setupMins: 4,
    demoSlug: "pitch",
    defaultDraft: { title: "Investor Pitch", slugSuggestion: "pitch" },
  },
  {
    key: "job_fair",
    title: "Job Fair",
    description: "Schedule, details, registration.",
    thumb: "jobfair",
    setupMins: 4,
    demoSlug: "jobfair",
    defaultDraft: { title: "Job Fair", slugSuggestion: "jobfair" },
  },
  {
    key: "merchant_drop",
    title: "Merchant Drop",
    description: "Drop info, links, promo.",
    thumb: "merchdrop",
    setupMins: 3,
    demoSlug: "drop",
    defaultDraft: { title: "New Drop", slugSuggestion: "drop" },
  },
  {
    key: "pet_adoption",
    title: "Pet Adoption",
    description: "Meet the pet + interest.",
    thumb: "petadoption",
    setupMins: 3,
    demoSlug: "pet",
    defaultDraft: { title: "Adopt Me", slugSuggestion: "petadoption" },
  },
  {
    key: "private_discord",
    title: "Private Discord",
    description: "Invite details + join link.",
    thumb: "privatediscord",
    setupMins: 2,
    demoSlug: "discord",
    defaultDraft: { title: "Private Community", slugSuggestion: "discord" },
  },
  {
    key: "relocation",
    title: "Relocation",
    description: "Moving update + timeline.",
    thumb: "relocation",
    setupMins: 2,
    demoSlug: "move",
    defaultDraft: { title: "We’re Moving", slugSuggestion: "relocation" },
  },
  {
    key: "service_promo",
    title: "Service Promo",
    description: "Offer, pricing, contact.",
    thumb: "servicepromo",
    setupMins: 3,
    demoSlug: "promo",
    defaultDraft: { title: "Special Offer", slugSuggestion: "promo" },
  },
];

export const TEMPLATE_DEFS: TemplateDef[] = RAW_TEMPLATE_DEFS.map(applyRegistryDefaults);

export function normalizeTemplateKey(input: string) {
  let s = (input || "").trim().toLowerCase();
  try {
    s = decodeURIComponent(s);
  } catch {
    // ignore invalid encodings
  }
  return s.replace(/\s+/g, "_").replace(/-/g, "_").replace(/__+/g, "_");
}

// Backwards-compatible aliases for older keys
const TEMPLATE_KEY_ALIASES: Record<string, TemplateKey> = {
  party_birthday: "birthday_party",
  birthday: "birthday_party",
  resume_portfolio_temp: "resume_portfolio",
};

export function getTemplateDef(key: string) {
  const nk = normalizeTemplateKey(key);
  const aliased = (TEMPLATE_KEY_ALIASES[nk] || nk) as string;
  return TEMPLATE_DEFS.find((t) => t.key === aliased);
}

export function isValidTemplateKey(key: string): key is TemplateKey {
  const nk = normalizeTemplateKey(key);
  const aliased = (TEMPLATE_KEY_ALIASES[nk] || nk) as string;
  return TEMPLATE_DEFS.some((t) => t.key === aliased);
}