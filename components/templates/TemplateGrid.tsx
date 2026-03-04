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
  const templates: TemplateDef[] = useMemo(
    () => TEMPLATE_DEFS.filter((t) => t.key !== "resume_portfolio_temp"),
    []
  );

  // mobile stays 3 cols; desktop becomes auto-fit
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    function compute() {
      const w = window.innerWidth || 0;
      setIsDesktop(w >= 1024);
    }
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const gridStyle = useMemo(() => {
    return {
      display: "grid" as const,
      gap: `${GAP}px`,
      justifyContent: "center" as const,
      paddingLeft: "12px",
      paddingRight: "12px",
      gridTemplateColumns: isDesktop
        ? `repeat(auto-fit, ${CARD}px)` // ✅ dynamic columns
        : `repeat(3, ${CARD}px)`,       // ✅ fixed 3 on mobile
    };
  }, [isDesktop]);

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