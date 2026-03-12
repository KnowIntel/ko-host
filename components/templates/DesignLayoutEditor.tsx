"use client";

import { useMemo, useState } from "react";
import ToolboxPanel, {
  type PageBlockType,
} from "@/components/templates/design-editors/shared/ToolboxPanel";
import GridCanvas, {
  type CanvasGridItem,
} from "@/components/templates/design-editors/shared/GridCanvas";
import BlockRenderer from "@/components/preview/BlockRenderer";
import { renderDesignAwarePageText } from "@/components/designs/designPreviewPrimitives";

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
  TextAlign,
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

import {
  getTemplateDesignOverlayMetadata,
  type OverlayDesignMetadata,
  type OverlayPageElement,
} from "@/lib/templates/templateDesignOverlayMetadata";
import type { DesignPresetLayout } from "@/lib/templates/designPresets";

type Props = {
  templateKey: string;
  designKey: string;
  draft: BuilderDraft;
  setDraft: React.Dispatch<React.SetStateAction<BuilderDraft>>;
};

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
  pageColor?: string | null;
  pageVisibility?: Partial<PageVisibility>;
  pageElements?: {
    title?: Partial<GridPlacementWithLayer>;
    subtitle?: Partial<GridPlacementWithLayer>;
    subtext?: Partial<GridPlacementWithLayer>;
    description?: Partial<GridPlacementWithLayer>;
  };
};

const GRID_COLUMNS = 12;
const GRID_STEP = 0.5;

/* ---------------------------------------- */
/* Shared helpers                            */
/* ---------------------------------------- */

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function snapToHalf(value: number) {
  return Math.round(value / GRID_STEP) * GRID_STEP;
}

function coerceDraft(draft: BuilderDraft): DraftWithExtras {
  return draft as DraftWithExtras;
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
  patch: { colSpan?: number; rowSpan?: number; colStart?: number },
) {
  return normalizeCanvasItems(
    items.map((item) => {
      if (item.id !== blockId) return item;

      const grid = normalizeGrid(
        item.grid as Partial<GridPlacementWithLayer> | undefined,
        1,
      );

      const nextColStart = patch.colStart !== undefined
        ? clamp(
            snapToHalf(patch.colStart),
            1,
            Math.max(1, grid.colStart + grid.colSpan - GRID_STEP),
          )
        : grid.colStart;

      const nextColSpan = clamp(
        snapToHalf(patch.colSpan ?? grid.colSpan),
        GRID_STEP,
        GRID_COLUMNS - nextColStart + 1,
      );

      const nextRowSpan = Math.max(
        GRID_STEP,
        snapToHalf(patch.rowSpan ?? grid.rowSpan),
      );

      return {
        ...item,
        grid: {
          ...grid,
          colStart: nextColStart,
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
    return { colStart: 1, rowStart: 4, colSpan: 8, rowSpan: 1, zIndex: 3 };
  }
  return { colStart: 1, rowStart: 5, colSpan: 8, rowSpan: 2, zIndex: 4 };
}

function getCanvasShellClass(designKey: string) {
  if (designKey === "modern") {
    return "rounded-[32px] border border-neutral-800 bg-[linear-gradient(180deg,#0f1115_0%,#171a21_100%)] p-6 shadow-sm";
  }

  return "rounded-[32px] border border-neutral-200 bg-white p-6 shadow-sm";
}

function panelCardClass(designKey: string) {
  return designKey === "modern"
    ? "rounded-xl border border-white/10 bg-black/20 p-4"
    : "rounded-xl border border-neutral-200 bg-white p-4";
}

function panelTitleClass(designKey: string) {
  return designKey === "modern"
    ? "text-xs font-semibold uppercase tracking-[0.16em] text-white/60"
    : "text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500";
}

function panelFieldClass(designKey: string) {
  return designKey === "modern"
    ? "w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-white"
    : "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-900";
}

function panelButtonClass(designKey: string) {
  return designKey === "modern"
    ? "rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-white/70 hover:bg-white/10"
    : "rounded-lg border border-neutral-300 px-2.5 py-1 text-[11px] text-neutral-700 hover:bg-neutral-100";
}

/* ---------------------------------------- */
/* Metadata helpers                          */
/* ---------------------------------------- */

function getMetadata(
  templateKey: string,
  designKey: string,
): OverlayDesignMetadata | null {
  return getTemplateDesignOverlayMetadata(
    templateKey,
    designKey as DesignPresetLayout,
  );
}

function getMetadataPageElement(
  metadata: OverlayDesignMetadata | null,
  key: "title" | "subtitle" | "tagline" | "description",
): OverlayPageElement | null {
  if (!metadata) return null;
  return metadata.page[key] ?? null;
}

function getResolvedPageVisibility(
  draft: BuilderDraft,
  metadata: OverlayDesignMetadata | null,
): PageVisibility {
  const visibility = coerceDraft(draft).pageVisibility ?? {};

  return {
    title: visibility.title ?? getMetadataPageElement(metadata, "title")?.enabled ?? true,
    subtitle:
      visibility.subtitle ??
      getMetadataPageElement(metadata, "subtitle")?.enabled ??
      true,
    subtext:
      visibility.subtext ??
      getMetadataPageElement(metadata, "tagline")?.enabled ??
      false,
    description:
      visibility.description ??
      getMetadataPageElement(metadata, "description")?.enabled ??
      true,
  };
}

function getResolvedPageStyle(
  draftStyle: TextStyle | undefined,
  metadataStyle: TextStyle | undefined,
) {
  return draftStyle ?? metadataStyle;
}

function getResolvedPageValue(
  draftValue: string | undefined,
  metadataValue: string | undefined,
) {
  return draftValue || metadataValue || "";
}

function getResolvedPageGrid(
  draftGrid: Partial<GridPlacementWithLayer> | undefined,
  metadataGrid: GridPlacement | undefined,
  fallback: GridPlacementWithLayer,
) {
  return draftGrid ?? metadataGrid ?? fallback;
}

function getResolvedPageColor(
  draft: BuilderDraft,
  designKey: string,
  metadata: OverlayDesignMetadata | null,
) {
  const explicit = coerceDraft(draft).pageColor;
  if (explicit) return explicit;
  if (metadata?.pageColor) return metadata.pageColor;

  if (designKey === "modern") return "#0f1115";
  if (designKey === "elegant") return "#f7f2eb";
  if (designKey === "festive") return "#f8f1ea";
  return "#ffffff";
}

function getCanvasInnerBackgroundStyle(
  draft: BuilderDraft,
  designKey: string,
  metadata: OverlayDesignMetadata | null,
): React.CSSProperties {
  const pageColor = getResolvedPageColor(draft, designKey, metadata);
  const backgroundImage = draft.pageBackground || metadata?.pageBackground || "";

  if (designKey === "modern") {
    return {
      backgroundColor: pageColor,
      backgroundImage: backgroundImage
        ? `linear-gradient(rgba(15,17,21,0.18), rgba(23,26,33,0.18)), url(${backgroundImage})`
        : undefined,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }

  return {
    backgroundColor: pageColor,
    backgroundImage: backgroundImage
      ? `linear-gradient(rgba(255,255,255,0.18), rgba(255,255,255,0.18)), url(${backgroundImage})`
      : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };
}

/* ---------------------------------------- */
/* Canvas page items                         */
/* ---------------------------------------- */

function buildPageCanvasItems(
  draft: BuilderDraft,
  metadata: OverlayDesignMetadata | null,
): CanvasGridItem[] {
  const visibility = getResolvedPageVisibility(draft, metadata);
  const pageElements = coerceDraft(draft).pageElements ?? {};
  const items: CanvasGridItem[] = [];

  if (visibility.title) {
    items.push({
      id: PAGE_TITLE_BLOCK_ID,
      type: "page:title",
      label: "Title",
      grid: getResolvedPageGrid(
        pageElements.title,
        getMetadataPageElement(metadata, "title")?.grid,
        getDefaultPageElementGrid("title"),
      ),
    });
  }

  if (visibility.subtitle) {
    items.push({
      id: PAGE_SUBTITLE_BLOCK_ID,
      type: "page:subtitle",
      label: "Subtitle",
      grid: getResolvedPageGrid(
        pageElements.subtitle,
        getMetadataPageElement(metadata, "subtitle")?.grid,
        getDefaultPageElementGrid("subtitle"),
      ),
    });
  }

  if (visibility.subtext) {
    items.push({
      id: PAGE_SUBTEXT_BLOCK_ID,
      type: "page:subtext",
      label: "Tagline",
      grid: getResolvedPageGrid(
        pageElements.subtext,
        getMetadataPageElement(metadata, "tagline")?.grid,
        getDefaultPageElementGrid("subtext"),
      ),
    });
  }

  if (visibility.description) {
    items.push({
      id: PAGE_DESCRIPTION_BLOCK_ID,
      type: "page:description",
      label: "Description",
      grid: getResolvedPageGrid(
        pageElements.description,
        getMetadataPageElement(metadata, "description")?.grid,
        getDefaultPageElementGrid("description"),
      ),
    });
  }

  return items;
}

function applyCanvasItemsToDraft(
  prev: BuilderDraft,
  canvasItems: CanvasGridItem[],
): BuilderDraft {
  const draft = coerceDraft(prev);

  const titleGrid = canvasItems.find((item) => item.id === PAGE_TITLE_BLOCK_ID)?.grid;
  const subtitleGrid = canvasItems.find((item) => item.id === PAGE_SUBTITLE_BLOCK_ID)?.grid;
  const subtextGrid = canvasItems.find((item) => item.id === PAGE_SUBTEXT_BLOCK_ID)?.grid;
  const descriptionGrid = canvasItems.find((item) => item.id === PAGE_DESCRIPTION_BLOCK_ID)?.grid;

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
            ? { zIndex: mapped.zIndex }
            : normalizedExisting.zIndex !== undefined
              ? { zIndex: normalizedExisting.zIndex }
              : {}),
        },
      };
    }),
  };
}

/* ---------------------------------------- */
/* Master editor                             */
/* ---------------------------------------- */

export default function DesignLayoutEditor({
  templateKey,
  designKey,
  draft,
  setDraft,
}: Props) {
  const [selection, setSelection] = useState(createEmptySelection());

  const metadata = useMemo(
    () => getMetadata(templateKey, designKey),
    [templateKey, designKey],
  );

  const pageCanvasItems = useMemo(
    () => buildPageCanvasItems(draft, metadata),
    [draft, metadata],
  );

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
          ...(normalized.zIndex !== undefined ? { zIndex: normalized.zIndex } : {}),
        },
      } as MicrositeBlock;
    });
  }, [draft.blocks]);

  const canvasItems = useMemo(
    () =>
      normalizeCanvasItems([
        ...pageCanvasItems,
        ...renderedBlocks.map((block) => ({
          id: block.id,
          type: block.type,
          label: block.label,
          grid: block.grid,
        })),
      ]),
    [pageCanvasItems, renderedBlocks],
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
      blocks: addBlockTypeToDraft(prev.blocks, type),
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
    setDraft((prev) =>
      applyCanvasItemsToDraft(
        prev,
        bringCanvasItemToFront(
          [
            ...buildPageCanvasItems(prev, metadata),
            ...prev.blocks.map((block) => ({
              id: block.id,
              type: block.type,
              label: block.label,
              grid: block.grid,
            })),
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
            ...buildPageCanvasItems(prev, metadata),
            ...prev.blocks.map((block) => ({
              id: block.id,
              type: block.type,
              label: block.label,
              grid: block.grid,
            })),
          ],
          blockId,
          patch,
        ),
      ),
    );
  }

  function handleResizeBlock(
    blockId: string,
    patch: { colSpan?: number; rowSpan?: number; colStart?: number },
  ) {
    setDraft((prev) =>
      applyCanvasItemsToDraft(
        prev,
        resizeCanvasItem(
          [
            ...buildPageCanvasItems(prev, metadata),
            ...prev.blocks.map((block) => ({
              id: block.id,
              type: block.type,
              label: block.label,
              grid: block.grid,
            })),
          ],
          blockId,
          patch,
        ),
      ),
    );
  }

  function handleCanvasSelect(nextSelection: any) {
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
    const titleMeta = getMetadataPageElement(metadata, "title");
    const subtitleMeta = getMetadataPageElement(metadata, "subtitle");
    const taglineMeta = getMetadataPageElement(metadata, "tagline");
    const descriptionMeta = getMetadataPageElement(metadata, "description");

    if (item.id === PAGE_TITLE_BLOCK_ID) {
      return (
        <div className="h-full">
          <div className="mt-3">
            {renderDesignAwarePageText({
              designKey,
              kind: "title",
              value: getResolvedPageValue(draft.title, titleMeta?.value),
              style: getResolvedPageStyle(draft.titleStyle, titleMeta?.style),
              forCanvas: true,
            })}
          </div>
        </div>
      );
    }

    if (item.id === PAGE_SUBTITLE_BLOCK_ID) {
      return (
        <div className="h-full">
          <div className="mt-3">
            {renderDesignAwarePageText({
              designKey,
              kind: "subtitle",
              value: getResolvedPageValue(draft.subtitle, subtitleMeta?.value),
              style: getResolvedPageStyle(draft.subtitleStyle, subtitleMeta?.style),
              forCanvas: true,
            })}
          </div>
        </div>
      );
    }

    if (item.id === PAGE_SUBTEXT_BLOCK_ID) {
      return (
        <div className="h-full">
          <div className="mt-3">
            {renderDesignAwarePageText({
              designKey,
              kind: "tagline",
              value: getResolvedPageValue(draft.subtext, taglineMeta?.value),
              style: getResolvedPageStyle(draft.subtextStyle, taglineMeta?.style),
              forCanvas: true,
            })}
          </div>
        </div>
      );
    }

    if (item.id === PAGE_DESCRIPTION_BLOCK_ID) {
      return (
        <div className="h-full">
          <div className="mt-3">
            {renderDesignAwarePageText({
              designKey,
              kind: "description",
              value: getResolvedPageValue(draft.description, descriptionMeta?.value),
              style: getResolvedPageStyle(
                draft.descriptionStyle,
                descriptionMeta?.style,
              ),
              forCanvas: true,
            })}
          </div>
        </div>
      );
    }

    const block = renderedBlocks.find((b) => b.id === item.id);
    if (!block) {
      return <div className="text-xs uppercase text-white/60">{item.type}</div>;
    }

    return <BlockRenderer block={block} designKey={designKey} />;
  }

  const rightPanelShellClass =
    designKey === "modern"
      ? "space-y-4 rounded-[24px] border border-white/10 bg-[#111317] p-5 shadow-sm"
      : "space-y-4 rounded-[24px] border border-neutral-200 bg-white p-5 shadow-sm";

  const rightPanelTitleClass =
    designKey === "modern"
      ? "text-sm font-semibold text-white"
      : "text-sm font-semibold text-neutral-900";

  const mutedTextClass =
    designKey === "modern" ? "text-white/55" : "text-neutral-500";

  const resolvedPageVisibility = getResolvedPageVisibility(draft, metadata);
  const resolvedPageColor = getResolvedPageColor(draft, designKey, metadata);

  return (
    <div className="space-y-6">
      <div
        className={
          designKey === "modern"
            ? "rounded-[24px] border border-neutral-800 bg-[linear-gradient(180deg,#0f1115_0%,#171a21_100%)] px-6 py-4 text-white shadow-sm"
            : "rounded-[24px] border border-neutral-200 bg-white px-6 py-4 text-neutral-900 shadow-sm"
        }
      >
        <div className="text-sm font-semibold">
          {designKey.charAt(0).toUpperCase() + designKey.slice(1)} Design Layout
        </div>
        <div className={`mt-1 text-sm ${mutedTextClass}`}>
          Template: {templateKey}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_360px]">
        <ToolboxPanel
          selectedFontFamily={selectedStyle.fontFamily ?? "inherit"}
          selectedFontSize={selectedStyle.fontSize ?? 16}
          selectedBold={selectedStyle.bold ?? false}
          selectedItalic={selectedStyle.italic ?? false}
          selectedUnderline={selectedStyle.underline ?? false}
          selectedColor={selectedStyle.color ?? "#111827"}
          onFontFamilyChange={(value) => applyStylePatch({ fontFamily: value })}
          onFontSizeChange={(value) => applyStylePatch({ fontSize: value })}
          onBoldChange={(value) => applyStylePatch({ bold: value })}
          onItalicChange={(value) => applyStylePatch({ italic: value })}
          onUnderlineChange={(value) => applyStylePatch({ underline: value })}
          onAlignChange={(value: TextAlign) => applyStylePatch({ align: value })}
          onColorChange={(value) => applyStylePatch({ color: value })}
          onAddBlock={addBlock}
          onAddPageBlock={addPageBlock}
        />

        <div className="min-w-0">
          <div className={getCanvasShellClass(designKey)}>
            <div className="flex min-h-[560px] flex-col px-6 py-8">
              <div
                className="w-full rounded-[28px]"
                style={getCanvasInnerBackgroundStyle(draft, designKey, metadata)}
              >
                <GridCanvas
                  blocks={canvasItems}
                  selection={selection as any}
                  onSelect={handleCanvasSelect}
                  onMoveBlock={handleMoveBlock}
                  onResizeBlock={handleResizeBlock}
                  onBringToFront={bringCanvasBlockToFront}
                  onRemoveBlock={removeCanvasBlock}
                  renderBlockPreview={renderCanvasPreview}
                  isItemSelected={(blockId, nextSelection) =>
                    isCanvasBlockSelected(nextSelection as any, blockId)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className={rightPanelShellClass}>
          <div className={rightPanelTitleClass}>
            {designKey.charAt(0).toUpperCase() + designKey.slice(1)} Content
          </div>

          <div className={panelCardClass(designKey)}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className={panelTitleClass(designKey)}>Background Image</div>

              {draft.pageBackground ? (
                <button
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      pageBackground: "",
                    }))
                  }
                  className={panelButtonClass(designKey)}
                >
                  Remove
                </button>
              ) : null}
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                void handleBackgroundImageUpload(e.target.files?.[0] || null)
              }
              className={
                designKey === "modern"
                  ? "block w-full text-sm text-white/70"
                  : "block w-full text-sm text-neutral-700"
              }
            />
          </div>

          <div className={panelCardClass(designKey)}>
            <div className={panelTitleClass(designKey)}>Page Color</div>

            <div className="mt-3 flex items-center gap-3">
              <input
                type="color"
                value={resolvedPageColor}
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
                value={resolvedPageColor}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...(prev as DraftWithExtras),
                    pageColor: e.target.value,
                  }))
                }
                className={panelFieldClass(designKey)}
              />
            </div>
          </div>

          {resolvedPageVisibility.title ? (
            <div className={panelCardClass(designKey)}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className={panelTitleClass(designKey)}>Title</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => bringCanvasBlockToFront(PAGE_TITLE_BLOCK_ID)}
                    className={panelButtonClass(designKey)}
                  >
                    Bring to front
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCanvasBlock(PAGE_TITLE_BLOCK_ID)}
                    className={panelButtonClass(designKey)}
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
                className={panelFieldClass(designKey)}
              />
            </div>
          ) : null}

          {resolvedPageVisibility.subtitle ? (
            <div className={panelCardClass(designKey)}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className={panelTitleClass(designKey)}>Subtitle</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => bringCanvasBlockToFront(PAGE_SUBTITLE_BLOCK_ID)}
                    className={panelButtonClass(designKey)}
                  >
                    Bring to front
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCanvasBlock(PAGE_SUBTITLE_BLOCK_ID)}
                    className={panelButtonClass(designKey)}
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
                className={panelFieldClass(designKey)}
              />
            </div>
          ) : null}

          {resolvedPageVisibility.subtext ? (
            <div className={panelCardClass(designKey)}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className={panelTitleClass(designKey)}>Tagline</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => bringCanvasBlockToFront(PAGE_SUBTEXT_BLOCK_ID)}
                    className={panelButtonClass(designKey)}
                  >
                    Bring to front
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCanvasBlock(PAGE_SUBTEXT_BLOCK_ID)}
                    className={panelButtonClass(designKey)}
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
                className={panelFieldClass(designKey)}
              />
            </div>
          ) : null}

          {resolvedPageVisibility.description ? (
            <div className={panelCardClass(designKey)}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className={panelTitleClass(designKey)}>Description</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => bringCanvasBlockToFront(PAGE_DESCRIPTION_BLOCK_ID)}
                    className={panelButtonClass(designKey)}
                  >
                    Bring to front
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCanvasBlock(PAGE_DESCRIPTION_BLOCK_ID)}
                    className={panelButtonClass(designKey)}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <textarea
                rows={4}
                value={draft.description || ""}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className={panelFieldClass(designKey)}
              />
            </div>
          ) : null}

          {renderedBlocks.map((block) => {
            if (block.type === "padding") return null;

            return (
              <div key={block.id} className={panelCardClass(designKey)}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className={panelTitleClass(designKey)}>
                    {block.label || block.type}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => bringCanvasBlockToFront(block.id)}
                      className={panelButtonClass(designKey)}
                    >
                      Bring to front
                    </button>

                    <button
                      type="button"
                      onClick={() => removeCanvasBlock(block.id)}
                      className={panelButtonClass(designKey)}
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
                    className={panelFieldClass(designKey)}
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
                      className={
                        designKey === "modern"
                          ? "block w-full text-sm text-white/70"
                          : "block w-full text-sm text-neutral-700"
                      }
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
                      className={panelFieldClass(designKey)}
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
                      className={panelFieldClass(designKey)}
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
                      className={panelFieldClass(designKey)}
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
                      className={panelFieldClass(designKey)}
                    />

                    {block.data.items.map((item: LinkItem) => (
                      <div
                        key={item.id}
                        className={
                          designKey === "modern"
                            ? "space-y-2 rounded-xl border border-white/10 p-3"
                            : "space-y-2 rounded-xl border border-neutral-200 p-3"
                        }
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
                          className={panelFieldClass(designKey)}
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
                          className={panelFieldClass(designKey)}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              blocks: removeNavigationLink(prev.blocks, item.id),
                            }))
                          }
                          className={panelButtonClass(designKey)}
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
                      className={
                        designKey === "modern"
                          ? "rounded-lg border border-white/10 px-3 py-2 text-sm text-white/80"
                          : "rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-800"
                      }
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
                      className={panelFieldClass(designKey)}
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
                      className={panelFieldClass(designKey)}
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
                      className={panelFieldClass(designKey)}
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
                          className={`flex-1 ${panelFieldClass(designKey)}`}
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
                          className={panelButtonClass(designKey)}
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
                      className={
                        designKey === "modern"
                          ? "rounded-lg border border-white/10 px-3 py-2 text-sm text-white/80"
                          : "rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-800"
                      }
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
                      className={panelFieldClass(designKey)}
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
                        className={
                          designKey === "modern"
                            ? "flex items-center gap-3 text-sm text-white/80"
                            : "flex items-center gap-3 text-sm text-neutral-800"
                        }
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
                        className={
                          designKey === "modern"
                            ? "space-y-2 rounded-xl border border-white/10 p-3"
                            : "space-y-2 rounded-xl border border-neutral-200 p-3"
                        }
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
                          className={panelFieldClass(designKey)}
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
                          className={panelFieldClass(designKey)}
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
                          className={panelButtonClass(designKey)}
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
                      className={
                        designKey === "modern"
                          ? "rounded-lg border border-white/10 px-3 py-2 text-sm text-white/80"
                          : "rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-800"
                      }
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
                      className={
                        designKey === "modern"
                          ? "block w-full text-sm text-white/70"
                          : "block w-full text-sm text-neutral-700"
                      }
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
                      className={panelFieldClass(designKey)}
                    >
                      <option value="2">2 x 2</option>
                      <option value="3">3 x 3</option>
                      <option value="4">4 x 4</option>
                    </select>

                    <div className={`text-xs ${mutedTextClass}`}>
                      {block.data.images.length} image
                      {block.data.images.length === 1 ? "" : "s"} selected
                    </div>
                  </div>
                ) : null}

                {block.type === "thread" ? (
                  <div className="space-y-3">
                    <input
                      value={(block.data as { subject?: string }).subject || ""}
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
                      className={panelFieldClass(designKey)}
                    />

                    <label
                      className={
                        designKey === "modern"
                          ? "flex items-center gap-3 text-sm text-white/80"
                          : "flex items-center gap-3 text-sm text-neutral-800"
                      }
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(
                          (block.data as { allowAnonymous?: boolean }).allowAnonymous,
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

                    <label
                      className={
                        designKey === "modern"
                          ? "flex items-center gap-3 text-sm text-white/80"
                          : "flex items-center gap-3 text-sm text-neutral-800"
                      }
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(
                          (block.data as { requireApproval?: boolean }).requireApproval,
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
        </div>
      </div>
    </div>
  );
}