"use client";

import type { BuilderBlockType } from "@/lib/templates/builder";

type Props = {
  onDropBlock: (type: BuilderBlockType) => void;
  children: React.ReactNode;
};

export default function CanvasDropZone({ onDropBlock, children }: Props) {
  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const blockType = e.dataTransfer.getData(
      "application/kht-block-type",
    ) as BuilderBlockType;

    if (blockType) {
      onDropBlock(blockType);
    }
  }

  return (
    <div onDragOver={handleDragOver} onDrop={handleDrop}>
      {children}
    </div>
  );
}