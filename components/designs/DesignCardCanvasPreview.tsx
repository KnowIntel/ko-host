// components/designs/DesignCardCanvasPreview.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { BuilderDraft } from "@/lib/templates/builder";
import PlacedBlocksPreview from "@/components/preview/PlacedBlocksPreview";

const PAGE_WIDTH = 2200;
const GRID_GAP = 16;

type DraftWithExtras = BuilderDraft & {
  pageSize?: "full" | "letter" | "square" | "story" | "wide";
};

function getPageSizePreviewConfig(size?: DraftWithExtras["pageSize"]) {
  if (size === "letter") {
    return { rowHeight: 111.1111111111, minRows: 16 };
  }

  if (size === "square") {
    return { rowHeight: 145.75, minRows: 12 };
  }

  if (size === "story") {
    return { rowHeight: 111.1111111111, minRows: 16 };
  }

  if (size === "wide") {
    return { rowHeight: 100, minRows: 9 };
  }

  return { rowHeight: 90, minRows: 8 };
}

function getStrideY(rowHeight: number) {
  return rowHeight + GRID_GAP;
}

function estimateDraftHeight(draft: BuilderDraft) {
  const typedDraft = draft as DraftWithExtras;
  const config = getPageSizePreviewConfig(typedDraft.pageSize);

  const textBlocks = [
    typedDraft.title ? { rowStart: 1, rowSpan: 2 } : null,
    typedDraft.subtitle ? { rowStart: 3, rowSpan: 1 } : null,
    typedDraft.subtext ? { rowStart: 4, rowSpan: 1 } : null,
    typedDraft.description ? { rowStart: 5, rowSpan: 2 } : null,
  ].filter(Boolean) as Array<{ rowStart: number; rowSpan: number }>;

  const textRowEnds = textBlocks.map(
    (item) => item.rowStart + item.rowSpan - 1,
  );

  const blockRowEnds = (draft.blocks || []).map((block, index) => {
    const rowStart =
      typeof block.grid?.rowStart === "number" ? block.grid.rowStart : index + 1;
    const rowSpan =
      typeof block.grid?.rowSpan === "number" ? block.grid.rowSpan : 1;

    return rowStart + rowSpan - 1;
  });

  const maxRowEnd = Math.max(
    config.minRows,
    ...textRowEnds,
    ...blockRowEnds,
  );

  return maxRowEnd * getStrideY(config.rowHeight) - GRID_GAP + 1;
}

export default function DesignCardCanvasPreview({
  draft,
  designKey,
}: {
  draft: BuilderDraft;
  designKey: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const update = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      setSize({
        width: rect.width,
        height: rect.height,
      });
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(containerRef.current);

    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const estimatedHeight = useMemo(() => estimateDraftHeight(draft), [draft]);

  const fixedScale = useMemo(() => {
    if (!size.width || !size.height) return 0.12;

    const widthScale = size.width / PAGE_WIDTH;
    const heightScale = size.height / estimatedHeight;

    return Math.min(widthScale, heightScale);
  }, [size.width, size.height, estimatedHeight]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <PlacedBlocksPreview
          draft={draft}
          designKey={designKey}
          fixedScale={fixedScale}
          disableAutoScale={true}
          transparentPageBackground={true}
          hideFrame={true}
        />
      </div>
    </div>
  );
}