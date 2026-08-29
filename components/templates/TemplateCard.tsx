"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";

const MOBILE_W = 140;
const MOBILE_H = 105;

const DESKTOP_W = 210;
const DESKTOP_H = 158;

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

    return Array.isArray(parsed)
      ? parsed.filter((x) => typeof x === "string")
      : [];
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

  const next = [
    templateKey,
    ...prev.filter((k) => k !== templateKey),
  ].slice(0, 12);

  writeStringArray(key, next);
  notify("kht:recent");
}

type StatsMap = Record<
  string,
  {
    views: number;
    creates: number;
    updatedAt: number;
  }
>;

function readStats(): StatsMap {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem("kht:stats");
    const parsed = raw ? JSON.parse(raw) : {};

    return parsed && typeof parsed === "object"
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function writeStats(stats: StatsMap) {
  try {
    window.localStorage.setItem(
      "kht:stats",
      JSON.stringify(stats),
    );
  } catch {}
}

function bumpStat(
  templateKey: string,
  field: "views" | "creates",
) {
  const stats = readStats();

  const cur = stats[templateKey] || {
    views: 0,
    creates: 0,
    updatedAt: Date.now(),
  };

  stats[templateKey] = {
    ...cur,
    [field]: (cur[field] || 0) + 1,
    updatedAt: Date.now(),
  };

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
  designCount?: number;
}) {
  const router = useRouter();

  const [isDesktop, setIsDesktop] = useState(false);

useEffect(() => {
  function updateSize() {
    setIsDesktop(window.innerWidth >= 1024);
  }

  updateSize();

  window.addEventListener("resize", updateSize);

  return () => {
    window.removeEventListener("resize", updateSize);
  };
}, []);

const W = isDesktop ? DESKTOP_W : MOBILE_W;
const H = isDesktop ? DESKTOP_H : MOBILE_H;

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
    designCount,
  } = props;

  const src =
    thumbnailUrl || "/templates/placeholder.webp";

  function trackCreate() {
    markRecentlyViewed(templateKey);
    bumpStat(templateKey, "creates");
  }

  function trackPreview() {
    markRecentlyViewed(templateKey);
    bumpStat(templateKey, "views");
  }

  function goToDesignSelection() {
    trackCreate();

    if (templateKey === "custom_template") {
      router.push(
        `/create/${encodeURIComponent(templateKey)}`,
      );
      return;
    }

    router.push(
      `/create/${encodeURIComponent(
        templateKey,
      )}/design`,
    );
  }

  function stopAll(
    e: MouseEvent<HTMLElement> |
      KeyboardEvent<HTMLElement>,
  ) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleFavoriteClick(
    e: MouseEvent<HTMLButtonElement>,
  ) {
    stopAll(e);
    onToggleFavorite?.(templateKey);
  }

  function handlePreviewClick(
    e: MouseEvent<HTMLButtonElement>,
  ) {
    stopAll(e);
    trackPreview();
    onPreview?.(templateKey);
  }

  function handleCardKeyDown(
    e: KeyboardEvent<HTMLDivElement>,
  ) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goToDesignSelection();
    }
  }

  return (
    <div
      className="group block cursor-pointer select-none"
      style={{
        width: W,
        maxWidth: W,
        minWidth: W,
        contentVisibility: "auto",
        containIntrinsicSize: "270px 330px",
      }}
      onClick={goToDesignSelection}
      role="button"
      tabIndex={0}
      onKeyDown={handleCardKeyDown}
      aria-label={`Choose ${title}`}
    >
      <div
        className={[
          "relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm",
          "transition-all duration-200 ease-out transform-gpu",
          "group-hover:-translate-y-[5px] group-hover:shadow-xl",
        ].join(" ")}
        style={{
          width: W,
          maxWidth: W,
          minWidth: W,
        }}
      >
        {/* THUMBNAIL */}

        <div
          className="relative bg-neutral-100"
          style={{
            width: W,
            height: H,
            overflow: "hidden",
          }}
        >
          <img
            src={src}
            alt={title}
            draggable={false}
            loading="lazy"
            decoding="async"
            style={{
              pointerEvents: "none",
              width: W,
              height: H,
              objectFit: "cover",
              userSelect: "none",
              display: "block",
            }}
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-70" />

          {/* BADGE */}

          <div className="absolute right-3 top-3 z-20">
            {badge ? (
              <div
                className={[
                  "rounded-full px-3 py-1.5 text-[13px] font-semibold text-white backdrop-blur",
                  badge === "Popular"
                    ? "bg-neutral-900/90"
                    : "bg-emerald-600/90",
                ].join(" ")}
              >
                {badge}
              </div>
            ) : null}
          </div>

          {/* FAVORITE */}

          <div className="absolute bottom-2.5 right-2.5 z-20">
            <button
              type="button"
              onClick={handleFavoriteClick}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/90 text-sm backdrop-blur shadow-sm transition hover:scale-105 hover:bg-white"
              aria-label={
                isFavorite
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
              title={
                isFavorite
                  ? "Favorited"
                  : "Favorite"
              }
            >
              <span
                className={
                  isFavorite
                    ? "text-amber-500"
                    : "text-neutral-400"
                }
              >
                ★
              </span>
            </button>
          </div>
        </div>

{/* CARD CONTENT */}

<div className="px-4 pb-3.5 pt-3">
  <div className="flex items-start justify-between gap-3">
    <div className="min-w-0">
      <div
        className="truncate text-[13px] font-bold tracking-tight text-neutral-950 lg:text-[18px]"
        title={title}
      >
        {formatLabel(title)}
      </div>

      <div className="mt-1 text-[10px] font-semibold text-neutral-400 lg:text-[12px]">
        {designCount ?? 1}{" "}
        {(designCount ?? 1) === 1
          ? "design"
          : "designs"}
      </div>
    </div>
  </div>

  <div
    className="mt-1.5 text-[10px] font-medium leading-4 text-neutral-500 lg:text-[12px] lg:leading-[1.45]"
    style={{
      minHeight: isDesktop ? "40px" : "32px",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    }}
    title={description || ""}
  >
    {description?.trim()
      ? description.trim()
      : "Choose a design and make it your own."}
  </div>

{templateKey !== "custom_template" ? (
  <button
    type="button"
    onClick={handlePreviewClick}
    className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-[10px] font-bold text-neutral-900 transition hover:border-neutral-300 hover:bg-white hover:shadow-sm lg:text-[12px]"
  >
    View Designs
    <span aria-hidden="true">→</span>
  </button>
) : null}
</div>
      </div>
    </div>
  );
}