"use client";

import Image from "next/image";

type Props = {
  open: boolean;
  title: string;
  description: string;
  thumbnailUrl: string;
  onClose: () => void;
};

export default function TemplatePreviewModal({
  open,
  title,
  description,
  thumbnailUrl,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <button
        aria-label="Close preview"
        onClick={onClose}
        className="absolute inset-0 bg-black/70"
      />

      {/* Modal */}
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
          <div>
            <div className="text-sm font-semibold text-white">{title}</div>
            <div className="mt-1 text-xs text-neutral-400">{description}</div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-800 px-3 py-2 text-xs text-white hover:bg-neutral-700"
          >
            Close
          </button>
        </div>

        <div className="relative h-[52vh] w-full bg-neutral-900">
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}