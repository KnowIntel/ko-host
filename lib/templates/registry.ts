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

export type TemplateDef = {
  key: TemplateKey; // MUST match public.templates.template_key
  title: string;
  description: string;
  thumb: string; // filename (without extension) in /public/templates/
  setupMins: number;
  demoSlug: string; // used for /demo links (subdomain/demo)
  defaultDraft: {
    title: string;
    slugSuggestion: string;
  };
};

export const TEMPLATE_DEFS: TemplateDef[] = [
  // -------------------------
  // Existing templates
  // -------------------------
  {
    key: "wedding_rsvp",
    title: "Wedding",
    description: "RSVPs, details, updates, gallery, polls.",
    thumb: "wedding",
    setupMins: 5,
    demoSlug: "wedding",
    defaultDraft: { title: "Our Wedding", slugSuggestion: "ourwedding" },
  },
  {
    key: "baby_shower",
    title: "Baby Shower",
    description: "Event details, RSVP, links, gallery.",
    thumb: "baby",
    setupMins: 4,
    demoSlug: "baby",
    defaultDraft: { title: "Baby Shower", slugSuggestion: "babyshower" },
  },
  {
    key: "birthday_party",
    title: "Birthday",
    description: "RSVP, polls, gallery for celebrations.",
    thumb: "party",
    setupMins: 3,
    demoSlug: "birthday",
    defaultDraft: { title: "Party Time", slugSuggestion: "partytime" },
  },
  {
    key: "family_reunion",
    title: "Reunion",
    description: "Plans, RSVPs, polls, shared photos.",
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
    description: "Time/location, photos, contact.",
    thumb: "openhouse",
    setupMins: 3,
    demoSlug: "openhouse",
    defaultDraft: { title: "Open House", slugSuggestion: "openhouse" },
  },
  {
    key: "product_launch",
    title: "Product Launch",
    description: "Launch page with links and media.",
    thumb: "launch",
    setupMins: 4,
    demoSlug: "launch",
    defaultDraft: { title: "Product Launch", slugSuggestion: "productlaunch" },
  },
  {
    key: "product_launch_waitlist",
    title: "Waitlist",
    description: "Collect interest before you drop.",
    thumb: "waitlist",
    setupMins: 2,
    demoSlug: "waitlist",
    defaultDraft: { title: "Join the Waitlist", slugSuggestion: "waitlist" },
  },
  {
    key: "crowdfunding_campaign",
    title: "Crowdfunding",
    description: "Tell the story, share progress, drive action.",
    thumb: "crowdfunding",
    setupMins: 5,
    demoSlug: "crowdfunding",
    defaultDraft: { title: "Support Our Campaign", slugSuggestion: "campaign" },
  },
  {
    key: "property_listing",
    title: "Property Listing",
    description: "Showcase photos, details, contact.",
    thumb: "property",
    setupMins: 4,
    demoSlug: "property",
    defaultDraft: { title: "Property Listing", slugSuggestion: "listing" },
  },
  {
    key: "property_listing_rental",
    title: "Rental Listing",
    description: "Rent details, requirements, photos, contact.",
    thumb: "rental",
    setupMins: 4,
    demoSlug: "rental",
    defaultDraft: { title: "Rental Listing", slugSuggestion: "rental" },
  },
  {
    key: "resume_portfolio",
    title: "Portfolio",
    description: "Clean one-page portfolio link.",
    thumb: "resume",
    setupMins: 3,
    demoSlug: "portfolio",
    defaultDraft: { title: "My Portfolio", slugSuggestion: "myportfolio" },
  },

  // -------------------------
  // New templates (your list)
  // -------------------------
  {
    key: "beta_testing",
    title: "Beta Testing",
    description: "Recruit testers, collect feedback, ship faster.",
    thumb: "betaprogram",
    setupMins: 3,
    demoSlug: "beta",
    defaultDraft: { title: "Join Our Beta", slugSuggestion: "betatesters" },
  },
  {
    key: "business_card",
    title: "Business Card",
    description: "One link with your info, links, and contact.",
    thumb: "businesscard",
    setupMins: 2,
    demoSlug: "card",
    defaultDraft: { title: "Connect With Me", slugSuggestion: "mycard" },
  },
  {
    key: "church_event",
    title: "Church Event",
    description: "Event details, schedule, and updates in one place.",
    thumb: "churchevent",
    setupMins: 3,
    demoSlug: "church",
    defaultDraft: { title: "Church Event", slugSuggestion: "churchevent" },
  },
  {
    key: "commercial_leasing",
    title: "Commercial Leasing",
    description: "Space highlights, availability, and inquiries.",
    thumb: "commerciallease",
    setupMins: 4,
    demoSlug: "lease",
    defaultDraft: { title: "Commercial Space", slugSuggestion: "commerciallease" },
  },
  {
    key: "community_alert",
    title: "Community Alert",
    description: "Post urgent updates and keep everyone informed.",
    thumb: "communityalert",
    setupMins: 2,
    demoSlug: "alert",
    defaultDraft: { title: "Community Alert", slugSuggestion: "communityalert" },
  },
  {
    key: "companion_service",
    title: "Companion Service",
    description: "Service overview, availability, and contact.",
    thumb: "companionservice",
    setupMins: 3,
    demoSlug: "companion",
    defaultDraft: { title: "Companion Service", slugSuggestion: "companion" },
  },
  {
    key: "conference",
    title: "Conference",
    description: "Agenda, speakers, venue, and links.",
    thumb: "conference",
    setupMins: 5,
    demoSlug: "conf",
    defaultDraft: { title: "Conference", slugSuggestion: "conference" },
  },
  {
    key: "contractor_portfolio",
    title: "Contractor Portfolio",
    description: "Show your work, services, and contact.",
    thumb: "contractor",
    setupMins: 4,
    demoSlug: "contractor",
    defaultDraft: { title: "My Work", slugSuggestion: "contractor" },
  },
  {
    key: "creator_portfolio",
    title: "Creator Portfolio",
    description: "Links, media, and your best work in one page.",
    thumb: "creators",
    setupMins: 3,
    demoSlug: "creator",
    defaultDraft: { title: "Creator Portfolio", slugSuggestion: "creator" },
  },
  {
    key: "divorce_announcement",
    title: "Divorce Announcement",
    description: "Share a respectful update and next steps.",
    thumb: "divorce",
    setupMins: 2,
    demoSlug: "divorce",
    defaultDraft: { title: "Update", slugSuggestion: "announcement" },
  },
  {
    key: "election_campaign",
    title: "Election Campaign",
    description: "Platform, events, donations, and volunteer signup.",
    thumb: "election",
    setupMins: 5,
    demoSlug: "election",
    defaultDraft: { title: "Campaign", slugSuggestion: "campaign" },
  },
  {
    key: "engagement_announcement",
    title: "Engagement",
    description: "Share the news, photos, and event details.",
    thumb: "engagement",
    setupMins: 3,
    demoSlug: "engagement",
    defaultDraft: { title: "We’re Engaged!", slugSuggestion: "engaged" },
  },
  {
    key: "exploration_guide",
    title: "Exploration Guide",
    description: "Itinerary, maps, and must-see spots.",
    thumb: "exploration",
    setupMins: 4,
    demoSlug: "explore",
    defaultDraft: { title: "Exploration Guide", slugSuggestion: "explore" },
  },
  {
    key: "for_sale_by_owner",
    title: "For Sale By Owner",
    description: "Photos, details, and direct inquiries.",
    thumb: "fsbo",
    setupMins: 4,
    demoSlug: "fsbo",
    defaultDraft: { title: "For Sale", slugSuggestion: "forsale" },
  },
  {
    key: "nft_drop",
    title: "NFT Drop",
    description: "Drop details, mint link, and roadmap.",
    thumb: "nftdrop",
    setupMins: 4,
    demoSlug: "nft",
    defaultDraft: { title: "NFT Drop", slugSuggestion: "nftdrop" },
  },
  {
    key: "gender_reveal",
    title: "Gender Reveal",
    description: "Details, countdown, and RSVP.",
    thumb: "genderreveal",
    setupMins: 3,
    demoSlug: "reveal",
    defaultDraft: { title: "Gender Reveal", slugSuggestion: "genderreveal" },
  },
  {
    key: "graduation",
    title: "Graduation",
    description: "Ceremony info, RSVP, and photos.",
    thumb: "graduation",
    setupMins: 3,
    demoSlug: "grad",
    defaultDraft: { title: "Graduation", slugSuggestion: "graduation" },
  },
  {
    key: "group_trip",
    title: "Group Trip",
    description: "Plans, itinerary, and group updates.",
    thumb: "grouptrip",
    setupMins: 4,
    demoSlug: "trip",
    defaultDraft: { title: "Group Trip", slugSuggestion: "grouptrip" },
  },
  {
    key: "hoa_announcement",
    title: "HOA Announcement",
    description: "Post notices, policies, and updates.",
    thumb: "hoaannouncement",
    setupMins: 2,
    demoSlug: "hoa",
    defaultDraft: { title: "HOA Update", slugSuggestion: "hoaupdate" },
  },
  {
    key: "investor_pitch",
    title: "Investor Pitch",
    description: "Pitch, traction, deck link, and contact.",
    thumb: "investorpitch",
    setupMins: 4,
    demoSlug: "pitch",
    defaultDraft: { title: "Investor Pitch", slugSuggestion: "pitch" },
  },
  {
    key: "job_fair",
    title: "Job Fair",
    description: "Details, schedule, and registration.",
    thumb: "jobfair",
    setupMins: 4,
    demoSlug: "jobfair",
    defaultDraft: { title: "Job Fair", slugSuggestion: "jobfair" },
  },
  {
    key: "merchant_drop",
    title: "Merchant Drop",
    description: "New drop info, links, and promo details.",
    thumb: "merchdrop",
    setupMins: 3,
    demoSlug: "drop",
    defaultDraft: { title: "New Drop", slugSuggestion: "drop" },
  },
  {
    key: "pet_adoption",
    title: "Pet Adoption",
    description: "Meet the pet, details, and adoption interest form.",
    thumb: "petadoption",
    setupMins: 3,
    demoSlug: "pet",
    defaultDraft: { title: "Adopt Me", slugSuggestion: "petadoption" },
  },
  {
    key: "private_discord",
    title: "Private Discord",
    description: "Invite details, rules, and join link.",
    thumb: "privatediscord",
    setupMins: 2,
    demoSlug: "discord",
    defaultDraft: { title: "Private Community", slugSuggestion: "discord" },
  },
  {
    key: "relocation",
    title: "Relocation",
    description: "Moving update, timeline, and info.",
    thumb: "relocation",
    setupMins: 2,
    demoSlug: "move",
    defaultDraft: { title: "We’re Moving", slugSuggestion: "relocation" },
  },
  {
    key: "service_promo",
    title: "Service Promo",
    description: "Promote a service with pricing and contact.",
    thumb: "servicepromo",
    setupMins: 3,
    demoSlug: "promo",
    defaultDraft: { title: "Special Offer", slugSuggestion: "promo" },
  },

  // NOTE: If you want these two from your list as separate templates later:
  // "Commercial Leasing" already added above.
  // "Conference" already added above.
  // "Group Trip" already added above.
];

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
  resume_portfolio_temp: "resume_portfolio", // old temp key maps to portfolio
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