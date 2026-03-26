import type { BuilderDraft } from "@/lib/templates/builder";

type DraftWithPageExtras = BuilderDraft & {
  pageBackgroundImage?: string;
  pageBackgroundImageFit?: "clip" | "zoom" | "stretch";
};

const weddingClassicDraft: DraftWithPageExtras = {
  title: "Lucy & Ricky",
  subtitle: "ARE GETTING MARRIED",
  subtext: "November 30, 1940",
  description: "Kindly RSVP",
  countdownLabel: "We can't wait to celebrate with you!",

  titleStyle: {
    fontFamily: "Great Vibes",
    fontSize: 200,
    align: "center",
    bold: false,
    color: "#646462",
  },

  subtitleStyle: {
    fontFamily: "Cormorant Garamond",
    fontSize: 60,
    align: "center",
    color: "#374151",
  },

  subtextStyle: {
    fontFamily: "Cormorant Garamond",
    fontSize: 106,
    italic: true,
    bold: true,
    align: "center",
    color: "#374151",
  },

  descriptionStyle: {
    fontFamily: "Great Vibes",
    fontSize: 110,
    align: "center",
    color: "#646462",
  },

  countdownLabelStyle: {
    fontFamily: "Great Vibes",
    fontSize: 94,
    align: "center",
    color: "#000000",
  },

  slugSuggestion: "",
  pageBackground: "#ffffff",
  pageBackgroundImage: "/designs/backgrounds/design_wedding-classic.png",
  pageBackgroundImageFit: "zoom",
  pageScale: 85,

  pageVisibility: {
    title: true,
    subtitle: true,
    subtext: true,
    description: true,
  },

  pageElements: {
    title: {
      colStart: 1,
      rowStart: 3,
      colSpan: 12,
      rowSpan: 2,
      zIndex: 10,
    },
    subtitle: {
      colStart: 1,
      rowStart: 5,
      colSpan: 12,
      rowSpan: 1,
      zIndex: 11,
    },
    subtext: {
      colStart: 1,
      rowStart: 6,
      colSpan: 12,
      rowSpan: 1,
      zIndex: 12,
    },
    description: {
      colStart: 1,
      rowStart: 7,
      colSpan: 12,
      rowSpan: 1,
      zIndex: 13,
    },
  },

  blocks: [
    // your blocks here
  ],
};

export default weddingClassicDraft;