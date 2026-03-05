"use client";

import Image from "next/image";
import { Star } from "lucide-react";

export interface TemplateCardProps {
  templateKey: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  badge?: "New" | "Popular";
  isFavorite: boolean;
  onToggleFavorite: (key: string) => void;
  onPreview: (templateKey: string) => void;
}

export default function TemplateCard({
  templateKey,
  title,
  description,
  thumbnailUrl,
  badge,
  isFavorite,
  onToggleFavorite,
  onPreview,
}: TemplateCardProps) {
  return (
    <div className="group relative rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/20">

      {/* Thumbnail */}
      <div className="relative w-full h-40 bg-neutral-800">
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          className="object-cover"
        />

        {badge && (
          <div className="absolute top-2 left-2 text-xs px-2 py-1 rounded bg-purple-600 text-white">
            {badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">

        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-sm">{title}</h3>

          <button
            onClick={() => onToggleFavorite(templateKey)}
            className="opacity-0 group-hover:opacity-100 transition"
          >
            <Star
              size={16}
              className={isFavorite ? "fill-yellow-400 text-yellow-400" : ""}
            />
          </button>
        </div>

        <p className="text-xs text-neutral-400">
          {description}
        </p>

        {/* Buttons */}
        <div className="flex gap-2 pt-3">

          <button
            onClick={() => onPreview(templateKey)}
            className="flex-1 text-center text-xs px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700"
          >
            Preview
          </button>

          <a
            href={`/create/${templateKey}`}
            className="flex-1 text-center text-xs px-3 py-2 rounded bg-purple-600 hover:bg-purple-500"
          >
            Create
          </a>

        </div>

      </div>
    </div>
  );
}