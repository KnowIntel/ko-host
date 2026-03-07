"use client";

import Link from "next/link";
import { getDesignPreset } from "@/lib/design-presets/designRegistry";

export default function DesignCard({
  templateKey,
  designKey,
  label,
  image,
}: {
  templateKey: string;
  designKey: string;
  label: string;
  image: string;
}) {
  const design = getDesignPreset(designKey);

  const href = `/create/${encodeURIComponent(
    templateKey,
  )}?design=${encodeURIComponent(designKey)}`;

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-xl"
    >
      {/* Preview image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <img
          src={image}
          alt={label}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

        {/* Badge */}
        {design.badge && (
          <div className="absolute left-3 top-3 rounded-full bg-black/80 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur">
            {design.badge}
          </div>
        )}

        {/* subtle gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
      </div>

      {/* Text section */}
      <div className="space-y-1 p-4">
        <h3 className="text-sm font-semibold text-neutral-900">
          {design.label}
        </h3>

        <p className="text-xs text-neutral-600 line-clamp-2">
          {design.shortDescription}
        </p>
      </div>
    </Link>
  );
}