import type { CSSProperties } from "react";
import type { BuilderDraft, TextStyle } from "@/lib/templates/builder";
import type { DraftWithPageExtras, SelectedContext, InspectorFocusTarget } from "./types";
import type { CanvasGridItem } from "@/components/templates/design-editors/shared/GridCanvas";

import {
  PAGE_DESCRIPTION_BLOCK_ID,
  PAGE_SUBTEXT_BLOCK_ID,
  PAGE_SUBTITLE_BLOCK_ID,
  PAGE_TITLE_BLOCK_ID,
} from "@/components/templates/design-editors/shared/EditorSelection";

import {
  buildPageCanvasItems,
} from "@/components/builder/canvas/pageCanvasBuilder";

import {
  normalizeCanvasItems,
} from "@/components/builder/canvas/canvasItemTransforms";

import { getMetadata } from "@/components/builder/metadata/metadataResolver";
import { FONT_FAMILY_MAP } from "./constants";

export function cloneDraft<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function resolveFontFamily(fontFamily?: string) {
  if (!fontFamily || fontFamily === "inherit") return "inherit";
  return FONT_FAMILY_MAP[fontFamily] ?? fontFamily;
}

export function makeClientId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function buildCanvasItems(
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

export function isPageBlockId(blockId: string) {
  return (
    blockId === PAGE_TITLE_BLOCK_ID ||
    blockId === PAGE_SUBTITLE_BLOCK_ID ||
    blockId === PAGE_SUBTEXT_BLOCK_ID ||
    blockId === PAGE_DESCRIPTION_BLOCK_ID
  );
}

export function topBarSliderWrapClass() {
  return "inline-flex h-11 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 text-xs text-white";
}

export function topBarSliderClass() {
  return "w-24 accent-blue-500";
}

export function topBarButtonClass(active = false, disabled = false, danger = false) {
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

export function topBarFieldClass(widthClass = "") {
  return [
    "h-11 rounded-md border border-white/10 bg-white px-3 text-sm text-black outline-none transition",
    widthClass,
  ].join(" ");
}

export function topBarColorClass(disabled = false) {
  return [
    "h-11 w-16 shrink-0 rounded-md border p-1 transition",
    disabled
      ? "cursor-not-allowed border-white/5 bg-white/[0.03] opacity-40"
      : "border-white/10 bg-white/5",
  ].join(" ");
}

export function infoPillClass() {
  return "inline-flex h-11 items-center rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white/85";
}

export function bottomCategoryClass(active: boolean) {
  return [
    "inline-flex h-12 items-center gap-2 rounded-md border px-4 text-sm font-medium transition",
    active
      ? "border-blue-500 bg-blue-600 text-white"
      : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100",
  ].join(" ");
}

export function actionButtonClass(primary = false) {
  return [
    "inline-flex h-12 items-center justify-center rounded-md border px-4 text-sm font-medium transition",
    primary
      ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
      : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100",
  ].join(" ");
}

export function toolButtonClass() {
  return "inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-neutral-300 bg-white px-2 text-sm text-neutral-700 transition hover:bg-neutral-100";
}

export function inspectorCardClass() {
  return "rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm";
}

export function inspectorLabelClass() {
  return "text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500";
}

export function inspectorInputClass() {
  return "mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none";
}

export function inspectorTextareaClass() {
  return "mt-2 min-h-[120px] w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 outline-none";
}

export function toolSetButtonClass(kind: "front" | "back" | "remove") {
  if (kind === "remove") {
    return "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-sm text-red-700 hover:bg-red-100";
  }

  return "inline-flex h-8 items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-50";
}

export function getToolGlyph(label: string) {
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

export function getSelectedCanvasBlockId(context: SelectedContext): string | null {
  if (context.kind === "none") return null;
  return context.blockId;
}

export function getSelectedTextValue(
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

export function getInlineTextStyle(style?: TextStyle) {
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

export function getPageAppearanceKey(
  blockId: string,
): "title" | "subtitle" | "subtext" | "description" | null {
  if (blockId === PAGE_TITLE_BLOCK_ID) return "title";
  if (blockId === PAGE_SUBTITLE_BLOCK_ID) return "subtitle";
  if (blockId === PAGE_SUBTEXT_BLOCK_ID) return "subtext";
  if (blockId === PAGE_DESCRIPTION_BLOCK_ID) return "description";
  return null;
}

export function isTextSelection(context: SelectedContext) {
  return (
    context.kind === "pageText" ||
    context.kind === "label" ||
    context.kind === "textFx"
  );
}

import { MAX_CANVAS_ZOOM, MIN_CANVAS_ZOOM } from "./constants";
export function clampCanvasZoom(value: number) {
  return Math.max(MIN_CANVAS_ZOOM, Math.min(MAX_CANVAS_ZOOM, value));
}

export function inspectorSectionId(target: InspectorFocusTarget) {
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

export function getPageSurfaceStyle(args: {
  draft: BuilderDraft;
  designKey: string;
  metadata: ReturnType<typeof getMetadata>;
  getCanvasInnerBackgroundStyle: (
    draft: BuilderDraft,
    designKey: string,
    metadata: ReturnType<typeof getMetadata>,
  ) => CSSProperties;
}): CSSProperties {
  const { draft, designKey, metadata, getCanvasInnerBackgroundStyle } = args;
  const draftWithExtras = draft as DraftWithPageExtras;
  const pageBackgroundImage = draftWithExtras.pageBackgroundImage?.trim() || "";
  const pageBackgroundImageFit = draftWithExtras.pageBackgroundImageFit ?? "zoom";

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
}