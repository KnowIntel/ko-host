import type { BuilderDraft } from "@/lib/templates/builder";
import type { CanvasGridItem } from "@/components/templates/design-editors/shared/GridCanvas";
import type { OverlayDesignMetadata } from "@/lib/templates/templateDesignOverlayMetadata";

import {
  PAGE_DESCRIPTION_BLOCK_ID,
  PAGE_SUBTEXT_BLOCK_ID,
  PAGE_SUBTITLE_BLOCK_ID,
  PAGE_TITLE_BLOCK_ID,
} from "@/components/templates/design-editors/shared/EditorSelection";

import {
  normalizeGrid,
  type GridPlacementWithLayer,
} from "./canvasGridUtils";

type DraftWithExtras = BuilderDraft & {
  pageElements?: {
    title?: Partial<GridPlacementWithLayer>;
    subtitle?: Partial<GridPlacementWithLayer>;
    subtext?: Partial<GridPlacementWithLayer>;
    description?: Partial<GridPlacementWithLayer>;
  };
  pageVisibility?: Partial<{
    title: boolean;
    subtitle: boolean;
    subtext: boolean;
    description: boolean;
  }>;
};

function coerceDraft(draft: BuilderDraft): DraftWithExtras {
  return draft as DraftWithExtras;
}

export function getDefaultPageElementGrid(
  key: "title" | "subtitle" | "subtext" | "description",
): GridPlacementWithLayer {
  if (key === "title") {
    return {
      colStart: 2,
      rowStart: 1,
      colSpan: 8,
      rowSpan: 2,
      zIndex: 1,
    };
  }

  if (key === "subtitle") {
    return {
      colStart: 2,
      rowStart: 3,
      colSpan: 7,
      rowSpan: 1,
      zIndex: 2,
    };
  }

  if (key === "subtext") {
    return {
      colStart: 2,
      rowStart: 4,
      colSpan: 6,
      rowSpan: 1,
      zIndex: 3,
    };
  }

  return {
    colStart: 2,
    rowStart: 5,
    colSpan: 8,
    rowSpan: 2,
    zIndex: 4,
  };
}

function isVisible(
  draft: DraftWithExtras,
  key: "title" | "subtitle" | "subtext" | "description",
) {
  return draft.pageVisibility?.[key] !== false;
}

export function buildPageCanvasItems(
  draft: BuilderDraft,
  metadata: OverlayDesignMetadata | null,
): CanvasGridItem[] {
  const next = coerceDraft(draft);
  const pageElements = next.pageElements ?? {};
  const items: CanvasGridItem[] = [];

  if (isVisible(next, "title")) {
    items.push({
      id: PAGE_TITLE_BLOCK_ID,
      type: "page:title",
      label: "Title",
      grid:
        pageElements.title ??
        metadata?.page.title?.grid ??
        getDefaultPageElementGrid("title"),
    });
  }

  if (isVisible(next, "subtitle")) {
    items.push({
      id: PAGE_SUBTITLE_BLOCK_ID,
      type: "page:subtitle",
      label: "Subtitle",
      grid:
        pageElements.subtitle ??
        metadata?.page.subtitle?.grid ??
        getDefaultPageElementGrid("subtitle"),
    });
  }

  if (isVisible(next, "subtext")) {
    items.push({
      id: PAGE_SUBTEXT_BLOCK_ID,
      type: "page:subtext",
      label: "Tagline",
      grid:
        pageElements.subtext ??
        metadata?.page.tagline?.grid ??
        getDefaultPageElementGrid("subtext"),
    });
  }

  if (isVisible(next, "description")) {
    items.push({
      id: PAGE_DESCRIPTION_BLOCK_ID,
      type: "page:description",
      label: "Description",
      grid:
        pageElements.description ??
        metadata?.page.description?.grid ??
        getDefaultPageElementGrid("description"),
    });
  }

  return items;
}

export function applyCanvasItemsToDraft(
  prev: BuilderDraft,
  canvasItems: CanvasGridItem[],
): BuilderDraft {
  const draft = coerceDraft(prev);

  const titleGrid = canvasItems.find((i) => i.id === PAGE_TITLE_BLOCK_ID)?.grid;
  const subtitleGrid = canvasItems.find((i) => i.id === PAGE_SUBTITLE_BLOCK_ID)?.grid;
  const subtextGrid = canvasItems.find((i) => i.id === PAGE_SUBTEXT_BLOCK_ID)?.grid;
  const descriptionGrid = canvasItems.find((i) => i.id === PAGE_DESCRIPTION_BLOCK_ID)?.grid;

  const pageItems = {
    ...(draft.pageElements ?? {}),
    title: titleGrid
      ? normalizeGrid(titleGrid, 1)
      : draft.pageElements?.title ?? getDefaultPageElementGrid("title"),
    subtitle: subtitleGrid
      ? normalizeGrid(subtitleGrid, 2)
      : draft.pageElements?.subtitle ?? getDefaultPageElementGrid("subtitle"),
    subtext: subtextGrid
      ? normalizeGrid(subtextGrid, 3)
      : draft.pageElements?.subtext ?? getDefaultPageElementGrid("subtext"),
    description: descriptionGrid
      ? normalizeGrid(descriptionGrid, 4)
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
        normalizeGrid(item.grid, index + 1),
      ]),
  );

  const nextBlocks = prev.blocks.map((block, index) => {
    const mapped = blockGridMap.get(block.id);
    const normalizedExisting = normalizeGrid(block.grid, index + 1);

    return {
      ...block,
      grid: {
        colStart: mapped?.colStart ?? normalizedExisting.colStart,
        rowStart: mapped?.rowStart ?? normalizedExisting.rowStart,
        colSpan: mapped?.colSpan ?? normalizedExisting.colSpan,
        rowSpan: mapped?.rowSpan ?? normalizedExisting.rowSpan,
        zIndex: mapped?.zIndex ?? normalizedExisting.zIndex,
      },
    };
  });

  return {
    ...prev,
    pageElements: pageItems,
    blocks: nextBlocks,
  };
}