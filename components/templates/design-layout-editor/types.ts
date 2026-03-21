import type { BlockAppearance, BuilderBlockType, BuilderDraft, ShapeType } from "@/lib/templates/builder";

export type DraftWithPageExtras = BuilderDraft & {
  pageColor?: string;
  pageBackgroundImage?: string;
  pageBackgroundImageFit?: "clip" | "zoom" | "stretch";
  pageVisibility?: Partial<{
    title: boolean;
    subtitle: boolean;
    subtext: boolean;
    description: boolean;
  }>;
  pageElements?: Partial<{
    title: {
      colStart: number;
      rowStart: number;
      colSpan: number;
      rowSpan: number;
      zIndex?: number;
    };
    subtitle: {
      colStart: number;
      rowStart: number;
      colSpan: number;
      rowSpan: number;
      zIndex?: number;
    };
    subtext: {
      colStart: number;
      rowStart: number;
      colSpan: number;
      rowSpan: number;
      zIndex?: number;
    };
    description: {
      colStart: number;
      rowStart: number;
      colSpan: number;
      rowSpan: number;
      zIndex?: number;
    };
  }>;
  pageBlockAppearance?: Partial<
    Record<
      "title" | "subtitle" | "subtext" | "description",
      {
        backgroundColor?: string;
      }
    >
  >;
};

export type AppearancePatch = Partial<
  Pick<
    BlockAppearance,
    "backgroundColor" | "borderColor" | "borderWidth" | "borderRadius"
  >
>;

export type BottomCategory =
  | "Text"
  | "Media"
  | "Layout"
  | "Forms"
  | "Marketing"
  | "Social"
  | "Utilities";

export type PageBlockType = "title" | "subtitle" | "tagline" | "description";

export type ToolDropPayload =
  | { kind: "block"; type: BuilderBlockType }
  | { kind: "shape"; type: ShapeType }
  | { kind: "page"; type: PageBlockType };

export type SelectedContext =
  | { kind: "none"; label: "Nothing selected" }
  | { kind: "pageText"; blockId: string; label: string }
  | { kind: "label"; blockId: string; label: string }
  | { kind: "textFx"; blockId: string; label: string }
  | { kind: "image"; blockId: string; label: string }
  | { kind: "imageCarousel"; blockId: string; label: string }
  | { kind: "shape"; blockId: string; label: string }
  | { kind: "otherBlock"; blockId: string; blockType: string; label: string };

export type InspectorFocusTarget =
  | null
  | { type: "poll-question"; blockId: string }
  | { type: "poll-option"; blockId: string; optionId: string }
  | { type: "rsvp-heading"; blockId: string }
  | { type: "countdown-heading"; blockId: string }
  | { type: "countdown-target"; blockId: string }
  | { type: "countdown-completed"; blockId: string }
  | { type: "faq-question"; blockId: string; itemId: string }
  | { type: "faq-answer"; blockId: string; itemId: string }
  | { type: "thread-subject"; blockId: string }
  | { type: "links-heading"; blockId: string; itemId?: string }
  | { type: "links-item-label"; blockId: string; itemId: string }
  | { type: "links-item-url"; blockId: string; itemId: string }
  | { type: "carousel-heading"; blockId: string }
  | { type: "carousel-item-title"; blockId: string; itemId: string }
  | { type: "carousel-item-subtitle"; blockId: string; itemId: string }
  | { type: "carousel-item-href"; blockId: string; itemId: string };