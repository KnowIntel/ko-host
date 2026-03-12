export type GridPosition = {
  col: number
  row: number
  colSpan: number
  rowSpan: number
}

export const GRID_COLUMNS = 12

export function createDefaultGridPosition(): GridPosition {
  return {
    col: 1,
    row: 1,
    colSpan: 12,
    rowSpan: 1,
  }
}

export function snapColumn(px: number, containerWidth: number) {
  const columnWidth = containerWidth / GRID_COLUMNS
  const column = Math.round(px / columnWidth) + 1
  return Math.min(GRID_COLUMNS, Math.max(1, column))
}

export function clampSpan(span: number) {
  return Math.min(GRID_COLUMNS, Math.max(1, span))
}

export function updateBlockGrid(
  blocks: any[],
  blockId: string,
  patch: Partial<GridPosition>,
) {
  return blocks.map((block) =>
    block.id === blockId
      ? {
          ...block,
          grid: {
            ...block.grid,
            ...patch,
          },
        }
      : block,
  )
}