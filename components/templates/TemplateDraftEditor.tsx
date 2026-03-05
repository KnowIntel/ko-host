"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import KoHostItButton from "./KoHostItButton";

type Draft = {
  title: string;
  slugSuggestion: string;

  announcement?: {
    headline: string;
    body: string;
  };

  links?: Array<{ id: string; label: string; url: string }>;

  contact?: {
    name: string;
    email: string;
    phone: string;
  };
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

function newId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

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

  const [draft, setDraft] = useState<Draft>(() => ({
    title: defaultDraft.title,
    slugSuggestion: defaultDraft.slugSuggestion,
    announcement: { headline: "", body: "" },
    links: [],
    contact: { name: "", email: "", phone: "" },
  }));

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
          announcement: {
            headline: parsed?.announcement?.headline ?? prev.announcement?.headline ?? "",
            body: parsed?.announcement?.body ?? prev.announcement?.body ?? "",
          },
          links: Array.isArray(parsed?.links) ? parsed.links : prev.links ?? [],
          contact: {
            name: parsed?.contact?.name ?? prev.contact?.name ?? "",
            email: parsed?.contact?.email ?? prev.contact?.email ?? "",
            phone: parsed?.contact?.phone ?? prev.contact?.phone ?? "",
          },
        }));
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
        const res = await fetch(`/api/microsites/check-slug?slug=${encodeURIComponent(slug)}`, {
          method: "GET",
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setAvail({ status: "error", message: data?.error || "Could not check availability." });
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

  const availabilityBadge = useMemo(() => {
    const slug = normalizedSlug || "your-page";
    const badgeBase = "inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold";

    if (avail.status === "idle") return null;

    if (avail.status === "checking") {
      return (
        <span className={`${badgeBase} bg-neutral-100 text-neutral-700`}>Checking…</span>
      );
    }
    if (avail.status === "available") {
      return <span className={`${badgeBase} bg-green-50 text-green-700`}>✓ Available</span>;
    }
    if (avail.status === "taken") {
      return <span className={`${badgeBase} bg-red-50 text-red-700`}>✗ Taken</span>;
    }
    if (avail.status === "invalid") {
      return <span className={`${badgeBase} bg-amber-50 text-amber-800`}>Invalid</span>;
    }
    return (
      <span className={`${badgeBase} bg-neutral-100 text-neutral-700`}>Couldn’t check</span>
    );
  }, [avail.status, normalizedSlug]);

  function addLink() {
    setDraft((d) => ({
      ...d,
      links: [...(d.links ?? []), { id: newId(), label: "", url: "" }],
    }));
  }

  function updateLink(id: string, patch: Partial<{ label: string; url: string }>) {
    setDraft((d) => ({
      ...d,
      links: (d.links ?? []).map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  }

  function removeLink(id: string) {
    setDraft((d) => ({ ...d, links: (d.links ?? []).filter((x) => x.id !== id) }));
  }

  function moveLink(id: string, dir: -1 | 1) {
    setDraft((d) => {
      const list = [...(d.links ?? [])];
      const idx = list.findIndex((x) => x.id === id);
      if (idx < 0) return d;
      const j = idx + dir;
      if (j < 0 || j >= list.length) return d;
      const tmp = list[idx];
      list[idx] = list[j];
      list[j] = tmp;
      return { ...d, links: list };
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

        <div className="space-y-6">
          {/* Basics */}
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

              {/* URL preview with badge to the right */}
              <div className="mt-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
                <div className="text-[11px] font-semibold text-neutral-600">Your URL will be:</div>

                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <div className="break-all font-mono text-[12px] font-semibold text-neutral-900">
                    {previewUrl}
                  </div>
                  {availabilityBadge ? <div className="shrink-0">{availabilityBadge}</div> : null}
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
          </div>

          {/* Owner editor */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="text-sm font-semibold text-neutral-900">Owner editor</div>
            <div className="mt-1 text-xs text-neutral-500">
              These will appear on your microsite when published.
            </div>

            {/* Announcement */}
            <div className="mt-4">
              <div className="text-sm font-semibold text-neutral-900">Announcement</div>
              <input
                value={draft.announcement?.headline ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    announcement: { headline: e.target.value, body: d.announcement?.body ?? "" },
                  }))
                }
                className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="Headline (optional)"
              />
              <textarea
                value={draft.announcement?.body ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    announcement: { headline: d.announcement?.headline ?? "", body: e.target.value },
                  }))
                }
                className="mt-2 w-full resize-none rounded-xl border px-3 py-2 text-sm"
                placeholder="Message (optional)"
                rows={3}
              />
            </div>

            {/* Links */}
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-neutral-900">Links</div>
                <button
                  type="button"
                  onClick={addLink}
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-900 hover:bg-neutral-50"
                >
                  + Add link
                </button>
              </div>

              <div className="mt-2 space-y-3">
                {(draft.links ?? []).length === 0 ? (
                  <div className="text-xs text-neutral-500">No links yet.</div>
                ) : null}

                {(draft.links ?? []).map((l, idx) => (
                  <div key={l.id} className="rounded-2xl border border-neutral-200 p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-neutral-600">
                        Link {idx + 1}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => moveLink(l.id, -1)}
                          className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-[11px] font-semibold hover:bg-neutral-50"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLink(l.id, 1)}
                          className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-[11px] font-semibold hover:bg-neutral-50"
                          title="Move down"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLink(l.id)}
                          className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-neutral-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <input
                      value={l.label}
                      onChange={(e) => updateLink(l.id, { label: e.target.value })}
                      className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                      placeholder="Label (e.g., RSVP, Menu, Deck, Apply)"
                    />
                    <input
                      value={l.url}
                      onChange={(e) => updateLink(l.id, { url: e.target.value })}
                      className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                      placeholder="URL (https://...)"
                      inputMode="url"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="mt-5">
              <div className="text-sm font-semibold text-neutral-900">Contact</div>
              <div className="mt-2 grid gap-2">
                <input
                  value={draft.contact?.name ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      contact: { ...(d.contact ?? { name: "", email: "", phone: "" }), name: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="Name (optional)"
                />
                <input
                  value={draft.contact?.email ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      contact: { ...(d.contact ?? { name: "", email: "", phone: "" }), email: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="Email (optional)"
                  inputMode="email"
                />
                <input
                  value={draft.contact?.phone ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      contact: { ...(d.contact ?? { name: "", email: "", phone: "" }), phone: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="Phone (optional)"
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