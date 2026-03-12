"use client";

import Link from "next/link";
import { getDesignPreset } from "@/lib/design-presets/designRegistry";
import DesignPreviewRenderer from "@/components/designs/DesignPreviewRenderer";

export default function DesignCard({
  templateKey,
  designKey,
  label,
  image,
  isRecommended = false,
}: {
  templateKey: string;
  designKey: string;
  label: string;
  image: string;
  isRecommended?: boolean;
}) {
  const design = getDesignPreset(designKey);
  const href = `/create/${encodeURIComponent(
    templateKey,
  )}?design=${encodeURIComponent(designKey)}`;

  return (
    <Link
      href={href}
      className={[
        "group block overflow-hidden border bg-white shadow-sm transition duration-300",
        "hover:-translate-y-1 hover:shadow-xl",
        design.theme.cardRadiusClassName,
        isRecommended
          ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-white border-neutral-200"
          : "border-neutral-200",
      ].join(" ")}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <img
          src={image}
          alt={design.previewImageAlt || label}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          draggable={false}
        />

        <div className="absolute inset-0">
          <DesignPreviewRenderer
            templateKey={templateKey}
            designKey={designKey}
          />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-black/0 opacity-70" />

        {isRecommended ? (
          <div className="absolute right-3 top-3 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
            Recommended
          </div>
        ) : null}

        <div className="absolute bottom-3 left-3 right-3">
          <div className="inline-flex max-w-full items-center rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-neutral-800 backdrop-blur">
            <span className="truncate">
              {design.bestFor.slice(0, 2).join(" • ")}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-neutral-950">
            {design.label || label}
          </h3>

          <span className="shrink-0 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-[10px] font-medium text-neutral-600">
            {design.tone}
          </span>
        </div>

        <p className="line-clamp-2 text-xs text-neutral-600">
          {design.shortDescription}
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {design.bestFor.slice(0, 3).map((item) => (
            <span
              key={item}
              className="rounded-full border border-neutral-200 bg-white px-2 py-1 text-[10px] font-medium text-neutral-500"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}