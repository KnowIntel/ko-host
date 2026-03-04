"use client";

import { useEffect, useMemo, useState } from "react";
import KoHostItButton from "./KoHostItButton";

type Draft = {
  title: string;
  slugSuggestion: string;
};

function storageKey(templateKey: string) {
  return `kohost:draft:${templateKey}`;
}

// ✅ Slug rules: lowercase, no spaces, URL-safe
function normalizeSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")          // spaces -> dashes
    .replace(/[^a-z0-9-]/g, "")    // drop invalid chars
    .replace(/-+/g, "-")           // collapse dashes
    .replace(/^-|-$/g, "");        // trim dashes
}

export function TemplateDraftEditor({
  templateKey,
  templateTitle,
  defaultDraft,
}: {
  templateKey: string;
  templateTitle: string;
  defaultDraft: Draft;
}) {
  const key = useMemo(() => storageKey(templateKey), [templateKey]);
  const [draft, setDraft] = useState<Draft>(defaultDraft);

  useEffect(() => {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      try {
        setDraft(JSON.parse(raw));
      } catch {}
    }
  }, [key]);

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(draft));
  }, [key, draft]);

  // ✅ Live preview value
  const normalizedSlug = useMemo(() => normalizeSlug(draft.slugSuggestion || ""), [draft.slugSuggestion]);

  // If you later switch published convention, change this ONE line:
  const previewUrl = useMemo(() => {
    const slug = normalizedSlug || "your-page";
    return `https://${slug}.ko-host.com`;
  }, [normalizedSlug]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">{templateTitle}</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Customize for free. Publish when you’re ready.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Page Title</label>
            <input
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="e.g., Our Wedding"
            />
          </div>

          <div>
            {/* ✅ Rename field */}
            <label className="text-sm font-medium">Site Name</label>

            {/* ✅ Live URL preview (updates as user types) */}
            <div className="mt-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
              <div className="text-[11px] font-semibold text-neutral-600">Your URL will be:</div>
              <div className="mt-0.5 text-[12px] font-semibold text-neutral-900 break-all">
                {previewUrl}
              </div>
            </div>

            <input
              value={draft.slugSuggestion}
              onChange={(e) => {
                const raw = e.target.value;
                const cleaned = normalizeSlug(raw);
                setDraft((d) => ({ ...d, slugSuggestion: cleaned }));
              }}
              className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="e.g., ourwedding"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />

            <div className="mt-1 text-[11px] text-neutral-500">
              Letters, numbers, and dashes only. No spaces.
            </div>
          </div>
        </div>
      </section>

      <aside className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="space-y-3">
          <KoHostItButton templateKey={templateKey} draft={draft} />
        </div>
      </aside>
    </div>
  );
}