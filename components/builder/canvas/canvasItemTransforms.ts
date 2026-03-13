import type { CanvasGridItem } from "@/components/templates/design-editors/shared/GridCanvas";
import {
  GRID_COLUMNS,
  GRID_STEP,
  clamp,
  snapToHalf,
  normalizeGrid,
  type GridPlacementWithLayer,
} from "./canvasGridUtils";

export function normalizeCanvasItems(items: CanvasGridItem[]) {
  return items.map((item, index) => ({
    ...item,
    grid: normalizeGrid(
      item.grid as Partial<GridPlacementWithLayer> | undefined,
      index + 1,
    ),
  }));
}

export function moveCanvasItemToCell(
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

export function resizeCanvasItem(
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

      const nextColStart =
        patch.colStart !== undefined
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

export function bringCanvasItemToFront(
  items: CanvasGridItem[],
  blockId: string,
) {
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