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

export type BlockAppearance = {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
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
  | "festiveBackground"
  | "shape";

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

export type ShapeType = "rectangle" | "circle" | "line";

/* =========================================
   Base Block
   ========================================= */

export type BaseBlock = {
  id: string;
  label: string;
  grid?: GridPlacement;
  appearance?: BlockAppearance;
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
    style?: TextStyle;
  };
};

export type CtaBlock = BaseBlock & {
  type: "cta";
  data: {
    heading?: string;
    body?: string;
    buttonText: string;
    buttonUrl: string;
    style?: TextStyle;
  };
};

export type CountdownBlock = BaseBlock & {
  type: "countdown";
  data: {
    heading?: string;
    targetIso: string;
    completedMessage: string;
    style?: TextStyle;
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
    style?: TextStyle;
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
    style?: TextStyle;
  };
};

export type FaqBlock = BaseBlock & {
  type: "faq";
  data: {
    items: FaqItem[];
    style?: TextStyle;
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
    style?: TextStyle;
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

export type ShapeBlock = BaseBlock & {
  type: "shape";
  data: {
    shapeType: ShapeType;
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
  | FestiveBackgroundBlock
  | ShapeBlock;

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

export function createDefaultBlockAppearance(): BlockAppearance {
  return {
    backgroundColor: "transparent",
    borderColor: "#D1D5DB",
    borderWidth: 0,
    borderRadius: 16,
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

export function updateBlockAppearance(
  appearance: BlockAppearance | undefined,
  patch: Partial<BlockAppearance>,
): BlockAppearance {
  return {
    ...createDefaultBlockAppearance(),
    ...appearance,
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
        appearance: createDefaultBlockAppearance(),
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
        appearance: createDefaultBlockAppearance(),
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
        appearance: createDefaultBlockAppearance(),
        data: {
          heading: "",
          items: [{ id: makeId("link"), label: "Home", url: "#" }],
          style: createDefaultTextStyle(),
        },
      };

    case "cta":
      return {
        id: makeId("cta"),
        type: "cta",
        label: "Button",
        grid,
        appearance: createDefaultBlockAppearance(),
        data: {
          heading: "",
          body: "",
          buttonText: "Learn More",
          buttonUrl: "#",
          style: createDefaultTextStyle(),
        },
      };

    case "countdown":
      return {
        id: makeId("countdown"),
        type: "countdown",
        label: "Countdown",
        grid,
        appearance: createDefaultBlockAppearance(),
        data: {
          heading: "",
          targetIso: "",
          completedMessage: "Countdown finished",
          style: createDefaultTextStyle(),
        },
      };

    case "padding":
      return {
        id: makeId("padding"),
        type: "padding",
        label: "Spacing",
        grid,
        appearance: createDefaultBlockAppearance(),
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
        appearance: createDefaultBlockAppearance(),
        data: {
          question: "Your question here",
          options: [
            { id: makeId("opt"), text: "Option 1" },
            { id: makeId("opt"), text: "Option 2" },
          ],
          style: createDefaultTextStyle(),
        },
      };

    case "rsvp":
      return {
        id: makeId("rsvp"),
        type: "rsvp",
        label: "RSVP",
        grid,
        appearance: createDefaultBlockAppearance(),
        data: {
          heading: "RSVP",
          collectName: true,
          collectEmail: true,
          collectPhone: false,
          collectGuestCount: false,
          collectNotes: false,
          style: createDefaultTextStyle(),
        },
      };

    case "faq":
      return {
        id: makeId("faq"),
        type: "faq",
        label: "FAQ",
        grid,
        appearance: createDefaultBlockAppearance(),
        data: {
          items: [
            {
              id: makeId("faq"),
              question: "Question",
              answer: "Answer",
            },
          ],
          style: createDefaultTextStyle(),
        },
      };

    case "gallery":
      return {
        id: makeId("gallery"),
        type: "gallery",
        label: "Gallery",
        grid,
        appearance: createDefaultBlockAppearance(),
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
        appearance: createDefaultBlockAppearance(),
        data: {
          messages: [],
          subject: "",
          allowAnonymous: false,
          requireApproval: false,
          style: createDefaultTextStyle(),
        },
      };

    case "showcase":
      return {
        id: makeId("showcase"),
        type: "showcase",
        label: "Showcase",
        grid,
        appearance: createDefaultBlockAppearance(),
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
        appearance: createDefaultBlockAppearance(),
        data: {
          image: {
            id: makeId("img"),
            url: "",
          },
        },
      };

    case "shape":
      return {
        id: makeId("shape"),
        type: "shape",
        label: "Shape",
        grid: {
          ...grid,
          colSpan: 3,
          rowSpan: 2,
        },
        appearance: {
          ...createDefaultBlockAppearance(),
          backgroundColor: "#E5E7EB",
          borderColor: "#9CA3AF",
          borderWidth: 1,
          borderRadius: 16,
        },
        data: {
          shapeType: "rectangle",
        },
      };

    default:
      throw new Error(`Unsupported block type: ${type}`);
  }
}