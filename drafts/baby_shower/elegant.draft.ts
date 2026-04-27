import type { BuilderDraft } from "@/lib/templates/builder";

type DraftWithPageExtras = BuilderDraft & {
  pageBackgroundImage?: string;
  pageBackgroundImageFit?: "clip" | "zoom" | "stretch";
};

const babyShowerElegantHomeDraft = {
  slugSuggestion: "baby_shower",
  title: "",
  subtitle: "",
  subtext: "",
  description:
    "A soft, elegant invitation page for a meaningful gathering with family and close friends.",

  titleStyle: {
    fontFamily: "Playfair Display",
    fontSize: 33,
    bold: true,
    italic: false,
    underline: false,
    strike: false,
    align: "center",
    color: "#111827",
  },

  pageBackground: "",
  pageColor: "#feece6",

  blocks: [
    {
      id: "image_kx9gxhca",
      type: "image",
      label: "Image",
      grid: {
        colStart: 1,
        rowStart: 1.5,
        colSpan: 12,
        rowSpan: 10,
        zIndex: 0,
      },
      appearance: {
        backgroundColor: "transparent",
        borderColor: "#D1D5DB",
        borderWidth: 0,
        borderRadius: 16,
      },
      data: {
        image: {
          id: "img_q2mf2hx1",
          url: "https://koxykctwdpvmfwyzxgxt.supabase.co/storage/v1/object/public/uploads/1777222788970-gntxo4y95ts.webp",
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
            size: 6,
          },
        },
      },
    },
    {
      id: "label_5n4s4sig",
      type: "label",
      label: "Label",
      grid: {
        colStart: 1,
        rowStart: 1.5,
        colSpan: 12,
        rowSpan: 1.25,
        zIndex: 4,
      },
      appearance: {
        backgroundColor: "transparent",
        borderColor: "#D1D5DB",
        borderWidth: 0,
        borderRadius: 16,
      },
      data: {
        text: "B  R  E  N  D  A ' S    H  A  V  I  N  G    A",
        style: {
          fontFamily: "Inter",
          fontSize: 85,
          bold: true,
          italic: false,
          underline: false,
          strike: false,
          align: "center",
          color: "#a9a4a0",
        },
      },
    },
    {
      id: "label_9twfoof8",
      type: "label",
      label: "Label",
      grid: {
        colStart: 1,
        rowStart: 6.25,
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
        text: "Please join us in welcoming a beautiful baby boy:",
        style: {
          fontFamily: "Bodoni Moda",
          fontSize: 60,
          bold: false,
          italic: false,
          underline: false,
          strike: false,
          align: "center",
          color: "#80807e",
        },
      },
    },
    {
      id: "label_l0s7r1",
      type: "label",
      label: "Label",
      grid: {
        colStart: 1,
        rowStart: 7,
        colSpan: 12,
        rowSpan: 2,
        zIndex: 6,
      },
      appearance: {
        backgroundColor: "transparent",
        borderColor: "#D1D5DB",
        borderWidth: 0,
        borderRadius: 16,
      },
      data: {
        text: "Tavonn Hodges",
        style: {
          fontFamily: "Great Vibes",
          fontSize: 170,
          bold: false,
          italic: false,
          underline: false,
          strike: false,
          align: "center",
          color: "#8f8b85",
        },
      },
    },
    {
      id: "label_qgrc80",
      type: "label",
      label: "Label",
      grid: {
        colStart: 1,
        rowStart: 9,
        colSpan: 12,
        rowSpan: 2.25,
        zIndex: 6,
      },
      appearance: {
        backgroundColor: "transparent",
        borderColor: "#D1D5DB",
        borderWidth: 0,
        borderRadius: 16,
      },
      data: {
        text: `Saturday, June 1, 1991 from 2:00 PM – 5:00 PM
California Love Community Garden Pavilion
1996 West Coast Drive Oakland, CA 94612
Hosted By Sharon & Keisha`,
        style: {
          fontFamily: "Playfair Display",
          fontSize: 40,
          bold: false,
          italic: false,
          underline: false,
          strike: false,
          align: "center",
          color: "#80807e",
        },
      },
    },
  ],

  pageVisibility: {
    title: false,
    subtitle: false,
    subtext: false,
    description: false,
  },

  pageElements: {
    title: {
      colStart: 2.5,
      rowStart: 1,
      colSpan: 8.75,
      rowSpan: 1,
      zIndex: 7,
    },
    subtitle: {
      colStart: 2,
      rowStart: 3,
      colSpan: 7,
      rowSpan: 1,
      zIndex: 2,
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
} satisfies DraftWithPageExtras;

export const babyShowerElegantPages = [
  {
    id: "home",
    slug: "home",
    title: "Home",
    display_order: 0,
    draft: babyShowerElegantHomeDraft,
  },
];

export default {
  ...babyShowerElegantHomeDraft,
  pages: babyShowerElegantPages,
};