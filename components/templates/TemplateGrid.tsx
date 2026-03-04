"use client";

import TemplateCard from "./TemplateCard";
import { TEMPLATE_DEFS, type TemplateDef } from "@/lib/templates/registry";

function thumbToImageUrl(thumb: string) {
  return `/templates/${thumb}.png`;
}

const CARD = 140; // must match TemplateCard clamps

export default function TemplateGrid() {
  const templates: TemplateDef[] = TEMPLATE_DEFS;

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

      {/* ✅ Hard grid: 3 cols mobile, 6 cols desktop, fixed column width */}
      <div className="mt-6 overflow-x-auto">
        <div
          style={{
            display: "grid",
            justifyContent: "center",
            gap: 12,
            gridTemplateColumns: `repeat(3, ${CARD}px)`,
          }}
          className="lg:[grid-template-columns:repeat(6,140px)]"
        >
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