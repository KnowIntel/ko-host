"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { MouseEvent } from "react";

const W = 140;
const H = 105;

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
  const next = { ...cur, [field]: (cur[field] || 0) + 1, updatedAt: Date.now() };
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

  // Auto-hide the temp resume card even if registry still includes it
  if (templateKey === "resume_portfolio_temp") return null;

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

  function handleCardClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement | null;
    if (target?.closest?.("[data-kht-stop]")) return;
    goCreate();
  }

  function stopAll(e: any) {
    e.preventDefault?.();
    e.stopPropagation?.();
  }

  function toggleFavorite(e: MouseEvent) {
    stopAll(e);
    onToggleFavorite?.(templateKey);
  }

  function handlePreview(e: MouseEvent) {
    stopAll(e);
    trackPreview();
    onPreview?.(templateKey);
  }

  // Ensure keyboard behavior stays consistent
  useEffect(() => {
    // no-op; kept for future tracking hooks if needed
  }, []);

  return (
    <div
      className="group block cursor-pointer select-none"
      style={{ width: W, maxWidth: W, minWidth: W }}
      onClick={handleCardClick}
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

          {/* overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-70" />

          {/* Price pill */}
          <div className="pointer-events-none absolute left-2 top-2 z-10">
            <div className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-neutral-900 backdrop-blur">
              $12
            </div>
          </div>

          {/* Badge + Star */}
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
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              title={isFavorite ? "Favorited" : "Favorite"}
              data-kht-stop
            >
              <span className={isFavorite ? "text-amber-500" : "text-neutral-400"}>★</span>
            </button>
          </div>
        </div>

        {/* Actions row (Preview + duration label on one line) */}
        <div className="px-2 pt-2" data-kht-stop onClickCapture={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-semibold text-neutral-600 whitespace-nowrap">
              ⚡ {setupMins ?? 3} min
            </div>

            <button
              type="button"
              onClick={handlePreview}
              className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-[10px] font-semibold text-neutral-900 hover:bg-neutral-50"
              data-kht-stop
            >
              Preview
            </button>
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
      </div>
    </div>
  );
}