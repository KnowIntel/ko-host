// drafts/birthday/playful.draft.ts

import type { BuilderDraft } from "@/lib/templates/builder";

type DraftPage = {
  id: string;
  slug: string;
  title: string;
  display_order: number;
  draft: BuilderDraft;
};

const playfulHomeDraft: BuilderDraft = {
  slugSuggestion: "birthday",
  title: "Sandy Eggo's\n21st Birthday Bash!",
  subtitle: "Must be 21... Sandy finally is!",
  subtext: "",
  description: "",

  titleStyle: {
    fontFamily: "Playball",
    fontSize: 100,
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    align: "center",
    color: "#111827",
  },

  subtitleStyle: {
    fontFamily: "Allura",
    fontSize: 52,
    bold: false,
    italic: true,
    underline: false,
    strike: false,
    align: "center",
    color: "#be3513",
  },

  pageBackground: "",

  blocks: [
    {
      id: "image_16iyrvyg",
      type: "image",
      label: "Image",
      grid: {
        colStart: 1,
        rowStart: 1,
        colSpan: 12,
        rowSpan: 11.25,
        zIndex: 2,
      },
      appearance: {
        backgroundColor: "transparent",
        borderColor: "#D1D5DB",
        borderWidth: 0,
        borderRadius: 16,
      },
      data: {
        image: {
          id: "img_mw3w2cl5",
          url: "https://koxykctwdpvmfwyzxgxt.supabase.co/storage/v1/object/public/uploads/1777170265694-0bro6e3ngzru.webp",
          fitMode: "zoom",
          frame: "square",
          positionX: 50,
          positionY: 50,
          zoom: 1,
          rotation: 0,
          opacity: 1,
          fade: {
            top: false,
            bottom: true,
            left: false,
            right: false,
            size: 9,
          },
        },
      },
    },
    {
      id: "label_n4irilw3",
      type: "label",
      label: "Label",
      grid: {
        colStart: 1,
        rowStart: 3.25,
        colSpan: 12,
        rowSpan: 1.25,
        zIndex: 5,
      },
      appearance: {
        backgroundColor: "transparent",
        borderColor: "#D1D5DB",
        borderWidth: 0,
        borderRadius: 16,
      },
      data: {
        text: "You're invited to",
        style: {
          fontFamily: "Playball",
          fontSize: 100,
          bold: false,
          italic: false,
          underline: false,
          strike: false,
          align: "center",
          color: "#ce674d",
        },
      },
    },
    {
      id: "label_dk40aicc",
      type: "label",
      label: "Label",
      grid: {
        colStart: 1,
        rowStart: 7.25,
        colSpan: 12,
        rowSpan: 1.75,
        zIndex: 6,
      },
      appearance: {
        backgroundColor: "transparent",
        borderColor: "#D1D5DB",
        borderWidth: 0,
        borderRadius: 16,
      },
      data: {
        text:
          "Saturday, July 21st at 7:21pm\n" +
          "The Salty Seagull Rooftop Bar\n" +
          "2101 Pacific Breeze Blvd.\n" +
          "San Diego, CA 92121",
        style: {
          fontFamily: "inherit",
          fontSize: 28,
          bold: true,
          italic: false,
          underline: false,
          strike: false,
          align: "center",
          color: "#111827",
        },
      },
    },
    {
      id: "label_td8f1rz2",
      type: "label",
      label: "Label",
      grid: {
        colStart: 1,
        rowStart: 12,
        colSpan: 12,
        rowSpan: 1,
        zIndex: 7,
      },
      appearance: {
        backgroundColor: "transparent",
        borderColor: "#D1D5DB",
        borderWidth: 0,
        borderRadius: 16,
      },
      data: {
        text: "Contact: Randy (Sandy's brother) at (858) 555-DRNK",
        style: {
          fontFamily: "inherit",
          fontSize: 28,
          bold: true,
          italic: false,
          underline: false,
          strike: false,
          align: "center",
          color: "#111827",
        },
      },
    },
  ],

  pageElements: {
    title: {
      colStart: 1,
      rowStart: 4,
      colSpan: 12,
      rowSpan: 2.5,
      zIndex: 3,
    },
    subtitle: {
      colStart: 1,
      rowStart: 6.25,
      colSpan: 12,
      rowSpan: 1,
      zIndex: 4,
    },
    subtext: {
      colStart: 2,
      rowStart: 4,
      colSpan: 6,
      rowSpan: 1,
      zIndex: 3,
    },
    description: {
      colStart: 2,
      rowStart: 5,
      colSpan: 8,
      rowSpan: 2,
      zIndex: 4,
    },
  },

  pageVisibility: {
    title: true,
    subtitle: true,
  },
};

const playfulPages: DraftPage[] = [
  {
    id: "home",
    slug: "home",
    title: "Home",
    display_order: 0,
    draft: playfulHomeDraft,
  },
];

const playfulDraft: BuilderDraft & { pages: DraftPage[] } = {
  ...playfulHomeDraft,
  pages: playfulPages,
};

export default playfulDraft;