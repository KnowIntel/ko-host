"use client";

type EmptyImagePlaceholderProps = {
  title: string;
};

export default function EmptyImagePlaceholder({
  title,
}: EmptyImagePlaceholderProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-neutral-100 px-4 text-center">
      <div className="text-sm font-medium text-neutral-600">{title}</div>
    </div>
  );
}