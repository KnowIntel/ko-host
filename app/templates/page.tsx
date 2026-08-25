// app\templates\page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import TemplateGrid, {
  type Category,
  type Sort,
} from "@/components/templates/TemplateGrid";
import AppModal from "@/components/ui/AppModal";

type RecentSiteCard = {
  id: string;
  slug: string;
  title: string;
  previewImageUrl?: string | null;
  templateKey?: string | null;
};

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [sort, setSort] = useState<Sort>("Recommended");
  const [count, setCount] = useState<number>(0);
  const [recentSites, setRecentSites] = useState<RecentSiteCard[]>([]);
  const [recentSitesLoading, setRecentSitesLoading] = useState(true);
  const [recentSitesTrack, setRecentSitesTrack] = useState(0);
  const [showWhyKoHost, setShowWhyKoHost] = useState(false);


const RECENT_SITES_VISIBLE_COUNT = 8;
const RECENT_SITES_MOBILE_COLUMNS = 4;
const RECENT_SITES_TABLET_COLUMNS = 6;

  useEffect(() => {
    setSearchQuery("");
    setCategory("All");
    setSort("Recommended");
  }, []);

  useEffect(() => {
  let cancelled = false;

  async function loadRecentSites() {
    try {
      setRecentSitesLoading(true);

      const res = await fetch("/api/public/recent-sites", {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (!cancelled) {
          setRecentSites([]);
        }
        return;
      }

      if (!cancelled) {
        setRecentSites(Array.isArray(data?.sites) ? data.sites : []);
        setRecentSitesTrack(0);
      }
    } catch {
      if (!cancelled) {
        setRecentSites([]);
      }
    } finally {
      if (!cancelled) {
        setRecentSitesLoading(false);
      }
    }
  }

  void loadRecentSites();

  return () => {
    cancelled = true;
  };
}, []);

useEffect(() => {
  if (recentSites.length <= RECENT_SITES_VISIBLE_COUNT) return;

  const timer = window.setInterval(() => {
    setRecentSitesTrack((prev) => {
      const next = prev + 1;
      return next >= recentSites.length ? 0 : next;
    });
  }, 2800);

  return () => window.clearInterval(timer);
}, [recentSites]);

  const categories: Category[] = useMemo(
    () => [
    "All",
    "Favorites",
    "Recently viewed",
    "Events",
    "Entertainment",
    "Business",
    "Real Estate",
    "Personal",
    "Career",
    ],
    [],
  );

  const sorts: Sort[] = useMemo(
    () => ["Recommended", "A–Z", "New", "Popular"],
    [],
  );

  const hasFilters =
    category !== "All" || sort !== "Recommended" || !!searchQuery.trim();

const visibleRecentSites = useMemo(() => {
  if (!recentSites.length) return [];

  if (recentSites.length <= RECENT_SITES_VISIBLE_COUNT) {
    return recentSites;
  }

  const doubled = [...recentSites, ...recentSites];
  return doubled.slice(
    recentSitesTrack,
    recentSitesTrack + RECENT_SITES_VISIBLE_COUNT,
  );
}, [recentSites, recentSitesTrack]);

  function clearAll() {
    setSearchQuery("");
    setCategory("All");
    setSort("Recommended");
  }

function scrollToTemplates() {
  const target = document.getElementById("template-results");

  if (!target) return;

  let scrollParent: HTMLElement | null = target.parentElement;

  while (scrollParent) {
    const styles = window.getComputedStyle(scrollParent);

    const overflowY = styles.overflowY;

    const canScroll =
      (overflowY === "auto" ||
        overflowY === "scroll" ||
        overflowY === "overlay") &&
      scrollParent.scrollHeight > scrollParent.clientHeight;

    if (canScroll) {
      break;
    }

    scrollParent = scrollParent.parentElement;
  }

  const isDesktop = window.innerWidth >= 1536;

  // How much of the section above the templates we want visible.
  const offset = isDesktop ? 190 : 40;

  if (scrollParent) {
    const parentRect = scrollParent.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const top =
      scrollParent.scrollTop +
      targetRect.top -
      parentRect.top -
      offset;

    scrollParent.scrollTo({
      top,
      behavior: "smooth",
    });

    return;
  }

  // Fallback for pages using the browser window itself.
  const top =
    target.getBoundingClientRect().top +
    window.scrollY -
    offset;

  window.scrollTo({
    top,
    behavior: "smooth",
  });
}

  function Chip(props: { label: string; onRemove: () => void }) {
    return (
      <button
        type="button"
        onClick={props.onRemove}
        className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-neutral-800 shadow-sm hover:bg-neutral-50"
        title="Remove"
      >
        <span className="max-w-[220px] truncate">{props.label}</span>
        <span className="text-neutral-500">×</span>
      </button>
    );
  }

  return (
    <div className="relative min-h-screen bg-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl animate-kht-float" />
        <div className="absolute -bottom-24 left-10 h-[460px] w-[460px] rounded-full bg-emerald-500/10 blur-3xl animate-kht-float2" />
        <div className="absolute top-40 right-10 h-[420px] w-[420px] rounded-full bg-purple-500/10 blur-3xl animate-kht-float3" />
      </div>

      <div className="relative w-full px-4 pb-10">
<div className="relative mt-16 2xl:mt-0 2xl:sticky 2xl:top-[56px] 2xl:z-40 -mx-4 border-b border-neutral-200 bg-white/95 px-4 pb-4 pt-6 shadow-sm backdrop-blur">
{/* Mobile / tablet */}
<div className="2xl:hidden">
  {/* HERO */}
  <div className="min-w-0">
    <div className="rounded-[26px] bg-white">
      <h1 className="text-[34px] font-extrabold leading-[1] tracking-[-0.04em] text-slate-950 sm:text-[42px] md:text-[48px]">
        Create a site for anything.
        <span className="mt-1 block bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Go live in minutes.
        </span>
      </h1>

      <p className="mt-4 max-w-[720px] text-[14px] leading-6 text-neutral-600 sm:text-[15px]">
        Build a beautiful, shareable microsite for your event, business,
        announcement, profile, product, or anything else.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <a
          href="/get-started"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          Create Your Site
          <span aria-hidden="true">→</span>
        </a>

<button
  type="button"
  onClick={scrollToTemplates}
  className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-bold text-neutral-900 shadow-sm"
>
  Browse Templates
</button>
      </div>

      {/* BENEFITS */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-white text-[11px] font-black text-blue-600">
              $
            </div>

            <div className="min-w-0">
              <div className="text-[11px] font-bold leading-4 text-neutral-950">
                $12 for 90 days
              </div>
              <div className="mt-0.5 text-[9px] leading-4 text-neutral-500">
                One simple price
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-indigo-100 bg-white text-[11px] font-black text-indigo-600">
              ↻
            </div>

            <div className="min-w-0">
              <div className="text-[11px] font-bold leading-4 text-neutral-950">
                No subscription
              </div>
              <div className="mt-0.5 text-[9px] leading-4 text-neutral-500">
                No monthly bill
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-white text-[11px] font-black text-emerald-600">
              ✓
            </div>

            <div className="min-w-0">
              <div className="text-[11px] font-bold leading-4 text-neutral-950">
                No coding
              </div>
              <div className="mt-0.5 text-[9px] leading-4 text-neutral-500">
                Easy to create
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-purple-100 bg-purple-50/60 px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-purple-100 bg-white text-[11px] font-black text-purple-600">
              ◇
            </div>

            <div className="min-w-0">
              <div className="text-[11px] font-bold leading-4 text-neutral-950">
                Your brand
              </div>
              <div className="mt-0.5 text-[9px] leading-4 text-neutral-500">
                Make it yours
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* HOW IT WORKS */}
  <div className="mt-6 rounded-[22px] border border-neutral-200 bg-white px-4 py-5 shadow-sm sm:px-5">
    <div className="text-center">
      <div className="text-sm font-bold text-neutral-950">
        Three simple steps to get your site live
      </div>

      <div className="mx-auto mt-2 h-0.5 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
    </div>

    <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
      <div className="relative text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 border-blue-100 bg-blue-600 text-white shadow-sm sm:h-16 sm:w-16">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-6 w-6 sm:h-7 sm:w-7"
            aria-hidden="true"
          >
            <rect x="4" y="4" width="16" height="16" rx="2.5" />
            <path d="M8 8h8M8 12h5M8 16h3" />
            <path d="M15.5 13.5 19 17l-2 2-3.5-3.5v-2z" />
          </svg>
        </div>

        <div className="mx-auto -mt-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[9px] font-black text-white ring-2 ring-white">
          1
        </div>

        <div className="mt-2 text-[11px] font-bold leading-4 text-neutral-950 sm:text-xs">
          Pick a design
        </div>

        <div className="mx-auto mt-1 hidden max-w-[150px] text-[10px] leading-4 text-neutral-500 sm:block">
          Choose a professionally designed template.
        </div>
      </div>

      <div className="relative text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 border-emerald-100 bg-emerald-500 text-white shadow-sm sm:h-16 sm:w-16">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-6 w-6 sm:h-7 sm:w-7"
            aria-hidden="true"
          >
            <path d="M4 20h4l11-11a2.1 2.1 0 0 0-3-3L5 17v3z" />
            <path d="m14.5 7.5 2 2" />
          </svg>
        </div>

        <div className="mx-auto -mt-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-white ring-2 ring-white">
          2
        </div>

        <div className="mt-2 text-[11px] font-bold leading-4 text-neutral-950 sm:text-xs">
          Add your content
        </div>

        <div className="mx-auto mt-1 hidden max-w-[150px] text-[10px] leading-4 text-neutral-500 sm:block">
          Add your text, photos, and details.
        </div>
      </div>

      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 border-purple-100 bg-purple-600 text-white shadow-sm sm:h-16 sm:w-16">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-6 w-6 sm:h-7 sm:w-7"
            aria-hidden="true"
          >
            <path d="M21 3 10 14" />
            <path d="m21 3-7 18-4-7-7-4 18-7z" />
          </svg>
        </div>

        <div className="mx-auto -mt-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-[9px] font-black text-white ring-2 ring-white">
          3
        </div>

        <div className="mt-2 text-[11px] font-bold leading-4 text-neutral-950 sm:text-xs">
          Publish & share
        </div>

        <div className="mx-auto mt-1 hidden max-w-[150px] text-[10px] leading-4 text-neutral-500 sm:block">
          Go live and share your link anywhere.
        </div>
      </div>
    </div>

    <div className="mx-auto mt-4 flex w-fit flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-purple-100 bg-purple-50/60 px-3 py-2 text-[9px] font-semibold text-neutral-600 sm:text-[10px]">
      <span className="inline-flex items-center gap-1">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-3 w-3"
          aria-hidden="true"
        >
          <rect x="7" y="2.5" width="10" height="19" rx="2" />
          <path d="M10 18.5h4" />
        </svg>
        Mobile friendly
      </span>

      <span className="text-purple-300">•</span>
      <span>Edit anytime</span>
      <span className="text-purple-300">•</span>
      <span>Share anywhere</span>
    </div>
  </div>

  {/* MADE WITH KO-HOST */}
  <div className="mt-5 min-w-0">
    <div className="rounded-[22px] border border-neutral-200 bg-white/90 px-3 pb-3 pt-4 shadow-sm sm:px-4">
      <div className="mb-2">
        <div className="text-[15px] font-bold tracking-tight text-neutral-950">
          Made with Ko-Host
        </div>

        <div className="mt-0.5 text-[12px] text-neutral-500">
          See what people are creating.
        </div>
      </div>

      {recentSitesLoading ? (
        <div className="mt-4 grid w-full grid-cols-2 gap-2 min-[480px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 md:gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50"
            >
              <div className="aspect-[4/3] animate-pulse bg-neutral-200" />
              <div className="space-y-2 p-2">
                <div className="h-3 rounded bg-neutral-200" />
                <div className="h-3 w-2/3 rounded bg-neutral-100" />
              </div>
            </div>
          ))}
        </div>
      ) : recentSites.length ? (
        <>
          <div className="mt-4 grid w-full grid-cols-2 gap-2 min-[480px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 md:gap-3">
            {visibleRecentSites.slice(0, 6).map((site, index) => (
              <a
                key={`${site.id}-${index}`}
                href={`https://${site.slug}.ko-host.com`}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                title={site.title || site.slug}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                  <img
                    src={
                      typeof site.previewImageUrl === "string" &&
                      site.previewImageUrl.trim().length > 0
                        ? site.previewImageUrl
                        : "/icons/icon_recent_site_placeholder.webp"
                    }
                    alt={site.title || site.slug}
                    className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"
                    onError={(e) => {
                      const target = e.currentTarget;

                      if (
                        !target.src.includes(
                          "icon_recent_site_placeholder.webp",
                        )
                      ) {
                        target.src =
                          "/icons/icon_recent_site_placeholder.webp";
                      }
                    }}
                  />
                </div>

                <div className="p-2">
                  <div className="truncate text-[11px] font-semibold text-neutral-900 sm:text-xs">
                    {site.title || "Untitled Site"}
                  </div>

                  <div className="truncate text-[9px] text-neutral-500 sm:text-[10px]">
                    {site.slug}.ko-host.com
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-2 text-left text-[10px] text-neutral-400">
            Featured sites are shared with permission from their owners.
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-3 py-6 text-sm text-neutral-500">
          Featured Ko-Host sites will appear here.
        </div>
      )}
    </div>
  </div>

  {/* LIMITED-TIME HELP OFFER */}
  <div className="mt-4 rounded-[22px] border border-purple-100 bg-gradient-to-r from-purple-50 via-white to-blue-50 px-4 py-4 shadow-sm">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-lg">
          🎁
        </div>

        <div className="min-w-0">
          <div className="text-sm font-bold text-neutral-950">
            Need help creating your site?
          </div>

          <div className="mt-1 text-xs leading-5 text-neutral-600">
            We’ll help build it for you with free custom development included
            with your microsite purchase.
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <a
          href="/claim-offer"
          className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-[11px] font-bold text-neutral-900 shadow-sm transition hover:bg-neutral-50"
        >
          Learn More
        </a>

        <div className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-amber-700">
          Limited Time
        </div>
      </div>
    </div>
  </div>

  {/* TEMPLATE MARKETPLACE */}
<div
  id="templates-mobile"
  className="mt-6 rounded-[25px] border border-neutral-200 bg-white/95 px-4 pb-4 pt-5 shadow-sm sm:px-5"
>
    <div className="text-center">
      <h2 className="text-2xl font-bold tracking-tight text-neutral-950 sm:text-[28px]">
        What will you create?
      </h2>

      <p className="mt-1 text-[12px] text-neutral-500 sm:text-[13px]">
        Choose a template to get started. Every design is customizable.
      </p>

      <div className="mt-2 text-[10px] font-medium text-neutral-400 sm:text-[11px]">
        {count} template{count === 1 ? "" : "s"}
        {category !== "All" ? ` • ${category}` : ""}
        {searchQuery.trim() ? ` • “${searchQuery.trim()}”` : ""}
        {sort !== "Recommended" ? ` • ${sort}` : ""}
      </div>
    </div>

    <div className="mt-4">
      <div className="relative w-full">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search templates…"
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 pr-10 text-sm text-neutral-900 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/40"
        />

        {searchQuery.trim() ? (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100"
            aria-label="Clear search"
            title="Clear"
          >
            ×
          </button>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {categories.map((c) => {
          const active = c === category;

          const label =
            c === "Favorites"
              ? "★ Favorites"
              : c === "Recently viewed"
                ? "⏱ Recently viewed"
                : c;

          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={[
                "rounded-full px-3 py-1.5 text-[11px] font-semibold transition sm:text-[12px]",
                active
                  ? "bg-neutral-900 text-white"
                  : "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <div className="text-[11px] font-semibold text-neutral-600">
          Sort by:
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          {sorts.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>

    {/* TRUST STRIP */}
    <div className="mt-4 border-t border-neutral-100 pt-4">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[9px] font-semibold text-neutral-500 sm:text-[10px]">
        <span className="inline-flex items-center gap-1">
          <span className="text-emerald-500">✓</span>
          Secure checkout
        </span>

        <span className="inline-flex items-center gap-1">
          <span className="text-blue-500">✓</span>
          Mobile friendly
        </span>

        <span className="inline-flex items-center gap-1">
          <span className="text-purple-500">✓</span>
          Edit anytime
        </span>

        <span className="inline-flex items-center gap-1">
          <span className="text-indigo-500">✓</span>
          Share anywhere
        </span>

        <span className="inline-flex items-center gap-1">
          <span className="text-amber-500">✓</span>
          No subscription
        </span>
      </div>
    </div>
  </div>
</div>

{/* Desktop */}
<div className="hidden gap-5 xl:grid xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.9fr)_760px] xl:items-start">
<div className="min-w-0">
<div className="mb-5 rounded-[28px] bg-white px-1 py-1">
  <div className="max-w-[760px]">
    <h1 className="text-[42px] font-extrabold leading-[0.98] tracking-[-0.04em] text-slate-950 2xl:text-[46px]">
      Create a site for anything.
      <span className="mt-1 block bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
        Go live in minutes.
      </span>
    </h1>

    <p className="mt-4 max-w-[650px] text-[15px] leading-6 text-neutral-600">
      Build a beautiful, shareable microsite for your event, business,
      announcement, profile, product, or anything else.
    </p>

    <div className="mt-5 flex flex-wrap items-center gap-3">
      <a
        href="/get-started"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        Create Your Site
        <span aria-hidden="true">→</span>
      </a>

<button
  type="button"
  onClick={scrollToTemplates}
  className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-bold text-neutral-900 shadow-sm transition hover:bg-neutral-50"
>
  Browse Templates
</button>
    </div>

<div className="mt-5 grid max-w-[760px] grid-cols-2 gap-x-5 gap-y-4 xl:grid-cols-4">
  <div className="flex items-start gap-2.5">
    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-[13px] font-black text-blue-600">
      $
    </div>

    <div className="min-w-0">
      <div className="text-[12px] font-bold leading-4 text-neutral-950">
        $12 for 90 days
      </div>
      <div className="mt-0.5 text-[10px] leading-4 text-neutral-500">
        One simple price
      </div>
    </div>
  </div>

  <div className="flex items-start gap-2.5">
    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 text-[13px] font-black text-indigo-600">
      ↻
    </div>

    <div className="min-w-0">
      <div className="text-[12px] font-bold leading-4 text-neutral-950">
        No subscription
      </div>
      <div className="mt-0.5 text-[10px] leading-4 text-neutral-500">
        Pay once. No monthly bill.
      </div>
    </div>
  </div>

  <div className="flex items-start gap-2.5">
    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-[13px] font-black text-emerald-600">
      ✓
    </div>

    <div className="min-w-0">
      <div className="text-[12px] font-bold leading-4 text-neutral-950">
        No coding required
      </div>
      <div className="mt-0.5 text-[10px] leading-4 text-neutral-500">
        Easy to create and edit
      </div>
    </div>
  </div>

  <div className="flex items-start gap-2.5">
    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-green-100 bg-green-50 text-[13px] font-black text-green-600">
      ◇
    </div>

    <div className="min-w-0">
      <div className="text-[12px] font-bold leading-4 text-neutral-950">
        Your domain. Your brand.
      </div>
      <div className="mt-0.5 text-[10px] leading-4 text-neutral-500">
        Make it feel like yours
      </div>
    </div>
  </div>
</div>
  </div>
</div>

    </div>

    <div className="min-w-0 pt-4">
  <div className="px-2 py-2">
    <div className="text-center">
      <div className="text-sm font-bold text-neutral-950">
        Three simple steps to get your site live
      </div>

      <div className="mx-auto mt-2 h-0.5 w-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
    </div>

    <div className="mt-7 grid grid-cols-3 gap-3">
      <div className="relative text-center">
<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-[5px] border-blue-100 bg-blue-600 text-white shadow-sm">
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-9 w-9"
    aria-hidden="true"
  >
    <rect x="4" y="4" width="16" height="16" rx="2.5" />
    <path d="M8 8h8M8 12h5M8 16h3" />
    <path d="M15.5 13.5 19 17l-2 2-3.5-3.5v-2z" />
  </svg>
</div>

        <div className="mx-auto -mt-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white ring-2 ring-white">
          1
        </div>

        <div className="mt-3 text-sm font-bold text-neutral-950">
          Pick a design
        </div>

        <div className="mx-auto mt-1 max-w-[150px] text-[11px] leading-4 text-neutral-500">
          Choose from professionally designed templates.
        </div>

        <div
          aria-hidden="true"
          className="absolute left-[78%] top-10 w-[48%] border-t-2 border-dashed border-blue-200"
        />
      </div>

      <div className="relative text-center">
<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-[5px] border-emerald-100 bg-emerald-500 text-white shadow-sm">
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-9 w-9"
    aria-hidden="true"
  >
    <path d="M4 20h4l11-11a2.1 2.1 0 0 0-3-3L5 17v3z" />
    <path d="m14.5 7.5 2 2" />
  </svg>
</div>

        <div className="mx-auto -mt-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white ring-2 ring-white">
          2
        </div>

        <div className="mt-3 text-sm font-bold text-neutral-950">
          Add your content
        </div>

        <div className="mx-auto mt-1 max-w-[150px] text-[11px] leading-4 text-neutral-500">
          Customize it with your text, photos, and details.
        </div>

        <div
          aria-hidden="true"
          className="absolute left-[78%] top-10 w-[48%] border-t-2 border-dashed border-purple-200"
        />
      </div>

      <div className="text-center">
<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-[5px] border-purple-100 bg-purple-600 text-white shadow-sm">
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-9 w-9"
    aria-hidden="true"
  >
    <path d="M21 3 10 14" />
    <path d="m21 3-7 18-4-7-7-4 18-7z" />
  </svg>
</div>

        <div className="mx-auto -mt-2 flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-[10px] font-black text-white ring-2 ring-white">
          3
        </div>

        <div className="mt-3 text-sm font-bold text-neutral-950">
          Publish & share
        </div>

        <div className="mx-auto mt-1 max-w-[150px] text-[11px] leading-4 text-neutral-500">
          Go live and share your link anywhere, instantly.
        </div>
      </div>
    </div>

    <div className="mx-auto mt-7 flex w-fit flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-purple-100 bg-purple-50/60 px-4 py-2 text-[10px] font-semibold text-neutral-600">
      <span className="inline-flex items-center gap-1.5">
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-3.5 w-3.5"
    aria-hidden="true"
  >
    <rect x="7" y="2.5" width="10" height="19" rx="2" />
    <path d="M10 18.5h4" />
  </svg>
  Mobile friendly
</span>
      <span className="text-purple-300">•</span>
      <span>Edit anytime</span>
      <span className="text-purple-300">•</span>
      <span>Share anywhere</span>
    </div>
  </div>
</div>

    <div className="min-w-0">
      <div className="rounded-2xl border border-neutral-200 bg-white/90 px-2 pb-1 pt-3 shadow-sm min-h-[201px] sm:px-3">
<div className="mb-2 flex items-start justify-between gap-3">
  <div>
    <div className="text-[15px] font-bold tracking-tight text-neutral-950">
      Made with Ko-Host
    </div>

    <div className="mt-0.5 text-[12px] text-neutral-500">
      See what people are creating.
    </div>
  </div>
</div>

        {recentSitesLoading ? (
          <div className="mt-6 grid w-full grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 md:gap-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50"
              >
                <div className="aspect-[4/3] animate-pulse bg-neutral-200" />
                <div className="space-y-2 p-2">
                  <div className="h-3 rounded bg-neutral-200" />
                  <div className="h-3 w-2/3 rounded bg-neutral-100" />
                </div>
              </div>
            ))}
          </div>
        ) : recentSites.length ? (
          <>
            <div className="mt-4 grid w-full grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 md:gap-3">
              {visibleRecentSites.map((site, index) => (
                <a
                  key={`${site.id}-${index}`}
                  href={`https://${site.slug}.ko-host.com`}
                  target="_blank"
                  rel="noreferrer"
                  className="min-w-0 overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                  title={site.title || site.slug}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                    <img
                      src={
                        typeof site.previewImageUrl === "string" &&
                        site.previewImageUrl.trim().length > 0
                          ? site.previewImageUrl
                          : "/icons/icon_recent_site_placeholder.webp"
                      }
                      alt={site.title || site.slug}
                      className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes("icon_recent_site_placeholder.webp")) {
                          target.src = "/icons/icon_recent_site_placeholder.webp";
                        }
                      }}
                    />
                  </div>

                  <div className="p-2">
                    <div className="truncate text-xs font-semibold text-neutral-900">
                      {site.title || "Untitled Site"}
                    </div>
                    <div className="truncate text-[11px] text-neutral-500">
                      {site.slug}.ko-host.com
                    </div>
                  </div>
                </a>
              ))}
            </div>

<div className="mt-2 text-left text-[10px] text-neutral-400">
  Featured sites are shared with permission from their owners.
</div>

{showWhyKoHost && typeof document !== "undefined"
  ? createPortal(
      <div className="fixed inset-0 z-[2147483647] isolate overflow-y-auto bg-black/65 backdrop-blur-sm">
        <div className="flex min-h-full items-center justify-center px-4 py-8 md:px-8">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-[30px] border border-neutral-200 bg-white shadow-2xl">
            {/* CLOSE */}
            <button
              type="button"
              onClick={() => setShowWhyKoHost(false)}
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-lg font-medium text-neutral-500 shadow-sm transition hover:bg-neutral-50 hover:text-neutral-900"
              aria-label="Close"
              title="Close"
            >
              ×
            </button>

            {/* HERO */}
            <div className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-br from-slate-950 via-neutral-900 to-indigo-950 px-6 py-9 text-white sm:px-8 md:px-10 md:py-11">
              <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

              <div className="relative max-w-3xl">
                <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200">
                  Why Ko-Host?
                </div>

                <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                  More than a post.
                  <span className="block bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                    Less than a whole website.
                  </span>
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-300 sm:text-[15px]">
                  Ko-Host gives you one focused, beautiful place to share the
                  things that need more room than social media — without the
                  setup, expense, or long-term commitment of a traditional
                  website.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    "No coding",
                    "$12 for 90 days",
                    "Hosting included",
                    "Mobile friendly",
                    "Edit anytime",
                    "Share anywhere",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="grid gap-6 px-5 py-6 sm:px-7 sm:py-7 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
              {/* LEFT */}
              <div className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-5 sm:p-6">
                <div className="text-lg font-bold text-neutral-950">
                  When Ko-Host makes sense
                </div>

                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  Use Ko-Host when you need a polished, shareable destination
                  for one specific moment, idea, event, announcement, or
                  experience.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    "Events",
                    "Announcements",
                    "Businesses",
                    "Products",
                    "Campaigns",
                    "Fundraisers",
                    "Profiles",
                    "Communities",
                    "Personal moments",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-center text-[11px] font-semibold text-neutral-700"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="text-sm font-bold text-neutral-950">
                    One site. One purpose.
                  </div>

                  <div className="mt-1 text-xs leading-5 text-neutral-600">
                    You don’t need to build a multi-page website just to give
                    people one organized place to learn, respond, register,
                    shop, view, or share.
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div>
                <div className="text-lg font-bold text-neutral-950">
                  Where Ko-Host fits
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {/* SOCIAL */}
                  <div className="rounded-[22px] border border-neutral-200 bg-white p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-lg text-neutral-700">
                      #
                    </div>

                    <div className="mt-3 text-sm font-bold text-neutral-950">
                      Social Post
                    </div>

                    <div className="mt-2 text-xs leading-5 text-neutral-500">
                      Fast and familiar, but limited when you have more to
                      explain, organize, or show.
                    </div>

                    <div className="mt-4 text-[9px] font-bold uppercase tracking-[0.12em] text-neutral-400">
                      Best for quick updates
                    </div>
                  </div>

                  {/* KO-HOST */}
                  <div className="rounded-[22px] border-2 border-blue-200 bg-gradient-to-b from-blue-50/60 to-white p-4 shadow-sm">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-black text-white">
                      K
                    </div>

                    <div className="mt-3 text-sm font-bold text-neutral-950">
                      Ko-Host
                    </div>

                    <div className="mt-2 text-xs leading-5 text-neutral-600">
                      One focused site with your content, design, tools, and
                      information all in one shareable place.
                    </div>

                    <div className="mt-4 text-[9px] font-bold uppercase tracking-[0.12em] text-blue-600">
                      Built for the moment
                    </div>
                  </div>

                  {/* WEBSITE */}
                  <div className="rounded-[22px] border border-neutral-200 bg-white p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-lg text-neutral-700">
                      ◫
                    </div>

                    <div className="mt-3 text-sm font-bold text-neutral-950">
                      Full Website
                    </div>

                    <div className="mt-2 text-xs leading-5 text-neutral-500">
                      Powerful for permanent needs, but often more setup,
                      expense, and commitment than you need.
                    </div>

                    <div className="mt-4 text-[9px] font-bold uppercase tracking-[0.12em] text-neutral-400">
                      Best for long-term presence
                    </div>
                  </div>
                </div>

                {/* SIMPLE ADVANTAGES */}
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {[
                    ["✓", "Quick to launch"],
                    ["✓", "No coding required"],
                    ["✓", "No monthly subscription"],
                    ["✓", "Hosting included"],
                    ["✓", "Interactive tools"],
                    ["✓", "Easy to share"],
                  ].map(([icon, text]) => (
                    <div
                      key={text}
                      className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5"
                    >
                      <span className="text-emerald-500">{icon}</span>
                      <span className="text-[11px] font-semibold text-neutral-700">
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="border-t border-neutral-200 bg-white px-5 py-5 sm:px-7 lg:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-bold text-neutral-950">
                    Ready to make something?
                  </div>

                  <div className="mt-1 text-xs text-neutral-500">
                    Choose a template and make it yours.
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowWhyKoHost(false)}
                    className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-xs font-bold text-neutral-800 transition hover:bg-neutral-50"
                  >
                    Keep Browsing
                  </button>

                  <a
                    href="/get-started"
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:shadow-md"
                  >
                    Create Your Site →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body,
    )
  : null}
  
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-3 py-6 text-sm text-neutral-500">
            Featured Ko-Host sites will appear here.
          </div>
        )}
      </div>

<div className="mt-4 rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 via-white to-blue-50 px-5 py-4 shadow-sm">
  <div className="flex items-center justify-between gap-5">
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-lg">
        🎁
      </div>

      <div className="min-w-0">
        <div className="text-sm font-bold text-neutral-950">
          Need help creating your site?
        </div>

        <div className="mt-1 text-xs leading-5 text-neutral-600">
          We’ll help build it for you with free custom development included
          with your microsite purchase.
        </div>
      </div>
    </div>

    <div className="flex shrink-0 flex-col items-end gap-2">
      <a
        href="/claim-offer"
        className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-bold text-neutral-900 shadow-sm transition hover:bg-neutral-50"
      >
        Learn More
      </a>

      <div className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-amber-700">
        Limited Time
      </div>
    </div>
  </div>
</div>
    </div>
  </div>


        </div>

<div
  id="templates"
  className="mt-9 hidden rounded-[25px] border border-neutral-200 bg-white/95 px-6 pb-5 pt-6 shadow-sm xl:block"
>
  <div className="text-center">
    <h2 className="text-3xl font-bold tracking-tight text-neutral-950">
      What will you create?
    </h2>

    <p className="mt-1 text-sm text-neutral-500">
      Choose a template to get started. Every template is fully customizable.
    </p>

    <div className="mt-2 text-[12px] font-medium text-neutral-400">
      {count} template{count === 1 ? "" : "s"}
      {category !== "All" ? ` • ${category}` : ""}
      {searchQuery.trim() ? ` • “${searchQuery.trim()}”` : ""}
      {sort !== "Recommended" ? ` • ${sort}` : ""}
    </div>
    <div className="mt-4 border-t border-neutral-100 pt-4">
  <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-semibold text-neutral-500">
    <span className="inline-flex items-center gap-1.5">
      <span className="text-emerald-500">✓</span>
      Secure checkout
    </span>

    <span className="inline-flex items-center gap-1.5">
      <span className="text-blue-500">✓</span>
      Mobile friendly
    </span>

    <span className="inline-flex items-center gap-1.5">
      <span className="text-purple-500">✓</span>
      Edit anytime
    </span>

    <span className="inline-flex items-center gap-1.5">
      <span className="text-indigo-500">✓</span>
      Share anywhere
    </span>

    <span className="inline-flex items-center gap-1.5">
      <span className="text-amber-500">✓</span>
      No subscription
    </span>
  </div>
</div>
  </div>

  <div className="mt-5 flex items-center gap-4">
    <div className="relative min-w-0 flex-1">
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search templates… (e.g., wedding, rental, launch)"
        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 pr-10 text-sm text-neutral-900 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/40"
      />

      {searchQuery.trim() ? (
        <button
          type="button"
          onClick={() => setSearchQuery("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100"
          aria-label="Clear search"
          title="Clear"
        >
          ×
        </button>
      ) : null}
    </div>

    <div className="flex shrink-0 items-center gap-2">
      <div className="text-[12px] font-semibold text-neutral-600">
        Sort by:
      </div>

      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as Sort)}
        className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/40"
      >
        {sorts.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  </div>

  <div className="mt-4 flex flex-wrap items-center gap-2">
    {categories.map((c) => {
      const active = c === category;

      const label =
        c === "Favorites"
          ? "★ Favorites"
          : c === "Recently viewed"
            ? "⏱ Recently viewed"
            : c;

      return (
        <button
          key={c}
          type="button"
          onClick={() => setCategory(c)}
          className={[
            "rounded-full px-3 py-1.5 text-[12px] font-semibold transition",
            active
              ? "bg-neutral-900 text-white"
              : "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50",
          ].join(" ")}
        >
          {label}
        </button>
      );
    })}
  </div>
</div>

<div
  id="template-results"
  className="mt-8"
>
  <TemplateGrid
    searchQuery={searchQuery}
    category={category}
    sort={sort}
    onCountChange={setCount}
  />
</div>

        {hasFilters ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {category !== "All" ? (
              <Chip
                label={`Category: ${category}`}
                onRemove={() => setCategory("All")}
              />
            ) : null}

            {sort !== "Recommended" ? (
              <Chip
                label={`Sort: ${sort}`}
                onRemove={() => setSort("Recommended")}
              />
            ) : null}

            {searchQuery.trim() ? (
              <Chip
                label={`Search: “${searchQuery.trim()}”`}
                onRemove={() => setSearchQuery("")}
              />
            ) : null}

            <button
              type="button"
              onClick={clearAll}
              className="ml-auto rounded-full px-3 py-1.5 text-[12px] font-semibold text-neutral-700 hover:bg-neutral-100"
            >
              Clear all
            </button>
          </div>
        ) : null}

{/* WHY KO-HOST POSITIONING */}
<div className="mt-12 overflow-hidden rounded-[30px] border border-neutral-200 bg-white shadow-sm">
  <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
    {/* LEFT */}
    <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-slate-900 px-6 py-8 text-white sm:px-8 sm:py-10">
      <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200">
        Why Ko-Host?
      </div>

      <h2 className="mt-4 max-w-[560px] text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        Too much for a post.
        <span className="block bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
          Not enough for a whole website.
        </span>
      </h2>

      <p className="mt-4 max-w-[560px] text-sm leading-7 text-neutral-300 sm:text-[15px]">
        Sometimes you need more room than social media gives you, without the
        cost, setup, or commitment of building a traditional website.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setShowWhyKoHost(true)}
          className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-neutral-950 transition hover:bg-neutral-100"
        >
          Why Ko-Host?
        </button>

        <a
          href="/get-started"
          className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/10"
        >
          Create Your Site →
        </a>
      </div>
    </div>

    {/* RIGHT */}
    <div className="grid gap-3 bg-neutral-50 p-5 sm:grid-cols-3 sm:p-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-lg">
          #
        </div>

        <div className="mt-4 text-sm font-bold text-neutral-950">
          Social Post
        </div>

        <div className="mt-2 text-xs leading-5 text-neutral-500">
          Fast and familiar, but limited when you have more to say, show, or
          organize.
        </div>

        <div className="mt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">
          Great for quick updates
        </div>
      </div>

      <div className="rounded-2xl border-2 border-blue-200 bg-white p-5 shadow-sm">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-black text-white">
          K
        </div>

        <div className="mt-4 text-sm font-bold text-neutral-950">
          Ko-Host
        </div>

        <div className="mt-2 text-xs leading-5 text-neutral-600">
          One focused, shareable site with your content, design, tools, and
          information all in one place.
        </div>

        <div className="mt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
          Built for the moment
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-lg">
          ◫
        </div>

        <div className="mt-4 text-sm font-bold text-neutral-950">
          Full Website
        </div>

        <div className="mt-2 text-xs leading-5 text-neutral-500">
          Powerful for long-term needs, but often more setup, expense, and
          commitment than the moment requires.
        </div>

        <div className="mt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">
          Great for permanent presence
        </div>
      </div>
    </div>
  </div>
</div>

<div className="mt-12 overflow-hidden rounded-[26px] border border-neutral-200 bg-white/90 shadow-sm backdrop-blur">
  <div className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
    <div className="flex items-center gap-3">
      <Image
        src="/icon.png"
        alt="Ko-Host"
        width={34}
        height={34}
        className="h-[34px] w-[34px] rounded-lg"
      />

      <div>
        <div className="text-sm font-bold text-neutral-950">
          Ko-Host
        </div>

        <div className="mt-0.5 text-[11px] text-neutral-500">
          A KnowIntel Company
        </div>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <Link
        href="/faq"
        className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-[11px] font-bold text-neutral-700 transition hover:bg-neutral-50"
      >
        FAQ
      </Link>

      <Link
        href="/help"
        className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-[11px] font-bold text-neutral-700 transition hover:bg-neutral-50"
      >
        Help & Feedback
      </Link>

      <a
        href="/get-started"
        className="rounded-xl bg-neutral-950 px-4 py-2 text-[11px] font-bold text-white transition hover:bg-neutral-800"
      >
        Create Your Site
      </a>
    </div>
  </div>

  <div className="border-t border-neutral-100 px-5 py-3 text-center text-[10px] text-neutral-400 sm:px-6">
    Create it. Share it. Ko-Host it.
  </div>
</div>
      </div>
    </div>
  );
}