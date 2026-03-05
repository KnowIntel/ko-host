// lib/templates/registry.ts

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
  | "resume_profile"
  | "wedding_rsvp"

  // Previous “new” batch
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
  | "service_promo"

  // ✅ Added from your newest PNG list (23)
  | "corporate_event"
  | "deal_room"
  | "dedication"
  | "disaster_relief"
  | "engagement" // (separate from engagement_announcement)
  | "hackathon"
  | "landlord_property"
  | "legal_defense"
  | "live_entertainment"
  | "masterclass"
  | "meet_and_greet"
  | "members_only"
  | "missing_person"
  | "online_course"
  | "school_fundraiser"
  | "secure_document"
  | "service_ad"
  | "settlement_info"
  | "software_trial"
  | "stock_trade_thesis"
  | "vip_access"
  | "webinar"
  | "workshop";

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

  // ✅ registry-driven display fields (required)
  category: TemplateCategory;
  badge: TemplateBadge;
  features: string[];
  tags: string[];

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
  "deal_room",
  "secure_document",
  "corporate_event",
]);

const NEW_KEYS = new Set<TemplateKey>([
  "open_house",
  "crowdfunding_campaign",
  "beta_testing",
  "private_discord",
  "community_alert",
  "job_fair",
  "software_trial",
  "stock_trade_thesis",
  "masterclass",
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
    key === "engagement_announcement" ||
    key === "corporate_event" ||
    key === "dedication" ||
    key === "engagement" ||
    key === "hackathon" ||
    key === "live_entertainment" ||
    key === "meet_and_greet" ||
    key === "webinar" ||
    key === "workshop" ||
    key === "masterclass"
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
    key === "companion_service" ||
    key === "deal_room" ||
    key === "secure_document" ||
    key === "members_only" ||
    key === "online_course" ||
    key === "software_trial" ||
    key === "stock_trade_thesis" ||
    key === "vip_access" ||
    key === "service_ad"
  )
    return "Business";

  // Real Estate
  if (
    key === "property_listing" ||
    key === "property_listing_rental" ||
    key === "commercial_leasing" ||
    key === "for_sale_by_owner" ||
    key === "relocation" ||
    key === "hoa_announcement" ||
    key === "landlord_property"
  )
    return "Real Estate";

  // Career
  if (
    key === "resume_profile" ||
    key === "contractor_portfolio" ||
    key === "creator_portfolio"
  )
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
    resume_profile: ["Links", "Bio", "Work showcase"],

    // Previous “new” batch
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

    // ✅ New 23
    corporate_event: ["Agenda", "Location", "RSVP"],
    deal_room: ["Docs", "Links", "Contact"],
    dedication: ["Details", "Gallery", "Announcements"],
    disaster_relief: ["Donation links", "Updates", "Resources"],
    engagement: ["Details", "Photos", "RSVP"],
    hackathon: ["Schedule", "Rules", "Signup"],
    landlord_property: ["Property info", "Requests", "Contact"],
    legal_defense: ["Story", "Donation links", "Updates"],
    live_entertainment: ["Lineup", "Tickets", "Venue info"],
    masterclass: ["Overview", "Signup", "Schedule"],
    meet_and_greet: ["Details", "RSVP", "Location"],
    members_only: ["Access info", "Links", "Updates"],
    missing_person: ["Details", "Photos", "Contact"],
    online_course: ["Lessons", "Resources", "Signup"],
    school_fundraiser: ["Goal", "Donation links", "Updates"],
    secure_document: ["Secure links", "Instructions", "Contact"],
    service_ad: ["Offer", "Pricing", "Contact"],
    settlement_info: ["Details", "FAQs", "Contact"],
    software_trial: ["Trial access", "Onboarding", "Support"],
    stock_trade_thesis: ["Thesis", "Catalysts", "Risk notes"],
    vip_access: ["Access details", "Rules", "Contact"],
    webinar: ["Topic", "Register", "Replay link"],
    workshop: ["Agenda", "Materials", "Signup"],
  };

  return map[key] ?? ["Gallery", "Links", "Contact"];
}

function inferTags(input: { key: TemplateKey; category: TemplateCategory; badge: TemplateBadge }): string[] {
  const tags = new Set<string>();
  tags.add(input.category);

  if (input.key.includes("waitlist")) tags.add("Waitlist");
  if (input.key.includes("portfolio") || input.key.includes("resume")) tags.add("Portfolio");
  if (input.badge === "Popular") tags.add("Popular");
  if (input.badge === "New") tags.add("New");

  return Array.from(tags).slice(0, 4);
}

type TemplateInput = Omit<TemplateDef, "category" | "badge" | "features" | "tags"> &
  Partial<Pick<TemplateDef, "category" | "badge" | "features" | "tags">>;

function applyRegistryDefaults(input: TemplateInput): TemplateDef {
  const category = input.category ?? inferCategory(input.key);
  const badge = (input.badge ?? inferBadge(input.key)) as TemplateBadge;
  const features = input.features ?? inferFeatures(input.key);
  const tags =
    input.tags && input.tags.length
      ? input.tags
      : inferTags({ key: input.key, category, badge });

  return {
    ...input,
    category,
    badge,
    features,
    tags,
  };
}

function assertUniqueKeys(defs: { key: string }[]) {
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const d of defs) {
    if (seen.has(d.key)) dupes.push(d.key);
    seen.add(d.key);
  }
  if (dupes.length) {
    throw new Error(`Duplicate TemplateDef keys: ${dupes.join(", ")}`);
  }
}

// -------------------------
// Templates (single source of truth)
// -------------------------

const RAW_TEMPLATE_DEFS: TemplateInput[] = [
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
    thumb: "babyshower",
    setupMins: 4,
    demoSlug: "baby",
    defaultDraft: { title: "Baby Shower", slugSuggestion: "babyshower" },
  },
  {
    key: "birthday_party",
    title: "Birthday",
    description: "Party info + RSVP in one link.",
    thumb: "birthdayparty",
    setupMins: 3,
    demoSlug: "birthday",
    defaultDraft: { title: "Party Time", slugSuggestion: "partytime" },
  },
  {
    key: "family_reunion",
    title: "Reunion",
    description: "Schedule, location, and updates.",
    thumb: "familyreunion",
    setupMins: 4,
    demoSlug: "reunion",
    defaultDraft: { title: "Family Reunion", slugSuggestion: "familyreunion" },
  },
  {
    key: "memorial_tribute",
    title: "Memorial",
    description: "Share details and memories respectfully.",
    thumb: "memorialtribute",
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
    thumb: "productlaunch",
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
    thumb: "propertylisting",
    setupMins: 4,
    demoSlug: "property",
    defaultDraft: { title: "Property Listing", slugSuggestion: "listing" },
  },
  {
    key: "property_listing_rental",
    title: "Rental Listing",
    description: "Availability, pricing, and apply.",
    thumb: "rentallisting",
    setupMins: 4,
    demoSlug: "rental",
    defaultDraft: { title: "Rental Listing", slugSuggestion: "rental" },
  },
  {
    key: "resume_profile",
    title: "Resume Profile",
    description: "Your story, links, and work.",
    thumb: "resumeprofile",
    setupMins: 3,
    demoSlug: "resume",
    defaultDraft: { title: "My Resume", slugSuggestion: "myresume" },
  },

  // Previous “new” batch
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

  // ✅ New 23 (your PNG list)
  {
    key: "corporate_event",
    title: "Corporate Event",
    description: "Agenda, venue, and RSVP in one link.",
    thumb: "corporateevent",
    setupMins: 4,
    demoSlug: "corporate",
    defaultDraft: { title: "Corporate Event", slugSuggestion: "corporateevent" },
  },
  {
    key: "deal_room",
    title: "Deal Room",
    description: "Share documents securely for due diligence.",
    thumb: "dealroom",
    setupMins: 4,
    demoSlug: "dealroom",
    defaultDraft: { title: "Deal Room", slugSuggestion: "dealroom" },
  },
  {
    key: "dedication",
    title: "Dedication",
    description: "Celebrate and share dedication details and photos.",
    thumb: "dedication",
    setupMins: 3,
    demoSlug: "dedication",
    defaultDraft: { title: "Dedication", slugSuggestion: "dedication" },
  },
  {
    key: "disaster_relief",
    title: "Disaster Relief",
    description: "Updates, resources, and donation links in one place.",
    thumb: "disasterrelief",
    setupMins: 3,
    demoSlug: "relief",
    defaultDraft: { title: "Disaster Relief", slugSuggestion: "disasterrelief" },
  },
  {
    key: "engagement",
    title: "Engagement",
    description: "Share the news, details, and photos.",
    thumb: "engagement",
    setupMins: 3,
    demoSlug: "engaged",
    defaultDraft: { title: "We’re Engaged!", slugSuggestion: "engagement" },
  },
  {
    key: "hackathon",
    title: "Hackathon",
    description: "Schedule, rules, and registration for your hackathon.",
    thumb: "hackathon",
    setupMins: 4,
    demoSlug: "hackathon",
    defaultDraft: { title: "Hackathon", slugSuggestion: "hackathon" },
  },
  {
    key: "landlord_property",
    title: "Landlord Property",
    description: "Property info, updates, and contact for tenants.",
    thumb: "landlordproperty",
    setupMins: 3,
    demoSlug: "landlord",
    defaultDraft: { title: "Property Info", slugSuggestion: "landlordproperty" },
  },
  {
    key: "legal_defense",
    title: "Legal Defense",
    description: "Tell the story, share updates, accept support.",
    thumb: "legaldefensefund",
    setupMins: 3,
    demoSlug: "legaldefense",
    defaultDraft: { title: "Legal Defense Fund", slugSuggestion: "legaldefense" },
  },
  {
    key: "live_entertainment",
    title: "Live Entertainment",
    description: "Lineup, venue info, and ticket links.",
    thumb: "liveentertainment",
    setupMins: 3,
    demoSlug: "live",
    defaultDraft: { title: "Live Entertainment", slugSuggestion: "liveentertainment" },
  },
  {
    key: "masterclass",
    title: "Masterclass",
    description: "Promote your masterclass with signup and details.",
    thumb: "masterclass",
    setupMins: 3,
    demoSlug: "masterclass",
    defaultDraft: { title: "Masterclass", slugSuggestion: "masterclass" },
  },
  {
    key: "meet_and_greet",
    title: "Meet & Greet",
    description: "Location, time, and RSVP for your meetup.",
    thumb: "meetandgreet",
    setupMins: 2,
    demoSlug: "meet",
    defaultDraft: { title: "Meet & Greet", slugSuggestion: "meetandgreet" },
  },
  {
    key: "members_only",
    title: "Members Only",
    description: "Private links, updates, and access info.",
    thumb: "membersonly",
    setupMins: 2,
    demoSlug: "members",
    defaultDraft: { title: "Members Only", slugSuggestion: "membersonly" },
  },
  {
    key: "missing_person",
    title: "Missing Person",
    description: "Share details, photos, and contact info fast.",
    thumb: "missingperson",
    setupMins: 2,
    demoSlug: "missing",
    defaultDraft: { title: "Missing Person", slugSuggestion: "missingperson" },
  },
  {
    key: "online_course",
    title: "Online Course",
    description: "Course overview, resources, and signup.",
    thumb: "onlinecourse",
    setupMins: 4,
    demoSlug: "course",
    defaultDraft: { title: "Online Course", slugSuggestion: "onlinecourse" },
  },
  {
    key: "school_fundraiser",
    title: "School Fundraiser",
    description: "Fundraiser goal, updates, and donation links.",
    thumb: "schoolfundraiser",
    setupMins: 3,
    demoSlug: "fundraiser",
    defaultDraft: { title: "School Fundraiser", slugSuggestion: "schoolfundraiser" },
  },
  {
    key: "secure_document",
    title: "Secure Document",
    description: "Share protected documents and instructions.",
    thumb: "securedocument",
    setupMins: 3,
    demoSlug: "secure",
    defaultDraft: { title: "Secure Documents", slugSuggestion: "securedocument" },
  },
  {
    key: "service_ad",
    title: "Service Ad",
    description: "Promote a service with pricing and contact.",
    thumb: "servicead",
    setupMins: 2,
    demoSlug: "servicead",
    defaultDraft: { title: "Service Ad", slugSuggestion: "servicead" },
  },
  {
    key: "settlement_info",
    title: "Settlement Info",
    description: "Share settlement details, FAQs, and next steps.",
    thumb: "settlmentinfo",
    setupMins: 3,
    demoSlug: "settlement",
    defaultDraft: { title: "Settlement Info", slugSuggestion: "settlementinfo" },
  },
  {
    key: "software_trial",
    title: "Software Trial",
    description: "Give prospects trial access and onboarding steps.",
    thumb: "softwaretrial",
    setupMins: 3,
    demoSlug: "trial",
    defaultDraft: { title: "Software Trial", slugSuggestion: "softwaretrial" },
  },
  {
    key: "stock_trade_thesis",
    title: "Stock Trade Thesis",
    description: "Thesis, catalysts, and risk notes in one page.",
    thumb: "stocktradethesis",
    setupMins: 4,
    demoSlug: "thesis",
    defaultDraft: { title: "Trade Thesis", slugSuggestion: "stocktradethesis" },
  },
  {
    key: "vip_access",
    title: "VIP Access",
    description: "Private access details, rules, and contact.",
    thumb: "vipaccess",
    setupMins: 2,
    demoSlug: "vip",
    defaultDraft: { title: "VIP Access", slugSuggestion: "vipaccess" },
  },
  {
    key: "webinar",
    title: "Webinar",
    description: "Topic, registration, and replay link.",
    thumb: "webinar",
    setupMins: 3,
    demoSlug: "webinar",
    defaultDraft: { title: "Webinar", slugSuggestion: "webinar" },
  },
  {
    key: "workshop",
    title: "Workshop",
    description: "Agenda, materials, and signup.",
    thumb: "workshop",
    setupMins: 3,
    demoSlug: "workshop",
    defaultDraft: { title: "Workshop", slugSuggestion: "workshop" },
  },
];

export const TEMPLATE_DEFS: TemplateDef[] = RAW_TEMPLATE_DEFS.map(applyRegistryDefaults);
assertUniqueKeys(TEMPLATE_DEFS);

export function normalizeTemplateKey(input: string) {
  let s = (input || "").trim().toLowerCase();
  try {
    s = decodeURIComponent(s);
  } catch {
    // ignore invalid encodings
  }
  return s.replace(/\s+/g, "_").replace(/-/g, "_").replace(/__+/g, "_");
}

// Backwards-compatible aliases for older keys (and any old routes you used)
const TEMPLATE_KEY_ALIASES: Record<string, TemplateKey> = {
  party_birthday: "birthday_party",
  birthday: "birthday_party",
  resume_profile_temp: "resume_profile",

  // convenience
  portfolio: "resume_profile",
  resume: "resume_profile",
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