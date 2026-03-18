"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { BuilderDraft } from "@/lib/templates/builder";
import PlacedBlocksPreview from "@/components/preview/PlacedBlocksPreview";

const PAGE_WIDTH = 2200;

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

  const fixedScale = useMemo(() => {
    if (!size.width) return 0.12;
    return size.width / PAGE_WIDTH;
  }, [size.width]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0">
        <PlacedBlocksPreview
          draft={draft}
          designKey={designKey}
          fixedScale={fixedScale}
          disableAutoScale
          transparentPageBackground
          hideFrame
        />
      </div>
    </div>
  );
}