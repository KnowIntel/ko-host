"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import KoHostItButton from "./KoHostItButton";

type Draft = {
  title: string;
  slugSuggestion: string;
};

function storageKey(templateKey: string) {
  return `kohost:draft:${templateKey}`;
}

function normalizeSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

type AvailabilityState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available" }
  | { status: "taken" }
  | { status: "invalid" }
  | { status: "error"; message?: string };

function availabilityPill(avail: AvailabilityState) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold";

  if (avail.status === "idle") return null;

  if (avail.status === "checking") {
    return <span className={`${base} bg-neutral-100 text-neutral-700`}>Checking…</span>;
  }

  if (avail.status === "available") {
    return <span className={`${base} bg-green-50 text-green-700`}>✓ Available</span>;
  }

  if (avail.status === "taken") {
    return <span className={`${base} bg-red-50 text-red-700`}>✗ Taken</span>;
  }

  if (avail.status === "invalid") {
    return <span className={`${base} bg-amber-50 text-amber-800`}>Invalid</span>;
  }

  return <span className={`${base} bg-neutral-100 text-neutral-700`}>Couldn’t check</span>;
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

  const [avail, setAvail] = useState<AvailabilityState>({ status: "idle" });
  const lastCheckedRef = useRef<string>("");

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

  const normalizedSlug = useMemo(
    () => normalizeSlug(draft.slugSuggestion || ""),
    [draft.slugSuggestion]
  );

  const previewUrl = useMemo(() => {
    const slug = normalizedSlug || "your-page";
    return `https://${slug}.ko-host.com`;
  }, [normalizedSlug]);

  // live slug availability check (debounced)
  useEffect(() => {
    const slug = normalizedSlug;

    if (slug && slug === lastCheckedRef.current) return;

    if (!slug) {
      setAvail({ status: "idle" });
      lastCheckedRef.current = "";
      return;
    }

    if (slug.length < 2 || slug.length > 40 || !/^[a-z0-9-]+$/.test(slug)) {
      setAvail({ status: "invalid" });
      lastCheckedRef.current = "";
      return;
    }

    setAvail({ status: "checking" });

    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/microsites/check-slug?slug=${encodeURIComponent(slug)}`,
          { method: "GET", cache: "no-store" }
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setAvail({
            status: "error",
            message: data?.error || "Could not check availability.",
          });
          return;
        }

        lastCheckedRef.current = slug;

        if (data?.available === true) setAvail({ status: "available" });
        else if (data?.available === false) setAvail({ status: "taken" });
        else setAvail({ status: "error", message: "Unexpected response." });
      } catch {
        setAvail({ status: "error", message: "Network error." });
      }
    }, 350);

    return () => window.clearTimeout(t);
  }, [normalizedSlug]);

  const pill = useMemo(() => availabilityPill(avail), [avail]);

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
            <label className="text-sm font-medium">Page title</label>
            <input
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="e.g., Our Wedding"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Site name</label>

            {/* ✅ URL preview + availability pill (same row) */}
            <div className="mt-1 flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-neutral-600">
                  Your URL will be:
                </div>
                <div className="mt-0.5 truncate font-mono text-[12px] font-semibold text-neutral-900">
                  {previewUrl}
                </div>
              </div>

              <div className="shrink-0">{pill}</div>
            </div>

            <input
              value={draft.slugSuggestion}
              onChange={(e) => {
                const cleaned = normalizeSlug(e.target.value);
                setDraft((d) => ({ ...d, slugSuggestion: cleaned }));
                setAvail(cleaned ? { status: "checking" } : { status: "idle" });
                lastCheckedRef.current = "";
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