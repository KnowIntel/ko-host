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
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative w-[94vw] max-w-4xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
        
        {/* header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <div className="text-sm font-semibold text-neutral-900">
              {title}
            </div>
            <div className="mt-1 text-xs text-neutral-500">
              {description}
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            Close
          </button>
        </div>

        {/* preview */}
        <div className="relative h-[60vh] w-full bg-neutral-100">
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}