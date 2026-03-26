import type { BuilderDraft } from "@/lib/templates/builder";

type DraftWithPageExtras = BuilderDraft & {
  pageBackgroundImage?: string;
  pageBackgroundImageFit?: "clip" | "zoom" | "stretch";
};

const weddingModernDraft: DraftWithPageExtras = {
  title: "",
  subtitle: "",
  subtext: "",
  description: "",
  countdownLabel: "",

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
  pageBackgroundImage: "/designs/backgrounds/design_wedding-modern.png",
  pageBackgroundImageFit: "zoom",
  pageScale: 85,

  pageVisibility: {
    title: false,
    subtitle: false,
    subtext: false,
    description: false,
  },

  pageElements: {},

  blocks: [
    {
      id: "modern-links",
      type: "links",
      label: "Navigation Links",
      grid: {
        colStart: 1,
        rowStart: 2,
        colSpan: 10,
        rowSpan: 2,
        zIndex: 6,
      },
      appearance: {
        backgroundColor: "transparent",
        borderColor: "#D1D5DB",
        borderWidth: 0,
        borderRadius: 0,
      },
      data: {
        heading: "",
        items: [
          { id: "modern-link-about", label: "        ABOUT        ", url: "#" },
          {
            id: "modern-link-registry",
            label: "        REGISTRY        ",
            url: "#",
          },
          {
            id: "modern-link-schedule",
            label: "        SCHEDULE        ",
            url: "#",
          },
          {
            id: "modern-link-contact",
            label: "        CONTACT        ",
            url: "#",
          },
        ],
        style: {
          fontFamily: "Playfair Display",
          fontSize: 60,
          bold: false,
          italic: false,
          underline: false,
          align: "center",
          color: "#111827",
        },
      },
    },

    {
      id: "modern-couple-image",
      type: "image",
      label: "Couple Image",
      grid: {
        colStart: 5,
        rowStart: 3,
        colSpan: 4,
        rowSpan: 9,
        zIndex: 1,
      },
      appearance: {
        backgroundColor: "transparent",
        borderColor: "#D1D5DB",
        borderWidth: 0,
        borderRadius: 0,
      },
      data: {
        image: {
          id: "modern-couple-image-src",
          url: "/designs/artifacts/bride_groom1.png",
          alt: "Bride and groom",
          fitMode: "zoom",
          frame: "square",
          positionX: 50,
          positionY: 50,
          zoom: 1,
          rotation: 0,
        },
      },
    },

    {
      id: "modern-rsvp-button",
      type: "cta",
      label: "RSVP Button",
      grid: {
        colStart: 5,
        rowStart: 9,
        colSpan: 3,
        rowSpan: 1,
        zIndex: 5,
      },
      appearance: {
        backgroundColor: "#F1EAE2",
        borderColor: "#000000",
        borderWidth: 2,
        borderRadius: 9999,
      },
      data: {
        heading: "",
        body: "",
        buttonText: "RSVP",
        buttonUrl: "#",
        style: {
          fontFamily: "Inter",
          fontSize: 60,
          bold: true,
          align: "center",
          color: "#000000",
        },
        styleType: "solid",
      },
    },

    {
      id: "modern-tagline-1",
      type: "label",
      label: "Tagline 1",
      grid: {
        colStart: 1,
        rowStart: 11,
        colSpan: 12,
        rowSpan: 2,
        zIndex: 16,
      },
      appearance: {
        backgroundColor: "transparent",
        borderColor: "#D1D5DB",
        borderWidth: 0,
        borderRadius: 0,
      },
      data: {
        text: "JOIN US AS WE BEGIN\nOUR GREATEST ADVENTURE",
        style: {
          fontFamily: "Cormorant Garamond",
          fontSize: 84,
          italic: true,
          align: "center",
          color: "#525536",
        },
      },
    },

    {
      id: "modern-tagline-2",
      type: "label",
      label: "Tagline 2",
      grid: {
        colStart: 1,
        rowStart: 13,
        colSpan: 12,
        rowSpan: 1,
        zIndex: 16,
      },
      appearance: {
        backgroundColor: "transparent",
        borderColor: "#D1D5DB",
        borderWidth: 0,
        borderRadius: 0,
      },
      data: {
        text: "Two hearts, one day, a lifetime to follow",
        style: {
          fontFamily: "Dancing Script",
          fontSize: 54,
          italic: true,
          align: "center",
          color: "#000000",
        },
      },
    },

    {
      id: "modern-background-circle",
      type: "shape",
      label: "Background Circle",
      grid: {
        colStart: 1,
        rowStart: 11,
        colSpan: 12,
        rowSpan: 18,
        zIndex: 3,
      },
      appearance: {
        backgroundColor: "#F1EAE2",
        borderColor: "#9CA3AF",
        borderWidth: 0,
        borderRadius: 9999,
      },
      data: {
        shapeType: "circle",
      },
    },
  ],
};

export default weddingModernDraft;