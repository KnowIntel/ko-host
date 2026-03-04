"use client";

import { useEffect, useMemo, useState } from "react";
import TemplateCard from "./TemplateCard";
import { TEMPLATE_DEFS, type TemplateDef } from "@/lib/templates/registry";

function thumbToImageUrl(thumb: string) {
  return `/templates/${thumb}.png`;
}

const CARD = 140; // must match TemplateCard
const GAP = 12;

export default function TemplateGrid() {
  // ✅ hide temp resume card from public gallery
  const templates: TemplateDef[] = useMemo(
    () => TEMPLATE_DEFS.filter((t) => t.key !== "resume_portfolio_temp"),
    []
  );

  // ✅ 3 cols mobile, 6 cols desktop
  const [cols, setCols] = useState<number>(3);

  useEffect(() => {
    function computeCols() {
      const w = window.innerWidth || 0;
      setCols(w >= 1024 ? 6 : 3); // lg breakpoint
    }
    computeCols();
    window.addEventListener("resize", computeCols);
    return () => window.removeEventListener("resize", computeCols);
  }, []);

  const gridStyle = useMemo(
    () => ({
      display: "grid" as const,
      gridTemplateColumns: `repeat(${cols}, ${CARD}px)`,
      gap: `${GAP}px`,
      justifyContent: "center" as const,
      paddingLeft: "12px", // ✅ prevents left cut-off on mobile
      paddingRight: "12px",
    }),
    [cols]
  );

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

      {/* ✅ no overflow clipping; centered; mobile safe padding */}
      <div className="mt-6 w-full">
        <div style={gridStyle}>
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
    </div>
  );
}