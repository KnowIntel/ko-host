"use client";

import Link from "next/link";

const W = 140; // keep in sync with grid
const H = 105; // 4:3

function formatLabel(title: string) {
  return (title || "").trim();
}

function readStringArray(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeStringArray(key: string, arr: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(arr));
  } catch {
    // ignore
  }
}

function markRecentlyViewed(templateKey: string) {
  const key = "kht:recent";
  const prev = readStringArray(key);
  const next = [templateKey, ...prev.filter((k) => k !== templateKey)].slice(0, 12);
  writeStringArray(key, next);
}

type StatsMap = Record<string, { views: number; creates: number; updatedAt: number }>;

function readStats(): StatsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem("kht:stats");
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStats(stats: StatsMap) {
  try {
    window.localStorage.setItem("kht:stats", JSON.stringify(stats));
  } catch {
    // ignore
  }
}

function bumpStat(templateKey: string, field: "views" | "creates") {
  const stats = readStats();
  const cur = stats[templateKey] || { views: 0, creates: 0, updatedAt: Date.now() };
  const next = {
    ...cur,
    [field]: (cur[field] || 0) + 1,
    updatedAt: Date.now(),
  };
  stats[templateKey] = next;
  writeStats(stats);
}

export default function TemplateCard(props: {
  templateKey: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  badge?: "Popular" | "New" | null;
  isFavorite?: boolean;
  onToggleFavorite?: (templateKey: string) => void;
  onPreview?: (templateKey: string) => void;
}) {
  const {
    templateKey,
    title,
    description,
    thumbnailUrl,
    badge = null,
    isFavorite = false,
    onToggleFavorite,
    onPreview,
  } = props;

  const src = thumbnailUrl || "/templates/placeholder.png";

  function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(templateKey);
  }

  function handleCardClick() {
    // card click navigates to /create
    markRecentlyViewed(templateKey);
    bumpStat(templateKey, "creates");
  }

  function handlePreview(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    // preview = a "view"
    markRecentlyViewed(templateKey);
    bumpStat(templateKey, "views");
    onPreview?.(templateKey);
  }

  return (
    <Link
      href={`/create/${templateKey}`}
      onClick={handleCardClick}
      className="group block"
      style={{ width: W, maxWidth: W, minWidth: W }}
    >
      <div
        className={[
          "relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm",
          "transition-all duration-200 ease-out transform-gpu",
          "group-hover:-translate-y-[4px] group-hover:shadow-xl",
        ].join(" ")}
        style={{ width: W, maxWidth: W, minWidth: W }}
      >
        {/* Hover glow */}
        <div className="pointer-events-none absolute -inset-16 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="h-full w-full bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.28),transparent_60%)]" />
        </div>

        {/* Media */}
        <div className="relative bg-neutral-100" style={{ width: W, height: H, overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={title}
            draggable={false}
            loading="lazy"
            style={{
              pointerEvents: "none",
              width: W,
              height: H,
              objectFit: "cover",
              userSelect: "none",
              display: "block",
            }}
          />

          {/* Image overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-70 transition-opacity duration-150 group-hover:opacity-90" />

          {/* Price pill */}
          <div className="pointer-events-none absolute left-2 top-2">
            <div className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-neutral-900 backdrop-blur">
              $12
            </div>
          </div>

          {/* Badge */}
          {badge ? (
            <div className="pointer-events-none absolute right-2 top-2">
              <div
                className={[
                  "rounded-full px-2 py-1 text-[10px] font-semibold text-white backdrop-blur",
                  badge === "Popular" ? "bg-neutral-900/90" : "bg-emerald-600/90",
                ].join(" ")}
              >
                {badge}
              </div>
            </div>
          ) : null}

          {/* Favorite star */}
          <button
            type="button"
            onClick={toggleFavorite}
            className={[
              "absolute left-2 bottom-2 z-10",
              "inline-flex h-7 w-7 items-center justify-center rounded-full",
              "bg-white/90 backdrop-blur shadow-sm",
              "transition hover:bg-white",
            ].join(" ")}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            title={isFavorite ? "Favorited" : "Favorite"}
          >
            <span
              className={[
                "text-[14px] leading-none",
                isFavorite ? "text-amber-500" : "text-neutral-400",
              ].join(" ")}
            >
              ★
            </span>
          </button>

          {/* Preview button */}
          <button
            type="button"
            onClick={handlePreview}
            className={[
              "absolute right-2 bottom-2 z-10",
              "inline-flex items-center justify-center rounded-full",
              "bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-neutral-900",
              "backdrop-blur shadow-sm transition hover:bg-white",
            ].join(" ")}
            aria-label="Preview template"
            title="Preview"
          >
            Preview
          </button>

          {/* Create CTA */}
          <div className="absolute inset-x-0 bottom-2 flex justify-center px-2">
            <div className="kht-create inline-flex items-center justify-center rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-neutral-900 shadow-sm backdrop-blur">
              Create
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-2">
          <div
            className="text-[12px] font-semibold tracking-tight text-neutral-900"
            style={{
              lineHeight: "1.2",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={title}
          >
            {formatLabel(title)}
          </div>

          <div
            className="mt-1 text-[10px] font-medium text-neutral-500"
            style={{
              lineHeight: "1.2",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={description || ""}
          >
            {description?.trim() ? description.trim() : " "}
          </div>
        </div>

        {/* Shine */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="absolute -left-10 top-0 h-full w-24 rotate-12 bg-white/20 blur-xl" />
        </div>
      </div>

      <style jsx>{`
        .kht-create {
          opacity: 1;
          transform: translateY(0px);
          transition: opacity 160ms ease, transform 160ms ease;
        }
        @media (hover: hover) and (pointer: fine) {
          .kht-create {
            opacity: 0;
            transform: translateY(6px);
          }
          .group:hover .kht-create {
            opacity: 1;
            transform: translateY(0px);
          }
        }
      `}</style>
    </Link>
  );
}