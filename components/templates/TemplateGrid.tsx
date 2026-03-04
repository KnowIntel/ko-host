"use client";

import { useEffect, useMemo, useState } from "react";
import TemplateCard from "./TemplateCard";
import { TEMPLATE_DEFS, type TemplateDef } from "@/lib/templates/registry";

function thumbToImageUrl(thumb: string) {
  return `/templates/${thumb}.png`;
}

// Card width constraints (thumbnail will scale to this, not to your source image size)
const CARD_MIN_PX = 170; // mobile-friendly
const CARD_MAX_PX = 215; // keeps thumbnails from looking huge

export default function TemplateGrid() {
  const templates: TemplateDef[] = TEMPLATE_DEFS;

  // 3 cols on mobile, 6 cols on desktop (>= 1024px)
  const [cols, setCols] = useState<number>(3);

  useEffect(() => {
    function computeCols() {
      const w = window.innerWidth || 0;
      setCols(w >= 1024 ? 6 : 3);
    }
    computeCols();
    window.addEventListener("resize", computeCols);
    return () => window.removeEventListener("resize", computeCols);
  }, []);

  const gridStyle = useMemo(() => {
    // Fixed-ish card widths so thumbnails never become huge.
    // We still "aim" for 3/6 columns by changing the template,
    // but each column is clamped to CARD_MIN_PX..CARD_MAX_PX.
    const colDef = `minmax(${CARD_MIN_PX}px, ${CARD_MAX_PX}px)`;

    return {
      display: "grid" as const,
      gap: "16px",
      justifyContent: "center",
      gridTemplateColumns: `repeat(${cols}, ${colDef})`,
    };
  }, [cols]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
          <p className="mt-1 text-sm text-neutral-700">
            Pick a template, customize it free, then publish for $12 (90 days).
          </p>
        </div>
      </div>

      <div className="mt-6" style={gridStyle}>
        {templates.map((t) => (
          <TemplateCard
            key={t.key}
            templateKey={t.key}
            title={t.title}
            thumbnailUrl={thumbToImageUrl(t.thumb)}
          />
        ))}
      </div>
    </div>
  );
}