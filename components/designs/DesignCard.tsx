"use client";

import Link from "next/link";
import type { BuilderDraft } from "@/lib/templates/builder";
import DesignCardCanvasPreview from "@/components/designs/DesignCardCanvasPreview";

export default function DesignCard({
  templateKey,
  designKey,
  label,
  description,
  previewDraft,
  backgroundImage,
  isRecommended = false,
}: {
  templateKey: string;
  designKey: string;
  label: string;
  description?: string;
  previewDraft: BuilderDraft;
  backgroundImage?: string;
  isRecommended?: boolean;
}) {
const href = `/create/${encodeURIComponent(
  templateKey,
)}?design=${encodeURIComponent(designKey)}&mode=new`;

  return (
    <Link
      href={href}
      className={[
        "group block overflow-hidden rounded-[26px] border bg-white shadow-sm transition duration-300",
        "hover:-translate-y-1 hover:shadow-xl",
        isRecommended
          ? "border-neutral-200 ring-2 ring-emerald-500 ring-offset-2 ring-offset-white"
          : "border-neutral-200",
      ].join(" ")}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        {backgroundImage ? (
          <img
            src={backgroundImage}
            alt={label}
            className="absolute inset-0 h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.04]"
            draggable={false}
          />
        ) : null}

        <DesignCardCanvasPreview
          draft={previewDraft}
          designKey={designKey}
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/12 via-black/0 to-black/0 opacity-70" />

        {isRecommended ? (
          <div className="absolute right-3 top-3 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
            Recommended
          </div>
        ) : null}

        <div className="absolute bottom-3 left-3 right-3">
          <div className="inline-flex max-w-full items-center rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-neutral-800 backdrop-blur">
            <span className="truncate">{label}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-neutral-950">{label}</h3>

          <span className="shrink-0 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-[10px] font-medium text-neutral-600">
            Layout
          </span>
        </div>

        <p className="line-clamp-2 text-xs text-neutral-600">
          {description || "Design layout preset"}
        </p>
      </div>
    </Link>
  );
}