"use client";

import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";

interface TemplateCardProps {
  templateKey: string;
  title: string;
  thumb: string;
  description?: string;
  tags?: string[];
  setupMins?: number;
  badge?: string;
}

export default function TemplateCard({
  templateKey,
  title,
  thumb,
  description,
  tags,
  setupMins,
  badge,
}: TemplateCardProps) {
  return (
    <div className="group relative rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10">

      {/* Thumbnail */}
      <div className="relative w-full h-40 bg-neutral-800">
        <Image
          src={thumb}
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

          <button className="opacity-0 group-hover:opacity-100 transition">
            <Star size={16} />
          </button>
        </div>

        {description && (
          <p className="text-xs text-neutral-400">
            {description}
          </p>
        )}

        {tags && (
          <div className="flex flex-wrap gap-1 pt-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-1 rounded bg-neutral-800 text-neutral-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {setupMins && (
          <div className="text-[11px] text-neutral-500">
            ~{setupMins} min setup
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 pt-3">

          <Link
            href={`/preview/${templateKey}`}
            className="flex-1 text-center text-xs px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700"
          >
            Preview
          </Link>

          <Link
            href={`/create/${templateKey}`}
            className="flex-1 text-center text-xs px-3 py-2 rounded bg-purple-600 hover:bg-purple-500"
          >
            Create
          </Link>

        </div>

      </div>
    </div>
  );
}