"use client";

import type {
  BuilderDraft,
  GridPlacement,
  TextStyle,
} from "@/lib/templates/builder";

import BlockRenderer from "@/components/preview/BlockRenderer";

const GRID_COLUMNS = 12;
const GRID_ROW_HEIGHT = 120;
const GRID_GAP = 16;
const GRID_STEP = 0.5;
const CANVAS_WIDTH = 1080;

type GridPlacementWithLayer = GridPlacement & {
  zIndex?: number;
};

type DraftWithExtras = BuilderDraft & {
  pageColor?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function snapToHalf(value: number) {
  return Math.round(value / GRID_STEP) * GRID_STEP;
}

function normalizeGrid(
  grid: Partial<GridPlacementWithLayer> | undefined,
  index: number,
) {
  const rawColStart = Number(grid?.colStart);
  const rawRowStart = Number(grid?.rowStart);
  const rawColSpan = Number(grid?.colSpan);
  const rawRowSpan = Number(grid?.rowSpan);
  const rawZIndex = Number(grid?.zIndex);

  const colSpan = clamp(
    snapToHalf(Number.isFinite(rawColSpan) ? rawColSpan : 12),
    GRID_STEP,
    GRID_COLUMNS,
  );

  const rowSpan = Math.max(
    GRID_STEP,
    snapToHalf(Number.isFinite(rawRowSpan) ? rawRowSpan : 1),
  );

  const maxColStart = Math.max(1, GRID_COLUMNS - colSpan + 1);

  return {
    colStart: clamp(
      snapToHalf(Number.isFinite(rawColStart) ? rawColStart : 1),
      1,
      maxColStart,
    ),
    rowStart: Math.max(
      1,
      snapToHalf(Number.isFinite(rawRowStart) ? rawRowStart : index + 1),
    ),
    colSpan,
    rowSpan,
    zIndex: Math.max(1, Number.isFinite(rawZIndex) ? rawZIndex : index + 1),
  };
}

function getTextStyle(style?: TextStyle): React.CSSProperties {
  return {
    fontFamily: style?.fontFamily || "inherit",
    fontSize: style?.fontSize ? `${style.fontSize}px` : undefined,
    fontWeight: style?.bold ? 700 : 400,
    fontStyle: style?.italic ? "italic" : "normal",
    textDecoration: style?.underline ? "underline" : "none",
    textAlign: style?.align ?? "left",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    lineHeight: 1.2,
  };
}

function getVisibility(draft: BuilderDraft) {
  const visibility = draft.pageVisibility ?? {};

  return {
    title: visibility.title !== false,
    subtitle: visibility.subtitle !== false,
    subtext: visibility.subtext !== false,
    description: visibility.description !== false,
  };
}

function getPageElements(draft: BuilderDraft) {
  return draft.pageElements ?? {};
}

function getPageColor(draft: BuilderDraft) {
  return (draft as DraftWithExtras).pageColor || "#0f1115";
}

function getBackgroundImage(draft: BuilderDraft) {
  return draft.pageBackground || "";
}

function getBlockShellClass(blockType: string) {
  if (blockType === "padding") {
    return "";
  }

  return "rounded-3xl border border-white/10 bg-white/6 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur";
}

function getColumnWidth() {
  return (CANVAS_WIDTH - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
}

function getItemStyle(
  grid: ReturnType<typeof normalizeGrid>,
): React.CSSProperties {
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

function isDarkCanvas(designKey?: string) {
  return designKey === "modern";
}

export default function PlacedBlocksPreview({
  draft,
  designKey = "modern",
}: {
  draft: BuilderDraft;
  designKey?: string;
}) {
  const visibility = getVisibility(draft);
  const pageElements = getPageElements(draft);

  const pageColor = getPageColor(draft);
  const backgroundImage = getBackgroundImage(draft);

  const previewItems: Array<{
    id: string;
    type: "page" | "block";
    key: string;
    grid: ReturnType<typeof normalizeGrid>;
    zIndex: number;
    content: React.ReactNode;
  }> = [];

  if (visibility.title) {
    const grid = normalizeGrid(pageElements.title, 1);

    previewItems.push({
      id: "__preview_title__",
      type: "page",
      key: "title",
      grid,
      zIndex: grid.zIndex,
      content: (
        <div style={getTextStyle(draft.titleStyle)}>
          {draft.title || "Untitled Microsite"}
        </div>
      ),
    });
  }

  if (visibility.subtitle) {
    const grid = normalizeGrid(pageElements.subtitle, 2);

    previewItems.push({
      id: "__preview_subtitle__",
      type: "page",
      key: "subtitle",
      grid,
      zIndex: grid.zIndex,
      content: (
        <div style={getTextStyle(draft.subtitleStyle)}>
          {draft.subtitle || ""}
        </div>
      ),
    });
  }

  if (visibility.subtext) {
    const grid = normalizeGrid(pageElements.subtext, 3);

    previewItems.push({
      id: "__preview_subtext__",
      type: "page",
      key: "subtext",
      grid,
      zIndex: grid.zIndex,
      content: (
        <div style={getTextStyle(draft.subtextStyle)}>
          {draft.subtext || ""}
        </div>
      ),
    });
  }

  if (visibility.description) {
    const grid = normalizeGrid(pageElements.description, 4);

    previewItems.push({
      id: "__preview_description__",
      type: "page",
      key: "description",
      grid,
      zIndex: grid.zIndex,
      content: (
        <div style={getTextStyle(draft.descriptionStyle)}>
          {draft.description || ""}
        </div>
      ),
    });
  }

  draft.blocks.forEach((block, index) => {
    const grid = normalizeGrid(
      block.grid as Partial<GridPlacementWithLayer> | undefined,
      index + 10,
    );

    previewItems.push({
      id: block.id,
      type: "block",
      key: block.type,
      grid,
      zIndex: grid.zIndex,
      content: <BlockRenderer block={block} designKey={designKey} />,
    });
  });

  const canvasHeight = previewItems.reduce((max, item) => {
    const rowEnd = item.grid.rowStart + item.grid.rowSpan - 1;

    return Math.max(max, rowEnd);
  }, 6);

  const totalHeight =
    canvasHeight * (GRID_ROW_HEIGHT + GRID_GAP) - GRID_GAP;

  return (
    <div
      className={[
        "overflow-x-auto rounded-[36px] border shadow-sm",
        isDarkCanvas(designKey)
          ? "border-neutral-800 text-white"
          : "border-neutral-200 text-neutral-900",
      ].join(" ")}
      style={{
        backgroundColor: pageColor,
      }}
    >
      <div className="px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div
          className="relative mx-auto overflow-hidden rounded-[28px]"
          style={{
            width: CANVAS_WIDTH,
            minWidth: CANVAS_WIDTH,
            height: totalHeight,
            backgroundColor: pageColor,
          }}
        >
          {backgroundImage ? (
            <>
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${backgroundImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  zIndex: 0,
                }}
              />

              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(rgba(15,17,21,0.18), rgba(23,26,33,0.18))",
                  zIndex: 1,
                }}
              />
            </>
          ) : null}

          {previewItems.map((item) => (
            <div
              key={item.id}
              style={{
                ...getItemStyle(item.grid),
                zIndex: (backgroundImage ? 10 : 1) + item.zIndex,
              }}
              className={
                item.type === "block"
                  ? getBlockShellClass(item.key)
                  : ""
              }
            >
              {item.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}