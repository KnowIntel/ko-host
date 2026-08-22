"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  TemplateDef,
} from "@/lib/templates/registry";

export type PreviewMeta = {
  tags: string[];
  setupMins: number;
  features: string[];
};

export type TemplateDesignPreview = {
  id: string;
  label: string;
  thumbnailUrl: string;
  demoUrl: string;
  features: string[];
};

function demoUrlForTemplate(
  template: TemplateDef,
) {
  const demoSlug =
    (template.demoSlug || "")
      .trim()
      .toLowerCase();

  if (!demoSlug) {
    return "";
  }

  return `https://${demoSlug}.ko-host.com/s/demo`;
}

export default function TemplatePreviewModal(
  props: {
    open: boolean;
    onClose: () => void;

    template: TemplateDef | null;

    description: string;
    thumbnailUrl: string;

    meta: PreviewMeta;

    designPreviews?: TemplateDesignPreview[];
  },
) {
  const {
    open,
    onClose,
    template,
    description,
    thumbnailUrl,
    meta,
    designPreviews = [],
  } = props;

  const [copied, setCopied] =
    useState(false);

  const [
    activeDesignIndex,
    setActiveDesignIndex,
  ] = useState(0);

  /*
   * ================================================================
   * FALLBACK PREVIEW
   * ================================================================
   *
   * Keeps the modal working while TemplateGrid is being updated
   * to supply the real design-layout preview information.
   */

  const fallbackDesign =
    useMemo<TemplateDesignPreview | null>(
      () => {
        if (!template) {
          return null;
        }

        return {
          id: template.key,

          label:
            template.title ||
            "Template",

          thumbnailUrl,

          demoUrl:
            demoUrlForTemplate(
              template,
            ),

          features:
            meta.features ?? [],
        };
      },
      [
        template,
        thumbnailUrl,
        meta.features,
      ],
    );

  /*
   * Only use valid design previews.
   *
   * Blank/custom design cards should already be filtered out
   * by the parent, but this also protects the modal from
   * incomplete entries.
   */
  const usableDesignPreviews =
    useMemo(() => {
      const valid =
        designPreviews.filter(
          (design) =>
            Boolean(
              design &&
                design.id &&
                design.thumbnailUrl,
            ),
        );

      if (valid.length) {
        return valid;
      }

      return fallbackDesign
        ? [fallbackDesign]
        : [];
    }, [
      designPreviews,
      fallbackDesign,
    ]);

  const activeDesign =
    usableDesignPreviews[
      activeDesignIndex
    ] ??
    usableDesignPreviews[0] ??
    null;

  /*
   * ================================================================
   * RESET WHEN OPENED / TEMPLATE CHANGES
   * ================================================================
   */

  useEffect(() => {
    if (!open) {
      return;
    }

    setActiveDesignIndex(0);
    setCopied(false);
  }, [
    open,
    template?.key,
  ]);

  /*
   * ================================================================
   * AUTO-ROTATE EVERY 3 SECONDS
   * ================================================================
   */

  useEffect(() => {
    if (
      !open ||
      usableDesignPreviews.length <= 1
    ) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          setActiveDesignIndex(
            (current) =>
              (
                current + 1
              ) %
              usableDesignPreviews.length,
          );
        },
        3000,
      );

    return () => {
      window.clearInterval(
        timer,
      );
    };
  }, [
    open,
    usableDesignPreviews.length,
  ]);

  async function copyDemo() {
    const demoUrl =
      activeDesign?.demoUrl ??
      "";

    if (!demoUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        demoUrl,
      );

      setCopied(true);

      window.setTimeout(
        () => {
          setCopied(false);
        },
        1200,
      );
    } catch {}
  }

  if (
    !open ||
    !template
  ) {
    return null;
  }

  const activeDemoUrl =
    activeDesign?.demoUrl ??
    "";

  const activeFeatures =
    Array.from(
      new Set(
        (
          activeDesign?.features ??
          []
        )
          .map((feature) =>
            String(feature).trim(),
          )
          .filter(Boolean),
      ),
    );

  return (
    <div
      className={[
        "fixed inset-0 z-[100]",
        "overflow-y-auto bg-black/50 backdrop-blur-[2px]",
      ].join(" ")}
      role="dialog"
      aria-modal="true"
    >
      {/* BACKDROP */}

      <button
        type="button"
        className="fixed inset-0 z-0 cursor-default"
        onClick={onClose}
        aria-label="Close preview"
      />

      {/*
       * ================================================================
       * SCROLLABLE MODAL WRAPPER
       * ================================================================
       *
       * Mobile can scroll vertically through the entire modal.
       */}

      <div className="relative z-10 flex min-h-full items-start justify-center px-3 py-4 sm:px-4 sm:py-8 md:items-center">
        <div
          className={[
            "relative w-full max-w-3xl",
            "overflow-hidden rounded-2xl",
            "border border-neutral-200 bg-white shadow-2xl",
          ].join(" ")}
        >
          {/* ============================================================ */}
          {/* HEADER */}
          {/* ============================================================ */}

          <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-neutral-500">
                Preview template
              </div>

              <div className="mt-1 truncate text-xl font-semibold tracking-tight text-neutral-900">
                {template.title}
              </div>

              <div className="mt-1 text-sm text-neutral-700">
                {description}
              </div>

              {/*
               * TAGS
               *
               * Setup time pill removed.
               */}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {meta.tags.map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[12px] font-semibold text-neutral-800"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full px-3 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100"
              aria-label="Close"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* ============================================================ */}
          {/* MAIN CONTENT */}
          {/* ============================================================ */}

          <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
            {/* ========================================================== */}
            {/* LEFT — DESIGN SLIDESHOW */}
            {/* ========================================================== */}

            <div className="min-w-0 bg-neutral-100 p-4">
              {usableDesignPreviews.length ? (
                <>
                  <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                    {/*
                     * Horizontal carousel track.
                     *
                     * Every design sits side-by-side and the entire
                     * track translates whenever activeDesignIndex changes.
                     */}

                    <div
                      className="flex w-full transition-transform duration-700 ease-in-out"
                      style={{
                        transform:
                          `translateX(-${activeDesignIndex * 100}%)`,
                      }}
                    >
                      {usableDesignPreviews.map(
                        (
                          design,
                          index,
                        ) => (
                          <div
                            key={
                              design.id
                            }
                            className="w-full shrink-0"
                            aria-hidden={
                              index !==
                              activeDesignIndex
                            }
                          >
                            <img
                              src={
                                design.thumbnailUrl
                              }
                              alt={
                                design.label ||
                                template.title
                              }
                              className="aspect-[4/3] h-auto w-full object-cover"
                              draggable={
                                false
                              }
                            />
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {/* DESIGN NAME + POSITION */}

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-neutral-900">
                        {activeDesign?.label ||
                          template.title}
                      </div>

                      {usableDesignPreviews.length >
                      1 ? (
                        <div className="mt-0.5 text-[11px] text-neutral-500">
                          Design{" "}
                          {activeDesignIndex +
                            1}{" "}
                          of{" "}
                          {
                            usableDesignPreviews.length
                          }
                        </div>
                      ) : null}
                    </div>

                    {/* CAROUSEL DOTS */}

                    {usableDesignPreviews.length >
                    1 ? (
                      <div className="flex shrink-0 items-center gap-1.5">
                        {usableDesignPreviews.map(
                          (
                            design,
                            index,
                          ) => (
                            <button
                              key={
                                design.id
                              }
                              type="button"
                              onClick={() =>
                                setActiveDesignIndex(
                                  index,
                                )
                              }
                              className={[
                                "h-2 rounded-full transition-all",

                                index ===
                                activeDesignIndex
                                  ? "w-5 bg-neutral-900"
                                  : "w-2 bg-neutral-300 hover:bg-neutral-400",
                              ].join(
                                " ",
                              )}
                              aria-label={`Show ${design.label}`}
                            />
                          ),
                        )}
                      </div>
                    ) : null}
                  </div>

                  {/* ==================================================== */}
                  {/* DEMO LINK */}
                  {/* ==================================================== */}

                  <div className="mt-3 rounded-xl border border-neutral-200 bg-white px-3 py-3">
                    <div className="text-[12px] font-semibold text-neutral-700">
                      Demo link
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <div className="min-w-0 flex-1 truncate text-[12px] font-medium text-neutral-600">
                        {activeDemoUrl ||
                          "—"}
                      </div>

                      <button
                        type="button"
                        onClick={
                          copyDemo
                        }
                        disabled={
                          !activeDemoUrl
                        }
                        className="shrink-0 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-[12px] font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-50"
                      >
                        {copied
                          ? "Copied"
                          : "Copy"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 text-[12px] font-medium text-neutral-500">
                    Design preview
                  </div>
                </>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white text-sm text-neutral-500">
                  Preview unavailable
                </div>
              )}
            </div>

            {/* ========================================================== */}
            {/* RIGHT */}
            {/* ========================================================== */}

            <div className="min-w-0 p-5">
              {/* ======================================================== */}
              {/* INCLUDED — CURRENT DESIGN ONLY */}
              {/* ======================================================== */}

              <div className="text-sm font-semibold text-neutral-900">
                Included
              </div>

              <div className="mt-2 max-h-[210px] overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
                {activeFeatures.length ? (
                  <ul className="space-y-2 text-sm text-neutral-700">
                    {activeFeatures.map(
                      (feature) => (
                        <li
                          key={
                            feature
                          }
                          className="flex gap-2"
                        >
                          <span className="mt-[2px] shrink-0 text-emerald-600">
                            ●
                          </span>

                          <span>
                            {feature}
                          </span>
                        </li>
                      ),
                    )}
                  </ul>
                ) : (
                  <div className="py-3 text-sm text-neutral-500">
                    No block information available for this design.
                  </div>
                )}
              </div>

              {/* ======================================================== */}
              {/* ACTIONS */}
              {/* ======================================================== */}

              <div className="mt-6 flex flex-col gap-2">
                {activeDemoUrl ? (
                  <a
                    href={
                      activeDemoUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
                  >
                    Open demo
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-400"
                  >
                    Open demo
                  </button>
                )}

                <Link
                  href={`/create/${encodeURIComponent(
                    template.key,
                  )}/design`}
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
                Tip: choose a design layout before customizing your page.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}