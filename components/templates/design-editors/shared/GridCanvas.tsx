"use client";

import {
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { GridPlacement } from "@/lib/templates/builder";
import type { EditorSelection } from "./EditorSelection";
import { selectBlock } from "./EditorSelection";

const GRID_COLUMNS = 12;
const GRID_ROW_HEIGHT = 120;
const GRID_GAP = 16;
const GRID_STEP = 0.5;
const CANVAS_WIDTH = 1400;

export type CanvasGridItem = {
  id: string;
  type: string;
  label?: string;
  grid?: Partial<GridPlacement>;
};

type Props = {
  blocks: CanvasGridItem[];
  selection: EditorSelection;
  onSelect: (s: EditorSelection) => void;
  onMoveBlock: (
    blockId: string,
    patch: { colStart: number; rowStart: number },
  ) => void;
  onResizeBlock: (
    blockId: string,
    patch: { colSpan?: number; rowSpan?: number; colStart?: number },
  ) => void;
  onBringToFront?: (blockId: string) => void;
  onRemoveBlock?: (blockId: string) => void;
  renderBlockPreview?: (block: CanvasGridItem) => ReactNode;
  isItemSelected?: (blockId: string, selection: EditorSelection) => boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function snapToHalf(value: number) {
  return Math.round(value / GRID_STEP) * GRID_STEP;
}

function getGrid(block: CanvasGridItem, index: number) {
  const raw: Partial<GridPlacement> = block.grid ?? {};

  const colSpan = clamp(
    snapToHalf(Number(raw.colSpan ?? 12)),
    GRID_STEP,
    GRID_COLUMNS,
  );

  const rowSpan = Math.max(
    GRID_STEP,
    snapToHalf(Number(raw.rowSpan ?? 1)),
  );

  const maxColStart = Math.max(1, GRID_COLUMNS - colSpan + 1);

  return {
    colStart: clamp(
      snapToHalf(Number(raw.colStart ?? 1)),
      1,
      maxColStart,
    ),
    rowStart: Math.max(
      1,
      snapToHalf(Number(raw.rowStart ?? index + 1)),
    ),
    colSpan,
    rowSpan,
    zIndex: Math.max(1, Number(raw.zIndex ?? index + 1)),
  };
}

function getColumnWidth() {
  return (CANVAS_WIDTH - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
}

function getItemStyle(grid: ReturnType<typeof getGrid>): React.CSSProperties {
  const columnWidth = getColumnWidth();
  const strideX = columnWidth + GRID_GAP;
  const strideY = GRID_ROW_HEIGHT + GRID_GAP;

  const left = (grid.colStart - 1) * strideX;
  const top = (grid.rowStart - 1) * strideY;
  const width = grid.colSpan * strideX - GRID_GAP;
  const height = grid.rowSpan * strideY - GRID_GAP;

  return {
    position: "absolute",
    left,
    top,
    width,
    height,
  };
}

function formatBlockLabel(block: CanvasGridItem) {
  if (block.type.startsWith("page:")) {
    const value = block.type.split(":")[1] || "Block";
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  if (block.label?.trim()) return block.label;

  return block.type
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (m) => m.toUpperCase());
}

function overlaps(
  a: ReturnType<typeof getGrid>,
  b: ReturnType<typeof getGrid>,
) {
  const aColEnd = a.colStart + a.colSpan;
  const bColEnd = b.colStart + b.colSpan;
  const aRowEnd = a.rowStart + a.rowSpan;
  const bRowEnd = b.rowStart + b.rowSpan;

  const colOverlap = a.colStart < bColEnd && aColEnd > b.colStart;
  const rowOverlap = a.rowStart < bRowEnd && aRowEnd > b.rowStart;

  return colOverlap && rowOverlap;
}

export default function GridCanvas({
  blocks,
  selection,
  onSelect,
  onMoveBlock,
  onResizeBlock,
  onBringToFront,
  onRemoveBlock,
  renderBlockPreview,
  isItemSelected,
}: Props) {
  const mainScrollRef = useRef<HTMLDivElement | null>(null);
  const stickyScrollRef = useRef<HTMLDivElement | null>(null);
  const draggingBlockIdRef = useRef<string | null>(null);
  const isSyncingRef = useRef<"main" | "sticky" | null>(null);

  const blockMap = useMemo(() => {
    return new Map(
      blocks.map((block, index) => [block.id, getGrid(block, index)]),
    );
  }, [blocks]);

  const canvasHeight = useMemo(() => {
    const maxRowEnd = blocks.reduce((max, block, index) => {
      const grid = getGrid(block, index);
      const rowEnd = grid.rowStart + grid.rowSpan - 1;
      return Math.max(max, rowEnd);
    }, 6);

    return maxRowEnd * (GRID_ROW_HEIGHT + GRID_GAP) - GRID_GAP + 80;
  }, [blocks]);

  const frontStateMap = useMemo(() => {
    const entries = blocks.map((block, index) => ({
      id: block.id,
      grid: getGrid(block, index),
    }));

    const result = new Map<string, boolean>();

    for (const current of entries) {
      const overlapping = entries.filter(
        (other) =>
          other.id !== current.id && overlaps(current.grid, other.grid),
      );

      if (overlapping.length === 0) {
        result.set(current.id, true);
        continue;
      }

      const highestZ = Math.max(
        current.grid.zIndex,
        ...overlapping.map((item) => item.grid.zIndex),
      );

      result.set(current.id, current.grid.zIndex >= highestZ);
    }

    return result;
  }, [blocks]);

  useEffect(() => {
    const main = mainScrollRef.current;
    const sticky = stickyScrollRef.current;

    if (!main || !sticky) return;

    const syncFromMain = () => {
      if (isSyncingRef.current === "sticky") return;
      isSyncingRef.current = "main";
      sticky.scrollLeft = main.scrollLeft;
      requestAnimationFrame(() => {
        isSyncingRef.current = null;
      });
    };

    const syncFromSticky = () => {
      if (isSyncingRef.current === "main") return;
      isSyncingRef.current = "sticky";
      main.scrollLeft = sticky.scrollLeft;
      requestAnimationFrame(() => {
        isSyncingRef.current = null;
      });
    };

    main.addEventListener("scroll", syncFromMain, { passive: true });
    sticky.addEventListener("scroll", syncFromSticky, { passive: true });

    sticky.scrollLeft = main.scrollLeft;

    return () => {
      main.removeEventListener("scroll", syncFromMain);
      sticky.removeEventListener("scroll", syncFromSticky);
    };
  }, []);

  function getDropCell(
    e: React.DragEvent,
    blockId: string | null,
  ): { colStart: number; rowStart: number } | null {
    const main = mainScrollRef.current;
    if (!main || !blockId) return null;

    const rect = main.getBoundingClientRect();
    const grid = blockMap.get(blockId);

    if (!grid) return null;

    const x = e.clientX - rect.left + main.scrollLeft;
    const y = e.clientY - rect.top + main.scrollTop;

    const columnWidth = getColumnWidth();
    const stepX = (columnWidth + GRID_GAP) * GRID_STEP;
    const stepY = (GRID_ROW_HEIGHT + GRID_GAP) * GRID_STEP;

    const roughCol = 1 + Math.floor(x / stepX) * GRID_STEP;
    const roughRow = 1 + Math.floor(y / stepY) * GRID_STEP;

    const maxColStart = Math.max(1, GRID_COLUMNS - grid.colSpan + 1);

    return {
      colStart: clamp(snapToHalf(roughCol), 1, maxColStart),
      rowStart: Math.max(1, snapToHalf(roughRow)),
    };
  }

  function handleCanvasDrop(e: React.DragEvent) {
    e.preventDefault();

    const blockId = draggingBlockIdRef.current;
    const cell = getDropCell(e, blockId);

    if (!blockId || !cell) {
      draggingBlockIdRef.current = null;
      return;
    }

    onMoveBlock(blockId, cell);
    draggingBlockIdRef.current = null;
  }

  return (
    <div className="relative w-full">
      <div
        ref={mainScrollRef}
        className="w-full overflow-x-hidden overflow-y-visible pb-5"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleCanvasDrop}
      >
        <div
          className="relative"
          style={{
            width: `${CANVAS_WIDTH}px`,
            minWidth: `${CANVAS_WIDTH}px`,
            height: `${canvasHeight}px`,
          }}
        >
          {blocks.map((block, index) => {
            const grid = getGrid(block, index);

            const selected =
              isItemSelected?.(block.id, selection) ??
              (selection.type === "block" && selection.blockId === block.id);

            const isFront = frontStateMap.get(block.id) ?? true;

            return (
              <div
                key={block.id}
                style={{
                  ...getItemStyle(grid),
                  zIndex: selected ? grid.zIndex + 10000 : grid.zIndex,
                }}
                onClick={() => onSelect(selectBlock(block.id))}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleCanvasDrop}
                className={[
                  "relative overflow-hidden rounded-xl border p-4 backdrop-blur transition",
                  "border-slate-300 bg-slate-500/50 shadow-[0_10px_28px_rgba(15,23,42,0.18)]",
                  selected ? "ring-2 ring-blue-500 border-blue-400" : "",
                ].join(" ")}
              >
                <div className="pointer-events-none absolute inset-0 bg-white/10" />

                <button
                  type="button"
                  draggable
                  onDragStart={() => {
                    draggingBlockIdRef.current = block.id;
                  }}
                  onDragEnd={() => {
                    draggingBlockIdRef.current = null;
                  }}
                  className="absolute left-2 top-2 z-20 h-6 w-6 cursor-grab rounded border border-white/30 bg-black/50 text-xs text-white"
                >
                  ⋮⋮
                </button>

                <div className="absolute left-10 top-2 z-20 rounded-md border border-white/25 bg-black/45 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                  {formatBlockLabel(block)}
                </div>

                {onBringToFront ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBringToFront(block.id);
                    }}
                    className="absolute right-10 top-2 z-20 h-6 rounded border border-white/25 bg-black/45 px-2 text-[10px] text-white hover:bg-white/10"
                  >
                    {isFront ? "Front" : "Back"}
                  </button>
                ) : null}

                {onRemoveBlock ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveBlock(block.id);
                    }}
                    className="absolute right-2 top-2 z-20 h-6 w-6 rounded border border-red-400/40 bg-black/45 text-xs text-red-100 transition hover:bg-red-500/20"
                    aria-label="Remove block"
                  >
                    ×
                  </button>
                ) : null}

                <div className="relative z-10 mt-10 h-full">
                  {renderBlockPreview ? (
                    renderBlockPreview(block)
                  ) : (
                    <div className="text-xs uppercase text-white/75">
                      {block.type}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.stopPropagation();

                    const startX = e.clientX;
                    const startY = e.clientY;

                    const startColSpan = grid.colSpan;
                    const startRowSpan = grid.rowSpan;

                    const columnWidth = getColumnWidth();
                    const stepX = (columnWidth + GRID_GAP) * GRID_STEP;
                    const stepY = (GRID_ROW_HEIGHT + GRID_GAP) * GRID_STEP;

                    const move = (ev: PointerEvent) => {
                      const dx = ev.clientX - startX;
                      const dy = ev.clientY - startY;

                      const nextColSpan = clamp(
                        snapToHalf(startColSpan + dx / stepX),
                        GRID_STEP,
                        GRID_COLUMNS - grid.colStart + 1,
                      );

                      const nextRowSpan = Math.max(
                        GRID_STEP,
                        snapToHalf(startRowSpan + dy / stepY),
                      );

                      onResizeBlock(block.id, {
                        colSpan: nextColSpan,
                        rowSpan: nextRowSpan,
                      });
                    };

                    const up = () => {
                      window.removeEventListener("pointermove", move);
                      window.removeEventListener("pointerup", up);
                    };

                    window.addEventListener("pointermove", move);
                    window.addEventListener("pointerup", up);
                  }}
                  className="absolute bottom-2 right-2 z-20 h-4 w-4 cursor-se-resize border border-white/40 bg-white/25"
                  aria-label="Resize from right"
                />

                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.stopPropagation();

                    const startX = e.clientX;
                    const startY = e.clientY;

                    const startColStart = grid.colStart;
                    const startColSpan = grid.colSpan;
                    const startRowSpan = grid.rowSpan;

                    const columnWidth = getColumnWidth();
                    const stepX = (columnWidth + GRID_GAP) * GRID_STEP;
                    const stepY = (GRID_ROW_HEIGHT + GRID_GAP) * GRID_STEP;

                    const move = (ev: PointerEvent) => {
                      const dx = ev.clientX - startX;
                      const dy = ev.clientY - startY;

                      const deltaCols = snapToHalf(dx / stepX);

                      const proposedColStart = clamp(
                        snapToHalf(startColStart + deltaCols),
                        1,
                        startColStart + startColSpan - GRID_STEP,
                      );

                      const proposedColSpan = clamp(
                        snapToHalf(
                          startColSpan - (proposedColStart - startColStart),
                        ),
                        GRID_STEP,
                        GRID_COLUMNS - proposedColStart + 1,
                      );

                      const proposedRowSpan = Math.max(
                        GRID_STEP,
                        snapToHalf(startRowSpan + dy / stepY),
                      );

                      onResizeBlock(block.id, {
                        colStart: proposedColStart,
                        colSpan: proposedColSpan,
                        rowSpan: proposedRowSpan,
                      });
                    };

                    const up = () => {
                      window.removeEventListener("pointermove", move);
                      window.removeEventListener("pointerup", up);
                    };

                    window.addEventListener("pointermove", move);
                    window.addEventListener("pointerup", up);
                  }}
                  className="absolute bottom-2 left-2 z-20 h-4 w-4 cursor-nwse-resize border border-white/40 bg-white/25"
                  aria-label="Resize from left"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-3 z-[99999] mt-2">
        <div className="rounded-full border border-white/10 bg-black/60 px-3 py-2 backdrop-blur-md">
          <div
            ref={stickyScrollRef}
            className="overflow-x-auto overflow-y-hidden"
          >
            <div
              style={{
                width: `${CANVAS_WIDTH}px`,
                height: "1px",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}