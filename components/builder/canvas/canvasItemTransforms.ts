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

function compactLayerOrder(items: CanvasGridItem[]) {
  return [...items]
    .sort((a, b) => getLayerValue(a) - getLayerValue(b))
    .map((item, index) => ({
      ...item,
      grid: {
        ...item.grid,
        zIndex: index + 1,
      },
    }));
}

export function bringCanvasItemToFront(
  items: CanvasGridItem[],
  blockId: string,
) {
  const ordered = compactLayerOrder(normalizeCanvasItems(items));
  const target = ordered.find((item) => item.id === blockId);
  if (!target) return ordered;

  const others = ordered.filter((item) => item.id !== blockId);

  return [...others, target].map((item, index) => ({
    ...item,
    grid: {
      ...item.grid,
      zIndex: index + 1,
    },
  }));
}

export function sendCanvasItemToBack(
  items: CanvasGridItem[],
  blockId: string,
) {
  const ordered = compactLayerOrder(normalizeCanvasItems(items));
  const target = ordered.find((item) => item.id === blockId);
  if (!target) return ordered;

  const others = ordered.filter((item) => item.id !== blockId);

  return [target, ...others].map((item, index) => ({
    ...item,
    grid: {
      ...item.grid,
      zIndex: index + 1,
    },
  }));
}

export function moveCanvasItemForward(
  items: CanvasGridItem[],
  blockId: string,
) {
  const ordered = compactLayerOrder(normalizeCanvasItems(items));
  const index = ordered.findIndex((item) => item.id === blockId);

  if (index === -1 || index === ordered.length - 1) return ordered;

  const next = [...ordered];
  [next[index], next[index + 1]] = [next[index + 1], next[index]];

  return next.map((item, nextIndex) => ({
    ...item,
    grid: {
      ...item.grid,
      zIndex: nextIndex + 1,
    },
  }));
}

export function moveCanvasItemBackward(
  items: CanvasGridItem[],
  blockId: string,
) {
  const ordered = compactLayerOrder(normalizeCanvasItems(items));
  const index = ordered.findIndex((item) => item.id === blockId);

  if (index <= 0) return ordered;

  const next = [...ordered];
  [next[index], next[index - 1]] = [next[index - 1], next[index]];

  return next.map((item, nextIndex) => ({
    ...item,
    grid: {
      ...item.grid,
      zIndex: nextIndex + 1,
    },
  }));
}