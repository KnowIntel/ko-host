"use client";

import type { MicrositeBlock } from "@/lib/templates/builder";

type Props = {
  block: MicrositeBlock;
  index: number;
  moveBlock: (from: number, to: number) => void;
  children: React.ReactNode;
};

export default function BlockWrapper({
  block,
  index,
  moveBlock,
  children,
}: Props) {
  function onDragStart(e: React.DragEvent) {
    e.dataTransfer.setData("kht-block-index", String(index));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();

    const from = Number(e.dataTransfer.getData("kht-block-index"));
    const to = index;

    if (!Number.isNaN(from)) {
      moveBlock(from, to);
    }
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDrop={onDrop}
      onDragOver={onDragOver}
      className="group relative"
    >
      <div className="absolute left-[-14px] top-1/2 -translate-y-1/2 cursor-grab text-neutral-400 opacity-0 group-hover:opacity-100">
        ⋮⋮
      </div>

      {children}
    </div>
  );
}