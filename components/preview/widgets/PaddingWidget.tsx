"use client";

export default function PaddingWidget({ block }: any) {
  const height = block.data?.height || 40;

  return <div style={{ height }} />;
}