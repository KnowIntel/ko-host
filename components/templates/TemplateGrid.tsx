"use client";

import { useEffect, useMemo, useState } from "react";
import TemplateCard from "./TemplateCard";
import { TEMPLATE_DEFS, type TemplateDef } from "@/lib/templates/registry";

function thumbToImageUrl(thumb: string) {
  return `/templates/${thumb}.jpg`;
}

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

  const gridStyle = useMemo(
    () => ({
      display: "grid" as const,
      gap: "16px",
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
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