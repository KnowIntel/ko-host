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
    <div className="min-w-0">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
        Templates
      </h1>

<div className="mt-3 text-sm leading-7 text-neutral-600 sm:text-[15px]">
  <div>
    Choose a template, make it yours, then go live — all for $12 for 90 days.
  </div>

  <div className="mt-3 flex flex-wrap items-center gap-3">
    <button
      type="button"
      onClick={() => setShowWhyKoHost(true)}
      className="font-semibold text-blue-600 hover:text-blue-700"
    >
      Why Ko-Host?
    </button>

    <a
      href="/get-started"
      className="inline-flex whitespace-nowrap rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-neutral-800"
    >
      Get Started
    </a>
  </div>

  <div className="mt-3 max-w-[680px] rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-amber-50 px-4 py-3 shadow-sm">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="inline-flex w-fit rounded-full border border-blue-200 bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-blue-700 animate-kht-offer-glow">
          Limited-Time Offer
        </div>

        <div className="mt-1 text-sm font-semibold leading-5 text-neutral-900">
          Free custom development with your microsite purchase.
        </div>

        <div className="mt-1 text-xs leading-5 text-neutral-600">
          Tell us what you need — we’ll help build it with a 48–72 hour turnaround.
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <a
          href="/claim-offer"
          className="rounded-full bg-neutral-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-neutral-800"
        >
          Claim Offer
        </a>

        <div className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">
          Ends Soon
        </div>
      </div>
    </div>
  </div>
</div>

      <div className="mt-1 text-[12px] font-medium text-neutral-500">
        {count} template{count === 1 ? "" : "s"}
        {category !== "All" ? ` • ${category}` : ""}
        {searchQuery.trim() ? ` • “${searchQuery.trim()}”` : ""}
        {sort !== "Recommended" ? ` • ${sort}` : ""}
      </div>
    </div>

    <div className="mt-5 min-w-0">
      <div className="rounded-2xl border border-neutral-200 bg-white/90 px-2 pb-1 pt-3 shadow-sm min-h-[201px] sm:px-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Recent Sites
            </div>
            <div className="text-sm font-medium text-neutral-900">
              New and popular pages people can view or join...
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

            <div className="mt-1 text-left text-[11px] text-neutral-400">
              Broadcasted sites are shared with permission from their owners.
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-3 py-6 text-sm text-neutral-500">
            No recent broadcasted microsites yet.
          </div>
        )}
      </div>
    </div>

    <div className="mt-5 w-full">
      <div className="relative w-full">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search templates… (e.g., wedding, rental, launch)"
          className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 pr-10 text-sm text-neutral-900 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/40"
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

      <div className="mt-3 flex flex-wrap items-center gap-2 min-w-0">
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

      <div className="mt-3 flex items-center gap-2">
        <div className="text-[12px] font-semibold text-neutral-600">Sort</div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-900 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          {sorts.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>

  {/* Desktop */}
  <div className="hidden gap-5 2xl:grid 2xl:grid-cols-[minmax(0,1fr)_760px] 2xl:items-start">
<div className="min-w-0">
  <div className="mb-3 h-[104px] overflow-hidden rounded-2xl border border-neutral-200 bg-white/90 shadow-sm">
    <img
      src="/images/homepage-hero.webp"
      alt="Ko-Host microsite builder"
      className="h-full w-full object-cover object-center"
    />
  </div>

  <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
    Templates
  </h1>

      <div className="mt-3 text-sm leading-7 text-neutral-600 sm:text-[15px]">
        <span className="inline">
          Choose a template, make it yours, then go live — all for $12 for 90 days.
        </span>

        <button
          type="button"
          onClick={() => setShowWhyKoHost(true)}
          className="ml-2 inline whitespace-nowrap font-semibold text-blue-600 hover:text-blue-700"
        >
          Why Ko-Host?
        </button>

        <a
          href="/get-started"
          className="ml-3 inline-flex whitespace-nowrap rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-neutral-800"
        >
          Get Started
        </a>
      </div>

      <div className="mt-1 text-[12px] font-medium text-neutral-500">
        {count} template{count === 1 ? "" : "s"}
        {category !== "All" ? ` • ${category}` : ""}
        {searchQuery.trim() ? ` • “${searchQuery.trim()}”` : ""}
        {sort !== "Recommended" ? ` • ${sort}` : ""}
      </div>

      <div className="mt-4 w-full">
        <div className="relative w-full">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates… (e.g., wedding, rental, launch)"
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 pr-10 text-sm text-neutral-900 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/40"
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

        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
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

          <div className="ml-3 flex shrink-0 items-center gap-2">
            <div className="text-[12px] font-semibold text-neutral-600">Sort</div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-900 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              {sorts.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>

    <div className="min-w-0">
      <div className="rounded-2xl border border-neutral-200 bg-white/90 px-2 pb-1 pt-3 shadow-sm min-h-[201px] sm:px-3">
                <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Recent Sites
            </div>
            <div className="text-sm font-medium text-neutral-900">
              New and popular pages people can view or join...
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

            <div className="mt-1 text-left text-[11px] text-neutral-400">
              Broadcasted sites are shared with permission from their owners.
            </div>

{showWhyKoHost && typeof document !== "undefined"
  ? createPortal(
      <div className="fixed inset-0 z-[2147483647] isolate overflow-y-auto bg-black/70 backdrop-blur-sm">
    <div className="min-h-full px-4 py-8 md:px-8">
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-2xl">
        {/* HERO */}
        <div className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 px-6 py-10 text-white md:px-10 md:py-14">
          <button
            type="button"
            onClick={() => setShowWhyKoHost(false)}
            className="absolute right-5 top-5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Close
          </button>

          <div className="max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-yellow-300">
              🔥 Ko-Host Advantage
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
              Squarespace and Wix were built for websites.
              <br />
              <span className="text-yellow-300">
                Ko-Host was built for moments.
              </span>
            </h2>

            <p className="mt-6 max-w-3xl text-base leading-8 text-neutral-300 md:text-lg">
              Create focused, purpose-built microsites for events, launches,
              announcements, experiences, and communities... without the
              complexity or long-term commitment of traditional website
              platforms.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {[
                "⚡ Fast microsite creation",
                "🌐 Hosting included",
                "🚀 Publishing included",
                "🎮 Interactive experiences",
                "🧩 No coding required",
                "⏳ Temporary-use friendly",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="grid gap-8 px-6 py-8 md:grid-cols-[0.95fr_1.05fr] md:px-10 md:py-10">
          {/* LEFT */}
          <div>
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
              <div className="text-xl font-bold text-neutral-950">
                Why people use Ko-Host
              </div>

              <div className="mt-5 grid gap-3">
                {[
                  "✅ Create purpose-built microsites in minutes",
                  "✅ Hosting included",
                  "✅ Publishing included",
                  "✅ Interactive tools & experiences included",
                  "✅ No coding required",
                  "✅ No long-term website commitment",
                  "✅ Designed specifically for temporary or event-based experiences",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-neutral-200 bg-white p-6">
              <div className="text-xl font-bold text-neutral-950">
                Built for real-world moments
              </div>

              <p className="mt-3 text-sm leading-7 text-neutral-600">
                Instead of paying for an oversized website platform built for
                permanent business websites, Ko-Host focuses on experiences
                people actually need quickly.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
                {[
                  "💡 parties",
                  "💡 events",
                  "💡 announcements",
                  "💡 communities",
                  "💡 interactive experiences",
                  "💡 showcases",
                  "💡 temporary campaigns",
                  "💡 creative one-off pages",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-neutral-900 bg-neutral-950 p-6 text-white">
              <div className="text-2xl font-bold">
                Made for the moment. Temporary by design.
              </div>

              <p className="mt-4 text-sm leading-7 text-neutral-300">
                From quick announcements to dynamic, interactive experiences,
                Ko-Host offers a seamless way to build, personalize, and launch
                microsites tailored to any occasion.
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <div className="overflow-hidden rounded-3xl border border-neutral-200">
              <div className="border-b border-neutral-200 bg-neutral-950 px-5 py-4 text-white">
                <div className="text-lg font-bold">⚡ Feature Comparison</div>
                <div className="mt-1 text-sm text-neutral-300">
                  Ko-Host vs traditional website builders
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-neutral-100 text-left">
                      <th className="border-b border-neutral-200 px-4 py-3 font-semibold text-neutral-700">
                        Feature
                      </th>
                    <th className="whitespace-nowrap border-b border-neutral-200 px-5 py-3 font-semibold text-neutral-950">
                      Ko-Host
                    </th>
                      <th className="border-b border-neutral-200 px-4 py-3 font-semibold text-neutral-700">
                        Wix / Squarespace
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {[
                      ["Fast microsite creation", "✅", "⚠️ Built for full websites"],
                      ["Hosting included", "✅", "✅"],
                      ["Publishing included", "✅", "✅"],
                      ["Interactive experiences", "✅", "Limited/custom"],
                      ["Temporary-use friendly", "✅", "❌"],
                      ["Event/community focused", "✅", "⚠️ General-purpose"],
                      ["Lightweight setup", "✅", "⚠️ More complex"],
                      ["No coding required", "✅", "✅"],
                      ["Long-term commitment needed", "❌", "Often yes"],
                    ].map(([feature, koHost, competitors]) => (
                      <tr key={feature} className="border-b border-neutral-100">
                        <td className="px-4 py-3 font-medium text-neutral-700">
                          {feature}
                        </td>

                        <td className="whitespace-nowrap bg-green-50 px-5 py-3 font-semibold text-green-700">
                          {koHost}
                        </td>

                        <td className="px-4 py-3 text-neutral-600">
                          {competitors}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-yellow-300 bg-yellow-50 p-6">
              <div className="text-lg font-bold text-neutral-950">
                Why pay $20–$40/month for a full website builder when all you need is one powerful microsite?
              </div>

              <p className="mt-3 text-sm leading-7 text-neutral-700">
                Ko-Host gives you hosting, publishing, interactive features,
                and custom microsites... without the complexity or long-term
                commitment of traditional website platforms.
              </p>

              <button
                type="button"
                onClick={() => setShowWhyKoHost(false)}
                className="mt-5 rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Close & Explore Templates
              </button>

              <div className="mt-4 text-xs leading-6 text-neutral-500">
                Pricing and feature references based on current published Wix
                and Squarespace pricing/materials.
              </div>
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
            No recent broadcasted microsites yet.
          </div>
        )}
      </div>

      <div className="mt-3 w-full rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-amber-50 px-4 py-3 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="inline-flex w-fit rounded-full border border-blue-200 bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-blue-700 animate-kht-offer-glow">
              Limited-Time Offer
            </div>

            <div className="mt-1 text-sm font-semibold leading-5 text-neutral-900">
              Free custom development with your microsite purchase.
            </div>

            <div className="mt-1 text-xs leading-5 text-neutral-600">
              Tell us what you need — we’ll help build it with a 48–72 hour turnaround.
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href="/claim-offer"
              className="rounded-full bg-neutral-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-neutral-800"
            >
              Claim Offer
            </a>

            <div className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">
              Ends Soon
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>


        </div>

        <div className="mt-16">
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

<div className="mt-12 flex items-center justify-between gap-4">
  <Link
    href="/faq"
    className="inline-flex items-center rounded-2xl border border-neutral-200 bg-white/85 px-4 py-3 text-sm font-semibold text-neutral-700 shadow-sm backdrop-blur transition hover:bg-white"
  >
    FAQ
  </Link>

  <div className="inline-flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
    <Image
      src="/icon.png"
      alt="Ko-Host"
      width={28}
      height={28}
      className="h-7 w-7 rounded-md"
    />

    <span className="text-sm font-medium text-neutral-700">
      Ko-Host: A KnowIntel Company
    </span>
  </div>
</div>
      </div>
    </div>
  );
}