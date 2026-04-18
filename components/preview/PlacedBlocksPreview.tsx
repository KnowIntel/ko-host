// components\preview\PlacedBlocksPreview.tsx

"use client";

import { useMemo } from "react";

import type {
  BuilderDraft,
  GridPlacement,
  TextStyle,
} from "@/lib/templates/builder";
import BlockRenderer from "@/components/preview/BlockRenderer";
import {
  getMetadata,
  getResolvedPageColor,
  getResolvedPageGrid,
  getResolvedPageStyle,
  getResolvedPageValue,
  getCanvasInnerBackgroundStyle,
} from "@/components/builder/metadata/metadataResolver";

type Props = {
  draft: BuilderDraft;
  designKey: string;
  micrositeId?: string | null;
  serverNow?: number;
  fixedScale?: number;
  disableAutoScale?: boolean;
  transparentPageBackground?: boolean;
  hideFrame?: boolean;
};

type DraftWithExtras = BuilderDraft & {
  templateName?: string;
  pageColor?: string;
  pageBackgroundImage?: string;
  pageBackgroundImageFit?: "clip" | "zoom" | "stretch";
  pageLength?: "1200" | "1800" | "2400" | "3200" | "4000" | "5600";
  pageVisibility?: Partial<{
    title: boolean;
    subtitle: boolean;
    subtext: boolean;
    description: boolean;
  }>;
  pageElements?: {
    title?: Partial<GridPlacement>;
    subtitle?: Partial<GridPlacement>;
    subtext?: Partial<GridPlacement>;
    description?: Partial<GridPlacement>;
  };
  pageBlockAppearance?: Partial<
    Record<
      "title" | "subtitle" | "subtext" | "description",
      {
        backgroundColor?: string;
      }
    >
  >;
};

type ResolvedGrid = GridPlacement & {
  zIndex?: number;
};

const GRID_COLUMNS = 12;
const GRID_GAP = 16;
const BASE_PAGE_WIDTH = 2000;

function getPageLengthConfig(length?: DraftWithExtras["pageLength"]) {
  if (length === "1200") return { widthRatio: 1, pageHeight: 1200 };
  if (length === "1800") return { widthRatio: 1, pageHeight: 1800 };
  if (length === "2400") return { widthRatio: 1, pageHeight: 2400 };
  if (length === "3200") return { widthRatio: 1, pageHeight: 3200 };
  if (length === "4000") return { widthRatio: 1, pageHeight: 4000 };
  return { widthRatio: 1, pageHeight: 5600 };
}

function getColumnWidth(pageWidth: number) {
  return (pageWidth - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
}

function getStrideX(pageWidth: number) {
  return getColumnWidth(pageWidth) + GRID_GAP;
}

function getStrideY(rowHeight: number) {
  return rowHeight + GRID_GAP;
}

function normalizeResolvedGrid(
  grid: Partial<ResolvedGrid> | GridPlacement | undefined,
  fallback: ResolvedGrid,
): ResolvedGrid {
  return {
    colStart: grid?.colStart ?? fallback.colStart,
    rowStart: grid?.rowStart ?? fallback.rowStart,
    colSpan: grid?.colSpan ?? fallback.colSpan,
    rowSpan: grid?.rowSpan ?? fallback.rowSpan,
    zIndex: grid?.zIndex ?? fallback.zIndex ?? 1,
  };
}

function getItemStyle(
  grid: ResolvedGrid,
  pageWidth: number,
  rowHeight: number,
): React.CSSProperties {
  const strideX = getStrideX(pageWidth);
  const strideY = getStrideY(rowHeight);

  return {
    position: "absolute",
    left: (grid.colStart - 1) * strideX,
    top: (grid.rowStart - 1) * strideY,
    width: grid.colSpan * strideX - GRID_GAP,
    height: grid.rowSpan * strideY - GRID_GAP,
    zIndex: grid.zIndex ?? 1,
  };
}

function getInlineTextStyle(style?: TextStyle) {
  const decorations: string[] = [];

  if (style?.underline) decorations.push("underline");
  if (style?.strike) decorations.push("line-through");

  return {
    fontFamily:
      style?.fontFamily && style.fontFamily !== "inherit"
        ? style.fontFamily
        : "inherit",
    fontSize: style?.fontSize ? `${style.fontSize}px` : undefined,
    fontWeight: style?.bold ? 700 : 400,
    fontStyle: style?.italic ? "italic" : "normal",
    textDecoration: decorations.length ? decorations.join(" ") : "none",
    textAlign: style?.align ?? "left",
    color: style?.color || undefined,
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-word" as const,
    overflowWrap: "anywhere" as const,
    lineHeight: 1.2,
  };
}

function getPageTextBoxStyle(
  draft: DraftWithExtras,
  key: "title" | "subtitle" | "subtext" | "description",
): React.CSSProperties {
  const bg = draft.pageBlockAppearance?.[key]?.backgroundColor;

  return {
    backgroundColor: bg && bg !== "transparent" ? bg : undefined,
  };
}

function hasMeaningfulText(value?: string) {
  return typeof value === "string" && value.trim().length > 0;
}

export default function PlacedBlocksPreview({
  draft,
  designKey,
  micrositeId = null,
  serverNow,
  fixedScale = 1,
  disableAutoScale = false,
  transparentPageBackground = false,
  hideFrame = false,
}: Props) {
  const typedDraft = draft as DraftWithExtras;
  const templateKey = typedDraft.templateName || "";
  const metadata = getMetadata(templateKey, designKey);

  const pageLengthConfig = useMemo(
    () => getPageLengthConfig(typedDraft.pageLength),
    [typedDraft.pageLength],
  );

  const logicalPageWidth = BASE_PAGE_WIDTH * pageLengthConfig.widthRatio;
  const logicalRowHeight = 100;

  const pageColor =
    (typedDraft.pageColor && typedDraft.pageColor.trim()) ||
    getResolvedPageColor(draft, designKey, metadata);

  const pageBackgroundImage = (typedDraft.pageBackgroundImage || "").trim();
  const pageBackgroundImageFit = typedDraft.pageBackgroundImageFit ?? "zoom";

  const pageBackgroundSize =
    pageBackgroundImageFit === "clip"
      ? "contain"
      : pageBackgroundImageFit === "stretch"
        ? "100% 100%"
        : "cover";

  const titleGrid = normalizeResolvedGrid(
    getResolvedPageGrid(
      typedDraft.pageElements?.title,
      metadata?.page.title?.grid,
      {
        colStart: 2,
        rowStart: 1,
        colSpan: 8,
        rowSpan: 2,
        zIndex: 1,
      },
    ),
    {
      colStart: 2,
      rowStart: 1,
      colSpan: 8,
      rowSpan: 2,
      zIndex: 1,
    },
  );

  const subtitleGrid = normalizeResolvedGrid(
    getResolvedPageGrid(
      typedDraft.pageElements?.subtitle,
      metadata?.page.subtitle?.grid,
      {
        colStart: 2,
        rowStart: 3,
        colSpan: 7,
        rowSpan: 1,
        zIndex: 1,
      },
    ),
    {
      colStart: 2,
      rowStart: 3,
      colSpan: 7,
      rowSpan: 1,
      zIndex: 1,
    },
  );

  const subtextGrid = normalizeResolvedGrid(
    getResolvedPageGrid(
      typedDraft.pageElements?.subtext,
      metadata?.page.tagline?.grid,
      {
        colStart: 2,
        rowStart: 4,
        colSpan: 6,
        rowSpan: 1,
        zIndex: 1,
      },
    ),
    {
      colStart: 2,
      rowStart: 4,
      colSpan: 6,
      rowSpan: 1,
      zIndex: 1,
    },
  );

  const descriptionGrid = normalizeResolvedGrid(
    getResolvedPageGrid(
      typedDraft.pageElements?.description,
      metadata?.page.description?.grid,
      {
        colStart: 2,
        rowStart: 5,
        colSpan: 8,
        rowSpan: 2,
        zIndex: 1,
      },
    ),
    {
      colStart: 2,
      rowStart: 5,
      colSpan: 8,
      rowSpan: 2,
      zIndex: 1,
    },
  );

  const titleStyle = getResolvedPageStyle(
    draft.titleStyle,
    metadata?.page.title?.style,
  );
  const subtitleStyle = getResolvedPageStyle(
    draft.subtitleStyle,
    metadata?.page.subtitle?.style,
  );
  const subtextStyle = getResolvedPageStyle(
    draft.subtextStyle,
    metadata?.page.tagline?.style,
  );
  const descriptionStyle = getResolvedPageStyle(
    draft.descriptionStyle,
    metadata?.page.description?.style,
  );

  const titleValue = getResolvedPageValue(
    draft.title,
    metadata?.page.title?.value,
  );
  const subtitleValue = getResolvedPageValue(
    draft.subtitle,
    metadata?.page.subtitle?.value,
  );
  const subtextValue = getResolvedPageValue(
    draft.subtext,
    metadata?.page.tagline?.value,
  );
  const descriptionValue = getResolvedPageValue(
    draft.description,
    metadata?.page.description?.value,
  );

  const showTitle =
    typedDraft.pageVisibility?.title !== false &&
    (hasMeaningfulText(titleValue) || !!typedDraft.pageElements?.title);

  const showSubtitle =
    typedDraft.pageVisibility?.subtitle !== false &&
    (hasMeaningfulText(subtitleValue) || !!typedDraft.pageElements?.subtitle);

  const showSubtext =
    typedDraft.pageVisibility?.subtext !== false &&
    (hasMeaningfulText(subtextValue) || !!typedDraft.pageElements?.subtext);

  const showDescription =
    typedDraft.pageVisibility?.description !== false &&
    (hasMeaningfulText(descriptionValue) ||
      !!typedDraft.pageElements?.description);

  const blockEntries = useMemo(
    () =>
      [...(draft.blocks || [])]
        .map((block, index) => {
          const normalizedGrid = normalizeResolvedGrid(block.grid, {
            colStart: 1,
            rowStart: index + 1,
            colSpan: 12,
            rowSpan: 1,
            zIndex: index + 1,
          });

          return {
            block,
            grid: normalizedGrid,
            zIndex: normalizedGrid.zIndex ?? index + 1,
            rowEnd: normalizedGrid.rowStart + normalizedGrid.rowSpan - 1,
          };
        })
        .sort((a, b) => a.zIndex - b.zIndex),
    [draft.blocks],
  );

  const cartItems = useMemo(() => {
    return blockEntries
      .map(({ block }) => {
        if (block.type !== "listing") return null;

        const data = block.data as any;

        if (!data?.addToCart) return null;
        if (
          typeof data.price !== "number" ||
          !Number.isFinite(data.price) ||
          data.price <= 0
        ) {
          return null;
        }

        return {
          id: block.id,
          title: data.title || "Item",
          description:
            data.description?.trim() ||
            `ITEM-${block.id.slice(-6).toUpperCase()}`,
          price: data.price,
          quantity: 1,
        };
      })
      .filter(
        (
          item,
        ): item is {
          id: string;
          title: string;
          description: string;
          price: number;
          quantity: number;
        } => item !== null,
      );
  }, [blockEntries]);

  const textRowEnds = [
    showTitle ? titleGrid.rowStart + titleGrid.rowSpan - 1 : 0,
    showSubtitle ? subtitleGrid.rowStart + subtitleGrid.rowSpan - 1 : 0,
    showSubtext ? subtextGrid.rowStart + subtextGrid.rowSpan - 1 : 0,
    showDescription ? descriptionGrid.rowStart + descriptionGrid.rowSpan - 1 : 0,
  ];

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + (item.price ?? 0) * item.quantity,
      0,
    );
  }, [cartItems]);


  const contentRowEnd = Math.max(
    ...textRowEnds,
    ...blockEntries.map((entry) => entry.rowEnd),
    1,
  );

const pageHeight = pageLengthConfig.pageHeight;

const viewportWidth =
  typeof window !== "undefined" ? window.innerWidth : logicalPageWidth;

const fitScale = Math.min(1, viewportWidth / logicalPageWidth);

const previewScale = disableAutoScale
  ? fitScale * (fixedScale ?? 1)
  : fitScale;

const scaledPageWidth = logicalPageWidth * previewScale;
const scaledPageHeight = pageHeight * previewScale;
const shouldCenterScaledPage = true;


return (
<div
  className="w-full"
  style={{
    position: "relative",
    width: "100%",
    margin: 0,
    padding: 0,
    overflowX: "hidden",
    overflowY: "visible",
    WebkitOverflowScrolling: "touch",
    touchAction: "pan-x pan-y",
    backgroundColor: transparentPageBackground ? "transparent" : pageColor,
    ...(pageBackgroundImage && !transparentPageBackground
      ? {
          backgroundImage: `url("${pageBackgroundImage}")`,
          backgroundSize: pageBackgroundSize,
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }
      : {}),
  }}
>
<div
  style={{
    position: "relative",
    width: "100%",
    minHeight: scaledPageHeight,
    margin: 0,
    padding: 0,
    overflowX: "hidden",
    overflowY: "hidden",
    WebkitOverflowScrolling: "touch",
    touchAction: "pan-x pan-y",
    backgroundColor: transparentPageBackground ? "transparent" : pageColor,
    ...(transparentPageBackground
      ? {}
      : getCanvasInnerBackgroundStyle(draft, designKey, metadata)),
    ...(pageBackgroundImage && !transparentPageBackground
      ? {
          backgroundImage: `url("${pageBackgroundImage}")`,
          backgroundSize: pageBackgroundSize,
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }
      : {}),
    ...(hideFrame
      ? {}
      : {
          border: "1px solid rgba(0,0,0,0.10)",
          borderRadius: "8px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
        }),
  }}
>
  <div
    style={{
      position: "relative",
      width: scaledPageWidth,
      minWidth: scaledPageWidth,
      minHeight: scaledPageHeight,
      margin: shouldCenterScaledPage ? "0 auto" : 0,
      padding: 0,
      overflow: "visible",
    }}
  >
    <div
      style={{
        position: "relative",
        width: logicalPageWidth,
        minHeight: pageHeight,
        margin: 0,
        padding: 0,
        overflow: "visible",
        transform: `scale(${previewScale})`,
        transformOrigin: "top left",
      }}
    >
        {showTitle ? (
          <div style={getItemStyle(titleGrid, logicalPageWidth, logicalRowHeight)}>
            <div
              className="h-full w-full p-3"
              style={getPageTextBoxStyle(typedDraft, "title")}
            >
              <div style={getInlineTextStyle(titleStyle)}>{titleValue}</div>
            </div>
          </div>
        ) : null}

        {showSubtitle ? (
          <div
            style={getItemStyle(
              subtitleGrid,
              logicalPageWidth,
              logicalRowHeight,
            )}
          >
            <div
              className="h-full w-full p-3"
              style={getPageTextBoxStyle(typedDraft, "subtitle")}
            >
              <div style={getInlineTextStyle(subtitleStyle)}>
                {subtitleValue}
              </div>
            </div>
          </div>
        ) : null}

        {showSubtext ? (
          <div
            style={getItemStyle(
              subtextGrid,
              logicalPageWidth,
              logicalRowHeight,
            )}
          >
            <div
              className="h-full w-full p-3"
              style={getPageTextBoxStyle(typedDraft, "subtext")}
            >
              <div style={getInlineTextStyle(subtextStyle)}>{subtextValue}</div>
            </div>
          </div>
        ) : null}

        {showDescription ? (
          <div
            style={getItemStyle(
              descriptionGrid,
              logicalPageWidth,
              logicalRowHeight,
            )}
          >
            <div
              className="h-full w-full p-3"
              style={getPageTextBoxStyle(typedDraft, "description")}
            >
              <div style={getInlineTextStyle(descriptionStyle)}>
                {descriptionValue}
              </div>
            </div>
          </div>
        ) : null}

        {blockEntries.map(({ block, grid }) => (
          <div
            key={block.id}
            style={{
              ...getItemStyle(grid, logicalPageWidth, logicalRowHeight),
              overflow: "visible",
              pointerEvents: "auto",
              isolation: "isolate",
            }}
          >
            <div
              className="h-full w-full"
              style={{
                overflow: "visible",
                pointerEvents: "auto",
              }}
            >
<BlockRenderer
  block={block}
  designKey={designKey}
  micrositeId={micrositeId}
  serverNow={serverNow}
  cartItems={cartItems}
  cartSubtotal={cartSubtotal}
/>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
);
}