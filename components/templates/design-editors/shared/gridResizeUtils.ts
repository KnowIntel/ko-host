import type { MicrositeBlock } from "@/lib/templates/builder";

export function resizeBlock(
  blocks: MicrositeBlock[],
  blockId: string,
  patch: {
    colSpan?: number;
    rowSpan?: number;
  },
) {
  return blocks.map((block) => {
    if (block.id !== blockId) return block;

    const currentGrid = (block as any).grid ?? {
      col: 1,
      row: 1,
      colSpan: 12,
      rowSpan: 1,
    };

    return {
      ...block,
      grid: {
        ...currentGrid,
        ...patch,
      },
    };
  });
}

export function clampColSpan(value: number) {
  return Math.max(1, Math.min(12, value));
}

export function clampRowSpan(value: number) {
  return Math.max(1, Math.min(12, value));
}