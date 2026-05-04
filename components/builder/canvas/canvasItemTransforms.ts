// components\builder\canvas\canvasItemTransforms.ts
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
      item.grid?.zIndex ?? index + 1,
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
/* LAYERING */
/* ------------------------------------------------ */

function getLayerValue(item: CanvasGridItem) {
  return Number(item.grid?.zIndex ?? 1);
}

export function bringCanvasItemToFront(
  items: CanvasGridItem[],
  blockId: string,
) {
  const normalizedItems = normalizeCanvasItems(items);
  const highest = Math.max(
    1,
    ...normalizedItems.map((item) => getLayerValue(item)),
  );

  return normalizedItems.map((item) =>
    item.id === blockId
      ? {
          ...item,
          grid: {
            ...item.grid,
            zIndex: highest + 1,
          },
        }
      : item,
  );
}

export function sendCanvasItemToBack(
  items: CanvasGridItem[],
  blockId: string,
) {
  const normalizedItems = normalizeCanvasItems(items);
  const lowest = Math.min(
    1,
    ...normalizedItems.map((item) => getLayerValue(item)),
  );

  return normalizedItems.map((item) =>
    item.id === blockId
      ? {
          ...item,
          grid: {
            ...item.grid,
            zIndex: lowest - 1,
          },
        }
      : item,
  );
}

export function moveCanvasItemForward(
  items: CanvasGridItem[],
  blockId: string,
) {
  const normalizedItems = normalizeCanvasItems(items);

  const sorted = [...normalizedItems].sort(
    (a, b) => getLayerValue(a) - getLayerValue(b),
  );

  const index = sorted.findIndex((item) => item.id === blockId);
  if (index === -1 || index === sorted.length - 1) return normalizedItems;

  const current = sorted[index];
  const next = sorted[index + 1];

  return normalizedItems.map((item) => {
    if (item.id === current.id) {
      return {
        ...item,
        grid: {
          ...item.grid,
          zIndex: getLayerValue(next),
        },
      };
    }

    if (item.id === next.id) {
      return {
        ...item,
        grid: {
          ...item.grid,
          zIndex: getLayerValue(current),
        },
      };
    }

    return item;
  });
}

export function moveCanvasItemBackward(
  items: CanvasGridItem[],
  blockId: string,
) {
  const normalizedItems = normalizeCanvasItems(items);

  const sorted = [...normalizedItems].sort(
    (a, b) => getLayerValue(a) - getLayerValue(b),
  );

  const index = sorted.findIndex((item) => item.id === blockId);
  if (index <= 0) return normalizedItems;

  const current = sorted[index];
  const previous = sorted[index - 1];

  return normalizedItems.map((item) => {
    if (item.id === current.id) {
      return {
        ...item,
        grid: {
          ...item.grid,
          zIndex: getLayerValue(previous),
        },
      };
    }

    if (item.id === previous.id) {
      return {
        ...item,
        grid: {
          ...item.grid,
          zIndex: getLayerValue(current),
        },
      };
    }

    return item;
  });
}