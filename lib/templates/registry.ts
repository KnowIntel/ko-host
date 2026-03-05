export type TemplateKey =
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
  | "wedding_rsvp";

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
    demoSlug: "open-house",
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