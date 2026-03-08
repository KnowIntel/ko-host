import type { MicrositeBlock } from "@/lib/templates/builder";

export type LayoutPreset = {
  key: string;
  blocks: MicrositeBlock[];
};

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

function announcement(
  headline = "Welcome",
  body = "",
  label = "Announcement",
): MicrositeBlock {
  return {
    id: id("announcement"),
    type: "announcement",
    label,
    data: {
      headline,
      body,
    },
  };
}

function links(
  heading = "Helpful Links",
  items: Array<{ label: string; url: string }> = [],
  label = "Links",
): MicrositeBlock {
  return {
    id: id("links"),
    type: "links",
    label,
    data: {
      heading,
      items: items.map((item) => ({
        id: id("link"),
        label: item.label,
        url: item.url,
      })),
    },
  };
}

function contact(heading = "Contact", label = "Contact"): MicrositeBlock {
  return {
    id: id("contact"),
    type: "contact",
    label,
    data: {
      heading,
      name: "",
      email: "",
      phone: "",
    },
  };
}

function gallery(heading = "Gallery", label = "Gallery"): MicrositeBlock {
  return {
    id: id("gallery"),
    type: "gallery",
    label,
    data: {
      heading,
      items: [],
    },
  };
}

function poll(
  question = "What do you think?",
  allowMultiple = false,
  label = "Poll",
): MicrositeBlock {
  return {
    id: id("poll"),
    type: "poll",
    label,
    data: {
      question,
      allowMultiple,
      options: [
        { id: id("poll_option"), text: "" },
        { id: id("poll_option"), text: "" },
      ],
    },
  };
}

function rsvp(
  heading = "RSVP",
  notesPlaceholder = "Add a note",
  label = "RSVP",
): MicrositeBlock {
  return {
    id: id("rsvp"),
    type: "rsvp",
    label,
    data: {
      heading,
      eventDate: "",
      collectGuestCount: true,
      collectMealChoice: false,
      notesPlaceholder,
    },
  };
}

function richText(
  heading = "Details",
  body = "",
  label = "Rich Text",
): MicrositeBlock {
  return {
    id: id("richText"),
    type: "richText",
    label,
    data: {
      heading,
      body,
    },
  };
}

function faq(heading = "FAQ", label = "FAQ"): MicrositeBlock {
  return {
    id: id("faq"),
    type: "faq",
    label,
    data: {
      heading,
      items: [
        { id: id("faq_item"), question: "", answer: "" },
        { id: id("faq_item"), question: "", answer: "" },
      ],
    },
  };
}

function countdown(
  heading = "Countdown",
  completedMessage = "The event has started.",
  label = "Countdown",
): MicrositeBlock {
  return {
    id: id("countdown"),
    type: "countdown",
    label,
    data: {
      heading,
      targetIso: "",
      completedMessage,
    },
  };
}

function cta(
  heading = "Take Action",
  body = "",
  buttonText = "Learn More",
  buttonUrl = "#",
  label = "Call To Action",
): MicrositeBlock {
  return {
    id: id("cta"),
    type: "cta",
    label,
    data: {
      heading,
      body,
      buttonText,
      buttonUrl,
    },
  };
}

export const LAYOUT_PRESETS: Record<string, LayoutPreset> = {
  default: {
    key: "default",
    blocks: [announcement(), richText(), links(), contact()],
  },

  event: {
    key: "event",
    blocks: [announcement(), countdown(), richText(), rsvp(), gallery(), links()],
  },

  gallery: {
    key: "gallery",
    blocks: [announcement(), gallery(), richText(), links()],
  },

  business: {
    key: "business",
    blocks: [announcement(), richText(), cta(), links(), contact()],
  },

  property: {
    key: "property",
    blocks: [announcement(), gallery(), richText(), contact()],
  },

  dealroom: {
    key: "dealroom",
    blocks: [announcement(), richText(), faq(), contact()],
  },
};

export const TEMPLATE_LAYOUT_MAP: Record<string, keyof typeof LAYOUT_PRESETS> = {
  wedding_rsvp: "event",
  birthday_party: "event",
  baby_shower: "event",
  family_reunion: "event",
  graduation: "event",
  engagement_announcement: "event",
  church_event: "event",
  corporate_event: "event",
  school_event: "event",
  live_stream_event: "event",
  holiday_party_invite: "event",
  friendsgiving_event: "event",
  housewarming_party: "event",
  bachelor_party: "event",
  bachelorette_party: "event",
  charity_gala_event: "event",
  block_party: "event",
  surprise_party: "event",
  retirement_party: "event",
  bridal_shower: "event",
  music_recital_invite: "event",
  cultural_festival_invite: "event",

  memorial_tribute: "gallery",
  celebration_of_life: "gallery",
  photo_gallery: "gallery",
  memory_timeline: "gallery",
  creator_portfolio: "gallery",
  freelancer_portfolio: "gallery",
  designer_portfolio: "gallery",
  developer_portfolio: "gallery",
  contractor_portfolio: "gallery",
  exploration_guide: "gallery",
  group_trip: "gallery",
  airbnb_vacation_rental: "gallery",
  new_development_preview: "gallery",
  weight_loss_journey: "gallery",

  product_launch: "business",
  waitlist: "business",
  beta_testing: "business",
  investor_pitch: "business",
  business_card: "business",
  commercial_leasing: "business",
  conference: "business",
  consultant_service: "business",
  guided_tutorial: "business",
  newsletter_signup: "business",
  public_feedback: "business",
  service_ad: "business",
  service_promo: "business",
  software_trial: "business",
  stock_trade_thesis: "business",
  vip_access: "business",
  webinar: "business",
  workshop: "business",
  focus_group: "business",
  local_classified_ad: "business",
  temporary_project: "business",
  marketing_campaign_landing: "business",
  affiliate_campaign: "business",
  referral_program: "business",
  job_candidate_showcase: "business",
  speaker_profile: "business",
  community_announcement: "business",
  community_alert: "business",
  hoa_announcement: "business",
  settlement_info: "business",

  deal_room: "dealroom",
  secure_document: "dealroom",

  property_listing: "property",
  rental_listing: "property",
  land_sale_listing: "property",
  estate_sale_listing: "property",
  landlord_property: "property",
  for_sale_by_owner: "property",
  property_auction: "property",
  open_house: "property",
};

export function getLayoutPreset(templateKey: string): LayoutPreset {
  const layoutKey = TEMPLATE_LAYOUT_MAP[templateKey] ?? "default";
  return LAYOUT_PRESETS[layoutKey];
}