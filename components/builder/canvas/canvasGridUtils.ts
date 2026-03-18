import type { GridPlacement } from "@/lib/templates/builder";

export const GRID_COLUMNS = 12;

/**
 * Quarter-column precision.
 * This is the internal grid unit used by canvas transforms.
 */
export const GRID_STEP = 0.25;

export type GridPlacementWithLayer = GridPlacement & {
  zIndex?: number;
};

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function snapToGrid(value: number) {
  return Math.round(value / GRID_STEP) * GRID_STEP;
}

export function normalizeGrid(
  grid: Partial<GridPlacementWithLayer> | undefined,
  index: number,
): GridPlacementWithLayer {
  const rawColStart = Number(grid?.colStart);
  const rawRowStart = Number(grid?.rowStart);
  const rawColSpan = Number(grid?.colSpan);
  const rawRowSpan = Number(grid?.rowSpan);
  const rawZIndex = Number(grid?.zIndex);

  const colSpan = clamp(
    snapToGrid(Number.isFinite(rawColSpan) ? rawColSpan : GRID_COLUMNS),
    GRID_STEP,
    GRID_COLUMNS,
  );

  const rowSpan = Math.max(
    GRID_STEP,
    snapToGrid(Number.isFinite(rawRowSpan) ? rawRowSpan : 1),
  );

  const maxColStart = Math.max(1, GRID_COLUMNS - colSpan + 1);

  return {
    colStart: clamp(
      snapToGrid(Number.isFinite(rawColStart) ? rawColStart : 1),
      1,
      maxColStart,
    ),
    rowStart: Math.max(
      1,
      snapToGrid(Number.isFinite(rawRowStart) ? rawRowStart : index + 1),
    ),
    colSpan,
    rowSpan,
    zIndex: Number.isFinite(rawZIndex) ? rawZIndex : index + 1,
  };
}