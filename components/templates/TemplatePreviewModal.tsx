"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { TemplateDef } from "@/lib/templates/registry";

export type PreviewMeta = {
  tags: string[];
  setupMins: number;
  features: string[];
};

function demoUrlForTemplate(template: TemplateDef) {
  const demoSlug = (template.demoSlug || "").trim().toLowerCase();
  if (!demoSlug) return "";

  return `https://${demoSlug}.ko-host.com/s/demo`;
}

export default function TemplatePreviewModal(props: {
  open: boolean;
  onClose: () => void;
  template: TemplateDef | null;
  description: string;
  thumbnailUrl: string;
  meta: PreviewMeta;
}) {
  const { open, onClose, template, description, thumbnailUrl, meta } = props;

  const [copied, setCopied] = useState(false);

  const demoUrl = useMemo(() => {
    if (!template) return "";
    return demoUrlForTemplate(template);
  }, [template]);

  async function copyDemo() {
    try {
      await navigator.clipboard.writeText(demoUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {}
  }

  if (!open || !template) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close preview"
      />

      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-neutral-500">
              Preview template
            </div>
            <div className="mt-1 truncate text-xl font-semibold tracking-tight text-neutral-900">
              {template.title}
            </div>
            <div className="mt-1 text-sm text-neutral-700">{description}</div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {meta.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[12px] font-semibold text-neutral-800"
                >
                  {t}
                </span>
              ))}
              <span className="rounded-full bg-neutral-900 px-2.5 py-1 text-[12px] font-semibold text-white">
                Setup: ~{meta.setupMins} min
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100"
            aria-label="Close"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
          <div className="relative bg-neutral-100 p-4">
            <img
              src={thumbnailUrl}
              alt={template.title}
              className="h-auto w-full rounded-xl border border-neutral-200 object-cover shadow-sm"
              draggable={false}
            />

            <div className="mt-3 rounded-xl border border-neutral-200 bg-white px-3 py-2">
              <div className="text-[12px] font-semibold text-neutral-700">
                Demo link
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="min-w-0 flex-1 truncate text-[12px] font-medium text-neutral-600">
                  {demoUrl || "—"}
                </div>

                <button
                  type="button"
                  onClick={copyDemo}
                  disabled={!demoUrl}
                  className="shrink-0 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-[12px] font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-50"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="mt-3 text-[12px] font-medium text-neutral-500">
              Screenshot preview
            </div>
          </div>

          <div className="p-5">
            <div className="text-sm font-semibold text-neutral-900">Included</div>
            <ul className="mt-2 space-y-2 text-sm text-neutral-700">
              {meta.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="mt-[2px] text-emerald-600">●</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col gap-2">
              <a
                href={demoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
              >
                Open demo
              </a>

              <Link
                href={`/create/${encodeURIComponent(template.key)}/design`}
                className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
              >
                Create this template
              </Link>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-100"
              >
                Back to templates
              </button>
            </div>

            <div className="mt-4 text-[12px] text-neutral-500">
              Tip: choose a design preset before customizing your page.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}