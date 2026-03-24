// lib/templates/registry.ts

export type TemplateKey =
  | "baby_shower"
  | "crowdfunding_campaign"
  | "family_reunion"
  | "memorial_tribute"
  | "open_house"
  | "birthday_party"
  | "product_launch"
  | "waitlist"
  | "property_listing"
  | "rental_listing"
  | "resume_profile"
  | "wedding_rsvp"
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
  | "corporate_event"
  | "deal_room"
  | "dedication"
  | "disaster_relief"
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
  | "workshop"
  | "photo_gallery"
  | "block_party"
  | "surprise_party"
  | "celebration_of_life"
  | "retirement_party"
  | "holiday_party_invite"
  | "friendsgiving_event"
  | "housewarming_party"
  | "bachelor_party"
  | "bachelorette_party"
  | "charity_gala_event"
  | "alumni_meetup"
  | "neighborhood_bbq"
  | "yard_sale"
  | "sports_team_party"
  | "bridal_shower"
  | "baptism_event"
  | "christening_event"
  | "cultural_festival_invite"
  | "music_recital_invite"
  | "limited_time_offer"
  | "flash_sale"
  | "black_friday_promotion"
  | "new_service_announcement"
  | "startup_demo_day"
  | "brand_collaboration"
  | "influencer_campaign"
  | "garage_sale"
  | "marketing_campaign_landing"
  | "new_store_opening_announcement"
  | "seasonal_promotion"
  | "brand_giveaway"
  | "contest_entry"
  | "affiliate_campaign"
  | "referral_program"
  | "airbnb_vacation_rental"
  | "land_sale_listing"
  | "property_auction"
  | "new_development_preview"
  | "freelancer_portfolio"
  | "designer_portfolio"
  | "developer_portfolio"
  | "speaker_profile"
  | "job_candidate_showcase"
  | "consultant_service"
  | "temporary_work_portfolio"
  | "community_announcement"
  | "neighborhood_alert"
  | "local_volunteer_signup"
  | "nonprofit_campaign"
  | "school_event"
  | "local_sports_league_signup"
  | "community_poll"
  | "public_feedback"
  | "town_hall_discussion"
  | "podcast_episode"
  | "youtube_video_launch"
  | "creator_link_hub"
  | "patreon_campaign"
  | "course_enrollment"
  | "live_stream_event"
  | "book_club"
  | "newsletter_signup"
  | "moving_sale"
  | "estate_sale_listing"
  | "lost_found_notice"
  | "pet_missing_alert"
  | "local_classified_ad"
  | "temporary_project"
  | "focus_group"
  | "obstacle_race"
  | "memory_timeline"
  | "after_grad"
  | "cancer_journey"
  | "bible_study"
  | "chat_room"
  | "speed_dating"
  | "weight_loss_journey"
  | "guided_tutorial"
  | "custom_template"
  | "funny_fridays"
  | "roast_session"
  | "public_apology"
  | "enthusiast_networking"
  | "mediation";

export const TEMPLATE_CATEGORIES = [
  "Events",
  "Business",
  "Real Estate",
  "Personal",
  "Career",
] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];
export type TemplateBadge = "Popular" | "New" | null;

export type TemplateDef = {
  key: TemplateKey;
  title: string;
  description: string;
  thumb: string;
  setupMins: number;
  demoSlug: string;
  category: TemplateCategory;
  badge: TemplateBadge;
  features: string[];
  tags: string[];
  defaultDraft: {
    title: string;
    slugSuggestion: string;
  };
};

const POPULAR_KEYS = new Set<TemplateKey>([
  "wedding_rsvp",
  "rental_listing",
  "investor_pitch",
  "service_promo",
  "for_sale_by_owner",
  "deal_room",
  "secure_document",
  "corporate_event",
  "photo_gallery",
]);

const NEW_KEYS = new Set<TemplateKey>([
  "open_house",
  "crowdfunding_campaign",
  "beta_testing",
  "private_discord",
  "community_alert",
  "job_fair",
  "software_trial",
  "masterclass",
  "startup_demo_day",
  "brand_collaboration",
  "creator_link_hub",
  "focus_group",
  "memory_timeline",
  "chat_room",
  "speed_dating",
  "guided_tutorial",
  "custom_template",
]);

function inferBadge(key: TemplateKey): TemplateBadge {
  if (POPULAR_KEYS.has(key)) return "Popular";
  if (NEW_KEYS.has(key)) return "New";
  return null;
}

function inferCategory(key: TemplateKey): TemplateCategory {
  if (key === "custom_template") return "Personal";

  if (
    key.includes("portfolio") ||
    key.includes("resume") ||
    key.includes("candidate") ||
    key.includes("speaker_profile")
  ) {
    return "Career";
  }

  if (
    key.includes("property") ||
    key.includes("leasing") ||
    key.includes("rental") ||
    key.includes("listing") ||
    key.includes("airbnb") ||
    key.includes("land_sale") ||
    key.includes("auction") ||
    key.includes("estate_sale")
  ) {
    return "Real Estate";
  }

  const eventish = [
    "wedding",
    "shower",
    "party",
    "reunion",
    "memorial",
    "open_house",
    "church",
    "conference",
    "graduation",
    "group_trip",
    "hackathon",
    "webinar",
    "workshop",
    "gala",
    "meetup",
    "bbq",
    "festival",
    "recital",
    "baptism",
    "christening",
    "friendsgiving",
    "housewarming",
    "masterclass",
    "live_stream",
    "live_entertainment",
    "corporate_event",
    "meet_and_greet",
    "alumni",
    "block_party",
    "bible_study",
    "speed_dating",
    "obstacle_race",
  ];

  if (eventish.some((s) => key.includes(s))) return "Events";

  const businessish = [
    "campaign",
    "promotion",
    "offer",
    "sale",
    "launch",
    "newsletter",
    "referral",
    "affiliate",
    "giveaway",
    "contest",
    "demo_day",
    "brand_",
    "influencer",
    "creator_link_hub",
    "patreon",
    "service_ad",
    "service_promo",
    "software_trial",
    "online_course",
    "course_enrollment",
    "deal_room",
    "secure_document",
    "investor_pitch",
    "business_card",
    "focus_group",
    "guided_tutorial",
  ];

  if (businessish.some((s) => key.includes(s))) return "Business";

  return "Personal";
}

function inferFeatures(key: TemplateKey): string[] {
  const map: Partial<Record<TemplateKey, string[]>> = {
    wedding_rsvp: ["RSVP", "Gallery", "Polls", "Announcements"],
    waitlist: ["Waitlist form", "Email capture"],
    deal_room: ["Documents", "Links", "Contact"],
    secure_document: ["Secure links", "Instructions", "Contact"],
    property_listing: ["Photos", "Highlights", "Contact"],
    rental_listing: ["Availability", "Requirements", "Contact"],
    photo_gallery: ["Gallery", "Highlights", "Share link"],
    stock_trade_thesis: ["Thesis", "Catalysts", "Risk notes"],
    community_poll: ["Poll", "Results", "Updates"],
    newsletter_signup: ["Signup", "Benefits", "Links"],
    focus_group: ["Signup", "Schedule", "Details"],
    chat_room: ["Thread", "Updates", "Links"],
    memory_timeline: ["Milestones", "Gallery", "Notes"],
    cancer_journey: ["Updates", "Resources", "Support links"],
    weight_loss_journey: ["Milestones", "Progress", "Updates"],
    guided_tutorial: ["Steps", "Resources", "Links"],
    custom_template: ["Flexible layout", "Custom content", "Any use case"],
  };

  return map[key] ?? ["Announcement", "Links", "Contact"];
}

function inferTags(input: {
  key: TemplateKey;
  category: TemplateCategory;
  badge: TemplateBadge;
}): string[] {
  const tags = new Set<string>();

  tags.add(input.category);

  if (input.key.includes("waitlist")) tags.add("Waitlist");
  if (input.key.includes("portfolio") || input.key.includes("resume")) tags.add("Portfolio");
  if (
    input.key.includes("sale") ||
    input.key.includes("promotion") ||
    input.key.includes("offer")
  ) {
    tags.add("Promotion");
  }

  if (input.key === "custom_template") tags.add("Flexible");

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

const RAW_TEMPLATE_DEFS: TemplateInput[] = [
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
  /* {
    key: "waitlist",
    title: "Waitlist",
    description: "Collect waitlist signups fast.",
    thumb: "waitlist",
    setupMins: 2,
    demoSlug: "waitlist",
    defaultDraft: { title: "Join the Waitlist", slugSuggestion: "waitlist" },
  }, */
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
    key: "rental_listing",
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
  {
    key: "beta_testing",
    title: "Beta Testing",
    description: "Recruit testers. Collect feedback.",
    thumb: "betaprogram",
    setupMins: 3,
    demoSlug: "beta",
    defaultDraft: { title: "Join Our Beta", slugSuggestion: "betatesters" },
  },
/*   {
    key: "business_card",
    title: "Business Card",
    description: "A clean, shareable digital card.",
    thumb: "businesscard",
    setupMins: 2,
    demoSlug: "card",
    defaultDraft: { title: "Connect With Me", slugSuggestion: "mycard" },
  }, */
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
    thumb: "commercialleasing",
    setupMins: 4,
    demoSlug: "leasing",
    defaultDraft: { title: "Commercial Leasing", slugSuggestion: "commercialleasing" },
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
    title: "Group Travel",
    description: "Itinerary + group updates.",
    thumb: "grouptravel",
    setupMins: 4,
    demoSlug: "travel",
    defaultDraft: { title: "Group Travel", slugSuggestion: "grouptravel" },
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
 /*  {
    key: "relocation",
    title: "Relocation",
    description: "Moving update + timeline.",
    thumb: "relocation",
    setupMins: 2,
    demoSlug: "move",
    defaultDraft: { title: "We’re Moving", slugSuggestion: "relocation" },
  }, */
  {
    key: "service_promo",
    title: "Service Promo",
    description: "Offer, pricing, contact.",
    thumb: "servicepromo",
    setupMins: 3,
    demoSlug: "promo",
    defaultDraft: { title: "Special Offer", slugSuggestion: "promo" },
  },
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
    description: "Share dedication details and photos.",
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
    key: "hackathon",
    title: "Hackathon",
    description: "Schedule, rules, and registration in one link.",
    thumb: "hackathon",
    setupMins: 4,
    demoSlug: "hackathon",
    defaultDraft: { title: "Hackathon", slugSuggestion: "hackathon" },
  },
/*   {
    key: "landlord_property",
    title: "Landlord Property",
    description: "Property info, updates, and contact for tenants.",
    thumb: "landlordproperty",
    setupMins: 3,
    demoSlug: "landlord",
    defaultDraft: { title: "Property Info", slugSuggestion: "landlordproperty" },
  }, */
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
/*   {
    key: "settlement_info",
    title: "Settlement Info",
    description: "Share settlement details, FAQs, and next steps.",
    thumb: "settlmentinfo",
    setupMins: 3,
    demoSlug: "settlement",
    defaultDraft: { title: "Settlement Info", slugSuggestion: "settlementinfo" },
  }, */
  {
    key: "software_trial",
    title: "Software Trial",
    description: "Trial access + onboarding steps in one link.",
    thumb: "softwaretrial",
    setupMins: 3,
    demoSlug: "trial",
    defaultDraft: { title: "Software Trial", slugSuggestion: "softwaretrial" },
  },
/*   {
    key: "stock_trade_thesis",
    title: "Stock Trade Thesis",
    description: "Thesis, catalysts, and risk notes in one page.",
    thumb: "stocktradethesis",
    setupMins: 4,
    demoSlug: "thesis",
    defaultDraft: { title: "Trade Thesis", slugSuggestion: "stocktradethesis" },
  }, */
 /*  {
    key: "vip_access",
    title: "VIP Access",
    description: "Private access details, rules, and contact.",
    thumb: "vipaccess",
    setupMins: 2,
    demoSlug: "vip",
    defaultDraft: { title: "VIP Access", slugSuggestion: "vipaccess" },
  }, */
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
  {
    key: "photo_gallery",
    title: "Photo Gallery",
    description: "A clean gallery link to share photos.",
    thumb: "photogallery",
    setupMins: 2,
    demoSlug: "gallery",
    defaultDraft: { title: "Photo Gallery", slugSuggestion: "photogallery" },
  },
  {
    key: "block_party",
    title: "Block Party",
    description: "Invite neighbors, share details, and updates.",
    thumb: "blockparty",
    setupMins: 2,
    demoSlug: "block",
    defaultDraft: { title: "Block Party", slugSuggestion: "blockparty" },
  },
  {
    key: "surprise_party",
    title: "Surprise Party",
    description: "Reveal details, RSVP, and coordination info.",
    thumb: "surpriseparty",
    setupMins: 2,
    demoSlug: "surprise",
    defaultDraft: { title: "Surprise Party", slugSuggestion: "surpriseparty" },
  },
/*   {
    key: "celebration_of_life",
    title: "Celebration of Life",
    description: "Share details, photos, and announcements respectfully.",
    thumb: "celebrationoflife",
    setupMins: 3,
    demoSlug: "celebration",
    defaultDraft: { title: "Celebration of Life", slugSuggestion: "celebrationoflife" },
  }, */
  {
    key: "retirement_party",
    title: "Retirement Party",
    description: "Invite guests and share event info in one link.",
    thumb: "retirementparty",
    setupMins: 2,
    demoSlug: "retirement",
    defaultDraft: { title: "Retirement Party", slugSuggestion: "retirementparty" },
  },
  {
    key: "holiday_party_invite",
    title: "Holiday Party",
    description: "Invite, schedule, and RSVP in one page.",
    thumb: "holidayparty",
    setupMins: 2,
    demoSlug: "holiday",
    defaultDraft: { title: "Holiday Party", slugSuggestion: "holidayparty" },
  },
  {
    key: "friendsgiving_event",
    title: "Friendsgiving Event",
    description: "Invite friends and coordinate details.",
    thumb: "friendsgivingevent",
    setupMins: 2,
    demoSlug: "friendsgiving",
    defaultDraft: { title: "Friendsgiving", slugSuggestion: "friendsgiving" },
  },
  {
    key: "housewarming_party",
    title: "Housewarming Party",
    description: "Invite and share directions in one link.",
    thumb: "housewarmingparty",
    setupMins: 2,
    demoSlug: "housewarming",
    defaultDraft: { title: "Housewarming", slugSuggestion: "housewarming" },
  },
  {
    key: "bachelor_party",
    title: "Bachelor Party",
    description: "Itinerary, location, and group updates.",
    thumb: "bachelorparty",
    setupMins: 2,
    demoSlug: "bachelor",
    defaultDraft: { title: "Bachelor Party", slugSuggestion: "bachelorparty" },
  },
  {
    key: "bachelorette_party",
    title: "Bachelorette Party",
    description: "Itinerary, location, and group updates.",
    thumb: "bacheloretteparty",
    setupMins: 2,
    demoSlug: "bachelorette",
    defaultDraft: { title: "Bachelorette Party", slugSuggestion: "bacheloretteparty" },
  },
  {
    key: "charity_gala_event",
    title: "Charity Gala Event",
    description: "Tickets, venue info, and schedule in one place.",
    thumb: "charitygalaevent",
    setupMins: 3,
    demoSlug: "gala",
    defaultDraft: { title: "Charity Gala", slugSuggestion: "charitygala" },
  },
  {
    key: "alumni_meetup",
    title: "Alumni Meetup",
    description: "Time, location, and RSVP in one link.",
    thumb: "alumnimeetup",
    setupMins: 2,
    demoSlug: "alumni",
    defaultDraft: { title: "Alumni Meetup", slugSuggestion: "alumnimeetup" },
  },
  {
    key: "neighborhood_bbq",
    title: "Neighborhood BBQ",
    description: "Invite neighbors and share details.",
    thumb: "neighborhoodbbq",
    setupMins: 2,
    demoSlug: "bbq",
    defaultDraft: { title: "Neighborhood BBQ", slugSuggestion: "neighborhoodbbq" },
  },
  {
    key: "yard_sale",
    title: "Yard Sale",
    description: "Share date/time, location, and key items.",
    thumb: "yardsale",
    setupMins: 2,
    demoSlug: "yardsale",
    defaultDraft: { title: "Yard Sale", slugSuggestion: "yardsale" },
  },
  {
    key: "sports_team_party",
    title: "Sports Team Party",
    description: "Event details, schedule, and RSVP.",
    thumb: "sportsteamparty",
    setupMins: 2,
    demoSlug: "team",
    defaultDraft: { title: "Team Party", slugSuggestion: "sportsteamparty" },
  },
  {
    key: "bridal_shower",
    title: "Bridal Shower",
    description: "Invite guests, share details, collect RSVPs.",
    thumb: "bridalshower",
    setupMins: 2,
    demoSlug: "bridal",
    defaultDraft: { title: "Bridal Shower", slugSuggestion: "bridalshower" },
  },
  {
    key: "baptism_event",
    title: "Baptism Event",
    description: "Event details, schedule, and updates.",
    thumb: "baptism",
    setupMins: 2,
    demoSlug: "baptism",
    defaultDraft: { title: "Baptism", slugSuggestion: "baptismevent" },
  },
/*   {
    key: "christening_event",
    title: "Christening Event",
    description: "Event details, schedule, and updates.",
    thumb: "christeningevent",
    setupMins: 2,
    demoSlug: "christening",
    defaultDraft: { title: "Christening", slugSuggestion: "christeningevent" },
  }, */

  {
    key: "cultural_festival_invite",
    title: "Cultural Festival Invite",
    description: "Schedule, location, and RSVP in one page.",
    thumb: "culturalfestivalinvite",
    setupMins: 3,
    demoSlug: "festival",
    defaultDraft: { title: "Cultural Festival", slugSuggestion: "culturalfestival" },
  },
/*   {
    key: "music_recital_invite",
    title: "Music Recital Invite",
    description: "Time, location, and program details.",
    thumb: "musicrecitalinvite",
    setupMins: 2,
    demoSlug: "recital",
    defaultDraft: { title: "Music Recital", slugSuggestion: "musicrecital" },
  }, */
  {
    key: "limited_time_offer",
    title: "Limited Time Offer",
    description: "Create urgency and drive action fast.",
    thumb: "limitedtimeoffer",
    setupMins: 2,
    demoSlug: "offer",
    defaultDraft: { title: "Limited Time Offer", slugSuggestion: "limitedtimeoffer" },
  },
 /*  {
    key: "flash_sale",
    title: "Flash Sale",
    description: "A fast, focused sales page with links.",
    thumb: "flashsale",
    setupMins: 2,
    demoSlug: "flash",
    defaultDraft: { title: "Flash Sale", slugSuggestion: "flashsale" },
  }, */
  {
/*     key: "black_friday_promotion",
    title: "Black Friday Promotion",
    description: "Promote deals with urgency and links.",
    thumb: "blackfridaypromotion",
    setupMins: 2,
    demoSlug: "blackfriday",
    defaultDraft: { title: "Black Friday", slugSuggestion: "blackfriday" },
  },
  { */
    key: "new_service_announcement",
    title: "New Service Announcement",
    description: "Announce a service with offer + contact.",
    thumb: "newserviceannouncement",
    setupMins: 2,
    demoSlug: "newservice",
    defaultDraft: { title: "New Service", slugSuggestion: "newservice" },
  },
  {
    key: "startup_demo_day",
    title: "Startup Demo Day",
    description: "Schedule, startups, and registration links.",
    thumb: "startupdemoday",
    setupMins: 3,
    demoSlug: "demoday",
    defaultDraft: { title: "Demo Day", slugSuggestion: "startupdemoday" },
  },
/*   {
    key: "brand_collaboration",
    title: "Brand Collaboration",
    description: "Pitch the collab, share links, and next steps.",
    thumb: "brandcollaboration",
    setupMins: 3,
    demoSlug: "collab",
    defaultDraft: { title: "Brand Collaboration", slugSuggestion: "brandcollaboration" },
  }, */
/*   {
    key: "influencer_campaign",
    title: "Influencer Campaign",
    description: "Brief, deliverables, and links in one place.",
    thumb: "influencercampaign",
    setupMins: 3,
    demoSlug: "influencer",
    defaultDraft: { title: "Influencer Campaign", slugSuggestion: "influencercampaign" },
  }, */
  {
    key: "garage_sale",
    title: "Garage Sale",
    description: "Share date/time, location, and key items.",
    thumb: "garagesale",
    setupMins: 2,
    demoSlug: "garagesale",
    defaultDraft: { title: "Garage Sale", slugSuggestion: "garagesale" },
  },
  {
    key: "marketing_campaign_landing",
    title: "Marketing Campaign",
    description: "Campaign message, CTA, and links.",
    thumb: "marketingcampaign",
    setupMins: 3,
    demoSlug: "marketing",
    defaultDraft: { title: "Campaign Landing", slugSuggestion: "marketingcampaign" },
  },
  {
    key: "new_store_opening_announcement",
    title: "New Store Opening",
    description: "Announce the opening with details and links.",
    thumb: "newstoreopening",
    setupMins: 2,
    demoSlug: "opening",
    defaultDraft: { title: "New Store Opening", slugSuggestion: "newstoreopening" },
  },
/*   {
    key: "seasonal_promotion",
    title: "Seasonal Promotion",
    description: "Seasonal offer page with links and contact.",
    thumb: "seasonalpromotion",
    setupMins: 2,
    demoSlug: "seasonal",
    defaultDraft: { title: "Seasonal Promotion", slugSuggestion: "seasonalpromotion" },
  }, */
/*   {
    key: "brand_giveaway",
    title: "Brand Giveaway",
    description: "Giveaway details, rules, and entry link.",
    thumb: "brandgiveaway",
    setupMins: 2,
    demoSlug: "giveaway",
    defaultDraft: { title: "Giveaway", slugSuggestion: "brandgiveaway" },
  }, */
  {
    key: "contest_entry",
    title: "Contest Entry",
    description: "Contest info, entry instructions, and links.",
    thumb: "contestentry",
    setupMins: 2,
    demoSlug: "contest",
    defaultDraft: { title: "Contest Entry", slugSuggestion: "contestentry" },
  },
/*   {
    key: "affiliate_campaign",
    title: "Affiliate Campaign",
    description: "Program details, terms, and signup link.",
    thumb: "affiliatecampaign",
    setupMins: 3,
    demoSlug: "affiliate",
    defaultDraft: { title: "Affiliate Program", slugSuggestion: "affiliatecampaign" },
  }, */
  {
    key: "referral_program",
    title: "Referral Program",
    description: "Referral details, rewards, and links.",
    thumb: "referralprogram",
    setupMins: 2,
    demoSlug: "referral",
    defaultDraft: { title: "Referral Program", slugSuggestion: "referralprogram" },
  },
  {
    key: "airbnb_vacation_rental",
    title: "Airbnb Vacation Rental",
    description: "House rules, directions, and contact for guests.",
    thumb: "airbnbrental",
    setupMins: 3,
    demoSlug: "airbnb",
    defaultDraft: { title: "Vacation Rental", slugSuggestion: "airbnbvacationrental" },
  },
  {
    key: "land_sale_listing",
    title: "Land Sale Listing",
    description: "Listing details, photos, and inquiries.",
    thumb: "landsalelisting",
    setupMins: 3,
    demoSlug: "land",
    defaultDraft: { title: "Land For Sale", slugSuggestion: "landsale" },
  },
  {
    key: "property_auction",
    title: "Property Auction",
    description: "Auction details, date/time, and contact.",
    thumb: "propertyauction",
    setupMins: 3,
    demoSlug: "auction",
    defaultDraft: { title: "Property Auction", slugSuggestion: "propertyauction" },
  },
/*   {
    key: "new_development_preview",
    title: "New Development Preview",
    description: "Preview highlights, availability, and inquiries.",
    thumb: "newdevelopmentpreview",
    setupMins: 4,
    demoSlug: "development",
    defaultDraft: { title: "New Development", slugSuggestion: "newdevelopment" },
  }, */
  {
    key: "freelancer_portfolio",
    title: "Freelancer Portfolio",
    description: "Showcase work, services, and contact.",
    thumb: "freelancerportfolio",
    setupMins: 3,
    demoSlug: "freelance",
    defaultDraft: { title: "Freelancer Portfolio", slugSuggestion: "freelancerportfolio" },
  },
/*   {
    key: "designer_portfolio",
    title: "Designer Portfolio",
    description: "A clean portfolio page for designers.",
    thumb: "designerportfolio",
    setupMins: 3,
    demoSlug: "designer",
    defaultDraft: { title: "Designer Portfolio", slugSuggestion: "designerportfolio" },
  }, */
/*   {
    key: "developer_portfolio",
    title: "Developer Portfolio",
    description: "Projects, links, and contact in one page.",
    thumb: "developerportfolio",
    setupMins: 3,
    demoSlug: "dev",
    defaultDraft: { title: "Developer Portfolio", slugSuggestion: "developerportfolio" },
  }, */
  {
    key: "speaker_profile",
    title: "Speaker Profile",
    description: "Bio, topics, and booking contact.",
    thumb: "speakerprofile",
    setupMins: 2,
    demoSlug: "speaker",
    defaultDraft: { title: "Speaker Profile", slugSuggestion: "speakerprofile" },
  },
/*   {
    key: "job_candidate_showcase",
    title: "Job Candidate Showcase",
    description: "A clean, shareable professional profile.",
    thumb: "jobcandidateshowcase",
    setupMins: 2,
    demoSlug: "candidate",
    defaultDraft: { title: "Candidate Showcase", slugSuggestion: "jobcandidate" },
  }, */
  {
    key: "consultant_service",
    title: "Consultant Service",
    description: "Service overview, pricing, and contact.",
    thumb: "consultantservice",
    setupMins: 2,
    demoSlug: "consult",
    defaultDraft: { title: "Consultant Service", slugSuggestion: "consultantservice" },
  },
/*   {
    key: "temporary_work_portfolio",
    title: "Temporary Work Portfolio",
    description: "Short-term portfolio link for a project or role.",
    thumb: "temporaryworkportfolio",
    setupMins: 2,
    demoSlug: "tempwork",
    defaultDraft: { title: "Work Portfolio", slugSuggestion: "temporarywork" },
  }, */
/*   {
    key: "community_announcement",
    title: "Community Announcement",
    description: "Post a community update in one place.",
    thumb: "communityannouncement",
    setupMins: 2,
    demoSlug: "community",
    defaultDraft: { title: "Community Announcement", slugSuggestion: "communityannouncement" },
  }, */
  {
    key: "neighborhood_alert",
    title: "Neighborhood Alert",
    description: "Share urgent neighborhood updates fast.",
    thumb: "neighborhoodalert",
    setupMins: 2,
    demoSlug: "neighborhood",
    defaultDraft: { title: "Neighborhood Alert", slugSuggestion: "neighborhoodalert" },
  },
 /*  {
    key: "local_volunteer_signup",
    title: "Local Volunteer Signup",
    description: "Collect volunteer signups and share details.",
    thumb: "localvolunteersignup",
    setupMins: 2,
    demoSlug: "volunteer",
    defaultDraft: { title: "Volunteer Signup", slugSuggestion: "localvolunteers" },
  }, */
/*   {
    key: "nonprofit_campaign",
    title: "Nonprofit Campaign",
    description: "Tell the story, drive action, share updates.",
    thumb: "nonprofitcampaign",
    setupMins: 3,
    demoSlug: "nonprofit",
    defaultDraft: { title: "Nonprofit Campaign", slugSuggestion: "nonprofitcampaign" },
  }, */
  {
    key: "school_event",
    title: "School Event",
    description: "Schedule, details, and updates.",
    thumb: "schoolevent",
    setupMins: 2,
    demoSlug: "schoolevent",
    defaultDraft: { title: "School Event", slugSuggestion: "schoolevent" },
  },
  {
    key: "local_sports_league_signup",
    title: "Local Sports League Signup",
    description: "Collect signups and share schedule details.",
    thumb: "localsportsleaguesignup",
    setupMins: 2,
    demoSlug: "league",
    defaultDraft: { title: "League Signup", slugSuggestion: "localsportsleague" },
  },
  {
    key: "community_poll",
    title: "Community Poll",
    description: "Collect votes and share results.",
    thumb: "communitypoll",
    setupMins: 2,
    demoSlug: "poll",
    defaultDraft: { title: "Community Poll", slugSuggestion: "communitypoll" },
  },
/*   {
    key: "public_feedback",
    title: "Public Feedback",
    description: "Collect feedback fast with links and contact.",
    thumb: "publicfeedback",
    setupMins: 2,
    demoSlug: "feedback",
    defaultDraft: { title: "Public Feedback", slugSuggestion: "publicfeedback" },
  }, */
  {
    key: "town_hall_discussion",
    title: "Town Hall Discussion",
    description: "Agenda, topics, and how to participate.",
    thumb: "townhalldiscussion",
    setupMins: 3,
    demoSlug: "townhall",
    defaultDraft: { title: "Town Hall", slugSuggestion: "townhall" },
  },
  {
    key: "podcast_episode",
    title: "Podcast Episode",
    description: "Episode links, notes, and subscribe CTA.",
    thumb: "podcastepisode",
    setupMins: 2,
    demoSlug: "podcast",
    defaultDraft: { title: "Podcast Episode", slugSuggestion: "podcastepisode" },
  },
  {
    key: "youtube_video_launch",
    title: "YouTube Video Launch",
    description: "Premiere link, notes, and CTA.",
    thumb: "youtubevideolaunch",
    setupMins: 2,
    demoSlug: "youtube",
    defaultDraft: { title: "Video Launch", slugSuggestion: "youtubevideolaunch" },
  },
  {
    key: "creator_link_hub",
    title: "Creator Link Hub",
    description: "One clean page for all your creator links.",
    thumb: "creatorlinkhub",
    setupMins: 2,
    demoSlug: "links",
    defaultDraft: { title: "My Links", slugSuggestion: "creatorlinkhub" },
  },
/*   {
    key: "patreon_campaign",
    title: "Patreon Campaign",
    description: "Pitch your Patreon and link tiers/content.",
    thumb: "patreoncampaign",
    setupMins: 2,
    demoSlug: "patreon",
    defaultDraft: { title: "Support on Patreon", slugSuggestion: "patreoncampaign" },
  }, */
/*   {
    key: "course_enrollment",
    title: "Course Enrollment",
    description: "Enrollment info, schedule, and signup link.",
    thumb: "courseenrollment",
    setupMins: 3,
    demoSlug: "enroll",
    defaultDraft: { title: "Course Enrollment", slugSuggestion: "courseenrollment" },
  }, */
/*   {
    key: "live_stream_event",
    title: "Live Stream Event",
    description: "Stream link, schedule, and updates.",
    thumb: "livestreamevent",
    setupMins: 2,
    demoSlug: "stream",
    defaultDraft: { title: "Live Stream", slugSuggestion: "livestream" },
  }, */
  {
    key: "book_club",
    title: "Book Club",
    description: "Book info, links, and membership updates.",
    thumb: "bookclub",
    setupMins: 3,
    demoSlug: "book",
    defaultDraft: { title: "Book Club", slugSuggestion: "bookclub" },
  },
 /*  {
    key: "newsletter_signup",
    title: "Newsletter Signup",
    description: "Collect subscribers and share benefits.",
    thumb: "newslettersignup",
    setupMins: 2,
    demoSlug: "newsletter",
    defaultDraft: { title: "Newsletter", slugSuggestion: "newslettersignup" },
  }, */
/*   {
    key: "moving_sale",
    title: "Moving Sale",
    description: "Moving sale details, items, and location.",
    thumb: "movingsale",
    setupMins: 2,
    demoSlug: "movingsale",
    defaultDraft: { title: "Moving Sale", slugSuggestion: "movingsale" },
  }, */
  {
    key: "estate_sale_listing",
    title: "Estate Sale Listing",
    description: "Estate sale details, items, and schedule.",
    thumb: "estatesalelisting",
    setupMins: 2,
    demoSlug: "estatesale",
    defaultDraft: { title: "Estate Sale", slugSuggestion: "estatesale" },
  },
  {
    key: "lost_found_notice",
    title: "Lost & Found Notice",
    description: "Post a lost/found notice with contact info.",
    thumb: "lostfoundnotice",
    setupMins: 2,
    demoSlug: "lostfound",
    defaultDraft: { title: "Lost & Found", slugSuggestion: "lostfound" },
  },
  {
    key: "pet_missing_alert",
    title: "Pet Missing Alert",
    description: "Share pet details, photo, and contact fast.",
    thumb: "petmissingalert",
    setupMins: 2,
    demoSlug: "petmissing",
    defaultDraft: { title: "Missing Pet", slugSuggestion: "petmissing" },
  },
  {
    key: "local_classified_ad",
    title: "Local Classified Ad",
    description: "A clean classified ad with details and contact.",
    thumb: "localclassifiedad",
    setupMins: 2,
    demoSlug: "classified",
    defaultDraft: { title: "Classified Ad", slugSuggestion: "localclassified" },
  },
/*   {
    key: "temporary_project",
    title: "Temporary Project",
    description: "A short-term project page with updates + links.",
    thumb: "temporaryproject",
    setupMins: 2,
    demoSlug: "project",
    defaultDraft: { title: "Temporary Project", slugSuggestion: "temporaryproject" },
  }, */
  {
    key: "focus_group",
    title: "Focus Group",
    description: "Collect signups, share details, and coordinate sessions.",
    thumb: "focusgroup",
    setupMins: 2,
    demoSlug: "focusgroup",
    category: "Business",
    defaultDraft: { title: "Focus Group", slugSuggestion: "focusgroup" },
  },
  {
    key: "obstacle_race",
    title: "Obstacle Race",
    description: "Share race details, schedule, and signup info.",
    thumb: "obstaclerace",
    setupMins: 2,
    demoSlug: "obstaclerace",
    category: "Events",
    defaultDraft: { title: "Obstacle Race", slugSuggestion: "obstaclerace" },
  },
  {
    key: "memory_timeline",
    title: "Memory Timeline",
    description: "Tell a story through milestones, photos, and memories.",
    thumb: "memorytimeline",
    setupMins: 3,
    demoSlug: "memorytimeline",
    category: "Personal",
    defaultDraft: { title: "Memory Timeline", slugSuggestion: "memorytimeline" },
  },
  /* {
    key: "after_grad",
    title: "After Grad",
    description: "Share next steps, celebration details, and updates after graduation.",
    thumb: "aftergrad",
    setupMins: 2,
    demoSlug: "aftergrad",
    category: "Personal",
    defaultDraft: { title: "After Grad", slugSuggestion: "aftergrad" },
  }, */
  {
    key: "cancer_journey",
    title: "Cancer Journey",
    description: "Share updates, milestones, support links, and resources.",
    thumb: "cancerjourney",
    setupMins: 3,
    demoSlug: "cancerjourney",
    category: "Personal",
    defaultDraft: { title: "Cancer Journey", slugSuggestion: "cancerjourney" },
  },
  {
    key: "bible_study",
    title: "Bible Study",
    description: "Share meeting details, reading plans, and updates.",
    thumb: "biblestudy",
    setupMins: 2,
    demoSlug: "biblestudy",
    category: "Events",
    defaultDraft: { title: "Bible Study", slugSuggestion: "biblestudy" },
  },
  {
    key: "chat_room",
    title: "Chat Room",
    description: "Create a simple shared space for discussion and updates.",
    thumb: "chatroom",
    setupMins: 2,
    demoSlug: "chatroom",
    category: "Personal",
    defaultDraft: { title: "Chat Room", slugSuggestion: "chatroom" },
  },
  {
    key: "speed_dating",
    title: "Speed Dating",
    description: "Share time, location, format, and signup details.",
    thumb: "speeddating",
    setupMins: 2,
    demoSlug: "speeddating",
    category: "Events",
    defaultDraft: { title: "Speed Dating", slugSuggestion: "speeddating" },
  },
  {
    key: "weight_loss_journey",
    title: "Weight Loss Journey",
    description: "Track progress, milestones, updates, and encouragement.",
    thumb: "weightlossjourney",
    setupMins: 3,
    demoSlug: "weightlossjourney",
    category: "Personal",
    defaultDraft: { title: "Weight Loss Journey", slugSuggestion: "weightlossjourney" },
  },
  {
    key: "guided_tutorial",
    title: "Guided Tutorial",
    description: "Walk visitors through a process with steps, tips, and resources.",
    thumb: "guidedtutorial",
    setupMins: 3,
    demoSlug: "guidedtutorial",
    category: "Business",
    defaultDraft: { title: "Guide Tutorial", slugSuggestion: "guidedtutorial" },
  },
  {
    key: "custom_template",
    title: "Custom Template",
    description: "Start with a flexible template for ideas not already covered.",
    thumb: "customtemplate",
    setupMins: 2,
    demoSlug: "custom",
    category: "Personal",
    defaultDraft: { title: "Custom Template", slugSuggestion: "customtemplate" },
  },
  {
  key: "funny_fridays",
  title: "Funny Fridays",
  description: "A weekly drop of laughs, jokes, and good vibes.",
  thumb: "funnyfridays",
  setupMins: 2,
  demoSlug: "funnyfridays",
  category: "Events",
  defaultDraft: {
    title: "Funny Fridays",
    slugSuggestion: "funnyfridays",
  },
},
{
  key: "roast_session",
  title: "Roast Session",
  description: "A savage but hilarious event page for roasts and callouts.",
  thumb: "roastsession",
  setupMins: 2,
  demoSlug: "roastsession",
  category: "Events",
  defaultDraft: {
    title: "Roast Session",
    slugSuggestion: "roastsession",
  },
},
{
  key: "public_apology",
  title: "Public Apology",
  description: "Own the moment. Share your statement clearly and directly.",
  thumb: "publicapology",
  setupMins: 1,
  demoSlug: "publicapology",
  category: "Personal",
  defaultDraft: {
    title: "Public Apology",
    slugSuggestion: "publicapology",
  },
},

  {
    key: "enthusiast_networking",
    title: "Enthusiast Networking",
    description: "Connect with others who share your interests.",
    thumb: "enthusiastnetworking",
    setupMins: 2,
    demoSlug: "enthusiastnetworking",
    defaultDraft: { title: "Enthusiast Networking", slugSuggestion: "enthusiastnetworking" },
  },
{
  key: "mediation",
  title: "Mediation",
  description: "Organize discussions, agreements, and shared updates in one place.",
  thumb: "mediation",
  setupMins: 2,
  demoSlug: "mediation",
  category: "Personal",
  defaultDraft: {
    title: "Mediation",
    slugSuggestion: "mediation",
  },
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

export function getTemplateDef(key: string) {
  const normalized = normalizeTemplateKey(key);
  return TEMPLATE_DEFS.find((t) => t.key === normalized);
}

export function isValidTemplateKey(key: string): key is TemplateKey {
  const normalized = normalizeTemplateKey(key);
  return TEMPLATE_DEFS.some((t) => t.key === normalized);
}