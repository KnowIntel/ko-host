"use client";

import { useEffect, useMemo, useState } from "react";
import TemplateGrid, { type Category, type Sort } from "@/components/templates/TemplateGrid";

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [sort, setSort] = useState<Sort>("Recommended");
  const [count, setCount] = useState<number>(0);

  // ✅ Safety: if URL/page reload or state gets weird, force a sane default once
  useEffect(() => {
    setSearchQuery("");
    setCategory("All");
    setSort("Recommended");
  }, []);

  const categories: Category[] = useMemo(
    () => [
      "All",
      "Favorites",
      "Recently viewed",
      "Events",
      "Business",
      "Real Estate",
      "Personal",
      "Career",
    ],
    []
  );

  const sorts: Sort[] = useMemo(() => ["Recommended", "A–Z", "New", "Popular"], []);

  const hasFilters =
    category !== "All" || sort !== "Recommended" || !!searchQuery.trim();

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
    <div className="relative">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl animate-kht-float" />
        <div className="absolute -bottom-24 left-10 h-[460px] w-[460px] rounded-full bg-emerald-500/10 blur-3xl animate-kht-float2" />
        <div className="absolute top-40 right-10 h-[420px] w-[420px] rounded-full bg-purple-500/10 blur-3xl animate-kht-float3" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-10 relative">
        {/* Sticky header */}
        <div className="sticky top-0 z-30 -mx-4 px-4 pt-6 pb-4 bg-white/85 backdrop-blur border-b border-neutral-200">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
              <p className="mt-1 text-sm text-neutral-700">
                Pick a template, customize it, then publish. For 90 days, you own that site.
              </p>
              <div className="mt-1 text-[12px] font-medium text-neutral-500">
                {count} template{count === 1 ? "" : "s"}
                {category !== "All" ? ` • ${category}` : ""}
                {searchQuery.trim() ? ` • “${searchQuery.trim()}”` : ""}
                {sort !== "Recommended" ? ` • ${sort}` : ""}
              </div>
            </div>

            {/* Sort (desktop) */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="text-[12px] font-semibold text-neutral-600">Sort</div>
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

          {/* Search */}
          <div className="mt-4 relative">
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

          {/* Categories */}
          <div className="mt-3 flex flex-wrap gap-2">
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
                      : "bg-white text-neutral-800 border border-neutral-200 hover:bg-neutral-50",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Sort (mobile) */}
          <div className="mt-3 sm:hidden">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              {sorts.map((s) => (
                <option key={s} value={s}>
                  Sort: {s}
                </option>
              ))}
            </select>
          </div>

          {/* Active filter chips */}
          {hasFilters ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {category !== "All" ? (
                <Chip label={`Category: ${category}`} onRemove={() => setCategory("All")} />
              ) : null}

              {sort !== "Recommended" ? (
                <Chip label={`Sort: ${sort}`} onRemove={() => setSort("Recommended")} />
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
        </div>

        <TemplateGrid
          searchQuery={searchQuery}
          category={category}
          sort={sort}
          onCountChange={setCount}
        />
      </div>
    </div>
  );
}