"use client";

type EmptyImagePlaceholderProps = {
  title: string;
  recommendedSize: string;
};

export default function EmptyImagePlaceholder({
  title,
  recommendedSize,
}: EmptyImagePlaceholderProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-neutral-100 px-4 text-center">
      <div className="text-sm font-medium text-neutral-600">{title}</div>
      <div className="mt-1 text-xs text-neutral-500">({recommendedSize})</div>
    </div>
  );
}