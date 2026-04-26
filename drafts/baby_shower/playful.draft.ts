import type { BuilderDraft } from "@/lib/templates/builder";

type DraftWithPageExtras = BuilderDraft & {
  pageBackgroundImage?: string;
  pageBackgroundImageFit?: "clip" | "zoom" | "stretch";
  pageBlockAppearance?: Record<string, unknown>;
  pageLength?: string;
};

type DraftPage = DraftWithPageExtras & {
  id: string;
  slug: string;
  title: string;
  display_order: number;
};

type DraftWithPages = DraftWithPageExtras & {
  pages: DraftPage[];
};

const babyShowerPlayfulHomePage: DraftPage = {
  id: "home",
  slug: "home",
  title: "Home",
  display_order: 0,
  slugSuggestion: "baby_shower",
  subtitle: "Baby Harper",
  subtext: "",
  description:
    "A soft, elegant invitation page for a meaningful gathering with family and close friends.",
  pageBackground: "",
  pageColor: "#feece6",
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
  blocks: [
    {
      id: "image_kx9gxhca",
      type: "image",
      label: "Image",
      grid: { colStart: 1, rowStart: 1.5, colSpan: 12, rowSpan: 10, zIndex: 0 },
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
          fade: { top: false, bottom: true, left: false, right: false, size: 6 },
        },
      },
    },
    {
      id: "label_5n4s4sig",
      type: "label",
      label: "Label",
      grid: { colStart: 1, rowStart: 1.5, colSpan: 12, rowSpan: 1.25, zIndex: 4 },
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
      grid: { colStart: 1, rowStart: 6.25, colSpan: 12, rowSpan: 1.25, zIndex: 5 },
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
      grid: { colStart: 1, rowStart: 7, colSpan: 12, rowSpan: 2, zIndex: 6 },
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
      grid: { colStart: 1, rowStart: 9, colSpan: 12, rowSpan: 2.25, zIndex: 6 },
      appearance: {
        backgroundColor: "transparent",
        borderColor: "#D1D5DB",
        borderWidth: 0,
        borderRadius: 16,
      },
      data: {
        text:
          "Saturday, June 1, 1991 from 2:00 PM – 5:00 PM\nCalifornia Love Community Garden Pavilion\n1996 West Coast Drive Oakland, CA 94612\nHosted By Sharon & Keisha",
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
    title: { colStart: 2.5, rowStart: 1, colSpan: 8.75, rowSpan: 1, zIndex: 7 },
    subtitle: { colStart: 2, rowStart: 3, colSpan: 7, rowSpan: 1, zIndex: 2 },
    subtext: { colStart: 2, rowStart: 4, colSpan: 6, rowSpan: 1, zIndex: 3 },
    description: { colStart: 2, rowStart: 5, colSpan: 8, rowSpan: 2, zIndex: 4 },
  },
};

const babyShowerPlayfulRsvpAcceptPage: DraftPage = {
  id: "page-rsvp-accept",
  slug: "rsvp-accept",
  title: "RSVP Accept",
  display_order: 1,
  slugSuggestion: "baby_shower",
  subtitle: "Astird",
  subtext: "",
  description: "",
  pageBackground: "",
  blocks: [
    {
      id: "image_ok0mb5ut",
      type: "image",
      label: "Image",
      grid: { colStart: 1, rowStart: 1, colSpan: 12, rowSpan: 14, zIndex: 2 },
      appearance: {
        backgroundColor: "transparent",
        borderColor: "#D1D5DB",
        borderWidth: 0,
        borderRadius: 16,
      },
      data: {
        image: {
          id: "img_iirwjlpy",
          url: "/designs/backgrounds/design_baby_shower_playful_scenery.png",
          fitMode: "zoom",
          frame: "square",
          positionX: 50,
          positionY: 50,
          zoom: 1,
          rotation: 0,
          opacity: 1,
          fade: { top: false, bottom: true, left: false, right: false, size: 2 },
          alt: "design_baby_shower_playful_scenery.png",
        },
      },
    },
    {
      id: "rsvp_qz5jv4l7",
      type: "rsvp",
      label: "RSVP",
      grid: { colStart: 1, rowStart: 2.25, colSpan: 12, rowSpan: 7.25, zIndex: 3 },
      appearance: {
        backgroundColor: "transparent",
        borderColor: "#D1D5DB",
        borderWidth: 0,
        borderRadius: 16,
      },
      data: {
        heading: "Baby Shower Invitation RSVP Form",
        imageUrl: "",
        imageFrameShape: "circle",
        elementOrder: [
          "image",
          "heading",
          "nameLabel",
          "firstName",
          "lastName",
          "email",
          "address",
          "attending",
          "meal",
          "guestToggle",
          "guestCount",
          "guestName",
          "comments",
        ],
        hiddenElements: [],
        guestMin: 0,
        guestMax: 1,
        attendingLabel: "Are you attending?",
        attendingOptions: ["Yes", "No"],
        attendingDisplay: true,
        attendingDefaultValue: "Yes",
        mealLabel: "Your meal selection:",
        mealOptions: ["Chicken", "Salmon"],
        mealDisplay: false,
        mealDefaultValue: "Chicken",
        guestLabel: "Are you bringing a guest?",
        guestOptions: ["Yes", "No"],
        guestDisplay: false,
        guestDefaultValue: "No",
        commentsLabel: "Additional comments",
        commentsPlaceholder: "Additional comments",
        commentsDisplay: true,
        commentsDefaultValue: "",
        submitButtonText: "Submit RSVP",
        elementStyles: {
          heading: {
            textStyle: {
              fontFamily: "Pacifico",
              color: "#000000",
              align: "center",
              fontSize: 49,
            },
          },
        },
        style: {
          fontFamily: "inherit",
          fontSize: 16,
          bold: false,
          italic: false,
          underline: false,
          strike: false,
          align: "left",
          color: "#111827",
        },
      },
    },
  ],
  pageElements: {
    title: { colStart: 1, rowStart: 4.25, colSpan: 12, rowSpan: 2.5, zIndex: 3 },
    subtitle: { colStart: 1, rowStart: 6, colSpan: 12, rowSpan: 2.25, zIndex: 6 },
    subtext: { colStart: 2, rowStart: 4, colSpan: 6, rowSpan: 1, zIndex: 3 },
    description: { colStart: 2, rowStart: 5, colSpan: 8, rowSpan: 2, zIndex: 4 },
  },
  pageVisibility: {
    title: false,
    subtitle: false,
  },
  titleStyle: {
    fontFamily: "Pacifico",
    fontSize: 160,
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    align: "center",
    color: "#5f8cca",
  },
  subtitleStyle: {
    fontFamily: "Pacifico",
    fontSize: 190,
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    align: "center",
    color: "#fba19f",
  },
};

const babyShowerPlayfulRsvpDeclinePage: DraftPage = {
  id: "page-rsvp-decline",
  slug: "rsvp-decline",
  title: "RSVP Decline",
  display_order: 2,
  slugSuggestion: "baby_shower",
  subtitle: "Astird",
  subtext: "",
  description: "",
  pageBackground: "",
  blocks: [
    {
      id: "image_ok0mb5ut_decline",
      type: "image",
      label: "Image",
      grid: { colStart: 1, rowStart: 1, colSpan: 12, rowSpan: 14, zIndex: 2 },
      appearance: {
        backgroundColor: "transparent",
        borderColor: "#D1D5DB",
        borderWidth: 0,
        borderRadius: 16,
      },
      data: {
        image: {
          id: "img_iirwjlpy_decline",
          url: "/designs/backgrounds/design_baby_shower_dark_scenery.png",
          fitMode: "zoom",
          frame: "square",
          positionX: 50,
          positionY: 50,
          zoom: 1,
          rotation: 0,
          opacity: 1,
          fade: { top: false, bottom: true, left: false, right: false, size: 2 },
          alt: "design_baby_shower_dark_scenery.png",
        },
      },
    },
    {
      id: "rsvp_qz5jv4l7_decline",
      type: "rsvp",
      label: "RSVP",
      grid: { colStart: 1, rowStart: 2.25, colSpan: 12, rowSpan: 7.25, zIndex: 3 },
      appearance: {
        backgroundColor: "transparent",
        borderColor: "#D1D5DB",
        borderWidth: 0,
        borderRadius: 16,
      },
      data: {
        heading: "You're not quitting on me; You're FIRED!",
        imageUrl: "",
        imageFrameShape: "circle",
        elementOrder: [
          "image",
          "heading",
          "nameLabel",
          "firstName",
          "lastName",
          "email",
          "address",
          "attending",
          "meal",
          "guestToggle",
          "guestCount",
          "guestName",
          "comments",
        ],
        hiddenElements: [],
        guestMin: 0,
        guestMax: 1,
        attendingLabel: "Are you sure you're not NOT not not unattending?",
        attendingOptions: ["Yes", "No"],
        attendingDisplay: true,
        attendingDefaultValue: "No",
        mealLabel: "Your meal selection:",
        mealOptions: ["Chicken", "Salmon"],
        mealDisplay: false,
        mealDefaultValue: "Chicken",
        guestLabel: "Are you bringing a guest?",
        guestOptions: ["Yes", "No"],
        guestDisplay: false,
        guestDefaultValue: "No",
        commentsLabel: "Additional comments",
        commentsPlaceholder:
          "I am incredibly honored to be invited to this baby shower.  Unfortunately… I will not be attending.  Not because I don’t care. I care a lot. Probably more than most people. Possibly too much.  But I will absolutely be celebrating from afar and expect pictures of the baby… immediately.",
        commentsDisplay: true,
        commentsDefaultValue: "",
        submitButtonText: "Submit RSVP",
        elementStyles: {
          heading: {
            textStyle: {
              fontFamily: "Permanent Marker",
              color: "#ffffff",
              align: "center",
              fontSize: 43,
            },
          },
          nameLabel: {
            textStyle: {
              color: "#ffffff",
            },
          },
          attending: {
            textStyle: {
              color: "#ffffff",
            },
          },
          comments: {
            textStyle: {
              color: "#ffffff",
            },
          },
        },
        style: {
          fontFamily: "inherit",
          fontSize: 16,
          bold: false,
          italic: false,
          underline: false,
          strike: false,
          align: "left",
          color: "#111827",
        },
      },
    },
  ],
  pageElements: {
    title: { colStart: 1, rowStart: 4.25, colSpan: 12, rowSpan: 2.5, zIndex: 3 },
    subtitle: { colStart: 1, rowStart: 6, colSpan: 12, rowSpan: 2.25, zIndex: 6 },
    subtext: { colStart: 2, rowStart: 4, colSpan: 6, rowSpan: 1, zIndex: 3 },
    description: { colStart: 2, rowStart: 5, colSpan: 8, rowSpan: 2, zIndex: 4 },
  },
  pageVisibility: {
    title: false,
    subtitle: false,
  },
  titleStyle: {
    fontFamily: "Pacifico",
    fontSize: 160,
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    align: "center",
    color: "#5f8cca",
  },
  subtitleStyle: {
    fontFamily: "Pacifico",
    fontSize: 190,
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    align: "center",
    color: "#fba19f",
  },
};

const babyShowerPlayfulDraft: DraftWithPages = {
  ...babyShowerPlayfulHomePage,
  pages: [
    babyShowerPlayfulHomePage,
    babyShowerPlayfulRsvpAcceptPage,
    babyShowerPlayfulRsvpDeclinePage,
  ],
};

export default babyShowerPlayfulDraft;