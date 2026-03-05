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
    .replace(/\s+/g, "-") // spaces -> dashes
    .replace(/[^a-z0-9-]/g, "") // keep only url-safe chars
    .replace(/-+/g, "-") // collapse dashes
    .replace(/^-|-$/g, ""); // trim dashes
}

type AvailabilityState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available" }
  | { status: "taken" }
  | { status: "invalid" }
  | { status: "error"; message?: string };

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

  // slug availability state
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

  // ✅ Live slug availability check (debounced)
  useEffect(() => {
    const slug = normalizedSlug;

    // don't re-check the same slug
    if (slug && slug === lastCheckedRef.current) return;

    // basic validity gating (matches your server regex: /^[a-z0-9-]+$/ and length 2..40)
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

  const availabilityRow = useMemo(() => {
    const slug = normalizedSlug || "your-page";

    const badgeBase =
      "inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold";

    if (avail.status === "idle") {
      return (
        <div className="mt-2 text-[11px] text-neutral-500">
          URL: <span className="font-mono">{slug}.ko-host.com</span>
        </div>
      );
    }

    if (avail.status === "checking") {
      return (
        <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-600">
          <span className="font-mono">{slug}.ko-host.com</span>
          <span className={`${badgeBase} bg-neutral-100 text-neutral-700`}>
            Checking…
          </span>
        </div>
      );
    }

    if (avail.status === "available") {
      return (
        <div className="mt-2 flex items-center gap-2 text-[11px]">
          <span className="font-mono text-neutral-700">{slug}.ko-host.com</span>
          <span className={`${badgeBase} bg-green-50 text-green-700`}>
            ✓ Available
          </span>
        </div>
      );
    }

    if (avail.status === "taken") {
      return (
        <div className="mt-2 flex items-center gap-2 text-[11px]">
          <span className="font-mono text-neutral-700">{slug}.ko-host.com</span>
          <span className={`${badgeBase} bg-red-50 text-red-700`}>
            ✗ Taken
          </span>
        </div>
      );
    }

    if (avail.status === "invalid") {
      return (
        <div className="mt-2 flex items-center gap-2 text-[11px]">
          <span className="font-mono text-neutral-700">{slug}.ko-host.com</span>
          <span className={`${badgeBase} bg-amber-50 text-amber-800`}>
            Invalid
          </span>
        </div>
      );
    }

    // error
    return (
      <div className="mt-2 flex items-center gap-2 text-[11px]">
        <span className="font-mono text-neutral-700">{slug}.ko-host.com</span>
        <span className={`${badgeBase} bg-neutral-100 text-neutral-700`}>
          Couldn’t check
        </span>
      </div>
    );
  }, [avail.status, normalizedSlug]);

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

            {/* ✅ Live URL preview */}
            <div className="mt-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
              <div className="text-[11px] font-semibold text-neutral-600">
                Your URL will be:
              </div>
              <div className="mt-0.5 break-all font-mono text-[12px] font-semibold text-neutral-900">
                {previewUrl}
              </div>
            </div>

            <input
              value={draft.slugSuggestion}
              onChange={(e) => {
                const cleaned = normalizeSlug(e.target.value);
                setDraft((d) => ({ ...d, slugSuggestion: cleaned }));
                // reset check for new value
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

            {/* ✅ Availability status */}
            {availabilityRow}
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