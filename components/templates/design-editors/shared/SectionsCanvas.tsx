"use client";

import type { SectionContainer } from "./sectionTypes";
import type { EditorSelection } from "./EditorSelection";
import GridCanvas from "./GridCanvas";

type Props = {
  sections: SectionContainer[];
  selection: EditorSelection;
  onSelect: (selection: EditorSelection) => void;
  onMoveBlock: (
    sectionId: string,
    blockId: string,
    patch: { colStart: number; rowStart: number },
  ) => void;
  onResizeBlock: (
    sectionId: string,
    blockId: string,
    patch: { colSpan?: number; rowSpan?: number },
  ) => void;
};

export default function SectionsCanvas({
  sections,
  selection,
  onSelect,
  onMoveBlock,
  onResizeBlock,
}: Props) {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div
          key={section.id}
          className="rounded-2xl border border-white/10 bg-white/5 p-5"
        >
          <div className="mb-4 text-sm font-semibold text-white">
            {section.title}
          </div>

          <GridCanvas
            blocks={section.blocks}
            selection={selection}
            onSelect={onSelect}
            onMoveBlock={(blockId, patch) =>
              onMoveBlock(section.id, blockId, patch)
            }
            onResizeBlock={(blockId, patch) =>
              onResizeBlock(section.id, blockId, patch)
            }
          />
        </div>
      ))}
    </div>
  );
}