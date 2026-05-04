import type { CanvasGridItem } from "@/components/templates/design-editors/shared/GridCanvas";

import {
  GRID_COLUMNS,
  clamp,
  normalizeGrid,
  type GridPlacementWithLayer,
} from "./canvasGridUtils";

/* ------------------------------------------------ */
/* NEW SNAP SYSTEM */
/* ------------------------------------------------ */

const SNAP_STEP = 0.25; // quarter column snapping

function snap(value: number) {
  return Math.round(value / SNAP_STEP) * SNAP_STEP;
}

/* ------------------------------------------------ */
/* NORMALIZE */
/* ------------------------------------------------ */

export function normalizeCanvasItems(items: CanvasGridItem[]) {
  return items.map((item, index) => ({
    ...item,
    grid: normalizeGrid(
      item.grid as Partial<GridPlacementWithLayer> | undefined,
      index + 1,
    ),
  }));
}

/* ------------------------------------------------ */
/* MOVE BLOCK */
/* ------------------------------------------------ */

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

      const nextColStart = clamp(
        snap(patch.colStart),
        1,
        Math.max(1, GRID_COLUMNS - grid.colSpan + 1),
      );

      const nextRowStart = Math.max(1, snap(patch.rowStart));

      return {
        ...item,
        grid: {
          ...grid,
          colStart: nextColStart,
          rowStart: nextRowStart,
        },
      };
    }),
  );
}

/* ------------------------------------------------ */
/* RESIZE BLOCK */
/* ------------------------------------------------ */

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
              snap(patch.colStart),
              1,
              Math.max(1, grid.colStart + grid.colSpan - SNAP_STEP),
            )
          : grid.colStart;

      const nextColSpan = clamp(
        snap(patch.colSpan ?? grid.colSpan),
        SNAP_STEP,
        GRID_COLUMNS - nextColStart + 1,
      );

      const nextRowSpan = Math.max(
        SNAP_STEP,
        snap(patch.rowSpan ?? grid.rowSpan),
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

/* ------------------------------------------------ */
/* BRING TO FRONT */
/* ------------------------------------------------ */

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
export function sendCanvasItemToBack(
  items: CanvasGridItem[],
  blockId: string,
) {
  const lowest = items.reduce((min, item, index) => {
    const normalized = normalizeGrid(
      item.grid as Partial<GridPlacementWithLayer> | undefined,
      index + 1,
    );

    return Math.min(min, normalized.zIndex ?? 1);
  }, Number.POSITIVE_INFINITY);

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
          zIndex: Number.isFinite(lowest) ? lowest - 1 : 1,
        },
      };
    }),
  );
}