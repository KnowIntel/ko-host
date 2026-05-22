// components\templates\DesignLayoutEditor.tsx
"use client";

import AppModal from "@/components/ui/AppModal";
import { BUILDER_TOOL_GUIDES } from "@/components/templates/builderToolGuides";
import { BLOCK_GUIDES } from "@/components/templates/blockGuideContent";
import PopBalloonCanvasPreview from "@/components/blocks/PopBalloonCanvasPreview";
import { getStoreMeta } from "@/lib/utils/getStoreMeta";
import { uploadImage } from "@/lib/uploadImage";
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
  moveCanvasItemBackward,
  moveCanvasItemForward,
} from "@/components/builder/canvas/canvasItemTransforms";

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
import RichTextTiptapEditor from "@/components/blocks/RichTextTiptapEditor";

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
import { deleteVideo, uploadVideo } from "@/lib/uploadVideo";

type Props = {
  templateKey: string;
  designKey: string;
  draft: BuilderDraft;
  setDraft: React.Dispatch<React.SetStateAction<BuilderDraft>>;
  onSaveDraft?: (draft: BuilderDraft) => void | Promise<void>;
  publishHref?: string;
  publishLabel?: string;
  onPublishClick?: () => void;
  builderCapacityContent?: React.ReactNode;
  onOpenAddPage?: () => void;
  onDuplicateActivePage?: () => void;
  saveState?: "idle" | "saving" | "saved" | "error" | "signin-required";
  saveMessage?: string;
  microsite?: {
    is_published?: boolean;
    is_active?: boolean;
    slug?: string;
  };
onRemoveActivePage?: () => void;
onRenameActivePage?: () => void;
pages?: Array<{
  id: string;
  slug: string;
  title: string | null;
  display_order?: number | null;
}>;
activePageId?: string | null;
activePageSlug?: string;
micrositeSlug?: string;
onSelectPage?: (pageId: string) => void;
onReorderPages?: (nextPages: Array<{
  id: string;
  slug: string;
  title: string | null;
  display_order?: number | null;
}>) => void | Promise<void>;
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
    | "backgroundColor"
    | "borderColor"
    | "borderWidth"
    | "borderRadius"
    | "textureEnabled"
    | "textureImageUrl"
    | "textureScale"
    | "texturePositionX"
    | "texturePositionY"
  >
>;

type BottomCategory =
  | "Text"
  | "Media"
  | "Icons"
  | "Layout"
  | "Forms"
  | "Exchange"
  | "Utilities"
  | "Data & Metrics"
  | "Scheduling"
  | "Premium";

type PageBlockType = "title" | "subtitle" | "tagline" | "description";

type ToolDropPayload =
  | {
      kind: "block";
      type: BuilderBlockType;
      label?: string;
      iconName?: string;
      iconUrl?: string;
    }
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
  "Icons",
  "Layout",
  "Forms",
  "Exchange",
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
    | {
        kind: "block";
        label: string;
        type: BuilderBlockType;
        iconName?: string;
      }
    | { kind: "block"; label: "Input Field"; type: "form_field"; iconName?: string }
  >
> = {
  Text: [
{ kind: "page", label: "Title", type: "title" },
{ kind: "page", label: "Subtitle", type: "subtitle" },
{ kind: "block", label: "Label", type: "label" },
{ kind: "block", label: "TextFX", type: "text_fx" },
{ kind: "block", label: "Rich Text", type: "rich_text" },
{ kind: "block", label: "Spreadsheet", type: "spreadsheet" },
  ],
  Media: [
    { kind: "block", label: "Image", type: "image" },
    { kind: "block", label: "Video", type: "video" },
    { kind: "block", label: "Audio", type: "audio" },
    { kind: "block", label: "Gallery", type: "gallery" },
    { kind: "block", label: "Carousel", type: "image_carousel" },
  ],
  Icons: [
    { kind: "block", label: "Graduate Cap", type: "icon", iconName: "graduate-cap" },
    { kind: "block", label: "Open Book", type: "icon", iconName: "open-book" },
    { kind: "block", label: "Closed Book", type: "icon", iconName: "closed-book" },
    { kind: "block", label: "Arrow Up Thick", type: "icon", iconName: "arrow-up-thick" },
    { kind: "block", label: "Arrow Down Thick", type: "icon", iconName: "arrow-down-thick" },
    { kind: "block", label: "Arrow Left Thick", type: "icon", iconName: "arrow-left-thick" },
    { kind: "block", label: "Arrow Right Thick", type: "icon", iconName: "arrow-right-thick" },
    { kind: "block", label: "Arrow Up Thin", type: "icon", iconName: "arrow-up-thin" },
    { kind: "block", label: "Arrow Down Thin", type: "icon", iconName: "arrow-down-thin" },
    { kind: "block", label: "Arrow Left Thin", type: "icon", iconName: "arrow-left-thin" },
    { kind: "block", label: "Arrow Right Thin", type: "icon", iconName: "arrow-right-thin" },
    { kind: "block", label: "Chevron Left", type: "icon", iconName: "chevron-left" },
    { kind: "block", label: "Chevron Right", type: "icon", iconName: "chevron-right" },
    { kind: "block", label: "Paper Airplane", type: "icon", iconName: "paper-airplane" },
    { kind: "block", label: "Shield", type: "icon", iconName: "shield" },
    { kind: "block", label: "Dog Paw", type: "icon", iconName: "dog-paw" },
    { kind: "block", label: "Gable Panel", type: "icon", iconName: "gable_panel" },
    { kind: "block", label: "City", type: "icon", iconName: "city" },
    { kind: "block", label: "Star", type: "icon", iconName: "star" },
    { kind: "block", label: "Heart", type: "icon", iconName: "heart" },
    { kind: "block", label: "Circle", type: "icon", iconName: "circle" },
    { kind: "block", label: "Person", type: "icon", iconName: "person" },
    { kind: "block", label: "People", type: "icon", iconName: "people" },
    { kind: "block", label: "Camera", type: "icon", iconName: "camera" },
    { kind: "block", label: "Calendar", type: "icon", iconName: "calendar" },
    { kind: "block", label: "Globe", type: "icon", iconName: "globe" },
    { kind: "block", label: "Message Thread", type: "icon", iconName: "message-thread" },
    { kind: "block", label: "Location Pin", type: "icon", iconName: "location-pin" },
    { kind: "block", label: "Clock", type: "icon", iconName: "clock" },
    { kind: "block", label: "Jagged Line", type: "icon", iconName: "jagged-line" },
    { kind: "block", label: "Phone", type: "icon", iconName: "phone" },
    { kind: "block", label: "Open Quote", type: "icon", iconName: "open-quote" },
    { kind: "block", label: "Close Quote", type: "icon", iconName: "close-quote" },
    { kind: "block", label: "Photo Placeholder", type: "icon", iconName: "photo-placeholder" },
  ],
  Layout: [
    { kind: "shape", label: "Rectangle", type: "rectangle" },
    { kind: "shape", label: "Circle", type: "circle" },
    { kind: "shape", label: "Line", type: "line" },
    { kind: "block", label: "Wave", type: "wave" },
    { kind: "block", label: "Frame", type: "frame" },
    { kind: "block", label: "Spacer", type: "padding" },
  ],
  Forms: [
    { kind: "block", label: "Input Field", type: "form_field" },
    { kind: "block", label: "Poll", type: "poll" },
    { kind: "block", label: "RSVP", type: "rsvp" },
    { kind: "block", label: "FAQ", type: "faq" },
  ],
  Exchange: [
    { kind: "block", label: "Thread", type: "thread" },
    { kind: "block", label: "File Share", type: "file_share" },
  ],
Utilities: [
  { kind: "block", label: "Button", type: "cta" },
  { kind: "block", label: "Links", type: "links" },
  { kind: "block", label: "Link Hub", type: "link_hub" },
  { kind: "block", label: "Bookmark", type: "bookmark" },
],
  "Data & Metrics": [
    { kind: "block", label: "Highlight", type: "highlight" },
    { kind: "block", label: "Progress Bar", type: "progress_bar" },
  ],
Scheduling: [
  { kind: "block", label: "Countdown", type: "countdown" },
  {
  kind: "block",
  label: "Story Timeline",
  type: "timeline",
  iconName: "timeline",
},
  { kind: "block", label: "Checklist", type: "checklist" },
  { kind: "block", label: "Schedule / Agenda", type: "schedule_agenda" },
  { kind: "block", label: "Map / Location", type: "map_location" },
],
Premium: [
  { kind: "block", label: "Registry", type: "registry" },
  // { kind: "block", label: "Speed Dating", type: "speed_dating" },
  { kind: "block", label: "Pop the Balloon", type: "pop_balloon" },
  { kind: "block", label: "Puzzle", type: "puzzle" },
  { kind: "block", label: "Spin Wheel", type: "spin_wheel" },
  { kind: "block", label: "Donation", type: "donation" },
  { kind: "block", label: "Listing", type: "listing" },
  { kind: "block", label: "Checkout", type: "checkout" },
  { kind: "block", label: "Cart", type: "cart" },
],
};

const TOOL_DESCRIPTIONS: Record<string, string> = {
  Title: "Large headline text for pages",
  Subtitle: "Supporting text under main titles",
  Label: "Small text label or note",
  TextFX: "Stylized animated text effects",
  "Rich Text": "Formatted paragraph text block",

  Image: "Single image with optional caption",
  Video: "Embedded video media block",
  Audio: "Upload and play audio",
  Gallery: "Multiple images in grid layout",
  Carousel: "Swipeable image carousel display",

  Rectangle: "Basic rectangular shape layer",
  Circle: "Basic circular shape layer",
  Line: "Straight divider or accent line",
  Wave: "Curvy decorative divider line",
  Frame: "Canvas-only capture boundary",
  Spacer: "Adds empty vertical spacing",

  "Input Field": "Collect simple user text input",
  Poll: "Let visitors vote on options",
  RSVP: "Collect event attendance responses",
  FAQ: "Expandable questions and answers",

  Thread: "Public discussion message thread",
  "File Share": "Upload and share visitor files",

  Bookmark: "Jump point anchor for page navigation",
  Button: "Clickable call-to-action button",
  Links: "Stack of important links",
  "Link Hub": "Social and web link collection",

  Highlight: "Feature stat or key callout",
  "Progress Bar": "Visual progress toward a goal",
  Spreadsheet: "Excel-like editable table block",

  Countdown: "Timer counting to an event",
  Checklist: "Trackable list of tasks",
  "Schedule / Agenda": "Timed event schedule list",
  "Map / Location": "Location details with map info",

  Puzzle: "Drag-and-drop image puzzle game",
  "Spin Wheel": "Interactive prize wheel mini-game",
  Registry: "Gift or item registry list",
  "Pop the Balloon": "Interactive elimination game experience",
  Donation: "Collect support or contributions",
  Listing: "Showcase item with details",
  Checkout: "Sell single product or service",
  Cart: "Shopping cart purchase flow",
};

const MIN_CANVAS_ZOOM = 50;
const MAX_CANVAS_ZOOM = 200;
const CANVAS_ZOOM_STEP = 10;
const PREVIEW_MESSAGE_TYPE = "ko-host-preview-draft";
const PREVIEW_READY_MESSAGE_TYPE = "ko-host-preview-ready";
const PREVIEW_RECEIVED_MESSAGE_TYPE = "ko-host-preview-received";
function formatCurrency(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

const FONT_FAMILY_OPTIONS = [
  "inherit",

  // Core
  "Inter",
  "DM Sans",
  "Poppins",
  "Playfair Display",
  "Cormorant Garamond",
  "Great Vibes",

  // Script / invitation
  "Dancing Script",
  "Pacifico",
  "Allura",
  "Parisienne",
  "Sacramento",
  "Playball",
  "Satisfy",
  "Tangerine",

  // Serif
  "Prata",
  "Marcellus",
  "Bodoni Moda",
  "Cinzel",
  "Libre Baskerville",
  "Merriweather",
  "Lora",
  "Crimson Text",

  // Display
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
  "Bebas Neue",
  "Special Elite",

  // System

  // System
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
  // Core
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

  // Script
  "Dancing Script":
    'var(--font-dancing-script), "Dancing Script", cursive',
  Pacifico: 'var(--font-pacifico), Pacifico, cursive',
  Allura: 'var(--font-allura), Allura, cursive',
  Parisienne: 'var(--font-parisienne), Parisienne, cursive',
  Sacramento: 'var(--font-sacramento), Sacramento, cursive',
  Playball: 'var(--font-playball), Playball, cursive',
  Satisfy: 'var(--font-satisfy), Satisfy, cursive',
  Tangerine: 'var(--font-tangerine), Tangerine, cursive',

  // Serif
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

  // Display
  Anton: 'var(--font-anton), Anton, sans-serif',
  Bangers: 'var(--font-bangers), Bangers, cursive',
  Orbitron: 'var(--font-orbitron), Orbitron, sans-serif',
  Righteous: 'var(--font-righteous), Righteous, cursive',
  "Alfa Slab One": 'var(--font-alfa-slab-one), "Alfa Slab One", serif',
  "Permanent Marker":
    'var(--font-permanent-marker), "Permanent Marker", cursive',
  Caveat: 'var(--font-caveat), Caveat, cursive',
  "Indie Flower": 'var(--font-indie-flower), "Indie Flower", cursive',
  "Exo 2": 'var(--font-exo-2), "Exo 2", sans-serif',
  Rajdhani: 'var(--font-rajdhani), Rajdhani, sans-serif',
  Teko: 'var(--font-teko), Teko, sans-serif',
  "Abril Fatface": 'var(--font-abril-fatface), "Abril Fatface", serif',
  "Bebas Neue": 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
  "Special Elite": 'var(--font-special-elite), "Special Elite", monospace',

  // System
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
  dataVersion:
    block.type === "progress_bar" ? JSON.stringify(block.data) : undefined,
} as CanvasGridItem));

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

  const ctaButtonOptions = draft.blocks
  .filter((block) => block.type === "cta")
  .map((block) => ({
    id: block.id,
    label:
      block.type === "cta"
        ? block.data.buttonText || block.label || "Button"
        : "Button",
  }));

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

  if (block.type === "audio") {
    return { kind: "otherBlock", blockId, blockType: "audio", label: "Audio" };
  }

  if (block.type === "frame") {
    return { kind: "otherBlock", blockId, blockType: "frame", label: "Frame" };
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

  if (block.type === "wave") {
  return { kind: "otherBlock", blockId, blockType: "wave", label: block.label || "Wave" };
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

if (block.type === "speed_dating" || block.type === "pop_balloon") {
  return {
    kind: "otherBlock",
    blockId,
    blockType: block.type,
    label:
      block.type === "pop_balloon"
        ? block.label || "Pop the Balloon"
        : block.label || "Speed Dating",
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

function toBookmarkSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

function renderToolGlyph(tool: (typeof CATEGORY_BUTTONS)[BottomCategory][number]) {
  if (
    tool.kind === "block" &&
    tool.type === "icon" &&
    "iconName" in tool &&
    tool.iconName
  ) {
    return (
      <span
        className="block h-5 w-5"
        style={{
          backgroundColor: "#111827",
          WebkitMaskImage: `url("/media-icons/${tool.iconName}.svg")`,
          maskImage: `url("/media-icons/${tool.iconName}.svg")`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      />
    );
  }

  return getToolGlyph(tool.label);
}

function getToolGlyph(label: string) {
  if (label === "Text") return "T";
  if (label === "Media") return "🖼";
  if (label === "Icons") return "⭐";
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
  if (label === "Graduate Cap") return "🎓";
  if (label === "Open Book") return "📖";
  if (label === "Closed Book") return "📕";
  if (label === "Paper Airplane") return "🛩";
  if (label === "Shield") return "🛡";
  if (label === "Dog Paw") return "🐾";
  if (label === "City") return "🏙";
  if (label === "Star") return "⭐";
  if (label === "Heart") return "❤";
  if (label === "Arrow Up Thick") return "⬆";
  if (label === "Arrow Down Thick") return "⬇";
  if (label === "Arrow Left Thick") return "⬅";
  if (label === "Arrow Right Thick") return "➡";
  if (label === "Arrow Up Thin") return "↑";
  if (label === "Arrow Down Thin") return "↓";
  if (label === "Arrow Left Thin") return "←";
  if (label === "Arrow Right Thin") return "→";
  if (label === "Gable Panel") {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M3 9.5L12 4L21 9.5V20H3V9.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
  if (label === "Chevron Left") {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M15 5L8 12L15 19"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

if (label === "Chevron Right") {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M9 5L16 12L9 19"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
  if (label === "Person") return "👤";
  if (label === "People") return "👥";
  if (label === "Camera") return "📷";
  if (label === "Calendar") return "📅";
  if (label === "Globe") return "🌐";
  if (label === "Photo Placeholder") return "▧";
  if (label === "Story Timeline") return "⋯";
  if (label === "Message Thread") return "💬";
  if (label === "Jagged Line") return "〽";
  if (label === "Location Pin") return "📍";
  if (label === "Clock") return "🕒";
  if (label === "Gallery") return "▥";
  if (label === "Rectangle") return "▭";
  if (label === "Circle") return "◯";
  if (label === "Line") return "—";
  if (label === "Wave") return "〰";
  if (label === "Frame") return "▣";
  if (label === "Spacer") return "↕";
  if (label === "Poll") return "☑";
  if (label === "RSVP") return "✉";
  if (label === "Button") return "▣";
  if (label === "CTA") return "👉";
  if (label === "Countdown") return "◔";
  if (label === "FAQ") return "?";
  if (label === "Thread") return "☰";
  if (label === "Bookmark") return "🔖";
  if (label === "Links") return "🔗";
  if (label === "Highlight") return "★";
  if (label === "Listing") return "🧾";  
  if (label === "Checkout") return "💳";  
  if (label === "Cart") return "🛒";  
  if (label === "Carousel") return "⇄";
  if (label === "Input Field") return "⌨";
  if (label === "Rich Text") return "📝";
  if (label === "Video") return "▶";
  if (label === "Audio") return "♫";
  if (label === "Progress Bar") return "▰";
  if (label === "Spreadsheet") return "▦";
  if (label === "Donation") return "💝";
  if (label === "Link Hub") return "🌐";
  if (label === "Checklist") return "☑";
  if (label === "Schedule / Agenda") return "🗓";
  if (label === "Map / Location") return "📍";
  if (label === "File Share") return "📁";
  if (label === "Speed Dating") return "❤";
  if (label === "Pop the Balloon") return "🎈";
  if (label === "Puzzle") return "🧩";
  if (label === "Spin Wheel") return "🎡";
  if (label === "Registry") return "🎁";
  if (label === "Exchange") return "⇄";
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
  onOpenAddPage,
  onDuplicateActivePage,
  onRemoveActivePage,
  onRenameActivePage,
  pages,
  activePageId,
  activePageSlug,
  micrositeSlug,
  onSelectPage,
  onReorderPages,
  saveState,
  saveMessage,
  microsite,
  builderCapacityContent,
}: Props) {
  const [resetDraftModalOpen, setResetDraftModalOpen] = useState(false);
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null);
  const selectedPageLength =
    ((draft as DraftWithPageExtras).pageLength ?? "1800") as PageLengthOption;

const [listingStyleTarget, setListingStyleTarget] = useState<
  "title" | "description" | "metadata" | "price" | "quantity"
>("title");

const [formFieldTextTarget, setFormFieldTextTarget] = useState<"form" | "text">(
  "form",
);

  const [selectedRsvpElementKey, setSelectedRsvpElementKey] = useState<
    | "form"
    | "image"
    | "heading"
    | "nameLabel"
    | "firstName"
    | "lastName"
    | "email"
    | "address"
    | "attending"
    | "meal"
    | "guestToggle"
    | "guestCount"
    | "guestName"
    | "comments"
  >("heading");

  const isPublished = microsite?.is_published;
  const isActive = microsite?.is_active;
  const slug = microsite?.slug;
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [fontMenuPosition, setFontMenuPosition] = useState({
    left: 0,
    top: 0,
  });
  const [buildPresetConfirmOpen, setBuildPresetConfirmOpen] = useState(false);
  const [pendingPresetDraft, setPendingPresetDraft] = useState<BuilderDraft | null>(null);
  const [registryLoadingMap, setRegistryLoadingMap] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<BottomCategory>("Text");
  const [editorUploadError, setEditorUploadError] = useState("");
  const [toolSearchQuery, setToolSearchQuery] = useState("");
  const [flashedToolKey, setFlashedToolKey] = useState<string | null>(null);
  const [selectedGalleryImageId, setSelectedGalleryImageId] =
  useState<string | null>(null);
  const [textureUploadError, setTextureUploadError] = useState("");
  const [categoryMenuView, setCategoryMenuView] = useState<"compact" | "detail">(
    "compact",
  );
  const [selection, setSelection] = useState(createEmptySelection());
  const [openToolMenu, setOpenToolMenu] = useState<BottomCategory | null>(null);
const [pageDragPreview, setPageDragPreview] = useState<typeof pages | null>(null);
  const [toolGuideModalOpen, setToolGuideModalOpen] = useState(false);
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
type SmartContentOption = {
  id: string;
  title: string;
  text: string;
};

const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
const [aiOptions, setAiOptions] = useState<SmartContentOption[]>([]);
const [showAiSuggestions, setShowAiSuggestions] = useState(false);

const [aiSubject, setAiSubject] = useState("");
const [aiDetails, setAiDetails] = useState("");
const [aiTone, setAiTone] = useState("Friendly");
const [aiLength, setAiLength] = useState("Short");
const [aiAudience, setAiAudience] = useState("");
const [aiKeywords, setAiKeywords] = useState("");
const [aiContentType, setAiContentType] = useState("Description");
const [aiCreativity, setAiCreativity] = useState(50);
const [aiMatchPageStyle, setAiMatchPageStyle] = useState(true);
const [aiError, setAiError] = useState("");
const [showAiAdvancedOptions, setShowAiAdvancedOptions] =
  useState(false);
  const [removeAllModalOpen, setRemoveAllModalOpen] = useState(false);
  const [inspectorFocusTarget, setInspectorFocusTarget] =
    useState<InspectorFocusTarget>(null);
    const [canvasZoom, setCanvasZoom] = useState(() => {
    if (typeof window === "undefined") return 100;

    const saved = window.sessionStorage.getItem("ko-host-builder-canvas-zoom");
    const parsed = saved ? Number(saved) : 100;

    return Number.isFinite(parsed) ? clampCanvasZoom(parsed) : 100;
  });
  const [showGridLines, setShowGridLines] = useState(true);
  const [undoStack, setUndoStack] = useState<BuilderDraft[]>([]);
  const [redoStack, setRedoStack] = useState<BuilderDraft[]>([]);
  const isHistoryActionRef = useRef(false);
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const frameCaptureRootRef = useRef<HTMLDivElement | null>(null);
  const initialDraftRef = useRef<BuilderDraft>(cloneDraft(draft));
  const lastDraftRef = useRef<BuilderDraft>(cloneDraft(draft));
  const topBarScrollRef = useRef<HTMLDivElement | null>(null);
  const dockedScrollRef = useRef<HTMLDivElement | null>(null);
  const bottomBarRef = useRef<HTMLDivElement | null>(null);
  const [blockGuideOpen, setBlockGuideOpen] = useState(false);
  const toolMenuRef = useRef<HTMLDivElement | null>(null);
  const [donationStyleTarget, setDonationStyleTarget] =
  useState<"background" | "buttons">("background");
  const pollQuestionInputRef = useRef<HTMLTextAreaElement | null>(null);
  const pollOptionInputRefs = useRef<Record<string, HTMLInputElement | null>>(
    {},
  );

  const [copied, setCopied] = useState(false);

  const rsvpHeadingInputRef = useRef<HTMLInputElement | null>(null);
const currentSiteName =
  activePageSlug && activePageSlug !== "home"
    ? activePageSlug
    : "Home";
const fallbackSiteSlug = `${templateKey || "site"}-${designKey || "draft"}`
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

const currentSiteSlug =
  micrositeSlug?.trim() ||
  (draft as DraftWithPageExtras).slugSuggestion?.trim() ||
  fallbackSiteSlug;

  const currentPageSlug = (activePageSlug || "home").trim().toLowerCase();
  const [draftCopied, setDraftCopied] = useState(false);
const isLiveMicrosite = Boolean(micrositeSlug?.trim());

const currentSiteDisplay = isLiveMicrosite
  ? currentPageSlug && currentPageSlug !== "home"
    ? `${micrositeSlug}.ko-host.com/${currentPageSlug}`
    : `${micrositeSlug}.ko-host.com`
  : "Draft preview — URL assigned after publish";
  const countdownHeadingInputRef = useRef<HTMLInputElement | null>(null);
  const countdownTargetInputRef = useRef<HTMLInputElement | null>(null);
  const countdownCompletedInputRef = useRef<HTMLInputElement | null>(null);
  const richTextEditorRef = useRef<HTMLDivElement | null>(null);
  const [isRichTextEditorEmpty, setIsRichTextEditorEmpty] = useState(true);
  const [richTextLinkModalOpen, setRichTextLinkModalOpen] = useState(false);
  const [buildPresetModalOpen, setBuildPresetModalOpen] = useState(false);
const [buildPresetJson, setBuildPresetJson] = useState("");
const [buildPresetError, setBuildPresetError] = useState("");
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
    
  const [highlightStyleTarget, setHighlightStyleTarget] = useState<
  "heading" | "body"
>("heading");


type CountdownStyleTarget =
  | "background"
  | "tiles"
  | "values"
  | "units"
  | "heading";

type TimelineStyleTarget =
  | "title"
  | "date"
  | "entryTitle"
  | "subtitle"
  | "description";

const [countdownStyleTarget, setCountdownStyleTarget] =
  useState<CountdownStyleTarget>("background");

const [timelineStyleTarget, setTimelineStyleTarget] =
  useState<TimelineStyleTarget>("entryTitle");

const [focusedTimelineEntryId, setFocusedTimelineEntryId] =
  useState<string | null>(null);

const [progressBarStyleTarget, setProgressBarStyleTarget] = useState<
  | "background"
  | "bar"
  | "scope"
  | "context"
  | "meterContext"
  | "meterCaption"
>("background");

const textureInputRef = useRef<HTMLInputElement | null>(null);

const [faqStyleTarget, setFaqStyleTarget] = useState<
  "form" | "section" | "question" | "answer"
>("form");


const selectedStyle =
  selectedBlockFromDraft?.type === "gallery"
    ? (((selectedBlockFromDraft.data.images?.[0] as any)?.captionStyle ??
        (selectedBlockFromDraft.data as any).captionStyle ??
        (selectedBlockFromDraft.data as any).style ??
        {}) as TextStyle)
    :
  selectedBlockFromDraft?.type === "rsvp"
    ? selectedRsvpElementKey === "form"
      ? selectedBlockFromDraft.data.style ?? {}
      : (
          selectedBlockFromDraft.data.elementStyles?.[selectedRsvpElementKey]
            ?.textStyle ??
          selectedBlockFromDraft.data.style ??
          {}
        )
    : selectedBlockFromDraft?.type === "donation"
      ? donationStyleTarget === "buttons"
        ? (((selectedBlockFromDraft.data as any).buttonStyle ??
            (selectedBlockFromDraft.data as any).style ??
            {}) as TextStyle)
        : (((selectedBlockFromDraft.data as any).style ?? {}) as TextStyle)
    : selectedBlockFromDraft?.type === "listing"
      ? listingStyleTarget === "description"
        ? (selectedBlockFromDraft.data.descriptionStyle ?? {})
        : listingStyleTarget === "metadata"
          ? (selectedBlockFromDraft.data.metadataStyle ?? {})
          : listingStyleTarget === "price"
            ? ((selectedBlockFromDraft.data as any).priceStyle ?? {})
            : listingStyleTarget === "quantity"
              ? ((selectedBlockFromDraft.data as any).quantityStyle ?? {})
              : (selectedBlockFromDraft.data.titleStyle ?? {})
: selectedBlockFromDraft?.type === "form_field"
  ? formFieldTextTarget === "text"
    ? (((selectedBlockFromDraft.data as any).inputStyle ??
        (selectedBlockFromDraft.data as any).style ??
        {}) as TextStyle)
    : (((selectedBlockFromDraft.data as any).style ?? {}) as TextStyle)
      : selectedBlockFromDraft?.type === "highlight"
        ? highlightStyleTarget === "body"
          ? (selectedBlockFromDraft.data.bodyStyle ??
              selectedBlockFromDraft.data.style ??
              {})
          : (selectedBlockFromDraft.data.headingStyle ??
              selectedBlockFromDraft.data.style ??
              {})
        : selectedBlockFromDraft?.type === "faq"
          ? faqStyleTarget === "question"
            ? (((selectedBlockFromDraft.data as any).questionStyle ??
                (selectedBlockFromDraft.data as any).style ??
                {}) as TextStyle)
            : faqStyleTarget === "answer"
              ? (((selectedBlockFromDraft.data as any).answerStyle ??
                  (selectedBlockFromDraft.data as any).style ??
                  {}) as TextStyle)
              : (((selectedBlockFromDraft.data as any).style ?? {}) as TextStyle)
        : selectedBlockFromDraft?.type === "countdown"
          ? countdownStyleTarget === "tiles"
            ? (((selectedBlockFromDraft.data as any).tileStyle ??
                (selectedBlockFromDraft.data as any).style ??
                {}) as TextStyle)
            : countdownStyleTarget === "values"
              ? (((selectedBlockFromDraft.data as any).standardValueStyle ??
                  (selectedBlockFromDraft.data as any).style ??
                  {}) as TextStyle)
              : countdownStyleTarget === "units"
                ? (((selectedBlockFromDraft.data as any).standardUnitStyle ??
                    (selectedBlockFromDraft.data as any).style ??
                    {}) as TextStyle)
                : countdownStyleTarget === "heading"
                  ? (((selectedBlockFromDraft.data as any).headingStyle ??
                      (selectedBlockFromDraft.data as any).style ??
                      {}) as TextStyle)
                  : (((selectedBlockFromDraft.data as any).style ?? {}) as TextStyle)
        : selectedBlockFromDraft?.type === "timeline"
          ? timelineStyleTarget === "title"
            ? (((selectedBlockFromDraft.data as any).titleStyle ?? {}) as TextStyle)
            : timelineStyleTarget === "date"
              ? (((selectedBlockFromDraft.data as any).dateStyle ?? {}) as TextStyle)
              : timelineStyleTarget === "entryTitle"
                ? (((selectedBlockFromDraft.data as any).entryTitleStyle ?? {}) as TextStyle)
                : timelineStyleTarget === "subtitle"
                  ? (((selectedBlockFromDraft.data as any).subtitleStyle ?? {}) as TextStyle)
                  : (((selectedBlockFromDraft.data as any).descriptionStyle ?? {}) as TextStyle)
          : selectedBlockFromDraft?.type === "cart" ||
              selectedBlockFromDraft?.type === "checkout" ||
              selectedBlockFromDraft?.type === "text_fx" ||
              selectedBlockFromDraft?.type === "cta" ||
              selectedBlockFromDraft?.type === "thread" ||
              selectedBlockFromDraft?.type === "image" ||
              (selectedBlockFromDraft as any)?.type === "gallery" ||
              selectedBlockFromDraft?.type === "image_carousel" ||
              selectedBlockFromDraft?.type === "progress_bar" ||
              selectedBlockFromDraft?.type === "link_hub" ||
              selectedBlockFromDraft?.type === "checklist" ||
              selectedBlockFromDraft?.type === "schedule_agenda" ||
              selectedBlockFromDraft?.type === "map_location" ||
              selectedBlockFromDraft?.type === "file_share" ||
              selectedBlockFromDraft?.type === "speed_dating" ||
              selectedBlockFromDraft?.type === "video" ||
              selectedBlockFromDraft?.type === "rich_text" ||
              selectedBlockFromDraft?.type === "links"
? ((((selectedBlockFromDraft as any)?.data?.captionStyle ??
    (selectedBlockFromDraft as any)?.data?.style ??
    {}) as TextStyle))
            : getSelectionTextStyle(draft, selection);

  const selectedAppearance = getSelectionBlockAppearance(draft, selection);
const selectedRsvpElementBackgroundColor =
  selectedBlockFromDraft?.type === "rsvp"
    ? selectedRsvpElementKey === "form"
      ? selectedBlockFromDraft.appearance?.backgroundColor ?? "transparent"
      : selectedBlockFromDraft.data.elementStyles?.[selectedRsvpElementKey]
          ?.backgroundColor ?? "transparent"
    : "transparent";
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

const textureEligibleBlockTypes = [
  "label",
  "text_fx",
  "shape",
  "image",
  "video",
  "gallery",
  "image_carousel",
] as const;

const selectedBlockSupportsTexture = Boolean(
  selectedBlock &&
    textureEligibleBlockTypes.includes(selectedBlock.type as any),
);

const selectedBlockTextureEnabled =
  selectedBlock?.type === "label" || selectedBlock?.type === "text_fx"
    ? Boolean((selectedStyle as any).textureEnabled)
    : Boolean(selectedAppearance.textureEnabled);

function applyTextureToSelectedBlock(
  textureUrl: string,
  meta?: {
    sizeBytes?: number;
    originalSizeBytes?: number;
    mimeType?: string;
    storagePath?: string;
  },
) {
  if (!selectedBlock) return;

  if (selectedBlock.type === "label" || selectedBlock.type === "text_fx") {
    updateSelectedBlock((block) => {
      if (block.type !== "label" && block.type !== "text_fx") return block;

      return {
        ...block,
        data: {
          ...block.data,
          style: {
            ...((block.data as any).style ?? {}),
            textureEnabled: true,
            textureImageUrl: textureUrl,
            textureStoragePath: meta?.storagePath ?? "",
            textureSizeBytes: meta?.sizeBytes ?? 0,
            textureOriginalSizeBytes: meta?.originalSizeBytes ?? 0,
            textureMimeType: meta?.mimeType ?? "",
            textureScale: 100,
            texturePositionX: 50,
            texturePositionY: 50,
          },
        },
      };
    });

    return;
  }

  if (
      selectedBlock.type === "shape" ||
      selectedBlock.type === "image" ||
      selectedBlock.type === "video" ||
      selectedBlock.type === "gallery" ||
      selectedBlock.type === "image_carousel"
  ) {
    updateSelectedBlock((block) => ({
      ...block,
      appearance: {
        ...block.appearance,
        textureEnabled: true,
        textureImageUrl: textureUrl,
        textureStoragePath: meta?.storagePath ?? "",
        textureSizeBytes: meta?.sizeBytes ?? 0,
        textureOriginalSizeBytes: meta?.originalSizeBytes ?? 0,
        textureMimeType: meta?.mimeType ?? "",
        textureScale: 100,
        texturePositionX: 50,
        texturePositionY: 50,
      },
    }));

    return;
  }
}

async function handleTextureFileChange(fileList: FileList | null) {
  const file = fileList?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setTextureUploadError("Please choose an image file for the texture.");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    setTextureUploadError("Texture image must be 2MB or smaller.");
    return;
  }

  try {
    setTextureUploadError("");

    const uploaded = await uploadBuilderImageFile(file);

    applyTextureToSelectedBlock(uploaded.url, {
      storagePath: uploaded.storagePath,
      sizeBytes: uploaded.imageSizeBytes,
      originalSizeBytes: uploaded.imageOriginalSizeBytes,
      mimeType: uploaded.imageMimeType,
    });
  } catch {
    setTextureUploadError("Texture upload failed. Please try again.");
  }
}

function removeTextureFromSelectedBlock() {
  if (!selectedBlock) return;

if (selectedBlock.type === "label" || selectedBlock.type === "text_fx") {
  updateSelectedBlock((block) => {
    if (block.type !== "label" && block.type !== "text_fx") return block;

    return {
      ...block,
      data: {
        ...block.data,
        style: {
          ...((block.data as any).style ?? {}),
          textureEnabled: false,
          textureImageUrl: "",
        },
      },
    };
  });

  return;
}

  applyAppearancePatch({
    textureEnabled: false,
    textureImageUrl: "",
  });
}

      const ctaButtonOptions: Array<{ id: string; label: string }> = draft.blocks
      .filter((block) => block.type === "cta")
      .map((block) => ({
        id: block.id,
        label:
          block.type === "cta"
            ? block.data.buttonText || block.label || "Button"
            : "Button",
      }));

      const selectedBlockGuide = selectedBlock
  ? BLOCK_GUIDES[selectedBlock.type]
  : null;
  
const rsvpElementOptions =
  selectedBlock?.type === "rsvp"
    ? [
        { value: "form", label: "Form" }, // ✅ ADD THIS LINE
        { value: "image", label: "Top Image" },
        { value: "heading", label: "Heading" },
        { value: "nameLabel", label: "Name Label" },
        { value: "firstName", label: "First Name Field" },
        { value: "lastName", label: "Last Name Field" },
        { value: "email", label: "Email Field" },
        { value: "address", label: "Address Field" },
        { value: "attending", label: "Attending Section" },
        { value: "meal", label: "Meal Section" },
        { value: "guestToggle", label: "Guest Toggle Section" },
        { value: "guestCount", label: "Guest Count Control" },
        { value: "guestName", label: "Guest Name Field" },
        { value: "comments", label: "Comments Field" },
      ]
    : [];

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
  selectedBlock?.type === "rsvp" ||
  selectedBlock?.type === "poll" ||
  selectedBlock?.type === "faq" ||
  selectedBlock?.type === "video" ||
  selectedBlock?.type === "gallery" ||
  selectedBlock?.type === "rich_text" ||
  selectedBlock?.type === "countdown" ||
  selectedBlock?.type === "timeline" ||
  selectedBlock?.type === "cart" ||
  selectedBlock?.type === "checkout" ||
  selectedBlock?.type === "listing" ||
  selectedBlock?.type === "links";

const showAppearanceControls =
  selectedContext.kind === "label" ||
  selectedContext.kind === "textFx" ||
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
  selectedBlock?.type === "checkout" ||
  selectedBlock?.type === "poll" ||
  selectedBlock?.type === "form_field" ||
  selectedBlock?.type === "faq" ||
  selectedBlock?.type === "gallery" ||
  selectedBlock?.type === "rsvp" ||
  selectedBlock?.type === "video" ||
  selectedBlock?.type === "rich_text" ||
  selectedBlock?.type === "countdown" ||
  selectedBlock?.type === "timeline" ||
  selectedBlock?.type === "wave" ||
  selectedBlock?.type === "highlight";

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
  selectedBlock?.type === "form_field" ||
  selectedBlock?.type === "video" ||
  selectedBlock?.type === "rich_text" ||
  selectedBlock?.type === "countdown" ||
  selectedBlock?.type === "timeline" ||
  selectedBlock?.type === "wave" ||
  selectedBlock?.type === "highlight";

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
  const handleTextShortcut = (event: KeyboardEvent) => {
const isCmd = event.ctrlKey || event.metaKey;
if (!isCmd) return;

if (event.key.toLowerCase() === "s") {
  event.preventDefault();

  void (async () => {
const zoomBeforeSave = canvasZoom;

try {
  await onSaveDraft?.(draft);
  downloadBlueprintSnapshot(draft);
} finally {
  window.requestAnimationFrame(() => {
    setCanvasZoom(zoomBeforeSave);

    window.setTimeout(() => {
      setCanvasZoom(zoomBeforeSave);
    }, 250);
  });
}
  })();

  return;
}

if (!selectedBlock) return;

    const key = event.key.toLowerCase();
    if (!["b", "i", "u"].includes(key)) return;

    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target instanceof HTMLElement && event.target.isContentEditable)
    ) {
      return;
    }

    if (
      selectedBlock.type !== "label" &&
      selectedBlock.type !== "text_fx" &&
      selectedBlock.type !== "cta" &&
      selectedBlock.type !== "rich_text"
    ) {
      return;
    }

    event.preventDefault();

    updateSelectedBlock((currentBlock) => {
      if (
        currentBlock.type !== "label" &&
        currentBlock.type !== "text_fx" &&
        currentBlock.type !== "cta" &&
        currentBlock.type !== "rich_text"
      ) {
        return currentBlock;
      }

      const currentStyle = ((currentBlock.data as any).style ?? {}) as TextStyle;

      return {
        ...currentBlock,
        data: {
          ...(currentBlock.data as any),
          style: {
            ...currentStyle,
            bold: key === "b" ? !currentStyle.bold : currentStyle.bold,
            italic: key === "i" ? !currentStyle.italic : currentStyle.italic,
            underline:
              key === "u" ? !currentStyle.underline : currentStyle.underline,
          },
        },
      };
    });
  };

  window.addEventListener("keydown", handleTextShortcut);
  return () => window.removeEventListener("keydown", handleTextShortcut);
}, [draft, onSaveDraft, selectedBlock?.id, selectedBlock?.type, updateSelectedBlock]);
  
  useEffect(() => {
  function handleKey(e: KeyboardEvent) {
    if (!selectedBlock) return;

    // prevent interfering with typing
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;

    // ALT + ← = left
    if (e.altKey && e.key === "ArrowLeft") {
      e.preventDefault();
      const activeIds =
  selectedBlockIds.length > 0
    ? selectedBlockIds
    : selection.type === "block"
      ? [selection.blockId]
      : selectedBlock?.id
        ? [selectedBlock.id]
        : [];

alignSelectedBlockHorizontal("left", activeIds);
    }

    // ALT + ↑ = center
    if (e.altKey && e.key === "ArrowUp") {
      e.preventDefault();
      const activeIds =
  selectedBlockIds.length > 0
    ? selectedBlockIds
    : selection.type === "block"
      ? [selection.blockId]
      : selectedBlock?.id
        ? [selectedBlock.id]
        : [];

alignSelectedBlockHorizontal("center", activeIds);
    }

    // ALT + → = right
    if (e.altKey && e.key === "ArrowRight") {
      e.preventDefault();
      const activeIds =
  selectedBlockIds.length > 0
    ? selectedBlockIds
    : selection.type === "block"
      ? [selection.blockId]
      : selectedBlock?.id
        ? [selectedBlock.id]
        : [];

alignSelectedBlockHorizontal("right", activeIds);
    }
  }

  window.addEventListener("keydown", handleKey);
  return () => window.removeEventListener("keydown", handleKey);
}, [selectedBlock]);
  
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
  if (!fontMenuOpen) return;

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement | null;

    if (target?.closest("[data-font-family-menu='true']")) return;

    setFontMenuOpen(false);
  }

  window.addEventListener("mousedown", handleClickOutside);

  return () => {
    window.removeEventListener("mousedown", handleClickOutside);
  };
}, [fontMenuOpen]);

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
function handleCanvasShortcuts(event: KeyboardEvent) {
  const blockId =
    "blockId" in selectedContext ? selectedContext.blockId : null;

  const target = event.target as HTMLElement | null;
  const isTyping =
    target?.tagName === "INPUT" ||
    target?.tagName === "TEXTAREA" ||
    target?.tagName === "SELECT" ||
    target?.isContentEditable;

  if (isTyping) return;

  if (event.ctrlKey && event.key.toLowerCase() === "z") {
    event.preventDefault();
    handleUndo();
    return;
  }

  if (event.ctrlKey && event.key.toLowerCase() === "y") {
    event.preventDefault();
    handleRedo();
    return;
  }

  if (!blockId) return;

  if (event.key === "Delete") {
    event.preventDefault();
    removeCanvasBlock(blockId);
    setSelection(createEmptySelection());
    return;
  }

  if (!event.ctrlKey) return;

  if (event.key.toLowerCase() === "v") {
    event.preventDefault();
    handleDuplicateCanvasBlock(blockId);
    return;
  }

  if (event.key.toLowerCase() === "x") {
    event.preventDefault();
    removeCanvasBlock(blockId);
    setSelection(createEmptySelection());
    return;
  }

  if (event.shiftKey && event.key === "ArrowDown") {
    event.preventDefault();
    handleSendToBack(blockId);
    setSelection(selectionFromCanvasBlockId(blockId));
    return;
  }

  if (event.shiftKey && event.key === "ArrowUp") {
    event.preventDefault();
    handleBringToFront(blockId);
    setSelection(selectionFromCanvasBlockId(blockId));
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    handleBringForward(blockId);
    setSelection(selectionFromCanvasBlockId(blockId));
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    handleSendBackward(blockId);
    setSelection(selectionFromCanvasBlockId(blockId));
  }
}

  window.addEventListener("keydown", handleCanvasShortcuts);

  return () => {
    window.removeEventListener("keydown", handleCanvasShortcuts);
  };
}, [selectedContext, draft]);


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
  const raw = String(html ?? "").trim();

  if (
    raw === "" ||
    raw === "<br>" ||
    raw === "<p><br></p>" ||
    raw === "<div><br></div>" ||
    raw === "<ul><li><br></li></ul>" ||
    raw === "<ol><li><br></li></ol>"
  ) {
    return "";
  }

  const wrapper = document.createElement("div");
  wrapper.innerHTML = raw;

  wrapper.querySelectorAll("script, style, iframe, object, embed, meta, link").forEach((node) => {
    node.remove();
  });

  wrapper.querySelectorAll("*").forEach((node) => {
    Array.from(node.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();

      if (
        name.startsWith("on") ||
        name === "class" ||
        name === "id" ||
        name === "data-mce-style" ||
        name === "data-mce-selected"
      ) {
        node.removeAttribute(attr.name);
      }
    });

    if (node instanceof HTMLElement) {
const allowedStyles = [
  "font-size",
  "font-weight",
  "font-style",
  "text-decoration",
  "text-align",
  "color",
];

      const nextStyle = allowedStyles
        .map((key) => {
          const value = node.style.getPropertyValue(key);
          return value ? `${key}: ${value}` : "";
        })
        .filter(Boolean)
        .join("; ");

      if (nextStyle) {
        node.setAttribute("style", nextStyle);
      } else {
        node.removeAttribute("style");
      }
    }

    if (node instanceof HTMLAnchorElement) {
      const href = node.getAttribute("href") ?? "";

      if (!/^https?:\/\//i.test(href) && !href.startsWith("mailto:") && !href.startsWith("tel:")) {
        node.removeAttribute("href");
      } else {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
    }
  });

  const normalized = wrapper.innerHTML.trim();

  if (
    normalized === "" ||
    normalized === "<br>" ||
    normalized === "<p><br></p>" ||
    normalized === "<div><br></div>"
  ) {
    return "";
  }

  return normalized;
}

function isRichTextHtmlEmpty(html?: string) {
  return normalizeRichTextHtml(html) === "";
}

function getPlainTextFromRichTextHtml(html?: string) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = String(html ?? "");
  return wrapper.textContent?.trim() ?? "";
}

useEffect(() => {
  if (selectedBlock?.type !== "rsvp") return;
  if (selectedRsvpElementKey === "form") return;

  const order = selectedBlock.data.elementOrder ?? [];
  if (!order.includes(selectedRsvpElementKey)) {
    setSelectedRsvpElementKey("heading");
  }
}, [selectedBlock, selectedRsvpElementKey]);

useEffect(() => {
  if (selectedBlock?.type !== "rich_text") return;

  const normalized = normalizeRichTextHtml(
  typeof selectedBlock.data.contentHtml === "string"
    ? selectedBlock.data.contentHtml
    : selectedBlock.data.content ?? "",
);
  setIsRichTextEditorEmpty(isRichTextHtmlEmpty(normalized));

  if (!richTextEditorRef.current) return;

  if (richTextEditorRef.current.innerHTML !== normalized) {
    richTextEditorRef.current.innerHTML = normalized;
  }
}, [
  selectedBlock?.id,
  selectedBlock?.type,
  selectedBlock?.type === "rich_text"
  ? selectedBlock.data.contentHtml ?? selectedBlock.data.content
  : null,
]);

  function pushRecentColor(color: string) {
  if (!color) return;

  setRecentColors((prev) => {
    const normalized = color.toLowerCase();
    const next = [normalized, ...prev.filter((item) => item.toLowerCase() !== normalized)];
    return next.slice(0, 10);
  });
}


async function uploadBuilderImageFile(file: File) {
  return uploadImage(file);
}

async function pickColorWithEyeDropper(
  onPick: (color: string) => void,
) {
  try {
    const EyeDropperCtor = (window as Window & {
      EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
    }).EyeDropper;

    if (!EyeDropperCtor) {
      setEditorUploadError(
        "Eyedropper is not available in this browser.",
      );
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

function resolveMediaLogoFromUrl(url: string) {
  const value = url.toLowerCase();

  if (value.includes("discord")) return "/media-logos/discord.png";
  if (value.includes("facebook")) return "/media-logos/facebook.png";
  if (value.includes("fanvue")) return "/media-logos/fanvue.png";
  if (value.includes("instagram")) return "/media-logos/instagram.png";
  if (value.includes("linkedin")) return "/media-logos/linkedin.png";
  if (value.includes("onlyfans")) return "/media-logos/onlyfans.png";
  if (value.includes("patreon")) return "/media-logos/patreon.png";
  if (value.includes("pinterest")) return "/media-logos/pinterest.png";
  if (value.includes("reddit")) return "/media-logos/reddit.png";
  if (value.includes("signal")) return "/media-logos/signal.png";
  if (value.includes("slack")) return "/media-logos/slack.png";
  if (value.includes("snapchat")) return "/media-logos/snapchat.png";
  if (value.includes("telegram")) return "/media-logos/telegram.png";
  if (value.includes("threads")) return "/media-logos/threads.png";
  if (value.includes("tiktok")) return "/media-logos/tiktok.png";
  if (value.includes("tumblr")) return "/media-logos/tumblr.png";
  if (value.includes("twitch")) return "/media-logos/twitch.png";
  if (value.includes("wechat")) return "/media-logos/wechat.png";
  if (value.includes("whatsapp")) return "/media-logos/whatsapp.png";
  if (value.includes("youtube") || value.includes("youtu.be")) return "/media-logos/youtube.png";
  if (value.includes("twitter") || value.includes("x.com")) return "/media-logos/x.png";

  return "/media-logos/website.png";
}

function applyTextColor(value: string) {
  if (
    selectedBlock?.type === "donation" &&
    donationStyleTarget === "buttons"
  ) {
    updateSelectedBlock((block) =>
      block.type !== "donation"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              buttonStyle: {
                ...(((block.data as any).buttonStyle ?? {})),
                color: value,
              },
            },
          },
    );

    pushRecentColor(value);
    return;
  }

  if (selectedBlock?.type === "gallery") {
    applyStylePatch({ color: value });
    pushRecentColor(value);
    return;
  }

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
            contentHtml: normalized,
            plainText: getPlainTextFromRichTextHtml(normalized),
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
  if (selectedBlock?.type === "countdown") {
    if (countdownStyleTarget === "tiles") {
      updateSelectedBlock((block) =>
        block.type !== "countdown"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                tileStyle: {
                  ...((block.data as any).tileStyle ?? {}),
                  backgroundColor: value,
                },
              },
            },
      );

      pushRecentColor(value);
      return;
    }

    updateSelectedBlock((block) =>
      block.type !== "countdown"
        ? block
        : {
            ...block,
            appearance: {
              ...block.appearance,
              backgroundColor: value,
            },
          },
    );

    pushRecentColor(value);
    return;
  }

    if (selectedBlock?.type === "timeline") {
    updateSelectedBlock((block) =>
      block.type !== "timeline"
        ? block
        : {
            ...block,
            appearance: {
              ...block.appearance,
              backgroundColor: value,
            },
          },
    );

    pushRecentColor(value);
    return;
  }

    if (selectedBlock?.type === "icon") {
    updateSelectedBlock((block) =>
      block.type !== "icon"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              icon: {
                ...block.data.icon,
                color: value,
              },
            },
          },
    );

    pushRecentColor(value);
    return;
  }

  if (selectedBlock?.type === "rsvp") {
    updateSelectedRsvpElementStyle((current) => ({
      ...current,
      backgroundColor: value,
    }));
    pushRecentColor(value);
    return;
  }

  if (selectedBlock?.type === "donation") {
    updateSelectedBlock((block) => {
      if (block.type !== "donation") return block;

      if (donationStyleTarget === "buttons") {
        return {
          ...block,
          data: {
            ...block.data,
            buttonStyle: {
              ...((block.data as any).buttonStyle ?? {}),
              backgroundColor: value,
            },
          },
        };
      }

      return {
        ...block,
        appearance: {
          ...block.appearance,
          backgroundColor: value,
        },
      };
    });

    pushRecentColor(value);
    return;
  }

  if (selectedBlock?.type === "faq") {
    updateSelectedBlock((block) => {
      if (block.type !== "faq") return block;

      if (faqStyleTarget === "section") {
        return {
          ...block,
          data: {
            ...block.data,
            sectionStyle: {
              ...((block.data as any).sectionStyle ?? {}),
              backgroundColor: value,
            },
          },
        };
      }

      if (faqStyleTarget === "question") {
        return {
          ...block,
          data: {
            ...block.data,
            questionStyle: {
              ...((block.data as any).questionStyle ?? block.data.style ?? {}),
              backgroundColor: value,
            },
          },
        };
      }

      if (faqStyleTarget === "answer") {
        return {
          ...block,
          data: {
            ...block.data,
            answerStyle: {
              ...((block.data as any).answerStyle ?? block.data.style ?? {}),
              backgroundColor: value,
            },
          },
        };
      }

      return {
        ...block,
        appearance: {
          ...block.appearance,
          backgroundColor: value,
        },
      };
    });

    pushRecentColor(value);
    return;
  }

  if (selectedBlock?.type === "progress_bar") {
    updateSelectedBlock((block) => {
      if (block.type !== "progress_bar") return block;

      if (progressBarStyleTarget === "meterContext") {
        return {
          ...block,
          data: {
            ...block.data,
            contextStyle: {
              ...((block.data as any).contextStyle ?? {}),
              color: value,
              align: "center",
            },
          },
        };
      }

      if (progressBarStyleTarget === "meterCaption") {
        return {
          ...block,
          data: {
            ...block.data,
            meterCaptionStyle: {
              ...((block.data as any).meterCaptionStyle ?? {}),
              color: value,
              align: "center",
            },
          },
        };
      }

      if (progressBarStyleTarget === "bar") {
        return {
          ...block,
          data: {
            ...block.data,
            barStyle: {
              ...((block.data as any).barStyle ?? {}),
              color: value,
            },
          },
        };
      }

      if (progressBarStyleTarget === "scope") {
        return {
          ...block,
          data: {
            ...block.data,
            barStyle: {
              ...((block.data as any).barStyle ?? {}),
              scopeBackgroundColor: value,
            },
          },
        };
      }

      if (progressBarStyleTarget === "context") {
        return {
          ...block,
          data: {
            ...block.data,
            contextStyle: {
              ...((block.data as any).contextStyle ?? {}),
              backgroundColor: value,
            },
          },
        };
      }

      return {
        ...block,
        appearance: {
          ...block.appearance,
          backgroundColor: value,
        },
      };
    });

    pushRecentColor(value);
    return;
  }
if (selectedBlock?.type === "checkout") {
  updateSelectedBlock((block) =>
    block.type !== "checkout"
      ? block
      : {
          ...block,
          appearance: {
            ...block.appearance,
            backgroundColor: value,
          },
        },
  );

  pushRecentColor(value);
  return;
}

if (selectedBlock?.type === "wave") {
  updateSelectedBlock((block) =>
    block.type !== "wave"
      ? block
      : {
          ...block,
          appearance: {
            ...block.appearance,
            backgroundColor: value,
          },
        },
  );

  pushRecentColor(value);
  return;
}

if (selectedBlock?.type === "form_field") {
  updateSelectedBlock((block) =>
    block.type !== "form_field"
      ? block
      : formFieldTextTarget === "text"
        ? {
            ...block,
            data: {
              ...block.data,
              inputStyle: {
                ...((block.data as any).inputStyle ?? block.data.style ?? {}),
                backgroundColor: value,
              },
            },
          }
        : {
            ...block,
            appearance: {
              ...block.appearance,
              backgroundColor: value,
            },
          },
  );

  pushRecentColor(value);
  return;
}

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
  if (selectedBlock?.type === "countdown") {
    if (countdownStyleTarget === "tiles") {
      updateSelectedBlock((block) =>
        block.type !== "countdown"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                tileStyle: {
                  ...((block.data as any).tileStyle ?? {}),
                  borderColor: value,
                },
              },
            },
      );

      pushRecentColor(value);
      return;
    }

    updateSelectedBlock((block) =>
      block.type !== "countdown"
        ? block
        : {
            ...block,
            appearance: {
              ...block.appearance,
              borderColor: value,
            },
          },
    );

    pushRecentColor(value);
    return;
  }

  if (selectedBlock?.type === "progress_bar" && progressBarStyleTarget === "scope") {
    updateSelectedBlock((block) =>
      block.type !== "progress_bar"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              barStyle: {
                ...((block.data as any).barStyle ?? {}),
                borderColor: value,
              },
            },
          },
    );

    pushRecentColor(value);
    return;
  }

  if (selectedBlock?.type === "faq" && faqStyleTarget === "section") {
    updateSelectedBlock((block) =>
      block.type !== "faq"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              sectionStyle: {
                ...((block.data as any).sectionStyle ?? {}),
                borderColor: value,
              },
            },
          },
    );

    pushRecentColor(value);
    return;
  }

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

async function uploadPuzzleImageToSelectedBlock(blockId: string) {
  await openImagePicker({
    onSelect: async (files) => {
      const file = files[0];
      if (!file) return;

      const uploaded = await uploadBuilderImageFile(file);

      setDraft((current) => ({
        ...current,
        blocks: current.blocks.map((block) =>
          block.id !== blockId || block.type !== "puzzle"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  imageUrl: uploaded.url,
                  imageStoragePath: uploaded.storagePath,
                  imageSizeBytes: uploaded.imageSizeBytes,
                  imageOriginalSizeBytes: uploaded.imageOriginalSizeBytes,
                  imageMimeType: uploaded.imageMimeType,
                  imageAlt: file.name || "Puzzle image",
                  generatedAt: "",
                  pieces: [],
                },
              },
        ),
      }));
    },
  });
}

async function openAudioPicker(options: {
  onSelect: (files: File[]) => Promise<void> | void;
}) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "audio/*";
  input.multiple = false;
  input.click();

  input.onchange = async () => {
    const files = Array.from(input.files ?? []);
    if (!files.length) return;
    await options.onSelect(files);
  };
}

async function uploadAudioToSelectedBlock(blockId: string) {
  await openAudioPicker({
    onSelect: async (files) => {
      const file = files[0];
      if (!file) return;

      setEditorUploadError(
        "Audio upload is temporarily disabled until audio files are uploaded to Supabase before saving to the draft.",
      );
    },
  });
}

function cancelResetDraft() {
  setResetDraftModalOpen(false);
}

const handleVideoUpload = async (
  e: React.ChangeEvent<HTMLInputElement>,
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const signedRes = await fetch("/api/video/signed-upload", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        mime: file.type || "application/octet-stream",
      }),
    });

    const signedData = await signedRes.json().catch(() => ({}));

    if (!signedRes.ok || !signedData?.ok || !signedData?.signedUrl) {
      setEditorUploadError(
        signedData?.error || `Failed to prepare video upload. Status: ${signedRes.status}`,
      );
      return;
    }

    const uploadRes = await fetch(signedData.signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || signedData.mime || "application/octet-stream",
      },
      body: file,
    });

    if (!uploadRes.ok) {
      setEditorUploadError(`Failed to upload video. Status: ${uploadRes.status}`);
      return;
    }

    updateSelectedBlock((block) =>
      block.type !== "video"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              videoUrl: signedData.publicUrl,
              videoStoragePath: signedData.storagePath,
              videoSizeBytes: file.size,
              videoMimeType: file.type,
            },
          },
    );

    setEditorUploadError("");
  } catch (err) {
    console.error(err);
    setEditorUploadError("Upload failed");
  } finally {
    e.target.value = "";
  }
};

function applyStylePatch(patch: Partial<TextStyle>) {
  if (selectedBlock?.type === "rsvp") {
  updateSelectedRsvpElementStyle((current) => ({
    ...current,
    textStyle: {
      ...(current?.textStyle ?? {}),
      ...patch,
    },
  }));
  return;
}

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

  if (selectedBlock?.type === "faq") {
  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) =>
      block.id === selectedBlock.id && block.type === "faq"
        ? {
            ...block,
            data: {
              ...block.data,
              ...(faqStyleTarget === "question"
                ? {
                    questionStyle: {
                      ...((block.data as any).questionStyle ?? block.data.style ?? {}),
                      ...patch,
                    },
                  }
                : faqStyleTarget === "answer"
                  ? {
                      answerStyle: {
                        ...((block.data as any).answerStyle ?? block.data.style ?? {}),
                        ...patch,
                      },
                    }
                  : {
                      style: {
                        ...(block.data.style ?? {}),
                        ...patch,
                      },
                    }),
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
    const target = selectedBlock.data.threadStyleTarget ?? "message";

    const targetStyleKey =
      target === "post_block"
        ? "postBlockStyle"
        : target === "subject"
          ? "subjectStyle"
          : target === "name"
            ? "nameStyle"
            : target === "post_button"
              ? "postButtonTextStyle"
              : target === "message"
                ? "messageStyle"
                : "style";

    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "thread"
          ? {
              ...block,
              data: {
                ...block.data,
                [targetStyleKey]: {
                  fontSize:
                    target === "subject"
                      ? 18
                      : target === "name" || target === "post_button"
                        ? 14
                        : target === "message"
                          ? 15
                          : target === "post_block"
                            ? 16
                            : 30,
                  ...((block.data as any)[targetStyleKey] ?? {}),
                  ...patch,
                },
              },
            }
          : block,
      ),
    }));
    return;
  }

if (
  selectedBlock?.type === "image" ||
  selectedBlock?.type === "gallery" ||
  selectedBlock?.type === "image_carousel" ||
  selectedBlock?.type === "video"
) {
  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) => {
      if (block.id !== selectedBlock.id) return block;

      if (block.type === "gallery") {
        return {
          ...block,
          data: {
            ...block.data,
            captionStyle: {
              ...((block.data as any).captionStyle ?? {}),
              ...patch,
            },
            images: block.data.images.map((image) => ({
              ...image,
              captionStyle: {
                ...((image as any).captionStyle ?? {}),
                ...patch,
              },
            })),
          } as any,
        };
      }

      if (
        block.type === "image" ||
        block.type === "image_carousel" ||
        block.type === "video"
      ) {
        return {
          ...block,
          data: {
            ...block.data,
            captionStyle: {
              ...((block.data as any).captionStyle ?? {}),
              ...patch,
            },
          } as any,
        };
      }

      return block;
    }),
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

              inputStyle: {
                ...((block.data as any).inputStyle ??
                  block.data.style ??
                  {}),
                ...patch,
              },

              ...(formFieldTextTarget === "form"
                ? {
                    labelStyle: {
                      ...((block.data as any).labelStyle ??
                        block.data.style ??
                        {}),
                      ...patch,
                    },
                  }
                : {}),
            },
          }
        : block,
    ),
  }));
  return;
}

  if (selectedBlock?.type === "highlight") {
    const selectedHighlightId = selectedBlock.id;
    const target = highlightStyleTarget;

    requestAnimationFrame(() => {
      setDraft((prev) => {
        let changed = false;

        const nextBlocks = prev.blocks.map((block) => {
          if (block.id !== selectedHighlightId || block.type !== "highlight") {
            return block;
          }

          const currentStyle =
            target === "body"
              ? (block.data.bodyStyle ?? block.data.style ?? {})
              : (block.data.headingStyle ?? block.data.style ?? {});

          const nextStyle = {
            ...currentStyle,
            ...patch,
          };

          const isSame =
            (currentStyle.fontFamily ?? null) === (nextStyle.fontFamily ?? null) &&
            (currentStyle.fontSize ?? null) === (nextStyle.fontSize ?? null) &&
            (currentStyle.bold ?? false) === (nextStyle.bold ?? false) &&
            (currentStyle.italic ?? false) === (nextStyle.italic ?? false) &&
            (currentStyle.underline ?? false) === (nextStyle.underline ?? false) &&
            (currentStyle.strike ?? false) === (nextStyle.strike ?? false) &&
            (currentStyle.align ?? "left") === (nextStyle.align ?? "left") &&
            (currentStyle.color ?? null) === (nextStyle.color ?? null);

          if (isSame) {
            return block;
          }

          changed = true;

          return {
            ...block,
            data: {
              ...block.data,
              ...(target === "body"
                ? { bodyStyle: nextStyle }
                : { headingStyle: nextStyle }),
            },
          };
        });

        return changed ? { ...prev, blocks: nextBlocks } : prev;
      });
    });

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
              ...(progressBarStyleTarget === "bar" ||
              progressBarStyleTarget === "scope"
                ? {
                    barStyle: {
                      ...((block.data as any).barStyle ?? {}),
                      ...patch,
                    },
                  }
                : progressBarStyleTarget === "context" ||
                    progressBarStyleTarget === "meterContext"
                  ? {
                      contextStyle: {
                        ...((block.data as any).contextStyle ?? {}),
                        ...patch,
                        align:
                          progressBarStyleTarget === "meterContext"
                            ? "center"
                            : ((patch as any).align ?? undefined),
                      },
                    }
                  : progressBarStyleTarget === "meterCaption"
                    ? {
                        meterCaptionStyle: {
                          ...((block.data as any).meterCaptionStyle ?? {}),
                          ...patch,
                          align: "center",
                        },
                      }
                    : {
                        style: {
                          ...(block.data.style ?? {}),
                          ...patch,
                        },
                      }),
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
    blocks: prev.blocks.map((block) => {
      if (block.id !== selectedBlock.id || block.type !== "donation") {
        return block;
      }

      if (donationStyleTarget === "buttons") {
        return {
          ...block,
          data: {
            ...block.data,
            buttonStyle: {
              ...(((block.data as any).buttonStyle ?? {})),
              ...patch,
            },
          },
        };
      }

      return {
        ...block,
        data: {
          ...block.data,
          style: {
            ...(block.data.style ?? {}),
            ...patch,
          },
        },
      };
    }),
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

  if (selectedBlock?.type === "pop_balloon") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "pop_balloon"
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

if (selectedBlock?.type === "timeline") {
  const targetId = selectedBlock.id;

  const targetStyleKey =
    timelineStyleTarget === "title"
      ? "titleStyle"
      : timelineStyleTarget === "date"
        ? "dateStyle"
        : timelineStyleTarget === "entryTitle"
          ? "entryTitleStyle"
          : timelineStyleTarget === "subtitle"
            ? "subtitleStyle"
            : "descriptionStyle";

  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) =>
      block.id === targetId && block.type === "timeline"
        ? {
            ...block,
            data: {
              ...block.data,
              [targetStyleKey]: {
                ...((block.data as any)[targetStyleKey] ?? {}),
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
  const targetId = selectedBlock.id;

  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) => {
      if (block.id !== targetId || block.type !== "countdown") {
        return block;
      }

      const data = block.data as any;

      if (countdownStyleTarget === "values") {
        return {
          ...block,
          data: {
            ...data,
            standardValueStyle: {
              ...(data.standardValueStyle ?? data.style ?? {}),
              ...patch,
            },
          },
        };
      }

      if (countdownStyleTarget === "units") {
        return {
          ...block,
          data: {
            ...data,
            standardUnitStyle: {
              ...(data.standardUnitStyle ?? data.style ?? {}),
              ...patch,
            },
          },
        };
      }

      if (countdownStyleTarget === "heading") {
        return {
          ...block,
          data: {
            ...data,
            headingStyle: {
              ...(data.headingStyle ?? data.style ?? {}),
              ...patch,
            },
          },
        };
      }

      if (countdownStyleTarget === "tiles") {
        return {
          ...block,
          data: {
            ...data,
            tileStyle: {
              ...(data.tileStyle ?? data.style ?? {}),
              ...patch,
            },
          },
        };
      }

      return {
        ...block,
        data: {
          ...data,
          style: {
            ...(data.style ?? {}),
            ...patch,
          },
        },
      };
    }),
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

if (selectedBlock?.type === "listing") {
  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) =>
      block.id === selectedBlock.id && block.type === "listing"
        ? {
            ...block,
            data: {
              ...block.data,
              ...(listingStyleTarget === "description"
                ? {
                    descriptionStyle: {
                      ...(block.data.descriptionStyle ?? {}),
                      ...patch,
                    },
                  }
                : listingStyleTarget === "metadata"
                  ? {
                      metadataStyle: {
                        ...(block.data.metadataStyle ?? {}),
                        ...patch,
                      },
                    }
                  : listingStyleTarget === "price"
                    ? {
                        priceStyle: {
                          ...((block.data as any).priceStyle ?? {}),
                          ...patch,
                        },
                      }
                    : listingStyleTarget === "quantity"
                      ? {
                          quantityStyle: {
                            ...((block.data as any).quantityStyle ?? {}),
                            ...patch,
                          },
                        }
                      : {
                          titleStyle: {
                            ...(block.data.titleStyle ?? {}),
                            ...patch,
                          },
                        }),
            },
          }
        : block,
    ),
  }));
  return;
}

  if (selectedBlock?.type === "cart") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "cart"
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

  if (selectedBlock?.type === "checkout") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "checkout"
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

  if (selectedBlock?.type === "links") {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === selectedBlock.id && block.type === "links"
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

function applyLinksBackgroundColor(value: string) {
  if (selectedBlock?.type !== "links") return;

  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) =>
      block.id === selectedBlock.id && block.type === "links"
        ? {
            ...block,
            data: {
              ...block.data,
              backgroundColor: value,
              transparentBackground: false,
            },
          }
        : block,
    ),
  }));

  pushRecentColor(value);
}

function clearLinksBackgroundColor() {
  if (selectedBlock?.type !== "links") return;

  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) =>
      block.id === selectedBlock.id && block.type === "links"
        ? {
            ...block,
            data: {
              ...block.data,
              transparentBackground: true,
            },
          }
        : block,
    ),
  }));
}

function applyAppearancePatch(patch: AppearancePatch) {
  if (selectedBlock?.type === "form_field") {
    updateSelectedBlock((block) =>
      block.type !== "form_field"
        ? block
        : formFieldTextTarget === "text"
          ? {
              ...block,
              data: {
                ...block.data,
                inputStyle: {
                  ...((block.data as any).inputStyle ?? block.data.style ?? {}),
                  ...patch,
                },
              },
            }
          : {
              ...block,
              appearance: {
                ...block.appearance,
                ...patch,
              },
            },
    );
    return;
  }

  if (selectedBlock?.type === "timeline") {
    updateSelectedBlock((block) =>
      block.type !== "timeline"
        ? block
        : {
            ...block,
            appearance: {
              ...block.appearance,
              ...patch,
            },
          },
    );
    return;
  }

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
    letterScaleX: number;
    transformStyle: string;
    transformStrength: number;
    shadowEnabled: boolean;
    shadowColor: string;
    shadowOffsetX: number;
    shadowOffsetY: number;
    shadowBlur: number;
    outlineEnabled: boolean;
    outlineColor: string;
    outlineWidth: number;
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

function downloadBlueprintSnapshot(nextDraft: BuilderDraft) {
  const timestamp = Date.now();
  const blueprintJson = JSON.stringify(nextDraft, null, 2);

  const blob = new Blob([blueprintJson], {
    type: "text/plain;charset=utf-8",
  });

const pageName =
  (
    (nextDraft as any)?.title ||
    (nextDraft as any)?.pageName ||
    (nextDraft as any)?.slug ||
    "home"
  )
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "home";

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `ko-host-blueprint-${pageName}-${timestamp}.txt`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function isBlockMultiSelected(blockId: string) {
  return selectedBlockIds.includes(blockId);
}

function toggleBlockMultiSelect(blockId: string) {
  setSelectedBlockIds((prev) =>
    prev.includes(blockId)
      ? prev.filter((id) => id !== blockId)
      : [...prev, blockId],
  );
}

function clearMultiSelect() {
  setSelectedBlockIds([]);
}

function alignSelectedBlockHorizontal(
  mode: "left" | "center" | "right",
  idsToAlign: string[],
) {
  const selectedIds = idsToAlign;

  if (!selectedIds.length) return;

  setDraft((prev) => ({
    ...prev,
    blocks: prev.blocks.map((block) => {
      if (!selectedIds.includes(block.id)) return block;

      const currentGrid = block.grid ?? {
        colStart: 1,
        rowStart: 1,
        colSpan: 1,
        rowSpan: 1,
        zIndex: 1,
      };

      const colSpan = Number(currentGrid.colSpan ?? 1);

      const nextColStart =
        mode === "left"
          ? 1
          : mode === "right"
            ? Math.max(1, 12 - colSpan + 1)
            : Math.max(1, Math.round((12 - colSpan) / 2 + 1));

      return {
        ...block,
        grid: {
          colStart: nextColStart,
          rowStart: currentGrid.rowStart ?? 1,
          colSpan,
          rowSpan: currentGrid.rowSpan ?? 1,
          zIndex: currentGrid.zIndex ?? 1,
        },
      };
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

function updateSelectedRsvpElementStyle(
  updater: (
    current:
      | {
          textStyle?: TextStyle;
          backgroundColor?: string;
        }
      | undefined,
  ) => {
    textStyle?: TextStyle;
    backgroundColor?: string;
  },
) {
  updateSelectedBlock((block) => {
    if (block.type !== "rsvp") return block;

    if (selectedRsvpElementKey === "form") {
      const nextValue = updater({
        textStyle: block.data.style ?? {},
        backgroundColor: block.appearance?.backgroundColor,
      });

      return {
        ...block,
        appearance: {
          ...block.appearance,
          backgroundColor:
            nextValue.backgroundColor ??
            block.appearance?.backgroundColor ??
            "transparent",
        },
        data: {
          ...block.data,
          style: {
            ...(block.data.style ?? {}),
            ...(nextValue.textStyle ?? {}),
          },
        },
      };
    }

    const key = selectedRsvpElementKey;
    const currentElementStyles = block.data.elementStyles ?? {};
    const currentValue = currentElementStyles[key];
    const nextValue = updater(currentValue);

    return {
      ...block,
      data: {
        ...block.data,
        elementStyles: {
          ...currentElementStyles,
          [key]: nextValue,
        },
      },
    };
  });
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

function updateSelectedIconPatch(
  patch: Partial<{
    positionX: number;
    positionY: number;
    zoom: number;
    rotation: number;
    opacity: number;
  }>,
) {
  updateSelectedBlock((block) =>
    block.type !== "icon"
      ? block
      : {
          ...block,
          data: {
            ...block.data,
            icon: {
              ...block.data.icon,
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

      const uploaded = await uploadBuilderImageFile(file);

      setDraft((prev) => ({
        ...(prev as DraftWithPageExtras),

        pageBackgroundImage: uploaded.url,
        pageBackgroundImageStoragePath: uploaded.storagePath,
        pageBackgroundImageSizeBytes: uploaded.imageSizeBytes,
        pageBackgroundImageOriginalSizeBytes:
          uploaded.imageOriginalSizeBytes,
        pageBackgroundImageMimeType: uploaded.imageMimeType,

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

const objectUrl = URL.createObjectURL(file);

const image = await new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new window.Image();

  img.onload = () => {
    URL.revokeObjectURL(objectUrl);
    resolve(img);
  };

  img.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error("Failed to load image."));
  };

  img.src = objectUrl;
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


async function uploadImageToSelectedBlock(blockId: string, timelineEntryId?: string) {
  await openImagePicker({
    onSelect: async (files) => {
      const file = files[0];
      if (!file) return;

      const uploaded = await uploadBuilderImageFile(file);

      setDraft((prev) => ({
        ...prev,
        blocks: prev.blocks.map((block) => {
          if (block.id !== blockId) return block;

          if (block.type === "image") {
            return {
              ...block,
              data: {
                ...block.data,
                image: {
                  ...block.data.image,
                  url: uploaded.url,
                  alt: file.name,
                  imageStoragePath: uploaded.storagePath,
                  imageSizeBytes: uploaded.imageSizeBytes,
                  imageOriginalSizeBytes: uploaded.imageOriginalSizeBytes,
                  imageMimeType: uploaded.imageMimeType,
                },
              },
            };
          }

          if (block.type === "cta") {
            return {
              ...block,
              data: {
                ...block.data,
                buttonImageUrl: uploaded.url,
                buttonImageStoragePath: uploaded.storagePath,
                buttonImageSizeBytes: uploaded.imageSizeBytes,
                buttonImageOriginalSizeBytes: uploaded.imageOriginalSizeBytes,
                buttonImageMimeType: uploaded.imageMimeType,
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
                  url: uploaded.url,
                  alt: file.name,
                  imageStoragePath: uploaded.storagePath,
                  imageSizeBytes: uploaded.imageSizeBytes,
                  imageOriginalSizeBytes: uploaded.imageOriginalSizeBytes,
                  imageMimeType: uploaded.imageMimeType,
                },
              },
            };
          }

          if (block.type === "timeline" && timelineEntryId) {
            return {
              ...block,
              data: {
                ...block.data,
                entries: block.data.entries.map((entry) =>
                  entry.id === timelineEntryId
                    ? {
                        ...entry,
                        imageUrl: uploaded.url,
                        imageStoragePath: uploaded.storagePath,
                        imageSizeBytes: uploaded.imageSizeBytes,
                        imageOriginalSizeBytes:
                          uploaded.imageOriginalSizeBytes,
                        imageMimeType: uploaded.imageMimeType,
                        icon: "/media-icons/star.svg",
                      }
                    : entry,
                ),
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
      const MAX_FILES_PER_ADD = 24;
      const selectedFiles = files.slice(0, MAX_FILES_PER_ADD);

      if (files.length > MAX_FILES_PER_ADD) {
        window.alert(
          `You selected ${files.length} images. Only the first ${MAX_FILES_PER_ADD} were added at once.`,
        );
      }

      const images: GalleryImage[] = await Promise.all(
        selectedFiles.map(async (file) => {
          const uploaded = await uploadBuilderImageFile(file);

          return {
            id: makeClientId("gallery"),
            url: uploaded.url,
            storagePath: uploaded.storagePath,
            imageSizeBytes: uploaded.imageSizeBytes,
            imageOriginalSizeBytes: uploaded.imageOriginalSizeBytes,
            imageMimeType: uploaded.imageMimeType,
          } as GalleryImage;
        }),
      );

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

      const uploaded = await uploadBuilderImageFile(file);

      setDraft((prev) => ({
        ...prev,
        blocks: prev.blocks.map((block) => {
          if (block.id !== blockId || block.type !== "image_carousel") {
            return block;
          }

          return {
            ...block,
            data: {
              ...block.data,
              items: (block.data.items ?? []).map((item: any) =>
                item.id !== itemId
                  ? item
                  : {
                      ...item,
                      imageUrl: uploaded.url,
                      imageStoragePath: uploaded.storagePath,
                      imageSizeBytes: uploaded.imageSizeBytes,
                      imageOriginalSizeBytes:
                        uploaded.imageOriginalSizeBytes,
                      imageMimeType: uploaded.imageMimeType,
                    },
              ),
            },
          };
        }),
      }));
    },
  });
}

async function uploadMultipleImagesToCarousel(blockId: string) {
  await openImagePicker({
    multiple: true,
    onSelect: async (files) => {
      const newItems: CarouselImageItem[] = await Promise.all(
        files.map(async (file, index) => {
          const uploaded = await uploadBuilderImageFile(file);

          return {
            id: makeClientId("carouselitem"),
            imageUrl: uploaded.url,
            imageStoragePath: uploaded.storagePath,
            imageSizeBytes: uploaded.imageSizeBytes,
            imageOriginalSizeBytes: uploaded.imageOriginalSizeBytes,
            imageMimeType: uploaded.imageMimeType,
            title: `Slide ${index + 1}`,
            subtitle: "",
            href: "",
            openInNewTab: false,
            positionX: 50,
            positionY: 50,
            zoom: 1,
            rotation: 0,
          };
        }),
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

function getIconNameFromUrl(url?: string) {
  const fileName = String(url ?? "").split("/").pop() ?? "";
  return fileName.replace(/\.svg$/i, "") || "star";
}

function getIconUrlFromLabel(label?: string) {
  const normalized = String(label ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `/media-icons/${normalized || "star"}.svg`;
}

function applyIconDefaults(
  block: MicrositeBlock,
  label?: string,
  iconUrl?: string,
): MicrositeBlock {
  if (block.type !== "icon") return block;

  const resolvedIconUrl = iconUrl || getIconUrlFromLabel(label);

  return {
    ...block,
    label: label || block.label || "Icon",
    data: {
      ...block.data,
      icon: {
        ...block.data.icon,
        id: block.data.icon.id || resolvedIconUrl,
        url: resolvedIconUrl,
        alt: label || block.data.icon.alt || "Icon",
      },
    },
  };
}

function addBlock(type: BuilderBlockType, label?: string, iconName?: string) {
  let createdBlockId = "";

  setDraft((prev) => {
    const nextBlocks = addBlockTypeToDraft(prev.blocks, type);

    const created = nextBlocks.find(
      (b) => !prev.blocks.some((p) => p.id === b.id),
    );

    if (created) createdBlockId = created.id;

    if (created?.type === "icon") {
  console.log("CREATED ICON BLOCK", {
    label,
    created,
  });
}

    return {
      ...prev,
      blocks: nextBlocks.map((block) =>
        created && block.id === created.id
  ? applyIconDefaults(block, label, `/media-icons/${iconName ?? "star"}.svg`)
  : block,
      ),
    };
  });

  if (createdBlockId) {
    setSelection(selectionFromCanvasBlockId(createdBlockId));
  }
}

function addShape(type: ShapeType) {
  let createdShapeId = "";

  setDraft((prev) => {
    const nextBlocks = addShapeBlockToDraft(prev.blocks, type);

    const created = nextBlocks.find(
      (b) => !prev.blocks.some((p) => p.id === b.id),
    );

    if (created) createdShapeId = created.id;

    return {
      ...prev,
      blocks: nextBlocks,
    };
  });

  if (createdShapeId) {
    setSelection(selectionFromCanvasBlockId(createdShapeId));
  }
}

function addPageBlock(type: PageBlockType) {
  let createdPageId = "";

  setDraft((prev) => {
    const next = prev as DraftWithPageExtras;
    const pageVisibility = { ...(next.pageVisibility ?? {}) };

    if (type === "title") {
      pageVisibility.title = true;
      createdPageId = PAGE_TITLE_BLOCK_ID;
    }

    if (type === "subtitle") {
      pageVisibility.subtitle = true;
      createdPageId = PAGE_SUBTITLE_BLOCK_ID;
    }

    if (type === "tagline") {
      pageVisibility.subtext = true;
      createdPageId = PAGE_SUBTEXT_BLOCK_ID;
    }

    if (type === "description") {
      pageVisibility.description = true;
      createdPageId = PAGE_DESCRIPTION_BLOCK_ID;
    }

    return {
      ...prev,
      pageVisibility,
    };
  });

  if (createdPageId) {
    setSelection(selectionFromCanvasBlockId(createdPageId));
  }
}

function handleDuplicateCanvasBlock(blockId: string) {
  if (isPageBlockId(blockId)) return;

  const duplicatedBlockId = `block_${Math.random().toString(36).slice(2, 10)}`;

  setDraft((prev) => {
    const original = prev.blocks.find((block) => block.id === blockId);
    if (!original) return prev;

    const originalGrid = original.grid ?? {
      colStart: 1,
      rowStart: 1,
      colSpan: 4,
      rowSpan: 1,
      zIndex: 1,
    };

    const highestZIndex = Math.max(
      1,
      ...prev.blocks.map((block) => block.grid?.zIndex ?? 1),
    );

    const duplicatedBlock: MicrositeBlock = {
      ...structuredClone(original),
      id: duplicatedBlockId,
      grid: {
        colStart: originalGrid.colStart,
        rowStart: originalGrid.rowStart + 1,
        colSpan: originalGrid.colSpan,
        rowSpan: originalGrid.rowSpan,
        zIndex: highestZIndex + 1,
      },
    };

    return {
      ...prev,
      blocks: [...prev.blocks, duplicatedBlock],
    };
  });

  window.requestAnimationFrame(() => {
    setSelection(selectionFromCanvasBlockId(duplicatedBlockId));
  });
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

    const resized = items.map((item) =>
      item.id === blockId
        ? {
            ...item,
            grid: {
              ...(item.grid ?? {}),
              ...patch,
            },
          }
        : item,
    );

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

function handleSendBackward(blockId: string) {
  setDraft((prev) => {
    const items = buildCanvasItems(prev, metadata);
    const updated = moveCanvasItemBackward(items, blockId);
    return applyCanvasItemsToDraft(prev, updated);
  });
}

function handleBringForward(blockId: string) {
  setDraft((prev) => {
    const items = buildCanvasItems(prev, metadata);
    const updated = moveCanvasItemForward(items, blockId);
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
  console.log("TOOL DROP PAYLOAD", payload);

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
      const nextBlocks = addBlockTypeToDraft(prev.blocks, payload.type).map(
        (block) =>
          block.type === "icon" && !prev.blocks.some((prevBlock) => prevBlock.id === block.id)
? applyIconDefaults(
    block,
    payload.label,
    payload.iconUrl ?? `/media-icons/${payload.iconName ?? "star"}.svg`,
  )
            : block,
      );
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

      const positionedDraft = applyCanvasItemsToDraft(nextDraft, withFront);

      return {
        ...positionedDraft,
        blocks: positionedDraft.blocks.map((block) =>
          block.id === createdItem.id && block.type === "icon"
            ? applyIconDefaults(block, payload.label, payload.iconUrl)
            : block,
        ),
      };
    });

    if (createdBlockId) {
      setSelection(selectionFromCanvasBlockId(createdBlockId));
    }
  }
}

function handleCanvasSelect(
  nextSelection: ReturnType<typeof createEmptySelection>,
  event?: React.MouseEvent<HTMLDivElement>,
) {
  const isBlockSelection = (nextSelection as any).type === "block";
  const blockId = (nextSelection as any).blockId as string | undefined;

  if (isBlockSelection && blockId) {
    if (event?.ctrlKey) {
      setSelectedBlockIds((prev) =>
        prev.includes(blockId)
          ? prev.filter((id) => id !== blockId)
          : [...prev, blockId],
      );

      setSelection(selectionFromCanvasBlockId(blockId));
      return;
    }

    setSelectedBlockIds([blockId]);
    setSelection(selectionFromCanvasBlockId(blockId));
    return;
  }

  setSelectedBlockIds([]);
  setSelection(nextSelection);
}

async function handleCopyDraftJson() {
  try {
    const { slugSuggestion, ...draftWithoutSlugSuggestion } =
      draft as BuilderDraft & { slugSuggestion?: string };

    await navigator.clipboard.writeText(
      JSON.stringify(draftWithoutSlugSuggestion, null, 2),
    );

    setDraftCopied(true);

    window.setTimeout(() => {
      setDraftCopied(false);
    }, 1500);
  } catch {
    // ignore
  }
}

function handleBuildPresetDesign() {
  setBuildPresetError("");

  let parsed: BuilderDraft;

  try {
    parsed = JSON.parse(buildPresetJson) as BuilderDraft;
  } catch {
    setBuildPresetError("Invalid JSON. Please paste valid Design Specs JSON.");
    return;
  }

  if (!parsed || typeof parsed !== "object") {
    setBuildPresetError("Design Specs must be a valid draft object.");
    return;
  }

  if (!Array.isArray(parsed.blocks)) {
    setBuildPresetError("Design Specs must include a blocks array.");
    return;
  }

  const nextDraft: BuilderDraft = {
    ...parsed,
    blocks: parsed.blocks,
  };

  setPendingPresetDraft(nextDraft);
  setBuildPresetConfirmOpen(true);
}

function confirmBuildPresetDesign() {
  if (!pendingPresetDraft) return;

  isHistoryActionRef.current = true;
  setSelection(createEmptySelection());
  setOpenToolMenu(null);
  setRedoStack([]);
  setUndoStack([]);
  lastDraftRef.current = cloneDraft(pendingPresetDraft);

  setDraft(pendingPresetDraft);
  setPendingPresetDraft(null);
  setBuildPresetJson("");
  setBuildPresetError("");
  setBuildPresetConfirmOpen(false);
  setBuildPresetModalOpen(false);
}

async function handleCopyUrl() {
  if (!micrositeSlug?.trim()) return;

  const fullUrl =
    currentPageSlug && currentPageSlug !== "home"
      ? `https://${micrositeSlug.trim()}.ko-host.com/${currentPageSlug}`
      : `https://${micrositeSlug.trim()}.ko-host.com`;

  try {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  } catch {
    // ignore
  }
}

  const canRemoveActivePage =
    Array.isArray(pages) &&
    pages.length > 1 &&
    !!activePageId &&
    pages.findIndex((page) => page.id === activePageId) > 0;

function handleAioClick() {
  if (!isTextSelection(selectedContext)) return;

setAiSubject(selectedContext.label || "");
setAiDetails(selectedTextValue || "");

setAiTone("Friendly");
setAiLength("Short");
setAiAudience("");
setAiKeywords("");
setAiContentType("Description");
setAiCreativity(50);
setAiMatchPageStyle(true);

setAiSuggestions([]);
setAiOptions([]);
setAiError("");
setShowAiAdvancedOptions(false);
setShowAiSuggestions(true);
}

async function generateSmartContent() {
  if (!isTextSelection(selectedContext)) return;

  setAiLoading(true);

setAiSuggestions([]);
setAiOptions([]);
setAiError("");

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

        subject: aiSubject,
        details: aiDetails,
        tone: aiTone,
        audience: aiAudience,
        length: aiLength,
        contentType: aiContentType,
        creativity: aiCreativity,
        matchPageStyle: aiMatchPageStyle,

        keywords: aiKeywords
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      }),
    });

    const data = (await res.json()) as {
      suggestions?: string[];
      options?: SmartContentOption[];
    };

    setAiSuggestions(
      Array.isArray(data.suggestions) ? data.suggestions : [],
    );

const nextOptions = Array.isArray(data.options) ? data.options : [];

setAiOptions(nextOptions);

if (!nextOptions.length) {
  setAiError("No content options were generated. Try adding more details.");
}
} catch {
  setAiSuggestions([]);
  setAiOptions([]);
  setAiError("Something went wrong while generating content. Please try again.");
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
  if (!selectedGalleryImageId) return;

  const node = galleryImageCardRefs.current[selectedGalleryImageId];

  if (!node) return;

  requestAnimationFrame(() => {
    node.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  });
}, [selectedGalleryImageId]);

  useEffect(() => {
  function handleFocusTimelineEntry(event: Event) {
    const customEvent = event as CustomEvent<{
      blockId?: string;
      entryId?: string;
    }>;

    const blockId = customEvent.detail?.blockId;
    const entryId = customEvent.detail?.entryId;

    if (!blockId || !entryId) return;

    setSelection(selectionFromCanvasBlockId(blockId));
    setFocusedTimelineEntryId(entryId);

    requestAnimationFrame(() => {
      document
        .getElementById(`timeline-entry-inspector-${entryId}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    });
  }

  window.addEventListener(
    "ko-host-focus-timeline-entry",
    handleFocusTimelineEntry,
  );

  return () => {
    window.removeEventListener(
      "ko-host-focus-timeline-entry",
      handleFocusTimelineEntry,
    );
  };
}, []);


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

    useEffect(() => {
    if (typeof window === "undefined") return;

    window.sessionStorage.setItem(
      "ko-host-builder-canvas-zoom",
      String(canvasZoom),
    );
  }, [canvasZoom]);

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
      placeholder="Enter text..."
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
  const hasTexture = Boolean(
    block.data.style?.textureEnabled && block.data.style?.textureImageUrl,
  );

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
          backgroundImage: hasTexture
            ? `url("${block.data.style?.textureImageUrl}")`
            : undefined,
          backgroundRepeat: hasTexture ? "repeat" : undefined,
          backgroundSize: hasTexture
            ? `${block.data.style?.textureScale ?? 100}%`
            : undefined,
          backgroundPosition: hasTexture
            ? `${block.data.style?.texturePositionX ?? 50}% ${
                block.data.style?.texturePositionY ?? 50
              }%`
            : undefined,
          backgroundClip: hasTexture ? "text" : undefined,
          WebkitBackgroundClip: hasTexture ? "text" : undefined,
          color: hasTexture ? "transparent" : block.data.style?.color || undefined,
          WebkitTextFillColor: hasTexture ? "transparent" : block.data.style?.color || undefined,
          transform: `translate(${((block.data as any).positionX ?? 50) - 50}%, ${
            ((block.data as any).positionY ?? 50) - 50
          }%)`,
        }}
      />
    </div>
  );
}

if (block.type === "text_fx") {
  const hasTexture = Boolean(
    block.data.style?.textureEnabled && block.data.style?.textureImageUrl,
  );

  return (
    <div className="h-full w-full">
      <BlockRenderer
        block={{
          ...block,
          data: {
            ...block.data,
            style: {
              ...block.data.style,
              color: hasTexture ? "transparent" : block.data.style?.color,
              WebkitTextFillColor: hasTexture
                ? "transparent"
                : block.data.style?.color,
              backgroundImage: hasTexture
                ? `url("${block.data.style?.textureImageUrl}")`
                : undefined,
              backgroundRepeat: hasTexture ? "repeat" : undefined,
              backgroundSize: hasTexture
                ? `${block.data.style?.textureScale ?? 100}%`
                : undefined,
              backgroundPosition: hasTexture
                ? `${block.data.style?.texturePositionX ?? 50}% ${
                    block.data.style?.texturePositionY ?? 50
                  }%`
                : undefined,
              backgroundClip: hasTexture ? "text" : undefined,
              WebkitBackgroundClip: hasTexture ? "text" : undefined,
            } as any,
          },
        }}
        designKey={designKey}
      />
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

    if (block.type === "audio") {
      return block.data.audioUrl ? (
        <div
          className="h-full w-full"
          onDoubleClick={() => void uploadAudioToSelectedBlock(block.id)}
          title="Double-click to replace audio"
        >
          <BlockRenderer block={block} designKey={designKey} />
        </div>
      ) : (
        <button
          type="button"
          className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 text-center text-sm font-medium text-neutral-600 hover:bg-neutral-100"
          onClick={() => void uploadAudioToSelectedBlock(block.id)}
        >
          Browse Audio
        </button>
      );
    }

if (block.type === "frame") {
  return (
    <div className="h-full w-full rounded-xl border-2 border-dashed border-neutral-700 bg-transparent" />
  );
}

    if (block.type === "puzzle") {
      return block.data.imageUrl ? (
        <div
          className="h-full w-full"
          onDoubleClick={() => uploadPuzzleImageToSelectedBlock(block.id)}
          title="Double-click to replace puzzle image"
        >
          <BlockRenderer block={block} designKey={designKey} />
        </div>
      ) : (
        <div
          className="h-full w-full cursor-pointer"
          onClick={() => uploadPuzzleImageToSelectedBlock(block.id)}
          onDoubleClick={() => uploadPuzzleImageToSelectedBlock(block.id)}
          title="Click to add puzzle image"
        >
          <BlockRenderer block={block} designKey={designKey} />
        </div>
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
  const behavior =
    ((block.data as any).behavior as
      | "always-open"
      | "accordion"
      | "accordion-single"
      | undefined) ?? "always-open";

  const showIcons = (block.data as any).showIcons !== false;
  const sectionStyle = ((block.data as any).sectionStyle ?? {}) as any;

  const questionStyle = getInlineTextStyle(
    ((block.data as any).questionStyle ?? block.data.style ?? {}) as TextStyle,
  );

  const answerStyle = getInlineTextStyle(
    ((block.data as any).answerStyle ?? block.data.style ?? {}) as TextStyle,
  );

  const sectionBackgroundColor =
    sectionStyle.backgroundColor === "transparent"
      ? "transparent"
      : sectionStyle.backgroundColor ?? "rgba(255,255,255,0.6)";

  const openAll = behavior === "always-open";

  return (
    <div className="h-full w-full overflow-auto rounded-xl">
      <div className="space-y-2 p-2">
        {block.data.items.length ? (
          block.data.items.map((faqItem) => {
            const isOpen = openAll;

            return (
              <div
                key={faqItem.id}
                className="rounded-xl border p-2"
                style={{
                  backgroundColor: sectionBackgroundColor,
                  borderColor: sectionStyle.borderColor ?? "#e5e7eb",
                  borderWidth:
                    typeof sectionStyle.borderWidth === "number"
                      ? `${sectionStyle.borderWidth}px`
                      : sectionStyle.borderWidth ?? "1px",
                  borderStyle: "solid",
                  borderRadius:
                    typeof sectionStyle.borderRadius === "number"
                      ? `${sectionStyle.borderRadius}px`
                      : sectionStyle.borderRadius ?? "0.75rem",
                }}
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
                  className="flex w-full items-center justify-between gap-3 text-left text-sm font-medium"
                  style={questionStyle}
                >
                  <span>{faqItem.question || "Question"}</span>

                  {showIcons && behavior !== "always-open" ? (
                    <span className="shrink-0">›</span>
                  ) : null}
                </button>

                {isOpen ? (
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
                    className="mt-2 block w-full text-left text-sm"
                    style={answerStyle}
                  >
                    {faqItem.answer || "Answer"}
                  </button>
                ) : null}
              </div>
            );
          })
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
      const textStyle = getInlineTextStyle(block.data.style);
      const textAlign = block.data.style?.align ?? "left";

      return (
        <div
          className="h-full w-full overflow-auto rounded-xl p-2"
          style={{
            backgroundColor: block.data.transparentBackground
              ? "transparent"
              : (block.data.backgroundColor ?? "#ffffff"),
          }}
        >
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
              className="mb-2 block w-full"
              style={{
                ...textStyle,
                textAlign,
              }}
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
                  className="block w-full"
                  style={{
                    ...textStyle,
                    textAlign,
                  }}
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
                  className="mt-1 block w-full"
                  style={{
                    color: block.data.style?.color ?? "#525252",
                    textAlign,
                    fontSize: textStyle.fontSize
                      ? `calc(${textStyle.fontSize} * 0.85)`
                      : undefined,
                    fontFamily: textStyle.fontFamily,
                    fontWeight: textStyle.fontWeight,
                    fontStyle: textStyle.fontStyle,
                    textDecoration: textStyle.textDecoration,
                  }}
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
  return (
    <div className="h-full w-full">
      <BlockRenderer
        key={`${block.id}-${JSON.stringify(block.data)}`}
        block={block}
        designKey={designKey}
      />
    </div>
  );
}


// Donation render block
if (block.type === "donation") {
  const donationOptions = Array.isArray(block.data.donationOptions)
    ? block.data.donationOptions.filter(
        (item) =>
          item &&
          typeof item.amount === "number" &&
          Number.isFinite(item.amount) &&
          item.amount > 0,
      )
    : [];

  const donationButtonSpacing = Math.max(
    0,
    Number(block.data.buttonSpacing ?? 8),
  );

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

      {donationOptions.length ? (
        <div
          className="mt-4 flex flex-wrap"
          style={{
            marginLeft: `-${donationButtonSpacing / 2}px`,
            marginRight: `-${donationButtonSpacing / 2}px`,
          }}
        >
          {donationOptions.map((option, index) => {
            const amount = Number(option.amount || 0);
            const label =
              typeof option.label === "string" && option.label.trim().length > 0
                ? option.label.trim()
                : `$${formatCurrency(amount)}`;

            const buttonStyle =
              ((selectedBlock as any)?.data?.buttonStyle ?? {}) as any;
            const donationTextStyle =
              ((selectedBlock as any)?.data?.style ?? {}) as any;

            return (
              <button
                key={option.id || `donation-option-${index}`}
                type="button"
                className="inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2"
                style={{
                  marginLeft: `${donationButtonSpacing / 2}px`,
                  marginRight: `${donationButtonSpacing / 2}px`,
                  backgroundColor: buttonStyle.backgroundColor ?? "#171717",
                  color: buttonStyle.color ?? "#ffffff",
                  fontFamily:
                    buttonStyle.fontFamily ?? donationTextStyle.fontFamily,
                  fontSize:
                    typeof buttonStyle.fontSize === "number"
                      ? `${buttonStyle.fontSize}px`
                      : undefined,
                  fontWeight: buttonStyle.bold ? 700 : 500,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : (
        <div
          className="mt-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-sm text-neutral-500"
          style={getInlineTextStyle(block.data.style)}
        >
          Add donation buttons.
        </div>
      )}
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

if (block.type === "pop_balloon") {
  return <PopBalloonCanvasPreview block={block} />;
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
            (() => {
              const rawUrl = (block.data.videoUrl ?? "").trim();

              const buildEmbedUrl = (url: string) => {
                if (!url) return "";

                if (url.startsWith("data:video/")) return url;
                if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) return url;

                try {
                  const parsed = new URL(url);

                  if (
                    parsed.hostname.includes("youtube.com") &&
                    parsed.pathname === "/watch"
                  ) {
                    const videoId = parsed.searchParams.get("v");
                    if (videoId) {
                      return `https://www.youtube.com/embed/${videoId}`;
                    }
                  }

                  if (parsed.hostname.includes("youtu.be")) {
                    const videoId = parsed.pathname.replace(/^\/+/, "");
                    if (videoId) {
                      return `https://www.youtube.com/embed/${videoId}`;
                    }
                  }

                  if (
                    parsed.hostname.includes("youtube.com") &&
                    parsed.pathname.startsWith("/embed/")
                  ) {
                    return url;
                  }

                  if (parsed.hostname.includes("vimeo.com")) {
                    const videoId = parsed.pathname.replace(/^\/+/, "");
                    if (videoId) {
                      return `https://player.vimeo.com/video/${videoId}`;
                    }
                  }

                  return url;
                } catch {
                  return url;
                }
              };

              const resolvedUrl = buildEmbedUrl(rawUrl);
              const isDirectVideo =
                resolvedUrl.startsWith("data:video/") ||
                /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(resolvedUrl);

              return isDirectVideo ? (
                <video
                  src={resolvedUrl}
                  className="h-full w-full"
                  autoPlay={Boolean(block.data.autoplay)}
                  muted={Boolean(block.data.muted)}
                  loop={Boolean(block.data.loop)}
                  controls={Boolean(block.data.showControls)}
                  playsInline
                />
              ) : (
                <iframe
                  src={`${resolvedUrl}${
                    resolvedUrl.includes("?") ? "&" : "?"
                  }autoplay=${block.data.autoplay ? 1 : 0}&mute=${
                    block.data.muted ? 1 : 0
                  }&loop=${block.data.loop ? 1 : 0}&controls=${
                    block.data.showControls ? 1 : 0
                  }`}
                  className="h-full w-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              );
            })()
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
      className="h-full w-full rounded-xl overflow-y-auto"
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
          className="min-h-full min-w-0 max-w-full text-sm text-neutral-800 break-words outline-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:ml-1 [&_li]:list-item [&_li>p]:m-0 [&_li>p]:inline [&_p]:my-0 [&_p+p]:mt-3 [&_p:empty]:min-h-[1em] [&_a]:break-words [&_a]:underline [&_img]:max-w-full [&_img]:h-auto"
          style={richTextStyle}
          dangerouslySetInnerHTML={{
            __html:
              typeof block.data.contentHtml === "string"
                ? block.data.contentHtml
                : block.data.content || "",
          }}
        />
      </div>
    </div>
  );
}

    if (block.type === "icon") {
      const icon = block.data.icon;
      const iconUrl = `/media-icons/${String(block.label || icon.alt || "star")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}.svg`;

      const positionX = icon.positionX ?? 50;
      const positionY = icon.positionY ?? 50;
      const zoom = icon.zoom ?? 1;
      const rotation = icon.rotation ?? 0;
      const translateX = (positionX - 50) * 0.6;
      const translateY = (positionY - 50) * 0.6;

      return (
        <div className="flex h-full w-full items-center justify-center overflow-visible">
          <div
            className="h-full w-full"
            style={{
              transform: `translate(${translateX}%, ${translateY}%) scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: "center center",
              opacity: icon.opacity ?? 1,
              backgroundColor: icon.color ?? "#111111",
              WebkitMaskImage: `url("${iconUrl}")`,
              maskImage: `url("${iconUrl}")`,
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskSize: "contain",
              maskSize: "contain",
            }}
          />
        </div>
      );
    }

    if (block.type === "timeline") {
      return (
        <div className="h-full w-full">
<BlockRenderer
  block={block}
  designKey={designKey}
  onFocusTimelineEntry={(blockId, entryId) => {
    setSelection(selectionFromCanvasBlockId(blockId));
    setFocusedTimelineEntryId(entryId);

    requestAnimationFrame(() => {
      document
        .getElementById(`timeline-entry-inspector-${entryId}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    });
  }}
/>
        </div>
      );
    }

    return <BlockRenderer block={block} designKey={designKey} />;
  }

  const scrollbarWidth = getGridCanvasScrollableWidth();

const toolSetItems = [...canvasItems]
  .sort(
    (a, b) =>
      Number(b.grid?.zIndex ?? 1) - Number(a.grid?.zIndex ?? 1),
  )
  .map((item) => ({
    id: item.id,
    label: item.label || item.type,
    kind: isPageBlockId(item.id) ? "page" : item.type,
    canRename: !isPageBlockId(item.id),
    zIndex: Number(item.grid?.zIndex ?? 1),
  }));

function getToolSearchKey(category: BottomCategory, tool: { label: string; type: string }) {
  return `${category}-${tool.type}-${tool.label}`;
}

function toolMatchesSearch(
  query: string,
  category: BottomCategory,
  tool: { label: string; type: string },
) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return false;

  const haystack = [
    tool.label,
    tool.type,
    category,
    TOOL_DESCRIPTIONS[tool.label] ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}

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
const handleJumpToFullCanvasView = () => {
  topBarScrollRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

const galleryImageCardRefs = useRef<
  Record<string, HTMLDivElement | null>
>({});


const getSaveFailureHelp = (message?: string) => {
  const lowerMessage = String(message ?? "").toLowerCase();

  if (lowerMessage.includes("payload") || lowerMessage.includes("too large")) {
    return "Your draft is likely too large. Remove oversized uploaded images, avoid base64/data URLs, or replace large Supabase-hosted images with /public/designs assets.";
  }

  if (lowerMessage.includes("network") || lowerMessage.includes("fetch")) {
    return "Network request failed. Check your internet connection, then try saving again.";
  }

  if (lowerMessage.includes("unauthorized") || lowerMessage.includes("401")) {
    return "Your session may have expired. Sign in again, then retry saving.";
  }

  if (lowerMessage.includes("supabase") || lowerMessage.includes("402")) {
    return "Supabase may be blocking requests due to quota or billing limits. Check Supabase usage and reduce storage/egress.";
  }

  return "Try again. If it keeps failing, reduce large images/files in the draft and check the browser console/network tab for the exact error.";
};

return (
  <div className="flex min-h-screen flex-col bg-[#f3f3f3] pt-4">
    <div className="border-b border-black/10 bg-white px-6 py-3">
      
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Editing
          </div>

          <div className="mt-1 text-2xl font-semibold text-neutral-900">
            {currentSiteName}
          </div>
        </div>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
        <span>{currentSiteDisplay}</span>

        <button
          type="button"
          onClick={handleCopyUrl}
          className="rounded-xl border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
        >
          {copied ? "Copied!" : "Copy URL"}
        </button>

        <button
          type="button"
          onClick={handleCopyDraftJson}
          className="rounded-xl border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
        >
          {draftCopied ? "Draft Copied!" : "Copy Blueprint"}
        </button>

        <button
          type="button"
          onClick={() => {
            setBuildPresetJson("");
            setBuildPresetError("");
            setBuildPresetModalOpen(true);
          }}
          className="rounded-xl border border-neutral-900 bg-neutral-900 px-3 py-1 text-xs font-medium text-white hover:bg-neutral-800"
        >
          Build From Blueprint
        </button>
      </div>

{buildPresetConfirmOpen ? (
  <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 px-4">
    <div className="relative z-[10002] w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl">
      <div className="text-lg font-semibold text-neutral-950">
        Replace current draft?
      </div>

      <p className="mt-2 text-sm leading-6 text-neutral-600">
        This will replace the current draft with the pasted Design Specs.\nCurrent unsaved changes will be lost.
      </p>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setPendingPresetDraft(null);
            setBuildPresetConfirmOpen(false);
          }}
          className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={confirmBuildPresetDesign}
          className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Replace Draft
        </button>
      </div>
    </div>
  </div>
) : null}

      {buildPresetModalOpen ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
          <div className="relative z-[10000] w-full max-w-2xl rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl">
            <div className="text-lg font-semibold text-neutral-950">
              Build Design From Blueprint
            </div>

            <p className="mt-2 text-sm text-neutral-600">
              Paste Blueprint Design Specs (JSON) below. Building will replace the current draft on this page.
            </p>

<textarea
  autoFocus
  ref={(el) => {
    if (el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }}
  value={buildPresetJson}
  onChange={(e) => {
    setBuildPresetJson(e.target.value);
    if (buildPresetError) setBuildPresetError("");
  }}
  placeholder='Paste JSON here, starting with { "title": ... }'
  className="mt-4 min-h-[320px] w-full rounded-2xl border border-neutral-300 bg-white p-4 font-mono text-xs text-neutral-900 outline-none"
/>

            {buildPresetError ? (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {buildPresetError}
              </div>
            ) : null}

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setBuildPresetModalOpen(false);
                  setBuildPresetJson("");
                  setBuildPresetError("");
                }}
                className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleBuildPresetDesign}
                className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Build
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4 rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex-1 overflow-x-auto">
            <div className="flex min-w-max items-center gap-2 pr-2">
{(
  pageDragPreview ??
  (pages && pages.length > 0
    ? pages
    : [
        {
          id: "home",
          slug: "home",
          title: "Home",
          display_order: 0,
        },
      ])
).map((page) => {
                const homePage =
                  pages?.find((item) => item.slug === "home") ??
                  pages?.[0] ??
                  null;

                const isHomePage =
                  page.id === "forced-home" ||
                  page.slug === "home" ||
                  page.id === homePage?.id;

                const isActive =
                  activePageId === page.id || (!activePageId && isHomePage);

                return (
                  <div
                    key={page.id}
                    draggable={!isHomePage}
                    onDragStart={(e) => {
                      if (isHomePage) return;
                      e.dataTransfer.effectAllowed = "move";
                      setDraggedPageId(page.id);
                      setPageDragPreview(pages ?? null);
                    }}
onDragEnd={() => {
  setDraggedPageId(null);
}}
                    onDragOver={(e) => {
                      if (isHomePage || !draggedPageId || draggedPageId === page.id) return;

                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";

                      setPageDragPreview((current) => {
                        const allPages = current ?? pages ?? [];
                        const fixedHomePage =
                          allPages.find((item) => item.slug === "home") ?? allPages[0];

                        if (!fixedHomePage || draggedPageId === fixedHomePage.id) {
                          return allPages;
                        }

                        const movablePages = allPages.filter(
                          (item) =>
                            item.id !== fixedHomePage.id &&
                            item.id !== "forced-home" &&
                            item.slug !== "home",
                        );

                        const fromIndex = movablePages.findIndex(
                          (item) => item.id === draggedPageId,
                        );
                        const toIndex = movablePages.findIndex(
                          (item) => item.id === page.id,
                        );

                        if (fromIndex < 0 || toIndex < 0) return allPages;

                        const [movedPage] = movablePages.splice(fromIndex, 1);
                        movablePages.splice(toIndex, 0, movedPage);

                        return [fixedHomePage, ...movablePages];
                      });
                    }}
onDrop={async (e) => {
  e.preventDefault();

  if (
    isHomePage ||
    !draggedPageId ||
    draggedPageId === page.id ||
    !onReorderPages
  ) {
    setDraggedPageId(null);
    return;
  }

  const allPages = pageDragPreview ?? pages ?? [];
  const homePage = allPages[0];
  const movablePages = allPages.slice(1);

  const fromIndex = movablePages.findIndex(
    (item) => item.id === draggedPageId,
  );
  const toIndex = movablePages.findIndex(
    (item) => item.id === page.id,
  );

  if (fromIndex < 0 || toIndex < 0 || !homePage) {
    setDraggedPageId(null);
    setPageDragPreview(null);
    return;
  }

  const [movedPage] = movablePages.splice(fromIndex, 1);
  movablePages.splice(toIndex, 0, movedPage);

  const nextPages = [homePage, ...movablePages];

  setPageDragPreview(nextPages);
  await onReorderPages(nextPages);

  setDraggedPageId(null);
  window.setTimeout(() => {
    setPageDragPreview(null);
  }, 0);
}}
                    className={!isHomePage ? "cursor-move" : ""}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectPage?.(page.id)}
                      className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
                        isActive
                          ? "bg-black text-white"
                          : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
                      }`}
                    >
                      {isHomePage ? (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          HOME
                        </span>
                      ) : (
                        <span>{page.slug}</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

<div className="flex items-center gap-2">
  <button
    type="button"
    onClick={onOpenAddPage}
    disabled={(pages?.length ?? 1) >= 5}
    className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    + Add Page
  </button>

  <button
    type="button"
    onClick={onDuplicateActivePage}
    disabled={!onDuplicateActivePage || !activePageId || (pages?.length ?? 1) >= 5}
    className="rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
  >
    Duplicate
  </button>

{activePageSlug && activePageSlug !== "home" ? (
  <>
    <button
      type="button"
      onClick={onRenameActivePage}
      className="rounded-xl bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
    >
      Rename Page
    </button>

    <button
      type="button"
      onClick={onRemoveActivePage}
      className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
    >
      Remove Page
    </button>
  </>
) : null}
          </div>
</div>
</div>
</div>

<div className="sticky top-0 z-[100] w-full bg-[#809cd4] shadow-md">
  <div
    ref={topBarScrollRef}
    className="flex w-full items-center justify-between gap-4 overflow-x-auto overflow-y-hidden bg-[#2f3541] px-2 py-2 shadow-md"
  >
    <div className="flex items-center justify-between gap-4">
      <div className="sticky left-0 z-0 flex min-w-max items-center gap-2 bg-[#2f3541] py-1 pr-4 pointer-events-auto">

<button
  type="button"
  className={topBarButtonClass(false)}
  onClick={handleJumpToFullCanvasView}
  title="Full canvas view"
  aria-label="Full canvas view"
>
  <Image
    src="/icons/icon_full_page_canvas.png"
    alt=""
    width={30}
    height={30}
    className="pointer-events-none h-[30px] w-[30px] object-contain"
  />
</button>

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

<div className="flex items-center gap-2">
  <input
    type="color"
    value={(draft as DraftWithPageExtras).pageColor ?? "#ffffff"}
    onChange={(e) => {
      const next = e.target.value;

      setDraft((prev) => {
        if ((prev as DraftWithPageExtras).pageColor === next) return prev;

        return {
          ...(prev as DraftWithPageExtras),
          pageColor: next,
        };
      });
    }}
    className={topBarColorClass(false)}
    title="Page color"
  />

  <button
    type="button"
    className={topBarButtonClass(false)}
    title="Pick fill color from screen"
    onClick={async () => {
      try {
        // @ts-ignore
        if (!window.EyeDropper) {
          alert("Eyedropper is not supported in this browser.");
          return;
        }

        // @ts-ignore
        const eyeDropper = new window.EyeDropper();

        const result = await eyeDropper.open();

        if (!result?.sRGBHex) return;

        setDraft((prev) => ({
          ...(prev as DraftWithPageExtras),
          pageColor: result.sRGBHex,
        }));
      } catch {
        // user cancelled
      }
    }}
  >
    <Image
      src="/icons/pick_color_icon.png"
      alt="Pick color"
      width={20}
      height={20}
      className="pointer-events-none h-5 w-5 object-contain"
    />
  </button>
</div>

      <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

      <div className="flex items-center gap-2">
  <div className={infoPillClass()}>{selectedContext.label}</div>

{selectedBlock ? (
  <>
    <button
      type="button"
      className={topBarButtonClass(false)}
      onClick={() => {
const idsToExpand =
  selectedBlockIds.length > 0
    ? selectedBlockIds
    : selection.type === "block"
      ? [selection.blockId]
      : selectedBlock?.id
        ? [selectedBlock.id]
        : [];

        if (!idsToExpand.length) return;

        setDraft((prev) => ({
          ...prev,
          blocks: prev.blocks.map((block) => {
            if (!idsToExpand.includes(block.id)) return block;

            const currentGrid = block.grid ?? {
              colStart: 1,
              rowStart: 1,
              colSpan: 4,
              rowSpan: 2,
              zIndex: 1,
            };

            return {
              ...block,
              grid: {
                colStart: 1,
                rowStart: currentGrid.rowStart ?? 1,
                colSpan: 12,
                rowSpan: currentGrid.rowSpan ?? 1,
                zIndex: currentGrid.zIndex ?? 1,
              },
            };
          }),
        }));
      }}
      title="Expand Horizon"
    >
      <Image
        src="/icons/icon_expand_horizon.png"
        alt="Expand Horizon"
        width={30}
        height={30}
        className="pointer-events-none h-[30px] w-[30px] object-contain"
      />
    </button>

<button
  type="button"
  className={topBarButtonClass(false)}
  onClick={() => {
    const activeIds =
      selectedBlockIds.length > 0
        ? selectedBlockIds
        : selection.type === "block"
          ? [selection.blockId]
          : selectedBlock?.id
            ? [selectedBlock.id]
            : [];

    if (!activeIds.length) return;

    alignSelectedBlockHorizontal("left", activeIds);
  }}
  title="Edge Left"
>
  <Image
    src="/icons/icon_edge_left.png"
    alt="Edge Left"
    width={30}
    height={30}
    className="pointer-events-none h-[30px] w-[30px] object-contain"
  />
</button>

<button
  type="button"
  className={topBarButtonClass(false)}
  onClick={() => {
    const activeIds =
      selectedBlockIds.length > 0
        ? selectedBlockIds
        : selection.type === "block"
          ? [selection.blockId]
          : selectedBlock?.id
            ? [selectedBlock.id]
            : [];

    if (!activeIds.length) return;

    alignSelectedBlockHorizontal("center", activeIds);
  }}
  title="Balance Center"
>
  <Image
    src="/icons/icon_balance_center.png"
    alt="Balance Center"
    width={30}
    height={30}
    className="pointer-events-none h-[30px] w-[30px] object-contain"
  />
</button>

<button
  type="button"
  className={topBarButtonClass(false)}
  onClick={() => {
    const activeIds =
      selectedBlockIds.length > 0
        ? selectedBlockIds
        : selection.type === "block"
          ? [selection.blockId]
          : selectedBlock?.id
            ? [selectedBlock.id]
            : [];

    if (!activeIds.length) return;

    alignSelectedBlockHorizontal("right", activeIds);
  }}
  title="Edge Right"
>
  <Image
    src="/icons/icon_edge_right.png"
    alt="Edge Right"
    width={30}
    height={30}
    className="pointer-events-none h-[30px] w-[30px] object-contain"
  />
</button>
</>
) : null}
</div>

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
            onClick={() =>
              updateTextFx({
                mode: "straight",
              })
            }
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
            onClick={() =>
              updateTextFx({
                mode: "arch",
                transformStyle: "normal",
              })
            }
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
            onClick={() =>
              updateTextFx({
                mode: "dip",
                transformStyle: "normal",
              })
            }
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
            onClick={() =>
              updateTextFx({
                mode: "circle",
                transformStyle: "normal",
              })
            }
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

{selectedBlock?.type === "donation" ? (
  <>
    <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

    <select
      value={donationStyleTarget}
      onChange={(e) =>
        setDonationStyleTarget(e.target.value as "background" | "buttons")
      }
      className={topBarFieldClass("w-[130px]")}
      title="Donation styling target"
    >
      <option value="background">Background</option>
      <option value="buttons">Buttons</option>
    </select>
  </>
) : null}

      {selectedBlock?.type === "rsvp" ? (
  <div className="flex items-center gap-2">
    <div className="text-xs font-medium text-neutral-600">RSVP Element</div>
    <select
      value={selectedRsvpElementKey}
      onChange={(e) =>
        setSelectedRsvpElementKey(
          e.target.value as
            | "form"
            | "image"
            | "heading"
            | "nameLabel"
            | "firstName"
            | "lastName"
            | "email"
            | "address"
            | "attending"
            | "meal"
            | "guestToggle"
            | "guestCount"
            | "guestName"
            | "comments",
        )
      }
      className="h-9 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900"
    >
      {rsvpElementOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
) : null}


      {showTextControls ? (
        <>

{null}


{selectedBlock?.type === "frame" ? (
  <div id="inspector-frame" className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Frame</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Frame Name</div>
      <input
        type="text"
        value={selectedBlock.data.frameName ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "frame"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    frameName: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
        placeholder="Frame"
      />
    </div>

    <p className="mt-3 text-xs leading-relaxed text-neutral-500">
      Frame borders show only on the builder canvas. They are hidden on public and preview pages.
    </p>
  </div>
) : null}


{selectedBlock?.type === "progress_bar" ? (
  <>
    <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

    <select
      value={progressBarStyleTarget}
      onChange={(e) =>
        setProgressBarStyleTarget(
          e.target.value as
            | "background"
            | "bar"
            | "scope"
            | "context"
            | "meterContext"
            | "meterCaption"
        )
      }
      className={topBarFieldClass("w-[155px]")}
      title="Progress bar style target"
    >
      <option value="background">Background</option>
      <option value="bar">Bar</option>
      <option value="scope">Scope</option>
      <option value="context">Context</option>
      <option value="meterContext">Meter Value</option>
      <option value="meterCaption">Caption</option>
    </select>
  </>
) : null}

        {selectedBlock?.type === "highlight" ? (
          <>
            <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

            <select
              value={highlightStyleTarget}
              onChange={(e) =>
                setHighlightStyleTarget(
                  e.target.value as "heading" | "body",
                )
              }
              className={topBarFieldClass("w-[140px]")}
              title="Highlight text target"
            >
              <option value="heading">Heading</option>
              <option value="body">Body</option>
            </select>
          </>
        ) : null}

        {selectedBlock?.type === "faq" ? (
  <>
    <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

    <select
      value={faqStyleTarget}
      onChange={(e) =>
        setFaqStyleTarget(
          e.target.value as "form" | "section" | "question" | "answer",
        )
      }
      className={topBarFieldClass("w-[150px]")}
      title="FAQ style target"
    >
      <option value="form">Form</option>
      <option value="section">Q&A Section</option>
      <option value="question">Section: Question</option>
      <option value="answer">Section: Answer</option>
    </select>
  </>
) : null}


          {(selectedBlockFromDraft as any)?.type !== "gallery" ||
          Boolean((selectedBlockFromDraft as any)?.data?.addCaption) ? (
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

<div className="relative" data-font-family-menu="true">
  <button
    type="button"
    className={topBarFieldClass("min-w-[160px] text-left")}
    style={{
      fontFamily: resolveFontFamily(selectedStyle.fontFamily ?? "inherit"),
    }}
    onClick={(e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setFontMenuPosition({
        left: rect.left,
        top: rect.bottom + 8,
      });
      setFontMenuOpen((open) => !open);
    }}
    title="Font family"
  >
    {selectedStyle.fontFamily ?? "inherit"}
  </button>

{fontMenuOpen ? (
  <div
    data-font-family-menu="true"
    className="fixed z-[9999999] max-h-80 min-w-[220px] overflow-y-auto rounded-xl border border-neutral-200 bg-white p-1 shadow-xl"
    style={{
      left: fontMenuPosition.left,
      top: fontMenuPosition.top,
    }}
  >
    {FONT_FAMILY_OPTIONS.map((font) => (
      <button
        key={font}
        type="button"
        className={[
          "block w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-900 hover:bg-neutral-100",
          (selectedStyle.fontFamily ?? "inherit") === font
            ? "bg-neutral-100 font-semibold"
            : "",
        ].join(" ")}
        style={{
          fontFamily: resolveFontFamily(font),
        }}
        onMouseEnter={() => applyStylePatch({ fontFamily: font })}
        onFocus={() => applyStylePatch({ fontFamily: font })}
        onClick={() => {
          applyStylePatch({ fontFamily: font });
          setFontMenuOpen(false);
        }}
      >
        {font}
      </button>
    ))}
  </div>
) : null}
</div>

<input
  type="number"
  min={1}
  max={480}
  value={selectedStyle.fontSize ?? 16}
  onChange={(e) => {
    const nextFontSize = Math.max(
      1,
      Math.min(480, Number(e.target.value) || 16),
    );

    if (nextFontSize === selectedStyle.fontSize) return;

    applyStylePatch({
      fontSize: nextFontSize,
    });
  }}
  className={topBarFieldClass("w-16")}
  title="Font size"
/>

          <input
            type="color"
            value={selectedStyle.color ?? "#111827"}
            onChange={(e) => {
              const value = e.target.value;
              requestAnimationFrame(() => {
                applyTextColor(value);
              });
            }}
            className={topBarColorClass(false)}
            title="Text color"
          />

          <button
            type="button"
            className={eyedropperButtonClass()}
            onClick={() =>
              void pickColorWithEyeDropper((color) => {
                requestAnimationFrame(() => {
                applyTextColor(color);
              });
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
            </>
          ) : null}

          {selectedBlock?.type === "links" ? (
            <>
              <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

              <input
                type="color"
                value={
                  selectedBlock.data.transparentBackground
                    ? "#ffffff"
                    : (selectedBlock.data.backgroundColor ?? "#ffffff")
                }
                onChange={(e) => applyLinksBackgroundColor(e.target.value)}
                className={topBarColorClass(false)}
                title="Link block background color"
              />

              <button
                type="button"
                className={eyedropperButtonClass()}
                onClick={() =>
                  void pickColorWithEyeDropper((color) => {
                    applyLinksBackgroundColor(color);
                  })
                }
                title="Pick link block background color from screen"
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
                  Boolean(selectedBlock.data.transparentBackground),
                )}
                onClick={clearLinksBackgroundColor}
                title="Transparent link block background"
              >
                ☐
              </button>
            </>
          ) : null}

          {selectedBlock?.type === "poll" || selectedBlock?.type === "highlight" ? (
            <>
              <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

              <input
                type="color"
                value={
                  selectedAppearance.backgroundColor === "transparent"
                    ? "#ffffff"
                    : (selectedAppearance.backgroundColor ?? "#ffffff")
                }
                onChange={(e) => applyFillColor(e.target.value)}
                className={topBarColorClass(false)}
                title={
                  selectedBlock.type === "poll"
                    ? "Poll background color"
                    : "Highlight background color"
                }
              />

              <button
                type="button"
                className={eyedropperButtonClass()}
                onClick={() =>
                  void pickColorWithEyeDropper((color) => {
                    applyFillColor(color);
                  })
                }
                title={
                  selectedBlock.type === "poll"
                    ? "Pick poll background color from screen"
                    : "Pick highlight background color from screen"
                }
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
                  selectedAppearance.backgroundColor === "transparent",
                )}
                onClick={() =>
                  applyAppearancePatch({ backgroundColor: "transparent" })
                }
                title={
                  selectedBlock.type === "poll"
                    ? "Transparent poll background"
                    : "Transparent highlight background"
                }
              >
                ☐
              </button>
            </>
          ) : null}

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
                <span>Messages</span>
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
                  title="Maximum messages loaded/displayed in the thread"
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

            {selectedBlock?.type === "icon" ? (
        <>
          <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

          <div className={topBarSliderWrapClass()}>
            <span>X</span>
            <input
              type="range"
              min={0}
              max={100}
              value={selectedBlock.data.icon.positionX ?? 50}
              onChange={(e) =>
                updateSelectedIconPatch({
                  positionX: Number(e.target.value),
                })
              }
              className={topBarSliderClass()}
              title="Icon horizontal position"
            />
          </div>

          <div className={topBarSliderWrapClass()}>
            <span>Y</span>
            <input
              type="range"
              min={0}
              max={100}
              value={selectedBlock.data.icon.positionY ?? 50}
              onChange={(e) =>
                updateSelectedIconPatch({
                  positionY: Number(e.target.value),
                })
              }
              className={topBarSliderClass()}
              title="Icon vertical position"
            />
          </div>

          <div className={topBarSliderWrapClass()}>
            <span>Zoom</span>
            <input
              type="range"
              min={50}
              max={300}
              value={Math.round((selectedBlock.data.icon.zoom ?? 1) * 100)}
              onChange={(e) =>
                updateSelectedIconPatch({
                  zoom: Number(e.target.value) / 100,
                })
              }
              className={topBarSliderClass()}
              title="Icon zoom"
            />
          </div>

          <div className={topBarSliderWrapClass()}>
            <span>Rotate</span>
            <input
              type="range"
              min={-180}
              max={180}
              value={selectedBlock.data.icon.rotation ?? 0}
              onChange={(e) =>
                updateSelectedIconPatch({
                  rotation: Number(e.target.value),
                })
              }
              className={topBarSliderClass()}
              title="Icon rotation"
            />
          </div>

          <div className={topBarSliderWrapClass()}>
            <span>Opacity</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round((selectedBlock.data.icon.opacity ?? 1) * 100)}
              onChange={(e) =>
                updateSelectedIconPatch({
                  opacity: Number(e.target.value) / 100,
                })
              }
              className={topBarSliderClass()}
              title="Icon opacity"
            />
            <span>{Math.round((selectedBlock.data.icon.opacity ?? 1) * 100)}%</span>
          </div>
        </>
      ) : null}

      {showAppearanceControls ? (
        <>
          <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

<input
  type="color"
  value={
    selectedBlock?.type === "rsvp"
      ? selectedRsvpElementBackgroundColor === "transparent"
        ? "#ffffff"
        : selectedRsvpElementBackgroundColor
      : selectedAppearance.backgroundColor === "transparent"
        ? "#ffffff"
        : (selectedAppearance.backgroundColor ?? "#ffffff")
  }
  onChange={(e) => {
  if (selectedBlock?.type === "rsvp" && selectedRsvpElementKey === "form") {
    applyAppearancePatch({ backgroundColor: e.target.value });
    return;
  }

  applyFillColor(e.target.value);
}}
  className={topBarColorClass(false)}
  title={
    selectedBlock?.type === "rsvp"
      ? "RSVP element background color"
      : "Fill color"
  }
/>

          <button
            type="button"
            className={eyedropperButtonClass()}
            onClick={() =>
              void pickColorWithEyeDropper((color) => {
                if (selectedBlock?.type === "rsvp" && selectedRsvpElementKey === "form") {
                    applyAppearancePatch({ backgroundColor: color });
                    return;
                  }

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
  className={topBarButtonClass(
    selectedBlock?.type === "faq" && faqStyleTarget === "section"
      ? ((selectedBlock.data as any).sectionStyle?.backgroundColor === "transparent")
      : selectedBlock?.type === "rsvp"
        ? selectedRsvpElementBackgroundColor === "transparent"
        : selectedAppearance.backgroundColor === "transparent",
  )}
  onClick={() => {
    // ✅ FAQ SECTION (fix)
    if (selectedBlock?.type === "faq" && faqStyleTarget === "section") {
      updateSelectedBlock((block) =>
        block.type !== "faq"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                sectionStyle: {
                  ...((block.data as any).sectionStyle ?? {}),
                  backgroundColor: "transparent",
                },
              },
            },
      );
      return;
    }

if (selectedBlock?.type === "rsvp") {
  updateSelectedRsvpElementStyle((current) => ({
    ...current,
    backgroundColor: "transparent",
  }));
  return;
}

    if (selectedBlock?.type === "checkout") {
      updateSelectedBlock((block) =>
        block.type !== "checkout"
          ? block
          : {
              ...block,
              appearance: {
                ...block.appearance,
                backgroundColor: "transparent",
              },
            },
      );
      return;
    }

    applyAppearancePatch({ backgroundColor: "transparent" });
  }}
  title={
    selectedBlock?.type === "rsvp"
      ? "Transparent RSVP element background"
      : "Transparent fill"
  }
>
  <Image
    src="/icons/transparent_fill_icon.png"
    alt="Transparent fill"
    width={20}
    height={20}
    className="pointer-events-none object-contain"
  />
</button>

{selectedBlockSupportsTexture ? (
  <>
    <input
      ref={textureInputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        handleTextureFileChange(e.target.files);
        e.target.value = "";
      }}
    />

    <button
      type="button"
      className={topBarButtonClass()}
      onClick={() => textureInputRef.current?.click()}
      title={
        selectedBlock?.type === "label" || selectedBlock?.type === "text_fx"
          ? "Add texture to text"
          : "Add texture to border/frame"
      }
    >
      {/* Add Texture */}
              <Image
          src="/icons/icon_add_texture.png"
          alt="Add Texture"
          width={30}
          height={30}
          className="pointer-events-none h-[30px] w-[30px] object-contain"
        />
    </button>

    {selectedBlockTextureEnabled ? (
      <button
        type="button"
        className={topBarButtonClass()}
        onClick={removeTextureFromSelectedBlock}
        title="Remove texture"
      >
        {/* Remove Texture */}
              <Image
          src="/icons/icon_remove_texture.png"
          alt="Remove Texture"
          width={30}
          height={30}
          className="pointer-events-none h-[30px] w-[30px] object-contain"
        />
      </button>
    ) : null}
  </>
) : null}

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
                <span className="text-xs text-white/70">
                  Recent
                </span>

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
size="wide"
title="Smart Content Assistant"
description="Generate polished microsite content with guided inputs."
confirmText=""
cancelText="Close"
loading={aiLoading}
onCancel={() => setShowAiSuggestions(false)}
>
  <div className="mt-4 max-h-[72vh] overflow-y-auto pr-2">
  <div className="grid min-w-[720px] gap-6 lg:grid-cols-[320px_minmax(360px,1fr)]">
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Subject
        </label>

        <input
          type="text"
          value={aiSubject}
          onChange={(e) => setAiSubject(e.target.value)}
          placeholder="Wedding announcement"
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Details
        </label>

        <textarea
          value={aiDetails}
          onChange={(e) => setAiDetails(e.target.value)}
          placeholder="Add important details, vibe, location, pricing, timing..."
          rows={6}
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </div>

      <button
        type="button"
        onClick={() =>
          setShowAiAdvancedOptions((prev) => !prev)
        }
        className="text-sm font-medium text-neutral-700 hover:text-black"
      >
        {showAiAdvancedOptions
          ? "Hide More Options"
          : "More Options"}
      </button>

      {showAiAdvancedOptions ? (
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Tone
            </label>

            <select
              value={aiTone}
              onChange={(e) => setAiTone(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
            >
              {[
                "Professional",
                "Friendly",
                "Elegant",
                "Funny",
                "Exciting",
                "Romantic",
                "Bold",
                "Casual",
                "Luxury",
                "Minimal",
              ].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Length
            </label>

            <select
              value={aiLength}
              onChange={(e) => setAiLength(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
            >
              {[
                "Very Short",
                "Short",
                "Medium",
                "Long",
              ].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Audience
            </label>

            <input
              type="text"
              value={aiAudience}
              onChange={(e) => setAiAudience(e.target.value)}
              placeholder="Customers, guests, parents..."
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Keywords
            </label>

            <input
              type="text"
              value={aiKeywords}
              onChange={(e) => setAiKeywords(e.target.value)}
              placeholder="live music, outdoor seating"
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Content Type
            </label>

            <select
              value={aiContentType}
              onChange={(e) =>
                setAiContentType(e.target.value)
              }
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
            >
              {[
                "Announcement",
                "Invitation",
                "Description",
                "Welcome message",
                "Promotion",
                "Event details",
                "About us",
                "FAQ answer",
                "Testimonial",
                "Call to action",
                "Menu description",
                "Schedule item",
              ].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Creativity Level
              </label>

              <span className="text-xs text-neutral-500">
                {aiCreativity}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              value={aiCreativity}
              onChange={(e) =>
                setAiCreativity(Number(e.target.value))
              }
              className="w-full"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={aiMatchPageStyle}
              onChange={(e) =>
                setAiMatchPageStyle(e.target.checked)
              }
            />

            Match page style
          </label>
        </div>
      ) : null}

      <button
        type="button"
        onClick={generateSmartContent}
        disabled={aiLoading}
        className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {aiLoading ? "Generating..." : "Generate Options"}
      </button>
    </div>

    <div className="min-w-0">
      {aiLoading ? (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-8 text-sm text-neutral-600">
          Generating polished content options...
        </div>
      ) : aiError ? (
  <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
    {aiError}
  </div>
) : aiOptions.length ? (
        <div className="space-y-4">
          {aiOptions.map((option) => (
            <div
              key={option.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <div className="mb-2 text-sm font-semibold text-neutral-900">
                {option.title}
              </div>

              <div className="whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                {option.text}
              </div>

              <button
                type="button"
                onClick={() => applyAiSuggestion(option.text)}
                className="mt-4 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
              >
                Use This
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 text-sm text-neutral-500">
          Generate content options to preview polished suggestions here.
        </div>
      )}
    </div>
  </div>
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
  ref={frameCaptureRootRef}
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
  onSelect={(next) => {
    // if clicking empty canvas → deselect
    if (!next || (next as any).type === "none") {
      setSelection({ type: "none" });
      return;
    }

    handleCanvasSelect(next as any);
  }}
  onMoveBlock={handleMoveBlock}
  onResizeBlock={handleResizeBlock}
  onBringToFront={handleBringToFront}
  onRemoveBlock={removeCanvasBlock}
    onDuplicateBlock={undefined}
  onCreateToolDrop={handleCreateToolDrop}
  renderBlockPreview={renderCanvasPreview}
  isItemSelected={(blockId, nextSelection) =>
    selectedBlockIds.includes(blockId) ||
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

  <div className="mt-3 flex items-center justify-between gap-3">
    <div className="min-w-0 text-lg font-semibold text-neutral-900">
      {selectedContext.label}
    </div>

    {selectedBlock && selectedBlockGuide ? (
      <button
        type="button"
        onClick={() => setBlockGuideOpen(true)}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-transparent shadow-none transition hover:bg-neutral-100"
        title={`Open ${selectedBlockGuide.title} guide`}
        aria-label={`Open ${selectedBlockGuide.title} guide`}
      >
        <Image
          src="/icons/icon_block_full_guide.png"
          alt=""
          width={16}
          height={16}
          className="pointer-events-none object-contain"
        />
      </button>
    ) : null}
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

    {selectedBlock?.type === "text_fx" ? (
      <div className="mt-4 grid grid-cols-1 gap-3">
        <div>
          <div className={inspectorLabelClass()}>
            Horizontal Position
          </div>

          <input
            type="range"
            min={0}
            max={100}
            value={selectedBlock.data.positionX ?? 50}
            onChange={(e) =>
              updateSelectedBlock((block) =>
                block.type !== "text_fx"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        positionX: Number(e.target.value),
                      },
                    },
              )
            }
            className="mt-2 w-full"
          />

          <div className="mt-1 text-xs text-neutral-500">
            {selectedBlock.data.positionX ?? 50}%
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
            value={selectedBlock.data.positionY ?? 50}
            onChange={(e) =>
              updateSelectedBlock((block) =>
                block.type !== "text_fx"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        positionY: Number(e.target.value),
                      },
                    },
              )
            }
            className="mt-2 w-full"
          />

          <div className="mt-1 text-xs text-neutral-500">
            {selectedBlock.data.positionY ?? 50}%
          </div>
        </div>
      </div>
    ) : null}
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
          value={(selectedTextFxBlock?.data.fx as any)?.intensity ?? 50}
          onChange={(e) =>
            updateTextFx({
              intensity: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div>
        <div className={inspectorLabelClass()}>Transform Style</div>

        <select
          value={
            (selectedTextFxBlock?.data.fx as any)?.transformStyle ?? "normal"
          }
          onChange={(e) => {
            const nextStyle = e.target.value;

            updateTextFx({
              transformStyle: nextStyle,

              ...(nextStyle !== "normal"
                ? {
                    mode: "straight",
                  }
                : {}),
            });
          }}
          className={inspectorInputClass()}
        >
          <option value="normal">Normal</option>
          <option value="wave">Wave</option>
          <option value="rise">Rise</option>
          <option value="dipLetters">Dip Letters</option>
          <option value="stagger">Stagger</option>
          <option value="tiltLeft">Tilt Left</option>
          <option value="tiltRight">Tilt Right</option>
          <option value="bounce">Bounce</option>
        </select>
      </div>

      <div>
        <div className={inspectorLabelClass()}>
          Transform Strength
        </div>

        <input
          type="range"
          min={0}
          max={200}
          value={
            (selectedTextFxBlock?.data.fx as any)?.transformStrength ?? 100
          }
          onChange={(e) =>
            updateTextFx({
              transformStrength: Math.max(
                0,
                Math.min(200, Number(e.target.value) || 0),
              ),
            })
          }
          className="mt-2 w-full"
        />

        <div className="mt-1 text-xs text-neutral-500">
          {(selectedTextFxBlock?.data.fx as any)?.transformStrength ?? 100}%
        </div>
      </div>

      <div>
        <div className={inspectorLabelClass()}>Rotate</div>
        <input
          type="number"
          min={-180}
          max={180}
          value={(selectedTextFxBlock?.data.fx as any)?.rotation ?? 0}
          onChange={(e) =>
            updateTextFx({
              rotation: Math.max(-180, Math.min(180, Number(e.target.value) || 0)),
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
          value={Math.round(((selectedTextFxBlock?.data.fx as any)?.opacity ?? 1) * 100)}
          onChange={(e) =>
            updateTextFx({
              opacity: Math.max(0, Math.min(100, Number(e.target.value) || 0)) / 100,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div>
        <div className={inspectorLabelClass()}>Letter Width (%)</div>
        <input
          type="number"
          min={50}
          max={200}
          value={Math.round(((selectedTextFxBlock?.data.fx as any)?.letterScaleX ?? 1) * 100)}
          onChange={(e) =>
            updateTextFx({
              letterScaleX:
                Math.max(50, Math.min(200, Number(e.target.value) || 100)) / 100,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
        <label className="flex items-center gap-3 text-sm font-medium text-neutral-800">
          <input
            type="checkbox"
            checked={(selectedTextFxBlock?.data.fx as any)?.shadowEnabled === true}
            onChange={(e) => updateTextFx({ shadowEnabled: e.target.checked })}
          />
          Text Shadow
        </label>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <div className={inspectorLabelClass()}>Shadow Color</div>
            <input
              type="color"
              value={(selectedTextFxBlock?.data.fx as any)?.shadowColor ?? "#000000"}
              onChange={(e) => updateTextFx({ shadowColor: e.target.value })}
              className={inspectorInputClass()}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div className={inspectorLabelClass()}>Blur</div>
              <div className="text-xs text-neutral-500">
                {Math.round((((selectedTextFxBlock?.data.fx as any)?.shadowBlur ?? 10) / 40) * 100)}%
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={40}
              value={(selectedTextFxBlock?.data.fx as any)?.shadowBlur ?? 10}
              onChange={(e) =>
                updateTextFx({
                  shadowBlur: Math.max(0, Math.min(40, Number(e.target.value) || 0)),
                })
              }
              className="mt-2 w-full"
            />
          </div>

<div>
  <div className="flex items-center justify-between">
    <div className={inspectorLabelClass()}>Offset X</div>
    <div className="text-xs text-neutral-500">
      {Math.round((((selectedTextFxBlock?.data.fx as any)?.shadowOffsetX ?? 0) + 50))}%
    </div>
  </div>

  <input
    type="range"
    min={-50}
    max={50}
    value={(selectedTextFxBlock?.data.fx as any)?.shadowOffsetX ?? 0}
    onChange={(e) =>
      updateTextFx({
        shadowOffsetX: Number(e.target.value) || 0,
      })
    }
    className="mt-2 w-full"
  />
</div>

<div>
  <div className="flex items-center justify-between">
    <div className={inspectorLabelClass()}>Offset Y</div>
    <div className="text-xs text-neutral-500">
      {Math.round((((selectedTextFxBlock?.data.fx as any)?.shadowOffsetY ?? 0) + 50))}%
    </div>
  </div>

  <input
    type="range"
    min={-50}
    max={50}
    value={(selectedTextFxBlock?.data.fx as any)?.shadowOffsetY ?? 0}
    onChange={(e) =>
      updateTextFx({
        shadowOffsetY: Number(e.target.value) || 0,
      })
    }
    className="mt-2 w-full"
  />
</div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
        <label className="flex items-center gap-3 text-sm font-medium text-neutral-800">
          <input
            type="checkbox"
            checked={(selectedTextFxBlock?.data.fx as any)?.outlineEnabled === true}
            onChange={(e) => updateTextFx({ outlineEnabled: e.target.checked })}
          />
          Text Outline
        </label>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <div className={inspectorLabelClass()}>Outline Color</div>
            <input
              type="color"
              value={
                (selectedTextFxBlock?.data.fx as any)?.outlineColor
                  ? String((selectedTextFxBlock?.data.fx as any).outlineColor)
                  : "#000000"
              }
              onChange={(e) => {
                updateTextFx({ outlineColor: e.target.value });
              }}
              className={inspectorInputClass()}
            />
          </div>

          <div>
            <div className={inspectorLabelClass()}>Width</div>
            <input
              type="number"
              min={0}
              max={12}
              value={Number((selectedTextFxBlock?.data.fx as any)?.outlineWidth ?? 2)}
              onChange={(e) => {
                updateTextFx({
                  outlineWidth: Math.max(0, Math.min(12, Number(e.target.value) || 0)),
                });
              }}
              className={inspectorInputClass()}
            />
          </div>
        </div>
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

                    <div className="mt-4">
                      <div className={inspectorLabelClass()}>Linked Highlight</div>
                      <select
                        value={selectedBlock.data.sourceBlockId ?? ""}
                        onChange={(e) =>
                          updateSelectedBlock((block) =>
                            block.type !== "poll"
                              ? block
                              : {
                                  ...block,
                                  data: {
                                    ...block.data,
                                    sourceBlockId: e.target.value,
                                    sourceType: e.target.value ? "highlight" : undefined,
                                  },
                                },
                          )
                        }
                        className={inspectorInputClass()}
                      >
                        <option value="">Select highlight block</option>
                        {draft.blocks
                          .filter((block) => block.type === "highlight")
                          .map((highlightBlock) => (
                            <option key={highlightBlock.id} value={highlightBlock.id}>
                              {highlightBlock.label || highlightBlock.data.heading || "Highlight"}
                            </option>
                          ))}
                      </select>
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

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Choose Image</div>
      <input
        type="text"
        value={selectedBlock.data.imageUrl ?? ""}
        placeholder="Paste image URL"
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "rsvp"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    imageUrl: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Image Frame Shape</div>
      <select
        value={selectedBlock.data.imageFrameShape ?? "circle"}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "rsvp"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    imageFrameShape: e.target.value as
                      | "square"
                      | "circle"
                      | "diamond"
                      | "heart",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="square">Square</option>
        <option value="circle">Circle</option>
        <option value="diamond">Diamond</option>
        <option value="heart">Heart</option>
      </select>
    </div>

    <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <div className={inspectorLabelClass()}>Are You Attending Section</div>

      <label className="mt-3 flex items-center gap-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.attendingDisplay !== false}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      attendingDisplay: e.target.checked,
                    },
                  },
            )
          }
        />
        Display in public form
      </label>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Default Table Value</div>
        <select
          value={selectedBlock.data.attendingDefaultValue ?? "Yes"}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      attendingDefaultValue: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          <option value={selectedBlock.data.attendingOptions?.[0] ?? "Yes"}>
            {selectedBlock.data.attendingOptions?.[0] ?? "Yes"}
          </option>
          <option value={selectedBlock.data.attendingOptions?.[1] ?? "No"}>
            {selectedBlock.data.attendingOptions?.[1] ?? "No"}
          </option>
        </select>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Label</div>
        <input
          type="text"
          value={selectedBlock.data.attendingLabel ?? "Are you attending?"}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      attendingLabel: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>
    </div>

    <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <div className={inspectorLabelClass()}>Meal Section</div>

      <label className="mt-3 flex items-center gap-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.mealDisplay !== false}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      mealDisplay: e.target.checked,
                    },
                  },
            )
          }
        />
        Display in public form
      </label>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Default Table Value</div>
        <select
          value={selectedBlock.data.mealDefaultValue ?? "Chicken"}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      mealDefaultValue: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          <option value={selectedBlock.data.mealOptions?.[0] ?? "Chicken"}>
            {selectedBlock.data.mealOptions?.[0] ?? "Chicken"}
          </option>
          <option value={selectedBlock.data.mealOptions?.[1] ?? "Salmon"}>
            {selectedBlock.data.mealOptions?.[1] ?? "Salmon"}
          </option>
        </select>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Label</div>
        <input
          type="text"
          value={selectedBlock.data.mealLabel ?? "Your meal selection:"}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      mealLabel: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>
    </div>

    <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <div className={inspectorLabelClass()}>Guest Section</div>

      <label className="mt-3 flex items-center gap-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.guestDisplay !== false}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      guestDisplay: e.target.checked,
                    },
                  },
            )
          }
        />
        Display in public form
      </label>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Default Table Value</div>
        <select
          value={selectedBlock.data.guestDefaultValue ?? "No"}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      guestDefaultValue: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          <option value={selectedBlock.data.guestOptions?.[0] ?? "Yes"}>
            {selectedBlock.data.guestOptions?.[0] ?? "Yes"}
          </option>
          <option value={selectedBlock.data.guestOptions?.[1] ?? "No"}>
            {selectedBlock.data.guestOptions?.[1] ?? "No"}
          </option>
        </select>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Label</div>
        <input
          type="text"
          value={selectedBlock.data.guestLabel ?? "Are you bringing a guest?"}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      guestLabel: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>
    </div>

    <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <div className={inspectorLabelClass()}>Comments Section</div>

      <label className="mt-3 flex items-center gap-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.commentsDisplay !== false}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      commentsDisplay: e.target.checked,
                    },
                  },
            )
          }
        />
        Display in public form
      </label>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Default Table Value</div>
        <textarea
          value={selectedBlock.data.commentsDefaultValue ?? ""}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      commentsDefaultValue: e.target.value,
                    },
                  },
            )
          }
          className={`${inspectorInputClass()} min-h-[80px] py-2`}
          placeholder="Optional default comments value"
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Label</div>
        <input
          type="text"
          value={selectedBlock.data.commentsLabel ?? "Additional comments"}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      commentsLabel: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Placeholder</div>
        <input
          type="text"
          value={selectedBlock.data.commentsPlaceholder ?? "Additional comments"}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "rsvp"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      commentsPlaceholder: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>
    </div>

    <div className="mt-5">
      <div className={inspectorLabelClass()}>Submit Button Text</div>
      <input
        type="text"
        value={selectedBlock.data.submitButtonText ?? "Submit RSVP"}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "rsvp"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    submitButtonText: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>
  </div>
) : null}

{selectedBlock?.type === "form_field" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Form Field</div>

    <div className="mt-4">
  <div className={inspectorLabelClass()}>Text Target</div>

  <select
    value={formFieldTextTarget}
onChange={(e) =>
  setFormFieldTextTarget(e.target.value as "form" | "text")
}
    className={inspectorInputClass()}
  >
<option value="form">Form</option>
<option value="text">Text</option>
  </select>
</div>

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
      <div className={inspectorLabelClass()}>Linked Submit Button</div>

      <select
        value={(selectedBlock.data as any).linkedButtonId ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "form_field"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    linkedButtonId: e.target.value || undefined,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="">No linked button</option>

        {ctaButtonOptions.map((button) => (
          <option key={button.id} value={button.id}>
            {button.label}
          </option>
        ))}
      </select>

      <p className="mt-2 text-xs leading-5 text-neutral-500">
        When this button is pressed, this field will be included in the combined general submission.
      </p>
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

{formFieldTextTarget === "text" ? (
  <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
    <div className={inspectorLabelClass()}>Text Area Padding</div>

    {[
      ["paddingLeft", "Left Padding"],
      ["paddingRight", "Right Padding"],
      ["paddingBottom", "Bottom Padding"],
    ].map(([key, label]) => (
      <div key={key} className="mt-4">
        <div className="flex items-center justify-between">
          <div className={inspectorLabelClass()}>{label}</div>
          <div className="text-xs text-neutral-500">
            {Number(((selectedBlock.data as any).inputStyle ?? {})[key] ?? 12)}px
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={160}
          value={Number(((selectedBlock.data as any).inputStyle ?? {})[key] ?? 12)}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "form_field"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      inputStyle: {
                        ...((block.data as any).inputStyle ??
                          block.data.style ??
                          {}),
                        [key]: Number(e.target.value),
                      },
                    },
                  },
            )
          }
          className="mt-2 w-full"
        />
      </div>
    ))}
  </div>
) : null}

<div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <label className="flex items-center gap-3 text-sm font-medium text-neutral-800">
    <input
      type="checkbox"
      checked={Boolean((selectedBlock.data as any).showRating)}
      onChange={(e) =>
        updateSelectedBlock((block) =>
          block.type !== "form_field"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  showRating: e.target.checked,
                },
              },
        )
      }
    />
    Show Rating
  </label>

  {(selectedBlock.data as any).showRating ? (
    <div className="mt-4 grid grid-cols-1 gap-3">
      <div>
        <div className={inspectorLabelClass()}>Star Color</div>
        <input
          type="color"
          value={(selectedBlock.data as any).ratingColor ?? "#F59E0B"}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "form_field"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      ratingColor: e.target.value,
                    },
                  },
            )
          }
          className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
        />
      </div>

      <div>
        <div className={inspectorLabelClass()}>Rating Position</div>
        <select
          value={(selectedBlock.data as any).ratingPosition ?? "high"}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "form_field"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      ratingPosition: e.target.value as "high" | "low",
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          <option value="high">High Level</option>
          <option value="low">Low Level</option>
        </select>
      </div>
    </div>
  ) : null}
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
  onChange={(e) => {
    const nextStyleVariant = e.target.value as
      | "default"
      | "cards"
      | "hero"
      | "stage"
      | "standard";

    updateSelectedBlock((block) =>
      block.type !== "countdown"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              styleVariant: nextStyleVariant as any,
            },
          },
    );
  }}
  className={inspectorInputClass()}
>
  <option value="default">Default</option>
  <option value="cards">Cards</option>
  <option value="hero">Hero</option>
  <option value="stage">Stage</option>
  <option value="standard">Standard</option>
</select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Animation Style</div>
<select
  value={
    ((selectedBlock.data as any).animationStyle ?? "none") === "slide"
      ? "bounce"
      : ((selectedBlock.data as any).animationStyle ?? "none")
  }
  onChange={(e) =>
    updateSelectedBlock((block) =>
      block.type !== "countdown"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              animationStyle: e.target.value as
                | "none"
                | "pulse"
                | "flip"
                | "bounce",
            },
          },
    )
  }
  className={inspectorInputClass()}
>
  <option value="none">None</option>
  <option value="pulse">Pulse</option>
  <option value="flip">Flip</option>
  <option value="bounce">Bounce</option>
</select>
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
        Countdown Style Target
      </div>

      <select
        value={countdownStyleTarget}
        onChange={(e) =>
          setCountdownStyleTarget(
            e.target.value as CountdownStyleTarget,
          )
        }
        className={inspectorInputClass()}
      >
        <option value="background">Background</option>

        {(["default", "cards", "hero"] as const).includes(
          ((selectedBlock.data as any).styleVariant ?? "default") as any,
        ) ? (
          <option value="tiles">Tiles</option>
        ) : null}

        <option value="values">Values</option>

        <option value="units">Units</option>

        <option value="heading">Heading</option>
      </select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Alignment</div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        {(["left", "center", "right"] as const).map((alignment) => {
          const active =
            (((selectedBlock.data as any).alignment ?? "center") as string) ===
            alignment;

          return (
            <button
              key={alignment}
              type="button"
              onClick={() =>
                updateSelectedBlock((block) =>
                  block.type !== "countdown"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          alignment,
                        },
                      },
                )
              }
              className={[
                "rounded-lg border px-3 py-2 text-xs font-medium transition",
                active
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100",
              ].join(" ")}
            >
              {alignment.charAt(0).toUpperCase() + alignment.slice(1)}
            </button>
          );
        })}
      </div>
    </div>

        <div className="mt-4">
      <div className={inspectorLabelClass()}>Spacing Between Values</div>

      <div className="mt-2 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={80}
          step={1}
          value={Number((selectedBlock.data as any).spacing ?? 12)}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "countdown"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      spacing: Number(e.target.value),
                    },
                  },
            )
          }
          className="w-full"
        />

        <div className="w-12 text-right text-xs text-neutral-500">
          {Number((selectedBlock.data as any).spacing ?? 12)}px
        </div>
      </div>
    </div>

        {((selectedBlock.data as any).styleVariant ?? "default") === "stage" ? (
      <div className="mt-4">
        <div className={inspectorLabelClass()}>Stage Value/Unit Spacing</div>

        <div className="mt-2 flex items-center gap-3">
          <input
            type="range"
            min={-40}
            max={20}
            step={1}
            value={Number((selectedBlock.data as any).stageUnitGap ?? -24)}
            onChange={(e) =>
              updateSelectedBlock((block) =>
                block.type !== "countdown"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        stageUnitGap: Number(e.target.value),
                      },
                    },
              )
            }
            className="w-full"
          />

          <div className="w-12 text-right text-xs text-neutral-500">
            {Number((selectedBlock.data as any).stageUnitGap ?? -24)}px
          </div>
        </div>
      </div>
    ) : null}

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

        {(["cards", "hero"] as const).includes(
      ((selectedBlock.data as any).styleVariant ?? "default") as any,
    ) ? (
      <div className="mt-3">
        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={(selectedBlock.data as any).showSeparator !== false}
            onChange={(e) =>
              updateSelectedBlock((block) =>
                block.type !== "countdown"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        showSeparator: e.target.checked,
                      },
                    },
              )
            }
          />
          Show Separator
        </label>
      </div>
    ) : null}

    <div className="mt-4 space-y-2">
  <div className={inspectorLabelClass()}>Visible Units</div>

  {[
    ["showDays", "Show Days"],
    ["showHours", "Show Hours"],
    ["showMinutes", "Show Minutes"],
    ["showSeconds", "Show Seconds"],
  ].map(([key, label]) => (
    <label
      key={key}
      className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800"
    >
      <input
        type="checkbox"
        checked={(selectedBlock.data as any)[key] !== false}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "countdown"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    [key]: e.target.checked,
                  },
                },
          )
        }
      />
      {label}
    </label>
  ))}
</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading (optional)</div>
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
      <div className={inspectorLabelClass()}>Completed Message</div>
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

{selectedBlock?.type === "timeline" ? (
  <div id="inspector-timeline" className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Story Timeline</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Text Target</div>

      <select
        value={timelineStyleTarget}
        onChange={(e) =>
          setTimelineStyleTarget(e.target.value as TimelineStyleTarget)
        }
        className={inspectorInputClass()}
      >
        <option value="title">Timeline Title</option>
        <option value="date">Entry Date</option>
        <option value="entryTitle">Entry Title</option>
        <option value="subtitle">Subtitle</option>
        <option value="description">Description</option>
      </select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "timeline"
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
  <div className={inspectorLabelClass()}>Style Variant</div>

  <select
    value={selectedBlock.data.styleVariant ?? "classic"}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        block.type !== "timeline"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                styleVariant: e.target.value as any,
              },
            },
      )
    }
    className={inspectorInputClass()}
  >
    <option value="classic">Classic Vertical</option>
    <option value="alternating">Alternating Vertical</option>
    <option value="horizontal">Horizontal Timeline</option>
    <option value="journey">Curved Journey</option>
    <option value="memory">Memory Cards</option>
  </select>
</div>

<div className="mt-4">
  <div className={inspectorLabelClass()}>Card Layout</div>

  <select
    value={(selectedBlock.data as any).cardLayout ?? "standard"}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        block.type !== "timeline"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                cardLayout: e.target.value as
                  | "standard"
                  | "spotlight"
                  | "story",
              },
            },
      )
    }
    className={inspectorInputClass()}
  >
    <option value="standard">Standard</option>
    <option value="spotlight">Spotlight</option>
    <option value="story">Story</option>
  </select>
</div>

    <div className="mt-4 grid grid-cols-2 gap-3">
      <div>
        <div className={inspectorLabelClass()}>Direction</div>
        <select
          value={selectedBlock.data.direction ?? "ascending"}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "timeline"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      direction: e.target.value as "ascending" | "descending",
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          <option value="ascending">Ascending</option>
          <option value="descending">Descending</option>
        </select>
      </div>

      <div>
        <div className={inspectorLabelClass()}>Connector</div>
        <select
          value={selectedBlock.data.connectorStyle ?? "solid"}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "timeline"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      connectorStyle: e.target.value as any,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
          <option value="none">None</option>
        </select>
      </div>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Connector Thickness</div>
      <input
        type="range"
        min={1}
        max={12}
        step={1}
        value={Number(selectedBlock.data.connectorThickness ?? 3)}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "timeline"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    connectorThickness: Number(e.target.value),
                  },
                },
          )
        }
        className="w-full"
      />
    </div>

{selectedBlock.data.styleVariant === "journey" ? (
  <>
    <div className="mt-4">
      <div className={inspectorLabelClass()}>Connector Height</div>
      <input
        type="range"
        min={120}
        max={360}
        step={10}
        value={Number((selectedBlock.data as any).journeyConnectorHeight ?? 170)}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "timeline"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    journeyConnectorHeight: Number(e.target.value),
                  },
                },
          )
        }
        className="w-full"
      />
      <div className="mt-1 text-xs text-neutral-500">
        {Number((selectedBlock.data as any).journeyConnectorHeight ?? 170)}px
      </div>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Cards Per Row</div>
      <select
        value={Number((selectedBlock.data as any).journeyCardsPerRow ?? 3)}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "timeline"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    journeyCardsPerRow: Number(e.target.value),
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value={1}>1 Card</option>
        <option value={2}>2 Cards</option>
        <option value={3}>3 Cards</option>
        <option value={4}>4 Cards</option>
        <option value={5}>5 Cards</option>
      </select>
    </div>
  </>
) : null}

    <div className="mt-4 grid grid-cols-2 gap-3">
      <div>
        <div className={inspectorLabelClass()}>Line Color</div>
        <input
          type="color"
          value={selectedBlock.data.lineColor ?? "#CBD5E1"}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "timeline"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      lineColor: e.target.value,
                    },
                  },
            )
          }
          className="h-10 w-full rounded-lg border border-neutral-200 bg-white"
        />
      </div>

      <div>
        <div className={inspectorLabelClass()}>Node Color</div>
        <input
          type="color"
          value={selectedBlock.data.nodeColor ?? "#2563EB"}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "timeline"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      nodeColor: e.target.value,
                    },
                  },
            )
          }
          className="h-10 w-full rounded-lg border border-neutral-200 bg-white"
        />
      </div>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Card Width</div>
      <input
        type="range"
        min={160}
        max={520}
        step={10}
        value={Number((selectedBlock.data as any).cardWidth ?? 260)}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "timeline"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    cardWidth: Number(e.target.value),
                  },
                },
          )
        }
        className="w-full"
      />
      <div className="mt-1 text-xs text-neutral-500">
        {Number((selectedBlock.data as any).cardWidth ?? 260)}px
      </div>
    </div>

{selectedBlock.data.styleVariant !== "journey" ? (
  <div className="mt-4">
    <div className={inspectorLabelClass()}>Spacing</div>
    <input
      type="range"
      min={0}
      max={80}
      step={1}
      value={Number(selectedBlock.data.spacing ?? 24)}
      onChange={(e) =>
        updateSelectedBlock((block) =>
          block.type !== "timeline"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  spacing: Number(e.target.value),
                },
              },
        )
      }
      className="w-full"
    />
  </div>
) : null}

    <div className="mt-4">
      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.shadow !== false}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "timeline"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      shadow: e.target.checked,
                    },
                  },
            )
          }
        />
        Card Shadow
      </label>
    </div>

    <div className="mt-5">
      <div className={inspectorLabelClass()}>Entries</div>

      <div className="mt-3 space-y-3">
        {(selectedBlock.data.entries ?? []).map((entry) => (
<div
  key={entry.id}
  id={`timeline-entry-inspector-${entry.id}`}
  className={[
    "rounded-xl border p-3 transition",
    focusedTimelineEntryId === entry.id
      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
      : "border-neutral-200 bg-neutral-50",
  ].join(" ")}
>
            <div className={inspectorLabelClass()}>Date / Year</div>
            <input
              type="text"
              value={entry.date ?? ""}
              onChange={(e) =>
                updateSelectedBlock((block) =>
                  block.type !== "timeline"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          entries: block.data.entries.map((item) =>
                            item.id === entry.id
                              ? { ...item, date: e.target.value }
                              : item,
                          ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />

            <div className="mt-3">
              <div className={inspectorLabelClass()}>Title</div>
              <input
                type="text"
                value={entry.title ?? ""}
                onChange={(e) =>
                  updateSelectedBlock((block) =>
                    block.type !== "timeline"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            entries: block.data.entries.map((item) =>
                              item.id === entry.id
                                ? { ...item, title: e.target.value }
                                : item,
                            ),
                          },
                        },
                  )
                }
                className={inspectorInputClass()}
              />
            </div>

            <div className="mt-3">
              <div className={inspectorLabelClass()}>Subtitle</div>
              <input
                type="text"
                value={entry.subtitle ?? ""}
                onChange={(e) =>
                  updateSelectedBlock((block) =>
                    block.type !== "timeline"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            entries: block.data.entries.map((item) =>
                              item.id === entry.id
                                ? { ...item, subtitle: e.target.value }
                                : item,
                            ),
                          },
                        },
                  )
                }
                className={inspectorInputClass()}
              />
            </div>

<div className="mt-3">
  <div className={inspectorLabelClass()}>Description</div>
  <textarea
    value={entry.description ?? ""}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        block.type !== "timeline"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                entries: block.data.entries.map((item) =>
                  item.id === entry.id
                    ? { ...item, description: e.target.value }
                    : item,
                ),
              },
            },
      )
    }
    className={inspectorTextareaClass()}
  />
</div>

{selectedBlock.data.styleVariant !== "classic" &&
selectedBlock.data.styleVariant !== "alternating" ? (
  <div className="mt-3 rounded-xl border border-neutral-200 bg-white p-3">
    <div className={inspectorLabelClass()}>Placement</div>

    <label className="mt-2 flex items-center gap-3 text-sm text-neutral-700">
      <input
        type="checkbox"
        checked={(entry as any).useDefaultPlacement !== false}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "timeline"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    entries: block.data.entries.map((item) =>
                      item.id === entry.id
                        ? {
                            ...item,
                            useDefaultPlacement: e.target.checked,
                            placementOffset: e.target.checked
                              ? 0
                              : ((item as any).placementOffset ?? 0),
                          }
                        : item,
                    ),
                  },
                },
          )
        }
      />
      Default Alignment
    </label>

    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between">
        <div className={inspectorLabelClass()}>Height Placement</div>
        <div className="text-xs text-neutral-500">
          {Number((entry as any).placementOffset ?? 0)}px
        </div>
      </div>

      <input
        type="range"
        min={-160}
        max={160}
        step={5}
        value={Number((entry as any).placementOffset ?? 0)}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "timeline"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    entries: block.data.entries.map((item) =>
                      item.id === entry.id
                        ? {
                            ...item,
                            useDefaultPlacement: false,
                            placementOffset: Number(e.target.value),
                          }
                        : item,
                    ),
                  },
                },
          )
        }
        className="w-full"
      />
    </div>
  </div>
) : null}
<div className="mt-3 rounded-xl border border-neutral-200 bg-white p-3">
  <div className={inspectorLabelClass()}>Image</div>

  <button
    type="button"
    className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
onClick={() =>
  void uploadImageToSelectedBlock(selectedBlock.id, entry.id)
}
  >
    Select Image
  </button>

  {entry.imageUrl ? (
    <button
      type="button"
      className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-xl border border-neutral-300 bg-neutral-50 px-4 text-sm text-neutral-700 hover:bg-neutral-100"
      onClick={() =>
        updateSelectedBlock((block) =>
          block.type !== "timeline"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  entries: block.data.entries.map((item) =>
                    item.id === entry.id
                      ? {
                          ...item,
                          imageUrl: "",
                          icon: "/media-icons/star.svg",
                          imageSize: 64,
                        }
                      : item,
                  ),
                },
              },
        )
      }
    >
      Reset Image
    </button>
  ) : null}

  <div className="mt-3">
    <div className="mb-1 flex items-center justify-between">
      <div className={inspectorLabelClass()}>Image Size</div>

      <div className="text-xs text-neutral-500">
        {Number((entry as any).imageSize ?? 64)}px
      </div>
    </div>

    <input
      type="range"
      min={24}
      max={160}
      step={2}
      value={Number((entry as any).imageSize ?? 64)}
      onChange={(e) =>
        updateSelectedBlock((block) =>
          block.type !== "timeline"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  entries: block.data.entries.map((item) =>
                    item.id === entry.id
                      ? {
                          ...item,
                          imageSize: Number(e.target.value),
                        }
                      : item,
                  ),
                },
              },
        )
      }
      className="w-full"
    />
  </div>
</div>

<div className="mt-3">
  <div className={inspectorLabelClass()}>Card Fill Color</div>
  <input
    type="color"
    value={(entry as any).cardBackground ?? selectedBlock.data.cardBackground ?? "#FFFFFF"}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        block.type !== "timeline"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                entries: block.data.entries.map((item) =>
                  item.id === entry.id
                    ? { ...item, cardBackground: e.target.value }
                    : item,
                ),
              },
            },
      )
    }
    className="h-10 w-full rounded-lg border border-neutral-200 bg-white"
  />
</div>

<div className="mt-3 grid grid-cols-2 gap-3">
  <div>
    <div className={inspectorLabelClass()}>Accent</div>
                <input
                  type="color"
                  value={entry.accentColor ?? "#2563EB"}
                  onChange={(e) =>
                    updateSelectedBlock((block) =>
                      block.type !== "timeline"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              entries: block.data.entries.map((item) =>
                                item.id === entry.id
                                  ? { ...item, accentColor: e.target.value }
                                  : item,
                              ),
                            },
                          },
                    )
                  }
                  className="h-10 w-full rounded-lg border border-neutral-200 bg-white"
                />
              </div>

              <div>
                <div className={inspectorLabelClass()}>Frame</div>
                <select
                  value={entry.imageShape ?? "circle"}
                  onChange={(e) =>
                    updateSelectedBlock((block) =>
                      block.type !== "timeline"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              entries: block.data.entries.map((item) =>
                                item.id === entry.id
                                  ? { ...item, imageShape: e.target.value as any }
                                  : item,
                              ),
                            },
                          },
                    )
                  }
                  className={inspectorInputClass()}
                >
                  <option value="circle">Circle</option>
                  <option value="rounded">Rounded</option>
                  <option value="square">Square</option>
                  <option value="diamond">Diamond</option>
                  <option value="hexagon">Hexagon</option>
                  <option value="blob">Blob</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className={inspectorLabelClass()}>CTA Label</div>
                <input
                  type="text"
                  value={entry.ctaLabel ?? ""}
                  onChange={(e) =>
                    updateSelectedBlock((block) =>
                      block.type !== "timeline"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              entries: block.data.entries.map((item) =>
                                item.id === entry.id
                                  ? { ...item, ctaLabel: e.target.value }
                                  : item,
                              ),
                            },
                          },
                    )
                  }
                  className={inspectorInputClass()}
                />
              </div>

              <div>
                <div className={inspectorLabelClass()}>CTA URL</div>
                <input
                  type="text"
                  value={entry.ctaUrl ?? ""}
                  onChange={(e) =>
                    updateSelectedBlock((block) =>
                      block.type !== "timeline"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              entries: block.data.entries.map((item) =>
                                item.id === entry.id
                                  ? { ...item, ctaUrl: e.target.value }
                                  : item,
                              ),
                            },
                          },
                    )
                  }
                  className={inspectorInputClass()}
                />
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                className={toolSetButtonClass("remove")}
                onClick={() =>
                  updateSelectedBlock((block) =>
                    block.type !== "timeline"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            entries: block.data.entries.filter(
                              (item) => item.id !== entry.id,
                            ),
                          },
                        },
                  )
                }
                title="Remove timeline entry"
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
              block.type !== "timeline"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      entries: [
                        ...block.data.entries,
                        {
                          id: makeClientId("timelineentry"),
                          date: "New Date",
                          title: "New Timeline Entry",
                          subtitle: "",
                          description: "Add a short description.",
                          imageUrl: "",
                          icon: "/media-icons/star.svg",
                          imageSize: 64,
                          imageShape: "circle",
                          accentColor: block.data.nodeColor ?? "#2563EB",
                          cardBackground: block.data.cardBackground ?? "#FFFFFF",
                          alignment: "auto",
                          animation: "fade",
                          useDefaultPlacement: true,
                          placementOffset: 0,
                          ctaLabel: "",
                          ctaUrl: "",
                        },
                      ],
                    },
                  },
            )
          }
        >
          Add Timeline Entry
        </button>
      </div>
    </div>
  </div>
) : null}

{selectedBlock?.type === "audio" ? (
  <div id="inspector-audio" className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Audio</div>

    <div className="mt-4">
      <button
        type="button"
        className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
        onClick={() => void uploadAudioToSelectedBlock(selectedBlock.id)}
      >
        {selectedBlock.data.audioUrl ? "Replace Audio" : "Browse Audio"}
      </button>

      {selectedBlock.data.audioUrl ? (
        <button
          type="button"
          className="ml-2 inline-flex h-10 items-center justify-center rounded-xl border border-red-200 bg-white px-4 text-sm text-red-600 hover:bg-red-50"
          onClick={() =>
            updateSelectedBlock((block) =>
              block.type !== "audio"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      audioUrl: "",
                    },
                  },
            )
          }
        >
          Remove
        </button>
      ) : null}
    </div>

    <div className="mt-4 space-y-3">
      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.loop === true}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "audio"
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
        Repeat
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.autoplay === true}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "audio"
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

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.showPlayer !== false}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "audio"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      showPlayer: e.target.checked,
                    },
                  },
            )
          }
        />
        Show Player Controls
      </label>
    </div>

    <p className="mt-3 text-xs leading-relaxed text-neutral-500">
      Autoplay may be blocked by browsers, especially on mobile, until the visitor taps the page.
    </p>
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
      <div className={inspectorLabelClass()}>Description</div>
      <textarea
        value={selectedBlock.data.description ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "checkout"
              ? block
              : {
                  ...block,
                  data: { ...block.data, description: e.target.value },
                },
          )
        }
        className={inspectorTextareaClass()}
        placeholder="Add a short description here."
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
      <div className={inspectorLabelClass()}>Button Spacing</div>
      <input
        type="number"
        min="0"
        max="100"
        value={selectedBlock.data.buttonSpacing ?? 12}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "checkout"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    buttonSpacing: Math.max(0, Number(e.target.value) || 0),
                  },
                },
          )
        }
        className={inspectorInputClass()}
        placeholder="12"
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

{selectedBlock?.type === "cart" ? (
  <div id="inspector-cart" className={inspectorCardClass()}>
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
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Tax Rate</div>
      <input
        type="number"
        min="0"
        step="0.01"
        value={selectedBlock.data.taxRate ?? 0}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "cart"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    taxRate: Math.max(0, Number(e.target.value) || 0),
                  },
                },
          )
        }
        className={inspectorInputClass()}
        placeholder="0.00"
      />
      <div className="mt-1 text-xs text-neutral-500">
        Use decimal format. Example: 0.07 = 7%
      </div>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Discount Type</div>
      <select
        value={selectedBlock.data.discountType ?? "flat"}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "cart"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    discountType: e.target.value as "flat" | "percent",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="flat">Flat Amount</option>
        <option value="percent">Percent</option>
      </select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>
        {selectedBlock.data.discountType === "percent"
          ? "Discount Percent"
          : "Discount Amount"}
      </div>
      <input
        type="number"
        min="0"
        step="0.01"
        value={selectedBlock.data.discount ?? 0}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "cart"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    discount: Math.max(0, Number(e.target.value) || 0),
                  },
                },
          )
        }
        className={inspectorInputClass()}
        placeholder={
          selectedBlock.data.discountType === "percent" ? "10" : "0.00"
        }
      />
      <div className="mt-1 text-xs text-neutral-500">
        {selectedBlock.data.discountType === "percent"
          ? "Example: 10 = 10% off"
          : "Flat amount removed from subtotal after tax."}
      </div>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Currency</div>
      <input
        type="text"
        value={selectedBlock.data.currency ?? "usd"}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "cart"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    currency: e.target.value.trim().toLowerCase() || "usd",
                  },
                },
          )
        }
        className={inspectorInputClass()}
        placeholder="usd"
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
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Empty Cart Message</div>
      <input
        type="text"
        value={selectedBlock.data.emptyMessage ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "cart"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    emptyMessage: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>
  </div>
) : null}

{selectedBlock?.type === "faq" ? (
                  <div id="inspector-faq" className={inspectorCardClass()}>
                    <div className={inspectorLabelClass()}>FAQ</div>

                    <div className="mt-4">
  <div className={inspectorLabelClass()}>Heading</div>
  <input
    type="text"
    value={(selectedBlock.data as any).heading ?? "FAQs"}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        block.type !== "faq"
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
    placeholder="FAQs"
  />
</div>

                    <div className="mt-4">
  <div className={inspectorLabelClass()}>FAQ Behavior</div>

  <select
    value={(selectedBlock.data as any).behavior ?? "always-open"}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        block.type !== "faq"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                behavior: e.target.value as
                  | "always-open"
                  | "accordion"
                  | "accordion-single",
              },
            },
      )
    }
    className={inspectorInputClass()}
  >
    <option value="always-open">Always Open</option>
    <option value="accordion">Collapse / Expand</option>
    <option value="accordion-single">Only One Open at a Time</option>
  </select>
</div>

<div className="mt-4">
  <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
    <input
      type="checkbox"
      checked={(selectedBlock.data as any).showIcons !== false}
      onChange={(e) =>
        updateSelectedBlock((block) =>
          block.type !== "faq"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  showIcons: e.target.checked,
                },
              },
        )
      }
    />
    Show Chevron Icons
  </label>
</div>

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
      <div className={inspectorLabelClass()}>Style Target</div>
      <select
        value={selectedBlock.data.threadStyleTarget ?? "message"}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "thread"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    threadStyleTarget: e.target.value as
                      | "form"
                      | "post_block"
                      | "subject"
                      | "name"
                      | "message"
                      | "post_button",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="form">Form</option>
        <option value="post_block">Post message composer</option>
        <option value="subject">Subject</option>
        <option value="name">Name</option>
        <option value="message">Posted messages</option>
        <option value="post_button">Post button</option>
      </select>
    </div>

        {["form", "post_block", "message", "post_button"].includes(
      selectedBlock.data.threadStyleTarget ?? "message",
    ) ? (
      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <div className={inspectorLabelClass()}>Target Appearance</div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>Background Color</div>
          <input
            type="color"
            value={
              selectedBlock.data.threadStyleTarget === "form"
                ? selectedBlock.data.formAppearance?.backgroundColor ?? "#ffffff"
                : selectedBlock.data.threadStyleTarget === "post_block"
                  ? selectedBlock.data.postBlockAppearance?.backgroundColor ??
                    "#ffffff"
                  : selectedBlock.data.threadStyleTarget === "post_button"
                    ? selectedBlock.data.postButtonAppearance?.backgroundColor ??
                      "#111827"
                    : selectedBlock.data.messageAppearance?.backgroundColor ??
                      "#ffffff"
            }
            onChange={(e) =>
              updateSelectedBlock((block) => {
                if (block.type !== "thread") return block;

                const target = block.data.threadStyleTarget ?? "message";
                const key =
                  target === "form"
                    ? "formAppearance"
                    : target === "post_block"
                      ? "postBlockAppearance"
                      : target === "post_button"
                        ? "postButtonAppearance"
                        : "messageAppearance";

                return {
                  ...block,
                  data: {
                    ...block.data,
                    [key]: {
                      ...((block.data as any)[key] ?? {}),
                      backgroundColor: e.target.value,
                    },
                  },
                };
              })
            }
            className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-neutral-300 bg-white p-1"
          />
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>Transparency</div>
          <input
            type="range"
            min={0}
            max={100}
            value={
              selectedBlock.data.threadStyleTarget === "form"
                ? selectedBlock.data.formAppearance?.backgroundOpacity ?? 100
                : selectedBlock.data.threadStyleTarget === "post_block"
                  ? selectedBlock.data.postBlockAppearance?.backgroundOpacity ??
                    100
                  : selectedBlock.data.threadStyleTarget === "post_button"
                    ? selectedBlock.data.postButtonAppearance
                        ?.backgroundOpacity ?? 100
                    : selectedBlock.data.messageAppearance?.backgroundOpacity ??
                      100
            }
            onChange={(e) =>
              updateSelectedBlock((block) => {
                if (block.type !== "thread") return block;

                const target = block.data.threadStyleTarget ?? "message";
                const key =
                  target === "form"
                    ? "formAppearance"
                    : target === "post_block"
                      ? "postBlockAppearance"
                      : target === "post_button"
                        ? "postButtonAppearance"
                        : "messageAppearance";

                return {
                  ...block,
                  data: {
                    ...block.data,
                    [key]: {
                      ...((block.data as any)[key] ?? {}),
                      backgroundOpacity: Math.max(
                        0,
                        Math.min(100, Number(e.target.value) || 0),
                      ),
                    },
                  },
                };
              })
            }
            className="mt-2 w-full"
          />
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>Border Color</div>
          <input
            type="color"
            value={
              selectedBlock.data.threadStyleTarget === "form"
                ? selectedBlock.data.formAppearance?.borderColor ?? "#e5e7eb"
                : selectedBlock.data.threadStyleTarget === "post_block"
                  ? selectedBlock.data.postBlockAppearance?.borderColor ??
                    "#e5e7eb"
                  : selectedBlock.data.threadStyleTarget === "post_button"
                    ? selectedBlock.data.postButtonAppearance?.borderColor ??
                      "#111827"
                    : selectedBlock.data.messageAppearance?.borderColor ??
                      "#d4d4d8"
            }
            onChange={(e) =>
              updateSelectedBlock((block) => {
                if (block.type !== "thread") return block;

                const target = block.data.threadStyleTarget ?? "message";
                const key =
                  target === "form"
                    ? "formAppearance"
                    : target === "post_block"
                      ? "postBlockAppearance"
                      : target === "post_button"
                        ? "postButtonAppearance"
                        : "messageAppearance";

                return {
                  ...block,
                  data: {
                    ...block.data,
                    [key]: {
                      ...((block.data as any)[key] ?? {}),
                      borderColor: e.target.value,
                    },
                  },
                };
              })
            }
            className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-neutral-300 bg-white p-1"
          />
        </div>
      </div>
    ) : null}

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
                      | "total_funds"
                      | "poll_results",
                    heading:
                      e.target.value === "top_messages"
                        ? "Top Messages"
                        : e.target.value === "rsvp_count"
                          ? "RSVP Count"
                          : e.target.value === "total_funds"
                            ? "Total Funds"
                            : "Poll Results",
                    sourceBlockId:
                      e.target.value === "top_messages"
                        ? block.data.sourceBlockId ||
                          draft.blocks.find((b) => b.type === "thread")?.id ||
                          ""
                        : e.target.value === "poll_results"
                          ? block.data.sourceBlockId ||
                            draft.blocks.find((b) => b.type === "poll")?.id ||
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
        <option value="poll_results">Poll Results</option>
      </select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>
        {selectedBlock.data.mode === "poll_results"
          ? "Source Poll"
          : "Source Thread"}
      </div>
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
        disabled={
          selectedBlock.data.mode !== "top_messages" &&
          selectedBlock.data.mode !== "poll_results"
        }
      >
        <option value="">
          {selectedBlock.data.mode === "poll_results"
            ? "Select poll block"
            : "Select thread block"}
        </option>
        {draft.blocks
          .filter((block) =>
            selectedBlock.data.mode === "poll_results"
              ? block.type === "poll"
              : block.type === "thread",
          )
          .map((sourceBlock) => (
            <option key={sourceBlock.id} value={sourceBlock.id}>
              {sourceBlock.type === "poll"
                ? sourceBlock.data.question || sourceBlock.label || "Poll"
                : sourceBlock.type === "thread"
                  ? sourceBlock.data.subject || sourceBlock.label || "Message Thread"
                  : sourceBlock.label || "Source Block"}
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
      <div className={inspectorLabelClass()}>Display Style</div>
      <select
        value={(selectedBlock.data as any).displayStyle ?? "bar"}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "progress_bar"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    displayStyle: e.target.value as "bar" | "meter",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="bar">Bar</option>
        <option value="meter">Meter</option>
      </select>
    </div>

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

    {((selectedBlock.data as any).displayStyle ?? "bar") === "meter" ? (
      <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
        <div className={inspectorLabelClass()}>Meter Options</div>

        <div className="mt-4">
          <div className={inspectorLabelClass()}>Sections</div>
          <input
            type="number"
            min={1}
            max={20}
            value={(selectedBlock.data as any).meterSectionCount ?? 6}
            onChange={(e) =>
              updateSelectedBlock((block) =>
                block.type !== "progress_bar"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        meterSectionCount: Math.max(
                          1,
                          Math.min(20, Number(e.target.value) || 6),
                        ),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <div className={inspectorLabelClass()}>Start Color</div>
            <input
              type="color"
              value={(selectedBlock.data as any).meterStartColor ?? "#22c55e"}
              onChange={(e) =>
                updateSelectedBlock((block) =>
                  block.type !== "progress_bar"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          meterStartColor: e.target.value,
                        },
                      },
                )
              }
              className="h-10 w-full cursor-pointer rounded-lg border border-neutral-300 bg-white p-1"
            />
          </div>

          <div>
            <div className={inspectorLabelClass()}>End Color</div>
            <input
              type="color"
              value={(selectedBlock.data as any).meterEndColor ?? "#ef4444"}
              onChange={(e) =>
                updateSelectedBlock((block) =>
                  block.type !== "progress_bar"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          meterEndColor: e.target.value,
                        },
                      },
                )
              }
              className="h-10 w-full cursor-pointer rounded-lg border border-neutral-300 bg-white p-1"
            />
          </div>
        </div>

        <div className="mt-4">
          <div className={inspectorLabelClass()}>Needle Color</div>
          <input
            type="color"
            value={(selectedBlock.data as any).meterNeedleColor ?? "#111827"}
            onChange={(e) =>
              updateSelectedBlock((block) =>
                block.type !== "progress_bar"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        meterNeedleColor: e.target.value,
                      },
                    },
              )
            }
            className="h-10 w-full cursor-pointer rounded-lg border border-neutral-300 bg-white p-1"
          />
        </div>

        <div className="mt-4">
          <div className={inspectorLabelClass()}>Caption Text</div>
          <input
            type="text"
            value={(selectedBlock.data as any).meterCaption ?? ""}
            onChange={(e) =>
              updateSelectedBlock((block) =>
                block.type !== "progress_bar"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        meterCaption: e.target.value,
                      },
                    },
              )
            }
            className={inspectorInputClass()}
            placeholder="Optional caption..."
          />
        </div>

        <div className="mt-4">
          <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
            <input
              type="checkbox"
              checked={(selectedBlock.data as any).showContext ?? true}
              onChange={(e) =>
                updateSelectedBlock((block) =>
                  block.type !== "progress_bar"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          showContext: e.target.checked,
                        },
                      },
                )
              }
            />
            Display Context
          </label>
        </div>
      </div>
    ) : null}

    {((selectedBlock.data as any).displayStyle ?? "bar") === "bar" ? (
      <>
        <div className="mt-4">
          <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
            <input
              type="checkbox"
              checked={(selectedBlock.data as any).showContext ?? true}
              onChange={(e) =>
                updateSelectedBlock((block) =>
                  block.type !== "progress_bar"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          showContext: e.target.checked,
                        },
                      },
                )
              }
            />
            Show Context
          </label>
        </div>

        {((selectedBlock.data as any).showContext ?? true) ? (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <div className={inspectorLabelClass()}>Context Type</div>
              <select
                value={(selectedBlock.data as any).contextType ?? "percentage"}
                onChange={(e) =>
                  updateSelectedBlock((block) =>
                    block.type !== "progress_bar"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            contextType: e.target.value as
                              | "percentage"
                              | "fraction",
                          },
                        },
                  )
                }
                className={inspectorInputClass()}
              >
                <option value="percentage">Show Percent</option>
                <option value="fraction">Show Fraction</option>
              </select>
            </div>

            <div>
              <div className={inspectorLabelClass()}>Context Location</div>
              <select
                value={
                  (selectedBlock.data as any).contextLocation ?? "bottom-left"
                }
                onChange={(e) =>
                  updateSelectedBlock((block) =>
                    block.type !== "progress_bar"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            contextLocation: e.target.value as
                              | "top-right"
                              | "bottom-left"
                              | "bottom-right",
                          },
                        },
                  )
                }
                className={inspectorInputClass()}
              >
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>
          </div>
        ) : null}
      </>
    ) : null}
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

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Donation Buttons</div>

      <div className="mt-3 space-y-3">
        {(Array.isArray(selectedBlock.data.donationOptions)
          ? selectedBlock.data.donationOptions
          : []
        ).map((option, index) => (
          <div
            key={option.id || `donation-option-${index}`}
            className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
          >
            <div className="grid grid-cols-[1fr_140px_auto] items-end gap-3">
              <div>
                <div className={inspectorLabelClass()}>Button Label</div>
                <input
                  type="text"
                  value={option.label ?? ""}
                  onChange={(e) =>
                    updateSelectedBlock((block) =>
                      block.type !== "donation"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              donationOptions: (
                                Array.isArray(block.data.donationOptions)
                                  ? block.data.donationOptions
                                  : []
                              ).map((item) =>
                                item.id !== option.id
                                  ? item
                                  : {
                                      ...item,
                                      label: e.target.value,
                                    },
                              ),
                            },
                          },
                    )
                  }
                  className={inspectorInputClass()}
                />
              </div>

              <div>
                <div className={inspectorLabelClass()}>Amount</div>
                <input
                  type="number"
                  min={1}
                  step="0.01"
                  value={option.amount ?? 0}
                  onChange={(e) =>
                    updateSelectedBlock((block) =>
                      block.type !== "donation"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              donationOptions: (
                                Array.isArray(block.data.donationOptions)
                                  ? block.data.donationOptions
                                  : []
                              ).map((item) =>
                                item.id !== option.id
                                  ? item
                                  : {
                                      ...item,
                                      amount: Math.max(
                                        1,
                                        Number(e.target.value) || 1,
                                      ),
                                    },
                              ),
                            },
                          },
                    )
                  }
                  className={inspectorInputClass()}
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() =>
                    updateSelectedBlock((block) =>
                      block.type !== "donation"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              donationOptions: (
                                Array.isArray(block.data.donationOptions)
                                  ? block.data.donationOptions
                                  : []
                              ).filter((item) => item.id !== option.id),
                            },
                          },
                    )
                  }
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-red-300 bg-white text-lg font-medium text-red-600 hover:border-red-500"
                  title="Remove donation button"
                  aria-label="Remove donation button"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <button
          type="button"
          onClick={() =>
            updateSelectedBlock((block) =>
              block.type !== "donation"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      donationOptions: [
                        ...(Array.isArray(block.data.donationOptions)
                          ? block.data.donationOptions
                          : []),
                        {
                          id: makeClientId("donationopt"),
                          label: "$10",
                          amount: 10,
                        },
                      ],
                    },
                  },
            )
          }
          className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-900 hover:border-neutral-900"
        >
          Add Donation Button
        </button>
      </div>
    </div>
    <div className="mt-4">
  <div className={inspectorLabelClass()}>
    Button Spacing
  </div>

  <input
    type="number"
    min="0"
    max="100"
    value={selectedBlock.data.buttonSpacing ?? 12}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        block.type !== "donation"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                buttonSpacing: Math.max(
                  0,
                  Number(e.target.value) || 0,
                ),
              },
            },
      )
    }
    className={inspectorInputClass()}
    placeholder="12"
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
      {selectedBlock.data.items.map((rawItem: LinkItem) => {
  const item = rawItem as LinkItem & {
    logoUrl?: string;
    autoGenerateLogo?: boolean;
  };
        const autoGenerateLogo = item.autoGenerateLogo ?? true;
        const logoPreviewUrl =
          item.logoUrl ||
          (autoGenerateLogo ? resolveMediaLogoFromUrl(item.url ?? "") : "");

        return (
          <div
            key={item.id}
            className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
          >
            <div className="flex items-start gap-3">
              <span className="mt-5 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-300 bg-white text-[10px] text-neutral-400">
                {logoPreviewUrl ? (
                  <img
                    src={logoPreviewUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "Logo"
                )}
              </span>

              <div className="min-w-0 flex-1">
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
                    onChange={(e) => {
                      const nextUrl = e.target.value;

                      updateSelectedBlock((block) =>
                        block.type !== "link_hub"
                          ? block
                          : {
                              ...block,
                              data: {
                                ...block.data,
                                items: block.data.items.map((entry) => {
                                  if (entry.id !== item.id) return entry;

                                  const shouldAutoGenerate =
                                    (entry as LinkItem & { autoGenerateLogo?: boolean }).autoGenerateLogo ?? true;

                                  return {
                                    ...entry,
                                    url: nextUrl,
                                    logoUrl: shouldAutoGenerate
                                      ? resolveMediaLogoFromUrl(nextUrl)
                                      : (entry as LinkItem & { logoUrl?: string }).logoUrl,
                                  };
                                }),
                              },
                            },
                      );
                    }}
                    className={inspectorInputClass()}
                  />
                </div>
              </div>
            </div>

            <label className="mt-3 flex items-center gap-2 text-xs font-medium text-neutral-700">
              <input
                type="checkbox"
                checked={autoGenerateLogo}
                onChange={(e) => {
                  const checked = e.target.checked;

                  updateSelectedBlock((block) =>
                    block.type !== "link_hub"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            items: block.data.items.map((entry) =>
                              entry.id === item.id
                                ? {
                                    ...entry,
                                    autoGenerateLogo: checked,
                                    logoUrl: checked
                                      ? resolveMediaLogoFromUrl(entry.url)
                                      : (entry as LinkItem & { logoUrl?: string }).logoUrl,
                                  }
                                : entry,
                            ),
                          },
                        },
                  );
                }}
              />
              Auto-Generate Logo
            </label>

            {!autoGenerateLogo ? (
              <div className="mt-3">
                <div className={inspectorLabelClass()}>Custom Logo</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const logoUrl = URL.createObjectURL(file);

                    updateSelectedBlock((block) =>
                      block.type !== "link_hub"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              items: block.data.items.map((entry) =>
                                entry.id === item.id
                                  ? {
                                      ...entry,
                                      logoUrl,
                                      autoGenerateLogo: false,
                                    }
                                  : entry,
                              ),
                            },
                          },
                    );
                  }}
                  className={inspectorInputClass()}
                />
              </div>
            ) : null}

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
                                logoUrl: logoPreviewUrl,
                                autoGenerateLogo,
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
        );
      })}

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
                        logoUrl: resolveMediaLogoFromUrl("#"),
                        autoGenerateLogo: true,
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

    <label className="mt-4 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
  <input
    type="checkbox"
    checked={Boolean((selectedBlock.data as any).allowUserEngagement)}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        block.type !== "schedule_agenda"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                allowUserEngagement: e.target.checked,
              } as any,
            },
      )
    }
  />
  Allow user engagement
</label>

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

{selectedBlock?.type === "bookmark" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Bookmark</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Bookmark Name</div>
      <input
        type="text"
        value={(selectedBlock.data as any).name ?? ""}
        onChange={(e) => {
          const nextName = e.target.value;
          const nextSlug = toBookmarkSlug(nextName);

          updateSelectedBlock((block) =>
            block.type !== "bookmark"
              ? block
              : {
                  ...block,
                  label: nextName || "Bookmark",
                  data: {
                    ...block.data,
                    name: nextName,
                    slug: nextSlug || block.id,
                  },
                },
          );
        }}
        className={inspectorInputClass()}
        placeholder="Section name"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Bookmark URL</div>
      <input
        type="text"
        readOnly
        value={`#${(selectedBlock.data as any).slug || selectedBlock.id}`}
        className={inspectorInputClass()}
      />
      <p className="mt-2 text-xs leading-5 text-neutral-500">
        Use this value in Button Link or Link URL.
      </p>
    </div>
  </div>
) : null}

{selectedBlock?.type === "spreadsheet" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Spreadsheet</div>

    {(() => {
const selectedCellKey =
  typeof window !== "undefined"
    ? ((window as any).__koHostSpreadsheetActiveCell?.[selectedBlock.id] ??
        (selectedBlock.data as any).selectedCell ??
        "0:0")
    : ((selectedBlock.data as any).selectedCell ?? "0:0");

const selectedCells =
  Array.isArray((selectedBlock.data as any).selectedCells) &&
  (selectedBlock.data as any).selectedCells.length > 0
    ? ((selectedBlock.data as any).selectedCells as string[])
    : [selectedCellKey];

const selectedRowIndex = Number(String(selectedCellKey).split(":")[0] ?? 0);
const selectedColumnIndex = Number(String(selectedCellKey).split(":")[1] ?? 0);

const selectedCellData =
  ((selectedBlock.data as any).cells ?? {})[selectedCellKey] ?? null;

const selectedCellFormat = selectedCellData?.format ?? {};

const updateSelectedCellFormat = (patch: Record<string, any>) => {
  updateSelectedBlock((block) => {
    if (block.type !== "spreadsheet") return block;

    const activeCells =
      Array.isArray((block.data as any).selectedCells) &&
      (block.data as any).selectedCells.length > 0
        ? ((block.data as any).selectedCells as string[])
        : [((block.data as any).selectedCell ?? "0:0")];

    const nextCells = { ...(block.data.cells ?? {}) };

    activeCells.forEach((cellKey) => {
      const existingCell = nextCells[cellKey];

      nextCells[cellKey] = {
        id: existingCell?.id ?? `cell_${cellKey}_${Date.now()}`,
        value: existingCell?.value ?? "",
        format: {
          ...(existingCell?.format ?? {}),
          ...patch,
        },
      };
    });

    return {
      ...block,
      data: {
        ...block.data,
        cells: nextCells,
      },
    };
  });
};

const clearSelectedCells = () => {
  updateSelectedBlock((block) => {
    if (block.type !== "spreadsheet") return block;

    const activeCells =
      Array.isArray((block.data as any).selectedCells) &&
      (block.data as any).selectedCells.length > 0
        ? ((block.data as any).selectedCells as string[])
        : [((block.data as any).selectedCell ?? "0:0")];

    const nextCells = { ...(block.data.cells ?? {}) };

    activeCells.forEach((cellKey) => {
      const existingCell = nextCells[cellKey];

      nextCells[cellKey] = {
        id: existingCell?.id ?? `cell_${cellKey}_${Date.now()}`,
        value: "",
        format: existingCell?.format ?? {},
      };
    });

    return {
      ...block,
      data: {
        ...block.data,
        cells: nextCells,
      },
    };
  });
};

      return (
        <>
          <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800">
            Active Cell: {selectedRowIndex + 1}:{selectedColumnIndex + 1}
          </div>

          <div className="mt-4">
            <div className={inspectorLabelClass()}>Sheet Title</div>
            <input
              type="text"
              value={(selectedBlock.data as any).title ?? ""}
              onChange={(e) => {
                const nextTitle = e.target.value;

                updateSelectedBlock((block) =>
                  block.type !== "spreadsheet"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          title: nextTitle,
                        },
                      },
                );
              }}
              className={inspectorInputClass()}
              placeholder="Spreadsheet"
            />
          </div>

          <div className="mt-4">
            <div className={inspectorLabelClass()}>Caption</div>
            <input
              type="text"
              value={(selectedBlock.data as any).caption ?? ""}
              onChange={(e) => {
                const nextCaption = e.target.value;

                updateSelectedBlock((block) =>
                  block.type !== "spreadsheet"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          caption: nextCaption,
                        },
                      },
                );
              }}
              className={inspectorInputClass()}
              placeholder="Optional note or description"
            />
          </div>

          <label className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
            <input
              type="checkbox"
              checked={(selectedBlock.data as any).showTitle !== false}
              onChange={(e) =>
                updateSelectedBlock((block) =>
                  block.type !== "spreadsheet"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          showTitle: e.target.checked,
                        },
                      },
                )
              }
            />
            Show Title
          </label>

<label className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
  <input
    type="checkbox"
    checked={(selectedBlock.data as any).showHeaders !== false}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        block.type !== "spreadsheet"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                showHeaders: e.target.checked,
              },
            },
      )
    }
  />
  Show Headers
</label>

          <label className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
            <input
              type="checkbox"
              checked={(selectedBlock.data as any).showGridlines !== false}
              onChange={(e) =>
                updateSelectedBlock((block) =>
                  block.type !== "spreadsheet"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          showGridlines: e.target.checked,
                        },
                      },
                )
              }
            />
            Show Gridlines
          </label>

          <label className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
            <input
              type="checkbox"
              checked={(selectedBlock.data as any).editMode === true}
              onChange={(e) =>
                updateSelectedBlock((block) =>
                  block.type !== "spreadsheet"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          editMode: e.target.checked,
                        },
                      },
                )
              }
            />
            Edit Spreadsheet Mode
          </label>

<div className="mt-4 grid grid-cols-2 gap-2">
  <button
    type="button"
    className="h-10 rounded-xl border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
onClick={() =>
  updateSelectedBlock((block) => {
    if (block.type !== "spreadsheet") return block;

    const insertAt = selectedRowIndex;
    const nextCells: Record<string, any> = {};

    Object.entries(block.data.cells ?? {}).forEach(([key, cell]) => {
      const [row, col] = key.split(":").map(Number);
      const nextRow = row >= insertAt ? row + 1 : row;
      nextCells[`${nextRow}:${col}`] = cell;
    });

    return {
      ...block,
      data: {
        ...block.data,
        rowCount: block.data.rowCount + 1,
        cells: nextCells,
        rowHeights: {
          ...block.data.rowHeights,
          [String(insertAt)]: 36,
        },
        selectedCell: `${insertAt}:${selectedColumnIndex}`,
        selectedCells: [`${insertAt}:${selectedColumnIndex}`],
      },
    };
  })
}
  >
    Add Row
  </button>

  <button
    type="button"
    className="h-10 rounded-xl border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
onClick={() =>
  updateSelectedBlock((block) => {
    if (block.type !== "spreadsheet") return block;

    const insertAt = selectedColumnIndex;
    const nextCells: Record<string, any> = {};

    Object.entries(block.data.cells ?? {}).forEach(([key, cell]) => {
      const [row, col] = key.split(":").map(Number);
      const nextCol = col >= insertAt ? col + 1 : col;
      nextCells[`${row}:${nextCol}`] = cell;
    });

    return {
      ...block,
      data: {
        ...block.data,
        columnCount: block.data.columnCount + 1,
        cells: nextCells,
        columnWidths: {
          ...block.data.columnWidths,
          [String(insertAt)]: 120,
        },
        selectedCell: `${selectedRowIndex}:${insertAt}`,
        selectedCells: [`${selectedRowIndex}:${insertAt}`],
      },
    };
  })
}
  >
    Add Column
  </button>
</div>

<div className="mt-4 grid grid-cols-2 gap-2">
  <button
    type="button"
    disabled={(selectedBlock.data as any).rowCount <= 1}
    className="h-10 rounded-xl border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
    onClick={() =>
      updateSelectedBlock((block) => {
        if (block.type !== "spreadsheet") return block;

        const nextCells: Record<string, any> = {};

        Object.entries(block.data.cells ?? {}).forEach(([key, cell]) => {
          const [row, col] = key.split(":").map(Number);
          if (row === selectedRowIndex) return;

          const nextRow = row > selectedRowIndex ? row - 1 : row;
          nextCells[`${nextRow}:${col}`] = cell;
        });

        return {
          ...block,
          data: {
            ...block.data,
            rowCount: Math.max(1, block.data.rowCount - 1),
            cells: nextCells,
            selectedCell: `${Math.max(0, selectedRowIndex - 1)}:${selectedColumnIndex}`,
          },
        };
      })
    }
  >
    Delete Row
  </button>

  <button
    type="button"
    disabled={(selectedBlock.data as any).columnCount <= 1}
    className="h-10 rounded-xl border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
    onClick={() =>
      updateSelectedBlock((block) => {
        if (block.type !== "spreadsheet") return block;

        const nextCells: Record<string, any> = {};

        Object.entries(block.data.cells ?? {}).forEach(([key, cell]) => {
          const [row, col] = key.split(":").map(Number);
          if (col === selectedColumnIndex) return;

          const nextCol = col > selectedColumnIndex ? col - 1 : col;
          nextCells[`${row}:${nextCol}`] = cell;
        });

        return {
          ...block,
          data: {
            ...block.data,
            columnCount: Math.max(1, block.data.columnCount - 1),
            cells: nextCells,
            selectedCell: `${selectedRowIndex}:${Math.max(0, selectedColumnIndex - 1)}`,
          },
        };
      })
    }
  >
    Delete Column
  </button>
</div>

          <div className="mt-4">
            <div className={inspectorLabelClass()}>Selected Cell Font Size</div>
<input
  type="number"
  min={8}
  max={72}
  value={selectedCellFormat.fontSize ?? 14}
  onChange={(e) =>
    updateSelectedCellFormat({
      fontSize: Math.max(8, Math.min(72, Number(e.target.value) || 14)),
    })
  }
  className={inspectorInputClass()}
/>

<button
  type="button"
  className="mt-3 h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
  onClick={clearSelectedCells}
>
  Clear Selected Cell Contents
</button>

          </div>

          <div className="mt-4">
  <div className={inspectorLabelClass()}>Selected Row Height</div>
  <input
    type="number"
    min={24}
    max={200}
    value={(selectedBlock.data as any).rowHeights?.[String(selectedRowIndex)] ?? 36}
    onChange={(e) => {
      const nextHeight = Math.max(24, Math.min(200, Number(e.target.value) || 36));

      updateSelectedBlock((block) =>
        block.type !== "spreadsheet"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                rowHeights: {
                  ...block.data.rowHeights,
                  [String(selectedRowIndex)]: nextHeight,
                },
              },
            },
      );
    }}
    className={inspectorInputClass()}
  />
</div>

<div className="mt-4">
  <div className={inspectorLabelClass()}>Selected Column Width</div>
  <input
    type="number"
    min={48}
    max={400}
    value={(selectedBlock.data as any).columnWidths?.[String(selectedColumnIndex)] ?? 120}
    onChange={(e) => {
      const nextWidth = Math.max(48, Math.min(400, Number(e.target.value) || 120));

      updateSelectedBlock((block) =>
        block.type !== "spreadsheet"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                columnWidths: {
                  ...block.data.columnWidths,
                  [String(selectedColumnIndex)]: nextWidth,
                },
              },
            },
      );
    }}
    className={inspectorInputClass()}
  />
</div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div>
              <div className={inspectorLabelClass()}>Cell Text</div>
              <input
                type="color"
                onChange={(e) => updateSelectedCellFormat({ textColor: e.target.value })}
                className="mt-2 h-10 w-full cursor-pointer rounded-xl border border-neutral-300 bg-white p-1"
              />
            </div>

            <div>
              <div className={inspectorLabelClass()}>Cell Fill</div>
              <input
                type="color"
                onChange={(e) =>
                  updateSelectedCellFormat({ backgroundColor: e.target.value })
                }
                className="mt-2 h-10 w-full cursor-pointer rounded-xl border border-neutral-300 bg-white p-1"
              />
            </div>
          </div>

<div className="mt-4 grid grid-cols-3 gap-2">
  <button
    type="button"
    className={`h-10 rounded-xl border px-3 text-sm font-bold hover:bg-neutral-50 ${
      selectedCellFormat.bold === true
        ? "border-neutral-900 bg-neutral-900 text-white"
        : "border-neutral-300 bg-white text-neutral-800"
    }`}
    onClick={() => updateSelectedCellFormat({ bold: selectedCellFormat.bold !== true })}
  >
    B
  </button>

  <button
    type="button"
    className={`h-10 rounded-xl border px-3 text-sm italic hover:bg-neutral-50 ${
      selectedCellFormat.italic === true
        ? "border-neutral-900 bg-neutral-900 text-white"
        : "border-neutral-300 bg-white text-neutral-800"
    }`}
    onClick={() =>
      updateSelectedCellFormat({ italic: selectedCellFormat.italic !== true })
    }
  >
    I
  </button>

  <button
    type="button"
    className={`h-10 rounded-xl border px-3 text-sm underline hover:bg-neutral-50 ${
      selectedCellFormat.underline === true
        ? "border-neutral-900 bg-neutral-900 text-white"
        : "border-neutral-300 bg-white text-neutral-800"
    }`}
    onClick={() =>
      updateSelectedCellFormat({
        underline: selectedCellFormat.underline !== true,
      })
    }
  >
    U
  </button>
</div>

<div className="mt-4">
  <div className={inspectorLabelClass()}>Horizontal Alignment</div>
  <select
    className={inspectorInputClass()}
    onChange={(e) =>
      updateSelectedCellFormat({
        horizontalAlign: e.target.value as "left" | "center" | "right",
      })
    }
    defaultValue=""
  >
    <option value="" disabled>
      Choose alignment
    </option>
    <option value="left">Left</option>
    <option value="center">Center</option>
    <option value="right">Right</option>
  </select>
</div>

<label className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
  <input
    type="checkbox"
    checked={
      ((selectedBlock.data as any).cells?.[selectedCellKey]?.format?.wrapText ??
        false) === true
    }
    onChange={(e) => updateSelectedCellFormat({ wrapText: e.target.checked })}
  />
  Wrap Text
</label>

<label className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
  <input
    type="checkbox"
    checked={
      ((selectedBlock.data as any).cells?.[selectedCellKey]?.format?.locked ??
        false) === true
    }
    onChange={(e) => updateSelectedCellFormat({ locked: e.target.checked })}
  />
  Lock Selected Cell
</label>

          <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-xs leading-5 text-neutral-600">
            Select a cell in Edit Spreadsheet Mode, then use these controls to style that active cell.
          </div>
        </>
      );
    })()}
  </div>
) : null}

{selectedBlock?.type === "puzzle" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Puzzle</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Image URL</div>
      <input
        type="text"
        value={(selectedBlock.data as any).imageUrl ?? ""}
        onChange={(e) => {
          const nextUrl = e.target.value;

          updateSelectedBlock((block) =>
            block.type !== "puzzle"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    imageUrl: nextUrl,
                    imageAlt: block.data.imageAlt || "Puzzle image",
                    generatedAt: "",
                    pieces: [],
                  },
                },
          );
        }}
        className={inspectorInputClass()}
        placeholder="/designs/artifacts/example.png"
      />

      <button
        type="button"
        className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
        onClick={() => uploadPuzzleImageToSelectedBlock(selectedBlock.id)}
      >
        Browse Puzzle Image
      </button>
      <label className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
  <input
    type="checkbox"
    checked={(selectedBlock.data as any).displayPuzzleImage !== false}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        block.type !== "puzzle"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                displayPuzzleImage: e.target.checked,
              },
            },
      )
    }
  />
  Display Puzzle Image
</label>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Puzzle Piece Count</div>
      <input
        type="number"
        min={10}
        max={1000}
        value={(selectedBlock.data as any).pieceCount ?? 100}
        onChange={(e) => {
          const nextCount = Math.max(
            10,
            Math.min(1000, Number(e.target.value) || 100),
          );

          updateSelectedBlock((block) =>
            block.type !== "puzzle"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    pieceCount: nextCount,
                    generatedAt: "",
                    pieces: [],
                  },
                },
          );
        }}
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Sort Level</div>
      <select
        value={(selectedBlock.data as any).sortLevel ?? "intermediate"}
        onChange={(e) => {
          const nextSortLevel = e.target.value as
            | "beginner"
            | "intermediate"
            | "advanced";

          updateSelectedBlock((block) =>
            block.type !== "puzzle"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    sortLevel: nextSortLevel,
                    generatedAt: "",
                    pieces: [],
                  },
                },
          );
        }}
        className={inspectorInputClass()}
      >
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>

      <p className="mt-2 text-xs leading-5 text-neutral-500">
        Changing sort level clears generated pieces. Press Reset Puzzle again to
        rebuild the puzzle.
      </p>
    </div>

    <button
      type="button"
      disabled={
        !((selectedBlock.data as any).imageUrl ?? "") ||
        !((selectedBlock.data as any).pieceCount ?? 0)
      }
      onClick={() => {
        updateSelectedBlock((block) => {
          if (block.type !== "puzzle") return block;

          const pieceCount = block.data.pieceCount || 100;

          let rows = 1;
          let cols = pieceCount;

          for (
            let possibleRows = 1;
            possibleRows <= Math.sqrt(pieceCount);
            possibleRows++
          ) {
            if (pieceCount % possibleRows === 0) {
              rows = possibleRows;
              cols = pieceCount / possibleRows;
            }
          }

          const pieceWidth = 100 / cols;
          const pieceHeight = 100 / rows;
          const pieces: any[] = [];
          const generatedAt = new Date().toISOString();

          let index = 0;

          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (index >= pieceCount) break;

              const isEdge =
                r === 0 || c === 0 || r === rows - 1 || c === cols - 1;

              const isCorner =
                (r === 0 || r === rows - 1) &&
                (c === 0 || c === cols - 1);

              let currentX = 66 + Math.random() * 28;
              let currentY = 12 + Math.random() * 76;

              if (block.data.sortLevel === "beginner") {
                currentX = Math.max(
                  0,
                  Math.min(100, 6 + c * 3 + Math.random() * 10),
                );
                currentY = Math.max(
                  0,
                  Math.min(100, 12 + r * 3 + Math.random() * 68),
                );
              }

              if (
                block.data.sortLevel === "intermediate" &&
                isEdge &&
                (block.data as any).autoSortEdges !== false
              ) {
                currentX = 3 + Math.random() * 22;
                currentY = 12 + Math.random() * 76;
              }

              if (isCorner && (block.data as any).autoSortCorners !== false) {
                currentX = 3 + Math.random() * 18;
                currentY = 6 + Math.random() * 14;
              }

              pieces.push({
                id: `${block.id}_piece_${generatedAt}_${index}`,
                index,
                row: r,
                col: c,
                correctX: c * pieceWidth,
                correctY: r * pieceHeight,
                currentX,
                currentY,
                widthPercent: pieceWidth,
                heightPercent: pieceHeight,
                isEdge,
                isCorner,
                isPlaced: false,
              });

              index++;
            }
          }

          return {
            ...block,
            data: {
              ...block.data,
              generatedAt,
              pieces,
            },
          };
        });
      }}
      className="mt-4 h-11 w-full rounded-xl bg-neutral-900 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
    >
      Reset Puzzle
    </button>

    <button
      type="button"
      disabled={((selectedBlock.data as any).pieces ?? []).length === 0}
      onClick={() => {
        updateSelectedBlock((block) => {
          if (block.type !== "puzzle") return block;

          return {
            ...block,
            data: {
              ...block.data,
              generatedAt: new Date().toISOString(),
              pieces: (block.data.pieces ?? []).map((piece: any) => ({
                ...piece,
                currentX: piece.isCorner
                  ? 3 + Math.random() * 18
                  : piece.isEdge && (block.data as any).autoSortEdges !== false
                    ? 3 + Math.random() * 22
                    : 66 + Math.random() * 28,
                currentY: piece.isCorner
                  ? 6 + Math.random() * 14
                  : 12 + Math.random() * 76,
                isPlaced: false,
              })),
            },
          };
        });
      }}
      className="mt-3 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
    >
      Shuffle Pieces
    </button>

    <p className="mt-2 text-xs leading-5 text-neutral-500">
      Reset rebuilds the puzzle pieces. Shuffle only randomizes current piece
      positions.
    </p>

    <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-xs leading-5 text-neutral-600">
      {((selectedBlock.data as any).pieces ?? []).length > 0 ? (
        <>
          Generated{" "}
          <span className="font-semibold text-neutral-900">
            {((selectedBlock.data as any).pieces ?? []).length}
          </span>{" "}
          puzzle pieces.
        </>
      ) : (
        <>No pieces generated yet.</>
      )}
    </div>
  </div>
) : null}

{selectedBlock?.type === "spin_wheel" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Spin Wheel</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Title</div>
      <input
        type="text"
        value={(selectedBlock.data as any).title ?? ""}
        onChange={(e) => {
          const nextTitle = e.target.value;

          updateSelectedBlock((block) =>
            block.type !== "spin_wheel"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    title: nextTitle,
                  },
                },
          );
        }}
        className={inspectorInputClass()}
        placeholder="Spin to Win"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Subtitle</div>
      <input
        type="text"
        value={(selectedBlock.data as any).subtitle ?? ""}
        onChange={(e) => {
          const nextSubtitle = e.target.value;

          updateSelectedBlock((block) =>
            block.type !== "spin_wheel"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    subtitle: nextSubtitle,
                  },
                },
          );
        }}
        className={inspectorInputClass()}
        placeholder="Unlock a surprise reward"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Spin Wheel Items</div>
      <textarea
        value={((selectedBlock.data as any).items ?? [])
          .map((item: any) => item.label)
          .join("\n")}
        onChange={(e) => {
const lines = e.target.value.split("\n");

          const colors = [
            "#F97316",
            "#EC4899",
            "#8B5CF6",
            "#111827",
            "#14B8A6",
            "#F59E0B",
          ];

          updateSelectedBlock((block) => {
            if (block.type !== "spin_wheel") return block;

            return {
              ...block,
              data: {
                ...block.data,
                items: lines.map((label, index) => {
                  const existingItem = block.data.items?.[index];

                  return {
                    id: existingItem?.id ?? `spinitem_${index}_${Date.now()}`,
                    label: label,
                    description: existingItem?.description ?? "",
                    weight: existingItem?.weight ?? 1,
                    color: existingItem?.color ?? colors[index % colors.length],
                    textColor: existingItem?.textColor ?? "#FFFFFF",
                    icon: existingItem?.icon ?? "gift",
                    prizeType: existingItem?.prizeType ?? "message",
                    prizeValue: existingItem?.prizeValue ?? "",
                    isWinningItem:
                      existingItem?.isWinningItem ?? !label.toLowerCase().includes("try again"),
                  };
                }),
              },
            };
          });
        }}
        className={`${inspectorInputClass()} min-h-[130px] resize-y py-3`}
        placeholder={"10% Off\nFree Entry\nMystery Gift\nTry Again"}
      />

      <p className="mt-2 text-xs leading-5 text-neutral-500">
        Each line creates one wheel segment. Empty lines are ignored.
      </p>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Button Text</div>
      <input
        type="text"
        value={(selectedBlock.data as any).buttonText ?? ""}
        onChange={(e) => {
          const nextButtonText = e.target.value;

          updateSelectedBlock((block) =>
            block.type !== "spin_wheel"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    buttonText: nextButtonText,
                  },
                },
          );
        }}
        className={inspectorInputClass()}
        placeholder="Spin Now"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Winner Message</div>
      <input
        type="text"
        value={(selectedBlock.data as any).winnerMessage ?? ""}
        onChange={(e) => {
          const nextWinnerMessage = e.target.value;

          updateSelectedBlock((block) =>
            block.type !== "spin_wheel"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    winnerMessage: nextWinnerMessage,
                  },
                },
          );
        }}
        className={inspectorInputClass()}
        placeholder="You won!"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Loser Message</div>
      <input
        type="text"
        value={(selectedBlock.data as any).loserMessage ?? ""}
        onChange={(e) => {
          const nextLoserMessage = e.target.value;

          updateSelectedBlock((block) =>
            block.type !== "spin_wheel"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    loserMessage: nextLoserMessage,
                  },
                },
          );
        }}
        className={inspectorInputClass()}
        placeholder="Try again next time"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Wheel Style</div>
      <select
        value={(selectedBlock.data as any).wheelStyle ?? "premium"}
        onChange={(e) => {
          const nextWheelStyle = e.target.value as
            | "classic"
            | "premium"
            | "game_show"
            | "neon"
            | "minimal"
            | "luxury";

          updateSelectedBlock((block) =>
            block.type !== "spin_wheel"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    wheelStyle: nextWheelStyle,
                  },
                },
          );
        }}
        className={inspectorInputClass()}
      >
        <option value="premium">Premium</option>
        <option value="classic">Classic</option>
        <option value="game_show">Game Show</option>
        <option value="neon">Neon</option>
        <option value="minimal">Minimal</option>
        <option value="luxury">Luxury</option>
      </select>
    </div>

    <label className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
      <input
        type="checkbox"
        checked={(selectedBlock.data as any).allowMultipleSpins === true}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "spin_wheel"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    allowMultipleSpins: e.target.checked,
                  },
                },
          )
        }
      />
      Allow Multiple Spins
    </label>

    <label className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
      <input
        type="checkbox"
        checked={(selectedBlock.data as any).showConfetti !== false}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "spin_wheel"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    showConfetti: e.target.checked,
                  },
                },
          )
        }
      />
      Show Confetti
    </label>

    <label className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
      <input
        type="checkbox"
        checked={(selectedBlock.data as any).showSound !== false}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "spin_wheel"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    showSound: e.target.checked,
                  },
                },
          )
        }
      />
      Show Sound
    </label>
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

{selectedBlock?.type === "pop_balloon" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Pop the Balloon</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Title</div>
      <input
        type="text"
        value={selectedBlock.data.title ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "pop_balloon"
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
      <div className={inspectorLabelClass()}>Host Name</div>
      <input
        type="text"
        value={selectedBlock.data.hostName ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "pop_balloon"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    hostName: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Host Passcode</div>
      <input
        type="text"
        value={selectedBlock.data.hostPasscode ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "pop_balloon"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    hostPasscode: e.target.value,
                  },
                },
          )
        }
        placeholder="123456"
        className={inspectorInputClass()}
      />
      <div className="mt-1 text-xs text-neutral-500">
        Used to unlock host controls on the public site.
      </div>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Lineup Slots</div>
      <input
        type="range"
        min={2}
        max={12}
        value={selectedBlock.data.lineupSlots ?? 6}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "pop_balloon"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    lineupSlots: Number(e.target.value),
                  },
                },
          )
        }
        className="mt-2 w-full"
      />
      <div className="mt-1 text-xs text-neutral-500">
        {selectedBlock.data.lineupSlots ?? 6} lineup spots
      </div>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Match Result</div>
      <select
        value={selectedBlock.data.matchResultMode ?? "public"}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "pop_balloon"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    matchResultMode: e.target.value as
                      | "public"
                      | "private"
                      | "contact_form"
                      | "private_chat_later",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="public">Show winner publicly</option>
        <option value="private">Private reveal only</option>
        <option value="contact_form">Send contact form</option>
        <option value="private_chat_later">Private chat later</option>
      </select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Theme</div>
      <select
        value={selectedBlock.data.theme ?? "red_balloons"}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "pop_balloon"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    theme: e.target.value as
                      | "red_balloons"
                      | "hearts"
                      | "party"
                      | "formal"
                      | "custom",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="red_balloons">Red Balloons</option>
        <option value="hearts">Hearts</option>
        <option value="party">Party</option>
        <option value="formal">Formal</option>
        <option value="custom">Custom</option>
      </select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Prompt</div>
      <textarea
        value={selectedBlock.data.prompt ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "pop_balloon"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    prompt: e.target.value,
                  },
                },
          )
        }
        className={`${inspectorInputClass()} min-h-[90px]`}
      />
    </div>

    <div className="mt-4 space-y-3">
      <label className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
        <span>Require pop reason</span>
        <input
          type="checkbox"
          checked={selectedBlock.data.requirePopReason !== false}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "pop_balloon"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      requirePopReason: e.target.checked,
                    },
                  },
            )
          }
        />
      </label>

      <label className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
        <span>Audience voting</span>
        <input
          type="checkbox"
          checked={Boolean(selectedBlock.data.audienceVotingEnabled)}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "pop_balloon"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      audienceVotingEnabled: e.target.checked,
                    },
                  },
            )
          }
        />
      </label>

      <label className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
        <span>Anonymous viewing</span>
        <input
          type="checkbox"
          checked={selectedBlock.data.anonymousViewingEnabled !== false}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "pop_balloon"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      anonymousViewingEnabled: e.target.checked,
                    },
                  },
            )
          }
        />
      </label>
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

    <label className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
  <input
    type="checkbox"
    checked={Boolean((selectedBlock.data as any).addCaption)}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        block.type !== "video"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                addCaption: e.target.checked,
              } as any,
            },
      )
    }
  />
  Add caption
</label>

{(selectedBlock.data as any).addCaption ? (
  <div className="mt-3">
    <div className={inspectorLabelClass()}>Caption</div>
    <input
      type="text"
      value={(selectedBlock.data as any).caption ?? ""}
      onChange={(e) =>
        updateSelectedBlock((block) =>
          block.type !== "video"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  caption: e.target.value,
                } as any,
              },
        )
      }
      className={inspectorInputClass()}
      placeholder="Video caption..."
    />
  </div>
) : null}

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
  <div className={inspectorLabelClass()}>Upload Video</div>

  <div className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
    <label className="flex h-11 cursor-pointer items-center justify-center rounded-xl bg-black px-4 text-sm font-semibold text-white hover:opacity-90">
      <span className="leading-none">Choose File</span>
      <input
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleVideoUpload}
      />
    </label>

    <div className="flex h-11 min-w-0 items-center rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-500">
      <span className="truncate">
        {selectedBlock.data.videoUrl?.trim() || "No file chosen"}
      </span>
    </div>
  </div>
</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>
        Video URL (YouTube, Vimeo, direct file, etc.)
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
      <div className={inspectorLabelClass()}>Paste Mode</div>
      <select
        value={selectedBlock.data.pasteMode ?? "match"}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "rich_text"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    pasteMode: e.target.value as "match" | "keep" | "plain",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="match">Match Site Style</option>
        <option value="keep">Keep Formatting</option>
        <option value="plain">Plain Text</option>
      </select>
      <div className="mt-1 text-xs text-neutral-500">
        Recommended: Match Site Style keeps structure while removing messy pasted styling.
      </div>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Content</div>

<div className="relative">
  <RichTextTiptapEditor
    html={
      typeof selectedBlock.data.contentHtml === "string"
        ? selectedBlock.data.contentHtml
        : selectedBlock.data.content ?? ""
    }
    pasteMode={selectedBlock.data.pasteMode ?? "match"}
    className={`${inspectorTextareaClass()} min-h-[220px] relative z-20 min-w-0 max-w-full cursor-text break-words`}
    style={{
      textAlign: selectedBlock.data.style?.align ?? "left",
    }}
    onChange={({ contentJson, contentHtml, plainText }) => {
      const normalized = normalizeRichTextHtml(contentHtml);

      setIsRichTextEditorEmpty(isRichTextHtmlEmpty(normalized));

      updateSelectedBlock((block) =>
        block.type !== "rich_text"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                content: normalized,
                contentHtml: normalized,
                contentJson,
                plainText,
              },
            },
      );
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
  contentHtml: "",
  contentJson: null,
  plainText: "",
  listType: "none",
  linkUrl: "",
  style: {
    ...(block.data.style ?? {}),
    bold: false,
    italic: false,
    underline: false,
    strike: false,
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

{selectedBlock?.type === "label" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Label Position</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Horizontal Position</div>
      <input
        type="range"
        min={0}
        max={100}
        value={(selectedBlock.data as any).positionX ?? 50}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "label"
              ? block
              : {
                  ...block,
                  data: {
                    ...(block.data as any),
                    positionX: Number(e.target.value),
                  },
                },
          )
        }
        className="mt-2 w-full"
      />
      <div className="mt-1 text-xs text-neutral-500">
        {(selectedBlock.data as any).positionX ?? 50}%
      </div>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Vertical Position</div>
      <input
        type="range"
        min={0}
        max={100}
        value={(selectedBlock.data as any).positionY ?? 50}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "label"
              ? block
              : {
                  ...block,
                  data: {
                    ...(block.data as any),
                    positionY: Number(e.target.value),
                  },
                },
          )
        }
        className="mt-2 w-full"
      />
      <div className="mt-1 text-xs text-neutral-500">
        {(selectedBlock.data as any).positionY ?? 50}%
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

                    <div className="mt-1 text-[11px] text-neutral-500">
                      Example internal page link:{" "}
                      <span className="font-mono">
                        /
                        {item.label && item.label.trim().length > 0
                          ? item.label
                              .trim()
                              .toLowerCase()
                              .replace(/\s+/g, "-")
                          : "page_name"}
                      </span>
                    </div>
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

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Text Target</div>

      <select
        value={listingStyleTarget}
        onChange={(e) =>
          setListingStyleTarget(
            e.target.value as
              | "title"
              | "description"
              | "metadata"
              | "price"
              | "quantity",
          )
        }
        className={inspectorInputClass()}
      >
        <option value="title">Title</option>
        <option value="description">Description</option>
        <option value="metadata">Metadata</option>
        <option value="price">Price</option>
        <option value="quantity">Quantity</option>
      </select>
    </div>

    <button
      type="button"
      className="mt-3 inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
      onClick={() => void uploadImageToSelectedBlock(selectedBlock.id)}
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
      <div className={inspectorLabelClass()}>Price Position</div>

      <select
        value={(selectedBlock.data as any).pricePlacement ?? "mid"}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "listing"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    pricePlacement: e.target.value as "mid" | "lower",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="mid">Mid-level</option>
        <option value="lower">Lower-level</option>
      </select>
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

    <div className="mt-4">
      <div className={inspectorLabelClass()}>SKU</div>
      <input
        type="text"
        value={selectedBlock.data.sku ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "listing"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    sku: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
        placeholder="Optional item code"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Quantity Position</div>

      <select
        value={(selectedBlock.data as any).quantityPlacement ?? "mid"}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "listing"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    quantityPlacement: e.target.value as "mid" | "lower",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="mid">Mid-level</option>
        <option value="lower">Lower-level</option>
      </select>
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
        <span className="text-sm text-neutral-700">Include in Cart</span>
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

    {(selectedBlock.data.cardVariant ?? "stacked") === "stacked" ? (
      <div className="mt-4">
<div className="flex items-center justify-between">
  <div className={inspectorLabelClass()}>Image Height %</div>

  <div className="text-xs text-neutral-500">
    {selectedBlock.data.imageHeightPercent ?? 50}%
  </div>
</div>

<input
  type="range"
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
              imageHeightPercent: Number(e.target.value),
            },
          },
    )
  }
  className="mt-2 w-full"
/>
      </div>
    ) : null}

    {(selectedBlock.data.cardVariant ?? "stacked") === "compact" ? (
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <div className={inspectorLabelClass()}>Image Width %</div>

          <div className="text-xs text-neutral-500">
            {(selectedBlock.data as any).imageWidthPercent ?? 35}%
          </div>
        </div>

        <input
          type="range"
          min={15}
          max={80}
          value={(selectedBlock.data as any).imageWidthPercent ?? 35}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "listing"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      imageWidthPercent: Number(e.target.value),
                    },
                  },
            )
          }
          className="mt-2 w-full"
        />
      </div>
    ) : null}

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Card Rotation</div>
      <input
        type="range"
        min={-45}
        max={45}
        value={(selectedBlock.data as any).rotation ?? 0}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "listing"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    rotation: Math.max(
                      -45,
                      Math.min(45, Number(e.target.value) || 0),
                    ),
                  },
                },
          )
        }
        className="mt-2 w-full"
      />
      <div className="mt-1 text-xs text-neutral-500">
        {(selectedBlock.data as any).rotation ?? 0}°
      </div>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Card Scale</div>
      <input
        type="range"
        min={50}
        max={100}
        value={Math.round(((selectedBlock.data as any).scale ?? 1) * 100)}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "listing"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    scale: Math.max(
                      0.5,
                      Math.min(1, Number(e.target.value) / 100 || 1),
                    ),
                  },
                },
          )
        }
        className="mt-2 w-full"
      />
      <div className="mt-1 text-xs text-neutral-500">
        {Math.round(((selectedBlock.data as any).scale ?? 1) * 100)}%
      </div>
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
                            metadata: block.data.metadata.filter(
                              (entry) => entry.id !== item.id,
                            ),
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
) : null}

                {selectedBlock?.type === "image" ? (
                  <div className={inspectorCardClass()}>
                    <div className={inspectorLabelClass()}>Image</div>

<label className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
  <input
    type="checkbox"
    checked={Boolean((selectedBlock.data as any).addCaption)}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        block.type !== "image"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                addCaption: e.target.checked,
              } as any,
            },
      )
    }
  />
  Add caption
</label>

{(selectedBlock.data as any).addCaption ? (
  <div className="mt-3">
    <div className={inspectorLabelClass()}>Caption</div>
    <input
      type="text"
      value={(selectedBlock.data as any).caption ?? ""}
      onChange={(e) =>
        updateSelectedBlock((block) =>
          block.type !== "image"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  caption: e.target.value,
                } as any,
              },
        )
      }
      className={inspectorInputClass()}
      placeholder="Image caption..."
    />
  </div>
) : null}

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
  <div className={inspectorLabelClass()}>Shadow</div>

  <label className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
    <input
      type="checkbox"
      checked={Boolean((selectedBlock.data as any).imageShadow?.enabled)}
      onChange={(e) =>
        updateSelectedBlock((block) =>
          block.type !== "image"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  imageShadow: {
                    ...((block.data as any).imageShadow ?? {}),
                    enabled: e.target.checked,
                    color: (block.data as any).imageShadow?.color ?? "#000000",
                    blur: (block.data as any).imageShadow?.blur ?? 15,
                    offsetX: (block.data as any).imageShadow?.offsetX ?? 0,
                    offsetY: (block.data as any).imageShadow?.offsetY ?? 0,
                  },
                } as any,
              },
        )
      }
    />
    Enable Shadow
  </label>

  <div className="mt-4 grid grid-cols-1 gap-3">
    <div>
      <div className={inspectorLabelClass()}>Shadow Color</div>
      <input
        type="color"
        value={(selectedBlock.data as any).imageShadow?.color ?? "#000000"}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "image"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    imageShadow: {
                      ...((block.data as any).imageShadow ?? {}),
                      enabled: true,
                      color: e.target.value,
                    },
                  } as any,
                },
          )
        }
        className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
      />
    </div>

    <div>
                  <div className="flex items-center justify-between">
              <div className={inspectorLabelClass()}>Blur</div>
              <div className="text-xs text-neutral-500">
                {Math.round((((selectedBlock.data as any).imageShadow?.blur ?? 15) / 60) * 100)}%
              </div>
            </div>
      <input
        type="range"
        min={0}
        max={60}
        value={(selectedBlock.data as any).imageShadow?.blur ?? 15}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "image"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    imageShadow: {
                      ...((block.data as any).imageShadow ?? {}),
                      enabled: true,
                      blur: Number(e.target.value),
                    },
                  } as any,
                },
          )
        }
        className="mt-2 w-full"
      />
    </div>

<div>
  <div className="flex items-center justify-between">
    <div className={inspectorLabelClass()}>Offset X</div>
    <div className="text-xs text-neutral-500">
      {Math.round(((((selectedBlock.data as any).imageShadow?.offsetX ?? 0) + 60) / 120) * 100)}%
    </div>
  </div>

  <input
    type="range"
    min={-60}
    max={60}
    value={(selectedBlock.data as any).imageShadow?.offsetX ?? 0}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        block.type !== "image"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                imageShadow: {
                  ...((block.data as any).imageShadow ?? {}),
                  enabled: true,
                  offsetX: Number(e.target.value),
                },
              } as any,
            },
      )
    }
    className="mt-2 w-full"
  />
</div>

<div>
  <div className="flex items-center justify-between">
    <div className={inspectorLabelClass()}>Offset Y</div>
    <div className="text-xs text-neutral-500">
      {Math.round(((((selectedBlock.data as any).imageShadow?.offsetY ?? 0) + 60) / 120) * 100)}%
    </div>
  </div>

  <input
    type="range"
    min={-60}
    max={60}
    value={(selectedBlock.data as any).imageShadow?.offsetY ?? 0}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        block.type !== "image"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                imageShadow: {
                  ...((block.data as any).imageShadow ?? {}),
                  enabled: true,
                  offsetY: Number(e.target.value),
                },
              } as any,
            },
      )
    }
    className="mt-2 w-full"
  />
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

                {selectedBlock?.type === "icon" ? (
                  <div className={inspectorCardClass()}>
                    <div className={inspectorLabelClass()}>Icon</div>

                    <div className="mt-4">
                      <div className={inspectorLabelClass()}>Icon</div>
                      <select
                        value={getIconNameFromUrl(selectedBlock.data.icon.url)}
                        onChange={(e) => {
                          const iconName = e.target.value;
                          const iconTool = CATEGORY_BUTTONS.Icons.find(
                            (tool) =>
                              tool.kind === "block" &&
                              tool.type === "icon" &&
                              tool.iconName === iconName,
                          );

                          updateSelectedBlock((block) =>
                            block.type !== "icon"
                              ? block
                              : {
                                  ...block,
                                  label: iconTool?.label ?? block.label,
                                  data: {
                                    ...block.data,
                                    icon: {
                                      ...block.data.icon,
                                      id: `/media-icons/${iconName}.svg`,
                                      url: `/media-icons/${iconName}.svg`,
                                      alt: iconTool?.label ?? block.data.icon.alt ?? "Icon",
                                    },
                                  },
                                },
                          );
                        }}
                        className={inspectorInputClass()}
                      >
{CATEGORY_BUTTONS.Icons.filter(
  (
    tool,
  ): tool is Extract<
    (typeof CATEGORY_BUTTONS)["Icons"][number],
    { kind: "block" }
  > & { iconName?: string } =>
    tool.kind === "block" && tool.type === "icon",
).map((tool) => (
  <option key={tool.iconName ?? tool.label} value={tool.iconName ?? "star"}>
    {tool.label}
  </option>
))}
                      </select>
                    </div>

                    <div className="mt-4">
                      <div className={inspectorLabelClass()}>Icon Color</div>
                      <input
                        type="color"
                        value={selectedBlock.data.icon.color ?? "#111111"}
                        onChange={(e) => applyFillColor(e.target.value)}
                        className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3">
                      {[
                        ["Horizontal Position", "positionX", 0, 100, "%"],
                        ["Vertical Position", "positionY", 0, 100, "%"],
                        ["Zoom", "zoom", 50, 300, "%"],
                        ["Rotation", "rotation", -180, 180, "°"],
                        ["Opacity", "opacity", 0, 100, "%"],
                      ].map(([label, key, min, max, suffix]) => {
                        const rawValue =
                          key === "zoom"
                            ? Math.round((selectedBlock.data.icon.zoom ?? 1) * 100)
                            : key === "opacity"
                              ? Math.round((selectedBlock.data.icon.opacity ?? 1) * 100)
                              : ((selectedBlock.data.icon as any)[key] ?? (key === "rotation" ? 0 : 50));

                        return (
                          <div key={String(key)}>
                            <div className={inspectorLabelClass()}>{label}</div>
                            <input
                              type="range"
                              min={Number(min)}
                              max={Number(max)}
                              value={Number(rawValue)}
                              onChange={(e) =>
                                updateSelectedIconPatch({
                                  [key as string]:
                                    key === "zoom" || key === "opacity"
                                      ? Number(e.target.value) / 100
                                      : Number(e.target.value),
                                } as any)
                              }
                              className="mt-2 w-full"
                            />
                            <div className="mt-1 text-xs text-neutral-500">
                              {Number(rawValue)}
                              {suffix}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {selectedBlock?.type === "shape" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Shape</div>

    <div className="mt-4 grid grid-cols-1 gap-3">
      <div>
        <div className={inspectorLabelClass()}>Horizontal Position</div>
        <input
          type="range"
          min={0}
          max={100}
          value={selectedBlock.data.positionX ?? 50}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "shape"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      positionX: Number(e.target.value),
                    },
                  },
            )
          }
          className="mt-2 w-full"
        />
        <div className="mt-1 text-xs text-neutral-500">
          {selectedBlock.data.positionX ?? 50}%
        </div>
      </div>

      <div>
        <div className={inspectorLabelClass()}>Vertical Position</div>
        <input
          type="range"
          min={0}
          max={100}
          value={selectedBlock.data.positionY ?? 50}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "shape"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      positionY: Number(e.target.value),
                    },
                  },
            )
          }
          className="mt-2 w-full"
        />
        <div className="mt-1 text-xs text-neutral-500">
          {selectedBlock.data.positionY ?? 50}%
        </div>
      </div>

      <div>
        <div className={inspectorLabelClass()}>Scale</div>
        <input
          type="range"
          min={50}
          max={300}
          value={Math.round((selectedBlock.data.scale ?? 1) * 100)}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "shape"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      scale: Number(e.target.value) / 100,
                    },
                  },
            )
          }
          className="mt-2 w-full"
        />
        <div className="mt-1 text-xs text-neutral-500">
          {Math.round((selectedBlock.data.scale ?? 1) * 100)}%
        </div>
      </div>

      <div>
        <div className={inspectorLabelClass()}>Rotation</div>
        <input
          type="range"
          min={-180}
          max={180}
          value={selectedBlock.data.rotation ?? 0}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "shape"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      rotation: Number(e.target.value) || 0,
                    },
                  },
            )
          }
          className="mt-2 w-full"
        />
        <div className="mt-1 text-xs text-neutral-500">
          {selectedBlock.data.rotation ?? 0}°
        </div>
      </div>

      <div>
        <div className={inspectorLabelClass()}>Opacity</div>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round((selectedBlock.data.opacity ?? 1) * 100)}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "shape"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      opacity: Number(e.target.value) / 100,
                    },
                  },
            )
          }
          className="mt-2 w-full"
        />
        <div className="mt-1 text-xs text-neutral-500">
          {Math.round((selectedBlock.data.opacity ?? 1) * 100)}%
        </div>
      </div>
    </div>

    <div className="mt-5">
      <div className={inspectorLabelClass()}>Fade Edges</div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {(["top", "bottom", "left", "right"] as const).map((dir) => (
          <label
            key={dir}
            className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800"
          >
            <input
              type="checkbox"
              checked={Boolean(selectedBlock.data.fade?.[dir])}
              onChange={(e) =>
                updateSelectedBlock((block) =>
                  block.type !== "shape"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          fade: {
                            ...block.data.fade,
                            [dir]: e.target.checked,
                          },
                        },
                      },
                )
              }
            />
            {dir.charAt(0).toUpperCase() + dir.slice(1)}
          </label>
        ))}
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Fade Size</div>
        <input
          type="range"
          min={0}
          max={50}
          value={selectedBlock.data.fade?.size ?? 15}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "shape"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      fade: {
                        ...block.data.fade,
                        size: Number(e.target.value),
                      },
                    },
                  },
            )
          }
          className="mt-2 w-full"
        />
        <div className="mt-1 text-xs text-neutral-500">
          {selectedBlock.data.fade?.size ?? 15}%
        </div>
      </div>
    </div>
  </div>
) : null}

{selectedBlock?.type === "wave" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Wave</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Line Color</div>
      <input
        type="color"
        value={selectedBlock.data.lineColor ?? "#C8A97E"}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "wave"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    lineColor: e.target.value,
                  },
                },
          )
        }
        className="h-10 w-full rounded-lg border border-neutral-200 bg-white"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Line Thickness</div>
      <input
        type="range"
        min={1}
        max={20}
        step={1}
        value={Number(selectedBlock.data.lineThickness ?? 2)}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "wave"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    lineThickness: Number(e.target.value),
                  },
                },
          )
        }
        className="w-full"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Wave Height</div>
      <input
        type="range"
        min={5}
        max={80}
        step={1}
        value={Number(selectedBlock.data.waveHeight ?? 40)}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "wave"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    waveHeight: Number(e.target.value),
                  },
                },
          )
        }
        className="w-full"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Wave Frequency</div>
      <input
        type="range"
        min={1}
        max={8}
        step={1}
        value={Number(selectedBlock.data.waveFrequency ?? 3)}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "wave"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    waveFrequency: Number(e.target.value),
                  },
                },
          )
        }
        className="w-full"
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Opacity</div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={Math.round((selectedBlock.data.opacity ?? 1) * 100)}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "wave"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    opacity: Number(e.target.value) / 100,
                  },
                },
          )
        }
        className="w-full"
      />
    </div>

    <div className="mt-4">
      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={Boolean(selectedBlock.data.flipVertical)}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "wave"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      flipVertical: e.target.checked,
                    },
                  },
            )
          }
        />
        Flip Vertical
      </label>
    </div>
  </div>
) : null}

{selectedBlock?.type === "gallery" ? (
  <div className={inspectorCardClass()}>
    <div className={inspectorLabelClass()}>Gallery</div>

    <label className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
      <input
        type="checkbox"
        checked={Boolean((selectedBlock.data as any).addCaption)}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type !== "gallery"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    addCaption: e.target.checked,
                  } as any,
                },
          )
        }
      />
      Add captions
    </label>

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
                      columns: Math.max(1, Math.min(12, Number(e.target.value) || 1)),
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
                      rows: Math.max(1, Math.min(12, Number(e.target.value) || 1)),
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>
    </div>

    <div className="mt-5 grid grid-cols-1 gap-4">
      <div>
        <div className="flex items-center justify-between">
          <div className={inspectorLabelClass()}>Horizontal Photo Spacing</div>
          <div className="text-xs text-neutral-500">
            {(selectedBlock.data as any).columnGap ?? 8}px
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={60}
          value={(selectedBlock.data as any).columnGap ?? 8}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "gallery"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      columnGap: Number(e.target.value),
                    } as any,
                  },
            )
          }
          className="mt-2 w-full"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div className={inspectorLabelClass()}>Vertical Photo Spacing</div>
          <div className="text-xs text-neutral-500">
            {(selectedBlock.data as any).rowGap ?? 8}px
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={60}
          value={(selectedBlock.data as any).rowGap ?? 8}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "gallery"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      rowGap: Number(e.target.value),
                    } as any,
                  },
            )
          }
          className="mt-2 w-full"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div className={inspectorLabelClass()}>Photo Frame Thickness</div>
          <div className="text-xs text-neutral-500">
            {(selectedBlock.data as any).frameThickness ?? 0}px
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={24}
          value={(selectedBlock.data as any).frameThickness ?? 0}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "gallery"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      frameThickness: Number(e.target.value),
                    } as any,
                  },
            )
          }
          className="mt-2 w-full"
        />
      </div>

      <div>
        <div className={inspectorLabelClass()}>Photo Frame Color</div>
        <input
          type="color"
          value={(selectedBlock.data as any).frameColor ?? "#ffffff"}
          onChange={(e) =>
            updateSelectedBlock((block) =>
              block.type !== "gallery"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      frameColor: e.target.value,
                    } as any,
                  },
            )
          }
          className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
        />
      </div>
    </div>

    <button
      type="button"
      className="mt-5 inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
      onClick={() => void uploadGalleryImagesToBlock(selectedBlock.id)}
    >
      Add Images
    </button>

    <div className="mt-4 space-y-3">
      {selectedBlock.data.images.map((image, index) => (
<div
  key={image.id}
  ref={(node) => {
    galleryImageCardRefs.current[image.id] = node;
  }}
  className={[
    "rounded-xl border bg-neutral-50 p-3 transition",
    selectedGalleryImageId === image.id
      ? "border-blue-500 ring-2 ring-blue-200"
      : "border-neutral-200",
  ].join(" ")}
>
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-lg border border-neutral-200 bg-white">
              <img src={image.url} alt="" className="h-full w-full object-cover" />
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
                onClick={() => moveGalleryImage(selectedBlock.id, image.id, "up")}
                disabled={index === 0}
                title="Move up"
              >
                ↑
              </button>

              <button
                type="button"
                className={toolSetButtonClass("front")}
                onClick={() => moveGalleryImage(selectedBlock.id, image.id, "down")}
                disabled={index === selectedBlock.data.images.length - 1}
                title="Move down"
              >
                ↓
              </button>

              <button
                type="button"
                className={toolSetButtonClass("front")}
                onClick={() =>
                  updateSelectedBlock((block) =>
                    block.type !== "gallery"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            images: block.data.images.filter(
                              (galleryImage) => galleryImage.id !== image.id,
                            ),
                          },
                        },
                  )
                }
                title="Remove image"
              >
                ×
              </button>
            </div>
          </div>

          <div className="mt-3">
            <div className={inspectorLabelClass()}>Image Link URL</div>
            <input
              type="url"
              value={(image as any).href ?? ""}
              onChange={(e) =>
                updateSelectedBlock((block) =>
                  block.type !== "gallery"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          images: block.data.images.map((galleryImage) =>
                            galleryImage.id === image.id
                              ? { ...galleryImage, href: e.target.value }
                              : galleryImage,
                          ),
                        } as any,
                      },
                )
              }
              className={inspectorInputClass()}
              placeholder="https://example.com"
            />
          </div>

          {(selectedBlock.data as any).addCaption ? (
            <div className="mt-3">
              <div className={inspectorLabelClass()}>Caption</div>
              <input
                type="text"
                value={(image as any).caption ?? ""}
                onChange={(e) =>
                  updateSelectedBlock((block) =>
                    block.type !== "gallery"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            images: block.data.images.map((galleryImage) =>
                              galleryImage.id === image.id
                                ? { ...galleryImage, caption: e.target.value }
                                : galleryImage,
                            ),
                          } as any,
                        },
                  )
                }
                className={inspectorInputClass()}
                placeholder={`Image ${index + 1} caption...`}
              />
            </div>
          ) : null}
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
                
{selectedBlock?.type === "cta" ? (
  <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
      Button Settings
    </div>

    <label className="block">
      <span className="text-xs font-medium text-neutral-600">Button Text</span>
      <input
        type="text"
        value={selectedBlock.data.buttonText || ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type === "cta"
              ? {
                  ...block,
                  data: {
                    ...block.data,
                    buttonText: e.target.value,
                  },
                }
              : block,
          )
        }
        placeholder="RSVP"
        className="mt-1 h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
      />
    </label>

    <label className="block">
      <span className="text-xs font-medium text-neutral-600">Button Link</span>
      <input
        type="text"
        value={selectedBlock.data.buttonUrl || ""}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type === "cta"
              ? {
                  ...block,
                  data: {
                    ...block.data,
                    buttonUrl: e.target.value,
                  },
                }
              : block,
          )
        }
        placeholder="https://example.com or /schedule"
        className="mt-1 h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
      />
    </label>

    <div>
      <div className="text-xs font-medium text-neutral-600">Button Image</div>

      {selectedBlock.data.buttonImageUrl ? (
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-2">
          <img
            src={selectedBlock.data.buttonImageUrl}
            alt=""
            className="h-10 w-10 rounded-lg object-cover"
          />

          <button
            type="button"
            className="h-9 rounded-lg border border-neutral-300 bg-white px-3 text-xs text-neutral-700 hover:bg-neutral-50"
            onClick={() => void uploadImageToSelectedBlock(selectedBlock.id)}
          >
            Replace
          </button>

          <button
            type="button"
            className="h-9 rounded-lg border border-red-200 bg-white px-3 text-xs text-red-600 hover:bg-red-50"
            onClick={() =>
              updateSelectedBlock((block) =>
                block.type === "cta"
                  ? {
                      ...block,
                      data: {
                        ...block.data,
                        buttonImageUrl: "",
                      },
                    }
                  : block,
              )
            }
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="mt-2 inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
          onClick={() => void uploadImageToSelectedBlock(selectedBlock.id)}
        >
          Browse Image
        </button>
      )}
    </div>

    <div>
<div className="mb-1 flex items-center justify-between">
  <div className="text-xs font-medium text-neutral-600">
    Horizontal Padding
  </div>

  <div className="text-xs text-neutral-500">
    {(selectedBlock.data as any).buttonPaddingX ?? 16}%
  </div>
</div>

  <input
    type="range"
    min={2}
    max={120}
    value={(selectedBlock.data as any).buttonPaddingX ?? 16}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        block.type === "cta"
          ? {
              ...block,
              data: {
                ...block.data,
                buttonPaddingX: Number(e.target.value),
              },
            }
          : block,
      )
    }
    className="mt-2 w-full"
  />
</div>

<div>
<div className="mb-1 flex items-center justify-between">
  <div className="text-xs font-medium text-neutral-600">
    Vertical Padding
  </div>

  <div className="text-xs text-neutral-500">
    {(selectedBlock.data as any).buttonPaddingY ?? 8}%
  </div>
</div>

  <input
    type="range"
    min={2}
    max={80}
    value={(selectedBlock.data as any).buttonPaddingY ?? 8}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        block.type === "cta"
          ? {
              ...block,
              data: {
                ...block.data,
                buttonPaddingY: Number(e.target.value),
              },
            }
          : block,
      )
    }
    className="mt-2 w-full"
  />
</div>

<div>
<div className="mb-1 flex items-center justify-between">
  <div className="text-xs font-medium text-neutral-600">
    Button Image Size
  </div>

  <div className="text-xs text-neutral-500">
    {(selectedBlock.data as any).buttonImageSize ?? 20}px
  </div>
</div>

  <input
    type="range"
    min={10}
    max={80}
    value={(selectedBlock.data as any).buttonImageSize ?? 20}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        block.type === "cta"
          ? {
              ...block,
              data: {
                ...block.data,
                buttonImageSize: Number(e.target.value),
              },
            }
          : block,
      )
    }
    className="mt-2 w-full"
  />
</div>

<div>
  <div className="text-xs font-medium text-neutral-600">
    Image Placement
  </div>

  <div className="mt-2 grid grid-cols-3 gap-2">
    <button
      type="button"
      onClick={() =>
        updateSelectedBlock((block) =>
          block.type === "cta"
            ? {
                ...block,
                data: {
                  ...block.data,
                  buttonImagePlacement: "before",
                },
              }
            : block,
        )
      }
      className={`h-10 rounded-xl border text-xs font-medium transition ${
        (((selectedBlock.data as any).buttonImagePlacement ??
          "before") === "before")
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
      }`}
    >
      Before
    </button>

    <button
      type="button"
      onClick={() =>
        updateSelectedBlock((block) =>
          block.type === "cta"
            ? {
                ...block,
                data: {
                  ...block.data,
                  buttonImagePlacement: "above",
                },
              }
            : block,
        )
      }
      className={`h-10 rounded-xl border text-xs font-medium transition ${
        (((selectedBlock.data as any).buttonImagePlacement ??
          "before") === "above")
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
      }`}
    >
      Above
    </button>

    <button
      type="button"
      onClick={() =>
        updateSelectedBlock((block) =>
          block.type === "cta"
            ? {
                ...block,
                data: {
                  ...block.data,
                  buttonImagePlacement: "after",
                },
              }
            : block,
        )
      }
      className={`h-10 rounded-xl border text-xs font-medium transition ${
        (((selectedBlock.data as any).buttonImagePlacement ??
          "before") === "after")
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
      }`}
    >
      After
    </button>
  </div>
</div>

    <label className="block">
      <span className="text-xs font-medium text-neutral-600">
        Submitted Text
      </span>
      <input
        type="text"
        value={(selectedBlock.data as any).submittedText || "Submitted"}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type === "cta"
              ? {
                  ...block,
                  data: {
                    ...block.data,
                    submittedText: e.target.value,
                  },
                }
              : block,
          )
        }
        placeholder="Submitted"
        className="mt-1 h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
      />
    </label>

    <div>
<div className="mb-1 flex items-center justify-between">
  <div className={inspectorLabelClass()}>
    Horizontal Position
  </div>

  <div className="text-xs text-neutral-500">
{Math.round((selectedBlock.data as any).posX ?? 50)}
    %
  </div>
</div>
      <input
        type="range"
        min={0}
        max={100}
        value={(selectedBlock.data as any).posX ?? 50}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type === "cta"
              ? {
                  ...block,
                  data: {
                    ...block.data,
                    posX: Number(e.target.value),
                  },
                }
              : block,
          )
        }
        className="mt-1 w-full"
      />
    </div>

    <div>
<div className="mb-1 flex items-center justify-between">
  <div className={inspectorLabelClass()}>
    Vertical Position
  </div>

  <div className="text-xs text-neutral-500">
{Math.round((selectedBlock.data as any).posY ?? 50)}
    %
  </div>
</div>
      <input
        type="range"
        min={0}
        max={100}
        value={(selectedBlock.data as any).posY ?? 50}
        onChange={(e) =>
          updateSelectedBlock((block) =>
            block.type === "cta"
              ? {
                  ...block,
                  data: {
                    ...block.data,
                    posY: Number(e.target.value),
                  },
                }
              : block,
          )
        }
        className="mt-1 w-full"
      />
    </div>
  </div>
) : null}

                {selectedBlock?.type === "image_carousel" ? (
                  <div id="inspector-image-carousel" className={inspectorCardClass()}>
                    <div className={inspectorLabelClass()}>Image Carousel</div>

<label className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
  <input
    type="checkbox"
    checked={Boolean((selectedBlock.data as any).addCaption)}
    onChange={(e) =>
      updateSelectedBlock((block) =>
        block.type !== "image_carousel"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                addCaption: e.target.checked,
              } as any,
            },
      )
    }
  />
  Add captions
</label>

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

                            {(selectedBlock.data as any).addCaption ? (
                              <div className="mt-4">
                                <div className={inspectorLabelClass()}>Caption</div>
                                <input
                                  type="text"
                                  value={(item as any).caption ?? ""}
                                  onChange={(e) =>
                                    setDraft((prev) => ({
                                      ...prev,
                                      blocks: updateImageCarouselItemField(
                                        prev.blocks,
                                        selectedBlock.id,
                                        item.id,
                                        "caption" as any,
                                        e.target.value,
                                      ),
                                    }))
                                  }
                                  className={inspectorInputClass()}
                                  placeholder={`Slide ${index + 1} caption...`}
                                />
                              </div>
                            ) : null}

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
                                placeholder="/gallery/sights or https://..."
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
    className={[
      "cursor-pointer rounded-xl p-3 transition-all duration-150",
      selectedBlock?.id === tool.id
        ? "border-2 border-black bg-white shadow-md"
        : "border border-neutral-200 bg-neutral-50 hover:bg-white",
    ].join(" ")}
  >
    <div className="mb-3 min-w-0">
{tool.canRename && selectedBlock?.id === tool.id ? (
  <input
    type="text"
    value={tool.label}
    onClick={(e) => e.stopPropagation()}
    onKeyDown={(e) => e.stopPropagation()}
    onChange={(e) => {
      const nextLabel = e.target.value;

      setDraft((prev) => ({
        ...prev,
        blocks: prev.blocks.map((block) =>
          block.id === tool.id ? { ...block, label: nextLabel } : block,
        ),
      }));
    }}
    className="w-full rounded-lg border border-neutral-300 bg-white px-2 py-1 text-sm font-semibold text-neutral-900"
    placeholder="Block name"
  />
) : (
  <div className="truncate text-sm font-semibold text-neutral-900">
    {tool.label}
  </div>
)}
      <div className="mt-1 text-xs uppercase tracking-[0.12em] text-neutral-500">
        {tool.kind}
      </div>
    </div>

    <div className="flex items-center gap-2 overflow-visible">
      {/* DUPLICATE (NEW POSITION) */}
<div className="group relative inline-flex overflow-visible">
<button
  type="button"
  className={toolSetButtonClass("front")}
  onMouseDown={(e) => {
    e.preventDefault();
    e.stopPropagation();
  }}
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    handleDuplicateCanvasBlock(tool.id);
  }}
  aria-label="Duplicate"
>
  ⧉
</button>

  <div className="pointer-events-none absolute left-1/2 top-full z-[9999] mt-2 w-max -translate-x-1/2 rounded-md bg-black px-3 py-2 text-center text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
    <div className="text-xs font-medium">Duplicate</div>
    <div className="text-[10px] text-white/70">(CTRL+V)</div>
  </div>
</div>

<div className="group relative inline-flex overflow-visible">
  <button
    type="button"
    className={toolSetButtonClass("back")}
    onClick={(e) => {
      e.stopPropagation();
      handleSendToBack(tool.id);
      setSelection(selectionFromCanvasBlockId(tool.id));
    }}
    aria-label="Send to back"
  >
    <img
      src="/icons/icon_block_back.png"
      alt=""
      className="pointer-events-none h-4 w-4 object-contain"
    />
  </button>

  <div className="pointer-events-none absolute left-1/2 top-full z-[9999] mt-2 w-max -translate-x-1/2 rounded-md bg-black px-3 py-2 text-center text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
    <div className="text-xs font-medium">Send to back</div>
    <div className="text-[10px] text-white/70">(CTRL+SHIFT+↓)</div>
  </div>
</div>

<div className="group relative inline-flex overflow-visible">
  <button
    type="button"
    className={toolSetButtonClass("front")}
    onClick={(e) => {
      e.stopPropagation();
      handleBringToFront(tool.id);
      setSelection(selectionFromCanvasBlockId(tool.id));
    }}
    aria-label="Bring to front"
  >
    <img
      src="/icons/icon_block_front.png"
      alt=""
      className="pointer-events-none h-4 w-4 object-contain"
    />
  </button>

  <div className="pointer-events-none absolute left-1/2 top-full z-[9999] mt-2 w-max -translate-x-1/2 rounded-md bg-black px-3 py-2 text-center text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
    <div className="text-xs font-medium">Bring to front</div>
    <div className="text-[10px] text-white/70">(CTRL+SHIFT+↑)</div>
  </div>
</div>

<div className="group relative inline-flex overflow-visible">
  <button
    type="button"
    className={toolSetButtonClass("front")}
    onClick={(e) => {
      e.stopPropagation();
      handleBringForward(tool.id);
      setSelection(selectionFromCanvasBlockId(tool.id));
    }}
    aria-label="Move forward one layer"
  >
    ↑
  </button>

  <div className="pointer-events-none absolute left-1/2 top-full z-[9999] mt-2 w-max -translate-x-1/2 rounded-md bg-black px-3 py-2 text-center text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
    <div className="text-xs font-medium">Move forward one layer</div>
    <div className="text-[10px] text-white/70">(CTRL+↑)</div>
  </div>
</div>

<div className="group relative inline-flex overflow-visible">
  <button
    type="button"
    className={toolSetButtonClass("back")}
    onClick={(e) => {
      e.stopPropagation();
      handleSendBackward(tool.id);
      setSelection(selectionFromCanvasBlockId(tool.id));
    }}
    aria-label="Move backward one layer"
  >
    ↓
  </button>

  <div className="pointer-events-none absolute left-1/2 top-full z-[9999] mt-2 w-max -translate-x-1/2 rounded-md bg-black px-3 py-2 text-center text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
    <div className="text-xs font-medium">Move backward one layer</div>
    <div className="text-[10px] text-white/70">(CTRL+↓)</div>
  </div>
</div>

{/* REMOVE stays last */}
<div className="group relative inline-flex overflow-visible">
  <button
    type="button"
    className={toolSetButtonClass("remove")}
    onClick={(e) => {
      e.stopPropagation();
      removeCanvasBlock(tool.id);
    }}
    aria-label="Remove block"
  >
    ×
  </button>

  <div className="pointer-events-none absolute left-1/2 top-full z-[9999] mt-2 w-max -translate-x-1/2 rounded-md bg-black px-3 py-2 text-center text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
    <div className="text-xs font-medium">Remove block</div>
    <div className="text-[10px] text-white/70">(CTRL+X)</div>
  </div>
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
  className="sticky bottom-0 z-[110] border-t border-black/10 bg-[#e9e9e9] shadow-[0_-2px_10px_rgba(0,0,0,0.06)]"
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

<div className="relative flex flex-col gap-3 border-b border-black/10 px-3 py-2 md:flex-row md:items-start md:justify-between md:gap-6 md:px-6 md:py-1">
<div className="flex w-full flex-nowrap items-center gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
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
              className="absolute left-0 top-[calc(100%+10px)] z-[120] w-max max-w-[calc(100vw-32px)] rounded-2xl border border-neutral-300 bg-white p-3 shadow-2xl md:bottom-[calc(100%+10px)] md:top-auto md:max-w-[420px]"
            >
<div className="mb-2 flex items-center justify-between gap-3">
  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
    {category} Tools
  </div>

  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setCategoryMenuView((view) =>
          view === "compact" ? "detail" : "compact",
        );
      }}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 bg-white p-1 shadow-sm hover:border-neutral-900"
      title={
        categoryMenuView === "compact"
          ? "Switch to detail view"
          : "Switch to compact view"
      }
      aria-label={
        categoryMenuView === "compact"
          ? "Switch to detail view"
          : "Switch to compact view"
      }
    >
<img
  src={
    categoryMenuView === "compact"
      ? "/icons/icon_menu_detail_view.png"
      : "/icons/icon_menu_compact_view.png"
  }
  alt=""
  className="h-4 w-4 object-contain"
/>
    </button>

    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setToolGuideModalOpen(true);
      }}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 bg-white text-sm font-bold text-neutral-700 shadow-sm hover:border-neutral-900 hover:text-neutral-950"
      title="Open tool guide"
      aria-label="Open tool guide"
    >
      ?
    </button>
  </div>
</div>

{categoryMenuView === "compact" ? (
  <div className="flex max-w-[400px] flex-wrap gap-2">
    {CATEGORY_BUTTONS[category].map((tool, index) => (
      <button
        key={`${category}-${tool.kind}-${tool.type}-${index}`}
        type="button"
        className={[
  toolButtonClass(),
  toolMatchesSearch(toolSearchQuery, category, tool)
    ? flashedToolKey === getToolSearchKey(category, tool)
      ? "border-blue-500 ring-2 ring-blue-300"
      : "border-blue-300"
    : "",
].join(" ")}
        onClick={() => {
          if (tool.kind === "block") addBlock(
  tool.type,
  tool.label,
  "iconName" in tool ? tool.iconName : undefined,
);
          if (tool.kind === "shape") addShape(tool.type);
          if (tool.kind === "page") addPageBlock(tool.type);
          setOpenToolMenu(null);
        }}
        draggable
        onDragStart={(e) => {
const payload: ToolDropPayload =
  tool.kind === "block"
    ? {
        kind: "block",
        type: tool.type,
        label: tool.label,
iconName: "iconName" in tool ? tool.iconName : undefined,
iconUrl:
  tool.type === "icon"
    ? `/media-icons/${"iconName" in tool ? tool.iconName ?? "star" : "star"}.svg`
    : undefined,
      }
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
        {renderToolGlyph(tool)}
      </button>
    ))}
  </div>
) : (
  <div className="flex max-h-[252px] w-[360px] max-w-[calc(100vw-56px)] flex-col gap-2 overflow-y-auto pr-1">
    {CATEGORY_BUTTONS[category].map((tool, index) => (
      <button
        key={`${category}-${tool.kind}-${tool.type}-${index}`}
        type="button"
        className={[
  "flex w-full cursor-grab items-center gap-3 rounded-xl border bg-white px-3 py-2 text-left transition hover:border-blue-500 hover:bg-blue-50 active:cursor-grabbing",
  toolMatchesSearch(toolSearchQuery, category, tool)
    ? flashedToolKey === getToolSearchKey(category, tool)
      ? "border-blue-500 ring-2 ring-blue-300"
      : "border-blue-300"
    : "border-neutral-200",
].join(" ")}
        onClick={() => {
          if (tool.kind === "block") addBlock(
  tool.type,
  tool.label,
  "iconName" in tool ? tool.iconName : undefined,
);
          if (tool.kind === "shape") addShape(tool.type);
          if (tool.kind === "page") addPageBlock(tool.type);
          setOpenToolMenu(null);
        }}
        draggable
        onDragStart={(e) => {
const payload: ToolDropPayload =
  tool.kind === "block"
    ? {
        kind: "block",
        type: tool.type,
        label: tool.label,
iconName: "iconName" in tool ? tool.iconName : undefined,
iconUrl:
  tool.type === "icon"
    ? `/media-icons/${"iconName" in tool ? tool.iconName ?? "star" : "star"}.svg`
    : undefined,
      }
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
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-sm font-semibold text-neutral-800">
          {renderToolGlyph(tool)}
        </span>

        <span className="min-w-0">
          <span className="block text-sm font-semibold text-neutral-900">
            {tool.label}
          </span>
          <span className="block truncate text-xs text-neutral-500">
            {TOOL_DESCRIPTIONS[tool.label] ?? "Drag onto canvas to add"}
          </span>
        </span>
      </button>
    ))}
  </div>
)}
            </div>
          ) : null}
        </div>
      ))}
          <div className="shrink-0">
      <input
        type="search"
        value={toolSearchQuery}
onChange={(e) => {
  const nextQuery = e.target.value;
  setToolSearchQuery(nextQuery);

  const normalizedQuery = nextQuery.trim().toLowerCase();

  if (!normalizedQuery) {
    setOpenToolMenu(null);
    setFlashedToolKey(null);
    return;
  }

  const firstMatch = CATEGORY_ORDER.flatMap((category) =>
    CATEGORY_BUTTONS[category].map((tool) => ({ category, tool })),
  ).find(({ category, tool }) =>
    toolMatchesSearch(normalizedQuery, category, tool),
  );

if (!firstMatch) return;

const nextKey = getToolSearchKey(firstMatch.category, firstMatch.tool);
setActiveCategory(firstMatch.category);
setOpenToolMenu(firstMatch.category);
setFlashedToolKey(nextKey);

window.setTimeout(() => {
  setFlashedToolKey((current) => (current === nextKey ? null : current));
}, 1300);
}}
placeholder="Tool search..."
className="h-[44px] w-[180px] rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
/>
</div>
</div>

<div className="flex w-full flex-row items-center justify-center gap-2 overflow-x-auto pb-1 md:w-auto md:flex-col md:items-end md:justify-start md:overflow-visible">
  <div className="flex flex-nowrap items-center gap-2 md:gap-4 h-12">


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
      onClick={async () => {
const zoomBeforeSave = canvasZoom;

try {
const zoomBeforeSave = canvasZoom;

try {
  await onSaveDraft?.(draft);
  downloadBlueprintSnapshot(draft);
} finally {
  window.requestAnimationFrame(() => {
    setCanvasZoom(zoomBeforeSave);

    window.setTimeout(() => {
      setCanvasZoom(zoomBeforeSave);
    }, 250);
  });
}
} finally {
  window.requestAnimationFrame(() => {
    setCanvasZoom(zoomBeforeSave);

    window.setTimeout(() => {
      setCanvasZoom(zoomBeforeSave);
    }, 250);
  });
}
      }}
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

        {isPublished && slug ? (
          <a
            href={`https://${slug}.ko-host.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-md border border-emerald-600 bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            Open Public Site
          </a>
        ) : null}
      </div>

{saveMessage ? (
  <div
    className={[
      "max-w-xl rounded-xl px-3 py-2 text-xs leading-5",
      saveState === "error"
        ? "border border-red-200 bg-red-50 text-red-700"
        : "text-neutral-500",
    ].join(" ")}
  >
    <div>{saveMessage}</div>

    {saveState === "error" ? (
      <div className="mt-1 font-medium">
        How to correct it: {getSaveFailureHelp(saveMessage)}
      </div>
    ) : null}
  </div>
) : null}
    </div>
  </div>

  {builderCapacityContent ? (
    <div className="w-full border-t border-white/10 bg-[#2f3541]">
      {builderCapacityContent}
    </div>
  ) : null}
</div>

<AppModal
  open={toolGuideModalOpen}
  title="Builder Tool Guide"
  description="Quick explanations for the tools you can add to your microsite."
  cancelText="Close"
  onCancel={() => setToolGuideModalOpen(false)}
>
  <div className="mt-4 max-h-[70vh] space-y-3 overflow-y-auto pr-2">
    {CATEGORY_BUTTONS[activeCategory]
  .map((tool) => ({
    name: tool.label,
    purpose:
      BUILDER_TOOL_GUIDES.find((guide) => guide.name === tool.label)?.purpose ??
      "Guide content coming soon.",
    howToUse:
      BUILDER_TOOL_GUIDES.find((guide) => guide.name === tool.label)?.howToUse ??
      "Add this tool from the toolbar, then customize it from the inspector panel.",
  }))
  .map((guide) => (
      <div
        key={guide.name}
        className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
      >
        <div className="text-sm font-semibold text-neutral-950">
          {guide.name}
        </div>

        <div className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
          Purpose
        </div>
        <p className="mt-1 text-sm text-neutral-700">{guide.purpose}</p>

        <div className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
          How to use
        </div>
        <p className="mt-1 text-sm text-neutral-700">{guide.howToUse}</p>
      </div>
    ))}
  </div>
</AppModal>

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

<AppModal
  open={blockGuideOpen}
  title={selectedBlockGuide?.title ?? "Block Guide"}
  cancelText=""
  onCancel={() => setBlockGuideOpen(false)}
>
  {selectedBlockGuide ? (
    <div className="mt-5 flex max-h-[72vh] flex-col">
      <div className="overflow-y-auto pr-2">
        <div className="mb-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Block Guide
          </div>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            {selectedBlockGuide.subtitle}
          </p>
        </div>

        <div className="space-y-5">
          {selectedBlockGuide.sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <h3 className="text-base font-semibold text-neutral-950">
                {section.title}
              </h3>

              {section.body ? (
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {section.body}
                </p>
              ) : null}

              {section.bullets?.length ? (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-neutral-600">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-5">
        <button
          type="button"
          onClick={() => setBlockGuideOpen(false)}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-black px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          Close
        </button>
      </div>
    </div>
  ) : null}
</AppModal>
<AppModal
  open={Boolean(textureUploadError)}
  title="Texture Upload Error"
  cancelText="OK"
  onCancel={() => setTextureUploadError("")}
>
  <p className="text-sm text-neutral-700">{textureUploadError}</p>
</AppModal>
<AppModal
  open={Boolean(editorUploadError)}
  title="Upload Error"
  cancelText="OK"
  onCancel={() => setEditorUploadError("")}
>
  <p className="text-sm text-neutral-700">{editorUploadError}</p>
</AppModal>

</div>
  );
}