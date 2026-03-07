"use client";

import type { BuilderDraft } from "@/lib/templates/builder";
import { getDesignPreset } from "@/lib/design-presets/designRegistry";
import BlockRenderer from "./BlockRenderer";

export default function LivePreview({
  draft,
  designKey = "blank",
}: {
  draft: BuilderDraft;
  designKey?: string;
}) {
  const design = getDesignPreset(designKey);

  return (
    <div className="h-full overflow-y-auto bg-neutral-50 p-6">
      <div className={design.containerClassName}>

        {/* EVERYTHING shares the same vertical spacing */}
        <div className="space-y-8">

          {draft.title && (
            <div className="text-center">
              <h1 className={design.headingClassName}>{draft.title}</h1>
            </div>
          )}

          {draft.blocks.map((block) => (
            <div key={block.id} className={design.sectionClassName}>
              <BlockRenderer block={block} designKey={designKey} />
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}