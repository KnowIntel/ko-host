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

// ✅ Replace spaces with "-" + allow only a-z 0-9 -
// also: collapse multiple dashes, trim leading/trailing dashes
function sanitizeSlugInput(raw: string) {
  const original = raw;

  let v = (raw || "")
    .toLowerCase()
    .replaceAll(" ", "-"); // your preference

  // turn any whitespace into dash (covers tabs)
  v = v.replace(/\s+/g, "-");

  // remove invalid chars
  v = v.replace(/[^a-z0-9-]/g, "");

  // collapse multiple dashes
  v = v.replace(/-+/g, "-");

  // trim dashes
  v = v.replace(/^-+/, "").replace(/-+$/, "");

  const isEmpty = v.trim().length === 0;
  const changed = v !== original;

  return { value: v, isEmpty, changed };
}

function validateSlug(v: string) {
  if (!v.trim()) return "Slug is required.";
  if (v.includes(" ")) return "No spaces allowed.";
  if (!/^[a-z0-9-]+$/.test(v)) return "Use only letters, numbers, and hyphens.";
  if (v.startsWith("-") || v.endsWith("-")) return "Cannot start or end with a hyphen.";
  if (v.includes("--")) return "Avoid consecutive hyphens.";
  if (v.length < 3) return "Slug is too short (min 3).";
  if (v.length > 40) return "Slug is too long (max 40).";
  return null;
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

  const slugError = useMemo(() => validateSlug(draft.slugSuggestion || ""), [draft.slugSuggestion]);

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
            <label className="text-sm font-medium">Slug</label>
            <input
              value={draft.slugSuggestion}
              onChange={(e) => {
                const { value } = sanitizeSlugInput(e.target.value);
                setDraft((d) => ({ ...d, slugSuggestion: value }));
              }}
              className={[
                "mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none",
                slugError ? "border-red-300 focus:border-red-500" : "focus:border-neutral-900",
              ].join(" ")}
              placeholder="e.g., our-wedding"
              inputMode="text"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />

            <div className="mt-1 text-[12px]">
              {slugError ? (
                <span className="font-medium text-red-600">{slugError}</span>
              ) : (
                <span className="text-neutral-500">
                  URL: <span className="font-medium text-neutral-700">{draft.slugSuggestion}.ko-host.com</span>
                </span>
              )}
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