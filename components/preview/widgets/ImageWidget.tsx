"use client";

export default function ImageWidget({ block }: any) {
  return (
    <div className="overflow-hidden rounded-xl">
      <img
        src={block.data?.url || "/placeholder.jpg"}
        alt={block.data?.alt || ""}
        className="w-full h-auto"
      />
    </div>
  );
}