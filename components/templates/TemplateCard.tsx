"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

const W = 140; // keep in sync with grid
const H = 105; // 4:3

function formatLabel(title: string) {
  return (title || "").trim();
}

function notify(name: "kht:recent" | "kht:stats") {
  try {
    window.dispatchEvent(new Event(name));
  } catch {}
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
  } catch {}
}

function markRecentlyViewed(templateKey: string) {
  const key = "kht:recent";
  const prev = readStringArray(key);
  const next = [templateKey, ...prev.filter((k) => k !== templateKey)].slice(0, 12);
  writeStringArray(key, next);
  notify("kht:recent");
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
  } catch {}
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
  notify("kht:stats");
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
  setupMins?: number;
}) {
  const router = useRouter();

  const {
    templateKey,
    title,
    description,
    thumbnailUrl,
    badge = null,
    isFavorite = false,
    onToggleFavorite,
    onPreview,
    setupMins,
  } = props;

  const src = thumbnailUrl || "/templates/placeholder.png";

  function trackCreate() {
    markRecentlyViewed(templateKey);
    bumpStat(templateKey, "creates");
  }

  function trackPreview() {
    markRecentlyViewed(templateKey);
    bumpStat(templateKey, "views");
  }

  function goCreate() {
    trackCreate();
    router.push(`/create/${templateKey}`);
  }

  function onCardClick() {
    goCreate();
  }

  function toggleFavorite(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(templateKey);
  }

  function handlePreview(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    trackPreview();
    onPreview?.(templateKey);
  }

  function handleCreate(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    goCreate();
  }

  return (
    <div
      className="group block cursor-pointer select-none"
      style={{ width: W, maxWidth: W, minWidth: W }}
      onClick={onCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goCreate();
        }
      }}
      aria-label={`Create ${title}`}
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
            className="transition-transform duration-200 ease-out group-hover:scale-[1.03]"
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
          <div className="pointer-events-none absolute left-2 top-2 z-10">
            <div className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-neutral-900 backdrop-blur">
              $12
            </div>
          </div>

          {/* Top-right: badge + star */}
          <div className="absolute right-2 top-2 z-20 flex items-center gap-1">
            {badge ? (
              <div className="pointer-events-none">
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

            <button
              type="button"
              onClick={toggleFavorite}
              className={[
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
          </div>

          {/* Slim hover overlay: duration + Preview + Create */}
          <div className="pointer-events-none absolute inset-0 z-30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute inset-x-0 bottom-2 px-2">
              <div className="rounded-xl bg-white/95 p-2 shadow-sm backdrop-blur">
                <div className="text-[10px] font-semibold text-neutral-700">
                  ⚡ {setupMins ?? 3} min
                </div>

                <div className="mt-1.5 flex gap-1.5 pointer-events-auto">
                  <button
                    type="button"
                    onClick={handlePreview}
                    className="flex-1 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-[10px] font-semibold text-neutral-900 hover:bg-neutral-50"
                  >
                    Preview
                  </button>

                  <button
                    type="button"
                    onClick={handleCreate}
                    className="flex-1 rounded-lg bg-neutral-900 px-2 py-1 text-[10px] font-semibold text-white hover:bg-neutral-800"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Keep old Create CTA behavior (fine-pointer hover) */}
          <div className="absolute inset-x-0 bottom-2 z-10 flex justify-center px-2">
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
    </div>
  );
}