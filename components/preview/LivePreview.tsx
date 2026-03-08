"use client";

import type { BuilderDraft } from "@/lib/templates/builder";
import { getDesignPreset } from "@/lib/design-presets/designRegistry";
import BlockRenderer from "./BlockRenderer";

function resolvePageBackground(
  pageBackground: string | undefined,
  fallbackClassName: string,
) {
  switch (pageBackground) {
    case "soft-blue":
      return "bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#dbeafe_100%)]";
    case "sunset":
      return "bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_45%,#fde68a_100%)]";
    case "mint":
      return "bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_50%,#d1fae5_100%)]";
    case "lavender":
      return "bg-[linear-gradient(135deg,#f5f3ff_0%,#ffffff_50%,#e9d5ff_100%)]";
    case "rose":
      return "bg-[linear-gradient(135deg,#fff1f2_0%,#ffffff_50%,#fecdd3_100%)]";
    case "dark-glow":
      return "bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_30%),linear-gradient(180deg,#0f172a_0%,#111827_100%)]";
    case "none":
    default:
      return fallbackClassName;
  }
}

export default function LivePreview({
  draft,
  designKey = "blank",
}: {
  draft: BuilderDraft;
  designKey?: string;
}) {
  const design = getDesignPreset(designKey);
  const theme = design.theme;

  const pageBackgroundClassName = resolvePageBackground(
    draft.pageBackground,
    theme.pageClassName,
  );

  return (
    <div className={`h-full overflow-y-auto p-6 ${pageBackgroundClassName}`}>
      <div className={theme.containerClassName}>
        <div className={theme.blockGapClassName}>
          {draft.title && (
            <div className={theme.titleWrapClassName}>
              <h1 className={theme.headingClassName}>{draft.title}</h1>
            </div>
          )}

          {draft.blocks.map((block) => (
            <div key={block.id} className={theme.sectionClassName}>
              <BlockRenderer block={block} designKey={designKey} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}