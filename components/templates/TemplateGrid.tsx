"use client";

import TemplateCard from "./TemplateCard";
import { TEMPLATE_DEFS, type TemplateDef } from "@/lib/templates/registry";

function thumbToImageUrl(thumb: string) {
  return `/templates/${thumb}.png`;
}

export default function TemplateGrid() {
  const templates: TemplateDef[] = TEMPLATE_DEFS;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
          <p className="mt-1 text-sm text-neutral-700">
            Pick a template, customize it free, then publish for $12 (90 days).
          </p>
        </div>
      </div>

      {/* ✅ Fixed sizing grid: 3 cols on mobile, 6 on desktop, with card width clamps */}
      <div
        className="
          mt-6 grid justify-center gap-4
          grid-cols-3
          lg:grid-cols-6
        "
        style={{
          // clamp each column so it cannot get huge or overlap
          gridAutoRows: "auto",
        }}
      >
        {templates.map((t) => (
          <div
            key={t.key}
            style={{
              width: 160,
              maxWidth: 160,
            }}
          >
            <TemplateCard
              templateKey={t.key}
              title={t.title}
              thumbnailUrl={thumbToImageUrl(t.thumb)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}