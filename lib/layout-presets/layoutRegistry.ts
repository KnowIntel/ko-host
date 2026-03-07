import type { MicrositeBlock } from "@/lib/templates/builder";
import type { DesignPresetKey } from "@/lib/design-presets/designRegistry";

export type LayoutTemplateKey = string;

export type LayoutPreset = {
  template: LayoutTemplateKey;
  design: DesignPresetKey;
  blocks: MicrositeBlock[];
};

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

function announcement(
  headline: string,
  body: string,
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
  heading: string,
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

function contact(heading: string, label = "Contact"): MicrositeBlock {
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

function gallery(heading: string, label = "Gallery"): MicrositeBlock {
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
  question: string,
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
  heading: string,
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
  heading: string,
  body: string,
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

function faq(heading: string, label = "FAQ"): MicrositeBlock {
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
  heading: string,
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
  heading: string,
  body: string,
  buttonText: string,
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

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    template: "wedding_rsvp",
    design: "elegant",
    blocks: [
      announcement(
        "We're Getting Married",
        "We’d love for you to celebrate this special day with us.",
      ),
      richText(
        "Our Story",
        "Share your story, ceremony notes, attire guidance, or a warm welcome for guests.",
      ),
      links("Important Links"),
      contact("Questions? Contact Us"),
    ],
  },

  {
    template: "wedding_rsvp",
    design: "minimal",
    blocks: [
      announcement("Wedding Celebration", "Join us for our special day."),
      richText(
        "Event Details",
        "Share the date, location, attire, and any short welcome message here.",
      ),
      rsvp("RSVP", "Let us know if you can make it"),
      contact("Contact"),
    ],
  },

  {
    template: "church_event",
    design: "event",
    blocks: [
      announcement(
        "Church Event",
        "Join us for worship, fellowship, and community.",
      ),
      countdown("Event Starts In", "The event is happening now."),
      richText(
        "Event Details",
        "Add the time, location, speaker details, and what guests should expect.",
      ),
      links("Important Links"),
      rsvp("Let Us Know You're Coming", "Share any notes or questions"),
      contact("Church Contact"),
    ],
  },

  {
    template: "church_event",
    design: "community",
    blocks: [
      announcement(
        "Community Gathering",
        "Come together for connection, encouragement, and updates.",
      ),
      richText(
        "What to Expect",
        "Use this section for announcements, community details, and next steps.",
      ),
      links("Helpful Links"),
      poll("Will you be attending?", false),
      contact("Get in Touch"),
    ],
  },

  {
    template: "photo_gallery",
    design: "gallery",
    blocks: [
      announcement(
        "Photo Gallery",
        "A shared place for your favorite memories and highlights.",
      ),
      gallery("Featured Photos"),
      richText(
        "About This Collection",
        "Add a short introduction or context for the gallery.",
      ),
      links("Related Links"),
    ],
  },

  {
    template: "product_launch",
    design: "startup",
    blocks: [
      announcement(
        "Introducing Something New",
        "A focused launch page built to turn attention into action.",
      ),
      gallery("Product Preview"),
      richText(
        "Why It Matters",
        "Describe the value, audience, and core benefits of the product.",
      ),
      cta(
        "Be First to Know",
        "Join the list and get updates when the product goes live.",
        "Join Waitlist",
      ),
      faq("Launch Questions"),
      links("Launch Links"),
    ],
  },

  {
    template: "product_launch_waitlist",
    design: "startup",
    blocks: [
      announcement(
        "Join the Waitlist",
        "Get early access and launch updates.",
      ),
      gallery("Product Preview"),
      richText(
        "What You’ll Get",
        "Explain the offer, launch timing, and why people should sign up now.",
      ),
      cta(
        "Reserve Your Spot",
        "Secure your place before the public launch.",
        "Join Waitlist",
      ),
      faq("Common Questions"),
    ],
  },

  {
    template: "product_launch",
    design: "product",
    blocks: [
      announcement(
        "Product Showcase",
        "Highlight the product with a stronger visual-first presentation.",
      ),
      gallery("Product Highlights"),
      richText(
        "What Makes It Different",
        "Use this area for features, differentiation, and outcomes.",
      ),
      cta(
        "Take Action",
        "Drive visitors to your launch link, checkout, or signup.",
        "Learn More",
      ),
      faq("Product Questions"),
    ],
  },

  {
    template: "property_listing",
    design: "minimal",
    blocks: [
      announcement(
        "Property Listing",
        "A clean property page with key details and contact information.",
      ),
      gallery("Property Photos"),
      richText(
        "Overview",
        "Add property highlights, neighborhood context, and key selling points.",
      ),
      links("Property Details"),
      contact("Contact Agent"),
    ],
  },

  {
    template: "property_listing_rental",
    design: "minimal",
    blocks: [
      announcement(
        "Rental Listing",
        "See availability, property details, and next steps.",
      ),
      gallery("Rental Photos"),
      links("Rental Details"),
      richText(
        "Requirements",
        "Use this area for lease terms, income requirements, deposits, and policies.",
      ),
      contact("Contact About This Rental"),
    ],
  },

  {
    template: "resume_profile",
    design: "portfolio",
    blocks: [
      announcement(
        "Professional Profile",
        "A polished, shareable page for your work and experience.",
      ),
      richText(
        "About Me",
        "Add your summary, strengths, and career direction here.",
      ),
      gallery("Featured Work"),
      links("Portfolio Links"),
      contact("Contact"),
    ],
  },

  {
    template: "creator_portfolio",
    design: "portfolio",
    blocks: [
      announcement(
        "Creator Portfolio",
        "Showcase your work, links, and creative identity.",
      ),
      gallery("Featured Content"),
      richText(
        "About This Work",
        "Introduce your style, focus, or current projects.",
      ),
      links("Creator Links"),
      cta(
        "Work With Me",
        "Invite viewers to connect, book, or collaborate.",
        "Get In Touch",
      ),
    ],
  },

  {
    template: "designer_portfolio",
    design: "portfolio",
    blocks: [
      announcement(
        "Design Portfolio",
        "A clean place to present selected projects and design work.",
      ),
      gallery("Selected Projects"),
      richText(
        "Approach",
        "Describe your process, specialties, or creative point of view.",
      ),
      links("Project Links"),
      contact("Contact"),
    ],
  },

  {
    template: "developer_portfolio",
    design: "portfolio",
    blocks: [
      announcement(
        "Developer Portfolio",
        "Projects, links, and contact in one technical showcase.",
      ),
      richText("About", "Share your stack, specialties, and current focus."),
      links("Project Links"),
      faq("Technical FAQ"),
      contact("Contact"),
    ],
  },

  {
    template: "school_fundraiser",
    design: "fundraiser",
    blocks: [
      announcement(
        "Support Our Fundraiser",
        "Help us reach our goal and share the mission with others.",
      ),
      richText(
        "Why This Matters",
        "Explain the goal, impact, and who benefits from the fundraiser.",
      ),
      cta(
        "Support the Cause",
        "Direct visitors to donate, sign up, or share the effort.",
        "Donate Now",
      ),
      faq("Fundraiser FAQ"),
      contact("Organizer Contact"),
    ],
  },

  {
    template: "disaster_relief",
    design: "fundraiser",
    blocks: [
      announcement(
        "Disaster Relief Support",
        "Updates, resources, and ways to help in one place.",
      ),
      richText(
        "Current Needs",
        "Share the situation, priority needs, and where support is most needed.",
      ),
      links("Relief Resources"),
      cta(
        "Take Action",
        "Help by donating, volunteering, or sharing this page.",
        "Support Relief",
      ),
      contact("Relief Contact"),
    ],
  },

  {
    template: "community_announcement",
    design: "community",
    blocks: [
      announcement(
        "Community Announcement",
        "Share important updates clearly with your group.",
      ),
      richText(
        "Update Details",
        "Add the main message, timing, and any context people need to know.",
      ),
      links("Helpful Links"),
      contact("Community Contact"),
    ],
  },

  {
    template: "community_poll",
    design: "community",
    blocks: [
      announcement(
        "Community Poll",
        "Collect quick feedback and keep everyone informed.",
      ),
      poll("What do you think?", false),
      richText(
        "Why We’re Asking",
        "Explain the context of the poll and what happens next.",
      ),
      links("Related Info"),
    ],
  },

  {
    template: "public_feedback",
    design: "community",
    blocks: [
      announcement(
        "Public Feedback",
        "Collect thoughts, suggestions, and community input.",
      ),
      richText(
        "Feedback Topic",
        "Explain the topic and the type of feedback you want.",
      ),
      links("Background Information"),
      contact("Response Contact"),
    ],
  },

  {
    template: "deal_room",
    design: "product",
    blocks: [
      announcement(
        "Deal Room",
        "A focused page for due diligence, materials, and next steps.",
      ),
      gallery("Key Materials"),
      richText(
        "Overview",
        "Summarize the opportunity, timeline, and process.",
      ),
      links("Documents & Links"),
      faq("Common Questions"),
      contact("Deal Contact"),
    ],
  },

  {
    template: "investor_pitch",
    design: "startup",
    blocks: [
      announcement(
        "Investor Pitch",
        "Present the opportunity clearly and drive the next conversation.",
      ),
      gallery("Pitch Highlights"),
      richText(
        "Opportunity",
        "Summarize the problem, market, solution, and traction.",
      ),
      links("Pitch Materials"),
      cta(
        "Schedule a Conversation",
        "Invite investors to review more and connect directly.",
        "Contact Us",
      ),
      faq("Investor FAQ"),
    ],
  },

  {
    template: "photo_gallery",
    design: "blank",
    blocks: [
      announcement(
        "Photo Gallery",
        "Start with a simple structure and customize from here.",
      ),
    ],
  },
];