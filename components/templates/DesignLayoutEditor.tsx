"use client";

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
  ThreadMessage,
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
};

type DraftWithPageExtras = BuilderDraft & {
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
  | "Marketing"
  | "Social"
  | "Utilities";

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
  "Marketing",
  "Social",
  "Utilities",
];

const CATEGORY_BUTTONS: Record<
  BottomCategory,
  Array<
    | { kind: "page"; label: string; type: PageBlockType }
    | { kind: "shape"; label: string; type: ShapeType }
    | { kind: "block"; label: string; type: BuilderBlockType }
    | { kind: "block", label: "Input Field", type: "form_field" }
  >
> = {
  Text: [
  { kind: "page", label: "Title", type: "title" },
  { kind: "page", label: "Subtitle", type: "subtitle" },
  { kind: "page", label: "Tagline", type: "tagline" },
  { kind: "page", label: "Description", type: "description" },
  { kind: "block", label: "Label", type: "label" },

  // ✅ ADD THIS
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

const MIN_CANVAS_ZOOM = 50;
const MAX_CANVAS_ZOOM = 200;
const CANVAS_ZOOM_STEP = 10;
const PREVIEW_MESSAGE_TYPE = "ko-host-preview-draft";
const PREVIEW_READY_MESSAGE_TYPE = "ko-host-preview-ready";

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

function topBarSliderWrapClass() {
  return "inline-flex h-11 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 text-xs text-white";
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
    return { kind: "label", blockId, label: "Label" };
  }

  if (block.type === "text_fx") {
    return { kind: "textFx", blockId, label: block.label || "TextFX" };
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
    "h-11 rounded-md border border-white/10 bg-white px-3 text-sm text-black outline-none transition",
    widthClass,
  ].join(" ");
}

function topBarColorClass(disabled = false) {
  return [
    "h-11 w-16 shrink-0 rounded-md border p-1 transition",
    disabled
      ? "cursor-not-allowed border-white/5 bg-white/[0.03] opacity-40"
      : "border-white/10 bg-white/5",
  ].join(" ");
}

function infoPillClass() {
  return "inline-flex h-11 items-center rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white/85";
}

function bottomCategoryClass(active: boolean) {
  return [
    "inline-flex h-12 items-center gap-2 rounded-md border px-4 text-sm font-medium transition",
    active
      ? "border-blue-500 bg-blue-600 text-white"
      : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100",
  ].join(" ");
}

function actionButtonClass(primary = false) {
  return [
    "inline-flex h-12 items-center justify-center rounded-md border px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
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
  if (label === "Marketing") return "📣";
  if (label === "Social") return "💬";
  if (label === "Utilities") return "⚙";
  if (label === "Title") return "T";
  if (label === "Subtitle") return "T";
  if (label === "Tagline") return "T";
  if (label === "Description") return "¶";
  if (label === "Label") return "T";
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
  if (label === "Carousel") return "⇄";
  if (label === "Input Field") return "⌨";
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

  if (context.kind === "label" || context.kind === "textFx") {
    const block = draft.blocks.find((item) => item.id === context.blockId);

    if (block?.type === "label" || block?.type === "text_fx") {
      return block.data.text ?? "";
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
    lineHeight: 1.25,
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
}: Props) {
const [selection, setSelection] = useState(createEmptySelection());
const [activeCategory, setActiveCategory] = useState<BottomCategory>("Text");
const [openToolMenu, setOpenToolMenu] = useState<BottomCategory | null>(null);
const [inspectorCollapsed, setInspectorCollapsed] = useState(false);
const [aiLoading, setAiLoading] = useState(false);
const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
const [showAiSuggestions, setShowAiSuggestions] = useState(false);
const [inspectorFocusTarget, setInspectorFocusTarget] =
  useState<InspectorFocusTarget>(null);
const [canvasZoom, setCanvasZoom] = useState(100);
const [undoStack, setUndoStack] = useState<BuilderDraft[]>([]);
const [redoStack, setRedoStack] = useState<BuilderDraft[]>([]);

const [isSavingDraft, setIsSavingDraft] = useState(false);
const [isPublishing, setIsPublishing] = useState(false);
const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const isHistoryActionRef = useRef(false);
  const lastDraftRef = useRef<BuilderDraft>(cloneDraft(draft));

  const dockedScrollRef = useRef<HTMLDivElement | null>(null);
  const bottomBarRef = useRef<HTMLDivElement | null>(null);
  const toolMenuRef = useRef<HTMLDivElement | null>(null);
  const pollQuestionInputRef = useRef<HTMLTextAreaElement | null>(null);
  const pollOptionInputRefs = useRef<Record<string, HTMLInputElement | null>>(
    {},
  );

  const rsvpHeadingInputRef = useRef<HTMLInputElement | null>(null);

  const countdownHeadingInputRef = useRef<HTMLInputElement | null>(null);
  const countdownTargetInputRef = useRef<HTMLInputElement | null>(null);
  const countdownCompletedInputRef = useRef<HTMLInputElement | null>(null);

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
  selectedBlockFromDraft?.type === "text_fx"
    ? (selectedBlockFromDraft.data.style ?? {})
    : getSelectionTextStyle(draft, selection);
  const selectedAppearance = getSelectionBlockAppearance(draft, selection);
  const resolvedPageColor = getResolvedPageColor(draft, designKey, metadata);
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
  selectedContext.kind === "imageCarousel" ||
  selectedBlock?.type === "thread";

  const showAppearanceControls =
  selectedContext.kind === "label" ||
  selectedContext.kind === "image" ||
  selectedContext.kind === "imageCarousel" ||
  selectedContext.kind === "shape" ||
  selectedBlock?.type === "thread";

const showBorderWidthRadiusControls =
  selectedContext.kind === "label" ||
  selectedContext.kind === "image" ||
  selectedContext.kind === "imageCarousel" ||
  selectedContext.kind === "shape" ||
  selectedBlock?.type === "thread";

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

  const pageSurfaceStyle = useMemo(() => {
    const backgroundColor = getCanvasInnerBackgroundStyle(
      draft,
      designKey,
      metadata,
    ).backgroundColor;

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
    if (!saveFeedback) return;

    const timeout = window.setTimeout(() => {
      setSaveFeedback(null);
    }, 2500);

    return () => window.clearTimeout(timeout);
  }, [saveFeedback]);

  async function handleSaveDraftClick() {
    if (!onSaveDraft || isSavingDraft) return;

    try {
      setIsSavingDraft(true);
      setSaveFeedback("Saving draft...");

      await onSaveDraft(cloneDraft(draft));

      setSaveFeedback("Draft saved");
    } catch (error) {
      console.error("Save draft failed:", error);
      setSaveFeedback("Failed to save draft");
    } finally {
      setIsSavingDraft(false);
    }
  }

  async function handlePublishButtonClick() {
    if (isPublishing) return;

    try {
      setIsPublishing(true);

      if (onPublishClick) {
        await Promise.resolve(onPublishClick());
        return;
      }

      if (publishHref) {
        window.location.href = publishHref;
        return;
      }

      console.warn("Publish action missing: no onPublishClick or publishHref provided.");
    } catch (error) {
      console.error("Publish action failed:", error);
    } finally {
      setIsPublishing(false);
    }
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
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (!imageFiles.length) return;

    const images: GalleryImage[] = await Promise.all(
      imageFiles.map(async (file) => ({
        id: makeClientId("gallery"),
        url: await readFileAsDataUrl(file),
      })),
    );

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
            if (block.id !== blockId || block.type !== "image") return block;

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
          }),
        }));
      },
    });
  }

  async function uploadGalleryImagesToBlock(blockId: string) {
    await openImagePicker({
      multiple: true,
      onSelect: async (files) => {
        const images: GalleryImage[] = await Promise.all(
          files.map(async (file) => ({
            id: makeClientId("gallery"),
            url: await readFileAsDataUrl(file),
          })),
        );

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
    const confirmed = window.confirm(
      "Remove all blocks from the canvas? This will clear all page text blocks and custom blocks.",
    );

    if (!confirmed) return;

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

  let didSend = false;

  const sendPayload = () => {
    if (previewWindow.closed || didSend) return;

    previewWindow.postMessage(
      {
        type: PREVIEW_MESSAGE_TYPE,
        payload,
      },
      window.location.origin,
    );

    didSend = true;

    try {
      previewWindow.focus();
    } catch {
      // ignore focus errors
    }
  };

  const handlePreviewReady = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    if (event.source !== previewWindow) return;

    const data = event.data as { type?: string } | undefined;
    if (!data || data.type !== PREVIEW_READY_MESSAGE_TYPE) return;

    sendPayload();
    cleanup();
  };

  const cleanup = () => {
    window.removeEventListener("message", handlePreviewReady);
    window.clearInterval(closedCheckTimer);
    window.clearTimeout(fallbackSendTimer);
  };

  window.addEventListener("message", handlePreviewReady);

  const closedCheckTimer = window.setInterval(() => {
    if (previewWindow.closed) {
      cleanup();
    }
  }, 500);

  // Fallback in case the ready signal is missed for any reason.
  const fallbackSendTimer = window.setTimeout(() => {
    sendPayload();
    cleanup();
  }, 5000);
}

  function focusInspectorForBlock(target: InspectorFocusTarget) {
    if (!target) return;
    setSelection(selectionFromCanvasBlockId(target.blockId));
    setInspectorFocusTarget(target);
  }

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
        className="h-full w-full resize-none bg-transparent outline-none"
        placeholder={item.label || item.type}
        style={getInlineTextStyle(pageTextStyle)}
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
        className="h-full w-full resize-none bg-transparent outline-none"
        placeholder="Label"
        style={getInlineTextStyle(block.data.style)}
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
          title="Double-click or drag images here"
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

return (
  <div className="flex min-h-screen flex-col bg-[#f3f3f3]">
    <div className="sticky top-0 z-50 border-b border-black/10 bg-[#2f3541] px-6 py-3 text-white shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            className={topBarButtonClass(false, undoStack.length === 0)}
            title="Undo"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
          >
            ↶
          </button>

          <button
            type="button"
            className={topBarButtonClass(false, redoStack.length === 0)}
            title="Redo"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
          >
            ↷
          </button>

          <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

          <div className={infoPillClass()}>{selectedContext.label}</div>

          <button
            type="button"
            className={topBarButtonClass(false, !showTextControls)}
            onClick={handleAioClick}
            disabled={!showTextControls}
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
          {isTextFxSelected ? (
            <>
              <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

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


          {showTextControls ? (
  <>
    <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

    <button
      type="button"
      className={topBarButtonClass(selectedBold)}
      onClick={() => applyStylePatch({ bold: !selectedBold })}
      title="Bold"
    >
      B
    </button>

    <button
      type="button"
      className={topBarButtonClass(selectedItalic)}
      onClick={() => applyStylePatch({ italic: !selectedItalic })}
      title="Italic"
    >
      I
    </button>

    <button
      type="button"
      className={topBarButtonClass(selectedUnderline)}
      onClick={() => applyStylePatch({ underline: !selectedUnderline })}
      title="Underline"
    >
      U
    </button>

    <button
      type="button"
      className={topBarButtonClass(selectedStrike)}
      onClick={() => applyStylePatch({ strike: !selectedStrike })}
      title="Strikethrough"
    >
      S̶
    </button>

    <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

    <button
      type="button"
      className={topBarButtonClass(false)}
      onClick={() => applyStylePatch({ align: "left" })}
      title="Align left"
    >
      ≡
    </button>

    <button
      type="button"
      className={topBarButtonClass(false)}
      onClick={() => applyStylePatch({ align: "center" })}
      title="Align center"
    >
      ≣
    </button>

    <button
      type="button"
      className={topBarButtonClass(false)}
      onClick={() => applyStylePatch({ align: "right" })}
      title="Align right"
    >
      ☰
    </button>

    <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

    <select
      value={selectedStyle.fontFamily ?? "inherit"}
      onChange={(e) =>
        applyStylePatch({ fontFamily: e.target.value })
      }
      className={topBarFieldClass("min-w-[190px]")}
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
      className={topBarFieldClass("w-24")}
      title="Font size"
    />

    <input
      type="color"
      value={selectedStyle.color ?? "#111827"}
      onChange={(e) => applyStylePatch({ color: e.target.value })}
      className={topBarColorClass(false)}
      title="Text color"
    />

    {selectedContext.kind === "pageText" ? (
      <>
        <input
          type="color"
          value={
            selectedPageBackgroundColor === "transparent"
              ? "#ffffff"
              : selectedPageBackgroundColor
          }
          onChange={(e) =>
            applyPageTextBackgroundColor(e.target.value)
          }
          className={topBarColorClass(false)}
          title="Text box background color"
        />

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
  </>
) : null}

{showAppearanceControls ? (
  <>
    <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

    <input
      type="color"
      value={selectedAppearance.backgroundColor ?? "#ffffff"}
      onChange={(e) =>
        applyAppearancePatch({ backgroundColor: e.target.value })
      }
      className={topBarColorClass(false)}
      title="Fill color"
    />

    <button
      type="button"
      className={topBarButtonClass(
        !selectedAppearance.backgroundColor ||
          selectedAppearance.backgroundColor === "transparent",
      )}
      onClick={() =>
        applyAppearancePatch({ backgroundColor: "transparent" })
      }
      title="Transparent fill"
    >
      <Image
        src="/icons/transparent_fill_icon.png"
        alt="Transparent fill"
        width={30}
        height={30}
        className="pointer-events-none"
      />
    </button>

    <input
      type="color"
      value={selectedAppearance.borderColor ?? "#d1d5db"}
      onChange={(e) =>
        applyAppearancePatch({ borderColor: e.target.value })
      }
      className={topBarColorClass(false)}
      title="Border color"
    />

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
  </>
) : null}
</div>

<div className="flex shrink-0 items-center gap-2">
  {saveFeedback ? (
    <div className={infoPillClass()}>{saveFeedback}</div>
  ) : null}

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

  <div className="mx-1 h-8 w-px shrink-0 bg-white/15" />

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
    value={(draft as DraftWithPageExtras).pageBackgroundImageFit ?? "zoom"}
    onChange={(e) =>
      updatePageBackgroundImageFit(
        e.target.value as "clip" | "zoom" | "stretch",
      )
    }
    className={topBarFieldClass("w-[120px]")}
    title="Page background fit"
  >
    <option value="clip">Clip</option>
    <option value="zoom">Zoom</option>
    <option value="stretch">Stretch</option>
  </select>

  <div className="mx-1 h-8 w-px shrink-0 bg-white/15" />

  <input
    type="color"
    value={resolvedPageColor}
    onChange={(e) =>
      setDraft((prev) => ({
        ...(prev as DraftWithPageExtras),
        pageColor: e.target.value,
      }))
    }
    className={topBarColorClass(false)}
    title="Page color"
  />

  <button
    type="button"
    className={topBarButtonClass(false, canvasZoom <= MIN_CANVAS_ZOOM)}
    onClick={zoomOutCanvas}
    disabled={canvasZoom <= MIN_CANVAS_ZOOM}
    title="Zoom out canvas"
  >
    −
  </button>

  <button
    type="button"
    className={topBarButtonClass(false, canvasZoom >= MAX_CANVAS_ZOOM)}
    onClick={zoomInCanvas}
    disabled={canvasZoom >= MAX_CANVAS_ZOOM}
    title="Zoom in canvas"
  >
    +
  </button>

  <div className={infoPillClass()}>{canvasZoom}%</div>
</div>
        </div>
      </div>

      {showAiSuggestions ? (
        <div className="fixed inset-0 z-[70] bg-black/40 p-6">
          <div className="mx-auto mt-20 max-w-2xl rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  Artificial Intelligent Output
                </div>
                <div className="mt-1 text-lg font-semibold text-neutral-900">
                  Suggestions for {selectedContext.label}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAiSuggestions(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
              >
                ×
              </button>
            </div>

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
          </div>
        </div>
      ) : null}

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
            <div className="flex w-full justify-center px-4 py-4">
              <div
                className="w-full rounded-[8px]"
                style={
                  {
                    zoom: canvasZoomScale,
                  } as CSSProperties
                }
              >
                <GridCanvas
                  blocks={canvasItems}
                  selection={selection as any}
                  onSelect={handleCanvasSelect as any}
                  onMoveBlock={handleMoveBlock}
                  onResizeBlock={handleResizeBlock}
                  onBringToFront={handleBringToFront}
                  onRemoveBlock={removeCanvasBlock}
                  onCreateToolDrop={handleCreateToolDrop}
                  renderBlockPreview={renderCanvasPreview}
                  isItemSelected={(blockId, nextSelection) =>
                    isCanvasBlockSelected(nextSelection as any, blockId)
                  }
                  dockedScrollRef={dockedScrollRef}
                  pageSurfaceStyle={pageSurfaceStyle}
                />
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
                    <div className={inspectorCardClass()}>
                      <div className={inspectorLabelClass()}>Text Value</div>

                      <div className="mt-4">
                        <textarea
                          value={selectedTextValue}
                          onChange={(e) =>
                            updateTextByCanvasId(
                              selectedCanvasBlockId || "",
                              e.target.value,
                            )
                          }
                          className={inspectorTextareaClass()}
                          placeholder="Enter text..."
                        />
                      </div>
                    </div>

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
      <div className={inspectorLabelClass()}>Label</div>
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
      <div className={inspectorLabelClass()}>Placeholder</div>
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
  <div className={inspectorLabelClass()}>Submit Button Text</div>
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
      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
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
      </label>
    </div>
  </div>
) : null}

                {selectedBlock?.type === "countdown" ? (
                  <div id="inspector-countdown" className={inspectorCardClass()}>
                    <div className={inspectorLabelClass()}>Countdown</div>

                    <div className="mt-4">
                      <div className={inspectorLabelClass()}>Heading</div>
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
    <div className={inspectorLabelClass()}>Thread / Social</div>

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
      className={inspectorInputClass()}
    />
  </div>
</div>

    <div className="mt-5">
  <div className={inspectorLabelClass()}>Composer</div>

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
                  postButtonStyle: e.target.value as "solid" | "outline" | "soft",
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
      <div className={inspectorLabelClass()}>Sample Messages</div>

      <div className="mt-3 space-y-3">
        {(selectedBlock.data.messages && selectedBlock.data.messages.length > 0
          ? selectedBlock.data.messages
          : [
              {
                id: makeClientId("threadmsg"),
                name: selectedBlock.data.allowAnonymous ? "Anon" : "Jordan",
                message: "Looking forward to this.",
              },
              {
                id: makeClientId("threadmsg"),
                name: selectedBlock.data.allowAnonymous ? "Anon" : "Taylor",
                message: "Can’t wait to join the conversation.",
              },
            ]
        ).map((message: ThreadMessage, index: number) => (
          <div
            key={message.id}
            className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-sm font-medium text-neutral-900">
                Message {index + 1}
              </div>

              <button
                type="button"
                className={toolSetButtonClass("remove")}
                onClick={() =>
                  updateSelectedBlock((block) =>
                    block.type !== "thread"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            messages:
                              (block.data.messages ?? []).length > 1
                                ? (block.data.messages ?? []).filter(
                                    (entry) => entry.id !== message.id,
                                  )
                                : [],
                          },
                        },
                  )
                }
                title="Remove message"
              >
                ×
              </button>
            </div>

            <div>
  <div className={inspectorLabelClass()}>Name</div>
  <input
  type="text"
  maxLength={60}
  value={message.name}
  onChange={(e) =>
    updateSelectedBlock((block) => {
      if (block.type !== "thread") return block;

      const currentMessages =
        block.data.messages && block.data.messages.length > 0
          ? block.data.messages
          : [
              {
                id: message.id,
                name: message.name,
                message: message.message,
              },
            ];

      const normalizedMessages =
        currentMessages.some((entry) => entry.id === message.id)
          ? currentMessages
          : [...currentMessages, message];

      return {
        ...block,
        data: {
          ...block.data,
          messages: normalizedMessages.map((entry) =>
            entry.id === message.id
              ? { ...entry, name: e.target.value.slice(0, 60) }
              : entry,
          ),
        },
      };
    })
  }
  className={inspectorInputClass()}
/>
</div>

<div className="mt-4">
  <div className={inspectorLabelClass()}>Message</div>
  <textarea
    value={message.message}
    maxLength={200}
    onChange={(e) =>
      updateSelectedBlock((block) => {
        if (block.type !== "thread") return block;

        const currentMessages =
          block.data.messages && block.data.messages.length > 0
            ? block.data.messages
            : [
                {
                  id: message.id,
                  name: message.name,
                  message: message.message,
                },
              ];

        const normalizedMessages =
          currentMessages.some((entry) => entry.id === message.id)
            ? currentMessages
            : [...currentMessages, message];

        return {
          ...block,
          data: {
            ...block.data,
            messages: normalizedMessages.map((entry) =>
              entry.id === message.id
                ? { ...entry, message: e.target.value.slice(0, 200) }
                : entry,
            ),
          },
        };
      })
    }
    className={inspectorTextareaClass()}
  />
  <div className="mt-1 text-right text-xs text-neutral-500">
    {(message.message ?? "").length}/200
  </div>
</div>
</div>
        ))}

        <button
          type="button"
          className={toolSetButtonClass("front")}
          onClick={() =>
            updateSelectedBlock((block) =>
              block.type !== "thread"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      messages: [
                        ...(block.data.messages ?? []),
                        {
                          id: makeClientId("threadmsg"),
                          name: block.data.allowAnonymous ? "Anon" : "Guest",
                          message: "New message",
                        },
                      ],
                    },
                  },
            )
          }
        >
          Add Message
        </button>
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
                          {Math.round((selectedBlock.data.image.zoom ?? 1) * 100)}
                          %
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
                    </div>
                  </div>
                ) : null}

                {selectedBlock?.type === "gallery" ? (
                  <div className={inspectorCardClass()}>
                    <div className={inspectorLabelClass()}>Gallery</div>

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
                        className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
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
                              onClick={() => {
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
                              onClick={() => {
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
                              onClick={() => removeCanvasBlock(tool.id)}
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

  <div className="relative flex items-center justify-between gap-6 border-b border-black/10 px-6 py-2">
    <div className="flex flex-wrap items-center gap-2">
      {CATEGORY_ORDER.map((category) => (
        <div key={category} className="relative">
          <button
            type="button"
            onClick={() => toggleToolMenu(category)}
            className={bottomCategoryClass(activeCategory === category)}
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
                {CATEGORY_BUTTONS[category].map((tool) => (
                  <button
                    key={`${category}-${tool.kind}-${tool.type}`}
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

        <div className="flex items-center gap-2">
      <button
        type="button"
        className={actionButtonClass(false)}
        onClick={openPreviewWindow}
      >
        Open Preview
      </button>

      <button
  type="button"
  className={actionButtonClass(true)}
  onClick={() => void handleSaveDraftClick()}
  disabled={isSavingDraft}
  title={isSavingDraft ? "Saving draft..." : "Save draft"}
>
  {isSavingDraft ? "Saving..." : "Save Draft"}
</button>

{(publishHref || onPublishClick) ? (
  <button
    type="button"
    onClick={() => void handlePublishButtonClick()}
    disabled={isPublishing}
    className="inline-flex h-12 items-center justify-center rounded-md border border-neutral-950 bg-neutral-950 px-4 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
    title={isPublishing ? "Opening publish flow..." : publishLabel}
  >
    {isPublishing ? "Opening..." : publishLabel}
  </button>
) : null}
    </div>
  </div>
</div>
    </div>
  );
}