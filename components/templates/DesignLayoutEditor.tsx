// components\templates\DesignLayoutEditor.tsx
"use client";

import AppModal from "@/components/ui/AppModal";
import { getStoreMeta } from "@/lib/utils/getStoreMeta";
import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import {
  Dancing_Script,
  Pacifico,
  Allura,
  Parisienne,
  Sacramento,
  Playball,
  Satisfy,
  Tangerine,
  Prata,
  Marcellus,
  Bodoni_Moda,
  Cinzel,
  Libre_Baskerville,
  Merriweather,
  Lora,
  Crimson_Text,
} from "next/font/google";

import GridCanvas, {
  type CanvasGridItem,
  getGridCanvasScrollableWidth,
} from "@/components/templates/design-editors/shared/GridCanvas";

import BlockRenderer from "@/components/preview/BlockRenderer";

import {
  PAGE_DESCRIPTION_BLOCK_ID,
  PAGE_SUBTEXT_BLOCK_ID,
  PAGE_SUBTITLE_BLOCK_ID,
  PAGE_TITLE_BLOCK_ID,
  createEmptySelection,
  isCanvasBlockSelected,
  selectionFromCanvasBlockId,
} from "@/components/templates/design-editors/shared/EditorSelection";

import type {
  BlockAppearance,
  BuilderBlockType,
  BuilderDraft,
  CarouselImageItem,
  FaqItem,
  GalleryImage,
  LinkItem,
  MicrositeBlock,
  PollOption,
  ShapeType,
  TextStyle,
} from "@/lib/templates/builder";

import {
  addBlockTypeToDraft,
  addShapeBlockToDraft,
  removeBlockFromDraft,
  applyStylePatchToSelection,
  applyAppearancePatchToSelection,
  getSelectionBlockAppearance,
  getSelectionTextStyle,
  readFileAsDataUrl,
  addImageCarouselItem,
  removeImageCarouselItem,
  updateImageCarouselField,
  updateImageCarouselNumericField,
  updateImageCarouselToggle,
  updateImageCarouselItemField,
} from "@/components/templates/design-editors/shared/editorUtils";

import {
  normalizeCanvasItems,
  moveCanvasItemToCell,
  resizeCanvasItem,
  bringCanvasItemToFront,
  sendCanvasItemToBack,
} from "@/components/builder/canvas/canvasItemTransforms";

import {
  buildPageCanvasItems,
  applyCanvasItemsToDraft,
} from "@/components/builder/canvas/pageCanvasBuilder";

import {
  getMetadata,
  getResolvedPageColor,
  getCanvasInnerBackgroundStyle,
} from "@/components/builder/metadata/metadataResolver";

import {
  updateFormField,
  updateFormFieldRequired,
} from "@/components/builder/mutations/contentMutations";

import { getCanvasShellClass } from "@/components/builder/ui/editorPanelStyles";
import ImageUploadDropzone from "@/components/builder/ImageUploadDropzone";

type Props = {
  templateKey: string;
  designKey: string;
  draft: BuilderDraft;
  setDraft: React.Dispatch<React.SetStateAction<BuilderDraft>>;
  onSaveDraft?: (draft: BuilderDraft) => void | Promise<void>;
  publishHref?: string;
  publishLabel?: string;
  onPublishClick?: () => void;
  saveState?: "idle" | "saving" | "saved" | "error" | "signin-required";
  saveMessage?: string;
};

type PageLengthOption =
  | "1200"
  | "1800"
  | "2400"
  | "3200"
  | "4000"
  | "5600";

type DraftPageVisibility = Partial<{
  title: boolean;
  subtitle: boolean;
  subtext: boolean;
  description: boolean;
}>;

type DraftPageElementLayout = {
  colStart: number;
  rowStart: number;
  colSpan: number;
  rowSpan: number;
  zIndex?: number;
};

type DraftWithPageExtras = BuilderDraft & {
  pageColor?: string;
  pageBackgroundImage?: string;
  pageBackgroundImageFit?: "clip" | "zoom" | "stretch";
  pageVisibility?: DraftPageVisibility;
  pageElements?: Partial<{
    title: DraftPageElementLayout;
    subtitle: DraftPageElementLayout;
    subtext: DraftPageElementLayout;
    description: DraftPageElementLayout;
  }>;
  pageLength?: PageLengthOption;
  pageBlockAppearance?: Partial<
    Record<
      "title" | "subtitle" | "subtext" | "description",
      {
        backgroundColor?: string;
      }
    >
  >;
};

type AppearancePatch = Partial<
  Pick<
    BlockAppearance,
    "backgroundColor" | "borderColor" | "borderWidth" | "borderRadius"
  >
>;

type BottomCategory =
  | "Text"
  | "Media"
  | "Layout"
  | "Forms"
  | "Interactive"
  | "Utilities"
  | "Data & Metrics"
  | "Scheduling"
  | "Premium";

type PageBlockType = "title" | "subtitle" | "tagline" | "description";

type ToolDropPayload =
  | { kind: "block"; type: BuilderBlockType }
  | { kind: "shape"; type: ShapeType }
  | { kind: "page"; type: PageBlockType };

type SelectedContext =
  | { kind: "none"; label: "Nothing selected" }
  | { kind: "pageText"; blockId: string; label: string }
  | { kind: "label"; blockId: string; label: string }
  | { kind: "textFx"; blockId: string; label: string }
  | { kind: "cta"; blockId: string; label: string }
  | { kind: "image"; blockId: string; label: string }
  | { kind: "imageCarousel"; blockId: string; label: string }
  | { kind: "shape"; blockId: string; label: string }
  | { kind: "otherBlock"; blockId: string; blockType: string; label: string };

type InspectorFocusTarget =
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

const CATEGORY_ORDER: BottomCategory[] = [
  "Text",
  "Media",
  "Layout",
  "Forms",
  "Interactive",
  "Utilities",
  "Data & Metrics",
  "Scheduling",
  "Premium",
];

const CATEGORY_BUTTONS: Record<
  BottomCategory,
  Array<
    | { kind: "page"; label: string; type: PageBlockType }
    | { kind: "shape"; label: string; type: ShapeType }
    | { kind: "block"; label: string; type: BuilderBlockType }
    | { kind: "block"; label: "Input Field"; type: "form_field" }
  >
> = {
  Text: [
{ kind: "page", label: "Title", type: "title" },
{ kind: "page", label: "Subtitle", type: "subtitle" },
{ kind: "block", label: "Label", type: "label" },
{ kind: "block", label: "TextFX", type: "text_fx" },
{ kind: "block", label: "Rich Text", type: "rich_text" },
  ],
  Media: [
    { kind: "block", label: "Image", type: "image" },
    { kind: "block", label: "Video", type: "video" },
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
    { kind: "block", label: "FAQ", type: "faq" },
  ],
  Interactive: [
    { kind: "block", label: "Thread", type: "thread" },
    { kind: "block", label: "File Share", type: "file_share" },
  ],
  Utilities: [
    { kind: "block", label: "Links", type: "links" },
    { kind: "block", label: "Link Hub", type: "link_hub" },
    { kind: "block", label: "Listing", type: "listing" },
  ],
  "Data & Metrics": [
    { kind: "block", label: "Highlight", type: "highlight" },
    { kind: "block", label: "Progress Bar", type: "progress_bar" },
  ],
Scheduling: [
  { kind: "block", label: "Countdown", type: "countdown" },
  { kind: "block", label: "Checklist", type: "checklist" },
  { kind: "block", label: "Schedule / Agenda", type: "schedule_agenda" },
  { kind: "block", label: "Map / Location", type: "map_location" },
],
Premium: [ 
  { kind: "block", label: "Registry", type: "registry" },
  { kind: "block", label: "Speed Dating", type: "speed_dating" },
  { kind: "block", label: "Donation", type: "donation" },
  { kind: "block", label: "Checkout", type: "checkout" },
  { kind: "block", label: "Cart", type: "cart" },
],
};

const MIN_CANVAS_ZOOM = 50;
const MAX_CANVAS_ZOOM = 200;
const CANVAS_ZOOM_STEP = 10;
const PREVIEW_MESSAGE_TYPE = "ko-host-preview-draft";
const PREVIEW_READY_MESSAGE_TYPE = "ko-host-preview-ready";
const PREVIEW_RECEIVED_MESSAGE_TYPE = "ko-host-preview-received";

const FONT_FAMILY_OPTIONS = [
  "inherit",

  // Existing
  "Inter",
  "DM Sans",
  "Poppins",
  "Playfair Display",
  "Cormorant Garamond",
  "Great Vibes",

  // Added script / invitation fonts
  "Dancing Script",
  "Pacifico",
  "Allura",
  "Parisienne",
  "Sacramento",
  "Playball",
  "Satisfy",
  "Tangerine",

  // Elegant serif fonts
  "Prata",
  "Marcellus",
  "Bodoni Moda",
  "Cinzel",
  "Libre Baskerville",
  "Merriweather",
  "Lora",
  "Crimson Text",

  "Anton",
  "Bangers",
  "Orbitron",
  "Righteous",
  "Alfa Slab One",
  "Permanent Marker",
  "Caveat",
  "Indie Flower",
  "Exo 2",
  "Rajdhani",
  "Teko",
  "Abril Fatface",

  // System fonts
  "Arial",
  "Helvetica",
  "Georgia",
  "Times New Roman",
  "Trebuchet MS",
  "Verdana",
  "Courier New",
  "system-ui",
] as const;

const FONT_FAMILY_MAP: Record<string, string> = {
  Inter: 'var(--font-inter), Inter, ui-sans-serif, system-ui, sans-serif',
  "DM Sans":
    'var(--font-dm-sans), "DM Sans", ui-sans-serif, system-ui, sans-serif',
  Poppins:
    'var(--font-poppins), Poppins, ui-sans-serif, system-ui, sans-serif',

  "Playfair Display":
    'var(--font-playfair-display), "Playfair Display", ui-serif, Georgia, serif',
  "Cormorant Garamond":
    'var(--font-cormorant), "Cormorant Garamond", ui-serif, Georgia, serif',
  "Great Vibes": 'var(--font-great-vibes), "Great Vibes", cursive',

  // Added script / invitation fonts
  "Dancing Script":
    'var(--font-dancing-script), "Dancing Script", cursive',
  Pacifico: 'var(--font-pacifico), Pacifico, cursive',
  Allura: 'var(--font-allura), Allura, cursive',
  Parisienne: 'var(--font-parisienne), Parisienne, cursive',
  Sacramento: 'var(--font-sacramento), Sacramento, cursive',
  Playball: 'var(--font-playball), Playball, cursive',
  Satisfy: 'var(--font-satisfy), Satisfy, cursive',
  Tangerine: 'var(--font-tangerine), Tangerine, cursive',

  // Added elegant serif fonts
  Prata: 'var(--font-prata), Prata, ui-serif, Georgia, serif',
  Marcellus: 'var(--font-marcellus), Marcellus, ui-serif, Georgia, serif',
  "Bodoni Moda":
    'var(--font-bodoni-moda), "Bodoni Moda", ui-serif, Georgia, serif',
  Cinzel: 'var(--font-cinzel), Cinzel, ui-serif, Georgia, serif',
  "Libre Baskerville":
    'var(--font-libre-baskerville), "Libre Baskerville", ui-serif, Georgia, serif',
  Merriweather:
    'var(--font-merriweather), Merriweather, ui-serif, Georgia, serif',
  Lora: 'var(--font-lora), Lora, ui-serif, Georgia, serif',
  "Crimson Text":
    'var(--font-crimson-text), "Crimson Text", ui-serif, Georgia, serif',

  // System fonts
  Arial: "Arial, Helvetica, sans-serif",
  Helvetica: "Helvetica, Arial, sans-serif",
  Georgia: "Georgia, serif",
  "Times New Roman": '"Times New Roman", Times, serif',
  "Trebuchet MS": '"Trebuchet MS", sans-serif',
  Verdana: "Verdana, sans-serif",
  "Courier New": '"Courier New", monospace',
  "system-ui": "system-ui, sans-serif",
};


function getPageLengthPx(length: PageLengthOption) {
  if (length === "1200") return 1200;
  if (length === "1800") return 1800;
  if (length === "2400") return 2400;
  if (length === "3200") return 3200;
  if (length === "4000") return 4000;
  return 5600;
}


function cloneDraft<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function resolveFontFamily(fontFamily?: string) {
  if (!fontFamily || fontFamily === "inherit") return "inherit";
  return FONT_FAMILY_MAP[fontFamily] ?? fontFamily;
}

function makeClientId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function buildCanvasItems(
  draft: BuilderDraft,
  metadata: ReturnType<typeof getMetadata>,
): CanvasGridItem[] {
  const pageItems = buildPageCanvasItems(draft, metadata);
  const blockItems: CanvasGridItem[] = draft.blocks.map((block) => ({
    id: block.id,
    type: block.type,
    label: block.label,
    grid: block.grid,
  }));

  return normalizeCanvasItems([...pageItems, ...blockItems]);
}
function isPageBlockId(blockId: string) {
  return (
    blockId === PAGE_TITLE_BLOCK_ID ||
    blockId === PAGE_SUBTITLE_BLOCK_ID ||
    blockId === PAGE_SUBTEXT_BLOCK_ID ||
    blockId === PAGE_DESCRIPTION_BLOCK_ID
  );
}

function isSingletonPageBlockId(blockId: string) {
  return blockId === PAGE_TITLE_BLOCK_ID;
}

function isSingletonPageBlockType(type: PageBlockType) {
  return type === "title";
}

function getPageBlockIdForType(type: PageBlockType) {
  if (type === "title") return PAGE_TITLE_BLOCK_ID;
  if (type === "subtitle") return PAGE_SUBTITLE_BLOCK_ID;
  if (type === "tagline") return PAGE_SUBTEXT_BLOCK_ID;
  if (type === "description") return PAGE_DESCRIPTION_BLOCK_ID;
  return null;
}

function getPageBlockLabel(type: PageBlockType) {
  if (type === "title") return "Title";
  if (type === "subtitle") return "Subtitle";
  if (type === "tagline") return "Tagline";
  if (type === "description") return "Description";
  return "Page Text";
}

function topBarSliderWrapClass() {
  return "inline-flex h-12 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 text-xs text-white";
}

function topBarSliderClass() {
  return "w-24 accent-blue-500";
}

function getSelectedContext(
  selection: ReturnType<typeof createEmptySelection>,
  draft: BuilderDraft,
): SelectedContext {
  if (selection.type === "page:title") {
    return { kind: "pageText", blockId: PAGE_TITLE_BLOCK_ID, label: "Title" };
  }

  if (selection.type === "page:subtitle") {
    return {
      kind: "pageText",
      blockId: PAGE_SUBTITLE_BLOCK_ID,
      label: "Subtitle",
    };
  }

  if (selection.type === "page:subtext") {
    return {
      kind: "pageText",
      blockId: PAGE_SUBTEXT_BLOCK_ID,
      label: "Tagline",
    };
  }

  if (selection.type === "page:description") {
    return {
      kind: "pageText",
      blockId: PAGE_DESCRIPTION_BLOCK_ID,
      label: "Description",
    };
  }

  if (selection.type !== "block") {
    return { kind: "none", label: "Nothing selected" };
  }

  const blockId = selection.blockId;
  const block = draft.blocks.find((item) => item.id === blockId);

  if (!block) {
    return { kind: "none", label: "Nothing selected" };
  }

  if (block.type === "label") {
    return { kind: "label", blockId, label: block.label || "Label" };
  }

  if (block.type === "text_fx") {
    return { kind: "textFx", blockId, label: block.label || "TextFX" };
  }

  if (block.type === "cta") {
    return { kind: "cta", blockId, label: block.label || "Button" };
  }

  if (block.type === "image") {
    return { kind: "image", blockId, label: "Image" };
  }

  if (block.type === "image_carousel") {
    return {
      kind: "imageCarousel",
      blockId,
      label: block.label || "Image Carousel",
    };
  }

  if (block.type === "shape") {
    return { kind: "shape", blockId, label: block.label || "Shape" };
  }

  if (block.type === "highlight") {
    return { kind: "otherBlock", blockId, blockType: block.type, label: block.label || "Highlight" };
  }

    if (block.type === "progress_bar") {
    return {
      kind: "otherBlock",
      blockId,
      blockType: block.type,
      label: block.label || "Progress Bar",
    };
  }

  if (block.type === "listing") {
    return { kind: "otherBlock", blockId, blockType: block.type, label: block.label || "Listing" };
  }

  if (block.type === "donation") {
    return {
      kind: "otherBlock",
      blockId,
      blockType: block.type,
      label: block.label || "Donation",
    };
  }

  if (block.type === "link_hub") {
    return {
      kind: "otherBlock",
      blockId,
      blockType: block.type,
      label: block.label || "Link Hub",
    };
  }

  if (block.type === "checklist") {
    return {
      kind: "otherBlock",
      blockId,
      blockType: block.type,
      label: block.label || "Checklist",
    };
  }

  if (block.type === "schedule_agenda") {
    return {
      kind: "otherBlock",
      blockId,
      blockType: block.type,
      label: block.label || "Schedule",
    };
  }

  if (block.type === "map_location") {
    return {
      kind: "otherBlock",
      blockId,
      blockType: block.type,
      label: block.label || "Map",
    };
  }

  if (block.type === "file_share") {
    return {
      kind: "otherBlock",
      blockId,
      blockType: block.type,
      label: block.label || "File Share",
    };
  }

  if (block.type === "speed_dating") {
    return {
      kind: "otherBlock",
      blockId,
      blockType: block.type,
      label: block.label || "Speed Dating",
    };
  }

  if (block.type === "registry") {
    return {
      kind: "otherBlock",
      blockId,
      blockType: block.type,
      label: block.label || "Registry",
    };
  }

    if (block.type === "cart") {
    return {
      kind: "otherBlock",
      blockId,
      blockType: block.type,
      label: block.label || "Cart",
    };
  }

  if (block.type === "video") {
    return {
      kind: "otherBlock",
      blockId,
      blockType: block.type,
      label: block.label || "Video",
    };
  }

  if (block.type === "rich_text") {
    return {
      kind: "otherBlock",
      blockId,
      blockType: block.type,
      label: block.label || "Rich Text",
    };
  }

  return {
    kind: "otherBlock",
    blockId,
    blockType: block.type,
    label: block.label || block.type,
  };
}

function topBarButtonClass(active = false, disabled = false, danger = false) {
  return [
    "inline-flex h-11 min-w-11 items-center justify-center rounded-md border px-3 text-sm transition",
    disabled
      ? "cursor-not-allowed border-white/5 bg-white/[0.03] text-white/25"
      : danger
        ? "border-red-400/40 bg-red-500/10 text-red-100 hover:bg-red-500/20"
        : active
          ? "border-blue-500 bg-blue-600 text-white"
          : "border-white/10 bg-white/5 text-white hover:bg-white/10",
  ].join(" ");
}

function topBarFieldClass(widthClass = "") {
  return [
    "h-10 rounded-md border border-white/10 bg-white px-3 text-sm text-black outline-none transition",
    widthClass,
  ].join(" ");
}

function topBarColorClass(disabled = false) {
  return [
    "h-10 w-10 shrink-0 rounded-md border p-1 transition",
    disabled
      ? "cursor-not-allowed border-white/5 bg-white/[0.03] opacity-40"
      : "border-white/10 bg-white/5",
  ].join(" ");
}
function infoPillClass() {
  return "inline-flex h-11 items-center rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white/85";
}

function bottomCategoryClass(active: boolean, category?: BottomCategory) {
  return [
    "inline-flex h-11 items-center gap-2 rounded-md border px-4 text-sm font-medium transition",
    active
      ? "border-blue-500 bg-blue-600 text-white"
      : category === "Premium"
        ? "border-neutral-300 bg-white text-blue-700 hover:bg-neutral-100"
        : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100",
  ].join(" ");
}

function actionButtonClass(primary = false) {
  return [
    "inline-flex h-12 items-center justify-center rounded-md border px-4 text-sm font-medium transition",
    primary
      ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
      : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100",
  ].join(" ");
}

function toolButtonClass() {
  return "inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-neutral-300 bg-white px-2 text-sm text-neutral-700 transition hover:bg-neutral-100";
}

function inspectorCardClass() {
  return "rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm";
}

function inspectorLabelClass() {
  return "text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500";
}

function inspectorInputClass() {
  return "mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none";
}

function inspectorTextareaClass() {
  return "mt-2 min-h-[120px] w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 outline-none";
}

function toolSetButtonClass(kind: "front" | "back" | "remove") {
  if (kind === "remove") {
    return "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-sm text-red-700 hover:bg-red-100";
  }

  return "inline-flex h-8 items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-50";
}

function getToolGlyph(label: string) {
  if (label === "Text") return "T";
  if (label === "Media") return "🖼";
  if (label === "Layout") return "▦";
  if (label === "Forms") return "☰";
  if (label === "Interactive") return "💬";
  if (label === "Utilities") return "⚙";
  if (label === "Data & Metrics") return "📊";
  if (label === "Scheduling") return "🗓";
  if (label === "Title") return "TT";
  if (label === "Subtitle") return "ST";
  if (label === "Tagline") return "TL";
  if (label === "Description") return "DE";
  if (label === "Label") return "LB";
  if (label === "TextFX") return "✨";
  if (label === "Image") return "🖼";
  if (label === "Gallery") return "▥";
  if (label === "Rectangle") return "▭";
  if (label === "Circle") return "◯";
  if (label === "Line") return "—";
  if (label === "Spacer") return "↕";
  if (label === "Poll") return "☑";
  if (label === "RSVP") return "✉";
  if (label === "Button") return "▣";
  if (label === "Countdown") return "◔";
  if (label === "FAQ") return "?";
  if (label === "Thread") return "☰";
  if (label === "Links") return "🔗";
  if (label === "Highlight") return "★";
  if (label === "Listing") return "🏷";
  if (label === "Carousel") return "⇄";
  if (label === "Input Field") return "⌨";
  if (label === "Rich Text") return "📝";
  if (label === "Video") return "▶";
  if (label === "Progress Bar") return "▰";
  if (label === "Donation") return "💝";
  if (label === "Link Hub") return "🌐";
  if (label === "Checklist") return "☑";
  if (label === "Schedule / Agenda") return "🗓";
  if (label === "Map / Location") return "📍";
  if (label === "File Share") return "📁";
  if (label === "Speed Dating") return "❤";
  if (label === "Registry") return "🎁";
  if (label === "Premium") return "💎";
  return "•";
}

function getSelectedCanvasBlockId(context: SelectedContext): string | null {
  if (context.kind === "none") return null;
  return context.blockId;
}



function getSelectedTextValue(
  draft: BuilderDraft,
  context: SelectedContext,
): string {
  if (context.kind === "pageText") {
    if (context.blockId === PAGE_TITLE_BLOCK_ID) return draft.title ?? "";
    if (context.blockId === PAGE_SUBTITLE_BLOCK_ID) return draft.subtitle ?? "";
    if (context.blockId === PAGE_SUBTEXT_BLOCK_ID) return draft.subtext ?? "";
    if (context.blockId === PAGE_DESCRIPTION_BLOCK_ID) {
      return draft.description ?? "";
    }
    return "";
  }

  if (
  context.kind === "label" ||
  context.kind === "textFx" ||
  context.kind === "cta"
) {
  const block = draft.blocks.find((item) => item.id === context.blockId);

  if (block?.type === "label" || block?.type === "text_fx") {
    return block.data.text ?? "";
  }

  if (block?.type === "cta") {
    return block.data.buttonText ?? "";
  }
}

  return "";
}

function getInlineTextStyle(style?: TextStyle) {
  const decorations: string[] = [];

  if (style?.underline) decorations.push("underline");
  if (style?.strike) decorations.push("line-through");

  return {
    fontFamily: resolveFontFamily(style?.fontFamily),
    fontSize: style?.fontSize ? `${style.fontSize}px` : undefined,
    fontWeight: style?.bold ? 700 : 400,
    fontStyle: style?.italic ? "italic" : "normal",
    textDecoration: decorations.length ? decorations.join(" ") : "none",
    textAlign: style?.align ?? "left",
    color: style?.color || undefined,
    lineHeight: 1.2,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  } as const;
}

function getPageAppearanceKey(
  blockId: string,
): "title" | "subtitle" | "subtext" | "description" | null {
  if (blockId === PAGE_TITLE_BLOCK_ID) return "title";
  if (blockId === PAGE_SUBTITLE_BLOCK_ID) return "subtitle";
  if (blockId === PAGE_SUBTEXT_BLOCK_ID) return "subtext";
  if (blockId === PAGE_DESCRIPTION_BLOCK_ID) return "description";
  return null;
}

function isTextSelection(context: SelectedContext) {
  return (
    context.kind === "pageText" ||
    context.kind === "label" ||
    context.kind === "textFx"
  );
}

function clampCanvasZoom(value: number) {
  return Math.max(MIN_CANVAS_ZOOM, Math.min(MAX_CANVAS_ZOOM, value));
}

function inspectorSectionId(target: InspectorFocusTarget) {
  if (!target) return null;

  switch (target.type) {
    case "poll-question":
    case "poll-option":
      return "inspector-poll";

    case "rsvp-heading":
      return "inspector-rsvp";

    case "countdown-heading":
    case "countdown-target":
    case "countdown-completed":
      return "inspector-countdown";

    case "faq-question":
    case "faq-answer":
      return "inspector-faq";

    case "thread-subject":
      return "inspector-thread";

    case "links-heading":
    case "links-item-label":
    case "links-item-url":
      return "inspector-links";

    case "carousel-heading":
    case "carousel-item-title":
    case "carousel-item-subtitle":
    case "carousel-item-href":
      return "inspector-image-carousel";

    default:
      return null;
  }
}

export default function DesignLayoutEditor({
  templateKey,
  designKey,
  draft,
  setDraft,
  onSaveDraft,
  publishHref,
  publishLabel = "Publish",
  onPublishClick,
  saveState,
  saveMessage,
}: Props) {
  const [resetDraftModalOpen, setResetDraftModalOpen] = useState(false);
  const selectedPageLength =
    ((draft as DraftWithPageExtras).pageLength ?? "1800") as PageLengthOption;

  const [registryLoadingMap, setRegistryLoadingMap] = useState<Record<string, boolean>>({});
  const [selection, setSelection] = useState(createEmptySelection());
  const [activeCategory, setActiveCategory] = useState<BottomCategory>("Text");
  const [openToolMenu, setOpenToolMenu] = useState<BottomCategory | null>(null);
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [removeAllModalOpen, setRemoveAllModalOpen] = useState(false);
  const [inspectorFocusTarget, setInspectorFocusTarget] =
    useState<InspectorFocusTarget>(null);
  const [canvasZoom, setCanvasZoom] = useState(100);
  const [showGridLines, setShowGridLines] = useState(true);
  const [undoStack, setUndoStack] = useState<BuilderDraft[]>([]);
  const [redoStack, setRedoStack] = useState<BuilderDraft[]>([]);
  const isHistoryActionRef = useRef(false);
  const initialDraftRef = useRef<BuilderDraft>(cloneDraft(draft));
  const lastDraftRef = useRef<BuilderDraft>(cloneDraft(draft));
  const topBarScrollRef = useRef<HTMLDivElement | null>(null);
  const dockedScrollRef = useRef<HTMLDivElement | null>(null);
  const bottomBarRef = useRef<HTMLDivElement | null>(null);
  const toolMenuRef = useRef<HTMLDivElement | null>(null);
  const pollQuestionInputRef = useRef<HTMLTextAreaElement | null>(null);
  const pollOptionInputRefs = useRef<Record<string, HTMLInputElement | null>>(
    {},
  );

  const rsvpHeadingInputRef = useRef<HTMLInputElement | null>(null);
  const currentSiteName = draft.title?.trim() || "Untitled Site";
  const currentSiteSlug =
    (draft as DraftWithPageExtras).slugSuggestion?.trim() || "";
  const currentSiteDisplay = currentSiteSlug
    ? `${currentSiteSlug}.ko-host.com`
    : "[Unavailable]";
  const countdownHeadingInputRef = useRef<HTMLInputElement | null>(null);
  const countdownTargetInputRef = useRef<HTMLInputElement | null>(null);
  const countdownCompletedInputRef = useRef<HTMLInputElement | null>(null);
  const richTextEditorRef = useRef<HTMLDivElement | null>(null);
  const [isRichTextEditorEmpty, setIsRichTextEditorEmpty] = useState(true);
  const [richTextLinkModalOpen, setRichTextLinkModalOpen] = useState(false);
const [richTextLinkValue, setRichTextLinkValue] = useState("https://");
  const [recentColors, setRecentColors] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem("kht:recent-colors");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
    } catch {
      return [];
    }
  });
  const faqQuestionInputRefs = useRef<Record<string, HTMLInputElement | null>>(
    {},
  );
  const faqAnswerInputRefs = useRef<Record<string, HTMLTextAreaElement | null>>(
    {},
  );

  const threadSubjectInputRef = useRef<HTMLInputElement | null>(null);

  const linksHeadingInputRef = useRef<HTMLInputElement | null>(null);
  const linksItemLabelInputRefs = useRef<Record<string, HTMLInputElement | null>>(
    {},
  );
  const linksItemUrlInputRefs = useRef<Record<string, HTMLInputElement | null>>(
    {},
  );
  const carouselHeadingInputRef = useRef<HTMLInputElement | null>(null);
  const carouselItemTitleInputRefs = useRef<Record<string, HTMLInputElement | null>>(
    {},
  );
  const carouselItemSubtitleInputRefs = useRef<Record<string, HTMLInputElement | null>>(
    {},
  );
  const carouselItemHrefInputRefs = useRef<Record<string, HTMLInputElement | null>>(
    {},
  );

  const metadata = useMemo(
    () => getMetadata(templateKey, designKey),
    [templateKey, designKey],
  );

  const canvasItems = useMemo(
    () => buildCanvasItems(draft, metadata),
    [draft, metadata],
  );

  const selectedBlockFromDraft =
    selection.type === "block"
      ? draft.blocks.find((item) => item.id === selection.blockId) ?? null
      : null;

const selectedStyle =
  selectedBlockFromDraft?.type === "text_fx" ||
  selectedBlockFromDraft?.type === "cta" ||
  selectedBlockFromDraft?.type === "thread" ||
  selectedBlockFromDraft?.type === "form_field" ||
  selectedBlockFromDraft?.type === "image_carousel" ||
  selectedBlockFromDraft?.type === "highlight" ||
  selectedBlockFromDraft?.type === "progress_bar" ||
  selectedBlockFromDraft?.type === "donation" ||
  selectedBlockFromDraft?.type === "link_hub" ||
  selectedBlockFromDraft?.type === "checklist" ||
  selectedBlockFromDraft?.type === "schedule_agenda" ||
  selectedBlockFromDraft?.type === "map_location" ||
  selectedBlockFromDraft?.type === "file_share" ||
  selectedBlockFromDraft?.type === "speed_dating" ||
  selectedBlockFromDraft?.type === "cart" ||
  selectedBlockFromDraft?.type === "video" ||
  selectedBlockFromDraft?.type === "rich_text" ||
  selectedBlockFromDraft?.type === "countdown"
    ? (selectedBlockFromDraft.data.style ?? {})
    : getSelectionTextStyle(draft, selection);
  const selectedAppearance = getSelectionBlockAppearance(draft, selection);
  const resolvedPageColor =
    (draft as DraftWithPageExtras).pageColor ||
    getResolvedPageColor(draft, designKey, metadata);
  const selectedContext = getSelectedContext(selection, draft);
  const selectedCanvasBlockId = getSelectedCanvasBlockId(selectedContext);

  const selectedCanvasItem =
    selectedCanvasBlockId != null
      ? canvasItems.find((item) => item.id === selectedCanvasBlockId) ?? null
      : null;

  const selectedBlock =
    selectedContext.kind === "none" || selectedContext.kind === "pageText"
      ? null
      : draft.blocks.find((item) => item.id === selectedContext.blockId) ?? null;

  const selectedTextFxBlock =
    selectedBlock?.type === "text_fx" ? selectedBlock : null;

  const isTextFxSelected = Boolean(selectedTextFxBlock);

  const selectedBold = selectedStyle.bold ?? false;
  const selectedItalic = selectedStyle.italic ?? false;
  const selectedUnderline = selectedStyle.underline ?? false;
  const selectedStrike = selectedStyle.strike ?? false;

const showTextControls =
  selectedContext.kind === "pageText" ||
  selectedContext.kind === "label" ||
  selectedContext.kind === "textFx" ||
  selectedContext.kind === "cta" ||
  selectedBlock?.type === "thread" ||
  selectedBlock?.type === "form_field" ||
  selectedBlock?.type === "highlight" ||
  selectedBlock?.type === "progress_bar" ||
  selectedBlock?.type === "donation" ||
  selectedBlock?.type === "link_hub" ||
  selectedBlock?.type === "checklist" ||
  selectedBlock?.type === "schedule_agenda" ||
  selectedBlock?.type === "map_location" ||
  selectedBlock?.type === "file_share" ||
  selectedBlock?.type === "speed_dating" ||
  selectedBlock?.type === "registry" ||
  selectedBlock?.type === "cart" ||
  selectedBlock?.type === "video" ||
  selectedBlock?.type === "rich_text" ||
  selectedBlock?.type === "countdown";

const showAppearanceControls =
  selectedContext.kind === "label" ||
  selectedContext.kind === "cta" ||
  selectedContext.kind === "image" ||
  selectedContext.kind === "imageCarousel" ||
  selectedContext.kind === "shape" ||
  selectedBlock?.type === "thread" ||
  selectedBlock?.type === "listing" ||
  selectedBlock?.type === "progress_bar" ||
  selectedBlock?.type === "donation" ||
  selectedBlock?.type === "link_hub" ||
  selectedBlock?.type === "checklist" ||
  selectedBlock?.type === "schedule_agenda" ||
  selectedBlock?.type === "map_location" ||
  selectedBlock?.type === "file_share" ||
  selectedBlock?.type === "speed_dating" ||
  selectedBlock?.type === "registry" ||
  selectedBlock?.type === "cart" ||
  selectedBlock?.type === "video" ||
  selectedBlock?.type === "rich_text" ||
  selectedBlock?.type === "countdown";

const showBorderWidthRadiusControls =
  selectedContext.kind === "label" ||
  selectedContext.kind === "cta" ||
  selectedContext.kind === "image" ||
  selectedContext.kind === "imageCarousel" ||
  selectedContext.kind === "shape" ||
  selectedBlock?.type === "thread" ||
  selectedBlock?.type === "listing" ||
  selectedBlock?.type === "progress_bar" ||
  selectedBlock?.type === "donation" ||
  selectedBlock?.type === "link_hub" ||
  selectedBlock?.type === "checklist" ||
  selectedBlock?.type === "schedule_agenda" ||
  selectedBlock?.type === "map_location" ||
  selectedBlock?.type === "file_share" ||
  selectedBlock?.type === "speed_dating" ||
  selectedBlock?.type === "registry" ||
  selectedBlock?.type === "cart" ||
  selectedBlock?.type === "video" ||
  selectedBlock?.type === "rich_text" ||
  selectedBlock?.type === "countdown";

  const selectedTextValue = getSelectedTextValue(draft, selectedContext);

  const selectedPageAppearanceKey =
    selectedContext.kind === "pageText"
      ? getPageAppearanceKey(selectedContext.blockId)
      : null;

  const selectedPageBackgroundColor =
    selectedPageAppearanceKey &&
    (draft as DraftWithPageExtras).pageBlockAppearance?.[
      selectedPageAppearanceKey
    ]?.backgroundColor
      ? (draft as DraftWithPageExtras).pageBlockAppearance?.[
          selectedPageAppearanceKey
        ]?.backgroundColor
      : "transparent";
  const canvasZoomScale = canvasZoom / 100;

  const pageBackgroundImage =
    (draft as DraftWithPageExtras).pageBackgroundImage?.trim() || "";

  const pageBackgroundImageFit =
    (draft as DraftWithPageExtras).pageBackgroundImageFit ?? "zoom";

    const pageScale = Math.max(
      10,
      Math.min(100, (draft as DraftWithPageExtras).pageScale ?? 85),
    );
  const pageSurfaceStyle = useMemo(() => {
  const backgroundColor =
    (draft as DraftWithPageExtras).pageColor ||
    getCanvasInnerBackgroundStyle(draft, designKey, metadata).backgroundColor;

    const backgroundSize =
      pageBackgroundImageFit === "clip"
        ? "contain"
        : pageBackgroundImageFit === "stretch"
          ? "100% 100%"
          : "cover";

    return {
      backgroundColor,
      backgroundImage: pageBackgroundImage
        ? `url("${pageBackgroundImage}")`
        : undefined,
      backgroundSize,
      backgroundPosition: "center top",
      backgroundRepeat: "no-repeat",
    } as CSSProperties;
  }, [
    draft,
    designKey,
    metadata,
    pageBackgroundImage,
    pageBackgroundImageFit,
  ]);
  
  useEffect(() => {
  try {
    window.localStorage.setItem(
      "kht:recent-colors",
      JSON.stringify(recentColors.slice(0, 10)),
    );
  } catch {
    // ignore storage errors
  }
}, [recentColors]);

  useEffect(() => {
    if (!inspectorFocusTarget || !selectedBlock) return;

    const sectionId = inspectorSectionId(inspectorFocusTarget);
    if (sectionId) {
      requestAnimationFrame(() => {
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }

    if (
      inspectorFocusTarget.type === "poll-question" &&
      selectedBlock.type === "poll" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = pollQuestionInputRef.current;
      if (el) {
        el.focus();
        const len = el.value.length;
        el.setSelectionRange(len, len);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "poll-option" &&
      selectedBlock.type === "poll" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = pollOptionInputRefs.current[inspectorFocusTarget.optionId];
      if (el) {
        el.focus();
        const len = el.value.length;
        el.setSelectionRange(len, len);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "rsvp-heading" &&
      selectedBlock.type === "rsvp" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = rsvpHeadingInputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "countdown-heading" &&
      selectedBlock.type === "countdown" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = countdownHeadingInputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "countdown-target" &&
      selectedBlock.type === "countdown" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = countdownTargetInputRef.current;
      if (el) {
        el.focus();
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "countdown-completed" &&
      selectedBlock.type === "countdown" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = countdownCompletedInputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "faq-question" &&
      selectedBlock.type === "faq" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = faqQuestionInputRefs.current[inspectorFocusTarget.itemId];
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "faq-answer" &&
      selectedBlock.type === "faq" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = faqAnswerInputRefs.current[inspectorFocusTarget.itemId];
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "thread-subject" &&
      selectedBlock.type === "thread" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = threadSubjectInputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "links-heading" &&
      selectedBlock.type === "links" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = linksHeadingInputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "links-item-label" &&
      selectedBlock.type === "links" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = linksItemLabelInputRefs.current[inspectorFocusTarget.itemId];
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "links-item-url" &&
      selectedBlock.type === "links" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = linksItemUrlInputRefs.current[inspectorFocusTarget.itemId];
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "carousel-heading" &&
      selectedBlock.type === "image_carousel" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = carouselHeadingInputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "carousel-item-title" &&
      selectedBlock.type === "image_carousel" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el =
        carouselItemTitleInputRefs.current[inspectorFocusTarget.itemId];
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "carousel-item-subtitle" &&
      selectedBlock.type === "image_carousel" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el =
        carouselItemSubtitleInputRefs.current[inspectorFocusTarget.itemId];
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "carousel-item-href" &&
      selectedBlock.type === "image_carousel" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el =
        carouselItemHrefInputRefs.current[inspectorFocusTarget.itemId];
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }
  }, [inspectorFocusTarget, selectedBlock]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!openToolMenu) return;

      const target = event.target as Node | null;
      if (!target) return;

      const clickedInsideMenu = toolMenuRef.current?.contains(target);
      const clickedInsideBottomBar = bottomBarRef.current?.contains(target);

      if (clickedInsideMenu || clickedInsideBottomBar) return;

      setOpenToolMenu(null);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenToolMenu(null);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [openToolMenu]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();

      const isTypingTarget =
        tagName === "input" ||
        tagName === "textarea" ||
        target?.isContentEditable === true;

      if (isTypingTarget) return;
      if (!selectedCanvasBlockId) return;

      const amount = event.shiftKey ? 1 : 0.25;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        nudgeSelectedBlock("left", amount);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        nudgeSelectedBlock("right", amount);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        nudgeSelectedBlock("up", amount);
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        nudgeSelectedBlock("down", amount);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedCanvasBlockId, metadata]);

  useEffect(() => {
    if (isHistoryActionRef.current) {
      isHistoryActionRef.current = false;
      lastDraftRef.current = cloneDraft(draft);
      return;
    }

    const previous = JSON.stringify(lastDraftRef.current);
    const current = JSON.stringify(draft);

    if (previous !== current) {
      setUndoStack((prev) => [...prev, cloneDraft(lastDraftRef.current)]);
      setRedoStack([]);
      lastDraftRef.current = cloneDraft(draft);
    }
  }, [draft]);

function normalizeRichTextHtml(html?: string) {
  const value = String(html ?? "").trim();

  if (
    value === "" ||
    value === "<br>" ||
    value === "<p><br></p>" ||
    value === "<div><br></div>" ||
    value === "<ul><li><br></li></ul>" ||
    value === "<ol><li><br></li></ol>"
  ) {
    return "";
  }

  return html ?? "";
}

function isRichTextHtmlEmpty(html?: string) {
  return normalizeRichTextHtml(html) === "";
}

useEffect(() => {
  if (selectedBlock?.type !== "rich_text") return;

  const normalized = normalizeRichTextHtml(selectedBlock.data.content ?? "");
  setIsRichTextEditorEmpty(isRichTextHtmlEmpty(normalized));

  if (!richTextEditorRef.current) return;

  if (richTextEditorRef.current.innerHTML !== normalized) {
    richTextEditorRef.current.innerHTML = normalized;
  }
}, [
  selectedBlock?.id,
  selectedBlock?.type,
  selectedBlock?.type === "rich_text" ? selectedBlock.data.content : null,
]);

  function pushRecentColor(color: string) {
  if (!color) return;

  setRecentColors((prev) => {
    const normalized = color.toLowerCase();
    const next = [normalized, ...prev.filter((item) => item.toLowerCase() !== normalized)];
    return next.slice(0, 10);
  });
}

async function pickColorWithEyeDropper(
  onPick: (color: string) => void,
) {
  try {
    const EyeDropperCtor = (window as Window & {
      EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
    }).EyeDropper;

    if (!EyeDropperCtor) {
      alert("Eyedropper is not available in this browser.");
      return;
    }

    const eyeDropper = new EyeDropperCtor();
    const result = await eyeDropper.open();

    if (result?.sRGBHex) {
      onPick(result.sRGBHex);
      pushRecentColor(result.sRGBHex);
    }
  } catch {
    // user cancelled or browser blocked it
  }
}

function applyTextColor(value: string) {
  applyStylePatch({ color: value });
  pushRecentColor(value);
}

function withRichTextEditor(action: (editor: HTMLDivElement) => void) {
  const editor = richTextEditorRef.current;
  if (!editor || selectedBlock?.type !== "rich_text") return;

  editor.focus();
  action(editor);

  const normalized = normalizeRichTextHtml(editor.innerHTML);
  setIsRichTextEditorEmpty(isRichTextHtmlEmpty(normalized));

  updateSelectedBlock((block) =>
    block.type !== "rich_text"
      ? block
      : {
          ...block,
          data: {
            ...block.data,
            content: normalized,
          },
        },
  );
}

function normalizeRichTextLinkHref(value: string) {
  const raw = value.trim();

  if (!raw) return "";

  if (
    raw.startsWith("/") ||
    raw.startsWith("#") ||
    /^https?:\/\//i.test(raw) ||
    /^mailto:/i.test(raw) ||
    /^tel:/i.test(raw) ||
    raw.startsWith("//")
  ) {
    return raw;
  }

  return `//${raw}`;
}

function openRichTextLinkModal() {
  setRichTextLinkValue("https://");
  setRichTextLinkModalOpen(true);
}

function applyRichTextLinkFromModal() {
  const raw = richTextLinkValue.trim();
  if (!raw) {
    setRichTextLinkModalOpen(false);
    return;
  }

  const href = normalizeRichTextLinkHref(raw);

  withRichTextEditor((editor) => {
    document.execCommand("createLink", false, href);

    const anchors = editor.querySelectorAll("a");
    const lastAnchor = anchors[anchors.length - 1];

    if (lastAnchor) {
      lastAnchor.setAttribute("href", href);
      lastAnchor.setAttribute("target", "_blank");
      lastAnchor.setAttribute("rel", "noopener noreferrer");
      lastAnchor.setAttribute("data-raw-href", raw);
    }
  });

  setRichTextLinkModalOpen(false);
}

function clearRichTextEditor() {
  if (selectedBlock?.type !== "rich_text") return;

  if (richTextEditorRef.current) {
    richTextEditorRef.current.innerHTML = "";
  }

  setIsRichTextEditorEmpty(true);

  updateSelectedBlock((block) =>
    block.type !== "rich_text"
      ? block
      : {
          ...block,
          data: {
            ...block.data,
            content: "",
            listType: "none",
            linkUrl: "",
            style: {
              ...(block.data.style ?? {}),
              bold: false,
              italic: false,
              underline: false,
            },
          },
        },
  );
}

function applyPageTextBoxBackground(value: string) {
  applyPageTextBackgroundColor(value);
  pushRecentColor(value);
}

function applyFillColor(value: string) {
  applyAppearancePatch({ backgroundColor: value });
  pushRecentColor(value);
}

function recentColorButtonClass() {
  return "h-7 w-7 shrink-0 rounded-md border border-white/15 transition hover:scale-105";
}

function eyedropperButtonClass() {
  return "inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 px-2 text-xs text-white transition hover:bg-white/10";
}

function applyBorderColor(value: string) {
  applyAppearancePatch({ borderColor: value });
  pushRecentColor(value);
}

function openResetDraftModal() {
  setResetDraftModalOpen(true);
}

function confirmResetDraft() {
  const resetDraft = cloneDraft(initialDraftRef.current);

  isHistoryActionRef.current = true;
  setSelection(createEmptySelection());
  setOpenToolMenu(null);
  setRedoStack([]);
  setUndoStack([]);
  lastDraftRef.current = cloneDraft(resetDraft);
  setDraft(resetDraft);
  setResetDraftModalOpen(false);
}

function updatePageLength(value: PageLengthOption) {
  setDraft((prev) => ({
    ...(prev as DraftWithPageExtras),
    pageLength: value,
  }));
}

function cancelResetDraft() {
  setResetDraftModalOpen(false);
}

function applyStylePatch(patch: Partial<TextStyle>) {
  if (selectedBlock?.type === "text_fx") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "text_fx"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "cta") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "cta"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "thread") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "thread"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  fontSize: 30,
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "image_carousel") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "image_carousel"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "form_field") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "form_field"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "highlight") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "highlight"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "progress_bar") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "progress_bar"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "donation") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "donation"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "link_hub") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "link_hub"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "checklist") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "checklist"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "schedule_agenda") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "schedule_agenda"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "map_location") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "map_location"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "file_share") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "file_share"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "speed_dating") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "speed_dating"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "registry") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "registry"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

  if (selectedBlock?.type === "video") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "video"
          ? {
              ...block,
              data: {
                ...block.data,
                style: {
                  ...(block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

if (selectedBlock?.type === "rich_text") {
  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) =>
      block.id === selectedBlock.id && block.type === "rich_text"
        ? {
            ...block,
            data: {
              ...block.data,
              style: {
                ...(block.data.style ?? {}),
                ...patch,
              },
            },
          }
        : block,
    ),
  }));
  return;
}

if (selectedBlock?.type === "countdown") {
  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) =>
      block.id === selectedBlock.id && block.type === "countdown"
        ? {
            ...block,
            data: {
              ...block.data,
              style: {
                ...(block.data.style ?? {}),
                ...patch,
              },
            },
          }
        : block,
    ),
  }));
  return;
}

  setDraft((prev) => applyStylePatchToSelection(prev, selection, patch));
}

  function applyAppearancePatch(patch: AppearancePatch) {
    setDraft((prev) => applyAppearancePatchToSelection(prev, selection, patch));
  }

function applyPageTextBackgroundColor(value: string) {
  if (!selectedPageAppearanceKey) return;

  setDraft((prev) => {
    const next = prev as DraftWithPageExtras;

    return {
      ...prev,
      pageBlockAppearance: {
        ...(next.pageBlockAppearance ?? {}),
        [selectedPageAppearanceKey]: {
          ...(next.pageBlockAppearance?.[selectedPageAppearanceKey] ?? {}),
          backgroundColor: value,
        },
      },
    };
  });
}

function clearPageTextBackgroundColor() {
  if (!selectedPageAppearanceKey) return;

  setDraft((prev) => {
    const next = prev as DraftWithPageExtras;

    return {
      ...prev,
      pageBlockAppearance: {
        ...(next.pageBlockAppearance ?? {}),
        [selectedPageAppearanceKey]: {
          ...(next.pageBlockAppearance?.[selectedPageAppearanceKey] ?? {}),
          backgroundColor: "transparent",
        },
      },
    };
  });
}

function updatePageScale(value: number) {
  const nextValue = Math.max(25, Math.min(150, value));

  setDraft((prev) => ({
    ...(prev as DraftWithPageExtras),
    pageScale: nextValue,
  }));
}

function updateTextFx(
  patch: Partial<{
    mode: "straight" | "arch" | "dip" | "circle";
    intensity: number;
    rotation: number;
    opacity: number;
  }>,
) {
  if (!selectedBlock || selectedBlock.type !== "text_fx") return;

  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((b) =>
      b.id === selectedBlock.id && b.type === "text_fx"
        ? {
            ...b,
            data: {
              ...b.data,
              fx: {
                ...(b.data.fx ?? {}),
                ...patch,
              },
            },
          }
        : b,
    ),
  }));
}

function resetSelectedTextFx() {
  if (!selectedBlock || selectedBlock.type !== "text_fx") return;

  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((b) =>
      b.id === selectedBlock.id && b.type === "text_fx"
        ? {
            ...b,
            data: {
              ...b.data,
              style: {
                fontFamily: "Inter",
                fontSize: 32,
                bold: false,
                italic: false,
                underline: false,
                strike: false,
                align: "center",
                color: "#000000",
              },
              fx: {
                mode: "straight",
                intensity: 50,
                rotation: 0,
                opacity: 1,
              },
            },
            appearance: {
              ...b.appearance,
              backgroundColor: "transparent",
              borderColor: "#000000",
              borderWidth: 0,
              borderRadius: 0,
            },
          }
        : b,
    ),
  }));
}

function updateSelectedGrid(patch: {
  colStart?: number;
  rowStart?: number;
  colSpan?: number;
  rowSpan?: number;
}) {
  if (!selectedCanvasBlockId) return;

  setDraft((prev) => {
    const items = buildCanvasItems(prev, metadata);

    const isMoveOnly =
      (typeof patch.colStart === "number" ||
        typeof patch.rowStart === "number") &&
      typeof patch.colSpan !== "number" &&
      typeof patch.rowSpan !== "number";

    if (isMoveOnly) {
      const current = items.find((item) => item.id === selectedCanvasBlockId);
      if (!current?.grid) return prev;

      const updated = moveCanvasItemToCell(items, selectedCanvasBlockId, {
        colStart:
          typeof patch.colStart === "number"
            ? patch.colStart
            : Number(current.grid.colStart ?? 1),
        rowStart:
          typeof patch.rowStart === "number"
            ? patch.rowStart
            : Number(current.grid.rowStart ?? 1),
      });

      return applyCanvasItemsToDraft(prev, updated);
    }

    const updated = resizeCanvasItem(items, selectedCanvasBlockId, patch);
    return applyCanvasItemsToDraft(prev, updated);
  });
}

function updateTextByCanvasId(blockId: string, value: string) {
  if (blockId === PAGE_TITLE_BLOCK_ID) {
    setDraft((prev) => ({ ...prev, title: value }));
    return;
  }

  if (blockId === PAGE_SUBTITLE_BLOCK_ID) {
    setDraft((prev) => ({ ...prev, subtitle: value }));
    return;
  }

  if (blockId === PAGE_SUBTEXT_BLOCK_ID) {
    setDraft((prev) => ({ ...prev, subtext: value }));
    return;
  }

  if (blockId === PAGE_DESCRIPTION_BLOCK_ID) {
    setDraft((prev) => ({ ...prev, description: value }));
    return;
  }

  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) => {
      if (block.id !== blockId) {
        return block;
      }

      if (block.type === "label") {
        return {
          ...block,
          data: {
            ...block.data,
            text: value,
          },
        };
      }

      if (block.type === "text_fx") {
        return {
          ...block,
          data: {
            ...block.data,
            text: value,
          },
        };
      }

if (block.type === "cta") {
  return {
    ...block,
    data: {
      ...block.data,
      buttonText: value,
    },
  };
}

      return block;
    }),
  }));
}

function moveGalleryImage(
  blockId: string,
  imageId: string,
  direction: "up" | "down",
) {
  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) => {
      if (block.id !== blockId || block.type !== "gallery") return block;

      const index = block.data.images.findIndex((img) => img.id === imageId);
      if (index === -1) return block;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= block.data.images.length) {
        return block;
      }

      const nextImages = [...block.data.images];
      [nextImages[index], nextImages[targetIndex]] = [
        nextImages[targetIndex],
        nextImages[index],
      ];

      return {
        ...block,
        data: {
          ...block.data,
          images: nextImages,
        },
      };
    }),
  }));
}
  function updateSelectedBlock(
    updater: (block: MicrositeBlock) => MicrositeBlock,
  ) {
    if (!selectedBlock) return;

    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id ? updater(block) : block,
      ),
    }));
  }

function updateSelectedImagePatch(
  patch: Partial<{
    positionX: number;
    positionY: number;
    zoom: number;
    rotation: number;
    opacity: number;
  }>,
) {
  updateSelectedBlock((block) =>
    block.type !== "image"
      ? block
      : {
          ...block,
          data: {
            ...block.data,
            image: {
              ...block.data.image,
              ...patch,
            },
          },
        },
  );
}

function updateSelectedImageFadePatch(
  patch: Partial<{
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
    size: number;
  }>,
) {
  updateSelectedBlock((block) =>
    block.type !== "image"
      ? block
      : {
          ...block,
          data: {
            ...block.data,
            image: {
              ...block.data.image,
              fade: {
                top: block.data.image.fade?.top ?? false,
                bottom: block.data.image.fade?.bottom ?? false,
                left: block.data.image.fade?.left ?? false,
                right: block.data.image.fade?.right ?? false,
                size: block.data.image.fade?.size ?? 15,
                ...patch,
              },
            },
          },
        },
  );
}

  async function uploadPageBackgroundImage() {
  await openImagePicker({
    onSelect: async (files) => {
      const file = files[0];
      if (!file) return;

      const dataUrl = await readFileAsDataUrl(file);

      setDraft((prev) => ({
        ...(prev as DraftWithPageExtras),
        pageBackgroundImage: dataUrl,
        pageBackgroundImageFit:
          (prev as DraftWithPageExtras).pageBackgroundImageFit ?? "zoom",
      }));
    },
  });
}

async function readFileAsCompressedDataUrl(
  file: File,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    outputType?: "image/jpeg" | "image/webp";
  },
) {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.78,
    outputType = "image/jpeg",
  } = options || {};

  const originalDataUrl = await readFileAsDataUrl(file);

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image."));
    img.src = originalDataUrl;
  });

  let targetWidth = image.width;
  let targetHeight = image.height;

  const widthRatio = maxWidth / targetWidth;
  const heightRatio = maxHeight / targetHeight;
  const ratio = Math.min(widthRatio, heightRatio, 1);

  targetWidth = Math.max(1, Math.round(targetWidth * ratio));
  targetHeight = Math.max(1, Math.round(targetHeight * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to create image canvas.");
  }

  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

  return canvas.toDataURL(outputType, quality);
}

function estimateDataUrlBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] || "";
  return Math.ceil((base64.length * 3) / 4);
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${bytes} B`;
}

function clearPageBackgroundImage() {
  setDraft((prev) => ({
    ...(prev as DraftWithPageExtras),
    pageBackgroundImage: "",
  }));
}
function updatePageBackgroundImageFit(value: "clip" | "zoom" | "stretch") {
  setDraft((prev) => ({
    ...(prev as DraftWithPageExtras),
    pageBackgroundImageFit: value,
  }));
}

  async function openImagePicker(options: {
    multiple?: boolean;
    onSelect: (files: File[]) => Promise<void> | void;
  }) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = Boolean(options.multiple);
    input.click();

    input.onchange = async () => {
      const files = Array.from(input.files ?? []);
      if (!files.length) return;
      await options.onSelect(files);
    };
  }
async function uploadDroppedGalleryFiles(
  blockId: string,
  files: FileList | File[],
) {
  const MAX_FILES_PER_ADD = 8;
  const MAX_TOTAL_EMBED_BYTES = 8_500_000;

  const allImageFiles = Array.from(files).filter((file) =>
    file.type.startsWith("image/"),
  );

  const imageFiles = allImageFiles.slice(0, MAX_FILES_PER_ADD);

  if (!imageFiles.length) return;

  if (allImageFiles.length > MAX_FILES_PER_ADD) {
    window.alert(
      `Only the first ${MAX_FILES_PER_ADD} dropped images were added to keep the draft saveable.`,
    );
  }

  const images: GalleryImage[] = [];
  let totalBytes = 0;

  for (const file of imageFiles) {
    const compressedUrl = await readFileAsCompressedDataUrl(file, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.78,
      outputType: "image/jpeg",
    });

    const nextBytes = estimateDataUrlBytes(compressedUrl);

    if (totalBytes + nextBytes > MAX_TOTAL_EMBED_BYTES) {
      window.alert(
        `Some dropped gallery images were not added because they would make the draft too large to save.\n\nAdded so far: ${formatBytes(totalBytes)}\nNext image: ${formatBytes(nextBytes)}`,
      );
      break;
    }

    totalBytes += nextBytes;

    images.push({
      id: makeClientId("gallery"),
      url: compressedUrl,
    });
  }

  if (!images.length) return;

  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) => {
      if (block.id !== blockId || block.type !== "gallery") return block;

      return {
        ...block,
        data: {
          ...block.data,
          images: [...block.data.images, ...images],
        },
      };
    }),
  }));
}

  async function uploadImageToSelectedBlock(blockId: string) {
    await openImagePicker({
      onSelect: async (files) => {
        const file = files[0];
        if (!file) return;
        const dataUrl = await readFileAsDataUrl(file);

        setDraft((prev) => ({
          ...prev,
          blocks: prev.blocks.map((block) => {
            if (block.id !== blockId) return block;

            if (block.type === "image") {
              return {
                ...block,
                data: {
                  image: {
                    ...block.data.image,
                    url: dataUrl,
                    alt: file.name,
                  },
                },
              };
            }

            if (block.type === "listing") {
              return {
                ...block,
                data: {
                  ...block.data,
                  image: {
                    ...block.data.image,
                    url: dataUrl,
                    alt: file.name,
                  },
                },
              };
            }

            return block;
          }),
        }));
      },
    });
  }

async function uploadGalleryImagesToBlock(blockId: string) {
  await openImagePicker({
    multiple: true,
    onSelect: async (files) => {
      const MAX_FILES_PER_ADD = 8;
      const MAX_TOTAL_EMBED_BYTES = 8_500_000;

      const selectedFiles = files.slice(0, MAX_FILES_PER_ADD);

      if (files.length > MAX_FILES_PER_ADD) {
        window.alert(
          `You selected ${files.length} images. Only the first ${MAX_FILES_PER_ADD} were added to keep the draft saveable.`,
        );
      }

      const images: GalleryImage[] = [];
      let totalBytes = 0;

      for (const file of selectedFiles) {
        const compressedUrl = await readFileAsCompressedDataUrl(file, {
          maxWidth: 1600,
          maxHeight: 1600,
          quality: 0.78,
          outputType: "image/jpeg",
        });

        const nextBytes = estimateDataUrlBytes(compressedUrl);

        if (totalBytes + nextBytes > MAX_TOTAL_EMBED_BYTES) {
          window.alert(
            `Some gallery images were not added because they would make the draft too large to save.\n\nAdded so far: ${formatBytes(totalBytes)}\nNext image: ${formatBytes(nextBytes)}`,
          );
          break;
        }

        totalBytes += nextBytes;

        images.push({
          id: makeClientId("gallery"),
          url: compressedUrl,
        });
      }

      if (!images.length) return;

      setDraft((prev) => ({
        ...prev,
        blocks: prev.blocks.map((block) => {
          if (block.id !== blockId || block.type !== "gallery") return block;

          return {
            ...block,
            data: {
              ...block.data,
              images: [...block.data.images, ...images],
            },
          };
        }),
      }));
    },
  });
}

  async function uploadImageToCarouselItem(blockId: string, itemId: string) {
  await openImagePicker({
    onSelect: async (files) => {
      const file = files[0];
      if (!file) return;

      const dataUrl = await readFileAsDataUrl(file);

      setDraft((prev) => ({
        ...prev,
        blocks: updateImageCarouselItemField(
          prev.blocks,
          blockId,
          itemId,
          "imageUrl",
          dataUrl,
        ),
      }));
    },
  });
}

async function uploadMultipleImagesToCarousel(blockId: string) {
  await openImagePicker({
    multiple: true,
    onSelect: async (files) => {
      const newItems: CarouselImageItem[] = await Promise.all(
        files.map(async (file, index) => ({
          id: makeClientId("carouselitem"),
          imageUrl: await readFileAsDataUrl(file),
          title: `Slide ${index + 1}`,
          subtitle: "",
          href: "",
          openInNewTab: false,
          positionX: 50,
          positionY: 50,
          zoom: 1,
          rotation: 0,
        })),
      );

      setDraft((prev) => ({
        ...prev,
        blocks: prev.blocks.map((block) =>
          block.id === blockId && block.type === "image_carousel"
            ? {
                ...block,
                data: {
                  ...block.data,
                  items: [...block.data.items, ...newItems],
                },
              }
            : block,
        ),
      }));
    },
  });
}

  function addBlock(type: BuilderBlockType) {
    setDraft((prev) => ({
      ...prev,
      blocks: addBlockTypeToDraft(prev.blocks, type),
    }));
  }

  function addShape(type: ShapeType) {
    setDraft((prev) => ({
      ...prev,
      blocks: addShapeBlockToDraft(prev.blocks, type),
    }));
  }

  function addPageBlock(type: PageBlockType) {
    setDraft((prev) => {
      const next = prev as DraftWithPageExtras;
      const pageVisibility = { ...(next.pageVisibility ?? {}) };

      if (type === "title") pageVisibility.title = true;
      if (type === "subtitle") pageVisibility.subtitle = true;
      if (type === "tagline") pageVisibility.subtext = true;
      if (type === "description") pageVisibility.description = true;

      return {
        ...prev,
        pageVisibility,
      };
    });
  }

function handleDuplicateCanvasBlock(blockId: string) {
  if (isPageBlockId(blockId)) return;

  let duplicatedBlockId: string | null = null;

  setDraft((prev) => {
    const original = prev.blocks.find((b) => b.id === blockId);
    if (!original) return prev;

    const originalGrid = original.grid ?? {
      colStart: 1,
      rowStart: 1,
      colSpan: 4,
      rowSpan: 1,
      zIndex: 1,
    };

    duplicatedBlockId = `${original.type}_${Math.random().toString(36).slice(2, 8)}`;

    const newBlock: MicrositeBlock = {
      ...original,
      id: duplicatedBlockId,
      grid: {
        colStart: originalGrid.colStart,
        rowStart: originalGrid.rowStart + 1,
        colSpan: originalGrid.colSpan,
        rowSpan: originalGrid.rowSpan,
        zIndex: (originalGrid.zIndex ?? 1) + 1,
      },
    };

    return {
      ...prev,
      blocks: [...prev.blocks, newBlock],
    };
  });

  if (duplicatedBlockId) {
    setSelection(selectionFromCanvasBlockId(duplicatedBlockId));
  }
}

  function removeCanvasBlock(blockId: string) {
    if (blockId === PAGE_TITLE_BLOCK_ID) {
      setDraft((prev) => ({
        ...(prev as DraftWithPageExtras),
        pageVisibility: {
          ...((prev as DraftWithPageExtras).pageVisibility ?? {}),
          title: false,
        },
      }));
      return;
    }

    if (blockId === PAGE_SUBTITLE_BLOCK_ID) {
      setDraft((prev) => ({
        ...(prev as DraftWithPageExtras),
        pageVisibility: {
          ...((prev as DraftWithPageExtras).pageVisibility ?? {}),
          subtitle: false,
        },
      }));
      return;
    }

    if (blockId === PAGE_SUBTEXT_BLOCK_ID) {
      setDraft((prev) => ({
        ...(prev as DraftWithPageExtras),
        pageVisibility: {
          ...((prev as DraftWithPageExtras).pageVisibility ?? {}),
          subtext: false,
        },
      }));
      return;
    }

    if (blockId === PAGE_DESCRIPTION_BLOCK_ID) {
      setDraft((prev) => ({
        ...(prev as DraftWithPageExtras),
        pageVisibility: {
          ...((prev as DraftWithPageExtras).pageVisibility ?? {}),
          description: false,
        },
      }));
      return;
    }

    setDraft((prev) => ({
      ...prev,
      blocks: removeBlockFromDraft(prev.blocks, blockId),
    }));
  }

function removeAllBlocks() {
  setRemoveAllModalOpen(true);
}

function confirmRemoveAllBlocks() {
  setSelection(createEmptySelection());

  setDraft((prev) => ({
    ...(prev as DraftWithPageExtras),
    blocks: [],
    pageVisibility: {
      ...((prev as DraftWithPageExtras).pageVisibility ?? {}),
      title: false,
      subtitle: false,
      subtext: false,
      description: false,
    },
  }));

  setRemoveAllModalOpen(false);
}

function cancelRemoveAllBlocks() {
  setRemoveAllModalOpen(false);
}

  function handleMoveBlock(
    blockId: string,
    patch: { colStart: number; rowStart: number },
  ) {
    setDraft((prev) => {
      const items = buildCanvasItems(prev, metadata);
      const moved = moveCanvasItemToCell(items, blockId, patch);
      return applyCanvasItemsToDraft(prev, moved);
    });
  }
  function handleResizeBlock(
    blockId: string,
    patch: {
      colSpan?: number;
      rowSpan?: number;
      colStart?: number;
      rowStart?: number;
    },
  ) {
    setDraft((prev) => {
      const items = buildCanvasItems(prev, metadata);
      const resized = resizeCanvasItem(items, blockId, patch);
      return applyCanvasItemsToDraft(prev, resized);
    });
  }

  function handleBringToFront(blockId: string) {
    setDraft((prev) => {
      const items = buildCanvasItems(prev, metadata);
      const updated = bringCanvasItemToFront(items, blockId);
      return applyCanvasItemsToDraft(prev, updated);
    });
  }

  function handleSendToBack(blockId: string) {
    setDraft((prev) => {
      const items = buildCanvasItems(prev, metadata);
      const updated = sendCanvasItemToBack(items, blockId);
      return applyCanvasItemsToDraft(prev, updated);
    });
  }

  function handleCreateToolDrop(
  payload: ToolDropPayload,
  patch: {
    colStart: number;
    rowStart: number;
    colSpan: number;
    rowSpan: number;
  },
) {
  setSelection(createEmptySelection());
  setOpenToolMenu(null);

  if (payload.kind === "page") {
    setDraft((prev) => {
      const next = prev as DraftWithPageExtras;
      const pageVisibility = { ...(next.pageVisibility ?? {}) };
      const pageElements = { ...(next.pageElements ?? {}) };

      let createdPageId = "";

      if (payload.type === "title") {
        pageVisibility.title = true;
        pageElements.title = { ...patch };
        createdPageId = PAGE_TITLE_BLOCK_ID;
      }

      if (payload.type === "subtitle") {
        pageVisibility.subtitle = true;
        pageElements.subtitle = { ...patch };
        createdPageId = PAGE_SUBTITLE_BLOCK_ID;
      }

      if (payload.type === "tagline") {
        pageVisibility.subtext = true;
        pageElements.subtext = { ...patch };
        createdPageId = PAGE_SUBTEXT_BLOCK_ID;
      }

      if (payload.type === "description") {
        pageVisibility.description = true;
        pageElements.description = { ...patch };
        createdPageId = PAGE_DESCRIPTION_BLOCK_ID;
      }

      const nextDraft = {
        ...prev,
        pageVisibility,
        pageElements,
      };

      const items = buildCanvasItems(nextDraft, metadata);
      const updated = createdPageId
        ? bringCanvasItemToFront(items, createdPageId)
        : items;

      return applyCanvasItemsToDraft(nextDraft, updated);
    });

    if (payload.type === "title") {
      setSelection(selectionFromCanvasBlockId(PAGE_TITLE_BLOCK_ID));
    }
    if (payload.type === "subtitle") {
      setSelection(selectionFromCanvasBlockId(PAGE_SUBTITLE_BLOCK_ID));
    }
    if (payload.type === "tagline") {
      setSelection(selectionFromCanvasBlockId(PAGE_SUBTEXT_BLOCK_ID));
    }
    if (payload.type === "description") {
      setSelection(selectionFromCanvasBlockId(PAGE_DESCRIPTION_BLOCK_ID));
    }

    return;
  }

  if (payload.kind === "shape") {
    let createdShapeId = "";

    setDraft((prev) => {
      const nextBlocks = addShapeBlockToDraft(prev.blocks, payload.type);
      const nextDraft: BuilderDraft = {
        ...prev,
        blocks: nextBlocks,
      };

      const nextItems = buildCanvasItems(nextDraft, metadata);
      const createdItem = [...nextItems]
        .reverse()
        .find(
          (item) =>
            item.type === "shape" &&
            !prev.blocks.some((b) => b.id === item.id),
        );

      if (!createdItem) return nextDraft;

      createdShapeId = createdItem.id;

      const withSize = resizeCanvasItem(nextItems, createdItem.id, {
        colSpan: patch.colSpan,
        rowSpan: patch.rowSpan,
      });

      const withPosition = moveCanvasItemToCell(withSize, createdItem.id, {
        colStart: patch.colStart,
        rowStart: patch.rowStart,
      });

      const withFront = bringCanvasItemToFront(withPosition, createdItem.id);

      return applyCanvasItemsToDraft(nextDraft, withFront);
    });

    if (createdShapeId) {
      setSelection(selectionFromCanvasBlockId(createdShapeId));
    }

    return;
  }

  if (payload.kind === "block") {
    let createdBlockId = "";

    setDraft((prev) => {
      const nextBlocks = addBlockTypeToDraft(prev.blocks, payload.type);
      const nextDraft: BuilderDraft = {
        ...prev,
        blocks: nextBlocks,
      };

      const nextItems = buildCanvasItems(nextDraft, metadata);
      const createdItem = [...nextItems]
        .reverse()
        .find(
          (item) =>
            item.type === payload.type &&
            !prev.blocks.some((b) => b.id === item.id),
        );

      if (!createdItem) return nextDraft;

      createdBlockId = createdItem.id;

      const withSize = resizeCanvasItem(nextItems, createdItem.id, {
        colSpan: patch.colSpan,
        rowSpan: patch.rowSpan,
      });

      const withPosition = moveCanvasItemToCell(withSize, createdItem.id, {
        colStart: patch.colStart,
        rowStart: patch.rowStart,
      });

      const withFront = bringCanvasItemToFront(withPosition, createdItem.id);

      return applyCanvasItemsToDraft(nextDraft, withFront);
    });

    if (createdBlockId) {
      setSelection(selectionFromCanvasBlockId(createdBlockId));
    }
  }
}

  function handleCanvasSelect(
    nextSelection: ReturnType<typeof createEmptySelection>,
  ) {
    if ((nextSelection as any).type === "block") {
      setSelection(selectionFromCanvasBlockId((nextSelection as any).blockId));
      return;
    }

    setSelection(nextSelection);
  }

  async function handleAioClick() {
    if (!isTextSelection(selectedContext)) return;

    setAiLoading(true);
    setShowAiSuggestions(true);
    setAiSuggestions([]);

    try {
      const res = await fetch("/api/ai/text-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateKey,
          designKey,
          targetLabel: selectedContext.label,
          currentText: selectedTextValue,
        }),
      });

      const data = (await res.json()) as { suggestions?: string[] };
      setAiSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
    } catch {
      setAiSuggestions([]);
    } finally {
      setAiLoading(false);
    }
  }

  function applyAiSuggestion(value: string) {
    if (!selectedCanvasBlockId) return;
    updateTextByCanvasId(selectedCanvasBlockId, value);
    setShowAiSuggestions(false);
  }

  function zoomInCanvas() {
    setCanvasZoom((prev) => clampCanvasZoom(prev + CANVAS_ZOOM_STEP));
  }

  function zoomOutCanvas() {
    setCanvasZoom((prev) => clampCanvasZoom(prev - CANVAS_ZOOM_STEP));
  }

  function handleUndo() {
    if (!undoStack.length) return;

    const previousDraft = undoStack[undoStack.length - 1];

    isHistoryActionRef.current = true;
    setRedoStack((prevRedo) => [...prevRedo, cloneDraft(draft)]);
    setUndoStack((prevUndo) => prevUndo.slice(0, -1));
    setDraft(cloneDraft(previousDraft));
  }

  function handleRedo() {
    if (!redoStack.length) return;

    const nextDraft = redoStack[redoStack.length - 1];

    isHistoryActionRef.current = true;
    setUndoStack((prevUndo) => [...prevUndo, cloneDraft(draft)]);
    setRedoStack((prevRedo) => prevRedo.slice(0, -1));
    setDraft(cloneDraft(nextDraft));
  }

function openPreviewWindow() {
  const previewWindow = window.open(
    `/preview/draft?ts=${Date.now()}`,
    "_blank",
  );

  if (!previewWindow) return;

  const payload = {
    templateName: templateKey,
    designLayout: designKey,
    draft: cloneDraft(draft),
    updatedAt: new Date().toISOString(),
  };

  let previewReady = false;
  let previewConfirmed = false;

  const sendPayload = () => {
    if (previewWindow.closed || !previewReady || previewConfirmed) return;

    previewWindow.postMessage(
      {
        type: PREVIEW_MESSAGE_TYPE,
        payload,
      },
      window.location.origin,
    );

    try {
      previewWindow.focus();
    } catch {
      // ignore focus errors
    }
  };

  const cleanup = () => {
    window.removeEventListener("message", handlePreviewMessage);
    window.clearInterval(closedCheckTimer);
    window.clearInterval(retrySendTimer);
    window.clearTimeout(safetyTimeout);
  };

  const handlePreviewMessage = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    if (event.source !== previewWindow) return;

    const data = event.data as { type?: string } | undefined;
    if (!data?.type) return;

    if (data.type === PREVIEW_READY_MESSAGE_TYPE) {
      previewReady = true;
      sendPayload();
      return;
    }

    if (data.type === PREVIEW_RECEIVED_MESSAGE_TYPE) {
      previewConfirmed = true;
      cleanup();
    }
  };

  window.addEventListener("message", handlePreviewMessage);

  const retrySendTimer = window.setInterval(() => {
    if (previewWindow.closed || previewConfirmed) {
      cleanup();
      return;
    }

    sendPayload();
  }, 700);

  const closedCheckTimer = window.setInterval(() => {
    if (previewWindow.closed) {
      cleanup();
    }
  }, 500);

  const safetyTimeout = window.setTimeout(() => {
    cleanup();
  }, 15000);
}

  function focusInspectorForBlock(target: InspectorFocusTarget) {
    if (!target) return;
    setSelection(selectionFromCanvasBlockId(target.blockId));
    setInspectorFocusTarget(target);
  }

  function SpeedDatingCanvasPreview({
  block,
}: {
  block: Extract<MicrositeBlock, { type: "speed_dating" }>;
}) {
  const [round, setRound] = useState(0);

  const duration = Math.max(
    60,
    Math.min(1800, Number(block.data.roundDurationSeconds) || 120),
  );

  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setRound(0);
    setTimeLeft(duration);
  }, [block.id, duration]);

  useEffect(() => {
    if (duration <= 0) return;

    const timer = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setRound((r) => r + 1);
          return duration;
        }
        return t - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [duration]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

return (
  <div
    className="h-full w-full overflow-auto rounded-xl p-4"
    style={{
      backgroundColor:
        block.appearance?.backgroundColor &&
        block.appearance.backgroundColor !== "transparent"
          ? block.appearance.backgroundColor
          : "transparent",
      borderColor: block.appearance?.borderColor || undefined,
      borderWidth:
        typeof block.appearance?.borderWidth === "number"
          ? `${block.appearance.borderWidth}px`
          : undefined,
      borderStyle:
        typeof block.appearance?.borderWidth === "number" &&
        block.appearance.borderWidth > 0
          ? "solid"
          : undefined,
      borderRadius:
        typeof block.appearance?.borderRadius === "number"
          ? `${block.appearance.borderRadius}px`
          : undefined,
    }}
  >
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="truncate text-base font-semibold text-neutral-900">
          {block.data.heading || "Speed Dating"}
        </div>
        <div className="mt-1 text-xs text-neutral-500">
          Live matchmaking board
        </div>
      </div>

      <div className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600">
        Round {round + 1}
      </div>
    </div>

    {block.data.showTimer !== false && (
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Time Remaining
          </div>
          <div className="mt-1 text-3xl font-semibold text-neutral-900">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{
              width: `${((duration - timeLeft) / duration) * 100}%`,
            }}
          />
        </div>
      </div>
    )}
  </div>
);}

  function renderCanvasPreview(item: CanvasGridItem) {
    if (isPageBlockId(item.id)) {
  const textValue =
    item.id === PAGE_TITLE_BLOCK_ID
      ? draft.title || ""
      : item.id === PAGE_SUBTITLE_BLOCK_ID
        ? draft.subtitle || ""
        : item.id === PAGE_SUBTEXT_BLOCK_ID
          ? draft.subtext || ""
          : draft.description || "";

  const pageTextStyle =
    item.id === PAGE_TITLE_BLOCK_ID
      ? draft.titleStyle
      : item.id === PAGE_SUBTITLE_BLOCK_ID
        ? draft.subtitleStyle
        : item.id === PAGE_SUBTEXT_BLOCK_ID
          ? draft.subtextStyle
          : draft.descriptionStyle;

  const appearanceKey = getPageAppearanceKey(item.id);
  const pageBlockBg =
    appearanceKey &&
    (draft as DraftWithPageExtras).pageBlockAppearance?.[appearanceKey]
      ?.backgroundColor &&
    (draft as DraftWithPageExtras).pageBlockAppearance?.[appearanceKey]
      ?.backgroundColor !== "transparent"
      ? (draft as DraftWithPageExtras).pageBlockAppearance?.[appearanceKey]
          ?.backgroundColor
      : "transparent";

  return (
    <div
      className="h-full w-full p-3"
      style={{
        backgroundColor: pageBlockBg,
      }}
    >
      <textarea
        value={textValue}
        onChange={(e) => updateTextByCanvasId(item.id, e.target.value)}
        onClick={(e) => e.stopPropagation()}
        className="block h-full w-full resize-none bg-transparent outline-none"
        placeholder={item.label || item.type}
        style={{
          ...getInlineTextStyle(pageTextStyle),
          padding: 0,
          margin: 0,
          border: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

    const block = draft.blocks.find((b) => b.id === item.id);

    if (!block) {
      return <div className="text-xs uppercase text-white/60">{item.type}</div>;
    }

    if (block.type === "label") {
  return (
    <div
      className="h-full w-full p-2"
      style={{
        backgroundColor:
          block.appearance?.backgroundColor &&
          block.appearance.backgroundColor !== "transparent"
            ? block.appearance.backgroundColor
            : "transparent",
        borderColor: block.appearance?.borderColor || undefined,
        borderWidth:
          typeof block.appearance?.borderWidth === "number"
            ? `${block.appearance.borderWidth}px`
            : undefined,
        borderStyle:
          typeof block.appearance?.borderWidth === "number" &&
          block.appearance.borderWidth > 0
            ? "solid"
            : undefined,
        borderRadius:
          typeof block.appearance?.borderRadius === "number"
            ? `${block.appearance.borderRadius}px`
            : undefined,
      }}
    >
      <textarea
        value={block.data.text || ""}
        onChange={(e) => updateTextByCanvasId(block.id, e.target.value)}
        onClick={(e) => e.stopPropagation()}
        className="block h-full w-full resize-none bg-transparent outline-none"
        placeholder="Label"
        style={{
          ...getInlineTextStyle(block.data.style),
          padding: 0,
          margin: 0,
          border: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

if (block.type === "text_fx") {
  return (
    <div className="h-full w-full">
      <BlockRenderer block={block} designKey={designKey} />
    </div>
  );
}

    if (block.type === "image") {
      return block.data.image.url ? (
        <div
          className="h-full w-full"
          onDoubleClick={() => void uploadImageToSelectedBlock(block.id)}
          title="Double-click to replace image"
        >
          <BlockRenderer block={block} designKey={designKey} />
        </div>
      ) : (
        <ImageUploadDropzone
          label="Drag image here or click to browse"
          className="h-full w-full"
          onUploaded={(url) => {
            setDraft((prev) => ({
              ...prev,
              blocks: prev.blocks.map((item) =>
                item.id === block.id && item.type === "image"
                  ? {
                      ...item,
                      data: {
                        image: {
                          ...item.data.image,
                          url,
                        },
                      },
                    }
                  : item,
              ),
            }));
          }}
        />
      );
    }

if (block.type === "gallery") {
  return (
    <div
      className="h-full w-full"
      onDoubleClick={() => void uploadGalleryImagesToBlock(block.id)}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void uploadDroppedGalleryFiles(block.id, e.dataTransfer.files);
      }}
      title="Double-click or drag images here. Large gallery uploads are compressed to keep drafts saveable."
    >
      <BlockRenderer block={block} designKey={designKey} />
    </div>
  );
}

    if (block.type === "poll") {
      return (
        <div className="h-full w-full">
          <div
            className="h-full w-full rounded-xl border border-neutral-200 bg-neutral-50 p-4"
            style={{
              backgroundColor:
                block.appearance?.backgroundColor &&
                block.appearance.backgroundColor !== "transparent"
                  ? block.appearance.backgroundColor
                  : undefined,
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                focusInspectorForBlock({
                  type: "poll-question",
                  blockId: block.id,
                });
              }}
              className="block w-full text-left text-sm text-neutral-900"
              style={getInlineTextStyle(block.data.style)}
            >
              {block.data.question || "Your question here"}
            </button>

            <div className="mt-3 space-y-2">
              {block.data.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    focusInspectorForBlock({
                      type: "poll-option",
                      blockId: block.id,
                      optionId: option.id,
                    });
                  }}
                  className="block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left text-sm text-neutral-800"
                >
                  {option.text || "Option"}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (block.type === "rsvp") {
      return (
        <div className="h-full w-full">
          <div
            className="h-full w-full cursor-text"
            onClick={(e) => {
              e.stopPropagation();
              focusInspectorForBlock({
                type: "rsvp-heading",
                blockId: block.id,
              });
            }}
          >
            <BlockRenderer block={block} designKey={designKey} />
          </div>
        </div>
      );
    }

    if (block.type === "countdown") {
      return (
        <div className="h-full w-full">
          <div className="h-full w-full rounded-xl border border-transparent p-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                focusInspectorForBlock({
                  type: "countdown-heading",
                  blockId: block.id,
                });
              }}
              className="block w-full text-left"
            >
              <BlockRenderer block={block} designKey={designKey} />
            </button>
          </div>
        </div>
      );
    }

    if (block.type === "faq") {
      return (
        <div className="h-full w-full overflow-auto rounded-xl">
          <div className="space-y-2 p-2">
            {block.data.items.length ? (
              block.data.items.map((faqItem) => (
                <div
                  key={faqItem.id}
                  className="rounded-xl border border-neutral-200 bg-white/60 p-2"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      focusInspectorForBlock({
                        type: "faq-question",
                        blockId: block.id,
                        itemId: faqItem.id,
                      });
                    }}
                    className="block w-full text-left text-sm font-medium text-neutral-900"
                  >
                    {faqItem.question || "Question"}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      focusInspectorForBlock({
                        type: "faq-answer",
                        blockId: block.id,
                        itemId: faqItem.id,
                      });
                    }}
                    className="mt-2 block w-full text-left text-sm text-neutral-700"
                  >
                    {faqItem.answer || "Answer"}
                  </button>
                </div>
              ))
            ) : (
              <div
                className="h-full w-full cursor-text"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <BlockRenderer block={block} designKey={designKey} />
              </div>
            )}
          </div>
        </div>
      );
    }

    if (block.type === "thread") {
      return (
        <div
          className="h-full w-full cursor-text"
          onClick={(e) => {
            e.stopPropagation();
            focusInspectorForBlock({
              type: "thread-subject",
              blockId: block.id,
            });
          }}
        >
          <BlockRenderer block={block} designKey={designKey} />
        </div>
      );
    }

    if (block.type === "links") {
      return (
        <div className="h-full w-full overflow-auto rounded-xl p-2">
          {block.data.heading ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                focusInspectorForBlock({
                  type: "links-heading",
                  blockId: block.id,
                });
              }}
              className="mb-2 block w-full text-left text-sm font-medium text-neutral-900"
            >
              {block.data.heading}
            </button>
          ) : null}

          <div className="space-y-2">
            {block.data.items.map((linkItem) => (
              <div
                key={linkItem.id}
                className="rounded-xl border border-neutral-200 bg-white/70 p-2"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    focusInspectorForBlock({
                      type: "links-item-label",
                      blockId: block.id,
                      itemId: linkItem.id,
                    });
                  }}
                  className="block w-full text-left text-sm font-medium text-neutral-900"
                >
                  {linkItem.label || "Link"}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    focusInspectorForBlock({
                      type: "links-item-url",
                      blockId: block.id,
                      itemId: linkItem.id,
                    });
                  }}
                  className="mt-1 block w-full text-left text-xs text-neutral-600"
                >
                  {linkItem.url || "#"}
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === "image_carousel") {
  return (
    <div
      className="h-full w-full cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        focusInspectorForBlock({
          type: "carousel-heading",
          blockId: block.id,
        });
      }}
      title="Edit carousel in inspector"
    >
      <BlockRenderer block={block} designKey={designKey} />
    </div>
  );
}
    if (block.type === "form_field") {
      return (
        <div className="h-full w-full">
          <BlockRenderer block={block} designKey={designKey} />
        </div>
      );
    }

    if (block.type === "listing") {
      return block.data.image.url ? (
        <div
          className="h-full w-full"
          onDoubleClick={() => void uploadImageToSelectedBlock(block.id)}
          title="Double-click to replace listing image"
        >
          <BlockRenderer block={block} designKey={designKey} />
        </div>
      ) : (
        <ImageUploadDropzone
          label="Drag listing image here or click to browse"
          className="h-full w-full"
          onUploaded={(url) => {
            setDraft((prev) => ({
              ...prev,
              blocks: prev.blocks.map((item) =>
                item.id === block.id && item.type === "listing"
                  ? {
                      ...item,
                      data: {
                        ...item.data,
                        image: {
                          ...item.data.image,
                          url,
                        },
                      },
                    }
                  : item,
              ),
            }));
          }}
        />
      );
    }

    if (block.type === "cart") {
  return (
    <div className="h-full w-full">
      <BlockRenderer
        block={block}
        designKey={designKey}
      />
    </div>
  );
}

    if (block.type === "progress_bar") {
      const max = Math.max(1, block.data.max ?? 100);
      const value = Math.max(0, Math.min(block.data.value ?? 0, max));
      const percent = Math.round((value / max) * 100);

      return (
        <div
          className="h-full w-full rounded-xl p-4"
          style={{
            backgroundColor:
              block.appearance?.backgroundColor &&
              block.appearance.backgroundColor !== "transparent"
                ? block.appearance.backgroundColor
                : "transparent",
            borderColor: block.appearance?.borderColor || undefined,
            borderWidth:
              typeof block.appearance?.borderWidth === "number"
                ? `${block.appearance.borderWidth}px`
                : undefined,
            borderStyle:
              typeof block.appearance?.borderWidth === "number" &&
              block.appearance.borderWidth > 0
                ? "solid"
                : undefined,
            borderRadius:
              typeof block.appearance?.borderRadius === "number"
                ? `${block.appearance.borderRadius}px`
                : undefined,
          }}
        >
          <div
            className="mb-3 text-sm font-medium text-neutral-900"
            style={getInlineTextStyle(block.data.style)}
          >
            {block.data.heading || "Progress"}
          </div>

          <div className="h-4 w-full overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full rounded-full bg-neutral-900"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div
            className="mt-2 text-xs text-neutral-600"
            style={getInlineTextStyle(block.data.style)}
          >
            {block.data.showPercentage === false
              ? `${value} / ${max}`
              : `${percent}%`}
          </div>
        </div>
      );
    }

    if (block.type === "donation") {
      const goal = Math.max(1, block.data.goalAmount ?? 1);
      const current = Math.max(0, Math.min(block.data.currentAmount ?? 0, goal));
      const percent = Math.round((current / goal) * 100);

      return (
        <div
          className="h-full w-full rounded-xl p-4"
          style={{
            backgroundColor:
              block.appearance?.backgroundColor &&
              block.appearance.backgroundColor !== "transparent"
                ? block.appearance.backgroundColor
                : "transparent",
            borderColor: block.appearance?.borderColor || undefined,
            borderWidth:
              typeof block.appearance?.borderWidth === "number"
                ? `${block.appearance.borderWidth}px`
                : undefined,
            borderStyle:
              typeof block.appearance?.borderWidth === "number" &&
              block.appearance.borderWidth > 0
                ? "solid"
                : undefined,
            borderRadius:
              typeof block.appearance?.borderRadius === "number"
                ? `${block.appearance.borderRadius}px`
                : undefined,
          }}
        >
          <div
            className="text-base font-semibold text-neutral-900"
            style={getInlineTextStyle(block.data.style)}
          >
            {block.data.heading || "Support This Cause"}
          </div>

          {block.data.description ? (
            <div
              className="mt-2 text-sm text-neutral-600"
              style={getInlineTextStyle(block.data.style)}
            >
              {block.data.description}
            </div>
          ) : null}

          <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full rounded-full bg-neutral-900"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div
            className="mt-2 text-xs text-neutral-600"
            style={getInlineTextStyle(block.data.style)}
          >
            ${current} raised of ${goal}
          </div>

          <div className="mt-4">
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-900 bg-neutral-900 px-4 text-sm font-medium text-white"
              onClick={(e) => e.stopPropagation()}
            >
              {block.data.buttonText || "Donate"}
            </button>
          </div>
        </div>
      );
    }

    if (block.type === "link_hub") {
      return (
        <div
          className="h-full w-full rounded-xl p-4"
          style={{
            backgroundColor:
              block.appearance?.backgroundColor &&
              block.appearance.backgroundColor !== "transparent"
                ? block.appearance.backgroundColor
                : "transparent",
            borderColor: block.appearance?.borderColor || undefined,
            borderWidth:
              typeof block.appearance?.borderWidth === "number"
                ? `${block.appearance.borderWidth}px`
                : undefined,
            borderStyle:
              typeof block.appearance?.borderWidth === "number" &&
              block.appearance.borderWidth > 0
                ? "solid"
                : undefined,
            borderRadius:
              typeof block.appearance?.borderRadius === "number"
                ? `${block.appearance.borderRadius}px`
                : undefined,
          }}
        >
          <div
            className="mb-3 text-base font-semibold text-neutral-900"
            style={getInlineTextStyle(block.data.style)}
          >
            {block.data.heading || "My Links"}
          </div>

          <div className="space-y-2">
            {block.data.items.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2"
              >
                <div
                  className="text-sm font-medium text-neutral-900"
                  style={getInlineTextStyle(block.data.style)}
                >
                  {item.label || "Link"}
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  {item.url || "#"}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === "checklist") {
      return (
        <div
          className="h-full w-full rounded-xl p-4"
          style={{
            backgroundColor:
              block.appearance?.backgroundColor &&
              block.appearance.backgroundColor !== "transparent"
                ? block.appearance.backgroundColor
                : "transparent",
            borderColor: block.appearance?.borderColor || undefined,
            borderWidth:
              typeof block.appearance?.borderWidth === "number"
                ? `${block.appearance.borderWidth}px`
                : undefined,
            borderStyle:
              typeof block.appearance?.borderWidth === "number" &&
              block.appearance.borderWidth > 0
                ? "solid"
                : undefined,
            borderRadius:
              typeof block.appearance?.borderRadius === "number"
                ? `${block.appearance.borderRadius}px`
                : undefined,
          }}
        >
          <div
            className="mb-3 text-base font-semibold text-neutral-900"
            style={getInlineTextStyle(block.data.style)}
          >
            {block.data.heading || "Checklist"}
          </div>

          <div className="space-y-2">
            {block.data.items.slice(0, 5).map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={Boolean(item.checked)}
                  readOnly
                />
                <span
                  className="text-sm text-neutral-900"
                  style={getInlineTextStyle(block.data.style)}
                >
                  {item.label || "Checklist item"}
                </span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === "schedule_agenda") {
      return (
        <div
          className="h-full w-full rounded-xl p-4"
          style={{
            backgroundColor:
              block.appearance?.backgroundColor &&
              block.appearance.backgroundColor !== "transparent"
                ? block.appearance.backgroundColor
                : "transparent",
            borderColor: block.appearance?.borderColor || undefined,
            borderWidth:
              typeof block.appearance?.borderWidth === "number"
                ? `${block.appearance.borderWidth}px`
                : undefined,
            borderStyle:
              typeof block.appearance?.borderWidth === "number" &&
              block.appearance.borderWidth > 0
                ? "solid"
                : undefined,
            borderRadius:
              typeof block.appearance?.borderRadius === "number"
                ? `${block.appearance.borderRadius}px`
                : undefined,
          }}
        >
          <div
            className="mb-3 text-base font-semibold text-neutral-900"
            style={getInlineTextStyle(block.data.style)}
          >
            {block.data.heading || "Schedule"}
          </div>

          <div className="space-y-2">
            {block.data.items.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2"
              >
                <div className="text-xs text-neutral-500">
                  {item.time || "Time"}
                </div>
                <div
                  className="text-sm font-medium text-neutral-900"
                  style={getInlineTextStyle(block.data.style)}
                >
                  {item.title || "Event"}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === "map_location") {
      return (
        <div
          className="h-full w-full rounded-xl p-4"
          style={{
            backgroundColor:
              block.appearance?.backgroundColor &&
              block.appearance.backgroundColor !== "transparent"
                ? block.appearance.backgroundColor
                : "transparent",
            borderColor: block.appearance?.borderColor || undefined,
            borderWidth:
              typeof block.appearance?.borderWidth === "number"
                ? `${block.appearance.borderWidth}px`
                : undefined,
            borderStyle:
              typeof block.appearance?.borderWidth === "number" &&
              block.appearance.borderWidth > 0
                ? "solid"
                : undefined,
            borderRadius:
              typeof block.appearance?.borderRadius === "number"
                ? `${block.appearance.borderRadius}px`
                : undefined,
          }}
        >
          <div
            className="mb-3 text-base font-semibold text-neutral-900"
            style={getInlineTextStyle(block.data.style)}
          >
            {block.data.heading || "Location"}
          </div>

          <div className="flex h-40 w-full items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-sm text-neutral-500">
            Map Preview
          </div>

          <div className="mt-2 text-xs text-neutral-500">
            {block.data.address || "Enter address"}
          </div>
        </div>
      );
    }

    if (block.type === "file_share") {
      return (
        <div
          className="h-full w-full rounded-xl p-4"
          style={{
            backgroundColor:
              block.appearance?.backgroundColor &&
              block.appearance.backgroundColor !== "transparent"
                ? block.appearance.backgroundColor
                : "transparent",
            borderColor: block.appearance?.borderColor || undefined,
            borderWidth:
              typeof block.appearance?.borderWidth === "number"
                ? `${block.appearance.borderWidth}px`
                : undefined,
            borderStyle:
              typeof block.appearance?.borderWidth === "number" &&
              block.appearance.borderWidth > 0
                ? "solid"
                : undefined,
            borderRadius:
              typeof block.appearance?.borderRadius === "number"
                ? `${block.appearance.borderRadius}px`
                : undefined,
          }}
        >
          <div
            className="mb-3 text-base font-semibold text-neutral-900"
            style={getInlineTextStyle(block.data.style)}
          >
            {block.data.heading || "File Share"}
          </div>

          {block.data.subtext ? (
            <div
              className="mb-3 text-sm text-neutral-600"
              style={getInlineTextStyle(block.data.style)}
            >
              {block.data.subtext}
            </div>
          ) : null}

          <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-500">
            Upload / download area
          </div>

          <div className="mt-3 space-y-1 text-xs text-neutral-500">
            <div>
              Public upload: {block.data.allowPublicUpload ? "On" : "Off"}
            </div>
            <div>
              Access code: {block.data.requireAccessCode ? "Required" : "Not required"}
            </div>
          </div>
        </div>
      );
    }

if (block.type === "speed_dating") {
  return <SpeedDatingCanvasPreview block={block} />;
}

if (block.type === "registry") {
  return (
    <div
      className="h-full w-full rounded-xl p-4 overflow-auto"
      style={{
        backgroundColor:
          block.appearance?.backgroundColor &&
          block.appearance.backgroundColor !== "transparent"
            ? block.appearance.backgroundColor
            : "transparent",
        borderColor: block.appearance?.borderColor || undefined,
        borderWidth:
          typeof block.appearance?.borderWidth === "number"
            ? `${block.appearance.borderWidth}px`
            : undefined,
        borderStyle:
          typeof block.appearance?.borderWidth === "number" &&
          block.appearance.borderWidth > 0
            ? "solid"
            : undefined,
        borderRadius:
          typeof block.appearance?.borderRadius === "number"
            ? `${block.appearance.borderRadius}px`
            : undefined,
      }}
    >
      <div
        className="mb-3 text-base font-semibold text-neutral-900"
        style={getInlineTextStyle(block.data.style)}
      >
        {block.data.heading || "Gift Registry"}
      </div>

      {block.data.description ? (
        <div
          className="mb-3 text-sm text-neutral-600"
          style={getInlineTextStyle(block.data.style)}
        >
          {block.data.description}
        </div>
      ) : null}

      <div className="space-y-2">
        {(block.data.items ?? []).length ? (
          (block.data.items ?? []).slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-3"
            >
              <div
                className="text-sm font-medium text-neutral-900"
                style={getInlineTextStyle(block.data.style)}
              >
                {item.label || "Registry Item"}
              </div>

              {(item.store || item.price) ? (
                <div className="mt-1 text-xs text-neutral-500">
                  {[item.store, item.price].filter(Boolean).join(" • ")}
                </div>
              ) : null}

              {item.note ? (
                <div className="mt-2 text-xs text-neutral-600 line-clamp-3">
                  {item.note}
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-sm text-neutral-500">
            Add registry items in the inspector.
          </div>
        )}
      </div>
    </div>
  );
}

if (block.type === "video") {
      return (
        <div
          className="h-full w-full rounded-xl overflow-hidden"
          style={{
            backgroundColor:
              block.appearance?.backgroundColor &&
              block.appearance.backgroundColor !== "transparent"
                ? block.appearance.backgroundColor
                : "#000",
            borderColor: block.appearance?.borderColor || undefined,
            borderWidth:
              typeof block.appearance?.borderWidth === "number"
                ? `${block.appearance.borderWidth}px`
                : undefined,
            borderStyle:
              typeof block.appearance?.borderWidth === "number" &&
              block.appearance.borderWidth > 0
                ? "solid"
                : undefined,
            borderRadius:
              typeof block.appearance?.borderRadius === "number"
                ? `${block.appearance.borderRadius}px`
                : undefined,
          }}
        >
          {block.data.title ? (
            <div
              className="px-3 py-2 text-sm font-semibold text-white"
              style={getInlineTextStyle(block.data.style)}
            >
              {block.data.title}
            </div>
          ) : null}

          {block.data.videoUrl ? (
            <iframe
              src={`${block.data.videoUrl}${
                block.data.videoUrl.includes("?") ? "&" : "?"
              }autoplay=${block.data.autoplay ? 1 : 0}&mute=${
                block.data.muted ? 1 : 0
              }&loop=${block.data.loop ? 1 : 0}&controls=${
                block.data.showControls ? 1 : 0
              }`}
              className="h-full w-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
              Add video URL
            </div>
          )}
        </div>
      );
    }

if (block.type === "rich_text") {
  const richTextStyle = getInlineTextStyle(block.data.style);

  return (
    <div
      className="h-full w-full rounded-xl overflow-auto"
      onClick={(e) => {
        e.stopPropagation();

        const container = e.currentTarget;
        const editor = container.querySelector(
          `[data-canvas-rich-text="${block.id}"]`,
        ) as HTMLDivElement | null;

        if (!editor) return;

        editor.focus();

        const clickedInsideEditor = editor.contains(e.target as Node);

        if (!clickedInsideEditor) {
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(editor);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).isContentEditable) {
          e.stopPropagation();
        }
      }}
      style={{
        backgroundColor:
          block.appearance?.backgroundColor &&
          block.appearance.backgroundColor !== "transparent"
            ? block.appearance.backgroundColor
            : "transparent",
        borderColor: block.appearance?.borderColor || undefined,
        borderWidth:
          typeof block.appearance?.borderWidth === "number"
            ? `${block.appearance.borderWidth}px`
            : undefined,
        borderStyle:
          typeof block.appearance?.borderWidth === "number" &&
          block.appearance.borderWidth > 0
            ? "solid"
            : undefined,
        borderRadius:
          typeof block.appearance?.borderRadius === "number"
            ? `${block.appearance.borderRadius}px`
            : undefined,
      }}
    >
      <div className="h-full w-full p-4">
        {block.data.title ? (
          <div
            className="mb-2 text-lg font-semibold text-neutral-900"
            style={richTextStyle}
          >
            {block.data.title}
          </div>
        ) : null}

        <div
          data-canvas-rich-text={block.id}
          contentEditable
          suppressContentEditableWarning
          className="min-h-full text-sm text-neutral-800 whitespace-pre-wrap outline-none"
          style={richTextStyle}
          onClick={(e) => e.stopPropagation()}
          onInput={(e) => {
            const html = e.currentTarget.innerHTML;

            updateSelectedBlock((currentBlock) =>
              currentBlock.type !== "rich_text"
                ? currentBlock
                : {
                    ...currentBlock,
                    data: {
                      ...currentBlock.data,
                      content: html,
                    },
                  },
            );
          }}
          onBlur={(e) => {
            const html = e.currentTarget.innerHTML;

            updateSelectedBlock((currentBlock) =>
              currentBlock.type !== "rich_text"
                ? currentBlock
                : {
                    ...currentBlock,
                    data: {
                      ...currentBlock.data,
                      content: html,
                    },
                  },
            );
          }}
          dangerouslySetInnerHTML={{
            __html: block.data.content || "",
          }}
        />
      </div>
    </div>
  );
}

    return <BlockRenderer block={block} designKey={designKey} />;
  }

  const scrollbarWidth = getGridCanvasScrollableWidth();

  const toolSetItems = canvasItems.map((item) => ({
  id: item.id,
  label: item.label || item.type,
  kind: isPageBlockId(item.id) ? "page" : item.type,
}));

function toggleToolMenu(category: BottomCategory) {
  setActiveCategory(category);
  setOpenToolMenu((prev) => (prev === category ? null : category));
}

function nudgeSelectedBlock(
  direction: "left" | "right" | "up" | "down",
  amount: number = 0.25,
) {
  if (!selectedCanvasBlockId) return;

  setDraft((prev) => {
    const items = buildCanvasItems(prev, metadata);
    const selectedItem = items.find((item) => item.id === selectedCanvasBlockId);

    if (!selectedItem?.grid) return prev;

    const currentColStart = selectedItem.grid.colStart ?? 1;
    const currentRowStart = selectedItem.grid.rowStart ?? 1;

    const nextColStart =
      direction === "left"
        ? currentColStart - amount
        : direction === "right"
          ? currentColStart + amount
          : currentColStart;

    const nextRowStart =
      direction === "up"
        ? currentRowStart - amount
        : direction === "down"
          ? currentRowStart + amount
          : currentRowStart;

    const moved = moveCanvasItemToCell(items, selectedCanvasBlockId, {
      colStart: nextColStart,
      rowStart: nextRowStart,
    });

    return applyCanvasItemsToDraft(prev, moved);
  });
}

return (
<div className="flex min-h-screen flex-col bg-[#f3f3f3]">
    <div className="border-b border-black/10 bg-white px-6 py-3">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
        Editing
      </div>
      <div className="mt-1 text-2xl font-semibold text-neutral-900">
        {currentSiteName}
      </div>
      <div className="mt-1 text-sm text-neutral-500">
        {currentSiteDisplay}
      </div>
    </div>

<div className="sticky top-0 z-[100] w-full bg-[#809cd4] shadow-md">

<div
  ref={topBarScrollRef}
    className="sticky top-0 z-[101] flex w-full items-center justify-between gap-4 overflow-x-auto overflow-y-hidden bg-[#2f3541] px-2 py-2 shadow-md"
>
  <div className="flex items-center justify-between gap-4">
    <div className="sticky left-0 z-20 flex min-w-max items-center gap-2 bg-[#2f3541] py-1 pr-4">
      <button
        type="button"
        className={topBarButtonClass(false, canvasZoom <= MIN_CANVAS_ZOOM)}
        onClick={zoomOutCanvas}
        disabled={canvasZoom <= MIN_CANVAS_ZOOM}
        title="Zoom out canvas"
      >
        <Image
          src="/icons/zoom_out_icon.png"
          alt="Zoom Out"
          width={30}
          height={30}
          className="pointer-events-none h-[30px] w-[30px] object-contain"
        />
      </button>

      <button
        type="button"
        className={topBarButtonClass(false, canvasZoom >= MAX_CANVAS_ZOOM)}
        onClick={zoomInCanvas}
        disabled={canvasZoom >= MAX_CANVAS_ZOOM}
        title="Zoom in canvas"
      >
        <Image
          src="/icons/zoom_in_icon.png"
          alt="Zoom In"
          width={30}
          height={30}
          className="pointer-events-none h-[30px] w-[30px] object-contain"
        />
      </button>

      <div className={infoPillClass()}>{canvasZoom}%</div>

      <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

      <button
        type="button"
        className={topBarButtonClass(false, undoStack.length === 0)}
        title="Undo"
        onClick={handleUndo}
        disabled={undoStack.length === 0}

          >
            <Image
              src="/icons/icon_main_undo.png"
              alt="Undo"
              width={16}
              height={16}
              className="pointer-events-none h-5 w-5 object-contain"
            />
          </button>

      <button
        type="button"
        className={topBarButtonClass(false, redoStack.length === 0)}
        title="Redo"
        onClick={handleRedo}
        disabled={redoStack.length === 0}
          >
            <Image
              src="/icons/icon_main_redo.png"
              alt="Redo"
              width={16}
              height={16}
              className="pointer-events-none h-5 w-5 object-contain"
            />
          </button>

      <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

<button
  type="button"
  onClick={openResetDraftModal}
  className={topBarButtonClass(false, false, true)}
  title="Reset Draft"
>
  <Image
    src="/icons/reset_draft_icon.png"
    alt="Reset Draft"
    width={30}
    height={30}
    className="pointer-events-none h-[30px] w-[30px] object-contain"
  />
</button>

      <button
        type="button"
        className={topBarButtonClass(false, false, true)}
        onClick={removeAllBlocks}
        title="Remove all blocks"
      >
        <Image
          src="/icons/remove_all_icon.png"
          alt="Remove All"
          width={30}
          height={30}
          className="pointer-events-none h-[30px] w-[30px] object-contain"
        />
      </button>

      <button
  type="button"
  className={topBarButtonClass(showGridLines)}
  onClick={() => setShowGridLines((prev) => !prev)}
  title={showGridLines ? "Hide gridlines" : "Show gridlines"}
>
  <Image
    src="/icons/icon_gridlines.png"
    alt="Gridlines"
    width={24}
    height={24}
          className="pointer-events-none h-[30px] w-[30px] object-contain"
  />
</button>

      <button
        type="button"
        className={topBarButtonClass(false)}
        onClick={() => void uploadPageBackgroundImage()}
        title="Set page background image"
      >
        <Image
          src="/icons/add_background_image_icon.png"
          alt="Background Image"
          width={30}
          height={30}
          className="pointer-events-none h-[30px] w-[30px] object-contain"
        />
      </button>

      <button
        type="button"
        className={topBarButtonClass(
          !(draft as DraftWithPageExtras).pageBackgroundImage,
          !(draft as DraftWithPageExtras).pageBackgroundImage,
        )}
        onClick={clearPageBackgroundImage}
        disabled={!(draft as DraftWithPageExtras).pageBackgroundImage}
        title="Clear page background image"
      >
        <Image
          src="/icons/remove_background_image_icon.png"
          alt="Clear Background Image"
          width={30}
          height={30}
          className="pointer-events-none h-[30px] w-[30px] object-contain"
        />
      </button>

<select
  value={selectedPageLength}
  onChange={(e) => updatePageLength(e.target.value as PageLengthOption)}
  className={topBarFieldClass("w-[90px]")}
  title="Page length"
>
  <option value="1200">1200px</option>
  <option value="1800">1800px</option>
  <option value="2400">2400px</option>
  <option value="3200">3200px</option>
  <option value="4000">4000px</option>
  <option value="5600">5600px</option>
</select>

<div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

<input
  type="color"
  value={
    (draft as DraftWithPageExtras).pageColor ||
    resolvedPageColor ||
    "#ffffff"
  }
  onChange={(e) =>
    setDraft((prev) => ({
      ...(prev as DraftWithPageExtras),
      pageColor: e.target.value,
    }))
  }
  className={topBarColorClass(false)}
  title="Page color"
/>

      <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

      <div className={infoPillClass()}>{selectedContext.label}</div>

      {isTextSelection(selectedContext) ? (
        <button
          type="button"
          className={topBarButtonClass(false)}
          onClick={handleAioClick}
          title="Artificial Intelligent Output"
        >
          <Image
            src="/icons/icon_wand_aio.png"
            alt="AIO"
            width={36}
            height={36}
            className="h-[36px] w-[36px] object-contain"
          />
        </button>
      ) : null}

      {isTextFxSelected ? (
        <>
          <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />
{selectedBlock?.type === "cta" ? (
  <>
    <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

    <select
      value={selectedBlock.data.styleType ?? "solid"}
      onChange={(e) =>
        updateSelectedBlock((block) =>
          block.type !== "cta"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  styleType: e.target.value as "solid" | "outline" | "soft",
                },
              },
        )
      }
      className={topBarFieldClass("w-[110px]")}
      title="Button style"
    >
      <option value="solid">Solid</option>
      <option value="outline">Outline</option>
      <option value="soft">Soft</option>
    </select>
  </>
) : null}
          {/* Straight */}
          <button
            type="button"
            className={topBarButtonClass(
              selectedTextFxBlock?.data.fx?.mode === "straight",
            )}
            onClick={() => updateTextFx({ mode: "straight" })}
            title="Straight"
          >
            <Image
              src="/icons/fx_straight_icon.png"
              alt="Straight"
              width={20}
              height={20}
              className="object-contain"
            />
          </button>

          {/* Arch */}
          <button
            type="button"
            className={topBarButtonClass(
              selectedTextFxBlock?.data.fx?.mode === "arch",
            )}
            onClick={() => updateTextFx({ mode: "arch" })}
            title="Arch"
          >
            <Image
              src="/icons/fx_arch_icon.png"
              alt="Arch"
              width={20}
              height={20}
              className="object-contain"
            />
          </button>

          {/* Dip */}
          <button
            type="button"
            className={topBarButtonClass(
              selectedTextFxBlock?.data.fx?.mode === "dip",
            )}
            onClick={() => updateTextFx({ mode: "dip" })}
            title="Dip"
          >
            <Image
              src="/icons/fx_dip_icon.png"
              alt="Dip"
              width={20}
              height={20}
              className="object-contain"
            />
          </button>

          {/* Circle */}
          <button
            type="button"
            className={topBarButtonClass(
              selectedTextFxBlock?.data.fx?.mode === "circle",
            )}
            onClick={() => updateTextFx({ mode: "circle" })}
            title="Circle"
          >
            <Image
              src="/icons/fx_circle_icon.png"
              alt="Circle"
              width={20}
              height={20}
              className="object-contain"
            />
          </button>

          <button
            type="button"
            className={topBarButtonClass(false)}
            onClick={resetSelectedTextFx}
            title="Reset TextFX"
          >
            <Image
              src="/icons/fx_reset_icon.png"
              alt="Reset"
              width={20}
              height={20}
              className="object-contain"
            />
          </button>

          <div className={topBarSliderWrapClass()}>
            <span>Curve</span>
            <input
              type="range"
              min={0}
              max={100}
              value={selectedTextFxBlock?.data.fx?.intensity ?? 50}
              onChange={(e) =>
                updateTextFx({ intensity: Number(e.target.value) })
              }
              className={topBarSliderClass()}
              title="Curve intensity"
            />
            <span>{selectedTextFxBlock?.data.fx?.intensity ?? 50}</span>
          </div>

          <div className={topBarSliderWrapClass()}>
            <span>Rotate</span>
            <input
              type="range"
              min={-180}
              max={180}
              value={selectedTextFxBlock?.data.fx?.rotation ?? 0}
              onChange={(e) =>
                updateTextFx({ rotation: Number(e.target.value) })
              }
              className={topBarSliderClass()}
              title="Rotation"
            />
            <span>{selectedTextFxBlock?.data.fx?.rotation ?? 0}°</span>
          </div>

          <div className={topBarSliderWrapClass()}>
            <span>Opacity</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(
                (selectedTextFxBlock?.data.fx?.opacity ?? 1) * 100,
              )}
              onChange={(e) =>
                updateTextFx({ opacity: Number(e.target.value) / 100 })
              }
              className={topBarSliderClass()}
              title="Opacity"
            />
            <span>
              {Math.round(
                (selectedTextFxBlock?.data.fx?.opacity ?? 1) * 100,
              )}
              %
            </span>
          </div>
        </>
      ) : null}

      {selectedBlock?.type === "cta" ? (
        <>
          <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

          <select
            value={selectedBlock.data.styleType ?? "solid"}
            onChange={(e) =>
              updateSelectedBlock((block) =>
                block.type !== "cta"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        styleType: e.target.value as "solid" | "outline" | "soft",
                      },
                    },
              )
            }
            className={topBarFieldClass("w-[110px]")}
            title="Button style"
          >
            <option value="solid">Solid</option>
            <option value="outline">Outline</option>
            <option value="soft">Soft</option>
          </select>
        </>
      ) : null}

      {showTextControls ? (
        <>
          <div className="mx-1 h-8 w-px shrink-0 bg-white/15" />

          <button
            type="button"
            className={topBarButtonClass(selectedBold)}
            onClick={() => applyStylePatch({ bold: !selectedBold })}
            title="Bold"

          >
            <Image
              src="/icons/icon_main_bold.png"
              alt="Bold"
              width={24}
              height={24}
              className="pointer-events-none h-5 w-5 object-contain"
            />
          </button>

          <button
            type="button"
            className={topBarButtonClass(selectedItalic)}
            onClick={() => applyStylePatch({ italic: !selectedItalic })}
            title="Italic"

          >
            <Image
              src="/icons/icon_main_italic.png"
              alt="Italic"
              width={24}
              height={24}
              className="pointer-events-none h-5 w-5 object-contain"
            />
          </button>

          <button
            type="button"
            className={topBarButtonClass(selectedUnderline)}
            onClick={() => applyStylePatch({ underline: !selectedUnderline })}
            title="Underline"

          >
            <Image
              src="/icons/icon_main_underline.png"
              alt="Underline"
              width={24}
              height={24}
              className="pointer-events-none h-5 w-5 object-contain"
            />
          </button>

          <button
            type="button"
            className={topBarButtonClass(selectedStrike)}
            onClick={() => applyStylePatch({ strike: !selectedStrike })}
            title="Strikethrough"

          >
            <Image
              src="/icons/icon_main_strikethrough.png"
              alt="Strikethrough"
              width={24}
              height={24}
              className="pointer-events-none h-5 w-5 object-contain"
            />
          </button>

          <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

          <button
            type="button"
            className={topBarButtonClass(false)}
            onClick={() => applyStylePatch({ align: "left" })}
            title="Align left"
            
          >
            <Image
              src="/icons/icon_main_left_align.png"
              alt="Align left"
              width={16}
              height={16}
              className="pointer-events-none h-5 w-5 object-contain"
            />
          </button>

          <button
            type="button"
            className={topBarButtonClass(false)}
            onClick={() => applyStylePatch({ align: "center" })}
            title="Align center"
            
          >
            <Image
              src="/icons/icon_main_center_align.png"
              alt="Align center"
              width={16}
              height={16}
              className="pointer-events-none h-5 w-5 object-contain"
            />
          </button>

          <button
            type="button"
            className={topBarButtonClass(false)}
            onClick={() => applyStylePatch({ align: "right" })}
            title="Align right"
            
          >
            <Image
              src="/icons/icon_main_right_align.png"
              alt="Align right"
              width={16}
              height={16}
              className="pointer-events-none h-5 w-5 object-contain"
            />
          </button>

          <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

          <select
            value={selectedStyle.fontFamily ?? "inherit"}
            onChange={(e) =>
              applyStylePatch({ fontFamily: e.target.value })
            }
            className={topBarFieldClass("min-w-[160px]")}
            title="Font family"
            style={{
              fontFamily: resolveFontFamily(
                selectedStyle.fontFamily ?? "inherit",
              ),
            }}
          >
            {FONT_FAMILY_OPTIONS.map((font) => (
              <option
                key={font}
                value={font}
                style={{
                  fontFamily: resolveFontFamily(font),
                }}
              >
                {font}
              </option>
            ))}
          </select>

          <input
            type="number"
            min={8}
            max={480}
            value={selectedStyle.fontSize ?? 16}
            onChange={(e) =>
              applyStylePatch({
                fontSize: Math.max(
                  8,
                  Math.min(480, Number(e.target.value) || 16),
                ),
              })
            }
            className={topBarFieldClass("w-16")}
            title="Font size"
          />

          <input
            type="color"
            value={selectedStyle.color ?? "#111827"}
            onChange={(e) => applyTextColor(e.target.value)}
            className={topBarColorClass(false)}
            title="Text color"
          />

          <button
            type="button"
            className={eyedropperButtonClass()}
            onClick={() =>
              void pickColorWithEyeDropper((color) => {
                applyTextColor(color);
              })
            }
            title="Pick text color from screen"
          >
            <Image
              src="/icons/pick_color_icon.png"
              alt="Pick Color"
              width={20}
              height={20}
              className="pointer-events-none object-contain"
            />
          </button>

          {selectedContext.kind === "pageText" ? (
            <>
              <input
                type="color"
                value={
                  selectedPageBackgroundColor === "transparent"
                    ? "#ffffff"
                    : selectedPageBackgroundColor
                }
                onChange={(e) => applyPageTextBoxBackground(e.target.value)}
                className={topBarColorClass(false)}
                title="Text box background color"
              />

              <button
                type="button"
                className={eyedropperButtonClass()}
                onClick={() =>
                  void pickColorWithEyeDropper((color) => {
                    applyPageTextBoxBackground(color);
                  })
                }
                title="Pick text box background color from screen"
              >
                <Image
                  src="/icons/pick_color_icon.png"
                  alt="Pick Color"
                  width={20}
                  height={20}
                  className="pointer-events-none object-contain"
                />
              </button>

              <button
                type="button"
                className={topBarButtonClass(
                  selectedPageBackgroundColor === "transparent",
                )}
                onClick={clearPageTextBackgroundColor}
                title="Transparent text box background"
              >
                ☐
              </button>
            </>
          ) : null}

          {selectedBlock?.type === "thread" ? (
            <>
              <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

              <div className={topBarSliderWrapClass()}>
                <span>Visible</span>
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={selectedBlock.data.maxVisibleMessages ?? 4}
                  onChange={(e) =>
                    updateSelectedBlock((block) =>
                      block.type !== "thread"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              maxVisibleMessages: Math.max(
                                1,
                                Math.min(8, Number(e.target.value) || 4),
                              ),
                            },
                          },
                    )
                  }
                  className={topBarSliderClass()}
                  title="Max visible messages"
                />
                <span>{selectedBlock.data.maxVisibleMessages ?? 4}</span>
              </div>
            </>
          ) : null}
        </>
      ) : null}

      {selectedBlock?.type === "image" ? (
        <>
          <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

          <select
            value={selectedBlock.data.image.fitMode ?? "zoom"}
            onChange={(e) =>
              updateSelectedBlock((block) =>
                block.type !== "image"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        image: {
                          ...block.data.image,
                          fitMode: e.target.value as "clip" | "stretch" | "zoom",
                        },
                      },
                    },
              )
            }
            className={topBarFieldClass("w-[120px]")}
            title="Image fit mode"
          >
            <option value="clip">Clip</option>
            <option value="zoom">Zoom</option>
            <option value="stretch">Stretch</option>
          </select>

          <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

          <button
            type="button"
            className={topBarButtonClass(
              (selectedBlock.data.image.frame ?? "square") === "square",
            )}
            onClick={() =>
              updateSelectedBlock((block) =>
                block.type !== "image"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        image: {
                          ...block.data.image,
                          frame: "square",
                        },
                      },
                    },
              )
            }
            title="Square frame"
          >
            <Image
              src="/icons/square_icon.png"
              alt="Square"
              width={18}
              height={18}
              className="pointer-events-none"
            />
          </button>

          <button
            type="button"
            className={topBarButtonClass(
              (selectedBlock.data.image.frame ?? "square") === "circle",
            )}
            onClick={() =>
              updateSelectedBlock((block) =>
                block.type !== "image"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        image: {
                          ...block.data.image,
                          frame: "circle",
                        },
                      },
                    },
              )
            }
            title="Circle / Oval frame"
          >
            <Image
              src="/icons/circle_icon.png"
              alt="Circle"
              width={18}
              height={18}
              className="pointer-events-none"
            />
          </button>

          <button
            type="button"
            className={topBarButtonClass(
              (selectedBlock.data.image.frame ?? "square") === "diamond",
            )}
            onClick={() =>
              updateSelectedBlock((block) =>
                block.type !== "image"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        image: {
                          ...block.data.image,
                          frame: "diamond",
                        },
                      },
                    },
              )
            }
            title="Diamond frame"
          >
            <Image
              src="/icons/diamond_icon.png"
              alt="Diamond"
              width={18}
              height={18}
              className="pointer-events-none"
            />
          </button>

          <button
            type="button"
            className={topBarButtonClass(
              (selectedBlock.data.image.frame ?? "square") === "heart",
            )}
            onClick={() =>
              updateSelectedBlock((block) =>
                block.type !== "image"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        image: {
                          ...block.data.image,
                          frame: "heart",
                        },
                      },
                    },
              )
            }
            title="Heart frame"
          >
            <Image
              src="/icons/heart_icon.png"
              alt="Heart"
              width={18}
              height={18}
              className="pointer-events-none"
            />
          </button>

          <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

          <div className={topBarSliderWrapClass()}>
            <span>X</span>
            <input
              type="range"
              min={0}
              max={100}
              value={selectedBlock.data.image.positionX ?? 50}
              onChange={(e) =>
                updateSelectedImagePatch({
                  positionX: Number(e.target.value),
                })
              }
              className={topBarSliderClass()}
              title="Image horizontal position"
            />
          </div>

          <div className={topBarSliderWrapClass()}>
            <span>Y</span>
            <input
              type="range"
              min={0}
              max={100}
              value={selectedBlock.data.image.positionY ?? 50}
              onChange={(e) =>
                updateSelectedImagePatch({
                  positionY: Number(e.target.value),
                })
              }
              className={topBarSliderClass()}
              title="Image vertical position"
            />
          </div>

          <div className={topBarSliderWrapClass()}>
            <span>Zoom</span>
            <input
              type="range"
              min={50}
              max={300}
              value={Math.round((selectedBlock.data.image.zoom ?? 1) * 100)}
              onChange={(e) =>
                updateSelectedImagePatch({
                  zoom: Number(e.target.value) / 100,
                })
              }
              className={topBarSliderClass()}
              title="Image zoom"
            />
          </div>

          <div className={topBarSliderWrapClass()}>
            <span>Rotate</span>
            <input
              type="range"
              min={-180}
              max={180}
              value={selectedBlock.data.image.rotation ?? 0}
              onChange={(e) =>
                updateSelectedImagePatch({
                  rotation: Number(e.target.value),
                })
              }
              className={topBarSliderClass()}
              title="Image rotation"
            />
          </div>

          <div className={topBarSliderWrapClass()}>
            <span>Opacity</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round((selectedBlock.data.image.opacity ?? 1) * 100)}
              onChange={(e) =>
                updateSelectedImagePatch({
                  opacity: Number(e.target.value) / 100,
                })
              }
              className={topBarSliderClass()}
              title="Image opacity"
            />
            <span>{Math.round((selectedBlock.data.image.opacity ?? 1) * 100)}%</span>
          </div>

          <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

          <button
            type="button"
            className={topBarButtonClass(Boolean(selectedBlock.data.image.fade?.top))}
            onClick={() =>
              updateSelectedImageFadePatch({
                top: !(selectedBlock.data.image.fade?.top ?? false),
              })
            }
            title="Fade top edge"
          >
            Top
          </button>

          <button
            type="button"
            className={topBarButtonClass(Boolean(selectedBlock.data.image.fade?.bottom))}
            onClick={() =>
              updateSelectedImageFadePatch({
                bottom: !(selectedBlock.data.image.fade?.bottom ?? false),
              })
            }
            title="Fade bottom edge"
          >
            Bottom
          </button>

          <button
            type="button"
            className={topBarButtonClass(Boolean(selectedBlock.data.image.fade?.left))}
            onClick={() =>
              updateSelectedImageFadePatch({
                left: !(selectedBlock.data.image.fade?.left ?? false),
              })
            }
            title="Fade left edge"
          >
            Left
          </button>

          <button
            type="button"
            className={topBarButtonClass(Boolean(selectedBlock.data.image.fade?.right))}
            onClick={() =>
              updateSelectedImageFadePatch({
                right: !(selectedBlock.data.image.fade?.right ?? false),
              })
            }
            title="Fade right edge"
          >
            Right
          </button>

          <div className={topBarSliderWrapClass()}>
            <span>Fade</span>
            <input
              type="range"
              min={0}
              max={50}
              value={selectedBlock.data.image.fade?.size ?? 15}
              onChange={(e) =>
                updateSelectedImageFadePatch({
                  size: Number(e.target.value),
                })
              }
              className={topBarSliderClass()}
              title="Fade size"
            />
            <span>{selectedBlock.data.image.fade?.size ?? 15}%</span>
          </div>
        </>
      ) : null}

      {showAppearanceControls ? (
        <>
          <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

          <input
            type="color"
            value={selectedAppearance.backgroundColor ?? "#ffffff"}
            onChange={(e) => applyFillColor(e.target.value)}
            className={topBarColorClass(false)}
            title="Fill color"
          />

          <button
            type="button"
            className={eyedropperButtonClass()}
            onClick={() =>
              void pickColorWithEyeDropper((color) => {
                applyFillColor(color);
              })
            }
            title="Pick fill color from screen"
          >
            <Image
              src="/icons/pick_color_icon.png"
              alt="Pick Color"
              width={20}
              height={20}
              className="pointer-events-none object-contain"
            />
          </button>

          <button
            type="button"
            className={topBarButtonClass(false)}
            onClick={() =>
              applyAppearancePatch({ backgroundColor: "transparent" })
            }
            title="Transparent fill"
          >
            <Image
              src="/icons/transparent_fill_icon.png"
              alt="Transparent fill"
              width={20}
              height={20}
              className="pointer-events-none object-contain"
            />
          </button>

          <input
            type="color"
            value={selectedAppearance.borderColor ?? "#d1d5db"}
            onChange={(e) => applyBorderColor(e.target.value)}
            className={topBarColorClass(false)}
            title="Border color"
          />

          <button
            type="button"
            className={eyedropperButtonClass()}
            onClick={() =>
              void pickColorWithEyeDropper((color) => {
                applyBorderColor(color);
              })
            }
            title="Pick border color from screen"
          >
            <Image
              src="/icons/pick_color_icon.png"
              alt="Pick Color"
              width={20}
              height={20}
              className="pointer-events-none object-contain"
            />
          </button>

          {showBorderWidthRadiusControls ? (
            <>
              <div className={topBarSliderWrapClass()}>
                <span>Border</span>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={selectedAppearance.borderWidth ?? 0}
                  onChange={(e) =>
                    applyAppearancePatch({
                      borderWidth: Number(e.target.value) || 0,
                    })
                  }
                  className={topBarSliderClass()}
                  title="Border width"
                />
                <span>{selectedAppearance.borderWidth ?? 0}</span>
              </div>

              <div className={topBarSliderWrapClass()}>
                <span>Radius</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={selectedAppearance.borderRadius ?? 0}
                  onChange={(e) =>
                    applyAppearancePatch({
                      borderRadius: Number(e.target.value) || 0,
                    })
                  }
                  className={topBarSliderClass()}
                  title="Corner radius"
                />
                <span>{selectedAppearance.borderRadius ?? 0}</span>
              </div>
            </>
          ) : null}

          {recentColors.length ? (
            <>
              <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/70">Recent</span>
                <div className="flex items-center gap-1">
                  {recentColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={recentColorButtonClass()}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        applyFillColor(color);
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  </div>
</div>

<AppModal
  open={showAiSuggestions}
    title={`Suggestions for ${selectedContext.label}`}
    description="Artificial Intelligent Output"
    confirmText="Close"
    cancelText="Cancel"
    loading={aiLoading}
    onConfirm={() => setShowAiSuggestions(false)}
    onCancel={() => setShowAiSuggestions(false)}
  >
    <div className="mt-4">
      {aiLoading ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-600">
          Generating suggestions...
        </div>
      ) : aiSuggestions.length ? (
        <div className="space-y-3">
          {aiSuggestions.map((suggestion, index) => (
            <button
              key={`${suggestion}-${index}`}
              type="button"
              onClick={() => applyAiSuggestion(suggestion)}
              className="block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left text-sm text-neutral-900 hover:bg-neutral-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-600">
          No suggestions available.
        </div>
      )}
    </div>
  </AppModal>
</div>

<div className="flex-1 px-6 py-5">
  <button
    type="button"
    className="fixed right-0 top-24 z-[65] flex h-16 w-7 items-center justify-center rounded-l-xl border border-r-0 border-neutral-300 bg-white text-neutral-600 shadow-sm transition hover:bg-neutral-50"
    onClick={() => setInspectorCollapsed((prev) => !prev)}
    title={inspectorCollapsed ? "Expand inspector" : "Collapse inspector"}
  >
    {inspectorCollapsed ? "◀" : "▶"}
  </button>

  <div
    className={`grid items-start gap-5 ${
      inspectorCollapsed
        ? "xl:grid-cols-[minmax(0,1fr)]"
        : "xl:grid-cols-[minmax(0,1fr)_340px]"
    }`}
  >
    <div
      className={`${getCanvasShellClass(designKey)} h-[calc(100vh-185px)] overflow-y-auto`}
    >
<div className="flex w-full justify-center overflow-auto px-4 py-4">
<div
  className="origin-top w-full rounded-[8px]"
  style={{
    transform: `scale(${canvasZoom / 100})`,
    transformOrigin: "top center",
    width: `${100 / (canvasZoom / 100)}%`,
  }}
>
        <div
          style={{
            width: "100%",
            minWidth: 0,
          }}
        >
<GridCanvas
  blocks={canvasItems}
  selection={selection as any}
  onSelect={handleCanvasSelect as any}
  onMoveBlock={handleMoveBlock}
  onResizeBlock={handleResizeBlock}
  onBringToFront={handleBringToFront}
  onRemoveBlock={removeCanvasBlock}
  onDuplicateBlock={handleDuplicateCanvasBlock}
  onCreateToolDrop={handleCreateToolDrop}
  renderBlockPreview={renderCanvasPreview}
  isItemSelected={(blockId, nextSelection) =>
    isCanvasBlockSelected(nextSelection as any, blockId)
  }
  dockedScrollRef={dockedScrollRef}
  showGridLines={showGridLines}
  pageSurfaceStyle={{
    ...pageSurfaceStyle,
    height: `${getPageLengthPx(selectedPageLength)}px`,
    minWidth: `${getGridCanvasScrollableWidth()}px`,
    width: `${getGridCanvasScrollableWidth()}px`,
  }}
/>
        </div>
        </div>
      </div>
    </div>

          {!inspectorCollapsed ? (
            <div className="h-[calc(100vh-185px)] overflow-y-auto pr-2">
              <div className="space-y-4">
                <div className={inspectorCardClass()}>
                  <div className={inspectorLabelClass()}>Inspector</div>
                  <div className="mt-3 text-lg font-semibold text-neutral-900">
                    {selectedContext.label}
                  </div>
                  <div className="mt-1 text-sm text-neutral-500">
                    {selectedContext.kind === "none"
                      ? "Select a block to edit its settings."
                      : "Live properties for the selected canvas item."}
                  </div>
                </div>

                {selectedCanvasItem ? (
                  <div className={inspectorCardClass()}>
                    <div className={inspectorLabelClass()}>Position & Size</div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <div className={inspectorLabelClass()}>X</div>
                        <input
                          type="number"
                          step="0.25"
                          value={selectedCanvasItem.grid?.colStart ?? 1}
                          onChange={(e) =>
                            updateSelectedGrid({
                              colStart: Number(e.target.value) || 1,
                            })
                          }
                          className={inspectorInputClass()}
                        />
                      </div>

                      <div>
                        <div className={inspectorLabelClass()}>Y</div>
                        <input
                          type="number"
                          step="0.25"
                          value={selectedCanvasItem.grid?.rowStart ?? 1}
                          onChange={(e) =>
                            updateSelectedGrid({
                              rowStart: Number(e.target.value) || 1,
                            })
                          }
                          className={inspectorInputClass()}
                        />
                      </div>

                      <div>
                        <div className={inspectorLabelClass()}>Width</div>
                        <input
                          type="number"
                          step="0.25"
                          value={selectedCanvasItem.grid?.colSpan ?? 1}
                          onChange={(e) =>
                            updateSelectedGrid({
                              colSpan: Number(e.target.value) || 1,
                            })
                          }
                          className={inspectorInputClass()}
                        />
                      </div>

                      <div>
                        <div className={inspectorLabelClass()}>Height</div>
                        <input
                          type="number"
                          step="0.25"
                          value={selectedCanvasItem.grid?.rowSpan ?? 1}
                          onChange={(e) =>
                            updateSelectedGrid({
                              rowSpan: Number(e.target.value) || 1,
                            })
                          }
                          className={inspectorInputClass()}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

{showTextControls ? (
  <>
  {(
  selectedContext.kind === "pageText" ||
  selectedContext.kind === "label" ||
  selectedContext.kind === "textFx"
) ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Text</div>
    <textarea
      value={selectedTextValue}
      onChange={(e) =>
        updateTextByCanvasId(selectedContext.blockId, e.target.value)
      }
      className={inspectorTextareaClass()}
      placeholder="Enter text..."
    />
  </div>
) : null}

    {selectedTextFxBlock ? (
      <div className={inspectorCardClass()}>
        <div className={inspectorLabelClass()}>TextFX Controls</div>

        <div className="mt-4 grid grid-cols-1 gap-4">
          <div>
            <div className={inspectorLabelClass()}>Curve</div>
            <input
              type="number"
              min={0}
              max={100}
              value={selectedTextFxBlock.data.fx?.intensity ?? 50}
              onChange={(e) =>
                updateTextFx({
                  intensity: Math.max(
                    0,
                    Math.min(100, Number(e.target.value) || 0),
                  ),
                })
              }
              className={inspectorInputClass()}
            />
          </div>

          <div>
            <div className={inspectorLabelClass()}>Rotate</div>
            <input
              type="number"
              min={-180}
              max={180}
              value={selectedTextFxBlock.data.fx?.rotation ?? 0}
              onChange={(e) =>
                updateTextFx({
                  rotation: Math.max(
                    -180,
                    Math.min(180, Number(e.target.value) || 0),
                  ),
                })
              }
              className={inspectorInputClass()}
            />
          </div>

          <div>
            <div className={inspectorLabelClass()}>Opacity (%)</div>
            <input
              type="number"
              min={0}
              max={100}
              value={Math.round(
                (selectedTextFxBlock.data.fx?.opacity ?? 1) * 100,
              )}
              onChange={(e) =>
                updateTextFx({
                  opacity:
                    Math.max(
                      0,
                      Math.min(100, Number(e.target.value) || 0),
                    ) / 100,
                })
              }
              className={inspectorInputClass()}
            />
          </div>
        </div>
      </div>
    ) : null}
  </>
) : null}

                {selectedBlock?.type === "poll" ? (
                  <div id="inspector-poll" className={inspectorCardClass()}>
                    <div className={inspectorLabelClass()}>Poll</div>

                    <div>
                      <div className={inspectorLabelClass()}>Question</div>
                      <textarea
                        ref={pollQuestionInputRef}
                        value={selectedBlock.data.question}
                        onChange={(e) =>
                          updateSelectedBlock((block) =>
                            block.type !== "poll"
                              ? block
                              : {
                                  ...block,
                                  data: {
                                    ...block.data,
                                    question: e.target.value,
                                  },
                                },
                          )
                        }
                        className={inspectorTextareaClass()}
                      />
                    </div>

                    <div className="mt-4 space-y-3">
                      {selectedBlock.data.options.map((option: PollOption) => (
                        <div
                          key={option.id}
                          className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
                        >
                          <input
                            ref={(el) => {
                              pollOptionInputRefs.current[option.id] = el;
                            }}
                            type="text"
                            value={option.text}
                            onChange={(e) =>
                              updateSelectedBlock((block) =>
                                block.type !== "poll"
                                  ? block
                                  : {
                                      ...block,
                                      data: {
                                        ...block.data,
                                        options: block.data.options.map((item) =>
                                          item.id === option.id
                                            ? { ...item, text: e.target.value }
                                            : item,
                                        ),
                                      },
                                    },
                              )
                            }
                            className={inspectorInputClass()}
                          />
                        </div>
                      ))}

                      <button
                        type="button"
                        className={toolSetButtonClass("front")}
                        onClick={() =>
                          updateSelectedBlock((block) =>
                            block.type !== "poll"
                              ? block
                              : {
                                  ...block,
                                  data: {
                                    ...block.data,
                                    options: [
                                      ...block.data.options,
                                      {
                                        id: makeClientId("opt"),
                                        text: "New option",
                                      },
                                    ],
                                  },
                                },
                          )
                        }
                      >
                        Add Option
                      </button>
                    </div>
                  </div>
                ) : null}

                {selectedBlock?.type === "rsvp" ? (
                  <div id="inspector-rsvp" className={inspectorCardClass()}>
                    <div className={inspectorLabelClass()}>RSVP</div>

                    <div className="mt-4">
                      <div className={inspectorLabelClass()}>Heading</div>
                      <input
                        ref={rsvpHeadingInputRef}
                        type="text"
                        value={selectedBlock.data.heading}
                        onChange={(e) =>
                          updateSelectedBlock((block) =>
                            block.type !== "rsvp"
                              ? block
                              : {
                                  ...block,
                                  data: {
                                    ...block.data,
                                    heading: e.target.value,
                                  },
                                },
                          )
                        }
                        className={inspectorInputClass()}
                      />
                    </div>

                    

                    <div className="mt-4 grid grid-cols-1 gap-3">
                      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                        <input
                          type="checkbox"
                          checked={selectedBlock.data.collectName}
                          onChange={(e) =>
                            updateSelectedBlock((block) =>
                              block.type !== "rsvp"
                                ? block
                                : {
                                    ...block,
                                    data: {
                                      ...block.data,
                                      collectName: e.target.checked,
                                    },
                                  },
                            )
                          }
                        />
                        Collect name
                      </label>

                      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                        <input
                          type="checkbox"
                          checked={selectedBlock.data.collectEmail}
                          onChange={(e) =>
                            updateSelectedBlock((block) =>
                              block.type !== "rsvp"
                                ? block
                                : {
                                    ...block,
                                    data: {
                                      ...block.data,
                                      collectEmail: e.target.checked,
                                    },
                                  },
                            )
                          }
                        />
                        Collect email
                      </label>

                      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                        <input
                          type="checkbox"
                          checked={Boolean(selectedBlock.data.collectPhone)}
                          onChange={(e) =>
                            updateSelectedBlock((block) =>
                              block.type !== "rsvp"
                                ? block
                                : {
                                    ...block,
                                    data: {
                                      ...block.data,
                                      collectPhone: e.target.checked,
                                    },
                                  },
                            )
                          }
                        />
                        Collect phone
                      </label>

                      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                        <input
                          type="checkbox"
                          checked={Boolean(selectedBlock.data.collectGuestCount)}
                          onChange={(e) =>
                            updateSelectedBlock((block) =>
                              block.type !== "rsvp"
                                ? block
                                : {
                                    ...block,
                                    data: {
                                      ...block.data,
                                      collectGuestCount: e.target.checked,
                                    },
                                  },
                            )
                          }
                        />
                        Collect guest count
                      </label>

                      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                        <input
                          type="checkbox"
                          checked={Boolean(selectedBlock.data.collectNotes)}
                          onChange={(e) =>
                            updateSelectedBlock((block) =>
                              block.type !== "rsvp"
                                ? block
                                : {
                                    ...block,
                                    data: {
                                      ...block.data,
                                      collectNotes: e.target.checked,
                                    },
                                  },
                            )
                          }
                        />
                        Collect notes
                      </label>
                    </div>
                  </div>
                ) : null}

{selectedBlock?.type === "form_field" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Form Field</div>

    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className={inspectorLabelClass()}>Label</div>
        <label className="flex items-center gap-2 text-xs text-neutral-600">
          <input
            type="checkbox"
            checked={selectedBlock.data.showLabel !== false}
            onChange={(e) =>
              updateSelectedBlock((block) =>
                block.type !== "form_field"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        showLabel: e.target.checked,
                      },
                    },
              )
            }
          />
          Show
        </label>
      </div>

      <input
        type="text"
        value={selectedBlock.data.label}
        onChange={(e) =>
          setDraft((prev) => ({
            ...prev,
            blocks: updateFormField(
              prev.blocks,
              selectedBlock.id,
              "label",
              e.target.value,
            ),
          }))
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className={inspectorLabelClass()}>Placeholder</div>
        <label className="flex items-center gap-2 text-xs text-neutral-600">
          <input
            type="checkbox"
            checked={selectedBlock.data.showPlaceholder !== false}
            onChange={(e) =>
              updateSelectedBlock((block) =>
                block.type !== "form_field"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        showPlaceholder: e.target.checked,
                      },
                    },
              )
            }
          />
          Show
        </label>
      </div>

      <input
        type="text"
        value={selectedBlock.data.placeholder}
        onChange={(e) =>
          setDraft((prev) => ({
            ...prev,
            blocks: updateFormField(
              prev.blocks,
              selectedBlock.id,
              "placeholder",
              e.target.value,
            ),
          }))
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className={inspectorLabelClass()}>Submit Button Text</div>
        <label className="flex items-center gap-2 text-xs text-neutral-600">
          <input
            type="checkbox"
            checked={selectedBlock.data.showSubmitButtonText !== false}
            onChange={(e) =>
              updateSelectedBlock((block) =>
                block.type !== "form_field"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        showSubmitButtonText: e.target.checked,
                      },
                    },
              )
            }
          />
          Show
        </label>
      </div>

      <input
        type="text"
        value={selectedBlock.data.submitButtonText ?? "Submit"}
        onChange={(e) =>
          setDraft((prev) => ({
            ...prev,
            blocks: updateFormField(
              prev.blocks,
              selectedBlock.id,
              "submitButtonText",
              e.target.value,
            ),
          }))
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Field Type</div>
      <select
        value={selectedBlock.data.fieldType}
        onChange={(e) =>
          setDraft((prev) => ({
            ...prev,
            blocks: updateFormField(
              prev.blocks,
              selectedBlock.id,
              "fieldType",
              e.target.value,
            ),
          }))
        }
        className={inspectorInputClass()}
      >
        <option value="text">Text</option>
        <option value="email">Email</option>
        <option value="phone">Phone</option>
        <option value="textarea">Textarea</option>
      </select>
    </div>

    <div className="mt-4">
      <label className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <span className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={Boolean(selectedBlock.data.required)}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                blocks: updateFormFieldRequired(
                  prev.blocks,
                  selectedBlock.id,
                  e.target.checked,
                ),
              }))
            }
          />
          Required field
        </span>

        <span className="flex items-center gap-2 text-xs text-neutral-600">
          <input
            type="checkbox"
            checked={selectedBlock.data.showRequired !== false}
            onChange={(e) =>
              updateSelectedBlock((block) =>
                block.type !== "form_field"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        showRequired: e.target.checked,
                      },
                    },
              )
            }
          />
          Show
        </span>
      </label>
    </div>
  </div>
) : null}

{selectedBlock?.type === "countdown" ? (
  <div id="inspector-countdown" className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Countdown</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Style Variant</div>
      <select
        value={selectedBlock.data.styleVariant ?? "default"}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "countdown"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    styleVariant: e.target.value as
                      | "default"
                      | "cards"
                      | "hero",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="default">Default</option>
        <option value="cards">Cards</option>
        <option value="hero">Hero</option>
      </select>
    </div>

    <div className="mt-4">
      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.showRings !== false}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "countdown"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      showRings: e.target.checked,
                    },
                  },
            )
          }
        />
        Show Rings
      </label>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>
        Heading (optional)
      </div>
      <input
        ref={countdownHeadingInputRef}
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "countdown"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    heading: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Target Date</div>
      <input
        ref={countdownTargetInputRef}
        type="datetime-local"
        value={selectedBlock.data.targetIso || ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "countdown"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    targetIso: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>
        Completed Message
      </div>
      <input
        ref={countdownCompletedInputRef}
        type="text"
        value={selectedBlock.data.completedMessage}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "countdown"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    completedMessage: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>
  </div>
) : null}

{/* ✅ NEW CHECKOUT BLOCK */}
{selectedBlock?.type === "checkout" ? (
  <div id="inspector-checkout" className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Checkout</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Product Name</div>
      <input
        type="text"
        value={selectedBlock.data.productName}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "checkout"
              ? block
              : {
                  ...block,
                  data: { ...block.data, productName: e.target.value },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Price</div>
      <input
        type="number"
        value={selectedBlock.data.price}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "checkout"
              ? block
              : {
                  ...block,
                  data: { ...block.data, price: Number(e.target.value) },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Currency</div>
      <input
        type="text"
        value={selectedBlock.data.currency}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "checkout"
              ? block
              : {
                  ...block,
                  data: { ...block.data, currency: e.target.value },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={selectedBlock.data.allowQuantity}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "checkout"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      allowQuantity: e.target.checked,
                    },
                  },
            )
          }
        />
        Allow Quantity
      </label>
    </div>
  </div>
) : null}

{selectedBlock?.type === "faq" ? (
                  <div id="inspector-faq" className={inspectorCardClass()}>
                    <div className={inspectorLabelClass()}>FAQ</div>

                    <div className="mt-4 space-y-3">
                      {selectedBlock.data.items.map((faqItem: FaqItem) => (
                        <div
                          key={faqItem.id}
                          className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
                        >
                          <div className={inspectorLabelClass()}>Question</div>
                          <input
                            ref={(el) => {
                              faqQuestionInputRefs.current[faqItem.id] = el;
                            }}
                            type="text"
                            value={faqItem.question}
                            onChange={(e) =>
                              updateSelectedBlock((block) =>
                                block.type !== "faq"
                                  ? block
                                  : {
                                      ...block,
                                      data: {
                                        ...block.data,
                                        items: block.data.items.map((item) =>
                                          item.id === faqItem.id
                                            ? {
                                                ...item,
                                                question: e.target.value,
                                              }
                                            : item,
                                        ),
                                      },
                                    },
                              )
                            }
                            className={inspectorInputClass()}
                          />

                          <div className="mt-4">
                            <div className={inspectorLabelClass()}>Answer</div>
                            <textarea
                              ref={(el) => {
                                faqAnswerInputRefs.current[faqItem.id] = el;
                              }}
                              value={faqItem.answer}
                              onChange={(e) =>
                                updateSelectedBlock((block) =>
                                  block.type !== "faq"
                                    ? block
                                    : {
                                        ...block,
                                        data: {
                                          ...block.data,
                                          items: block.data.items.map((item) =>
                                            item.id === faqItem.id
                                              ? {
                                                  ...item,
                                                  answer: e.target.value,
                                                }
                                              : item,
                                          ),
                                        },
                                      },
                                )
                              }
                              className={inspectorTextareaClass()}
                            />
                          </div>

                          <div className="mt-3 flex justify-end">
                            <button
                              type="button"
                              className={toolSetButtonClass("remove")}
                              onClick={() =>
                                updateSelectedBlock((block) =>
                                  block.type !== "faq"
                                    ? block
                                    : {
                                        ...block,
                                        data: {
                                          ...block.data,
                                          items:
                                            block.data.items.length > 1
                                              ? block.data.items.filter(
                                                  (item) =>
                                                    item.id !== faqItem.id,
                                                )
                                              : block.data.items,
                                        },
                                      },
                                )
                              }
                              title="Remove FAQ item"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        className={toolSetButtonClass("front")}
                        onClick={() =>
                          updateSelectedBlock((block) =>
                            block.type !== "faq"
                              ? block
                              : {
                                  ...block,
                                  data: {
                                    ...block.data,
                                    items: [
                                      ...block.data.items,
                                      {
                                        id: makeClientId("faq"),
                                        question: "Question",
                                        answer: "Answer",
                                      },
                                    ],
                                  },
                                },
                          )
                        }
                      >
                        Add FAQ Item
                      </button>
                    </div>
                  </div>
                ) : null}

{selectedBlock?.type === "thread" ? (
  <div id="inspector-thread" className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Thread / Interactive</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Subject</div>
      <input
        ref={threadSubjectInputRef}
        type="text"
        value={selectedBlock.data.subject ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "thread"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    subject: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4 grid grid-cols-1 gap-3">
      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={Boolean(selectedBlock.data.allowAnonymous)}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "thread"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      allowAnonymous: e.target.checked,
                    },
                  },
            )
          }
        />
        Allow anonymous posting
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={Boolean(selectedBlock.data.requireApproval)}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "thread"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      requireApproval: e.target.checked,
                    },
                  },
            )
          }
        />
        Require approval
      </label>
    </div>

    <div className="mt-5">
      <div className={inspectorLabelClass()}>Display</div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Max Visible Messages</div>
        <input
          type="number"
          min={1}
          max={100}
          value={selectedBlock.data.maxVisibleMessages ?? 4}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "thread"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      maxVisibleMessages: Math.max(
                        1,
                        Math.min(100, Number(e.target.value) || 4),
                      ),
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Scroll Height</div>
        <input
          type="number"
          min={120}
          max={1000}
          value={selectedBlock.data.scrollHeight ?? 280}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "thread"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      scrollHeight: Math.max(
                        120,
                        Math.min(1000, Number(e.target.value) || 280),
                      ),
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={selectedBlock.data.showNameField !== false}
            onChange={(e) =>
              updateSelectedBlock((block) =>
                block.type !== "thread"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        showNameField: e.target.checked,
                      },
                    },
              )
            }
          />
          Show name field
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={selectedBlock.data.showVoteControls !== false}
            onChange={(e) =>
              updateSelectedBlock((block) =>
                block.type !== "thread"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        showVoteControls: e.target.checked,
                      },
                    },
              )
            }
          />
          Show vote controls
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={selectedBlock.data.showVoteCount !== false}
            onChange={(e) =>
              updateSelectedBlock((block) =>
                block.type !== "thread"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        showVoteCount: e.target.checked,
                      },
                    },
              )
            }
          />
          Show vote count
        </label>
      </div>
    </div>

<div className="mt-5">
  <div className={inspectorLabelClass()}>Composer</div>

  {selectedBlock.data.showNameField !== false ? (
    <div className="mt-4">
      <div className={inspectorLabelClass()}>Name Placeholder</div>
      <input
        type="text"
        maxLength={60}
        value={selectedBlock.data.namePlaceholder ?? "Your name"}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "thread"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    namePlaceholder: e.target.value.slice(0, 60),
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>
  ) : null}

  <div className="mt-4">
    <div className={inspectorLabelClass()}>Composer Placeholder</div>
    <input
      type="text"
      maxLength={120}
      value={selectedBlock.data.composerPlaceholder ?? "Write something…"}
      onChange={(e) =>
        updateSelectedBlock((block) =>
          block.type !== "thread"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  composerPlaceholder: e.target.value.slice(0, 120),
                },
              },
        )
      }
      className={inspectorInputClass()}
    />
  </div>

  <div className="mt-4">
    <div className={inspectorLabelClass()}>Post Button Text</div>
    <input
      type="text"
      maxLength={30}
      value={selectedBlock.data.postButtonText ?? "Post"}
      onChange={(e) =>
        updateSelectedBlock((block) =>
          block.type !== "thread"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  postButtonText: e.target.value.slice(0, 30),
                },
              },
        )
      }
      className={inspectorInputClass()}
    />
  </div>

  <div className="mt-4">
    <div className={inspectorLabelClass()}>Post Button Style</div>
    <select
      value={selectedBlock.data.postButtonStyle ?? "solid"}
      onChange={(e) =>
        updateSelectedBlock((block) =>
          block.type !== "thread"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  postButtonStyle: e.target.value as
                    | "solid"
                    | "outline"
                    | "soft",
                },
              },
        )
      }
      className={inspectorInputClass()}
    >
      <option value="solid">Solid</option>
      <option value="outline">Outline</option>
      <option value="soft">Soft</option>
    </select>
  </div>
</div>

<div className="mt-5">
  <div className={inspectorLabelClass()}>Messages</div>

  <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-4 text-sm text-neutral-500">
    Messages are now read-only in the inspector and come from live microsite data.
  </div>
</div>
  </div>
) : null}

{selectedBlock?.type === "highlight" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Highlight</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Highlight Type</div>
      <select
        value={selectedBlock.data.mode ?? "top_messages"}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "highlight"
              ? block
              : {
                  ...block,
data: {
  ...block.data,
  mode: e.target.value as
    | "top_messages"
    | "rsvp_count"
    | "total_funds",
  heading:
    e.target.value === "top_messages"
      ? "Top Messages"
      : e.target.value === "rsvp_count"
        ? "RSVP Count"
        : "Total Funds",
  sourceBlockId:
    e.target.value === "top_messages"
      ? block.data.sourceBlockId ||
        draft.blocks.find((b) => b.type === "thread")?.id ||
        ""
      : "",
  sourceFormBlockId:
    e.target.value === "rsvp_count" || e.target.value === "total_funds"
      ? block.data.sourceFormBlockId ||
        draft.blocks.find((b) => b.type === "form_field")?.id ||
        ""
      : "",
},
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="top_messages">Top Messages</option>
        <option value="rsvp_count">RSVP Count</option>
        <option value="total_funds">Total Funds</option>
      </select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Source Thread</div>
      <select
        value={selectedBlock.data.sourceBlockId ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "highlight"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    sourceBlockId: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
        disabled={selectedBlock.data.mode !== "top_messages"}
      >
        <option value="">Select thread block</option>
        {draft.blocks
          .filter((block) => block.type === "thread")
          .map((threadBlock) => (
            <option key={threadBlock.id} value={threadBlock.id}>
              {threadBlock.label || threadBlock.data.subject || "Message Thread"}
            </option>
          ))}
      </select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Source Form</div>
      <select
        value={selectedBlock.data.sourceFormBlockId ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "highlight"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    sourceFormBlockId: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
        disabled={
          selectedBlock.data.mode !== "rsvp_count" &&
          selectedBlock.data.mode !== "total_funds"
        }
      >
        <option value="">Select form block</option>
        {draft.blocks
          .filter((block) => block.type === "form_field")
          .map((formBlock) => (
            <option key={formBlock.id} value={formBlock.id}>
              {formBlock.label || formBlock.data.label || "Form Field"}
            </option>
          ))}
      </select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "highlight"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    heading: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Item Limit</div>
      <input
        type="number"
        min={1}
        max={12}
        value={selectedBlock.data.limit ?? 4}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "highlight"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    limit: Math.max(1, Math.min(12, Number(e.target.value) || 4)),
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-4 text-sm text-neutral-500">
      This block is read-only and should display live DB-backed summary data.
    </div>
  </div>
) : null}

{selectedBlock?.type === "progress_bar" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Progress Bar</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "progress_bar"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    heading: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4 grid grid-cols-2 gap-3">
      <div>
        <div className={inspectorLabelClass()}>Current Value</div>
        <input
          type="number"
          min={0}
          value={selectedBlock.data.value ?? 0}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "progress_bar"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      value: Math.max(0, Number(e.target.value) || 0),
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div>
        <div className={inspectorLabelClass()}>Max Value</div>
        <input
          type="number"
          min={1}
          value={selectedBlock.data.max ?? 100}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "progress_bar"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      max: Math.max(1, Number(e.target.value) || 1),
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>
    </div>

    <div className="mt-4">
      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.showPercentage !== false}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "progress_bar"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      showPercentage: e.target.checked,
                    },
                  },
            )
          }
        />
        Show Percentage
      </label>
    </div>
  </div>
) : null}

{selectedBlock?.type === "donation" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Donation</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "donation"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    heading: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Description</div>
      <textarea
        value={selectedBlock.data.description ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "donation"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    description: e.target.value,
                  },
                },
          )
        }
        className={inspectorTextareaClass()}
      />
    </div>

    <div className="mt-4 grid grid-cols-2 gap-3">
      <div>
        <div className={inspectorLabelClass()}>Current Amount</div>
        <input
          type="number"
          min={0}
          value={selectedBlock.data.currentAmount ?? 0}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "donation"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      currentAmount: Math.max(0, Number(e.target.value) || 0),
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div>
        <div className={inspectorLabelClass()}>Goal Amount</div>
        <input
          type="number"
          min={1}
          value={selectedBlock.data.goalAmount ?? 1000}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "donation"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      goalAmount: Math.max(1, Number(e.target.value) || 1),
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Button Text</div>
      <input
        type="text"
        value={selectedBlock.data.buttonText ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "donation"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    buttonText: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Button URL</div>
      <input
        type="text"
        value={selectedBlock.data.buttonUrl ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "donation"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    buttonUrl: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>
  </div>
) : null}

{selectedBlock?.type === "link_hub" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Link Hub</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "link_hub"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    heading: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4 space-y-3">
      {selectedBlock.data.items.map((item: LinkItem) => (
        <div
          key={item.id}
          className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
        >
          <div className={inspectorLabelClass()}>Label</div>
          <input
            type="text"
            value={item.label}
            onChange={(e) =>
              updateSelectedBlock((block) =>
                block.type !== "link_hub"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        items: block.data.items.map((entry) =>
                          entry.id === item.id
                            ? { ...entry, label: e.target.value }
                            : entry,
                        ),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          />

          <div className="mt-4">
            <div className={inspectorLabelClass()}>URL</div>
            <input
              type="text"
              value={item.url}
              onChange={(e) =>
                updateSelectedBlock((block) =>
                  block.type !== "link_hub"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          items: block.data.items.map((entry) =>
                            entry.id === item.id
                              ? { ...entry, url: e.target.value }
                              : entry,
                          ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              className={toolSetButtonClass("front")}
              onClick={() =>
                updateSelectedBlock((block) =>
                  block.type !== "link_hub"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          items: [
                            ...block.data.items,
                            {
                              ...item,
                              id: makeClientId("link"),
                            },
                          ],
                        },
                      },
                )
              }
              title="Duplicate link"
            >
              Duplicate
            </button>

            <button
              type="button"
              className={toolSetButtonClass("remove")}
              onClick={() =>
                updateSelectedBlock((block) =>
                  block.type !== "link_hub"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          items:
                            block.data.items.length > 1
                              ? block.data.items.filter(
                                  (entry) => entry.id !== item.id,
                                )
                              : block.data.items,
                        },
                      },
                )
              }
              title="Remove link"
            >
              ×
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        className={toolSetButtonClass("front")}
        onClick={() =>
          updateSelectedBlock((block) =>
            block.type !== "link_hub"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    items: [
                      ...block.data.items,
                      {
                        id: makeClientId("link"),
                        label: "New Link",
                        url: "#",
                      },
                    ],
                  },
                },
          )
        }
      >
        Add Link
      </button>
    </div>
  </div>
) : null}

{selectedBlock?.type === "checklist" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Checklist</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "checklist"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    heading: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4 space-y-3">
      {selectedBlock.data.items.map((item) => (
        <div
          key={item.id}
          className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
        >
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(item.checked)}
              onChange={(e) =>
                updateSelectedBlock((block) =>
                  block.type !== "checklist"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          items: block.data.items.map((entry) =>
                            entry.id === item.id
                              ? { ...entry, checked: e.target.checked }
                              : entry,
                          ),
                        },
                      },
                )
              }
            />

            <input
              type="text"
              value={item.label}
              onChange={(e) =>
                updateSelectedBlock((block) =>
                  block.type !== "checklist"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          items: block.data.items.map((entry) =>
                            entry.id === item.id
                              ? { ...entry, label: e.target.value }
                              : entry,
                          ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              className={toolSetButtonClass("remove")}
              onClick={() =>
                updateSelectedBlock((block) =>
                  block.type !== "checklist"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          items:
                            block.data.items.length > 1
                              ? block.data.items.filter(
                                  (entry) => entry.id !== item.id,
                                )
                              : block.data.items,
                        },
                      },
                )
              }
              title="Remove checklist item"
            >
              ×
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        className={toolSetButtonClass("front")}
        onClick={() =>
          updateSelectedBlock((block) =>
            block.type !== "checklist"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    items: [
                      ...block.data.items,
                      {
                        id: makeClientId("check"),
                        label: "New item",
                        checked: false,
                      },
                    ],
                  },
                },
          )
        }
      >
        Add Item
      </button>
    </div>
  </div>
) : null}

{selectedBlock?.type === "schedule_agenda" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Schedule</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "schedule_agenda"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    heading: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4 space-y-3">
      {selectedBlock.data.items.map((item) => (
        <div
          key={item.id}
          className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
        >
          <div className={inspectorLabelClass()}>Time</div>
          <input
            type="text"
            value={item.time}
            onChange={(e) =>
              updateSelectedBlock((block) =>
                block.type !== "schedule_agenda"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        items: block.data.items.map((entry) =>
                          entry.id === item.id
                            ? { ...entry, time: e.target.value }
                            : entry,
                        ),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          />

          <div className="mt-4">
            <div className={inspectorLabelClass()}>Title</div>
            <input
              type="text"
              value={item.title}
              onChange={(e) =>
                updateSelectedBlock((block) =>
                  block.type !== "schedule_agenda"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          items: block.data.items.map((entry) =>
                            entry.id === item.id
                              ? { ...entry, title: e.target.value }
                              : entry,
                          ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />
          </div>

          <div className="mt-4">
            <div className={inspectorLabelClass()}>Description</div>
            <textarea
              value={item.description ?? ""}
              onChange={(e) =>
                updateSelectedBlock((block) =>
                  block.type !== "schedule_agenda"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          items: block.data.items.map((entry) =>
                            entry.id === item.id
                              ? { ...entry, description: e.target.value }
                              : entry,
                          ),
                        },
                      },
                )
              }
              className={inspectorTextareaClass()}
            />
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              className={toolSetButtonClass("remove")}
              onClick={() =>
                updateSelectedBlock((block) =>
                  block.type !== "schedule_agenda"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          items:
                            block.data.items.length > 1
                              ? block.data.items.filter(
                                  (entry) => entry.id !== item.id,
                                )
                              : block.data.items,
                        },
                      },
                )
              }
            >
              ×
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        className={toolSetButtonClass("front")}
        onClick={() =>
          updateSelectedBlock((block) =>
            block.type !== "schedule_agenda"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    items: [
                      ...block.data.items,
                      {
                        id: makeClientId("schedule"),
                        time: "12:00 PM",
                        title: "New Event",
                        description: "",
                      },
                    ],
                  },
                },
          )
        }
      >
        Add Event
      </button>
    </div>
  </div>
) : null}

{selectedBlock?.type === "map_location" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Map</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "map_location"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    heading: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Location Name</div>
      <input
        type="text"
        value={selectedBlock.data.locationName ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "map_location"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    locationName: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Address</div>
      <input
        type="text"
        value={selectedBlock.data.address ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "map_location"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    address: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Map URL (optional)</div>
      <input
        type="text"
        value={selectedBlock.data.mapUrl ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "map_location"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    mapUrl: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>
  </div>
) : null}

{selectedBlock?.type === "file_share" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>File Share</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "file_share"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    heading: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Subtext</div>
      <textarea
        value={selectedBlock.data.subtext ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "file_share"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    subtext: e.target.value,
                  },
                },
          )
        }
        className={inspectorTextareaClass()}
      />
    </div>

    <div className="mt-4 grid grid-cols-1 gap-3">
      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={Boolean(selectedBlock.data.allowPublicUpload)}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "file_share"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      allowPublicUpload: e.target.checked,
                    },
                  },
            )
          }
        />
        Allow public upload
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={Boolean(selectedBlock.data.requireAccessCode)}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "file_share"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      requireAccessCode: e.target.checked,
                    },
                  },
            )
          }
        />
        Require access code
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={Boolean(selectedBlock.data.allowMultiple)}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "file_share"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      allowMultiple: e.target.checked,
                    },
                  },
            )
          }
        />
        Allow multiple files
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.collectName !== false}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "file_share"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      collectName: e.target.checked,
                    },
                  },
            )
          }
        />
        Collect name
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.collectEmail !== false}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "file_share"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      collectEmail: e.target.checked,
                    },
                  },
            )
          }
        />
        Collect email
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={Boolean(selectedBlock.data.collectMessage)}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "file_share"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      collectMessage: e.target.checked,
                    },
                  },
            )
          }
        />
        Collect message
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.ownerAlertOnUpload !== false}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "file_share"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      ownerAlertOnUpload: e.target.checked,
                    },
                  },
            )
          }
        />
        Owner alert on upload
      </label>
    </div>

    {selectedBlock.data.requireAccessCode ? (
      <div className="mt-4">
        <div className={inspectorLabelClass()}>Access Code</div>
        <input
          type="text"
          value={selectedBlock.data.accessCode ?? ""}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "file_share"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      accessCode: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
          placeholder="Enter access code"
        />
      </div>
    ) : null}

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Accepted File Types</div>
      <input
        type="text"
        value={(selectedBlock.data.acceptedFileTypes ?? []).join(", ")}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "file_share"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    acceptedFileTypes: e.target.value
                      .split(",")
                      .map((entry: string) => entry.trim().toLowerCase())
                      .filter((entry: string) => entry.length > 0),
                  },
                },
          )
        }
        className={inspectorInputClass()}
        placeholder="pdf, jpg, jpeg, png, webp, doc, docx, txt"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Max File Size (MB)</div>
      <input
        type="number"
        min={1}
        max={100}
        value={selectedBlock.data.maxFileSizeMb ?? 25}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "file_share"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    maxFileSizeMb: Math.max(
                      1,
                      Math.min(100, Number(e.target.value) || 25),
                    ),
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>
  </div>
) : null}

{selectedBlock?.type === "speed_dating" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Speed Dating</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "speed_dating"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    heading: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

<div className="mt-4">
  <div className={inspectorLabelClass()}>
    Round Start Sound
  </div>

  <div className="mt-2 flex items-center gap-2">
    <select
      value={selectedBlock.data.roundStartSound ?? "spark"}
      onChange={(e) =>
        updateSelectedBlock((block) =>
          block.type !== "speed_dating"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  roundStartSound: e.target.value as
                    | "none"
                    | "arrival"
                    | "spark"
                    | "commence"
                    | "cloak"
                    | "vanish",
                },
              },
        )
      }
      className={`${inspectorInputClass()} mt-0 flex-1`}
    >
      <option value="none">[no sound]</option>
      <option value="arrival">arrival</option>
      <option value="spark">spark</option>
      <option value="commence">commence</option>
      <option value="cloak">cloak</option>
      <option value="vanish">vanish</option>
    </select>

    <button
      type="button"
      onClick={() => {
        const selectedSound = selectedBlock.data.roundStartSound ?? "spark";

        const soundMap = {
          arrival: "/icons/../sounds/sfx_checkin.mp3",
          spark: "/icons/../sounds/sfx_chime.mp3",
          commence: "/icons/../sounds/sfx_gong.mp3",
          cloak: "/icons/../sounds/sfx_summon.mp3",
          vanish: "/icons/../sounds/sfx_vanish.mp3",
        } as const;

        if (selectedSound === "none") return;

        const src =
          selectedSound === "arrival" ||
          selectedSound === "spark" ||
          selectedSound === "commence" ||
          selectedSound === "cloak" ||
          selectedSound === "vanish"
            ? soundMap[selectedSound]
            : soundMap.spark;

        const audio = new Audio(src);
        void audio.play().catch(() => {});
      }}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50"
      title="Test sound"
      aria-label="Test sound"
    >
      <img
        src="/icons/icon_play_sound.webp"
        alt="Play sound"
        className="h-5 w-5 object-contain"
      />
    </button>
  </div>
</div>
  </div>
) : null}

{selectedBlock?.type === "registry" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Registry</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "registry"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    heading: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Description</div>
      <textarea
        value={selectedBlock.data.description ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "registry"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    description: e.target.value,
                  },
                },
          )
        }
        className={inspectorTextareaClass()}
      />
    </div>

    <div className="mt-4 space-y-3">
      {(selectedBlock.data.items ?? []).map((item, index) => {
        const normalizedUrl =
          typeof item.url === "string" ? item.url.trim() : "";
        const storeMeta = getStoreMeta(normalizedUrl);

        return (
          <div
            key={item.id}
            className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
              Item {index + 1}
            </div>

            <div className="mt-3">
              <div className={inspectorLabelClass()}>Item Name</div>
              <input
                type="text"
                value={item.label ?? ""}
                onChange={(e) =>
                  updateSelectedBlock((block) =>
                    block.type !== "registry"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            items: (block.data.items ?? []).map((entry) =>
                              entry.id === item.id
                                ? { ...entry, label: e.target.value }
                                : entry,
                            ),
                          },
                        },
                  )
                }
                className={inspectorInputClass()}
              />
            </div>

            {storeMeta?.logo ? (
              <div className="mt-4 flex items-center gap-2">
                <img
                  src={storeMeta.logo}
                  alt={storeMeta.name || "Store"}
                  className="h-5 w-5 rounded-sm object-contain"
                />
                <span className="text-xs text-neutral-500">
                  {storeMeta.name || item.store?.trim() || "Store detected"}
                </span>
              </div>
            ) : null}

            {item.imageUrl ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <img
                  src={item.imageUrl}
                  alt={item.label || `Item ${index + 1}`}
                  className="h-32 w-full object-cover"
                />
              </div>
            ) : null}
            <div className="mt-4">
              <div className={inspectorLabelClass()}>URL</div>
              <input
                type="text"
                value={item.url ?? ""}
                onChange={(e) => {
                  const url = e.target.value;

                  updateSelectedBlock((block) =>
                    block.type !== "registry"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            items: (block.data.items ?? []).map((entry) =>
                              entry.id === item.id
                                ? {
                                    ...entry,
                                    url,
                                    store: "",
                                    price: "",
                                    imageUrl: "",
                                  }
                                : entry,
                            ),
                          },
                        },
                  );

                  if (!(window as any).__registryTimers) {
                    (window as any).__registryTimers = {};
                  }

                  if ((window as any).__registryTimers[item.id]) {
                    clearTimeout((window as any).__registryTimers[item.id]);
                  }

                  (window as any).__registryTimers[item.id] = window.setTimeout(
                    async () => {
                      const trimmedUrl = url.trim();
                      if (!/^https?:\/\//i.test(trimmedUrl)) return;

                      try {
                        setRegistryLoadingMap((prev) => ({
                          ...prev,
                          [item.id]: true,
                        }));

                        const { fetchRegistryMetadata } = await import(
                          "@/lib/utils/fetchRegistryMetadata"
                        );

                        const meta = await fetchRegistryMetadata(trimmedUrl);

                        updateSelectedBlock((block) => {
                          if (block.type !== "registry") return block;

                          return {
                            ...block,
                            data: {
                              ...block.data,
                              items: (block.data.items ?? []).map((entry) => {
                                if (entry.id !== item.id) return entry;

                                const currentLabel =
                                  typeof entry.label === "string"
                                    ? entry.label.trim()
                                    : "";
                                const currentStore =
                                  typeof entry.store === "string"
                                    ? entry.store.trim()
                                    : "";
                                const currentPrice =
                                  typeof entry.price === "string"
                                    ? entry.price.trim()
                                    : "";

                                return {
                                  ...entry,
                                  label: currentLabel || meta.title || "",
                                  store: meta.store || "",
                                  price: meta.price || "",
                                  imageUrl: meta.imageUrl || "",
                                };
                              }),
                            },
                          };
                        });
                      } catch {
                        // silent fail
                      } finally {
                        setRegistryLoadingMap((prev) => ({
                          ...prev,
                          [item.id]: false,
                        }));
                      }
                    },
                    600,
                  );
                }}
                className={inspectorInputClass()}
              />

              {registryLoadingMap[item.id] ? (
                <div className="mt-1 text-xs text-neutral-500">
                  Fetching item details...
                </div>
              ) : null}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <div className={inspectorLabelClass()}>Store</div>
                <input
                  type="text"
                  value={item.store ?? ""}
                  onChange={(e) =>
                    updateSelectedBlock((block) =>
                      block.type !== "registry"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              items: (block.data.items ?? []).map((entry) =>
                                entry.id === item.id
                                  ? { ...entry, store: e.target.value }
                                  : entry,
                              ),
                            },
                          },
                    )
                  }
                  className={inspectorInputClass()}
                />
              </div>

              <div>
                <div className={inspectorLabelClass()}>Price</div>
                <input
                  type="text"
                  value={item.price ?? ""}
                  onChange={(e) =>
                    updateSelectedBlock((block) =>
                      block.type !== "registry"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              items: (block.data.items ?? []).map((entry) =>
                                entry.id === item.id
                                  ? { ...entry, price: e.target.value }
                                  : entry,
                              ),
                            },
                          },
                    )
                  }
                  className={inspectorInputClass()}
                />
              </div>
            </div>

            <div className="mt-4">
              <div className={inspectorLabelClass()}>Note</div>
              <textarea
                value={item.note ?? ""}
                onChange={(e) =>
                  updateSelectedBlock((block) =>
                    block.type !== "registry"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            items: (block.data.items ?? []).map((entry) =>
                              entry.id === item.id
                                ? { ...entry, note: e.target.value }
                                : entry,
                            ),
                          },
                        },
                  )
                }
                className={inspectorTextareaClass()}
              />
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                className={toolSetButtonClass("remove")}
                onClick={() =>
                  updateSelectedBlock((block) =>
                    block.type !== "registry"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            items:
                              (block.data.items ?? []).length > 1
                                ? (block.data.items ?? []).filter(
                                    (entry) => entry.id !== item.id,
                                  )
                                : block.data.items ?? [],
                          },
                        },
                  )
                }
                title="Remove registry item"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        className={toolSetButtonClass("front")}
        onClick={() =>
          updateSelectedBlock((block) =>
            block.type !== "registry"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    items: [
                      ...(block.data.items ?? []),
                      {
                        id: makeClientId("registryitem"),
                        label: "New Gift",
                        url: "#",
                        store: "",
                        price: "",
                        note: "",
                      },
                    ],
                  },
                },
          )
        }
      >
        Add Registry Item
      </button>
    </div>
</div>
) : null}

{selectedBlock?.type === "video" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Video</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Title</div>
      <input
        type="text"
        value={selectedBlock.data.title ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "video"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    title: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>
        Video URL (YouTube, Vimeo, etc.)
      </div>
      <input
        type="text"
        value={selectedBlock.data.videoUrl ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "video"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    videoUrl: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
        placeholder="https://..."
      />
    </div>

    <div className="mt-4 grid grid-cols-1 gap-3">
      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm">
        <input
          type="checkbox"
          checked={Boolean(selectedBlock.data.autoplay)}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "video"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      autoplay: e.target.checked,
                    },
                  },
            )
          }
        />
        Autoplay
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm">
        <input
          type="checkbox"
          checked={Boolean(selectedBlock.data.muted)}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "video"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      muted: e.target.checked,
                    },
                  },
            )
          }
        />
        Muted
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm">
        <input
          type="checkbox"
          checked={Boolean(selectedBlock.data.loop)}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "video"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      loop: e.target.checked,
                    },
                  },
            )
          }
        />
        Loop
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm">
        <input
          type="checkbox"
          checked={Boolean(selectedBlock.data.showControls)}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "video"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      showControls: e.target.checked,
                    },
                  },
            )
          }
        />
        Show Controls
      </label>
    </div>
  </div>
) : null}

{selectedBlock?.type === "rich_text" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Rich Text</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Title</div>
      <input
        type="text"
        value={selectedBlock.data.title ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "rich_text"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    title: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Content</div>

      <div
        className="mb-2 space-y-2"
        onMouseDownCapture={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("button")) {
            e.preventDefault();
          }
        }}
      >
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`px-2 py-1 text-xs rounded border ${
              selectedBlock.data.style?.bold
  ? "bg-white text-black border-2 border-black"
  : "bg-white text-black border border-neutral-300 hover:bg-neutral-100"
            }`}
            onClick={() =>
              withRichTextEditor((editor) => {
                document.execCommand("bold");
                updateSelectedBlock((block) =>
                  block.type !== "rich_text"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          content: editor.innerHTML,
                          style: {
                            ...(block.data.style ?? {}),
                            bold: !block.data.style?.bold,
                          },
                        },
                      },
                );
              })
            }
          >
            B
          </button>

          <button
            type="button"
            className={`px-2 py-1 text-xs rounded border ${
              selectedBlock.data.style?.italic
  ? "bg-white text-black border-2 border-black"
  : "bg-white text-black border border-neutral-300 hover:bg-neutral-100"
            }`}
            onClick={() =>
              withRichTextEditor((editor) => {
                document.execCommand("italic");
                updateSelectedBlock((block) =>
                  block.type !== "rich_text"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          content: editor.innerHTML,
                          style: {
                            ...(block.data.style ?? {}),
                            italic: !block.data.style?.italic,
                          },
                        },
                      },
                );
              })
            }
          >
            I
          </button>

          <button
            type="button"
            className={`px-2 py-1 text-xs rounded border ${
              selectedBlock.data.style?.underline
  ? "bg-white text-black border-2 border-black"
  : "bg-white text-black border border-neutral-300 hover:bg-neutral-100"
            }`}
            onClick={() =>
              withRichTextEditor((editor) => {
                document.execCommand("underline");
                updateSelectedBlock((block) =>
                  block.type !== "rich_text"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          content: editor.innerHTML,
                          style: {
                            ...(block.data.style ?? {}),
                            underline: !block.data.style?.underline,
                          },
                        },
                      },
                );
              })
            }
          >
            U
          </button>

          <button
            type="button"
            className={`px-2 py-1 text-xs rounded border ${
              (selectedBlock.data.style?.align ?? "left") === "left"
  ? "bg-white text-black border-2 border-black"
  : "bg-white text-black border border-neutral-300 hover:bg-neutral-100"
            }`}
            onClick={() =>
              withRichTextEditor((editor) => {
                document.execCommand("justifyLeft");
                updateSelectedBlock((block) =>
                  block.type !== "rich_text"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          content: editor.innerHTML,
                          style: {
                            ...(block.data.style ?? {}),
                            align: "left",
                          },
                        },
                      },
                );
              })
            }
            title="Align left"
          >
            <Image
              src="/icons/icon_left_align.png"
              alt="Align left"
              width={16}
              height={16}
              className="pointer-events-none h-4 w-4 object-contain"
            />
          </button>

          <button
            type="button"
            className={`px-2 py-1 text-xs rounded border ${
              selectedBlock.data.style?.align === "center"
  ? "bg-white text-black border-2 border-black"
  : "bg-white text-black border border-neutral-300 hover:bg-neutral-100"
            }`}
            onClick={() =>
              withRichTextEditor((editor) => {
                document.execCommand("justifyCenter");
                updateSelectedBlock((block) =>
                  block.type !== "rich_text"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          content: editor.innerHTML,
                          style: {
                            ...(block.data.style ?? {}),
                            align: "center",
                          },
                        },
                      },
                );
              })
            }
            title="Align center"
          >
            <Image
              src="/icons/icon_center_align.png"
              alt="Align center"
              width={16}
              height={16}
              className="pointer-events-none h-4 w-4 object-contain"
            />
          </button>

<button
  type="button"
  className={`px-2 py-1 text-xs rounded border ${
    selectedBlock.data.style?.align === "right"
      ? "bg-white text-black border-2 border-black"
      : "bg-white text-black border border-neutral-300 hover:bg-neutral-100"
  }`}
  onClick={() =>
    withRichTextEditor((editor) => {
      document.execCommand("justifyRight");
      updateSelectedBlock((block) =>
        block.type !== "rich_text"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                content: editor.innerHTML,
                style: {
                  ...(block.data.style ?? {}),
                  align: "right",
                },
              },
            },
      );
    })
  }
  title="Align right"
>
  <Image
    src="/icons/icon_right_align.png"
    alt="Align right"
    width={16}
    height={16}
    className="pointer-events-none h-4 w-4 object-contain"
  />
</button>

</div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`px-2 py-1 text-xs rounded border ${
              selectedBlock.data.listType === "bullet"
                ? "bg-black text-white border-black"
                : "bg-white text-black border-neutral-300 hover:bg-neutral-100"
            }`}
            onClick={() =>
              withRichTextEditor((editor) => {
                document.execCommand("insertUnorderedList");
                updateSelectedBlock((block) =>
                  block.type !== "rich_text"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          content: editor.innerHTML,
                          listType:
                            block.data.listType === "bullet" ? "none" : "bullet",
                        },
                      },
                );
              })
            }
          >
            Bulleted List
          </button>

          <button
            type="button"
            className={`px-2 py-1 text-xs rounded border ${
              selectedBlock.data.listType === "number"
                ? "bg-black text-white border-black"
                : "bg-white text-black border-neutral-300 hover:bg-neutral-100"
            }`}
            onClick={() =>
              withRichTextEditor((editor) => {
                document.execCommand("insertOrderedList");
                updateSelectedBlock((block) =>
                  block.type !== "rich_text"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          content: editor.innerHTML,
                          listType:
                            block.data.listType === "number" ? "none" : "number",
                        },
                      },
                );
              })
            }
          >
            Numbered List
          </button>

                    <button
            type="button"
            className="px-2 py-1 text-xs rounded border bg-white text-black border-neutral-300 hover:bg-neutral-100"
            onClick={openRichTextLinkModal}
          >
            Link
          </button>
        </div>
      </div>

<div
  className="relative"
  onMouseDown={(e) => {
    const target = e.target as HTMLElement;
    const editor = richTextEditorRef.current;

    if (!editor) return;

    const clickedInsideEditor = target === editor || editor.contains(target);
    if (clickedInsideEditor) return;

    e.preventDefault();

    window.setTimeout(() => {
      editor.focus();

      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }, 0);
  }}
>
        {isRichTextEditorEmpty ? (
          <div
            className="pointer-events-none absolute left-3 top-3 z-30 text-sm text-neutral-400"
            style={{
              textAlign: selectedBlock.data.style?.align ?? "left",
            }}
          >
            Start writing here...
          </div>
        ) : null}

        <div
          ref={richTextEditorRef}
          data-rich-text-editor={selectedBlock.id}
          contentEditable
          suppressContentEditableWarning
          onKeyDown={(e) => {
            const isCmd = e.metaKey || e.ctrlKey;

            if (!isCmd) return;

            if (e.key.toLowerCase() === "b") {
              e.preventDefault();
              withRichTextEditor(() => {
                document.execCommand("bold");
              });
            }

            if (e.key.toLowerCase() === "i") {
              e.preventDefault();
              withRichTextEditor(() => {
                document.execCommand("italic");
              });
            }

            if (e.key.toLowerCase() === "u") {
              e.preventDefault();
              withRichTextEditor(() => {
                document.execCommand("underline");
              });
            }

            if (e.key.toLowerCase() === "k") {
              e.preventDefault();
              openRichTextLinkModal();
            }
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text/plain");
            const html = e.clipboardData.getData("text/html");

            e.preventDefault();

            withRichTextEditor(() => {
              const safeText = text || "";
              const urlMatch = safeText.trim().match(/^https?:\/\/\S+$/i);

              if (urlMatch) {
                document.execCommand(
                  "insertHTML",
                  false,
                  `<a href="${urlMatch[0]}" target="_blank" rel="noopener noreferrer">${urlMatch[0]}</a>`,
                );
                return;
              }

              if (html && html.trim()) {
                document.execCommand("insertHTML", false, html);
                return;
              }

              document.execCommand("insertText", false, safeText);
            });
          }}
          onInput={(e) => {
            const html = (e.currentTarget as HTMLDivElement).innerHTML;
            setIsRichTextEditorEmpty(isRichTextHtmlEmpty(html));
          }}
          onBlur={(e) => {
            const normalized = normalizeRichTextHtml(
              (e.currentTarget as HTMLDivElement).innerHTML,
            );

            setIsRichTextEditorEmpty(isRichTextHtmlEmpty(normalized));

            updateSelectedBlock((block) =>
              block.type !== "rich_text"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      content: normalized,
                    },
                  },
            );
          }}
          className={`${inspectorTextareaClass()} min-h-[220px] relative z-20 cursor-text [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:ml-1`}
          style={{
            textAlign: selectedBlock.data.style?.align ?? "left",
          }}
        />
      </div>

<div className="mt-2">
  <div className="text-xs text-neutral-500">
    Use the toolbar above to format selected text, create lists, and add inline links.
  </div>

  <div className="mt-3 flex justify-end">
    <button
      type="button"
      className="px-2 py-1 text-xs rounded border bg-white text-black border-neutral-300 hover:bg-neutral-100"
      onClick={() => {
        if (richTextEditorRef.current) {
          richTextEditorRef.current.innerHTML = "";
          richTextEditorRef.current.focus();
        }

        setIsRichTextEditorEmpty(true);

        updateSelectedBlock((block) =>
          block.type !== "rich_text"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  content: "",
                  listType: "none",
                  linkUrl: "",
                  style: {
                    ...(block.data.style ?? {}),
                    bold: false,
                    italic: false,
                    underline: false,
                  },
                },
              },
        );
      }}
    >
      Clear
    </button>
  </div>
</div>
    </div>
  </div>
) : null}

                {selectedBlock?.type === "links" ? (
                  <div id="inspector-links" className={inspectorCardClass()}>
                    <div className={inspectorLabelClass()}>Links</div>

                    <div className="mt-4">
                      <div className={inspectorLabelClass()}>Heading</div>
                      <input
                        ref={linksHeadingInputRef}
                        type="text"
                        value={selectedBlock.data.heading ?? ""}
                        onChange={(e) =>
                          updateSelectedBlock((block) =>
                            block.type !== "links"
                              ? block
                              : {
                                  ...block,
                                  data: {
                                    ...block.data,
                                    heading: e.target.value,
                                  },
                                },
                          )
                        }
                        className={inspectorInputClass()}
                      />
                    </div>

                    <div className="mt-4 space-y-3">
                      {selectedBlock.data.items.map((item: LinkItem) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
                        >
                          <div className={inspectorLabelClass()}>Label</div>
                          <input
                            ref={(el) => {
                              linksItemLabelInputRefs.current[item.id] = el;
                            }}
                            type="text"
                            value={item.label}
                            onChange={(e) =>
                              updateSelectedBlock((block) =>
                                block.type !== "links"
                                  ? block
                                  : {
                                      ...block,
                                      data: {
                                        ...block.data,
                                        items: block.data.items.map((entry) =>
                                          entry.id === item.id
                                            ? {
                                                ...entry,
                                                label: e.target.value,
                                              }
                                            : entry,
                                        ),
                                      },
                                    },
                              )
                            }
                            className={inspectorInputClass()}
                          />

                          <div className="mt-4">
                            <div className={inspectorLabelClass()}>URL</div>
                            <input
                              ref={(el) => {
                                linksItemUrlInputRefs.current[item.id] = el;
                              }}
                              type="text"
                              value={item.url}
                              onChange={(e) =>
                                updateSelectedBlock((block) =>
                                  block.type !== "links"
                                    ? block
                                    : {
                                        ...block,
                                        data: {
                                          ...block.data,
                                          items: block.data.items.map((entry) =>
                                            entry.id === item.id
                                              ? {
                                                  ...entry,
                                                  url: e.target.value,
                                                }
                                              : entry,
                                          ),
                                        },
                                      },
                                )
                              }
                              className={inspectorInputClass()}
                            />
                          </div>

                          <div className="mt-3 flex justify-end">
                            <button
                              type="button"
                              className={toolSetButtonClass("remove")}
                              onClick={() =>
                                updateSelectedBlock((block) =>
                                  block.type !== "links"
                                    ? block
                                    : {
                                        ...block,
                                        data: {
                                          ...block.data,
                                          items:
                                            block.data.items.length > 1
                                              ? block.data.items.filter(
                                                  (entry) =>
                                                    entry.id !== item.id,
                                                )
                                              : block.data.items,
                                        },
                                      },
                                )
                              }
                              title="Remove link"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        className={toolSetButtonClass("front")}
                        onClick={() =>
                          updateSelectedBlock((block) =>
                            block.type !== "links"
                              ? block
                              : {
                                  ...block,
                                  data: {
                                    ...block.data,
                                    items: [
                                      ...block.data.items,
                                      {
                                        id: makeClientId("link"),
                                        label: "New Link",
                                        url: "#",
                                      },
                                    ],
                                  },
                                },
                          )
                        }
                      >
                        Add Link
                      </button>
                    </div>
                  </div>
                ) : null}

{selectedBlock?.type === "listing" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Listing</div>

    <button
      type="button"
      className="mt-3 inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
      onClick={() =>
        void uploadImageToSelectedBlock(selectedBlock.id)
      }
    >
      Browse Listing Image
    </button>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Title</div>
      <input
        type="text"
        value={selectedBlock.data.title}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "listing"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    title: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Description</div>
      <textarea
        value={selectedBlock.data.description}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "listing"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    description: e.target.value,
                  },
                },
          )
        }
        className={inspectorTextareaClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Price</div>
      <input
        type="number"
        step="0.01"
        min="0"
        value={selectedBlock.data.price ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "listing"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    price:
                      e.target.value === ""
                        ? 0
                        : Math.max(0, Number(e.target.value)),
                  },
                },
          )
        }
        className={inspectorInputClass()}
        placeholder="Enter price"
      />
    </div>

    <div className="mt-4 space-y-2">
      <label className="text-sm font-medium">Add to cart</label>
      <label className="flex items-center gap-3 rounded-md border border-neutral-200 px-3 py-2">
        <input
          type="checkbox"
          checked={!!selectedBlock.data?.addToCart}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "listing"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      addToCart: e.target.checked,
                    },
                  },
            )
          }
          className="h-4 w-4"
        />
        <span className="text-sm text-neutral-700">
          Include in Cart
        </span>
      </label>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Card Variant</div>
      <select
        value={selectedBlock.data.cardVariant ?? "stacked"}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "listing"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    cardVariant: e.target.value as "stacked" | "compact",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="stacked">Stacked</option>
        <option value="compact">Compact</option>
      </select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Image Height %</div>
      <input
        type="number"
        min={20}
        max={80}
        value={selectedBlock.data.imageHeightPercent ?? 50}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "listing"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    imageHeightPercent: Math.max(
                      20,
                      Math.min(80, Number(e.target.value) || 50),
                    ),
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-5">
      <div className={inspectorLabelClass()}>Metadata</div>

      <div className="mt-3 space-y-3">
        {selectedBlock.data.metadata.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
          >
            <div className={inspectorLabelClass()}>Label</div>
            <input
              type="text"
              value={item.label}
              onChange={(e) =>
                updateSelectedBlock((block) =>
                  block.type !== "listing"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          metadata: block.data.metadata.map((entry) =>
                            entry.id === item.id
                              ? { ...entry, label: e.target.value }
                              : entry,
                          ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />

            <div className="mt-4">
              <div className={inspectorLabelClass()}>Value</div>
              <input
                type="text"
                value={item.value}
                onChange={(e) =>
                  updateSelectedBlock((block) =>
                    block.type !== "listing"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            metadata: block.data.metadata.map((entry) =>
                              entry.id === item.id
                                ? { ...entry, value: e.target.value }
                                : entry,
                            ),
                          },
                        },
                  )
                }
                className={inspectorInputClass()}
              />
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                className={toolSetButtonClass("remove")}
                onClick={() =>
                  updateSelectedBlock((block) =>
                    block.type !== "listing"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            metadata:
                              block.data.metadata.length > 1
                                ? block.data.metadata.filter(
                                    (entry) => entry.id !== item.id,
                                  )
                                : block.data.metadata,
                          },
                        },
                  )
                }
                title="Remove metadata item"
              >
                ×
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          className={toolSetButtonClass("front")}
          onClick={() =>
            updateSelectedBlock((block) =>
              block.type !== "listing"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      metadata: [
                        ...block.data.metadata,
                        {
                          id: makeClientId("meta"),
                          label: "Label",
                          value: "Value",
                        },
                      ],
                    },
                  },
            )
          }
        >
          Add Metadata Item
        </button>
      </div>
    </div>
  </div>
) : selectedBlock?.type === "cart" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Cart</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "cart"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    heading: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
        placeholder="Cart"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Tax Rate</div>
      <input
        type="number"
        step="0.01"
        min="0"
        value={selectedBlock.data.taxRate ?? 0}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "cart"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    taxRate:
                      e.target.value === ""
                        ? 0
                        : Math.max(0, Number(e.target.value)),
                  },
                },
          )
        }
        className={inspectorInputClass()}
        placeholder="0"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Discount</div>
      <input
        type="number"
        step="0.01"
        min="0"
        value={selectedBlock.data.discount ?? 0}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "cart"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    discount:
                      e.target.value === ""
                        ? 0
                        : Math.max(0, Number(e.target.value)),
                  },
                },
          )
        }
        className={inspectorInputClass()}
        placeholder="0"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Button Text</div>
      <input
        type="text"
        value={selectedBlock.data.buttonText ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "cart"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    buttonText: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
        placeholder="Checkout"
      />
    </div>
  </div>
) : null}

                {selectedBlock?.type === "image" ? (
                  <div className={inspectorCardClass()}>
                    <div className={inspectorLabelClass()}>Image</div>

                    <button
                      type="button"
                      className="mt-3 inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
                      onClick={() =>
                        void uploadImageToSelectedBlock(selectedBlock.id)
                      }
                    >
                      Browse Image
                    </button>

                    <div className="mt-4 grid grid-cols-1 gap-3">
                      <div>
                        <div className={inspectorLabelClass()}>
                          Horizontal Position
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={selectedBlock.data.image.positionX ?? 50}
                          onChange={(e) =>
                            updateSelectedImagePatch({
                              positionX: Number(e.target.value),
                            })
                          }
                          className="mt-2 w-full"
                        />
                        <div className="mt-1 text-xs text-neutral-500">
                          {selectedBlock.data.image.positionX ?? 50}%
                        </div>
                      </div>

                      <div>
                        <div className={inspectorLabelClass()}>
                          Vertical Position
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={selectedBlock.data.image.positionY ?? 50}
                          onChange={(e) =>
                            updateSelectedImagePatch({
                              positionY: Number(e.target.value),
                            })
                          }
                          className="mt-2 w-full"
                        />
                        <div className="mt-1 text-xs text-neutral-500">
                          {selectedBlock.data.image.positionY ?? 50}%
                        </div>
                      </div>

                      <div>
                        <div className={inspectorLabelClass()}>Zoom</div>
                        <input
                          type="range"
                          min={50}
                          max={300}
                          value={Math.round(
                            (selectedBlock.data.image.zoom ?? 1) * 100,
                          )}
                          onChange={(e) =>
                            updateSelectedImagePatch({
                              zoom: Number(e.target.value) / 100,
                            })
                          }
                          className="mt-2 w-full"
                        />
                        <div className="mt-1 text-xs text-neutral-500">
                          {Math.round((selectedBlock.data.image.zoom ?? 1) * 100)}%
                        </div>
                      </div>

                      <div>
                        <div className={inspectorLabelClass()}>Rotation</div>
                        <input
                          type="range"
                          min={-180}
                          max={180}
                          value={selectedBlock.data.image.rotation ?? 0}
                          onChange={(e) =>
                            updateSelectedImagePatch({
                              rotation: Number(e.target.value) || 0,
                            })
                          }
                          className="mt-2 w-full"
                        />
                        <div className="mt-1 text-xs text-neutral-500">
                          {selectedBlock.data.image.rotation ?? 0}°
                        </div>
                      </div>

                      <div>
                        <div className={inspectorLabelClass()}>Opacity</div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={Math.round(
                            (selectedBlock.data.image.opacity ?? 1) * 100,
                          )}
                          onChange={(e) =>
                            updateSelectedImagePatch({
                              opacity: Number(e.target.value) / 100,
                            })
                          }
                          className="mt-2 w-full"
                        />
                        <div className="mt-1 text-xs text-neutral-500">
                          {Math.round((selectedBlock.data.image.opacity ?? 1) * 100)}%
                        </div>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className={inspectorLabelClass()}>Fade Edges</div>

                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                          <input
                            type="checkbox"
                            checked={Boolean(selectedBlock.data.image.fade?.top)}
                            onChange={(e) =>
                              updateSelectedImageFadePatch({
                                top: e.target.checked,
                              })
                            }
                          />
                          Top
                        </label>

                        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                          <input
                            type="checkbox"
                            checked={Boolean(selectedBlock.data.image.fade?.bottom)}
                            onChange={(e) =>
                              updateSelectedImageFadePatch({
                                bottom: e.target.checked,
                              })
                            }
                          />
                          Bottom
                        </label>

                        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                          <input
                            type="checkbox"
                            checked={Boolean(selectedBlock.data.image.fade?.left)}
                            onChange={(e) =>
                              updateSelectedImageFadePatch({
                                left: e.target.checked,
                              })
                            }
                          />
                          Left
                        </label>

                        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                          <input
                            type="checkbox"
                            checked={Boolean(selectedBlock.data.image.fade?.right)}
                            onChange={(e) =>
                              updateSelectedImageFadePatch({
                                right: e.target.checked,
                              })
                            }
                          />
                          Right
                        </label>
                      </div>

                      <div className="mt-4">
                        <div className={inspectorLabelClass()}>Fade Size</div>
                        <input
                          type="range"
                          min={0}
                          max={50}
                          value={selectedBlock.data.image.fade?.size ?? 15}
                          onChange={(e) =>
                            updateSelectedImageFadePatch({
                              size: Number(e.target.value),
                            })
                          }
                          className="mt-2 w-full"
                        />
                        <div className="mt-1 text-xs text-neutral-500">
                          {selectedBlock.data.image.fade?.size ?? 15}%
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

{selectedBlock?.type === "gallery" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Gallery</div>

    <div className="mt-4 grid grid-cols-2 gap-3">
      <div>
        <div className={inspectorLabelClass()}>Columns</div>
        <input
          type="number"
          min={1}
          max={12}
          value={(selectedBlock.data as any).columns ?? 2}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "gallery"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      columns: Math.max(
                        1,
                        Math.min(12, Number(e.target.value) || 1),
                      ),
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div>
        <div className={inspectorLabelClass()}>Rows</div>
        <input
          type="number"
          min={1}
          max={12}
          value={
            (selectedBlock.data as any).rows ??
            Math.max(
              1,
              Math.ceil(
                (selectedBlock.data.images?.length ?? 0) /
                  ((selectedBlock.data as any).columns ?? 2),
              ),
            )
          }
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "gallery"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      rows: Math.max(
                        1,
                        Math.min(12, Number(e.target.value) || 1),
                      ),
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>
    </div>

    <button
      type="button"
      className="mt-3 inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
      onClick={() =>
        void uploadGalleryImagesToBlock(selectedBlock.id)
      }
    >
      Add Images
    </button>

    <div className="mt-4 space-y-3">
      {selectedBlock.data.images.map((image, index) => (
        <div
          key={image.id}
          className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
        >
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-lg border border-neutral-200 bg-white">
              <img
                src={image.url}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-neutral-900">
                Image {index + 1}
              </div>
            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className={toolSetButtonClass("front")}
                                onClick={() =>
                                  moveGalleryImage(
                                    selectedBlock.id,
                                    image.id,
                                    "up",
                                  )
                                }
                                disabled={index === 0}
                                title="Move up"
                              >
                                ↑
                              </button>

                              <button
                                type="button"
                                className={toolSetButtonClass("front")}
                                onClick={() =>
                                  moveGalleryImage(
                                    selectedBlock.id,
                                    image.id,
                                    "down",
                                  )
                                }
                                disabled={
                                  index ===
                                  selectedBlock.data.images.length - 1
                                }
                                title="Move down"
                              >
                                ↓
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {!selectedBlock.data.images.length ? (
                        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-3 py-4 text-sm text-neutral-500">
                          No gallery images yet.
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {selectedBlock?.type === "image_carousel" ? (
                  <div id="inspector-image-carousel" className={inspectorCardClass()}>
                    <div className={inspectorLabelClass()}>Image Carousel</div>

                    <button
                      type="button"
                      className="mt-3 inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
                      onClick={() =>
                        void uploadMultipleImagesToCarousel(selectedBlock.id)
                      }
                    >
                      Add Images
                    </button>

                    <div className="mt-4">
                      <div className={inspectorLabelClass()}>Heading</div>
                      <input
                        ref={carouselHeadingInputRef}
                        type="text"
                        value={selectedBlock.data.heading ?? ""}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            blocks: updateImageCarouselField(
                              prev.blocks,
                              selectedBlock.id,
                              "heading",
                              e.target.value,
                            ),
                          }))
                        }
                        className={inspectorInputClass()}
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <div className={inspectorLabelClass()}>
                          Visible Count
                        </div>
                        <input
                          type="number"
                          min={1}
                          max={6}
                          value={selectedBlock.data.visibleCount ?? 1}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              blocks: updateImageCarouselNumericField(
                                prev.blocks,
                                selectedBlock.id,
                                "visibleCount",
                                Math.max(
                                  1,
                                  Math.min(6, Number(e.target.value) || 1),
                                ),
                              ),
                            }))
                          }
                          className={inspectorInputClass()}
                        />
                      </div>

                      <div>
                        <div className={inspectorLabelClass()}>
                          Interval (ms)
                        </div>
                        <input
                          type="number"
                          min={1000}
                          step={500}
                          value={selectedBlock.data.intervalMs ?? 3000}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              blocks: updateImageCarouselNumericField(
                                prev.blocks,
                                selectedBlock.id,
                                "intervalMs",
                                Math.max(1000, Number(e.target.value) || 3000),
                              ),
                            }))
                          }
                          className={inspectorInputClass()}
                        />
                      </div>
                    </div>

                    <div className="mt-4 space-y-4">
                      {selectedBlock.data.items.map((item, index) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
                        >
                          <div className="mb-3 text-sm font-medium text-neutral-900">
                            Slide {index + 1}
                          </div>

                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <div className={inspectorLabelClass()}>
                                Image Horizontal Position
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={item.positionX ?? 50}
                                onChange={(e) =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    blocks: updateImageCarouselItemField(
                                      prev.blocks,
                                      selectedBlock.id,
                                      item.id,
                                      "positionX",
                                      Number(e.target.value),
                                    ),
                                  }))
                                }
                                className="mt-2 w-full"
                              />
                              <div className="mt-1 text-xs text-neutral-500">
                                {item.positionX ?? 50}%
                              </div>
                            </div>

                            <div>
                              <div className={inspectorLabelClass()}>
                                Image Vertical Position
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={item.positionY ?? 50}
                                onChange={(e) =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    blocks: updateImageCarouselItemField(
                                      prev.blocks,
                                      selectedBlock.id,
                                      item.id,
                                      "positionY",
                                      Number(e.target.value),
                                    ),
                                  }))
                                }
                                className="mt-2 w-full"
                              />
                              <div className="mt-1 text-xs text-neutral-500">
                                {item.positionY ?? 50}%
                              </div>
                            </div>

                            <div>
                              <div className={inspectorLabelClass()}>
                                Image Zoom
                              </div>
                              <input
                                type="range"
                                min={50}
                                max={300}
                                value={Math.round((item.zoom ?? 1) * 100)}
                                onChange={(e) =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    blocks: updateImageCarouselItemField(
                                      prev.blocks,
                                      selectedBlock.id,
                                      item.id,
                                      "zoom",
                                      Number(e.target.value) / 100,
                                    ),
                                  }))
                                }
                                className="mt-2 w-full"
                              />
                              <div className="mt-1 text-xs text-neutral-500">
                                {Math.round((item.zoom ?? 1) * 100)}%
                              </div>
                            </div>

                            <div>
                              <div className={inspectorLabelClass()}>
                                Image Rotate
                              </div>
                              <input
                                type="range"
                                min={-180}
                                max={180}
                                value={item.rotation ?? 0}
                                onChange={(e) =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    blocks: updateImageCarouselItemField(
                                      prev.blocks,
                                      selectedBlock.id,
                                      item.id,
                                      "rotation",
                                      Number(e.target.value),
                                    ),
                                  }))
                                }
                                className="mt-2 w-full"
                              />
                              <div className="mt-1 text-xs text-neutral-500">
                                {item.rotation ?? 0}°
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4">
                      <div className={inspectorLabelClass()}>
                        Scroll Direction
                      </div>
                      <select
                        value={selectedBlock.data.scrollDirection ?? "left"}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            blocks: updateImageCarouselField(
                              prev.blocks,
                              selectedBlock.id,
                              "scrollDirection",
                              e.target.value,
                            ),
                          }))
                        }
                        className={inspectorInputClass()}
                      >
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                        <option value="up">Up</option>
                        <option value="down">Down</option>
                      </select>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3">
                      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                        <input
                          type="checkbox"
                          checked={Boolean(selectedBlock.data.autoRotate)}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              blocks: updateImageCarouselToggle(
                                prev.blocks,
                                selectedBlock.id,
                                "autoRotate",
                                e.target.checked,
                              ),
                            }))
                          }
                        />
                        Auto rotate
                      </label>

                      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                        <input
                          type="checkbox"
                          checked={Boolean(selectedBlock.data.pauseOnHover)}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              blocks: updateImageCarouselToggle(
                                prev.blocks,
                                selectedBlock.id,
                                "pauseOnHover",
                                e.target.checked,
                              ),
                            }))
                          }
                        />
                        Pause on hover
                      </label>

                      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                        <input
                          type="checkbox"
                          checked={Boolean(selectedBlock.data.showOverlay)}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              blocks: updateImageCarouselToggle(
                                prev.blocks,
                                selectedBlock.id,
                                "showOverlay",
                                e.target.checked,
                              ),
                            }))
                          }
                        />
                        Show overlay
                      </label>

                      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                        <input
                          type="checkbox"
                          checked={Boolean(selectedBlock.data.showTitles)}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              blocks: updateImageCarouselToggle(
                                prev.blocks,
                                selectedBlock.id,
                                "showTitles",
                                e.target.checked,
                              ),
                            }))
                          }
                        />
                        Show titles
                      </label>

                      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
                        <input
                          type="checkbox"
                          checked={Boolean(selectedBlock.data.openLinksInNewTab)}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              blocks: updateImageCarouselToggle(
                                prev.blocks,
                                selectedBlock.id,
                                "openLinksInNewTab",
                                e.target.checked,
                              ),
                            }))
                          }
                        />
                        Open links in new tab
                      </label>
                    </div>

                    <div className="mt-5">
                      <div className={inspectorLabelClass()}>
                        Carousel Items
                      </div>

                      <div className="mt-3 space-y-3">
                        {selectedBlock.data.items.map((item, index) => (
                          <div
                            key={item.id}
                            className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
                          >
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <div className="text-sm font-medium text-neutral-900">
                                Slide {index + 1}
                              </div>

                              <button
                                type="button"
                                className={toolSetButtonClass("remove")}
                                onClick={() =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    blocks: removeImageCarouselItem(
                                      prev.blocks,
                                      selectedBlock.id,
                                      item.id,
                                    ),
                                  }))
                                }
                                title="Remove slide"
                              >
                                ×
                              </button>
                            </div>

                            <button
                              type="button"
                              className="mb-3 inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
                              onClick={() =>
                                void uploadImageToCarouselItem(
                                  selectedBlock.id,
                                  item.id,
                                )
                              }
                            >
                              {item.imageUrl ? "Replace Image" : "Upload Image"}
                            </button>

                            {item.imageUrl ? (
                              <div className="mb-3 h-24 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white">
                                <img
                                  src={item.imageUrl}
                                  alt={item.title || `Slide ${index + 1}`}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : null}

                            <div>
                              <div className={inspectorLabelClass()}>Title</div>
                              <input
                                ref={(el) => {
                                  carouselItemTitleInputRefs.current[item.id] = el;
                                }}
                                type="text"
                                value={item.title ?? ""}
                                onChange={(e) =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    blocks: updateImageCarouselItemField(
                                      prev.blocks,
                                      selectedBlock.id,
                                      item.id,
                                      "title",
                                      e.target.value,
                                    ),
                                  }))
                                }
                                className={inspectorInputClass()}
                              />
                            </div>

                            <div className="mt-4">
                              <div className={inspectorLabelClass()}>
                                Subtitle
                              </div>
                              <input
                                ref={(el) => {
                                  carouselItemSubtitleInputRefs.current[item.id] = el;
                                }}
                                type="text"
                                value={item.subtitle ?? ""}
                                onChange={(e) =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    blocks: updateImageCarouselItemField(
                                      prev.blocks,
                                      selectedBlock.id,
                                      item.id,
                                      "subtitle",
                                      e.target.value,
                                    ),
                                  }))
                                }
                                className={inspectorInputClass()}
                              />
                            </div>

                            <div className="mt-4">
                              <div className={inspectorLabelClass()}>
                                Link URL
                              </div>
                              <input
                                ref={(el) => {
                                  carouselItemHrefInputRefs.current[item.id] = el;
                                }}
                                type="text"
                                value={item.href ?? ""}
                                onChange={(e) =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    blocks: updateImageCarouselItemField(
                                      prev.blocks,
                                      selectedBlock.id,
                                      item.id,
                                      "href",
                                      e.target.value,
                                    ),
                                  }))
                                }
                                className={inspectorInputClass()}
                                placeholder="/roast/jordan or https://..."
                              />
                            </div>

                            <div className="mt-4">
                              <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-800">
                                <input
                                  type="checkbox"
                                  checked={Boolean(item.openInNewTab)}
                                  onChange={(e) =>
                                    setDraft((prev) => ({
                                      ...prev,
                                      blocks: prev.blocks.map((block) =>
                                        block.id === selectedBlock.id &&
                                        block.type === "image_carousel"
                                          ? {
                                              ...block,
                                              data: {
                                                ...block.data,
                                                items: block.data.items.map(
                                                  (entry) =>
                                                    entry.id === item.id
                                                      ? {
                                                          ...entry,
                                                          openInNewTab:
                                                            e.target.checked,
                                                        }
                                                      : entry,
                                                ),
                                              },
                                            }
                                          : block,
                                      ),
                                    }))
                                  }
                                />
                                Open this slide in new tab
                              </label>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          className={toolSetButtonClass("front")}
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              blocks: addImageCarouselItem(
                                prev.blocks,
                                selectedBlock.id,
                              ),
                            }))
                          }
                        >
                          Add Slide
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className={inspectorCardClass()}>
                  <div className={inspectorLabelClass()}>Tool Set</div>

                  <div className="mt-4 space-y-3">
                    {toolSetItems.map((tool) => (
<div
  key={tool.id}
  role="button"
  tabIndex={0}
  onClick={() => setSelection(selectionFromCanvasBlockId(tool.id))}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelection(selectionFromCanvasBlockId(tool.id));
    }
  }}
  className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 cursor-pointer"
>
  <div className="flex items-center justify-between gap-3">
    <div className="min-w-0">
      <div className="truncate text-sm font-semibold text-neutral-900">
        {tool.label}
      </div>
      <div className="mt-1 text-xs uppercase tracking-[0.12em] text-neutral-500">
        {tool.kind}
      </div>
    </div>

    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        className={toolSetButtonClass("back")}
        onClick={(e) => {
          e.stopPropagation();
          handleSendToBack(tool.id);
          setSelection(selectionFromCanvasBlockId(tool.id));
        }}
        title="Send to back"
      >
        Back
      </button>

      <button
        type="button"
        className={toolSetButtonClass("front")}
        onClick={(e) => {
          e.stopPropagation();
          handleBringToFront(tool.id);
          setSelection(selectionFromCanvasBlockId(tool.id));
        }}
        title="Bring to front"
      >
        Front
      </button>

      <button
        type="button"
        className={toolSetButtonClass("remove")}
        onClick={(e) => {
          e.stopPropagation();
          removeCanvasBlock(tool.id);
        }}
        title="Remove block"
      >
        ×
      </button>
    </div>
  </div>
</div>
                    ))}

                    {!toolSetItems.length ? (
                      <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-3 py-4 text-sm text-neutral-500">
                        No blocks on canvas.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div
  ref={bottomBarRef}
  className="sticky bottom-0 z-50 border-t border-black/10 bg-[#e9e9e9] shadow-[0_-2px_10px_rgba(0,0,0,0.06)]"
>
  <div className="border-b border-black/10 px-6 py-2">
    <div className="rounded-md border border-black/10 bg-white/80 px-2 py-1 shadow-sm backdrop-blur-sm">
      <div
        ref={dockedScrollRef}
        className="overflow-x-auto overflow-y-hidden"
        style={{ height: 18 }}
      >
        <div
          style={{
            width: scrollbarWidth,
            height: 1,
          }}
        />
      </div>
    </div>
  </div>

<div className="relative flex items-start justify-between gap-6 border-b border-black/10 px-6 py-1">
    <div className="flex flex-wrap items-start gap-2">
      {CATEGORY_ORDER.map((category) => (
        <div key={category} className="relative">
          <button
            type="button"
            onClick={() => toggleToolMenu(category)}
            className={bottomCategoryClass(activeCategory === category, category)}
          >
            <span>{getToolGlyph(category)}</span>
            <span>{category}</span>
          </button>

          {openToolMenu === category ? (
            <div
              ref={toolMenuRef}
              className="absolute bottom-[calc(100%+10px)] left-0 z-[80] w-max max-w-[420px] rounded-2xl border border-neutral-300 bg-white p-3 shadow-2xl"
            >
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                {category} Tools
              </div>

              <div className="flex max-w-[400px] flex-wrap gap-2">
{CATEGORY_BUTTONS[category].map((tool, index) => (
  <button
    key={`${category}-${tool.kind}-${tool.type}-${index}`}
    type="button"
    className={toolButtonClass()}
                    onClick={() => {
                      if (tool.kind === "block") addBlock(tool.type);
                      if (tool.kind === "shape") addShape(tool.type);
                      if (tool.kind === "page") addPageBlock(tool.type);
                      setOpenToolMenu(null);
                    }}
                    draggable
                    onDragStart={(e) => {
                      const payload: ToolDropPayload =
                        tool.kind === "block"
                          ? { kind: "block", type: tool.type }
                          : tool.kind === "shape"
                            ? { kind: "shape", type: tool.type }
                            : { kind: "page", type: tool.type };

                      e.dataTransfer.setData(
                        "application/kht-tool",
                        JSON.stringify(payload),
                      );
                    }}
                    title={tool.label}
                  >
                    {getToolGlyph(tool.label)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
<div className="flex flex-col items-end gap-1">
<div className="flex items-center gap-4 h-12">



        <button
          type="button"
          className={actionButtonClass(false)}
          onClick={openPreviewWindow}
        >
          Open Preview
        </button>

        <button
          type="button"
          className={[
            "inline-flex h-12 items-center justify-center rounded-md border px-4 text-sm font-medium transition",
            saveState === "saving"
              ? "border-blue-600 bg-blue-600 text-white animate-pulse"
              : saveState === "saved"
                ? "border-emerald-600 bg-emerald-600 text-white"
                : saveState === "error"
                  ? "border-red-600 bg-red-600 text-white"
                  : saveState === "signin-required"
                    ? "border-amber-500 bg-amber-500 text-white"
                    : "border-blue-600 bg-blue-600 text-white hover:bg-blue-700",
          ].join(" ")}
          onClick={() => void onSaveDraft?.(draft)}
          disabled={saveState === "saving"}
        >
          {saveState === "saving"
            ? "Saving..."
            : saveState === "saved"
              ? "Saved ✓"
              : saveState === "error"
                ? "Save Failed"
                : saveState === "signin-required"
                  ? "Sign In to Save"
                  : "Save Draft"}
        </button>

        {publishHref ? (
          <button
            type="button"
            onClick={() => {
              onPublishClick?.();
            }}
            className="inline-flex h-12 items-center justify-center rounded-md border border-neutral-950 bg-neutral-950 px-4 text-sm font-medium text-white transition hover:bg-black"
          >
            {publishLabel}
          </button>
        ) : null}
      </div>

      {saveMessage ? (
        <div className="text-xs text-neutral-500">{saveMessage}</div>
      ) : null}
    </div>
  </div>
</div>


<AppModal
  open={richTextLinkModalOpen}
  title="Add Link"
  description="Enter the link URL for the selected text."
  confirmText="Apply Link"
  cancelText="Cancel"
  onConfirm={applyRichTextLinkFromModal}
  onCancel={() => setRichTextLinkModalOpen(false)}
>
  <div className="mt-4">
    <div className={inspectorLabelClass()}>URL</div>
    <input
      type="text"
      value={richTextLinkValue}
      onChange={(e) => setRichTextLinkValue(e.target.value)}
      className={inspectorInputClass()}
      placeholder="https://example.com"
    />
  </div>
</AppModal>

<AppModal
  open={removeAllModalOpen}
  title="Remove all blocks?"
  description="This will clear all page text blocks and custom blocks from the canvas."
  confirmText="Remove All"
  cancelText="Cancel"
  danger
  onConfirm={confirmRemoveAllBlocks}
  onCancel={cancelRemoveAllBlocks}
/>
<AppModal
  open={resetDraftModalOpen}
  title="Reset draft?"
  description="This will restore the draft to the original design layout state that was loaded when this editor opened."
  confirmText="Reset Draft"
  cancelText="Cancel"
  danger
  onConfirm={confirmResetDraft}
  onCancel={cancelResetDraft}
/>
    </div>
  );
}