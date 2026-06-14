// components\preview\PlacedBlocksPreview.tsx

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";

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
  previewMode?: boolean;
  micrositeId?: string | null;
  micrositeSlug?: string | null;
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
  pageLength?:
  | "1200"
  | "1400"
  | "1600"
  | "1800"
  | "2000"
  | "2400"
  | "2800"
  | "3200"
  | "3600"
  | "4000"
  | "5600";
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

import { MICROSITE_PAGE_WIDTH } from "@/lib/constants/layout";

const BASE_PAGE_WIDTH = MICROSITE_PAGE_WIDTH - 68;

const GRID_COLUMNS = 12;
const GRID_GAP = 16;

const HIDE_PREVIEW_SCROLLBAR_STYLE: React.CSSProperties = {
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};


function getPageLengthConfig(length?: DraftWithExtras["pageLength"]) {
  if (length === "1200") return { widthRatio: 1, pageHeight: 1200 };
  if (length === "1400") return { widthRatio: 1, pageHeight: 1400 };
  if (length === "1600") return { widthRatio: 1, pageHeight: 1600 };
  if (length === "1800") return { widthRatio: 1, pageHeight: 1800 };
  if (length === "2000") return { widthRatio: 1, pageHeight: 2000 };
  if (length === "2400") return { widthRatio: 1, pageHeight: 2400 };
  if (length === "2800") return { widthRatio: 1, pageHeight: 2800 };
  if (length === "3200") return { widthRatio: 1, pageHeight: 3200 };
  if (length === "3600") return { widthRatio: 1, pageHeight: 3600 };
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
  previewMode = false,
  micrositeId = null,
  micrositeSlug = null,
  serverNow,
  fixedScale = 1,
  disableAutoScale = false,
  transparentPageBackground = false,
  hideFrame = false,
}: Props) {
  const typedDraft = draft as DraftWithExtras;
  const templateKey = typedDraft.templateName || "";
  const metadata = getMetadata(templateKey, designKey);
  const containerRef = useRef<HTMLDivElement | null>(null);
const [containerWidth, setContainerWidth] = useState<number>(0);

  const pageLengthConfig = useMemo(
    () => getPageLengthConfig(typedDraft.pageLength),
    [typedDraft.pageLength],
  );

const logicalPageWidth = BASE_PAGE_WIDTH;
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

const [listingQuantities, setListingQuantities] = useState<Record<string, number>>({});

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

const availableCartItems = useMemo(() => {
  return blockEntries
    .map(({ block }) => {
      if (block.type !== "listing") return null;

      const data = block.data as any;

      if (!data?.addToCart) return null;

      const safePrice =
        typeof data.price === "number" && Number.isFinite(data.price)
          ? Math.max(0, data.price)
          : 0;

      if (safePrice <= 0) return null;

      const safeTitle =
        typeof data.title === "string" && data.title.trim()
          ? data.title.trim()
          : typeof data.sku === "string" && data.sku.trim()
            ? data.sku.trim()
            : "Item";

      const safeDescription =
        typeof data.description === "string" && data.description.trim()
          ? data.description.trim()
          : typeof data.sku === "string" && data.sku.trim()
            ? data.sku.trim()
            : `ITEM-${block.id.slice(-6).toUpperCase()}`;

      return {
        id: block.id,
        title: safeTitle,
        description: safeDescription,
        price: safePrice,
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
      } => item !== null,
    );
}, [blockEntries]);

useEffect(() => {
  function updateWidth() {
    const node = containerRef.current;
    if (!node) return;
    setContainerWidth(node.clientWidth || 0);
  }

  const node = containerRef.current;
  if (!node) return;

  updateWidth();

  const observer = new ResizeObserver(() => {
    updateWidth();
  });

  observer.observe(node);
  window.addEventListener("resize", updateWidth);

  return () => {
    observer.disconnect();
    window.removeEventListener("resize", updateWidth);
  };
}, []);

useEffect(() => {
  setListingQuantities((prev) => {
    const validIds = new Set(availableCartItems.map((item) => item.id));
    const next: Record<string, number> = {};

    for (const item of availableCartItems) {
      const rawQty = prev[item.id];
      next[item.id] =
        typeof rawQty === "number" && Number.isFinite(rawQty)
          ? Math.max(0, Math.floor(rawQty))
          : 0;
    }

    return next;
  });
}, [availableCartItems]);

const cartItems = useMemo(() => {
  return availableCartItems
    .map((item) => {
      const rawQty = listingQuantities[item.id];
      const quantity =
        typeof rawQty === "number" && Number.isFinite(rawQty)
          ? Math.max(0, Math.floor(rawQty))
          : 0;

      if (quantity <= 0) return null;

      return {
        ...item,
        quantity,
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
}, [availableCartItems, listingQuantities]);

const textRowEnds = [
  showTitle ? titleGrid.rowStart + titleGrid.rowSpan - 1 : 0,
  showSubtitle ? subtitleGrid.rowStart + subtitleGrid.rowSpan - 1 : 0,
  showSubtext ? subtextGrid.rowStart + subtextGrid.rowSpan - 1 : 0,
  showDescription ? descriptionGrid.rowStart + descriptionGrid.rowSpan - 1 : 0,
];

const cartSubtotal = useMemo(() => {
  return cartItems.reduce((sum, item) => {
    const safePrice =
      typeof item.price === "number" && Number.isFinite(item.price)
        ? Math.max(0, item.price)
        : 0;

    const safeQuantity =
      typeof item.quantity === "number" && Number.isFinite(item.quantity)
        ? Math.max(0, Math.floor(item.quantity))
        : 0;

    if (safePrice <= 0 || safeQuantity <= 0) return sum;

    return sum + safePrice * safeQuantity;
  }, 0);
}, [cartItems]);


  const contentRowEnd = Math.max(
    ...textRowEnds,
    ...blockEntries.map((entry) => entry.rowEnd),
    1,
  );

const pageHeight = pageLengthConfig.pageHeight;

const availableWidth = Math.round(
  containerRef.current?.getBoundingClientRect().width || containerWidth || logicalPageWidth
);

const fitScale =
  availableWidth > 0
    ? Math.min(1, availableWidth / logicalPageWidth)
    : 1;

const previewScale = disableAutoScale
  ? (fixedScale ?? 1)
  : Math.max(0.01, fitScale);

const scaledPageHeight = pageHeight * previewScale;
const scaledContentWidthPercent =
  previewScale > 0
    ? (containerWidth || logicalPageWidth) / (logicalPageWidth * previewScale) * 100
    : 100;

return (
<div
  ref={containerRef}
  data-ko-preview-scrollbar-hidden="true"
  className="m-0 block w-full max-w-none p-0"
  style={{
    position: "relative",
    width: "100%",
    margin: 0,
    padding: 0,
    overflowX: "auto",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    ...(showVerticalScrollbar || showHorizontalScrollbar
  ? {}
  : HIDE_PREVIEW_SCROLLBAR_STYLE),
    touchAction: "auto",
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
    overflow: "visible",
    WebkitOverflowScrolling: "touch",
    touchAction: "auto",
    backgroundColor: transparentPageBackground ? "transparent" : pageColor,
    boxSizing: "border-box",
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
    width: "100%",
    minHeight: scaledPageHeight,
    margin: 0,
    padding: 0,
    overflow: "hidden",
  }}
>
<div
  style={{
    position: "absolute",
    left: "50%",
    top: 0,
    width: logicalPageWidth,
    minHeight: pageHeight,
    margin: 0,
    padding: 0,
    overflow: "visible",
    transform: `translateX(-50%) scale(${previewScale})`,
    transformOrigin: "top center",
    willChange: "transform",
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

{blockEntries.map(({ block, grid }) => {
const itemStyle = getItemStyle(grid, logicalPageWidth, logicalRowHeight);
const showVerticalScrollbar = (block as any).showVerticalScrollbar === true;
const showHorizontalScrollbar = (block as any).showHorizontalScrollbar === true;

const isScrollableBlock =
  block.type === "calendar_event" ||
  showVerticalScrollbar ||
  showHorizontalScrollbar;

const isInteractiveBlock =
  block.type === "schedule_agenda" ||
  block.type === "rsvp" ||
  block.type === "form_field" ||
  block.type === "poll" ||
  block.type === "thread" ||
  block.type === "post_board" ||
  block.type === "enrollment_board" ||
  block.type === "file_share" ||
  block.type === "checkout" ||
  block.type === "cart" ||
  block.type === "listing" ||
  block.type === "donation" ||
  block.type === "cta" ||
  block.type === "links" ||
  block.type === "faq" ||
  block.type === "puzzle" ||
  block.type === "spin_wheel" ||
  block.type === "spreadsheet" ||
  block.type === "audio" ||
  block.type === "video" ||
  block.type === "frame";

  async function handleDownloadFrame(
  frameBlock: Extract<BuilderDraft["blocks"][number], { type: "frame" }>,
) {
  const root = containerRef.current;
  if (!root) return;

  const frameEl = root.querySelector<HTMLElement>(
    `[data-preview-block-id="${frameBlock.id}"]`,
  );

  if (!frameEl) return;

  const rootRect = root.getBoundingClientRect();
  const frameRect = frameEl.getBoundingClientRect();

  const dataUrl = await htmlToImage.toPng(root, {
    cacheBust: true,
    pixelRatio: 2,
    filter: (node) => {
      if (!(node instanceof HTMLElement)) return true;
      return node.dataset.frameDownloadButton !== "true";
    },
  });

  const image = new window.Image();
  image.src = dataUrl;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () =>
      reject(new Error("Unable to load frame export image."));
  });

  const scaleX = image.width / rootRect.width;
  const scaleY = image.height / rootRect.height;

  const cropX = (frameRect.left - rootRect.left) * scaleX;
  const cropY = (frameRect.top - rootRect.top) * scaleY;
  const cropWidth = frameRect.width * scaleX;
  const cropHeight = frameRect.height * scaleY;

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(cropWidth));
  canvas.height = Math.max(1, Math.round(cropHeight));

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    canvas.width,
    canvas.height,
  );

const croppedUrl = canvas.toDataURL("image/png");

const { jsPDF } = await import("jspdf");

const orientation =
  canvas.width >= canvas.height ? "landscape" : "portrait";

const pdf = new jsPDF({
  orientation,
  unit: "px",
  format: [canvas.width, canvas.height],
});

pdf.addImage(croppedUrl, "PNG", 0, 0, canvas.width, canvas.height);

pdf.save(`${frameBlock.data.frameName?.trim() || "frame-capture"}.pdf`);
}

  return (
<div
  key={block.id}
  data-preview-block-id={block.id}
  data-preview-block-type={block.type}
  id={
    block.type === "bookmark"
      ? String((block.data as any).slug || block.id)
      : undefined
  }
style={{
  ...itemStyle,
zIndex:
  block.type === "bookmark"
    ? -1
    : itemStyle.zIndex,
  overflow: isScrollableBlock ? "hidden" : "visible",
  pointerEvents: block.type === "bookmark" ? "none" : isInteractiveBlock ? "auto" : "none",
  isolation: "isolate",
}}
    >
<div
  data-ko-preview-scrollbar-hidden="true"
  className="h-full w-full"
  style={{
    height: "100%",
    maxHeight: "100%",
overflowX: showHorizontalScrollbar ? "auto" : "hidden",
overflowY: showVerticalScrollbar || block.type === "calendar_event" ? "auto" : "hidden",
    WebkitOverflowScrolling: "touch",
    overscrollBehavior: isScrollableBlock ? "contain" : "auto",
    ...HIDE_PREVIEW_SCROLLBAR_STYLE,
    pointerEvents:
      block.type === "bookmark"
        ? "none"
        : previewMode
          ? "auto"
          : isInteractiveBlock
            ? "auto"
            : "none",
  }}
  onWheel={(event) => {
    if (isScrollableBlock) {
      event.stopPropagation();
    }
  }}
  onTouchMove={(event) => {
    if (isScrollableBlock) {
      event.stopPropagation();
    }
  }}
>
<BlockRenderer
  key={`${block.id}-${JSON.stringify(block.data)}`}
  block={block}
  designKey={designKey}
  micrositeId={micrositeId}
    micrositeSlug={
    micrositeSlug ||
    (draft as any).slug ||
    (draft as any).siteSlug ||
    (draft as any).micrositeSlug ||
    null
  }
  serverNow={serverNow}
  previewMode={previewMode}
  cartItems={cartItems}
  cartSubtotal={cartSubtotal}
  listingQuantities={listingQuantities}
  onDownloadFrame={handleDownloadFrame as any}
  onChangeListingQuantity={(listingId: string, nextQuantity: number) => {
    setListingQuantities((prev) => ({
      ...prev,
      [listingId]: Math.max(0, Math.floor(nextQuantity || 0)),
    }));
  }}
/>
    </div>
    </div>
  );
})}
      </div>
    </div>
  </div>
</div>
);
} 
