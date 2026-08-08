// components\templates\design-layout-editor\constants.ts

import type { BottomCategory } from "./types";
import type { BuilderBlockType, ShapeType } from "@/lib/templates/builder";
export {
  FONT_FAMILY_MAP,
  FONT_FAMILY_OPTIONS,
} from "@/lib/fonts";

export const CATEGORY_ORDER: BottomCategory[] = [
  "Text",
  "Media",
  "Layout",
  "Forms",
  "Marketing",
  "Social",
  "Utilities",
];

export const CATEGORY_BUTTONS: Record<
  BottomCategory,
  Array<
    | { kind: "page"; label: string; type: "title" | "subtitle" | "tagline" | "description" }
    | { kind: "shape"; label: string; type: ShapeType }
    | { kind: "block"; label: string; type: BuilderBlockType }
    | { kind: "block"; label: "Input Field"; type: "form_field" }
  >
> = {
  Text: [
    { kind: "page", label: "Title", type: "title" },
    { kind: "page", label: "Subtitle", type: "subtitle" },
    { kind: "page", label: "Tagline", type: "tagline" },
    { kind: "page", label: "Description", type: "description" },
    { kind: "block", label: "Label", type: "label" },
    { kind: "block", label: "TextFX", type: "text_fx" },
  ],
  Media: [
    { kind: "block", label: "Image", type: "image" },
    { kind: "block", label: "Gallery", type: "gallery" },
    { kind: "block", label: "Carousel", type: "image_carousel" },
  ],
  Layout: [
    { kind: "shape", label: "Rectangle", type: "rectangle" },
    { kind: "shape", label: "Circle", type: "circle" },
    { kind: "shape", label: "Line", type: "line" },
    { kind: "block", label: "Spacer", type: "padding" },
  ],
  Forms: [
    { kind: "block", label: "Input Field", type: "form_field" },
    { kind: "block", label: "Poll", type: "poll" },
    { kind: "block", label: "RSVP", type: "rsvp" },
  ],
  Marketing: [
    { kind: "block", label: "Button", type: "cta" },
    { kind: "block", label: "Countdown", type: "countdown" },
    { kind: "block", label: "FAQ", type: "faq" },
  ],
  Social: [{ kind: "block", label: "Thread", type: "thread" }],
  Utilities: [{ kind: "block", label: "Links", type: "links" }],
};

export const MIN_CANVAS_ZOOM = 50;
export const MAX_CANVAS_ZOOM = 200;
export const CANVAS_ZOOM_STEP = 10;
export const PREVIEW_MESSAGE_TYPE = "ko-host-preview-draft";
export const PREVIEW_READY_MESSAGE_TYPE = "ko-host-preview-ready";
