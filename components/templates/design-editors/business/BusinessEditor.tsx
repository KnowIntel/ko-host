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
  CountdownBlock,
  CtaBlock,
  GridPlacement,
  ImageBlock,
  LabelBlock,
  LinkItem,
  LinksBlock,
  MicrositeBlock,
  TextStyle,
} from "@/lib/templates/builder";

import {
  addBlockTypeToDraft,
  addNavigationLink,
  applyStylePatchToSelection,
  getCountdownBlock,
  getHeroButtonBlock,
  getImageBlocks,
  getLabelBlocks,
  getLinksBlock,
  getSelectionTextStyle,
  readFileAsDataUrl,
  removeBlockFromDraft,
  removeNavigationLink,
  updateCountdownField,
  updateCtaBlockField,
  updateImageBlockAlt,
  updateImageBlockUrl,
  updateLabelBlockText,
  updateLinkItem,
  updateLinksHeading,
} from "@/components/templates/design-editors/shared/editorUtils";

const GRID_COLUMNS = 12;
const GRID_STEP = 0.5;

type PageVisibility = {
  title: boolean;
  subtitle: boolean;
  subtext: boolean;
  description: boolean;
};

type GridPlacementWithLayer = Partial<GridPlacement> & {
  zIndex?: number;
};

type DraftWithExtras = BuilderDraft & {
  pageColor?: string | null;
  pageBackground?: string | null;
  description?: string;
  descriptionStyle?: TextStyle;
  pageVisibility?: Partial<PageVisibility>;
  pageElements?: {
    title?: GridPlacementWithLayer;
    subtitle?: GridPlacementWithLayer;
    subtext?: GridPlacementWithLayer;
    description?: GridPlacementWithLayer;
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

function getSelectionSafeTextStyle(
  style: TextStyle | undefined,
  fallback: TextStyle,
): TextStyle {
  return {
    fontFamily: style?.fontFamily ?? fallback.fontFamily,
    fontSize: style?.fontSize ?? fallback.fontSize,
    bold: style?.bold ?? fallback.bold,
    italic: style?.italic ?? fallback.italic,
    underline: style?.underline ?? fallback.underline,
    align: style?.align ?? fallback.align,
  };
}

function getDescriptionValue(draft: BuilderDraft) {
  return coerceDraft(draft).description || "";
}

function getDescriptionStyle(draft: BuilderDraft) {
  return getSelectionSafeTextStyle(coerceDraft(draft).descriptionStyle, {
    fontFamily: "Inter",
    fontSize: 15,
    bold: false,
    italic: false,
    underline: false,
    align: "left",
  });
}

function getPageColor(draft: BuilderDraft) {
  return coerceDraft(draft).pageColor || "#ffffff";
}

function getPageBackground(draft: BuilderDraft) {
  return coerceDraft(draft).pageBackground || "";
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

function getLayerFromGrid(
  grid: GridPlacementWithLayer | undefined,
  fallback = 1,
) {
  const raw = Number(grid?.zIndex);
  return Number.isFinite(raw) ? raw : fallback;
}

function withLayer(
  grid: GridPlacement,
  zIndex: number,
): GridPlacementWithLayer {
  return {
    ...grid,
    zIndex,
  };
}

function normalizeGrid(
  grid: GridPlacementWithLayer | undefined,
  index: number,
): GridPlacement {
  const rawColStart = Number(grid?.colStart);
  const rawRowStart = Number(grid?.rowStart);
  const rawColSpan = Number(grid?.colSpan);
  const rawRowSpan = Number(grid?.rowSpan);

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
  };
}

function normalizeCanvasItems(items: CanvasGridItem[]) {
  return items.map((item, index) => {
    const rawGrid = (item.grid ?? {}) as GridPlacementWithLayer;
    return {
      ...item,
      grid: withLayer(
        normalizeGrid(rawGrid, index + 1),
        getLayerFromGrid(rawGrid, index + 1),
      ),
    };
  });
}

function moveCanvasItemToCell(
  items: CanvasGridItem[],
  blockId: string,
  patch: { colStart: number; rowStart: number },
) {
  return normalizeCanvasItems(
    items.map((item) => {
      if (item.id !== blockId) return item;

      const rawGrid = (item.grid ?? {}) as GridPlacementWithLayer;
      const grid = normalizeGrid(rawGrid, 1);

      return {
        ...item,
        grid: withLayer(
          {
            ...grid,
            colStart: clamp(
              snapToHalf(patch.colStart),
              1,
              Math.max(1, GRID_COLUMNS - grid.colSpan + 1),
            ),
            rowStart: Math.max(1, snapToHalf(patch.rowStart)),
          },
          getLayerFromGrid(rawGrid, 1),
        ),
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

      const rawGrid = (item.grid ?? {}) as GridPlacementWithLayer;
      const grid = normalizeGrid(rawGrid, 1);

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
        grid: withLayer(
          {
            ...grid,
            colSpan: nextColSpan,
            rowSpan: nextRowSpan,
          },
          getLayerFromGrid(rawGrid, 1),
        ),
      };
    }),
  );
}

function bringCanvasItemToFront(items: CanvasGridItem[], blockId: string) {
  const highest = items.reduce((max, item, index) => {
    return Math.max(
      max,
      getLayerFromGrid((item.grid ?? {}) as GridPlacementWithLayer, index + 1),
    );
  }, 1);

  return items.map((item, index) => {
    if (item.id !== blockId) return item;

    const rawGrid = (item.grid ?? {}) as GridPlacementWithLayer;
    return {
      ...item,
      grid: withLayer(normalizeGrid(rawGrid, index + 1), highest + 1),
    };
  });
}

function getDefaultPageElementGrid(
  key: "title" | "subtitle" | "subtext" | "description",
): GridPlacementWithLayer {
  if (key === "title") {
    return { colStart: 1, rowStart: 1, colSpan: 8, rowSpan: 1.5, zIndex: 1 };
  }
  if (key === "subtitle") {
    return { colStart: 1, rowStart: 2.5, colSpan: 7, rowSpan: 1, zIndex: 2 };
  }
  if (key === "subtext") {
    return { colStart: 1, rowStart: 3.5, colSpan: 6, rowSpan: 1, zIndex: 3 };
  }
  return { colStart: 1, rowStart: 4.5, colSpan: 7, rowSpan: 1.5, zIndex: 4 };
}

function buildPageCanvasItems(draft: BuilderDraft): CanvasGridItem[] {
  const visibility = getPageVisibility(draft);
  const pageElements = coerceDraft(draft).pageElements ?? {};
  const items: CanvasGridItem[] = [];

  if (visibility.title && (draft.title || draft.title === "")) {
    items.push({
      id: PAGE_TITLE_BLOCK_ID,
      type: "page:title",
      label: "Title",
      grid: pageElements.title ?? getDefaultPageElementGrid("title"),
    });
  }

  if (visibility.subtitle && (draft.subtitle || draft.subtitle === "")) {
    items.push({
      id: PAGE_SUBTITLE_BLOCK_ID,
      type: "page:subtitle",
      label: "Subtitle",
      grid: pageElements.subtitle ?? getDefaultPageElementGrid("subtitle"),
    });
  }

  if (visibility.subtext && (draft.subtext || draft.subtext === "")) {
    items.push({
      id: PAGE_SUBTEXT_BLOCK_ID,
      type: "page:subtext",
      label: "Tagline",
      grid: pageElements.subtext ?? getDefaultPageElementGrid("subtext"),
    });
  }

  if (
    visibility.description &&
    (getDescriptionValue(draft) || getDescriptionValue(draft) === "")
  ) {
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

function toCanvasItemsFromBlocks(blocks: MicrositeBlock[]): CanvasGridItem[] {
  return blocks.map((block, index) => {
    const rawGrid = (block.grid ?? {}) as GridPlacementWithLayer;
    return {
      id: block.id,
      type: block.type,
      label: block.label,
      grid: withLayer(
        normalizeGrid(rawGrid, index + 1),
        getLayerFromGrid(rawGrid, index + 1),
      ),
    };
  });
}

function applyCanvasItemsToDraft(
  prev: BuilderDraft,
  canvasItems: CanvasGridItem[],
): BuilderDraft {
  const draft = coerceDraft(prev);

  const titleItem = canvasItems.find((item) => item.id === PAGE_TITLE_BLOCK_ID);
  const subtitleItem = canvasItems.find(
    (item) => item.id === PAGE_SUBTITLE_BLOCK_ID,
  );
  const subtextItem = canvasItems.find(
    (item) => item.id === PAGE_SUBTEXT_BLOCK_ID,
  );
  const descriptionItem = canvasItems.find(
    (item) => item.id === PAGE_DESCRIPTION_BLOCK_ID,
  );

  const titleRaw = (titleItem?.grid ?? draft.pageElements?.title) as
    | GridPlacementWithLayer
    | undefined;
  const subtitleRaw = (subtitleItem?.grid ?? draft.pageElements?.subtitle) as
    | GridPlacementWithLayer
    | undefined;
  const subtextRaw = (subtextItem?.grid ?? draft.pageElements?.subtext) as
    | GridPlacementWithLayer
    | undefined;
  const descriptionRaw = (
    descriptionItem?.grid ?? draft.pageElements?.description
  ) as GridPlacementWithLayer | undefined;

  const pageItems = {
    ...(draft.pageElements ?? {}),
    title: withLayer(
      normalizeGrid(titleRaw, 1),
      getLayerFromGrid(titleRaw, 1),
    ),
    subtitle: withLayer(
      normalizeGrid(subtitleRaw, 2),
      getLayerFromGrid(subtitleRaw, 2),
    ),
    subtext: withLayer(
      normalizeGrid(subtextRaw, 3),
      getLayerFromGrid(subtextRaw, 3),
    ),
    description: withLayer(
      normalizeGrid(descriptionRaw, 4),
      getLayerFromGrid(descriptionRaw, 4),
    ),
  };

  const nonPageItems = canvasItems.filter(
    (item) =>
      item.id !== PAGE_TITLE_BLOCK_ID &&
      item.id !== PAGE_SUBTITLE_BLOCK_ID &&
      item.id !== PAGE_SUBTEXT_BLOCK_ID &&
      item.id !== PAGE_DESCRIPTION_BLOCK_ID,
  );

  const blockGridMap = new Map<string, GridPlacementWithLayer>(
    nonPageItems.map((item, index) => {
      const rawGrid = (item.grid ?? {}) as GridPlacementWithLayer;
      return [
        item.id,
        withLayer(
          normalizeGrid(rawGrid, index + 1),
          getLayerFromGrid(rawGrid, index + 1),
        ),
      ];
    }),
  );

  return {
    ...prev,
    pageElements: pageItems,
    blocks: prev.blocks.map((block) => {
      const nextGrid = blockGridMap.get(block.id);
      return nextGrid
        ? ({
            ...block,
            grid: nextGrid as GridPlacement,
          } as MicrositeBlock)
        : block;
    }),
  } as BuilderDraft;
}

function getTextStyle(style?: TextStyle): React.CSSProperties {
  return {
    fontFamily:
      style?.fontFamily && style.fontFamily !== "inherit"
        ? style.fontFamily
        : undefined,
    fontSize: style?.fontSize ? `${style.fontSize}px` : undefined,
    fontWeight: style?.bold ? 700 : 400,
    fontStyle: style?.italic ? "italic" : "normal",
    textDecoration: style?.underline ? "underline" : "none",
    textAlign: style?.align ?? "left",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    lineHeight: 1.35,
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

type PageControlKey = "title" | "subtitle" | "subtext" | "description";

type Props = {
  draft: BuilderDraft;
  setDraft: React.Dispatch<React.SetStateAction<BuilderDraft>>;
};

export default function BusinessEditor({ draft, setDraft }: Props) {
  const [selection, setSelection] = useState<EditorSelection>(
    createEmptySelection(),
  );

  const pageCanvasItems = useMemo(() => buildPageCanvasItems(draft), [draft]);

  const renderedBlocks = useMemo(() => {
    const normalizedItems = normalizeCanvasItems(
      toCanvasItemsFromBlocks(draft.blocks),
    );

    const blockGridMap = new Map<string, GridPlacementWithLayer>(
      normalizedItems.map((item, index) => {
        const rawGrid = (item.grid ?? {}) as GridPlacementWithLayer;
        return [
          item.id,
          withLayer(
            normalizeGrid(rawGrid, index + 1),
            getLayerFromGrid(rawGrid, index + 1),
          ),
        ];
      }),
    );

    return draft.blocks.map((block) => {
      const nextGrid = blockGridMap.get(block.id);
      return nextGrid
        ? ({
            ...block,
            grid: nextGrid as GridPlacement,
          } as MicrositeBlock)
        : block;
    });
  }, [draft.blocks]);

  const canvasItems = useMemo(
    () =>
      normalizeCanvasItems([
        ...pageCanvasItems,
        ...toCanvasItemsFromBlocks(renderedBlocks),
      ]),
    [pageCanvasItems, renderedBlocks],
  );

  const ctaBlock = useMemo(
    () => getHeroButtonBlock(renderedBlocks) as CtaBlock | null,
    [renderedBlocks],
  );

  const countdownBlock = useMemo(
    () => getCountdownBlock(renderedBlocks) as CountdownBlock | null,
    [renderedBlocks],
  );

  const linksBlock = useMemo(
    () => getLinksBlock(renderedBlocks) as LinksBlock | null,
    [renderedBlocks],
  );

  const imageBlocks = useMemo(
    () => getImageBlocks(renderedBlocks) as ImageBlock[],
    [renderedBlocks],
  );

  const labelBlocks = useMemo(
    () => getLabelBlocks(renderedBlocks) as LabelBlock[],
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
        if (blockId === PAGE_DESCRIPTION_BLOCK_ID) visibility.description = false;

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
    setDraft((prev) => {
      const pageItems = buildPageCanvasItems(prev);
      const blockItems = toCanvasItemsFromBlocks(prev.blocks);
      const updated = bringCanvasItemToFront([...pageItems, ...blockItems], blockId);
      return applyCanvasItemsToDraft(prev, updated);
    });
  }

  function bringPageSectionToFront(key: PageControlKey) {
    if (key === "title") bringCanvasBlockToFront(PAGE_TITLE_BLOCK_ID);
    if (key === "subtitle") bringCanvasBlockToFront(PAGE_SUBTITLE_BLOCK_ID);
    if (key === "subtext") bringCanvasBlockToFront(PAGE_SUBTEXT_BLOCK_ID);
    if (key === "description") bringCanvasBlockToFront(PAGE_DESCRIPTION_BLOCK_ID);
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
            ...toCanvasItemsFromBlocks(prev.blocks),
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
            ...toCanvasItemsFromBlocks(prev.blocks),
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

  async function handleImageUpload(blockId: string, file: File | null) {
    if (!file) return;
    const url = await readFileAsDataUrl(file);

    setDraft((prev) => ({
      ...prev,
      blocks: updateImageBlockUrl(prev.blocks, blockId, url),
    }));
  }

  async function handleBackgroundUpload(file: File | null) {
    if (!file) return;
    const url = await readFileAsDataUrl(file);

    setDraft((prev) => ({
      ...(prev as DraftWithExtras),
      pageBackground: url,
    }));
  }

  function renderCanvasPreview(item: CanvasGridItem) {
    if (item.id === PAGE_TITLE_BLOCK_ID) {
      return (
        <div className="h-full">
          <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            Title
          </div>
          <div
            className="mt-3 text-neutral-900"
            style={getTextStyle(
              getSelectionSafeTextStyle(draft.titleStyle, {
                fontFamily: "Playfair Display",
                fontSize: 38,
                bold: false,
                italic: false,
                underline: false,
                align: "left",
              }),
            )}
          >
            {draft.title}
          </div>
        </div>
      );
    }

    if (item.id === PAGE_SUBTITLE_BLOCK_ID) {
      return (
        <div className="h-full">
          <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            Subtitle
          </div>
          <div
            className="mt-3 text-neutral-600"
            style={getTextStyle(
              getSelectionSafeTextStyle(draft.subtitleStyle, {
                fontFamily: "Inter",
                fontSize: 18,
                bold: false,
                italic: false,
                underline: false,
                align: "left",
              }),
            )}
          >
            {draft.subtitle}
          </div>
        </div>
      );
    }

    if (item.id === PAGE_SUBTEXT_BLOCK_ID) {
      return (
        <div className="h-full">
          <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            Tagline
          </div>
          <div
            className="mt-3 text-neutral-700"
            style={getTextStyle(
              getSelectionSafeTextStyle(draft.subtextStyle, {
                fontFamily: "Inter",
                fontSize: 14,
                bold: true,
                italic: false,
                underline: false,
                align: "left",
              }),
            )}
          >
            {draft.subtext}
          </div>
        </div>
      );
    }

    if (item.id === PAGE_DESCRIPTION_BLOCK_ID) {
      return (
        <div className="h-full">
          <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            Description
          </div>
          <div
            className="mt-3 text-neutral-500"
            style={getTextStyle(getDescriptionStyle(draft))}
          >
            {getDescriptionValue(draft)}
          </div>
        </div>
      );
    }

    const block = renderedBlocks.find((entry) => entry.id === item.id);
    if (!block) {
      return <div className="text-xs uppercase text-neutral-500">{item.type}</div>;
    }

    switch (block.type) {
      case "label":
        return (
          <div
            className="flex h-full items-center rounded-xl border border-neutral-200 bg-white/90 px-4 text-neutral-900"
            style={getTextStyle(block.data.style)}
          >
            {block.data.text || "Business label"}
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
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-neutral-300 text-sm text-neutral-400">
            Image
          </div>
        );

      case "cta":
        return (
          <div className="flex h-full items-center">
            <div className="inline-flex rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white">
              {block.data.buttonText || "Get Started"}
            </div>
          </div>
        );

      case "links":
        return (
          <div className="grid h-full grid-cols-2 gap-2">
            {block.data.items.slice(0, 4).map((entry: LinkItem) => (
              <div
                key={entry.id}
                className="rounded-lg border border-neutral-200 bg-white/80 px-3 py-2 text-sm text-neutral-800"
              >
                {entry.label || "Link"}
              </div>
            ))}
          </div>
        );

      case "countdown":
        return (
          <div className="rounded-xl border border-neutral-200 bg-white/80 p-4 text-neutral-900">
            <div className="text-xs uppercase tracking-[0.16em] text-neutral-500">
              {block.data.heading || "Countdown"}
            </div>
            <div className="mt-2 text-lg font-semibold">00 : 00 : 00</div>
          </div>
        );

      case "padding":
        return (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-neutral-300 text-xs uppercase tracking-[0.18em] text-neutral-400">
            Spacing
          </div>
        );

      default:
        return (
          <div className="rounded-xl border border-neutral-200 bg-white/80 p-4 text-sm text-neutral-700">
            {block.label || block.type}
          </div>
        );
    }
  }

  const canvasBackgroundImage = getPageBackground(draft);
  const canvasPageColor = getPageColor(draft);

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_360px]">
      <ToolboxPanel
        selectedFontFamily={selectedStyle.fontFamily ?? "Inter"}
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

      <div className="min-w-0">
        <div className="rounded-[32px] border border-neutral-800 bg-[linear-gradient(180deg,#0f1115_0%,#171a21_100%)] p-6 shadow-sm">
          <div className="flex min-h-[560px] flex-col px-6 py-8">
            <div
              className="w-full rounded-[28px]"
              style={{
                backgroundColor: canvasPageColor,
                backgroundImage: canvasBackgroundImage
                  ? `linear-gradient(rgba(255,255,255,0.20), rgba(255,255,255,0.20)), url(${canvasBackgroundImage})`
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
      </div>

      <div className="space-y-4 rounded-[24px] border border-white/10 bg-[#111317] p-5 shadow-sm">
        <div className="text-sm font-semibold text-white">
          Business Content
        </div>

        <div className={panelCardClass()}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className={panelTitleClass()}>Background Image</div>

            {canvasBackgroundImage ? (
              <button
                type="button"
                onClick={() =>
                  setDraft((prev) => ({
                    ...(prev as DraftWithExtras),
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
              void handleBackgroundUpload(e.target.files?.[0] || null)
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
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
            Page Color
          </div>

          <div className="flex items-center gap-3">
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
              value={canvasPageColor}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...(prev as DraftWithExtras),
                  pageColor: e.target.value,
                }))
              }
              className={panelFieldClass()}
              placeholder="#ffffff"
            />
          </div>
        </div>

        {isPageVisible(draft, "title") && draft.title !== undefined ? (
          <div className={panelCardClass()}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className={panelTitleClass()}>Title</div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => bringPageSectionToFront("title")}
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

        {isPageVisible(draft, "subtitle") && draft.subtitle !== undefined ? (
          <div className={panelCardClass()}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className={panelTitleClass()}>Subtitle</div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => bringPageSectionToFront("subtitle")}
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

            <textarea
              value={draft.subtitle || ""}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, subtitle: e.target.value }))
              }
              rows={3}
              className={panelFieldClass()}
            />
          </div>
        ) : null}

        {isPageVisible(draft, "subtext") && draft.subtext !== undefined ? (
          <div className={panelCardClass()}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className={panelTitleClass()}>Tagline</div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => bringPageSectionToFront("subtext")}
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
                  onClick={() => bringPageSectionToFront("description")}
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
              value={getDescriptionValue(draft)}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...(prev as DraftWithExtras),
                  description: e.target.value,
                }))
              }
              rows={4}
              className={panelFieldClass()}
            />
          </div>
        ) : null}

        {ctaBlock ? (
          <div className={panelCardClass()}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className={panelTitleClass()}>Button</div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => bringCanvasBlockToFront(ctaBlock.id)}
                  className={panelButtonClass()}
                >
                  Bring to front
                </button>

                <button
                  type="button"
                  onClick={() => removeCanvasBlock(ctaBlock.id)}
                  className={panelButtonClass()}
                >
                  Remove
                </button>
              </div>
            </div>

            <input
              value={ctaBlock.data.buttonText || ""}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  blocks: updateCtaBlockField(
                    prev.blocks,
                    ctaBlock.id,
                    "buttonText",
                    e.target.value,
                  ),
                }))
              }
              placeholder="Button text"
              className={panelFieldClass()}
            />

            <input
              value={ctaBlock.data.buttonUrl || ""}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  blocks: updateCtaBlockField(
                    prev.blocks,
                    ctaBlock.id,
                    "buttonUrl",
                    e.target.value,
                  ),
                }))
              }
              placeholder="Button URL"
              className={`mt-3 ${panelFieldClass()}`}
            />
          </div>
        ) : null}

        {countdownBlock ? (
          <div className={panelCardClass()}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className={panelTitleClass()}>Countdown</div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => bringCanvasBlockToFront(countdownBlock.id)}
                  className={panelButtonClass()}
                >
                  Bring to front
                </button>

                <button
                  type="button"
                  onClick={() => removeCanvasBlock(countdownBlock.id)}
                  className={panelButtonClass()}
                >
                  Remove
                </button>
              </div>
            </div>

            <input
              value={countdownBlock.data.heading || ""}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  blocks: updateCountdownField(
                    prev.blocks,
                    countdownBlock.id,
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
              value={countdownBlock.data.targetIso || ""}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  blocks: updateCountdownField(
                    prev.blocks,
                    countdownBlock.id,
                    "targetIso",
                    e.target.value,
                  ),
                }))
              }
              className={`mt-3 ${panelFieldClass()}`}
            />
          </div>
        ) : null}

        {imageBlocks.map((block, index) => (
          <div
            key={block.id}
            className={panelCardClass()}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className={panelTitleClass()}>
                Image {index + 1}
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

            {block.data.image.url ? (
              <img
                src={block.data.image.url}
                alt={block.data.image.alt || ""}
                className="h-40 w-full rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-white/10 text-sm text-white/45">
                Image placeholder
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                void handleImageUpload(block.id, e.target.files?.[0] || null)
              }
              className="mt-3 w-full text-sm text-white/70"
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
              className={`mt-3 ${panelFieldClass()}`}
            />
          </div>
        ))}

        {labelBlocks.map((block, index) => (
          <div
            key={block.id}
            className={panelCardClass()}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className={panelTitleClass()}>
                Label {index + 1}
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

            <textarea
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
              rows={3}
              className={panelFieldClass()}
            />
          </div>
        ))}

        {linksBlock ? (
          <div className={panelCardClass()}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className={panelTitleClass()}>Navigation Links</div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => bringCanvasBlockToFront(linksBlock.id)}
                  className={panelButtonClass()}
                >
                  Bring to front
                </button>

                <button
                  type="button"
                  onClick={() => removeCanvasBlock(linksBlock.id)}
                  className={panelButtonClass()}
                >
                  Remove
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setDraft((prev) => ({
                  ...prev,
                  blocks: addNavigationLink(prev.blocks, linksBlock.id),
                }))
              }
              className={`mb-3 ${panelButtonClass()}`}
            >
              Add Link
            </button>

            <input
              value={linksBlock.data.heading || ""}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  blocks: updateLinksHeading(
                    prev.blocks,
                    linksBlock.id,
                    e.target.value,
                  ),
                }))
              }
              className={`mb-3 ${panelFieldClass()}`}
              placeholder="Heading"
            />

            <div className="space-y-3">
              {linksBlock.data.items.map((item: LinkItem) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/10 p-3"
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
                    className={panelFieldClass()}
                    placeholder="Label"
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
                    className={`mt-3 ${panelFieldClass()}`}
                    placeholder="URL"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        blocks: removeNavigationLink(prev.blocks, item.id),
                      }))
                    }
                    className={`mt-3 ${panelButtonClass()}`}
                  >
                    Remove Link
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}