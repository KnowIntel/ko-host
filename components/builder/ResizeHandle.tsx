"use client";

import { useRef } from "react";

type Props = {
  onResize: (dx: number, dy: number) => void;
};

export default function ResizeHandle({ onResize }: Props) {
  const startX = useRef(0);
  const startY = useRef(0);

  function onMouseDown(e: React.MouseEvent) {
    e.stopPropagation();

    startX.current = e.clientX;
    startY.current = e.clientY;

    function onMove(ev: MouseEvent) {
      const dx = ev.clientX - startX.current;
      const dy = ev.clientY - startY.current;

      onResize(dx, dy);
    }

    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <div
      onMouseDown={onMouseDown}
      className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize rounded-sm bg-black"
    />
  );
}