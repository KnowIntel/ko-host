"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";
import type {
  BuilderBlockType,
  GridPlacement,
  ShapeType,
} from "@/lib/templates/builder";
import type { EditorSelection } from "./EditorSelection";
import { selectBlock } from "./EditorSelection";

const GRID_COLUMNS = 12;
const GRID_ROW_HEIGHT = 90;
const GRID_GAP = 16;
const GRID_STEP = 0.25;
const WORKSPACE_WIDTH = 2200;
const PAGE_WIDTH = 2200;
const MIN_CANVAS_ROWS = 8;
const BASE_CANVAS_HEIGHT = 1024;
const CANVAS_PAGE_INCREMENT = 1024;
const WORKSPACE_SIDE_PADDING = 0;
const WORKSPACE_TOP_PADDING = 32;
const WORKSPACE_BOTTOM_PADDING = 48;

type PageBlockType = "title" | "subtitle" | "tagline" | "description";

const DEFAULT_BLOCK_SIZES: Partial<
  Record<BuilderBlockType, { colSpan: number; rowSpan: number }>
> = {
  label: { colSpan: 4, rowSpan: 1 },
  image: { colSpan: 6, rowSpan: 4 },
  image_carousel: { colSpan: 8, rowSpan: 4 },
  links: { colSpan: 4, rowSpan: 3 },
  cta: { colSpan: 3, rowSpan: 1 },
  countdown: { colSpan: 4, rowSpan: 2 },
  padding: { colSpan: 3, rowSpan: 1 },
  poll: { colSpan: 5, rowSpan: 3 },
  rsvp: { colSpan: 5, rowSpan: 4 },
  faq: { colSpan: 6, rowSpan: 3 },
  gallery: { colSpan: 8, rowSpan: 5 },
  thread: { colSpan: 6, rowSpan: 4 },
  showcase: { colSpan: 8, rowSpan: 5 },
  festiveBackground: { colSpan: 12, rowSpan: 6 },
};

const DEFAULT_SHAPE_SIZES: Record<
  ShapeType,
  { colSpan: number; rowSpan: number }
> = {
  rectangle: { colSpan: 4, rowSpan: 2 },
  circle: { colSpan: 3, rowSpan: 3 },
  line: { colSpan: 4, rowSpan: 1 },
};

const DEFAULT_PAGE_SIZES: Record<
  PageBlockType,
  { colSpan: number; rowSpan: number }
> = {
  title: { colSpan: 8, rowSpan: 2 },
  subtitle: { colSpan: 7, rowSpan: 1 },
  tagline: { colSpan: 6, rowSpan: 1 },
  description: { colSpan: 8, rowSpan: 2 },
};

const GUIDE_TOLERANCE = 0.26;

export type CanvasGridItem = {
  id: string;
  type: string;
  label?: string;
  grid?: Partial<GridPlacement>;
};

type ToolDropPayload =
  | { kind: "block"; type: BuilderBlockType }
  | { kind: "shape"; type: ShapeType }
  | { kind: "page"; type: PageBlockType };

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
    patch: {
      colSpan?: number;
      rowSpan?: number;
      colStart?: number;
      rowStart?: number;
    },
  ) => void;
  onBringToFront?: (blockId: string) => void;
  onRemoveBlock?: (blockId: string) => void;
  onCreateToolDrop?: (
    payload: ToolDropPayload,
    patch: {
      colStart: number;
      rowStart: number;
      colSpan: number;
      rowSpan: number;
    },
  ) => void;
  renderBlockPreview?: (block: CanvasGridItem) => ReactNode;
  isItemSelected?: (blockId: string, selection: EditorSelection) => boolean;
  dockedScrollRef?: React.RefObject<HTMLDivElement | null>;
  pageSurfaceStyle?: CSSProperties;
};

type NormalizedGrid = {
  colStart: number;
  rowStart: number;
  colSpan: number;
  rowSpan: number;
  zIndex: number;
};

type DropPreview = {
  kind: "block" | "shape" | "page";
  type: string;
  colStart: number;
  rowStart: number;
  colSpan: number;
  rowSpan: number;
};

type DragGuide = {
  orientation: "vertical" | "horizontal";
  value: number;
};

type ResizeHandle =
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw";

type ResizeState = {
  blockId: string;
  handle: ResizeHandle;
  startX: number;
  startY: number;
  startGrid: NormalizedGrid;
  zoomScale: number;
};

type DragAnchor = {
  offsetX: number;
  offsetY: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function snapToStep(value: number) {
  return Math.round(value / GRID_STEP) * GRID_STEP;
}

function getColumnWidth() {
  return (PAGE_WIDTH - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
}

function getStrideX() {
  return getColumnWidth() + GRID_GAP;
}

function getStrideY() {
  return GRID_ROW_HEIGHT + GRID_GAP;
}

function normalizeSpan(span: number, axisMax: number) {
  return clamp(snapToStep(span), GRID_STEP, axisMax);
}

function getDefaultBlockSize(blockType: BuilderBlockType) {
  return DEFAULT_BLOCK_SIZES[blockType] ?? { colSpan: 4, rowSpan: 2 };
}

function getMinSizeForItem(block: CanvasGridItem) {
  if (block.type === "label") return { colSpan: 1, rowSpan: 0.5 };
  if (block.type === "cta") return { colSpan: 1, rowSpan: 0.5 };
  if (block.type === "countdown") return { colSpan: 1.5, rowSpan: 1 };
  if (block.type === "links") return { colSpan: 1.5, rowSpan: 1 };
  if (block.type === "poll") return { colSpan: 2, rowSpan: 1.5 };
  if (block.type === "rsvp") return { colSpan: 2, rowSpan: 2 };
  if (block.type === "faq") return { colSpan: 2, rowSpan: 1.5 };
  if (block.type === "gallery") return { colSpan: 2, rowSpan: 2 };
  if (block.type === "thread") return { colSpan: 2, rowSpan: 1.5 };
  if (block.type === "image") return { colSpan: 1, rowSpan: 1 };
  if (block.type === "shape") return { colSpan: 0.5, rowSpan: 0.5 };
  if (block.type === "image_carousel") return { colSpan: 2, rowSpan: 1.5 };
  if (block.type.startsWith("page:")) return { colSpan: 1.5, rowSpan: 0.5 };
  return { colSpan: 0.5, rowSpan: 0.5 };
}

function getGrid(block: CanvasGridItem, index: number): NormalizedGrid {
  const raw: Partial<GridPlacement> = block.grid ?? {};

  const colSpan = clamp(
    snapToStep(Number(raw.colSpan ?? 12)),
    GRID_STEP,
    GRID_COLUMNS,
  );

  const rowSpan = Math.max(GRID_STEP, snapToStep(Number(raw.rowSpan ?? 1)));

  const maxColStart = Math.max(1, GRID_COLUMNS - colSpan + 1);

  return {
    colStart: clamp(snapToStep(Number(raw.colStart ?? 1)), 1, maxColStart),
    rowStart: Math.max(1, snapToStep(Number(raw.rowStart ?? index + 1))),
    colSpan,
    rowSpan,
    zIndex: Math.max(1, Number(raw.zIndex ?? index + 1)),
  };
}

function getItemStyle(grid: NormalizedGrid): React.CSSProperties {
  const strideX = getStrideX();
  const strideY = getStrideY();

  return {
    position: "absolute",
    left: (grid.colStart - 1) * strideX,
    top: (grid.rowStart - 1) * strideY,
    width: grid.colSpan * strideX - GRID_GAP,
    height: grid.rowSpan * strideY - GRID_GAP,
  };
}

function overlaps(a: NormalizedGrid, b: NormalizedGrid) {
  const aColEnd = a.colStart + a.colSpan;
  const bColEnd = b.colStart + b.colSpan;
  const aRowEnd = a.rowStart + a.rowSpan;
  const bRowEnd = b.rowStart + b.rowSpan;

  return (
    a.colStart < bColEnd &&
    aColEnd > b.colStart &&
    a.rowStart < bRowEnd &&
    aRowEnd > b.rowStart
  );
}

function getPageHeight(blocks: CanvasGridItem[], preview: DropPreview | null) {
  const blocksMax = blocks.reduce((max, block, index) => {
    const grid = getGrid(block, index);
    return Math.max(max, grid.rowStart + grid.rowSpan - 1);
  }, MIN_CANVAS_ROWS);

  const previewMax = preview
    ? preview.rowStart + preview.rowSpan - 1
    : MIN_CANVAS_ROWS;

  const maxRowEnd = Math.max(blocksMax, previewMax);

  const contentHeight = maxRowEnd * getStrideY() - GRID_GAP + 120;

  const lockedPageHeight =
  contentHeight <= BASE_CANVAS_HEIGHT
    ? BASE_CANVAS_HEIGHT
    : BASE_CANVAS_HEIGHT +
      Math.ceil(
        (contentHeight - BASE_CANVAS_HEIGHT) / CANVAS_PAGE_INCREMENT,
      ) *
        CANVAS_PAGE_INCREMENT;

  return Math.max(BASE_CANVAS_HEIGHT, lockedPageHeight);
}

function buildFrontStateMap(blocks: CanvasGridItem[]) {
  const entries = blocks.map((b, i) => ({ id: b.id, grid: getGrid(b, i) }));
  const map = new Map<string, boolean>();

  for (const current of entries) {
    const overlapping = entries.filter(
      (other) => other.id !== current.id && overlaps(current.grid, other.grid),
    );

    if (!overlapping.length) {
      map.set(current.id, true);
      continue;
    }

    const highest = Math.max(
      current.grid.zIndex,
      ...overlapping.map((o) => o.grid.zIndex),
    );

    map.set(current.id, current.grid.zIndex >= highest);
  }

  return map;
}

function getZoomScaleFromScroller(scroller: HTMLDivElement) {
  const rect = scroller.getBoundingClientRect();
  const scale = rect.width / scroller.offsetWidth;

  if (scale && Number.isFinite(scale)) {
    return scale;
  }

  return 1;
}

function getCanvasCellFromPointer(
  clientX: number,
  clientY: number,
  scroller: HTMLDivElement,
  zoomScale: number,
) {
  const rect = scroller.getBoundingClientRect();

  const pageLeft = WORKSPACE_SIDE_PADDING + (WORKSPACE_WIDTH - PAGE_WIDTH) / 2;

  const pointerX =
    (clientX - rect.left + scroller.scrollLeft) / zoomScale - pageLeft;

  const pointerY =
    (clientY - rect.top + scroller.scrollTop) / zoomScale -
    WORKSPACE_TOP_PADDING;

  const strideX = getStrideX();
  const strideY = getStrideY();

  const rawColStart = 1 + pointerX / strideX;
  const rawRowStart = 1 + pointerY / strideY;

  return {
    colStart: clamp(snapToStep(rawColStart), 1, GRID_COLUMNS),
    rowStart: Math.max(1, snapToStep(rawRowStart)),
    pointerX,
    pointerY,
  };
}

function getDropCellForExistingBlock(
  clientX: number,
  clientY: number,
  scroller: HTMLDivElement,
  block: CanvasGridItem,
  index: number,
  dragAnchor: DragAnchor | null,
  zoomScale: number,
) {
  const grid = getGrid(block, index);
  const base = getCanvasCellFromPointer(
    clientX,
    clientY,
    scroller,
    zoomScale,
  );

  const adjustedX = dragAnchor ? base.pointerX - dragAnchor.offsetX : base.pointerX;
  const adjustedY = dragAnchor ? base.pointerY - dragAnchor.offsetY : base.pointerY;

  const strideX = getStrideX();
  const strideY = getStrideY();

  const rawColStart = 1 + adjustedX / strideX;
  const rawRowStart = 1 + adjustedY / strideY;

  return {
    colStart: clamp(
      snapToStep(rawColStart),
      1,
      Math.max(1, GRID_COLUMNS - grid.colSpan + 1),
    ),
    rowStart: Math.max(1, snapToStep(rawRowStart)),
  };
}

function parseToolDropPayload(
  dragEvent: React.DragEvent<HTMLDivElement>,
): ToolDropPayload | null {
  const raw = dragEvent.dataTransfer.getData("application/kht-tool");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as ToolDropPayload;
    if (
      parsed &&
      (parsed.kind === "block" ||
        parsed.kind === "shape" ||
        parsed.kind === "page") &&
      typeof parsed.type === "string"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function getDropPreviewForNewTool(
  payload: ToolDropPayload,
  clientX: number,
  clientY: number,
  scroller: HTMLDivElement,
  zoomScale: number,
): DropPreview {
  const base = getCanvasCellFromPointer(clientX, clientY, scroller, zoomScale);

  let defaults = { colSpan: 4, rowSpan: 2 };

  if (payload.kind === "block") {
    defaults = getDefaultBlockSize(payload.type);
  }

  if (payload.kind === "shape") {
    defaults = DEFAULT_SHAPE_SIZES[payload.type];
  }

  if (payload.kind === "page") {
    defaults = DEFAULT_PAGE_SIZES[payload.type];
  }

  const colSpan = normalizeSpan(defaults.colSpan, GRID_COLUMNS);
  const rowSpan = Math.max(GRID_STEP, snapToStep(defaults.rowSpan));

  return {
    kind: payload.kind,
    type: payload.type,
    colStart: clamp(base.colStart, 1, Math.max(1, GRID_COLUMNS - colSpan + 1)),
    rowStart: base.rowStart,
    colSpan,
    rowSpan,
  };
}

function getToolSurfaceClass(selected: boolean, resizing: boolean) {
  return [
    "group relative overflow-hidden rounded-xl border bg-transparent transition",
    selected
      ? "border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.18)]"
      : "border-slate-300 hover:border-slate-400 hover:shadow-sm",
    resizing ? "shadow-[0_0_0_3px_rgba(59,130,246,0.24)]" : "",
  ].join(" ");
}

function getResizeCursor(handle: ResizeHandle) {
  if (handle === "n" || handle === "s") return "ns-resize";
  if (handle === "e" || handle === "w") return "ew-resize";
  if (handle === "ne" || handle === "sw") return "nesw-resize";
  return "nwse-resize";
}

function getHandleClass(handle: ResizeHandle) {
  const base =
    "absolute z-30 h-3.5 w-3.5 rounded-sm border border-blue-600 bg-white shadow-sm";
  if (handle === "nw") return `${base} left-2 top-2 cursor-nwse-resize`;
  if (handle === "n")
    return `${base} left-1/2 top-2 -translate-x-1/2 cursor-ns-resize`;
  if (handle === "ne") return `${base} right-2 top-2 cursor-nesw-resize`;
  if (handle === "e")
    return `${base} right-2 top-1/2 -translate-y-1/2 cursor-ew-resize`;
  if (handle === "se") return `${base} bottom-2 right-2 cursor-nwse-resize`;
  if (handle === "s")
    return `${base} bottom-2 left-1/2 -translate-x-1/2 cursor-ns-resize`;
  if (handle === "sw") return `${base} bottom-2 left-2 cursor-nesw-resize`;
  return `${base} left-2 top-1/2 -translate-y-1/2 cursor-ew-resize`;
}

function getGuideMatches(
  activeId: string,
  activeGrid: NormalizedGrid,
  blocks: CanvasGridItem[],
): DragGuide[] {
  const others = blocks
    .filter((b) => b.id !== activeId)
    .map((b, i) => getGrid(b, i));

  const activeLeft = activeGrid.colStart;
  const activeCenterX = activeGrid.colStart + activeGrid.colSpan / 2;
  const activeRight = activeGrid.colStart + activeGrid.colSpan;
  const activeTop = activeGrid.rowStart;
  const activeCenterY = activeGrid.rowStart + activeGrid.rowSpan / 2;
  const activeBottom = activeGrid.rowStart + activeGrid.rowSpan;

  const guides: DragGuide[] = [];

  for (const other of others) {
    const otherLeft = other.colStart;
    const otherCenterX = other.colStart + other.colSpan / 2;
    const otherRight = other.colStart + other.colSpan;
    const otherTop = other.rowStart;
    const otherCenterY = other.rowStart + other.rowSpan / 2;
    const otherBottom = other.rowStart + other.rowSpan;

    if (Math.abs(activeLeft - otherLeft) <= GUIDE_TOLERANCE) {
      guides.push({ orientation: "vertical", value: otherLeft });
    }
    if (Math.abs(activeCenterX - otherCenterX) <= GUIDE_TOLERANCE) {
      guides.push({ orientation: "vertical", value: otherCenterX });
    }
    if (Math.abs(activeRight - otherRight) <= GUIDE_TOLERANCE) {
      guides.push({ orientation: "vertical", value: otherRight });
    }

    if (Math.abs(activeTop - otherTop) <= GUIDE_TOLERANCE) {
      guides.push({ orientation: "horizontal", value: otherTop });
    }
    if (Math.abs(activeCenterY - otherCenterY) <= GUIDE_TOLERANCE) {
      guides.push({ orientation: "horizontal", value: otherCenterY });
    }
    if (Math.abs(activeBottom - otherBottom) <= GUIDE_TOLERANCE) {
      guides.push({ orientation: "horizontal", value: otherBottom });
    }
  }

  const unique = new Map<string, DragGuide>();
  for (const guide of guides) {
    unique.set(`${guide.orientation}:${guide.value.toFixed(2)}`, guide);
  }

  return [...unique.values()];
}

function getGuideStyle(guide: DragGuide): React.CSSProperties {
  const strideX = getStrideX();
  const strideY = getStrideY();

  if (guide.orientation === "vertical") {
    return {
      position: "absolute",
      left: (guide.value - 1) * strideX,
      top: 0,
      width: 1,
      height: "100%",
      backgroundColor: "#3b82f6",
      opacity: 0.9,
      pointerEvents: "none",
      zIndex: 999998,
    };
  }

  return {
    position: "absolute",
    left: 0,
    top: (guide.value - 1) * strideY,
    width: "100%",
    height: 1,
    backgroundColor: "#3b82f6",
    opacity: 0.9,
    pointerEvents: "none",
    zIndex: 999998,
  };
}

function dragRailDots() {
  return {
    backgroundImage:
      "radial-gradient(circle, rgba(100,116,139,0.75) 1px, transparent 1.2px)",
    backgroundSize: "8px 8px",
    backgroundPosition: "center",
  } as const;
}

export function getGridCanvasScrollableWidth() {
  return WORKSPACE_WIDTH + WORKSPACE_SIDE_PADDING * 2;
}

export default function GridCanvas({
  blocks,
  selection,
  onSelect,
  onMoveBlock,
  onResizeBlock,
  onBringToFront,
  onRemoveBlock,
  onCreateToolDrop,
  renderBlockPreview,
  isItemSelected,
  dockedScrollRef,
  pageSurfaceStyle,
}: Props) {
  const mainScrollRef = useRef<HTMLDivElement | null>(null);
  const syncingRef = useRef<"main" | "docked" | null>(null);

  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [dropPreview, setDropPreview] = useState<DropPreview | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const [dragGuides, setDragGuides] = useState<DragGuide[]>([]);
  const [dragAnchor, setDragAnchor] = useState<DragAnchor | null>(null);
  
  const lastDragGuidesRef = useRef<string>("");

  const pageHeight = useMemo(
    () => getPageHeight(blocks, dropPreview),
    [blocks, dropPreview],
  );
  const workspaceHeight =
    pageHeight + WORKSPACE_TOP_PADDING + WORKSPACE_BOTTOM_PADDING;
  const totalScrollableWidth = getGridCanvasScrollableWidth();
  const frontStateMap = useMemo(() => buildFrontStateMap(blocks), [blocks]);

  useEffect(() => {
    const main = mainScrollRef.current;
    const docked = dockedScrollRef?.current;

    if (!main || !docked) return;

    const syncFromMain = () => {
      if (syncingRef.current === "docked") {
        syncingRef.current = null;
        return;
      }
      syncingRef.current = "main";
      docked.scrollLeft = main.scrollLeft;
    };

    const syncFromDocked = () => {
      if (syncingRef.current === "main") {
        syncingRef.current = null;
        return;
      }
      syncingRef.current = "docked";
      main.scrollLeft = docked.scrollLeft;
    };

    main.addEventListener("scroll", syncFromMain, { passive: true });
    docked.addEventListener("scroll", syncFromDocked, { passive: true });

    docked.scrollLeft = main.scrollLeft;

    return () => {
      main.removeEventListener("scroll", syncFromMain);
      docked.removeEventListener("scroll", syncFromDocked);
    };
  }, [dockedScrollRef]);

  useEffect(() => {
    if (!resizeState) return;

    const currentResize = resizeState;
    const currentBlock = blocks.find((b) => b.id === currentResize.blockId);
    const minSize = currentBlock
      ? getMinSizeForItem(currentBlock)
      : { colSpan: 0.5, rowSpan: 0.5 };

    function handleMouseMove(event: MouseEvent) {
      const deltaCols = snapToStep(
        (event.clientX - currentResize.startX) /
          (getStrideX() * currentResize.zoomScale),
      );
      const deltaRows = snapToStep(
        (event.clientY - currentResize.startY) /
          (getStrideY() * currentResize.zoomScale),
      );

      let nextColStart = currentResize.startGrid.colStart;
      let nextRowStart = currentResize.startGrid.rowStart;
      let nextColSpan = currentResize.startGrid.colSpan;
      let nextRowSpan = currentResize.startGrid.rowSpan;

      if (
        currentResize.handle === "e" ||
        currentResize.handle === "ne" ||
        currentResize.handle === "se"
      ) {
        nextColSpan = clamp(
          currentResize.startGrid.colSpan + deltaCols,
          minSize.colSpan,
          GRID_COLUMNS - currentResize.startGrid.colStart + 1,
        );
      }

      if (
        currentResize.handle === "w" ||
        currentResize.handle === "nw" ||
        currentResize.handle === "sw"
      ) {
        nextColStart = clamp(
          currentResize.startGrid.colStart + deltaCols,
          1,
          currentResize.startGrid.colStart +
            currentResize.startGrid.colSpan -
            minSize.colSpan,
        );

        nextColSpan = clamp(
          currentResize.startGrid.colSpan - deltaCols,
          minSize.colSpan,
          GRID_COLUMNS - nextColStart + 1,
        );
      }

      if (
        currentResize.handle === "s" ||
        currentResize.handle === "se" ||
        currentResize.handle === "sw"
      ) {
        nextRowSpan = Math.max(
          minSize.rowSpan,
          currentResize.startGrid.rowSpan + deltaRows,
        );
      }

      if (
        currentResize.handle === "n" ||
        currentResize.handle === "ne" ||
        currentResize.handle === "nw"
      ) {
        nextRowStart = Math.max(
          1,
          currentResize.startGrid.rowStart + deltaRows,
        );

        const maxTopShift =
          currentResize.startGrid.rowSpan - minSize.rowSpan;

        nextRowStart = Math.min(
          nextRowStart,
          currentResize.startGrid.rowStart + maxTopShift,
        );

        nextRowSpan = Math.max(
          minSize.rowSpan,
          currentResize.startGrid.rowSpan -
            (nextRowStart - currentResize.startGrid.rowStart),
        );
      }

      onResizeBlock(currentResize.blockId, {
        colStart: nextColStart,
        rowStart: nextRowStart,
        colSpan: nextColSpan,
        rowSpan: nextRowSpan,
      });
    }

    function handleMouseUp() {
      setResizeState(null);
    }

    document.body.style.cursor = getResizeCursor(currentResize.handle);
    document.body.style.userSelect = "none";

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizeState, onResizeBlock, blocks]);

  function clearPreviewIfNeeded(e: React.DragEvent<HTMLDivElement>) {
    const related = e.relatedTarget as Node | null;
    if (related && e.currentTarget.contains(related)) return;
    setDropPreview(null);
  }

  function handleCanvasDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();

    if (!mainScrollRef.current) return;

    const zoomScale = getZoomScaleFromScroller(mainScrollRef.current);
    const payload = parseToolDropPayload(e);

    if (payload) {
      setDropPreview(
        getDropPreviewForNewTool(
          payload,
          e.clientX,
          e.clientY,
          mainScrollRef.current,
          zoomScale,
        ),
      );
      setDragGuides([]);
      return;
    }

    setDropPreview(null);
  }

  function handleExistingBlockDrag(
    e: React.DragEvent<HTMLDivElement>,
    blockId: string,
  ) {
    if (!mainScrollRef.current) return;
    if (e.clientX === 0 && e.clientY === 0) return;

    const zoomScale = getZoomScaleFromScroller(mainScrollRef.current);
    const draggedIndex = blocks.findIndex((b) => b.id === blockId);
    if (draggedIndex === -1) return;

    const block = blocks[draggedIndex];
    const cell = getDropCellForExistingBlock(
      e.clientX,
      e.clientY,
      mainScrollRef.current,
      block,
      draggedIndex,
      dragAnchor,
      zoomScale,
    );

    const currentGrid = getGrid(block, draggedIndex);
    const previewGrid: NormalizedGrid = {
      ...currentGrid,
      colStart: cell.colStart,
      rowStart: cell.rowStart,
    };

    const nextGuides = getGuideMatches(blockId, previewGrid, blocks);
    const nextGuidesKey = JSON.stringify(nextGuides);

    if (lastDragGuidesRef.current !== nextGuidesKey) {
      lastDragGuidesRef.current = nextGuidesKey;
      setDragGuides(nextGuides);
    }
  }

  function handleDragStart(
    e: React.DragEvent<HTMLDivElement>,
    blockId: string,
  ) {
    const zoomScale = mainScrollRef.current
      ? getZoomScaleFromScroller(mainScrollRef.current)
      : 1;

    const blockRect =
      (e.currentTarget.parentElement as HTMLDivElement | null)?.getBoundingClientRect();

    if (blockRect) {
      setDragAnchor({
        offsetX: (e.clientX - blockRect.left) / zoomScale,
        offsetY: (e.clientY - blockRect.top) / zoomScale,
      });
    } else {
      setDragAnchor(null);
    }

    setDraggingBlockId(blockId);
    setDropPreview(null);
    lastDragGuidesRef.current = "";
    // do not auto change z-index on selection
  }

  function handleDragEnd() {
    setDraggingBlockId(null);
    setDropPreview(null);
    setDragGuides([]);
    setDragAnchor(null);
  }

  function handleCanvasDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();

    if (!mainScrollRef.current) return;

    const zoomScale = getZoomScaleFromScroller(mainScrollRef.current);
    const payload = parseToolDropPayload(e);

    if (payload && onCreateToolDrop) {
      const preview = getDropPreviewForNewTool(
        payload,
        e.clientX,
        e.clientY,
        mainScrollRef.current,
        zoomScale,
      );

      onCreateToolDrop(payload, {
        colStart: preview.colStart,
        rowStart: preview.rowStart,
        colSpan: preview.colSpan,
        rowSpan: preview.rowSpan,
      });

      setDropPreview(null);
      setDraggingBlockId(null);
      setDragGuides([]);
      setDragAnchor(null);
      return;
    }

    if (!draggingBlockId) {
      setDropPreview(null);
      setDragGuides([]);
      setDragAnchor(null);
      return;
    }

    const draggedIndex = blocks.findIndex((b) => b.id === draggingBlockId);
    if (draggedIndex === -1) {
      setDraggingBlockId(null);
      setDropPreview(null);
      setDragGuides([]);
      setDragAnchor(null);
      return;
    }

    const block = blocks[draggedIndex];
    const cell = getDropCellForExistingBlock(
      e.clientX,
      e.clientY,
      mainScrollRef.current,
      block,
      draggedIndex,
      dragAnchor,
      zoomScale,
    );

    onMoveBlock(draggingBlockId, cell);
    setDraggingBlockId(null);
    setDropPreview(null);
    setDragGuides([]);
    setDragAnchor(null);
  }

  const resizeHandles: ResizeHandle[] = [
    "nw",
    "n",
    "ne",
    "e",
    "se",
    "s",
    "sw",
    "w",
  ];

  return (
    <div className="relative w-full bg-[#efefef]">
      <div
        ref={mainScrollRef}
        className="w-full overflow-x-hidden overflow-y-visible pb-2"
        onDragOver={handleCanvasDragOver}
        onDragLeave={clearPreviewIfNeeded}
        onDrop={handleCanvasDrop}
      >
        <div
          className="relative"
          style={{
            width: totalScrollableWidth,
            minWidth: totalScrollableWidth,
            height: workspaceHeight,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(0,0,0,0.015) 100%)",
          }}
        >
          <div
            className="absolute inset-y-0"
            style={{
              left: WORKSPACE_SIDE_PADDING,
              width: WORKSPACE_WIDTH,
            }}
          >
            <div
              className="relative h-full rounded-[6px] border border-black/6 bg-[rgba(255,255,255,0.28)]"
              style={{
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
              }}
            >
              <div
                className="absolute left-1/2 top-[32px] -translate-x-1/2 rounded-[2px] border border-[rgba(0,0,0,0.09)]"
                style={{
                  width: PAGE_WIDTH,
                  height: pageHeight,
                  ...pageSurfaceStyle,
                  backgroundImage: pageSurfaceStyle?.backgroundImage
                    ? `${pageSurfaceStyle.backgroundImage},
                    linear-gradient(to right, rgba(0,0,0,0.035) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0,0,0,0.035) 1px, transparent 1px)`
                    : `
                    linear-gradient(to right, rgba(0,0,0,0.035) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0,0,0,0.035) 1px, transparent 1px)
                  `,
                backgroundSize: pageSurfaceStyle?.backgroundImage
                  ? `contain, ${getStrideX() * GRID_STEP}px ${getStrideY() * GRID_STEP}px, ${getStrideX() * GRID_STEP}px ${getStrideY() * GRID_STEP}px`
                  : `${getStrideX() * GRID_STEP}px ${getStrideY() * GRID_STEP}px`,
                backgroundPosition: pageSurfaceStyle?.backgroundImage
                ? `center top, 0 0, 0 0`
                : "0 0",
                backgroundRepeat: pageSurfaceStyle?.backgroundImage
                  ? `no-repeat, repeat, repeat`
                  : "repeat",
                }}
              >
                {dragGuides.map((guide, index) => (
                  <div
                    key={`${guide.orientation}-${guide.value}-${index}`}
                    style={getGuideStyle(guide)}
                  />
                ))}

                {dropPreview ? (
                  <div
                    className="pointer-events-none absolute rounded-xl border-2 border-dashed border-blue-500 bg-blue-500/10"
                    style={{
                      ...getItemStyle({
                        colStart: dropPreview.colStart,
                        rowStart: dropPreview.rowStart,
                        colSpan: dropPreview.colSpan,
                        rowSpan: dropPreview.rowSpan,
                        zIndex: 999999,
                      }),
                      zIndex: 999999,
                    }}
                  />
                ) : null}

                {blocks.map((block, index) => {
                  const grid = getGrid(block, index);

                  const selected =
                    isItemSelected?.(block.id, selection) ??
                    (selection.type === "block" &&
                      selection.blockId === block.id);

                  const isFront = frontStateMap.get(block.id) ?? true;
                  const resizing = resizeState?.blockId === block.id;

                  return (
                    <div
                      key={block.id}
                      style={{
                        ...getItemStyle(grid),
                        zIndex: grid.zIndex,
                      }}
                      onClick={() => onSelect(selectBlock(block.id))}
                      className={getToolSurfaceClass(selected, resizing)}
                    >
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, block.id)}
                        onDrag={(e) => handleExistingBlockDrag(e, block.id)}
                        onDragEnd={handleDragEnd}
                        className="absolute inset-x-6 top-0 z-10 h-4 cursor-grab"
                        style={dragRailDots()}
                        title="Drag block"
                      />

                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, block.id)}
                        onDrag={(e) => handleExistingBlockDrag(e, block.id)}
                        onDragEnd={handleDragEnd}
                        className="absolute inset-x-6 bottom-0 z-10 h-4 cursor-grab"
                        style={dragRailDots()}
                        title="Drag block"
                      />

                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, block.id)}
                        onDrag={(e) => handleExistingBlockDrag(e, block.id)}
                        onDragEnd={handleDragEnd}
                        className="absolute inset-y-6 left-0 z-10 w-4 cursor-grab"
                        style={dragRailDots()}
                        title="Drag block"
                      />

                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, block.id)}
                        onDrag={(e) => handleExistingBlockDrag(e, block.id)}
                        onDragEnd={handleDragEnd}
                        className="absolute inset-y-6 right-0 z-10 w-4 cursor-grab"
                        style={dragRailDots()}
                        title="Drag block"
                      />

                      {onRemoveBlock ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveBlock(block.id);
                          }}
                          className="absolute right-11 top-2 z-30 inline-flex h-7 w-7 items-center justify-center rounded-md border border-black/10 bg-white/95 text-sm text-slate-600 shadow-sm"
                          title="Remove block"
                        >
                          ×
                        </button>
                      ) : null}

                      
                      {selected
                        ? resizeHandles.map((handle) => (
                            <button
                              key={handle}
                              type="button"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                const zoomScale = mainScrollRef.current
                                  ? getZoomScaleFromScroller(mainScrollRef.current)
                                  : 1;

                                setResizeState({
                                  blockId: block.id,
                                  handle,
                                  startX: e.clientX,
                                  startY: e.clientY,
                                  startGrid: grid,
                                  zoomScale,
                                });
                              }}
                              className={getHandleClass(handle)}
                              title="Resize"
                            />
                          ))
                        : null}

                      {!isFront ? (
                        <div className="pointer-events-none absolute inset-0 z-10 bg-white/25" />
                      ) : null}

                      <div className="h-full w-full pt-0">
                        {renderBlockPreview
                          ? renderBlockPreview(block)
                          : block.type}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}