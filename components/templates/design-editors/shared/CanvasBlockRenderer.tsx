"use client";

import type { EditorSelection } from "@/components/templates/design-editors/shared/EditorSelection";
import { selectBlock } from "@/components/templates/design-editors/shared/EditorSelection";

import type { MicrositeBlock } from "@/lib/templates/builder";

type Props = {
  blocks: MicrositeBlock[];
  selection: EditorSelection;
  onSelect: (selection: EditorSelection) => void;
  onMoveBlock: (from: number, to: number) => void;
};

export default function CanvasBlockRenderer({
  blocks,
  selection,
  onSelect,
  onMoveBlock,
}: Props) {
  function handleDragStart(e: React.DragEvent, index: number) {
    e.dataTransfer.setData("blockIndex", String(index));
  }

  function handleDrop(e: React.DragEvent, index: number) {
    const fromIndex = Number(e.dataTransfer.getData("blockIndex"));

    if (!Number.isNaN(fromIndex)) {
      onMoveBlock(fromIndex, index);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        const isSelected =
          selection.type === "block" && selection.blockId === block.id;

        return (
          <div
            key={block.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => onSelect(selectBlock(block.id))}
            className={[
              "cursor-pointer rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur transition",
              isSelected ? "ring-2 ring-blue-500" : "",
            ].join(" ")}
          >
            <div className="text-sm text-white/80">
              {block.type.toUpperCase()} BLOCK
            </div>
          </div>
        );
      })}
    </div>
  );
}