"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import KoHostItButton from "./KoHostItButton";

type LinkItem = { label: string; url: string };

type Draft = {
  title: string;
  slugSuggestion: string;

  // NEW: owner editable content
  announcement: string;
  links: LinkItem[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
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

function normalizeUrl(input: string) {
  const s = (input || "").trim();
  if (!s) return "";
  // If they paste "example.com" we can help by adding https://
  if (!/^https?:\/\//i.test(s)) return `https://${s}`;
  return s;
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
  defaultDraft: { title: string; slugSuggestion: string };
}) {
  const key = useMemo(() => storageKey(templateKey), [templateKey]);

  const initialDraft: Draft = useMemo(
    () => ({
      title: defaultDraft.title ?? "",
      slugSuggestion: defaultDraft.slugSuggestion ?? "",

      announcement: "",
      links: [],
      contactName: "",
      contactEmail: "",
      contactPhone: "",
    }),
    [defaultDraft.slugSuggestion, defaultDraft.title]
  );

  const [draft, setDraft] = useState<Draft>(initialDraft);

  // slug availability state
  const [avail, setAvail] = useState<AvailabilityState>({ status: "idle" });
  const lastCheckedRef = useRef<string>("");

  useEffect(() => {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setDraft((prev) => ({
          ...prev,
          ...parsed,
          // ensure arrays exist
          links: Array.isArray(parsed?.links) ? parsed.links : prev.links,
        }));
      } catch {}
    } else {
      setDraft(initialDraft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const availabilityRow = useMemo(() => {
    const slug = normalizedSlug || "your-page";
    const badgeBase =
      "inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold";

    if (avail.status === "idle") return null;

    if (avail.status === "checking") {
      return (
        <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-600">
          <span className="font-mono">{slug}.ko-host.com</span>
          <span className={`${badgeBase} bg-neutral-100 text-neutral-700`}>Checking…</span>
        </div>
      );
    }

    if (avail.status === "available") {
      return (
        <div className="mt-2 flex items-center gap-2 text-[11px]">
          <span className="font-mono text-neutral-700">{slug}.ko-host.com</span>
          <span className={`${badgeBase} bg-green-50 text-green-700`}>✓ Available</span>
        </div>
      );
    }

    if (avail.status === "taken") {
      return (
        <div className="mt-2 flex items-center gap-2 text-[11px]">
          <span className="font-mono text-neutral-700">{slug}.ko-host.com</span>
          <span className={`${badgeBase} bg-red-50 text-red-700`}>✗ Taken</span>
        </div>
      );
    }

    if (avail.status === "invalid") {
      return (
        <div className="mt-2 flex items-center gap-2 text-[11px]">
          <span className="font-mono text-neutral-700">{slug}.ko-host.com</span>
          <span className={`${badgeBase} bg-amber-50 text-amber-800`}>Invalid</span>
        </div>
      );
    }

    return (
      <div className="mt-2 flex items-center gap-2 text-[11px]">
        <span className="font-mono text-neutral-700">{slug}.ko-host.com</span>
        <span className={`${badgeBase} bg-neutral-100 text-neutral-700`}>Couldn’t check</span>
      </div>
    );
  }, [avail.status, normalizedSlug]);

  function addLink() {
    setDraft((d) => ({
      ...d,
      links: [...d.links, { label: "", url: "" }],
    }));
  }

  function updateLink(idx: number, patch: Partial<LinkItem>) {
    setDraft((d) => {
      const next = [...d.links];
      next[idx] = { ...next[idx], ...patch };
      return { ...d, links: next };
    });
  }

  function removeLink(idx: number) {
    setDraft((d) => {
      const next = d.links.filter((_, i) => i !== idx);
      return { ...d, links: next };
    });
  }

  function moveLink(idx: number, dir: -1 | 1) {
    setDraft((d) => {
      const next = [...d.links];
      const to = idx + dir;
      if (to < 0 || to >= next.length) return d;
      const tmp = next[idx];
      next[idx] = next[to];
      next[to] = tmp;
      return { ...d, links: next };
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">{templateTitle}</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Customize for free. Publish when you’re ready.
          </p>
        </div>

        <div className="space-y-5">
          {/* Page title */}
          <div>
            <label className="text-sm font-medium">Page title</label>
            <input
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="e.g., Our Wedding"
            />
          </div>

          {/* Site name + URL preview */}
          <div>
            <label className="text-sm font-medium">Site name</label>

            <div className="mt-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] font-semibold text-neutral-600">Your URL will be:</div>
                {availabilityRow}
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

          {/* Announcement */}
          <div>
            <label className="text-sm font-medium">Announcement</label>
            <textarea
              value={draft.announcement}
              onChange={(e) => setDraft((d) => ({ ...d, announcement: e.target.value }))}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="Optional: add an important note or update..."
              rows={3}
            />
          </div>

          {/* Links editor */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Links</label>
              <button
                type="button"
                onClick={addLink}
                className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-800 hover:bg-neutral-50"
              >
                + Add link
              </button>
            </div>

            <div className="mt-2 space-y-2">
              {draft.links.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600">
                  Add links like “Registry”, “RSVP details”, “Deck”, “Application”, etc.
                </div>
              ) : null}

              {draft.links.map((l, idx) => (
                <div key={idx} className="rounded-xl border border-neutral-200 bg-white p-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <div className="text-[11px] font-semibold text-neutral-600">Label</div>
                      <input
                        value={l.label}
                        onChange={(e) => updateLink(idx, { label: e.target.value })}
                        className="mt-1 w-full rounded-lg border px-2.5 py-2 text-sm"
                        placeholder="e.g., RSVP Form"
                      />
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold text-neutral-600">URL</div>
                      <input
                        value={l.url}
                        onChange={(e) => updateLink(idx, { url: normalizeUrl(e.target.value) })}
                        className="mt-1 w-full rounded-lg border px-2.5 py-2 text-sm"
                        placeholder="https://..."
                        inputMode="url"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                      />
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveLink(idx, -1)}
                        className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold hover:bg-neutral-50"
                        disabled={idx === 0}
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveLink(idx, 1)}
                        className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold hover:bg-neutral-50"
                        disabled={idx === draft.links.length - 1}
                        title="Move down"
                      >
                        ↓
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeLink(idx)}
                      className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <label className="text-sm font-medium">Contact</label>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <div className="text-[11px] font-semibold text-neutral-600">Name</div>
                <input
                  value={draft.contactName}
                  onChange={(e) => setDraft((d) => ({ ...d, contactName: e.target.value }))}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="e.g., Michel"
                />
              </div>

              <div>
                <div className="text-[11px] font-semibold text-neutral-600">Email</div>
                <input
                  value={draft.contactEmail}
                  onChange={(e) => setDraft((d) => ({ ...d, contactEmail: e.target.value }))}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="name@email.com"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>

              <div>
                <div className="text-[11px] font-semibold text-neutral-600">Phone</div>
                <input
                  value={draft.contactPhone}
                  onChange={(e) => setDraft((d) => ({ ...d, contactPhone: e.target.value }))}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="Optional"
                  inputMode="tel"
                />
              </div>
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