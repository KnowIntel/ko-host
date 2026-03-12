import type {
  BuilderBlockType,
  GridPlacement,
  TextStyle,
} from "@/lib/templates/builder";
import { normalizeTemplateName } from "@/lib/templates/normalizeTemplateName";
import type { DesignPresetLayout } from "@/lib/templates/designPresets";

export type OverlayTextStyle = TextStyle;

export type OverlayPlacement = GridPlacement;

export type OverlayPageElement = {
  enabled: boolean;
  value: string;
  style?: OverlayTextStyle;
  grid?: OverlayPlacement;
};

export type OverlaySeedBlock = {
  key: string;
  enabled: boolean;
  type: BuilderBlockType;
  grid?: OverlayPlacement;
  data?: Record<string, unknown>;
};

export type OverlayDesignMetadata = {
  pageColor?: string;
  pageBackground?: string;
  page: {
    title: OverlayPageElement;
    subtitle: OverlayPageElement;
    tagline: OverlayPageElement;
    description: OverlayPageElement;
  };
  blocks: OverlaySeedBlock[];
};

export type TemplateOverlayMetadata = {
  template: string;
  showcase: OverlayDesignMetadata;
  festive: OverlayDesignMetadata;
  modern: OverlayDesignMetadata;
  elegant: OverlayDesignMetadata;
  business: OverlayDesignMetadata;
  blank: OverlayDesignMetadata;
};

function pageTitle(
  value: string,
  grid: OverlayPlacement,
  style?: OverlayTextStyle,
  enabled = true,
): OverlayPageElement {
  return { enabled, value, grid, style };
}

function pageSubtitle(
  value: string,
  grid: OverlayPlacement,
  style?: OverlayTextStyle,
  enabled = true,
): OverlayPageElement {
  return { enabled, value, grid, style };
}

function pageTagline(
  value: string,
  grid: OverlayPlacement,
  style?: OverlayTextStyle,
  enabled = false,
): OverlayPageElement {
  return { enabled, value, grid, style };
}

function pageDescription(
  value: string,
  grid: OverlayPlacement,
  style?: OverlayTextStyle,
  enabled = true,
): OverlayPageElement {
  return { enabled, value, grid, style };
}

function seedBlock(
  key: string,
  type: BuilderBlockType,
  grid: OverlayPlacement,
  data?: Record<string, unknown>,
  enabled = true,
): OverlaySeedBlock {
  return { key, type, grid, data, enabled };
}

function buildModernMetadata(params: {
  title: string;
  subtitle?: string;
  description: string;
  ctaLabel: string;
  label1: string;
  label2: string;
  label3: string;
}): OverlayDesignMetadata {
  return {
    pageColor: "#0f1115",
    page: {
      title: pageTitle(
        params.title,
        { colStart: 1, rowStart: 1, colSpan: 12, rowSpan: 2, zIndex: 1 },
        { fontFamily: "Poppins", fontSize: 44, bold: true, align: "left" },
        true,
      ),
      subtitle: pageSubtitle(
        params.subtitle || "",
        { colStart: 1, rowStart: 3, colSpan: 10, rowSpan: 1, zIndex: 2 },
        { fontFamily: "Poppins", fontSize: 22, bold: false, align: "left" },
        Boolean(params.subtitle),
      ),
      tagline: pageTagline(
        "",
        { colStart: 1, rowStart: 4, colSpan: 8, rowSpan: 1, zIndex: 3 },
        { fontFamily: "Poppins", fontSize: 16, align: "left" },
        false,
      ),
      description: pageDescription(
        params.description,
        { colStart: 1, rowStart: 5, colSpan: 8, rowSpan: 2, zIndex: 4 },
        { fontFamily: "Poppins", fontSize: 16, align: "left" },
        true,
      ),
    },
    blocks: [
      seedBlock("cta1", "cta", {
        colStart: 1,
        rowStart: 8,
        colSpan: 4,
        rowSpan: 1,
        zIndex: 10,
      }, {
        heading: "",
        body: "",
        buttonText: params.ctaLabel,
        buttonUrl: "#",
      }),
      seedBlock("label1", "label", {
        colStart: 1,
        rowStart: 10,
        colSpan: 4,
        rowSpan: 1,
        zIndex: 11,
      }, {
        text: params.label1,
        style: { fontFamily: "Poppins", fontSize: 16, bold: true, align: "left" },
      }),
      seedBlock("label2", "label", {
        colStart: 5,
        rowStart: 10,
        colSpan: 4,
        rowSpan: 1,
        zIndex: 12,
      }, {
        text: params.label2,
        style: { fontFamily: "Poppins", fontSize: 16, bold: true, align: "left" },
      }),
      seedBlock("label3", "label", {
        colStart: 9,
        rowStart: 10,
        colSpan: 4,
        rowSpan: 1,
        zIndex: 13,
      }, {
        text: params.label3,
        style: { fontFamily: "Poppins", fontSize: 16, bold: true, align: "left" },
      }),
      seedBlock("links1", "links", {
        colStart: 1,
        rowStart: 12,
        colSpan: 12,
        rowSpan: 2,
        zIndex: 14,
      }, {
        heading: "Quick Links",
        items: [
          { id: "seed_link_1", label: "Overview", url: "#" },
          { id: "seed_link_2", label: "Details", url: "#" },
          { id: "seed_link_3", label: "RSVP / Contact", url: "#" },
        ],
      }),
    ],
  };
}

function buildElegantMetadata(params: {
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  label1: string;
  label2: string;
  label3: string;
  label4: string;
}): OverlayDesignMetadata {
  return {
    pageColor: "#f7f2eb",
    page: {
      title: pageTitle(
        params.title,
        { colStart: 1, rowStart: 1, colSpan: 12, rowSpan: 2, zIndex: 1 },
        {
          fontFamily: "Cormorant Garamond",
          fontSize: 46,
          bold: false,
          italic: false,
          underline: false,
          align: "left",
        },
        true,
      ),
      subtitle: pageSubtitle(
        params.subtitle,
        { colStart: 1, rowStart: 3, colSpan: 10, rowSpan: 1, zIndex: 2 },
        {
          fontFamily: "Great Vibes",
          fontSize: 28,
          bold: false,
          italic: false,
          underline: false,
          align: "left",
        },
        true,
      ),
      tagline: pageTagline(
        "",
        { colStart: 1, rowStart: 4, colSpan: 8, rowSpan: 1, zIndex: 3 },
        { fontFamily: "Cormorant Garamond", fontSize: 16, align: "left" },
        false,
      ),
      description: pageDescription(
        params.description,
        { colStart: 1, rowStart: 5, colSpan: 8, rowSpan: 2, zIndex: 4 },
        {
          fontFamily: "Cormorant Garamond",
          fontSize: 16,
          bold: true,
          align: "left",
        },
        true,
      ),
    },
    blocks: [
      seedBlock("cta1", "cta", {
        colStart: 1,
        rowStart: 8,
        colSpan: 4,
        rowSpan: 1,
        zIndex: 10,
      }, {
        heading: "",
        body: "",
        buttonText: params.ctaLabel,
        buttonUrl: "#",
      }),
      seedBlock("label1", "label", {
        colStart: 1,
        rowStart: 10,
        colSpan: 6,
        rowSpan: 1,
        zIndex: 11,
      }, {
        text: params.label1,
        style: { fontFamily: "Cormorant Garamond", fontSize: 18, align: "left" },
      }),
      seedBlock("label2", "label", {
        colStart: 7,
        rowStart: 10,
        colSpan: 6,
        rowSpan: 1,
        zIndex: 12,
      }, {
        text: params.label2,
        style: { fontFamily: "Cormorant Garamond", fontSize: 18, align: "left" },
      }),
      seedBlock("label3", "label", {
        colStart: 1,
        rowStart: 11,
        colSpan: 6,
        rowSpan: 1,
        zIndex: 13,
      }, {
        text: params.label3,
        style: { fontFamily: "Cormorant Garamond", fontSize: 18, align: "left" },
      }),
      seedBlock("label4", "label", {
        colStart: 7,
        rowStart: 11,
        colSpan: 6,
        rowSpan: 1,
        zIndex: 14,
      }, {
        text: params.label4,
        style: { fontFamily: "Cormorant Garamond", fontSize: 18, align: "left" },
      }),
      seedBlock("links1", "links", {
        colStart: 1,
        rowStart: 13,
        colSpan: 12,
        rowSpan: 2,
        zIndex: 15,
      }, {
        heading: "Helpful Links",
        items: [
          { id: "seed_link_1", label: "Details", url: "#" },
          { id: "seed_link_2", label: "Location", url: "#" },
          { id: "seed_link_3", label: "RSVP / Contact", url: "#" },
        ],
      }),
    ],
  };
}

function buildShowcaseMetadata(params: {
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  linkLabel: string;
}): OverlayDesignMetadata {
  return {
    pageColor: "#ffffff",
    page: {
      title: pageTitle(
        params.title,
        { colStart: 1, rowStart: 1, colSpan: 12, rowSpan: 2, zIndex: 1 },
        { fontFamily: "Inter", fontSize: 40, bold: true, align: "left" },
        true,
      ),
      subtitle: pageSubtitle(
        params.subtitle,
        { colStart: 1, rowStart: 3, colSpan: 10, rowSpan: 1, zIndex: 2 },
        { fontFamily: "Inter", fontSize: 18, align: "left" },
        true,
      ),
      tagline: pageTagline(
        "",
        { colStart: 1, rowStart: 4, colSpan: 8, rowSpan: 1, zIndex: 3 },
        { fontFamily: "Inter", fontSize: 16, align: "left" },
        false,
      ),
      description: pageDescription(
        params.description,
        { colStart: 1, rowStart: 5, colSpan: 8, rowSpan: 2, zIndex: 4 },
        { fontFamily: "Inter", fontSize: 16, align: "left" },
        true,
      ),
    },
    blocks: [
      seedBlock("cta1", "cta", {
        colStart: 1,
        rowStart: 8,
        colSpan: 4,
        rowSpan: 1,
        zIndex: 10,
      }, {
        heading: "",
        body: "",
        buttonText: params.ctaLabel,
        buttonUrl: "#",
      }),
      seedBlock("gallery1", "gallery", {
        colStart: 1,
        rowStart: 10,
        colSpan: 12,
        rowSpan: 4,
        zIndex: 11,
      }, {
        grid: 3,
        images: [],
      }),
      seedBlock("links1", "links", {
        colStart: 1,
        rowStart: 15,
        colSpan: 12,
        rowSpan: 2,
        zIndex: 12,
      }, {
        heading: "Quick Links",
        items: [
          { id: "seed_link_1", label: params.linkLabel, url: "#" },
          { id: "seed_link_2", label: "Details", url: "#" },
        ],
      }),
    ],
  };
}

function buildFestiveMetadata(params: {
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  callout: string;
}): OverlayDesignMetadata {
  return {
    pageColor: "#f8f1ea",
    page: {
      title: pageTitle(
        params.title,
        { colStart: 1, rowStart: 1, colSpan: 12, rowSpan: 2, zIndex: 1 },
        { fontFamily: "Great Vibes", fontSize: 42, align: "center" },
        true,
      ),
      subtitle: pageSubtitle(
        params.subtitle,
        { colStart: 1, rowStart: 3, colSpan: 12, rowSpan: 1, zIndex: 2 },
        { fontFamily: "Cormorant Garamond", fontSize: 24, align: "center" },
        true,
      ),
      tagline: pageTagline(
        params.callout,
        { colStart: 1, rowStart: 4, colSpan: 12, rowSpan: 1, zIndex: 3 },
        { fontFamily: "Inter", fontSize: 14, bold: true, align: "center" },
        true,
      ),
      description: pageDescription(
        params.description,
        { colStart: 3, rowStart: 5, colSpan: 8, rowSpan: 2, zIndex: 4 },
        { fontFamily: "Cormorant Garamond", fontSize: 16, align: "center" },
        true,
      ),
    },
    blocks: [
      seedBlock("cta1", "cta", {
        colStart: 4,
        rowStart: 8,
        colSpan: 5,
        rowSpan: 1,
        zIndex: 10,
      }, {
        heading: "",
        body: "",
        buttonText: params.ctaLabel,
        buttonUrl: "#",
      }),
      seedBlock("countdown1", "countdown", {
        colStart: 4,
        rowStart: 10,
        colSpan: 5,
        rowSpan: 2,
        zIndex: 11,
      }, {
        heading: params.callout,
        targetIso: "",
        completedMessage: "Event started",
      }),
      seedBlock("links1", "links", {
        colStart: 2,
        rowStart: 13,
        colSpan: 8,
        rowSpan: 2,
        zIndex: 12,
      }, {
        heading: "Links",
        items: [
          { id: "seed_link_1", label: "Details", url: "#" },
          { id: "seed_link_2", label: "Directions", url: "#" },
          { id: "seed_link_3", label: "RSVP", url: "#" },
        ],
      }),
    ],
  };
}

function buildBusinessMetadata(params: {
  title: string;
  description: string;
  ctaLabel: string;
  label1: string;
  label2: string;
  label3: string;
  contactLabel: string;
}): OverlayDesignMetadata {
  return {
    pageColor: "#ffffff",
    page: {
      title: pageTitle(
        params.title,
        { colStart: 1, rowStart: 1, colSpan: 12, rowSpan: 2, zIndex: 1 },
        { fontFamily: "DM Sans", fontSize: 38, bold: true, align: "left" },
        true,
      ),
      subtitle: pageSubtitle(
        "",
        { colStart: 1, rowStart: 3, colSpan: 10, rowSpan: 1, zIndex: 2 },
        { fontFamily: "DM Sans", fontSize: 18, align: "left" },
        false,
      ),
      tagline: pageTagline(
        "",
        { colStart: 1, rowStart: 4, colSpan: 8, rowSpan: 1, zIndex: 3 },
        { fontFamily: "DM Sans", fontSize: 14, align: "left" },
        false,
      ),
      description: pageDescription(
        params.description,
        { colStart: 1, rowStart: 5, colSpan: 8, rowSpan: 2, zIndex: 4 },
        { fontFamily: "DM Sans", fontSize: 16, align: "left" },
        true,
      ),
    },
    blocks: [
      seedBlock("cta1", "cta", {
        colStart: 1,
        rowStart: 8,
        colSpan: 4,
        rowSpan: 1,
        zIndex: 10,
      }, {
        heading: "",
        body: "",
        buttonText: params.ctaLabel,
        buttonUrl: "#",
      }),
      seedBlock("label1", "label", {
        colStart: 1,
        rowStart: 10,
        colSpan: 4,
        rowSpan: 1,
        zIndex: 11,
      }, {
        text: params.label1,
        style: { fontFamily: "DM Sans", fontSize: 16, bold: true, align: "left" },
      }),
      seedBlock("label2", "label", {
        colStart: 5,
        rowStart: 10,
        colSpan: 4,
        rowSpan: 1,
        zIndex: 12,
      }, {
        text: params.label2,
        style: { fontFamily: "DM Sans", fontSize: 16, bold: true, align: "left" },
      }),
      seedBlock("label3", "label", {
        colStart: 9,
        rowStart: 10,
        colSpan: 4,
        rowSpan: 1,
        zIndex: 13,
      }, {
        text: params.label3,
        style: { fontFamily: "DM Sans", fontSize: 16, bold: true, align: "left" },
      }),
      seedBlock("links1", "links", {
        colStart: 1,
        rowStart: 12,
        colSpan: 12,
        rowSpan: 2,
        zIndex: 14,
      }, {
        heading: "Business Links",
        items: [
          { id: "seed_link_1", label: params.contactLabel, url: "#" },
          { id: "seed_link_2", label: "Details", url: "#" },
          { id: "seed_link_3", label: "Updates", url: "#" },
        ],
      }),
    ],
  };
}

function buildBlankMetadata(params: {
  title: string;
  subtitle: string;
  description: string;
}): OverlayDesignMetadata {
  return {
    pageColor: "#ffffff",
    page: {
      title: pageTitle(
        params.title,
        { colStart: 1, rowStart: 1, colSpan: 12, rowSpan: 2, zIndex: 1 },
        { fontFamily: "Inter", fontSize: 36, bold: true, align: "left" },
        true,
      ),
      subtitle: pageSubtitle(
        params.subtitle,
        { colStart: 1, rowStart: 3, colSpan: 10, rowSpan: 1, zIndex: 2 },
        { fontFamily: "Inter", fontSize: 18, align: "left" },
        true,
      ),
      tagline: pageTagline(
        "",
        { colStart: 1, rowStart: 4, colSpan: 8, rowSpan: 1, zIndex: 3 },
        { fontFamily: "Inter", fontSize: 14, align: "left" },
        false,
      ),
      description: pageDescription(
        params.description,
        { colStart: 1, rowStart: 5, colSpan: 8, rowSpan: 2, zIndex: 4 },
        { fontFamily: "Inter", fontSize: 16, align: "left" },
        true,
      ),
    },
    blocks: [],
  };
}

export const TEMPLATE_DESIGN_OVERLAY_METADATA: Record<
  string,
  TemplateOverlayMetadata
> = {
  [normalizeTemplateName("Wedding")]: {
    template: "Wedding",
    showcase: buildShowcaseMetadata({
      title: "Emma & Lucas",
      subtitle: "Saturday · September 21 · 4:30 PM",
      description:
        "Celebrate with us as we gather for our wedding ceremony, dinner, and dancing.",
      ctaLabel: "View Invitation",
      linkLabel: "RSVP Now",
    }),
    festive: buildFestiveMetadata({
      title: "We're Getting Married!",
      subtitle: "Emma & Lucas",
      description:
        "Find the schedule, venue, registry, and guest updates for our big day.",
      ctaLabel: "Save My Spot",
      callout: "Wedding Begins In:",
    }),
    modern: buildModernMetadata({
      title: "Emma & Lucas Wedding Details",
      subtitle: "",
      description:
        "See the venue, timeline, registry, and RSVP details in one clean page.",
      ctaLabel: "View Details",
      label1: "Timeline",
      label2: "Venue",
      label3: "RSVP",
    }),
    elegant: buildElegantMetadata({
      title: "A Celebration of Love",
      subtitle: "Emma & Lucas",
      description:
        "A timeless invitation page with the details, venue notes, and guest information for our wedding.",
      ctaLabel: "View Event",
      label1: "Date & Time",
      label2: "Venue",
      label3: "Registry",
      label4: "RSVP",
    }),
    business: buildBusinessMetadata({
      title: "Organize Wedding Details Beautifully",
      description:
        "Keep guest communication, schedule updates, and RSVP information in one polished page.",
      ctaLabel: "Launch Event Page",
      label1: "Guest Updates",
      label2: "Schedule",
      label3: "RSVP Tracking",
      contactLabel: "Contact Hosts",
    }),
    blank: buildBlankMetadata({
      title: "Wedding",
      subtitle: "Start with a blank page",
      description: "Build your own layout from scratch.",
    }),
  },

  [normalizeTemplateName("Open House")]: {
    template: "Open House",
    showcase: buildShowcaseMetadata({
      title: "Open House at 118 Cedar Lane",
      subtitle: "Sunday · 1:00 PM to 4:00 PM",
      description:
        "Tour this bright 4-bedroom home with an updated kitchen, fenced yard, and flexible bonus room.",
      ctaLabel: "View Home",
      linkLabel: "Schedule a Tour",
    }),
    festive: buildFestiveMetadata({
      title: "You're Invited",
      subtitle: "118 Cedar Lane Open House",
      description:
        "See showing details, home features, and directions before you stop by.",
      ctaLabel: "See Details",
      callout: "Open House Starts In:",
    }),
    modern: buildModernMetadata({
      title: "Explore 118 Cedar Lane",
      subtitle: "",
      description:
        "Review photos, property details, and showing information before your visit.",
      ctaLabel: "Explore the Property",
      label1: "Photos",
      label2: "Property Details",
      label3: "Directions",
    }),
    elegant: buildElegantMetadata({
      title: "An Open House Worth Seeing",
      subtitle: "118 Cedar Lane",
      description:
        "A clean, polished home page for buyers who want beautiful details before stepping inside.",
      ctaLabel: "View the Home",
      label1: "Interior",
      label2: "Neighborhood",
      label3: "Schools",
      label4: "Schedule a Tour",
    }),
    business: buildBusinessMetadata({
      title: "Promote Open Houses More Effectively",
      description:
        "Keep showing times, buyer interest, and listing details organized in one professional page.",
      ctaLabel: "Launch Open House Page",
      label1: "Showing Details",
      label2: "Buyer Leads",
      label3: "Property Info",
      contactLabel: "Contact Agent",
    }),
    blank: buildBlankMetadata({
      title: "Open House",
      subtitle: "Start with a blank page",
      description: "Build your own layout from scratch.",
    }),
  },

  [normalizeTemplateName("Product Launch")]: {
    template: "Product Launch",
    showcase: buildShowcaseMetadata({
      title: "Introducing LedgerFlow",
      subtitle: "Smarter cash tracking for small teams",
      description:
        "Automate receipts, categorize expenses, and see where your money is going without spreadsheet chaos.",
      ctaLabel: "See What's New",
      linkLabel: "Join the Waitlist",
    }),
    festive: buildFestiveMetadata({
      title: "Now Launching",
      subtitle: "LedgerFlow 1.0",
      description:
        "Our new platform makes expense tracking faster, cleaner, and easier for growing teams.",
      ctaLabel: "Explore the Launch",
      callout: "Launch Begins In:",
    }),
    modern: buildModernMetadata({
      title: "Meet LedgerFlow",
      subtitle: "",
      description:
        "See key features, pricing, launch updates, and everything customers need before signing up.",
      ctaLabel: "View Features",
      label1: "Automation",
      label2: "Pricing",
      label3: "Launch Updates",
    }),
    elegant: buildElegantMetadata({
      title: "A Better Way to Track Spend",
      subtitle: "LedgerFlow",
      description:
        "A polished product page introducing clean workflows, powerful automation, and a simpler finance stack.",
      ctaLabel: "View Product",
      label1: "Features",
      label2: "Pricing",
      label3: "Who It's For",
      label4: "Get Access",
    }),
    business: buildBusinessMetadata({
      title: "Run a Cleaner Product Launch",
      description:
        "Keep launch messaging, feature highlights, pricing, and signups organized in one launch page.",
      ctaLabel: "Launch Product Page",
      label1: "Feature Rollout",
      label2: "Customer Interest",
      label3: "Pricing",
      contactLabel: "Contact Sales",
    }),
    blank: buildBlankMetadata({
      title: "Product Launch",
      subtitle: "Start with a blank page",
      description: "Build your own layout from scratch.",
    }),
  },

  [normalizeTemplateName("Birthday")]: {
    template: "Birthday",
    showcase: buildShowcaseMetadata({
      title: "Ava Turns 10!",
      subtitle: "Saturday at 2:00 PM",
      description:
        "Join us for cupcakes, games, a backyard movie, and one very excited birthday girl.",
      ctaLabel: "View Party Details",
      linkLabel: "RSVP Now",
    }),
    festive: buildFestiveMetadata({
      title: "You're Invited!",
      subtitle: "Ava's Birthday Party",
      description:
        "We're celebrating with pizza, a bounce house, and plenty of cake—come ready for fun.",
      ctaLabel: "Save My Spot",
      callout: "Party Starts In:",
    }),
    modern: buildModernMetadata({
      title: "Let's Celebrate Ava",
      subtitle: "",
      description:
        "See the party time, address, gift ideas, and RSVP details for Ava's big day.",
      ctaLabel: "See the Invitation",
      label1: "Party Details",
      label2: "What to Bring",
      label3: "RSVP",
    }),
    elegant: buildElegantMetadata({
      title: "A Special Birthday Celebration",
      subtitle: "Ava Turns 10",
      description:
        "A joyful birthday invitation page with everything guests need for an easy, fun afternoon.",
      ctaLabel: "View Celebration",
      label1: "Date & Time",
      label2: "Location",
      label3: "Gift Notes",
      label4: "RSVP",
    }),
    business: buildBusinessMetadata({
      title: "Keep Birthday Plans in One Place",
      description:
        "Share guest updates, directions, and party details in one polished birthday page.",
      ctaLabel: "Launch Party Page",
      label1: "Guest List",
      label2: "Party Schedule",
      label3: "RSVP Tracking",
      contactLabel: "Contact Host",
    }),
    blank: buildBlankMetadata({
      title: "Birthday",
      subtitle: "Start with a blank page",
      description: "Build your own layout from scratch.",
    }),
  },

  [normalizeTemplateName("Custom Template")]: {
    template: "Custom Template",
    showcase: buildShowcaseMetadata({
      title: "Custom Template",
      subtitle: "Invitation & event details",
      description:
        "Join us for custom template with the date, time, location, and RSVP details all in one place.",
      ctaLabel: "View Invitation",
      linkLabel: "RSVP Now",
    }),
    festive: buildFestiveMetadata({
      title: "You're Invited",
      subtitle: "Custom Template",
      description:
        "We put together everything guests need for custom template, including schedule notes, directions, and updates.",
      ctaLabel: "Save My Spot",
      callout: "Event Starts In:",
    }),
    modern: buildModernMetadata({
      title: "Plan for Custom Template",
      subtitle: "",
      description:
        "See the timeline, location, and guest information for custom template in a clean, easy-to-share page.",
      ctaLabel: "View Details",
      label1: "Schedule",
      label2: "Location",
      label3: "RSVP",
    }),
    elegant: buildElegantMetadata({
      title: "Custom Template",
      subtitle: "A special gathering",
      description:
        "A polished invitation page for custom template with meaningful details and a beautiful presentation.",
      ctaLabel: "View Event",
      label1: "Date & Time",
      label2: "Venue",
      label3: "Guest Notes",
      label4: "RSVP",
    }),
    business: buildBusinessMetadata({
      title: "Keep Custom Template Organized",
      description:
        "Share invitations, updates, and guest responses for custom template in one streamlined page.",
      ctaLabel: "Launch Event Page",
      label1: "Guest Updates",
      label2: "Event Details",
      label3: "RSVP Tracking",
      contactLabel: "Contact Host",
    }),
    blank: buildBlankMetadata({
      title: "Custom Template",
      subtitle: "Start with a blank page",
      description: "Build your own layout from scratch.",
    }),
  },
};

export function getTemplateDesignOverlayMetadata(
  templateNameOrKey: string,
  designKey: DesignPresetLayout,
) {
  const entry =
    TEMPLATE_DESIGN_OVERLAY_METADATA[
      normalizeTemplateName(templateNameOrKey)
    ];

  if (!entry) return null;

  return entry[designKey] ?? null;
}