export type TemplateKey =
  | "baby_shower"
  | "crowdfunding_campaign"
  | "family_reunion"
  | "memorial_tribute"
  | "open_house"
  | "party_birthday"
  | "product_launch"
  | "product_launch_waitlist"
  | "property_listing"
  | "property_listing_rental"
  | "resume_portfolio"
  | "resume_portfolio_temp"
  | "wedding_rsvp";

export type TemplateDef = {
  key: TemplateKey; // MUST match public.templates.template_key
  title: string;
  description: string;
  thumb: string; // placeholder
  defaultDraft: {
    title: string;
    slugSuggestion: string;
  };
};

export const TEMPLATE_DEFS: TemplateDef[] = [
  { key: "wedding_rsvp", title: "Wedding RSVP", description: "RSVPs, details, updates, gallery, polls.", thumb: "wedding", defaultDraft: { title: "Our Wedding", slugSuggestion: "ourwedding" } },
  { key: "baby_shower", title: "Baby Shower", description: "Event details, RSVP, links, gallery.", thumb: "baby", defaultDraft: { title: "Baby Shower", slugSuggestion: "babyshower" } },
  { key: "party_birthday", title: "Party / Birthday", description: "RSVP, polls, gallery for celebrations.", thumb: "party", defaultDraft: { title: "Party Time", slugSuggestion: "partytime" } },
  { key: "family_reunion", title: "Family Reunion", description: "Plans, RSVPs, polls, shared photos.", thumb: "reunion", defaultDraft: { title: "Family Reunion", slugSuggestion: "familyreunion" } },
  { key: "memorial_tribute", title: "Memorial Tribute", description: "Share details and memories respectfully.", thumb: "memorial", defaultDraft: { title: "In Loving Memory", slugSuggestion: "inmemory" } },
  { key: "open_house", title: "Open House", description: "Time/location, photos, contact.", thumb: "openhouse", defaultDraft: { title: "Open House", slugSuggestion: "openhouse" } },
  { key: "product_launch", title: "Product Launch", description: "Launch page with links and media.", thumb: "launch", defaultDraft: { title: "Product Launch", slugSuggestion: "productlaunch" } },
  { key: "product_launch_waitlist", title: "Launch Waitlist", description: "Collect interest before you drop.", thumb: "waitlist", defaultDraft: { title: "Join the Waitlist", slugSuggestion: "waitlist" } },
  { key: "crowdfunding_campaign", title: "Crowdfunding Campaign", description: "Tell the story, share progress, drive action.", thumb: "crowdfunding", defaultDraft: { title: "Support Our Campaign", slugSuggestion: "campaign" } },
  { key: "property_listing", title: "Property Listing", description: "Showcase photos, details, contact.", thumb: "property", defaultDraft: { title: "Property Listing", slugSuggestion: "listing" } },
  { key: "property_listing_rental", title: "Rental Listing", description: "Rent details, requirements, photos, contact.", thumb: "rental", defaultDraft: { title: "Rental Listing", slugSuggestion: "rental" } },
  { key: "resume_portfolio", title: "Resume Portfolio", description: "Clean one-page portfolio link.", thumb: "resume", defaultDraft: { title: "My Portfolio", slugSuggestion: "myportfolio" } },
  { key: "resume_portfolio_temp", title: "Resume Portfolio (Temp)", description: "Quick temporary portfolio link.", thumb: "resume", defaultDraft: { title: "My Portfolio", slugSuggestion: "portfolio" } },
];

export function normalizeTemplateKey(input: string) {
  let s = (input || "").trim().toLowerCase();
  try {
    s = decodeURIComponent(s);
  } catch {
    // ignore invalid encodings
  }
  return s
    .replace(/\s+/g, "_")
    .replace(/-/g, "_")
    .replace(/__+/g, "_");
}

export function getTemplateDef(key: string) {
  const nk = normalizeTemplateKey(key);
  return TEMPLATE_DEFS.find((t) => t.key === nk);
}

export function isValidTemplateKey(key: string): key is TemplateKey {
  const nk = normalizeTemplateKey(key);
  return TEMPLATE_DEFS.some((t) => t.key === nk);
}