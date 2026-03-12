"use client";

import { useMemo, useState } from "react";
import ToolboxPanel, {
  type PageBlockType,
} from "@/components/templates/design-editors/shared/ToolboxPanel";
import GridCanvas, {
  type CanvasGridItem,
} from "@/components/templates/design-editors/shared/GridCanvas";

import type { EditorSelection } from "@/components/templates/design-editors/shared/EditorSelection";

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
  BuilderBlockType,
  BuilderDraft,
  GridPlacement,
  MicrositeBlock,
  TextStyle,
  LinkItem,
  PollOption,
  FaqItem,
} from "@/lib/templates/builder";

import {
  addBlockTypeToDraft,
  addFaqItem,
  addNavigationLink,
  addPollOption,
  appendGalleryImages,
  applyStylePatchToSelection,
  getHeroButtonBlock,
  getImageBlocks,
  getLabelBlocks,
  getLinksBlock,
  getSelectionTextStyle,
  readFileAsDataUrl,
  removeBlockFromDraft,
  removeFaqItem,
  removeNavigationLink,
  removePollOption,
  updateCountdownField,
  updateCtaBlockField,
  updateFaqItem,
  updateGalleryGrid,
  updateImageBlockAlt,
  updateImageBlockUrl,
  updateLabelBlockText,
  updateLinkItem,
  updateLinksHeading,
  updatePollOptionText,
  updatePollQuestion,
  updateRsvpHeading,
  updateRsvpToggle,
  updateThreadField,
  updateThreadToggle,
} from "@/components/templates/design-editors/shared/editorUtils";

const GRID_COLUMNS = 12;
const GRID_STEP = 0.5;

type PageVisibility = {
  title: boolean;
  subtitle: boolean;
  subtext: boolean;
  description: boolean;
};

type GridPlacementWithLayer = GridPlacement & {
  zIndex?: number;
};

type DraftWithExtras = BuilderDraft & {
  description?: string;
  descriptionStyle?: TextStyle;
  pageColor?: string | null;
  pageVisibility?: Partial<PageVisibility>;
  pageElements?: {
    title?: Partial<GridPlacementWithLayer>;
    subtitle?: Partial<GridPlacementWithLayer>;
    subtext?: Partial<GridPlacementWithLayer>;
    description?: Partial<GridPlacementWithLayer>;
  };
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function snapToHalf(value: number) {
  return Math.round(value / GRID_STEP) * GRID_STEP;
}

function coerceDraft(draft: BuilderDraft): DraftWithExtras {
  return draft as DraftWithExtras;
}

function getDescriptionValue(draft: BuilderDraft) {
  return coerceDraft(draft).description || "";
}

function getDescriptionStyle(draft: BuilderDraft) {
  return coerceDraft(draft).descriptionStyle;
}

function getBackgroundImageValue(draft: BuilderDraft) {
  return draft.pageBackground || "";
}

function getPageColorValue(draft: BuilderDraft) {
  return coerceDraft(draft).pageColor || "#0f1115";
}

function getPageVisibility(draft: BuilderDraft): PageVisibility {
  const visibility = coerceDraft(draft).pageVisibility ?? {};
  return {
    title: visibility.title !== false,
    subtitle: visibility.subtitle !== false,
    subtext: visibility.subtext !== false,
    description: visibility.description !== false,
  };
}

function isPageVisible(
  draft: BuilderDraft,
  key: keyof PageVisibility,
): boolean {
  return getPageVisibility(draft)[key];
}

function normalizeGrid(
  grid: Partial<GridPlacementWithLayer> | undefined,
  index: number,
): GridPlacementWithLayer {
  const rawColStart = Number(grid?.colStart);
  const rawRowStart = Number(grid?.rowStart);
  const rawColSpan = Number(grid?.colSpan);
  const rawRowSpan = Number(grid?.rowSpan);
  const rawZIndex = Number(grid?.zIndex);

  const colSpan = clamp(
    snapToHalf(Number.isFinite(rawColSpan) ? rawColSpan : 12),
    GRID_STEP,
    GRID_COLUMNS,
  );
  const rowSpan = Math.max(
    GRID_STEP,
    snapToHalf(Number.isFinite(rawRowSpan) ? rawRowSpan : 1),
  );
  const maxColStart = Math.max(1, GRID_COLUMNS - colSpan + 1);

  return {
    colStart: clamp(
      snapToHalf(Number.isFinite(rawColStart) ? rawColStart : 1),
      1,
      maxColStart,
    ),
    rowStart: Math.max(
      1,
      snapToHalf(Number.isFinite(rawRowStart) ? rawRowStart : index + 1),
    ),
    colSpan,
    rowSpan,
    zIndex: Number.isFinite(rawZIndex) ? rawZIndex : index + 1,
  };
}

function normalizeCanvasItems(items: CanvasGridItem[]) {
  return items.map((item, index) => ({
    ...item,
    grid: normalizeGrid(
      item.grid as Partial<GridPlacementWithLayer> | undefined,
      index + 1,
    ),
  }));
}

function moveCanvasItemToCell(
  items: CanvasGridItem[],
  blockId: string,
  patch: { colStart: number; rowStart: number },
) {
  return normalizeCanvasItems(
    items.map((item) => {
      if (item.id !== blockId) return item;

      const grid = normalizeGrid(
        item.grid as Partial<GridPlacementWithLayer> | undefined,
        1,
      );

      return {
        ...item,
        grid: {
          ...grid,
          colStart: clamp(
            snapToHalf(patch.colStart),
            1,
            Math.max(1, GRID_COLUMNS - grid.colSpan + 1),
          ),
          rowStart: Math.max(1, snapToHalf(patch.rowStart)),
        },
      };
    }),
  );
}

function resizeCanvasItem(
  items: CanvasGridItem[],
  blockId: string,
  patch: { colSpan?: number; rowSpan?: number },
) {
  return normalizeCanvasItems(
    items.map((item) => {
      if (item.id !== blockId) return item;

      const grid = normalizeGrid(
        item.grid as Partial<GridPlacementWithLayer> | undefined,
        1,
      );

      const nextColSpan = clamp(
        snapToHalf(patch.colSpan ?? grid.colSpan),
        GRID_STEP,
        GRID_COLUMNS - grid.colStart + 1,
      );

      const nextRowSpan = Math.max(
        GRID_STEP,
        snapToHalf(patch.rowSpan ?? grid.rowSpan),
      );

      return {
        ...item,
        grid: {
          ...grid,
          colSpan: nextColSpan,
          rowSpan: nextRowSpan,
        },
      };
    }),
  );
}

function bringCanvasItemToFront(items: CanvasGridItem[], blockId: string) {
  const highest = items.reduce((max, item, index) => {
    const normalized = normalizeGrid(
      item.grid as Partial<GridPlacementWithLayer> | undefined,
      index + 1,
    );
    return Math.max(max, normalized.zIndex ?? 1);
  }, 1);

  return normalizeCanvasItems(
    items.map((item, index) => {
      if (item.id !== blockId) return item;

      const normalized = normalizeGrid(
        item.grid as Partial<GridPlacementWithLayer> | undefined,
        index + 1,
      );

      return {
        ...item,
        grid: {
          ...normalized,
          zIndex: highest + 1,
        },
      };
    }),
  );
}

function getDefaultPageElementGrid(
  key: "title" | "subtitle" | "subtext" | "description",
): GridPlacementWithLayer {
  if (key === "title") {
    return { colStart: 1, rowStart: 1, colSpan: 12, rowSpan: 2, zIndex: 1 };
  }
  if (key === "subtitle") {
    return { colStart: 1, rowStart: 3, colSpan: 10, rowSpan: 1, zIndex: 2 };
  }
  if (key === "subtext") {
    return { colStart: 1, rowStart: 4, colSpan: 6, rowSpan: 1, zIndex: 3 };
  }
  return { colStart: 1, rowStart: 5, colSpan: 8, rowSpan: 2, zIndex: 4 };
}

function buildPageCanvasItems(draft: BuilderDraft): CanvasGridItem[] {
  const visibility = getPageVisibility(draft);
  const pageElements = coerceDraft(draft).pageElements ?? {};
  const items: CanvasGridItem[] = [];

  if (visibility.title) {
    items.push({
      id: PAGE_TITLE_BLOCK_ID,
      type: "page:title",
      label: "Title",
      grid: pageElements.title ?? getDefaultPageElementGrid("title"),
    });
  }

  if (visibility.subtitle) {
    items.push({
      id: PAGE_SUBTITLE_BLOCK_ID,
      type: "page:subtitle",
      label: "Subtitle",
      grid: pageElements.subtitle ?? getDefaultPageElementGrid("subtitle"),
    });
  }

  if (visibility.subtext) {
    items.push({
      id: PAGE_SUBTEXT_BLOCK_ID,
      type: "page:subtext",
      label: "Tagline",
      grid: pageElements.subtext ?? getDefaultPageElementGrid("subtext"),
    });
  }

  if (visibility.description) {
    items.push({
      id: PAGE_DESCRIPTION_BLOCK_ID,
      type: "page:description",
      label: "Description",
      grid:
        pageElements.description ?? getDefaultPageElementGrid("description"),
    });
  }

  return items;
}

function applyCanvasItemsToDraft(
  prev: BuilderDraft,
  canvasItems: CanvasGridItem[],
): BuilderDraft {
  const draft = coerceDraft(prev);

  const titleGrid = canvasItems.find(
    (item) => item.id === PAGE_TITLE_BLOCK_ID,
  )?.grid;
  const subtitleGrid = canvasItems.find(
    (item) => item.id === PAGE_SUBTITLE_BLOCK_ID,
  )?.grid;
  const subtextGrid = canvasItems.find(
    (item) => item.id === PAGE_SUBTEXT_BLOCK_ID,
  )?.grid;
  const descriptionGrid = canvasItems.find(
    (item) => item.id === PAGE_DESCRIPTION_BLOCK_ID,
  )?.grid;

  const pageItems = {
    ...(draft.pageElements ?? {}),
    title: titleGrid
      ? normalizeGrid(titleGrid as Partial<GridPlacementWithLayer>, 1)
      : draft.pageElements?.title ?? getDefaultPageElementGrid("title"),
    subtitle: subtitleGrid
      ? normalizeGrid(subtitleGrid as Partial<GridPlacementWithLayer>, 2)
      : draft.pageElements?.subtitle ?? getDefaultPageElementGrid("subtitle"),
    subtext: subtextGrid
      ? normalizeGrid(subtextGrid as Partial<GridPlacementWithLayer>, 3)
      : draft.pageElements?.subtext ?? getDefaultPageElementGrid("subtext"),
    description: descriptionGrid
      ? normalizeGrid(descriptionGrid as Partial<GridPlacementWithLayer>, 4)
      : draft.pageElements?.description ??
        getDefaultPageElementGrid("description"),
  };

  const blockGridMap = new Map<string, GridPlacementWithLayer>(
    canvasItems
      .filter(
        (item) =>
          item.id !== PAGE_TITLE_BLOCK_ID &&
          item.id !== PAGE_SUBTITLE_BLOCK_ID &&
          item.id !== PAGE_SUBTEXT_BLOCK_ID &&
          item.id !== PAGE_DESCRIPTION_BLOCK_ID,
      )
      .map((item, index) => [
        item.id,
        normalizeGrid(
          item.grid as Partial<GridPlacementWithLayer> | undefined,
          index + 1,
        ),
      ]),
  );

  return {
    ...prev,
    pageElements: pageItems,
    blocks: prev.blocks.map((block, index) => {
      const mapped = blockGridMap.get(block.id);
      const normalizedExisting = normalizeGrid(
        block.grid as Partial<GridPlacementWithLayer> | undefined,
        index + 1,
      );

      return {
        ...block,
        grid: {
          colStart: mapped?.colStart ?? normalizedExisting.colStart,
          rowStart: mapped?.rowStart ?? normalizedExisting.rowStart,
          colSpan: mapped?.colSpan ?? normalizedExisting.colSpan,
          rowSpan: mapped?.rowSpan ?? normalizedExisting.rowSpan,
          ...(mapped?.zIndex !== undefined
            ? ({ zIndex: mapped.zIndex } as any)
            : normalizedExisting.zIndex !== undefined
              ? ({ zIndex: normalizedExisting.zIndex } as any)
              : {}),
        } as any,
      };
    }),
  } as BuilderDraft;
}

function getTextStyle(style?: TextStyle): React.CSSProperties {
  return {
    fontFamily:
      style?.fontFamily && style.fontFamily !== "inherit"
        ? style.fontFamily
        : "Poppins",
    fontSize: style?.fontSize ? `${style.fontSize}px` : undefined,
    fontWeight: style?.bold ? 700 : 400,
    fontStyle: style?.italic ? "italic" : "normal",
    textDecoration: style?.underline ? "underline" : "none",
    textAlign: style?.align ?? "left",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    lineHeight: 1.2,
  };
}

function panelCardClass() {
  return "rounded-xl border border-white/10 bg-black/20 p-4";
}

function panelTitleClass() {
  return "text-xs font-semibold uppercase tracking-[0.16em] text-white/60";
}

function panelFieldClass() {
  return "w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-white";
}

function panelButtonClass() {
  return "rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-white/70 hover:bg-white/10";
}

type Props = {
  draft: BuilderDraft;
  setDraft: React.Dispatch<React.SetStateAction<BuilderDraft>>;
};

export default function ModernEditor({ draft, setDraft }: Props) {
  const [selection, setSelection] = useState<EditorSelection>(
    createEmptySelection(),
  );

  const pageCanvasItems = useMemo(() => buildPageCanvasItems(draft), [draft]);

  const renderedBlocks = useMemo(() => {
    return draft.blocks.map((block, index) => {
      const normalized = normalizeGrid(
        block.grid as Partial<GridPlacementWithLayer> | undefined,
        index + 1,
      );

      return {
        ...block,
        grid: {
          colStart: normalized.colStart,
          rowStart: normalized.rowStart,
          colSpan: normalized.colSpan,
          rowSpan: normalized.rowSpan,
          ...(normalized.zIndex !== undefined
            ? ({ zIndex: normalized.zIndex } as any)
            : {}),
        } as any,
      } as MicrositeBlock;
    });
  }, [draft.blocks]);

  const canvasItems = useMemo(
    () =>
      normalizeCanvasItems([
        ...pageCanvasItems,
        ...renderedBlocks.map((block, index) => {
          const normalized = normalizeGrid(
            block.grid as Partial<GridPlacementWithLayer> | undefined,
            index + 1,
          );

          return {
            id: block.id,
            type: block.type,
            label: block.label,
            grid: {
              colStart: normalized.colStart,
              rowStart: normalized.rowStart,
              colSpan: normalized.colSpan,
              rowSpan: normalized.rowSpan,
              zIndex: normalized.zIndex,
            } as any,
          };
        }),
      ]),
    [pageCanvasItems, renderedBlocks],
  );

  const ctaBlock = useMemo(
    () => getHeroButtonBlock(renderedBlocks),
    [renderedBlocks],
  );

  const linksBlock = useMemo(
    () => getLinksBlock(renderedBlocks),
    [renderedBlocks],
  );

  const labelBlocks = useMemo(
    () => getLabelBlocks(renderedBlocks),
    [renderedBlocks],
  );

  const imageBlocks = useMemo(
    () => getImageBlocks(renderedBlocks),
    [renderedBlocks],
  );

  const selectedStyle = getSelectionTextStyle(
    {
      ...draft,
      blocks: renderedBlocks,
    } as BuilderDraft,
    selection,
  );

  function applyStylePatch(stylePatch: Partial<TextStyle>) {
    setDraft((prev) =>
      applyStylePatchToSelection(
        {
          ...prev,
          blocks: renderedBlocks,
        } as BuilderDraft,
        selection,
        stylePatch,
      ),
    );
  }

  function addBlock(type: BuilderBlockType) {
    setDraft((prev) => ({
      ...prev,
      blocks: [...prev.blocks, ...addBlockTypeToDraft([], type)],
    }));
  }

  function addPageBlock(type: PageBlockType) {
    setDraft((prev) => {
      const next = coerceDraft(prev);
      const visibility = { ...(next.pageVisibility ?? {}) };

      if (type === "title") visibility.title = true;
      if (type === "subtitle") visibility.subtitle = true;
      if (type === "tagline") visibility.subtext = true;
      if (type === "description") visibility.description = true;

      return {
        ...prev,
        pageVisibility: visibility,
      } as BuilderDraft;
    });
  }

  function removeCanvasBlock(blockId: string) {
    if (
      blockId === PAGE_TITLE_BLOCK_ID ||
      blockId === PAGE_SUBTITLE_BLOCK_ID ||
      blockId === PAGE_SUBTEXT_BLOCK_ID ||
      blockId === PAGE_DESCRIPTION_BLOCK_ID
    ) {
      setDraft((prev) => {
        const next = coerceDraft(prev);
        const visibility = { ...(next.pageVisibility ?? {}) };

        if (blockId === PAGE_TITLE_BLOCK_ID) visibility.title = false;
        if (blockId === PAGE_SUBTITLE_BLOCK_ID) visibility.subtitle = false;
        if (blockId === PAGE_SUBTEXT_BLOCK_ID) visibility.subtext = false;
        if (blockId === PAGE_DESCRIPTION_BLOCK_ID) {
          visibility.description = false;
        }

        return {
          ...prev,
          pageVisibility: visibility,
        } as BuilderDraft;
      });
      return;
    }

    setDraft((prev) => ({
      ...prev,
      blocks: removeBlockFromDraft(prev.blocks, blockId),
    }));
  }

  function bringCanvasBlockToFront(blockId: string) {
    setDraft((prev) =>
      applyCanvasItemsToDraft(
        prev,
        bringCanvasItemToFront(
          [
            ...buildPageCanvasItems(prev),
            ...prev.blocks.map((block, index) => {
              const normalized = normalizeGrid(
                block.grid as Partial<GridPlacementWithLayer> | undefined,
                index + 1,
              );

              return {
                id: block.id,
                type: block.type,
                label: block.label,
                grid: {
                  colStart: normalized.colStart,
                  rowStart: normalized.rowStart,
                  colSpan: normalized.colSpan,
                  rowSpan: normalized.rowSpan,
                  zIndex: normalized.zIndex,
                } as any,
              };
            }),
          ],
          blockId,
        ),
      ),
    );
  }

  function handleMoveBlock(
    blockId: string,
    patch: { colStart: number; rowStart: number },
  ) {
    setDraft((prev) =>
      applyCanvasItemsToDraft(
        prev,
        moveCanvasItemToCell(
          [
            ...buildPageCanvasItems(prev),
            ...prev.blocks.map((block, index) => {
              const normalized = normalizeGrid(
                block.grid as Partial<GridPlacementWithLayer> | undefined,
                index + 1,
              );

              return {
                id: block.id,
                type: block.type,
                label: block.label,
                grid: {
                  colStart: normalized.colStart,
                  rowStart: normalized.rowStart,
                  colSpan: normalized.colSpan,
                  rowSpan: normalized.rowSpan,
                  zIndex: normalized.zIndex,
                } as any,
              };
            }),
          ],
          blockId,
          patch,
        ),
      ),
    );
  }

  function handleResizeBlock(
    blockId: string,
    patch: { colSpan?: number; rowSpan?: number },
  ) {
    setDraft((prev) =>
      applyCanvasItemsToDraft(
        prev,
        resizeCanvasItem(
          [
            ...buildPageCanvasItems(prev),
            ...prev.blocks.map((block, index) => {
              const normalized = normalizeGrid(
                block.grid as Partial<GridPlacementWithLayer> | undefined,
                index + 1,
              );

              return {
                id: block.id,
                type: block.type,
                label: block.label,
                grid: {
                  colStart: normalized.colStart,
                  rowStart: normalized.rowStart,
                  colSpan: normalized.colSpan,
                  rowSpan: normalized.rowSpan,
                  zIndex: normalized.zIndex,
                } as any,
              };
            }),
          ],
          blockId,
          patch,
        ),
      ),
    );
  }

  function handleCanvasSelect(nextSelection: EditorSelection) {
    if (nextSelection.type === "block") {
      setSelection(selectionFromCanvasBlockId(nextSelection.blockId));
      return;
    }
    setSelection(nextSelection);
  }

  async function handleSingleImageUpload(blockId: string, file: File | null) {
    if (!file) return;
    const url = await readFileAsDataUrl(file);
    setDraft((prev) => ({
      ...prev,
      blocks: updateImageBlockUrl(prev.blocks, blockId, url),
    }));
  }

  async function handleGalleryUpload(blockId: string, files: FileList | null) {
    if (!files || files.length === 0) return;
    const urls = await Promise.all(Array.from(files).map(readFileAsDataUrl));
    setDraft((prev) => ({
      ...prev,
      blocks: appendGalleryImages(prev.blocks, blockId, urls),
    }));
  }

  async function handleBackgroundImageUpload(file: File | null) {
    if (!file) return;
    const url = await readFileAsDataUrl(file);

    setDraft((prev) => ({
      ...prev,
      pageBackground: url,
    }));
  }

  function renderCanvasPreview(item: CanvasGridItem) {
    if (item.id === PAGE_TITLE_BLOCK_ID) {
      return (
        <div className="h-full">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">
            Title
          </div>
          <div className="mt-3 text-white" style={getTextStyle(draft.titleStyle)}>
            {draft.title || "Modern Design Title"}
          </div>
        </div>
      );
    }

    if (item.id === PAGE_SUBTITLE_BLOCK_ID) {
      return (
        <div className="h-full">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">
            Subtitle
          </div>
          <div
            className="mt-3 text-gray-200"
            style={getTextStyle(draft.subtitleStyle)}
          >
            {draft.subtitle || "Subtitle"}
          </div>
        </div>
      );
    }

    if (item.id === PAGE_SUBTEXT_BLOCK_ID) {
      return (
        <div className="h-full">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">
            Tagline
          </div>
          <div
            className="mt-3 text-white/55"
            style={getTextStyle(draft.subtextStyle)}
          >
            {draft.subtext || "Tagline"}
          </div>
        </div>
      );
    }

    if (item.id === PAGE_DESCRIPTION_BLOCK_ID) {
      return (
        <div className="h-full">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">
            Description
          </div>
          <div
            className="mt-3 text-gray-300"
            style={getTextStyle(getDescriptionStyle(draft))}
          >
            {getDescriptionValue(draft) || "Description"}
          </div>
        </div>
      );
    }

    const block = renderedBlocks.find((b) => b.id === item.id);
    if (!block) {
      return <div className="text-xs uppercase text-white/60">{item.type}</div>;
    }

    switch (block.type) {
      case "label":
        return (
          <div
            className="flex h-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-center text-white"
            style={getTextStyle(block.data.style)}
          >
            {block.data.text || "Label"}
          </div>
        );

      case "image":
        return block.data.image.url ? (
          <img
            src={block.data.image.url}
            alt={block.data.image.alt || "Preview"}
            className="h-full w-full rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/20 text-sm text-white/50">
            Image
          </div>
        );

      case "cta":
        return (
          <div className="flex h-full flex-col justify-center">
            <div className="inline-flex w-fit rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
              {block.data.buttonText || "Button"}
            </div>
          </div>
        );

      case "links":
        return (
          <div className="grid h-full grid-cols-3 gap-2">
            {block.data.items.slice(0, 3).map((item: LinkItem) => (
              <div
                key={item.id}
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-3 text-center text-xs text-white"
              >
                {item.label || "Link"}
              </div>
            ))}
          </div>
        );

      case "countdown":
        return (
          <div className="flex h-full flex-col justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-white">
            <div className="text-xs uppercase tracking-[0.14em] text-white/45">
              {block.data.heading || "Countdown"}
            </div>
            <div className="mt-2 text-lg font-semibold">00 : 00 : 00</div>
          </div>
        );

      case "padding":
        return (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/10 text-xs uppercase tracking-[0.18em] text-white/30">
            Spacing
          </div>
        );

      case "poll":
        return (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
            <div className="text-sm font-semibold">
              {block.data.question || "Poll"}
            </div>
            <div className="mt-3 space-y-2">
              {block.data.options.slice(0, 3).map((option: PollOption) => (
                <div
                  key={option.id}
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs"
                >
                  {option.text}
                </div>
              ))}
            </div>
          </div>
        );

      case "rsvp":
        return (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
            <div className="text-sm font-semibold">
              {block.data.heading || "RSVP"}
            </div>
            <div className="mt-3 text-xs text-white/55">
              RSVP fields configured
            </div>
          </div>
        );

      case "faq":
        return (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
            <div className="text-sm font-semibold">FAQs</div>
            <div className="mt-3 text-xs text-white/55">
              {block.data.items.length} item
              {block.data.items.length === 1 ? "" : "s"}
            </div>
          </div>
        );

      case "gallery":
        return (
          <div className="grid h-full grid-cols-3 gap-2">
            {(block.data.images.length
              ? block.data.images
              : Array.from({ length: 3 }))
              .slice(0, 6)
              .map((image: any, idx) => (
                <div
                  key={image?.id || idx}
                  className="rounded-lg border border-white/10 bg-white/5"
                  style={
                    image?.url
                      ? {
                          backgroundImage: `url(${image.url})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                />
              ))}
          </div>
        );

      case "thread":
        return (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
            <div className="text-sm font-semibold">
              {(block.data as { subject?: string }).subject || "Message Thread"}
            </div>
            <div className="mt-3 text-xs text-white/55">
              Permissions configured
            </div>
          </div>
        );

      default:
        return <div className="text-xs uppercase text-white/60">{block.type}</div>;
    }
  }

  const canvasBackgroundImage = getBackgroundImageValue(draft);
  const canvasPageColor = getPageColorValue(draft);

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_360px]">
      <ToolboxPanel
        selectedFontFamily={selectedStyle.fontFamily ?? "Poppins"}
        selectedFontSize={selectedStyle.fontSize ?? 16}
        selectedBold={selectedStyle.bold ?? false}
        selectedItalic={selectedStyle.italic ?? false}
        selectedUnderline={selectedStyle.underline ?? false}
        onFontFamilyChange={(value) => applyStylePatch({ fontFamily: value })}
        onFontSizeChange={(value) => applyStylePatch({ fontSize: value })}
        onBoldChange={(value) => applyStylePatch({ bold: value })}
        onItalicChange={(value) => applyStylePatch({ italic: value })}
        onUnderlineChange={(value) => applyStylePatch({ underline: value })}
        onAlignChange={(value) => applyStylePatch({ align: value })}
        onAddBlock={addBlock}
        onAddPageBlock={addPageBlock}
      />

      <div className="rounded-[32px] border border-neutral-800 bg-[linear-gradient(180deg,#0f1115_0%,#171a21_100%)] p-6 shadow-sm">
        <div className="flex min-h-[560px] flex-col px-6 py-8">
          <div
            className="w-full rounded-[28px]"
            style={{
              backgroundColor: canvasPageColor,
              backgroundImage: canvasBackgroundImage
                ? `linear-gradient(rgba(15,17,21,0.18), rgba(23,26,33,0.18)), url(${canvasBackgroundImage})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <GridCanvas
              blocks={canvasItems}
              selection={selection}
              onSelect={handleCanvasSelect}
              onMoveBlock={handleMoveBlock}
              onResizeBlock={handleResizeBlock}
              onBringToFront={bringCanvasBlockToFront}
              onRemoveBlock={removeCanvasBlock}
              renderBlockPreview={renderCanvasPreview}
              isItemSelected={(blockId, nextSelection) =>
                isCanvasBlockSelected(nextSelection, blockId)
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-[24px] border border-white/10 bg-[#111317] p-5 backdrop-blur shadow-sm">
        <div className="text-sm font-semibold text-white">
          Modern Content
        </div>

        <div className={panelCardClass()}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className={panelTitleClass()}>Background Image</div>

            {canvasBackgroundImage ? (
              <button
                type="button"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    pageBackground: "",
                  }))
                }
                className={panelButtonClass()}
              >
                Remove
              </button>
            ) : null}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              void handleBackgroundImageUpload(
                e.target.files?.[0] || null,
              )
            }
            className="block w-full text-sm text-white/70"
          />

          {canvasBackgroundImage ? (
            <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
              <img
                src={canvasBackgroundImage}
                alt="Background preview"
                className="h-32 w-full object-cover"
              />
            </div>
          ) : (
            <div className="mt-3 flex h-32 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-white/45">
              No background image selected
            </div>
          )}
        </div>

        <div className={panelCardClass()}>
          <div className={panelTitleClass()}>Page Color</div>

          <div className="mt-3 flex items-center gap-3">
            <input
              type="color"
              value={canvasPageColor}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...(prev as DraftWithExtras),
                  pageColor: e.target.value,
                }))
              }
              className="h-11 w-16 cursor-pointer rounded border border-white/10 bg-transparent"
            />

            <input
              type="text"
              value={canvasPageColor}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...(prev as DraftWithExtras),
                  pageColor: e.target.value,
                }))
              }
              className={panelFieldClass()}
              placeholder="#0f1115"
            />
          </div>
        </div>

        {isPageVisible(draft, "title") ? (
          <div className={panelCardClass()}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className={panelTitleClass()}>Title</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => bringCanvasBlockToFront(PAGE_TITLE_BLOCK_ID)}
                  className={panelButtonClass()}
                >
                  Bring to front
                </button>
                <button
                  type="button"
                  onClick={() => removeCanvasBlock(PAGE_TITLE_BLOCK_ID)}
                  className={panelButtonClass()}
                >
                  Remove
                </button>
              </div>
            </div>

            <input
              value={draft.title || ""}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, title: e.target.value }))
              }
              className={panelFieldClass()}
            />
          </div>
        ) : null}

        {isPageVisible(draft, "subtitle") ? (
          <div className={panelCardClass()}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className={panelTitleClass()}>Subtitle</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => bringCanvasBlockToFront(PAGE_SUBTITLE_BLOCK_ID)}
                  className={panelButtonClass()}
                >
                  Bring to front
                </button>
                <button
                  type="button"
                  onClick={() => removeCanvasBlock(PAGE_SUBTITLE_BLOCK_ID)}
                  className={panelButtonClass()}
                >
                  Remove
                </button>
              </div>
            </div>

            <input
              value={draft.subtitle || ""}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, subtitle: e.target.value }))
              }
              className={panelFieldClass()}
            />
          </div>
        ) : null}

        {isPageVisible(draft, "subtext") ? (
          <div className={panelCardClass()}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className={panelTitleClass()}>Tagline</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => bringCanvasBlockToFront(PAGE_SUBTEXT_BLOCK_ID)}
                  className={panelButtonClass()}
                >
                  Bring to front
                </button>
                <button
                  type="button"
                  onClick={() => removeCanvasBlock(PAGE_SUBTEXT_BLOCK_ID)}
                  className={panelButtonClass()}
                >
                  Remove
                </button>
              </div>
            </div>

            <input
              value={draft.subtext || ""}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, subtext: e.target.value }))
              }
              className={panelFieldClass()}
            />
          </div>
        ) : null}

        {isPageVisible(draft, "description") ? (
          <div className={panelCardClass()}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className={panelTitleClass()}>Description</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => bringCanvasBlockToFront(PAGE_DESCRIPTION_BLOCK_ID)}
                  className={panelButtonClass()}
                >
                  Bring to front
                </button>
                <button
                  type="button"
                  onClick={() => removeCanvasBlock(PAGE_DESCRIPTION_BLOCK_ID)}
                  className={panelButtonClass()}
                >
                  Remove
                </button>
              </div>
            </div>

            <textarea
              rows={4}
              value={getDescriptionValue(draft)}
              onChange={(e) =>
                setDraft(
                  (prev) =>
                    ({
                      ...(prev as DraftWithExtras),
                      description: e.target.value,
                    }) as BuilderDraft,
                )
              }
              className={panelFieldClass()}
            />
          </div>
        ) : null}

        {renderedBlocks.map((block) => {
          if (block.type === "padding") return null;

          return (
            <div
              key={block.id}
              className={panelCardClass()}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className={panelTitleClass()}>
                  {block.label || block.type}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => bringCanvasBlockToFront(block.id)}
                    className={panelButtonClass()}
                  >
                    Bring to front
                  </button>

                  <button
                    type="button"
                    onClick={() => removeCanvasBlock(block.id)}
                    className={panelButtonClass()}
                  >
                    Remove
                  </button>
                </div>
              </div>

              {block.type === "label" ? (
                <input
                  value={block.data.text}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      blocks: updateLabelBlockText(
                        prev.blocks,
                        block.id,
                        e.target.value,
                      ),
                    }))
                  }
                  className={panelFieldClass()}
                />
              ) : null}

              {block.type === "image" ? (
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      void handleSingleImageUpload(
                        block.id,
                        e.target.files?.[0] || null,
                      )
                    }
                    className="block w-full text-sm text-white/70"
                  />
                  <input
                    value={block.data.image.alt || ""}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        blocks: updateImageBlockAlt(
                          prev.blocks,
                          block.id,
                          e.target.value,
                        ),
                      }))
                    }
                    placeholder="Alt text"
                    className={panelFieldClass()}
                  />
                </div>
              ) : null}

              {block.type === "cta" ? (
                <div className="space-y-3">
                  <input
                    value={block.data.buttonText}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        blocks: updateCtaBlockField(
                          prev.blocks,
                          block.id,
                          "buttonText",
                          e.target.value,
                        ),
                      }))
                    }
                    placeholder="Button text"
                    className={panelFieldClass()}
                  />
                  <input
                    value={block.data.buttonUrl}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        blocks: updateCtaBlockField(
                          prev.blocks,
                          block.id,
                          "buttonUrl",
                          e.target.value,
                        ),
                      }))
                    }
                    placeholder="Button URL"
                    className={panelFieldClass()}
                  />
                </div>
              ) : null}

              {block.type === "links" ? (
                <div className="space-y-3">
                  <input
                    value={block.data.heading || ""}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        blocks: updateLinksHeading(
                          prev.blocks,
                          block.id,
                          e.target.value,
                        ),
                      }))
                    }
                    placeholder="Heading"
                    className={panelFieldClass()}
                  />

                  {block.data.items.map((item: LinkItem) => (
                    <div
                      key={item.id}
                      className="space-y-2 rounded-xl border border-white/10 p-3"
                    >
                      <input
                        value={item.label}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            blocks: updateLinkItem(
                              prev.blocks,
                              item.id,
                              "label",
                              e.target.value,
                            ),
                          }))
                        }
                        placeholder="Link label"
                        className={panelFieldClass()}
                      />
                      <input
                        value={item.url}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            blocks: updateLinkItem(
                              prev.blocks,
                              item.id,
                              "url",
                              e.target.value,
                            ),
                          }))
                        }
                        placeholder="Link URL"
                        className={panelFieldClass()}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            blocks: removeNavigationLink(prev.blocks, item.id),
                          }))
                        }
                        className={panelButtonClass()}
                      >
                        Remove Link
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        blocks: addNavigationLink(prev.blocks, block.id),
                      }))
                    }
                    className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/80"
                  >
                    Add Link
                  </button>
                </div>
              ) : null}

              {block.type === "countdown" ? (
                <div className="space-y-3">
                  <input
                    value={block.data.heading || ""}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        blocks: updateCountdownField(
                          prev.blocks,
                          block.id,
                          "heading",
                          e.target.value,
                        ),
                      }))
                    }
                    placeholder="Heading"
                    className={panelFieldClass()}
                  />
                  <input
                    type="datetime-local"
                    value={block.data.targetIso || ""}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        blocks: updateCountdownField(
                          prev.blocks,
                          block.id,
                          "targetIso",
                          e.target.value,
                        ),
                      }))
                    }
                    className={panelFieldClass()}
                  />
                </div>
              ) : null}

              {block.type === "poll" ? (
                <div className="space-y-3">
                  <input
                    value={block.data.question}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        blocks: updatePollQuestion(
                          prev.blocks,
                          block.id,
                          e.target.value,
                        ),
                      }))
                    }
                    placeholder="Poll subject"
                    className={panelFieldClass()}
                  />

                  {block.data.options.map((option: PollOption) => (
                    <div key={option.id} className="flex gap-2">
                      <input
                        value={option.text}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            blocks: updatePollOptionText(
                              prev.blocks,
                              block.id,
                              option.id,
                              e.target.value,
                            ),
                          }))
                        }
                        className="flex-1 rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-white"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            blocks: removePollOption(
                              prev.blocks,
                              block.id,
                              option.id,
                            ),
                          }))
                        }
                        className={panelButtonClass()}
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        blocks: addPollOption(prev.blocks, block.id),
                      }))
                    }
                    className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/80"
                  >
                    Add Option
                  </button>
                </div>
              ) : null}

              {block.type === "rsvp" ? (
                <div className="space-y-3">
                  <input
                    value={block.data.heading}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        blocks: updateRsvpHeading(
                          prev.blocks,
                          block.id,
                          e.target.value,
                        ),
                      }))
                    }
                    placeholder="RSVP heading"
                    className={panelFieldClass()}
                  />

                  {[
                    ["collectName", "Collect name"],
                    ["collectEmail", "Collect email"],
                    ["collectPhone", "Collect phone"],
                    ["collectGuestCount", "Collect guest count"],
                    ["collectNotes", "Collect notes"],
                  ].map(([field, label]) => (
                    <label
                      key={field}
                      className="flex items-center gap-3 text-sm text-white/80"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean((block.data as any)[field])}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            blocks: updateRsvpToggle(
                              prev.blocks,
                              block.id,
                              field as any,
                              e.target.checked,
                            ),
                          }))
                        }
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              ) : null}

              {block.type === "faq" ? (
                <div className="space-y-3">
                  {block.data.items.map((item: FaqItem) => (
                    <div
                      key={item.id}
                      className="space-y-2 rounded-xl border border-white/10 p-3"
                    >
                      <input
                        value={item.question}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            blocks: updateFaqItem(
                              prev.blocks,
                              block.id,
                              item.id,
                              "question",
                              e.target.value,
                            ),
                          }))
                        }
                        placeholder="Question"
                        className={panelFieldClass()}
                      />
                      <textarea
                        rows={3}
                        value={item.answer}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            blocks: updateFaqItem(
                              prev.blocks,
                              block.id,
                              item.id,
                              "answer",
                              e.target.value,
                            ),
                          }))
                        }
                        placeholder="Answer"
                        className={panelFieldClass()}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            blocks: removeFaqItem(
                              prev.blocks,
                              block.id,
                              item.id,
                            ),
                          }))
                        }
                        className={panelButtonClass()}
                      >
                        Remove FAQ
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        blocks: addFaqItem(prev.blocks, block.id),
                      }))
                    }
                    className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/80"
                  >
                    Add FAQ
                  </button>
                </div>
              ) : null}

              {block.type === "gallery" ? (
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) =>
                      void handleGalleryUpload(block.id, e.target.files)
                    }
                    className="block w-full text-sm text-white/70"
                  />

                  <select
                    value={String(block.data.grid)}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        blocks: updateGalleryGrid(
                          prev.blocks,
                          block.id,
                          Number(e.target.value),
                        ),
                      }))
                    }
                    className={panelFieldClass()}
                  >
                    <option value="2">2 x 2</option>
                    <option value="3">3 x 3</option>
                    <option value="4">4 x 4</option>
                  </select>

                  <div className="text-xs text-white/55">
                    {block.data.images.length} image
                    {block.data.images.length === 1 ? "" : "s"} selected
                  </div>
                </div>
              ) : null}

              {block.type === "thread" ? (
                <div className="space-y-3">
                  <input
                    value={
                      (block.data as { subject?: string }).subject || ""
                    }
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        blocks: updateThreadField(
                          prev.blocks,
                          block.id,
                          "subject",
                          e.target.value,
                        ),
                      }))
                    }
                    placeholder="Thread subject"
                    className={panelFieldClass()}
                  />

                  <label className="flex items-center gap-3 text-sm text-white/80">
                    <input
                      type="checkbox"
                      checked={Boolean(
                        (block.data as { allowAnonymous?: boolean })
                          .allowAnonymous,
                      )}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          blocks: updateThreadToggle(
                            prev.blocks,
                            block.id,
                            "allowAnonymous",
                            e.target.checked,
                          ),
                        }))
                      }
                    />
                    <span>Allow anonymous senders</span>
                  </label>

                  <label className="flex items-center gap-3 text-sm text-white/80">
                    <input
                      type="checkbox"
                      checked={Boolean(
                        (block.data as { requireApproval?: boolean })
                          .requireApproval,
                      )}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          blocks: updateThreadToggle(
                            prev.blocks,
                            block.id,
                            "requireApproval",
                            e.target.checked,
                          ),
                        }))
                      }
                    />
                    <span>Require approval</span>
                  </label>
                </div>
              ) : null}
            </div>
          );
        })}

        {ctaBlock ? (
          <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/60">
            CTA block detected
          </div>
        ) : null}

        {linksBlock ? (
          <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/60">
            Links block detected
          </div>
        ) : null}

        {labelBlocks.length > 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/60">
            {labelBlocks.length} label block
            {labelBlocks.length === 1 ? "" : "s"}
          </div>
        ) : null}

        {imageBlocks.length > 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/60">
            {imageBlocks.length} image block
            {imageBlocks.length === 1 ? "" : "s"}
          </div>
        ) : null}
      </div>
    </div>
  );
}