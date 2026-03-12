/* =========================================
   Ko-Host Builder Core Types
   ========================================= */

export type TextAlign = "left" | "center" | "right";

export type TextStyle = {
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: TextAlign;
  color?: string;
};

/* =========================================
   Grid Placement
   ========================================= */

export type GridPlacement = {
  colStart: number;
  rowStart: number;
  colSpan: number;
  rowSpan: number;
  zIndex?: number;
};

export type PageVisibility = {
  title?: boolean;
  subtitle?: boolean;
  subtext?: boolean;
  description?: boolean;
};

export type PageElements = {
  title?: Partial<GridPlacement>;
  subtitle?: Partial<GridPlacement>;
  subtext?: Partial<GridPlacement>;
  description?: Partial<GridPlacement>;
};

/* =========================================
   Block Types
   ========================================= */

export type BuilderBlockType =
  | "label"
  | "image"
  | "links"
  | "cta"
  | "countdown"
  | "padding"
  | "poll"
  | "rsvp"
  | "faq"
  | "gallery"
  | "thread"
  | "showcase"
  | "festiveBackground";

/* =========================================
   Shared Primitive Types
   ========================================= */

export type LinkItem = {
  id: string;
  label: string;
  url: string;
};

export type GalleryImage = {
  id: string;
  url: string;
};

export type ShowcaseImage = {
  id: string;
  url: string;
};

export type PollOption = {
  id: string;
  text: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type ThreadMessage = {
  id: string;
  name: string;
  message: string;
};

/* =========================================
   Base Block
   ========================================= */

export type BaseBlock = {
  id: string;
  label: string;
  grid?: GridPlacement;
};

/* =========================================
   Block Definitions
   ========================================= */

export type LabelBlock = BaseBlock & {
  type: "label";
  data: {
    text: string;
    style?: TextStyle;
  };
};

export type ImageBlock = BaseBlock & {
  type: "image";
  data: {
    image: {
      id: string;
      url: string;
      alt?: string;
    };
  };
};

export type LinksBlock = BaseBlock & {
  type: "links";
  data: {
    heading?: string;
    items: LinkItem[];
  };
};

export type CtaBlock = BaseBlock & {
  type: "cta";
  data: {
    heading?: string;
    body?: string;
    buttonText: string;
    buttonUrl: string;
  };
};

export type CountdownBlock = BaseBlock & {
  type: "countdown";
  data: {
    heading?: string;
    targetIso: string;
    completedMessage: string;
  };
};

export type PaddingBlock = BaseBlock & {
  type: "padding";
  data: {
    height: number;
  };
};

export type PollBlock = BaseBlock & {
  type: "poll";
  data: {
    question: string;
    options: PollOption[];
  };
};

export type RsvpBlock = BaseBlock & {
  type: "rsvp";
  data: {
    heading: string;
    collectName: boolean;
    collectEmail: boolean;
    collectPhone?: boolean;
    collectGuestCount?: boolean;
    collectNotes?: boolean;
  };
};

export type FaqBlock = BaseBlock & {
  type: "faq";
  data: {
    items: FaqItem[];
  };
};

export type GalleryBlock = BaseBlock & {
  type: "gallery";
  data: {
    grid: number;
    images: GalleryImage[];
  };
};

export type MessageThreadBlock = BaseBlock & {
  type: "thread";
  data: {
    messages?: ThreadMessage[];
    subject?: string;
    allowAnonymous?: boolean;
    requireApproval?: boolean;
  };
};

export type ShowcaseBlock = BaseBlock & {
  type: "showcase";
  data: {
    images: ShowcaseImage[];
  };
};

export type FestiveBackgroundBlock = BaseBlock & {
  type: "festiveBackground";
  data: {
    image: {
      id: string;
      url: string;
    };
  };
};

export type MicrositeBlock =
  | LabelBlock
  | ImageBlock
  | LinksBlock
  | CtaBlock
  | CountdownBlock
  | PaddingBlock
  | PollBlock
  | RsvpBlock
  | FaqBlock
  | GalleryBlock
  | MessageThreadBlock
  | ShowcaseBlock
  | FestiveBackgroundBlock;

/* =========================================
   Draft Model
   ========================================= */

export type BuilderDraft = {
  title: string;
  subtitle?: string;
  subtext?: string;
  description?: string;
  countdownLabel?: string;

  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  subtextStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  countdownLabelStyle?: TextStyle;

  slugSuggestion: string;
  pageBackground?: string;

  pageVisibility?: PageVisibility;
  pageElements?: PageElements;

  blocks: MicrositeBlock[];
};

/* =========================================
   Utilities
   ========================================= */

export function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createDefaultTextStyle(): TextStyle {
  return {
    fontFamily: "inherit",
    fontSize: 16,
    bold: false,
    italic: false,
    underline: false,
    align: "left",
    color: "#111827",
  };
}

export function updateTextStyle(
  style: TextStyle | undefined,
  patch: Partial<TextStyle>,
): TextStyle {
  return {
    ...createDefaultTextStyle(),
    ...style,
    ...patch,
  };
}

function createDefaultGrid(): GridPlacement {
  return {
    colStart: 1,
    rowStart: 1,
    colSpan: 12,
    rowSpan: 1,
    zIndex: 1,
  };
}

/* =========================================
   Block Factory
   ========================================= */

export function createBlock(type: BuilderBlockType): MicrositeBlock {
  const grid = createDefaultGrid();

  switch (type) {
    case "label":
      return {
        id: makeId("label"),
        type: "label",
        label: "Label",
        grid,
        data: {
          text: "New Label",
          style: createDefaultTextStyle(),
        },
      };

    case "image":
      return {
        id: makeId("image"),
        type: "image",
        label: "Image",
        grid,
        data: {
          image: {
            id: makeId("img"),
            url: "",
          },
        },
      };

    case "links":
      return {
        id: makeId("links"),
        type: "links",
        label: "Navigation Link",
        grid,
        data: {
          heading: "",
          items: [{ id: makeId("link"), label: "Home", url: "#" }],
        },
      };

    case "cta":
      return {
        id: makeId("cta"),
        type: "cta",
        label: "Button",
        grid,
        data: {
          heading: "",
          body: "",
          buttonText: "Learn More",
          buttonUrl: "#",
        },
      };

    case "countdown":
      return {
        id: makeId("countdown"),
        type: "countdown",
        label: "Countdown",
        grid,
        data: {
          heading: "",
          targetIso: "",
          completedMessage: "Countdown finished",
        },
      };

    case "padding":
      return {
        id: makeId("padding"),
        type: "padding",
        label: "Spacing",
        grid,
        data: {
          height: 40,
        },
      };

    case "poll":
      return {
        id: makeId("poll"),
        type: "poll",
        label: "Poll",
        grid,
        data: {
          question: "Your question here",
          options: [
            { id: makeId("opt"), text: "Option 1" },
            { id: makeId("opt"), text: "Option 2" },
          ],
        },
      };

    case "rsvp":
      return {
        id: makeId("rsvp"),
        type: "rsvp",
        label: "RSVP",
        grid,
        data: {
          heading: "RSVP",
          collectName: true,
          collectEmail: true,
          collectPhone: false,
          collectGuestCount: false,
          collectNotes: false,
        },
      };

    case "faq":
      return {
        id: makeId("faq"),
        type: "faq",
        label: "FAQ",
        grid,
        data: {
          items: [
            {
              id: makeId("faq"),
              question: "Question",
              answer: "Answer",
            },
          ],
        },
      };

    case "gallery":
      return {
        id: makeId("gallery"),
        type: "gallery",
        label: "Gallery",
        grid,
        data: {
          grid: 3,
          images: [],
        },
      };

    case "thread":
      return {
        id: makeId("thread"),
        type: "thread",
        label: "Message Thread",
        grid,
        data: {
          messages: [],
          subject: "",
          allowAnonymous: false,
          requireApproval: false,
        },
      };

    case "showcase":
      return {
        id: makeId("showcase"),
        type: "showcase",
        label: "Showcase",
        grid,
        data: {
          images: [],
        },
      };

    case "festiveBackground":
      return {
        id: makeId("festivebg"),
        type: "festiveBackground",
        label: "Background Image",
        grid,
        data: {
          image: {
            id: makeId("img"),
            url: "",
          },
        },
      };

    default:
      throw new Error(`Unsupported block type: ${type}`);
  }
}