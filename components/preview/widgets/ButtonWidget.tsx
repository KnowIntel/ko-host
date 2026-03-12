"use client";

export default function ButtonWidget({ block }: any) {
  return (
    <a
      href={block.data?.url || "#"}
      className="inline-block bg-black text-white px-5 py-2 rounded-lg"
    >
      {block.data?.label || "Click"}
    </a>
  );
}