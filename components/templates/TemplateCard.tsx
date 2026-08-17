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

          <div className="absolute bottom-3 right-3 z-20">
            <button
              type="button"
              onClick={handleFavoriteClick}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-lg backdrop-blur shadow-sm transition hover:bg-white"
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

        {/* DESIGN COUNT / PREVIEW */}

        <div
          className="px-3 pt-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="whitespace-nowrap text-[13px] font-semibold text-neutral-600">
              {designCount ?? 1}{" "}
              {(designCount ?? 1) === 1
                ? "design"
                : "designs"}
            </div>

            <button
              type="button"
              onClick={handlePreviewClick}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-neutral-900 transition hover:bg-neutral-50"
            >
              Preview
            </button>
          </div>
        </div>

        {/* TEXT */}

        <div className="px-4 pb-4 pt-3">
          <div
            className="text-[18px] font-semibold tracking-tight text-neutral-900"
            style={{
              lineHeight: "1.3",
              minHeight: "24px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={title}
          >
            {formatLabel(title)}
          </div>

          <div
            className="mt-2 text-[14px] font-medium text-neutral-500"
            style={{
              lineHeight: "1.4",
              minHeight: "20px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={description || ""}
          >
            {description?.trim()
              ? description.trim()
              : " "}
          </div>
        </div>
      </div>
    </div>
  );
}