"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
const GRID_ROW_HEIGHT = 90;
const GRID_GAP = 16;
const PAGE_WIDTH = 2100;
const VIEWPORT_VERTICAL_PADDING = 40;

function getColumnWidth() {
  return (PAGE_WIDTH - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
}

function getStrideX() {
  return getColumnWidth() + GRID_GAP;
}

function getStrideY() {
  return GRID_ROW_HEIGHT + GRID_GAP;
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

function getItemStyle(grid: ResolvedGrid): React.CSSProperties {
  const strideX = getStrideX();
  const strideY = getStrideY();

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
  fixedScale,
  disableAutoScale = false,
  transparentPageBackground = false,
  hideFrame = false,
}: Props) {
  const typedDraft = draft as DraftWithExtras;
  const templateKey = typedDraft.templateName || "";
  const metadata = getMetadata(templateKey, designKey);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(fixedScale ?? 1);
  const [viewportHeight, setViewportHeight] = useState(0);

  const [submitState, setSubmitState] = useState<
      "idle" | "submitting" | "success" | "error"
    >("idle");
    const [submitMessage, setSubmitMessage] = useState("");

  const pageColor =
  (typedDraft.pageColor && typedDraft.pageColor.trim()) ||
  getResolvedPageColor(draft, designKey, metadata);

  const pageBackgroundImage = (typedDraft.pageBackgroundImage || "").trim();
  const pageBackgroundImageFit =
    typedDraft.pageBackgroundImageFit ?? "zoom";

  const pageBackgroundSize =
    pageBackgroundImageFit === "clip"
      ? "contain"
      : pageBackgroundImageFit === "stretch"
        ? "100% 100%"
        : "cover";

  /* =========================
     ✅ ADDED: SUBMIT HANDLER
     ========================= */
const handleSubmit = async () => {
  const inputs = document.querySelectorAll(
    "[data-form-field-id]",
  ) as NodeListOf<HTMLInputElement | HTMLTextAreaElement>;

  const fields: Record<string, string> = {};
  let hasRequiredError = false;

  inputs.forEach((input) => {
    const id = input.getAttribute("data-form-field-id");
    const block = draft.blocks.find((b) => b.id === id);

    if (block?.type === "form_field") {
      const value = input.value ?? "";
      fields[block.data.label] = value;

      if (block.data.required && !value.trim()) {
        hasRequiredError = true;
      }
    }
  });

  if (hasRequiredError) {
    setSubmitState("error");
    setSubmitMessage("Please complete all required fields.");
    return;
  }

  try {
    setSubmitState("submitting");
    setSubmitMessage("");

    const res = await fetch("/api/forms/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pageId: draft.slugSuggestion,
        pageSlug: draft.slugSuggestion,
        templateKey: typedDraft.templateName || "",
        designKey,
        fields,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
  setSubmitState("error");
  setSubmitMessage(data?.error || "Submission failed.");
  return;
}

setSubmitState("success");
setSubmitMessage("Submitted successfully.");

inputs.forEach((input) => {
  input.value = "";
});
  } catch {
    setSubmitState("error");
    setSubmitMessage("Submission failed.");
  }
};
  /* ========================= */

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
  (hasMeaningfulText(titleValue) || !!typedDraft.pageElements?.title);

const showSubtitle =
  (hasMeaningfulText(subtitleValue) || !!typedDraft.pageElements?.subtitle);

const showSubtext =
  (hasMeaningfulText(subtextValue) || !!typedDraft.pageElements?.subtext);

const showDescription =
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

  const textRowEnds = [
    showTitle ? titleGrid.rowStart + titleGrid.rowSpan - 1 : 0,
    showSubtitle ? subtitleGrid.rowStart + subtitleGrid.rowSpan - 1 : 0,
    showSubtext ? subtextGrid.rowStart + subtextGrid.rowSpan - 1 : 0,
    showDescription ? descriptionGrid.rowStart + descriptionGrid.rowSpan - 1 : 0,
  ];

  const maxRowEnd = Math.max(
    8,
    ...textRowEnds,
    ...blockEntries.map((entry) => entry.rowEnd),
  );

  const pageHeight = maxRowEnd * getStrideY() - GRID_GAP + 1;

  useEffect(() => {
    if (disableAutoScale) return;

    const updateViewportHeight = () => {
      setViewportHeight(window.innerHeight);
    };

    updateViewportHeight();
    window.addEventListener("resize", updateViewportHeight);

    return () => {
      window.removeEventListener("resize", updateViewportHeight);
    };
  }, [disableAutoScale]);

  useEffect(() => {
    if (disableAutoScale) {
      setScale(fixedScale ?? 1);
      return;
    }

    if (!containerRef.current) return;

    let frame = 0;

    const updateScale = () => {
      const containerWidth = containerRef.current?.clientWidth ?? PAGE_WIDTH;
      const widthScale = Math.min(1, containerWidth / PAGE_WIDTH);

      const availableHeight = Math.max(
        320,
        viewportHeight - VIEWPORT_VERTICAL_PADDING,
      );
      const heightScale = Math.min(1, availableHeight / pageHeight);

      // const nextScale = Math.min(widthScale, heightScale);
      const nextScale = Math.min(widthScale, heightScale) * 0.1;

      setScale((prev) => {
        if (Math.abs(prev - nextScale) < 0.001) {
          return prev;
        }
        return nextScale;
      });
    };

    updateScale();

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateScale);
    });

    observer.observe(containerRef.current);
    window.addEventListener("resize", updateScale);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [disableAutoScale, fixedScale, pageHeight, viewportHeight]);

  const resolvedScale = disableAutoScale ? (fixedScale ?? 1) : scale;
  // const resolvedScale = 0.75; // 👈 test freely
  const scaledWidth = PAGE_WIDTH * resolvedScale;
  const scaledHeight = pageHeight * resolvedScale;

  return (
    <div
      ref={containerRef}
      className="mx-auto w-full overflow-hidden"
      style={{
        height: scaledHeight,
      }}
    >
      <div
        className="mx-auto"
        style={{
          width: scaledWidth,
          height: scaledHeight,
          position: "relative",
        }}
      >
        <div
          className="relative"
        style={{
          width: PAGE_WIDTH,
          height: pageHeight,
          transform: `scale(${resolvedScale})`,
          transformOrigin: "top left",
          ...(transparentPageBackground
            ? {}
            : getCanvasInnerBackgroundStyle(draft, designKey, metadata)),
          backgroundColor: transparentPageBackground ? "transparent" : pageColor,
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
          {showTitle ? (
            <div style={getItemStyle(titleGrid)}>
              <div
                className="h-full w-full p-3"
                style={getPageTextBoxStyle(typedDraft, "title")}
              >
                <div style={getInlineTextStyle(titleStyle)}>{titleValue}</div>
              </div>
            </div>
          ) : null}

          {showSubtitle ? (
            <div style={getItemStyle(subtitleGrid)}>
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
            <div style={getItemStyle(subtextGrid)}>
              <div
                className="h-full w-full p-3"
                style={getPageTextBoxStyle(typedDraft, "subtext")}
              >
                <div style={getInlineTextStyle(subtextStyle)}>{subtextValue}</div>
              </div>
            </div>
          ) : null}

          {showDescription ? (
            <div style={getItemStyle(descriptionGrid)}>
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
            <div key={block.id} style={getItemStyle(grid)}>
              <div
                className="h-full w-full"
                style={{
                  transform: "scale(0.5)",
                  transformOrigin: "top left",
                  width: "200%",
                  height: "200%",
                }}
              >
                                <BlockRenderer
                  block={block}
                  designKey={designKey}
                  micrositeId={micrositeId}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}