"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_DEFS,
  type TemplateDef,
} from "@/lib/templates/registry";
import { getTemplateLayoutRegistry } from "@/lib/templates/layout-presets/layoutRegistry";

const BLANK_TEMPLATE_KEY = "custom_template";

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function GetStartedPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDef | null>(
    null,
  );
  const [selectedDesignKey, setSelectedDesignKey] = useState<string>("");

  const visibleTemplates = useMemo(() => {
    return TEMPLATE_DEFS.filter((template) => {
      if (template.key === BLANK_TEMPLATE_KEY) return false;
      if (selectedCategory === "All") return true;
      return template.category === selectedCategory;
    });
  }, [selectedCategory]);

  const selectedLayouts = useMemo(() => {
    if (!selectedTemplate) return [];

    if (selectedTemplate.key === BLANK_TEMPLATE_KEY) {
      return [];
    }

    return getTemplateLayoutRegistry(selectedTemplate.key)?.layouts ?? [];
  }, [selectedTemplate]);

  function handleSelectTemplate(template: TemplateDef) {
    setSelectedTemplate(template);
    setSelectedDesignKey("");
    setStep(2);
  }

  function handleSelectBlankCanvas() {
    const blankTemplate = TEMPLATE_DEFS.find(
      (template) => template.key === BLANK_TEMPLATE_KEY,
    );

    if (!blankTemplate) {
      router.push("/create/custom_template?guided=1&mode=new");
      return;
    }

    setSelectedTemplate(blankTemplate);
    setSelectedDesignKey("blank");
    setStep(2);
  }

  function handleContinueToBuilder() {
    if (!selectedTemplate) return;

    if (selectedTemplate.key === BLANK_TEMPLATE_KEY) {
      router.push("/create/custom_template?guided=1&mode=new");
      return;
    }

    const designKey = selectedDesignKey || "blank";

    router.push(
      `/create/${encodeURIComponent(
        selectedTemplate.key,
      )}?design=${encodeURIComponent(designKey)}&mode=new&guided=1`,
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_30%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/templates"
            className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 shadow-sm transition hover:bg-neutral-50"
          >
            ← Back to Templates
          </Link>

          <div className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500 shadow-sm">
            Beginner Flow
          </div>
        </div>

        <section className="overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-sm">
          <div className="relative px-6 py-8 sm:px-8 sm:py-10">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-blue-100/50 via-purple-100/35 to-emerald-100/45" />

            <div className="relative">
              <div className="mb-4 flex flex-wrap gap-2">
                <span
                  className={classNames(
                    "rounded-full px-3 py-1 text-xs font-bold",
                    step === 1
                      ? "bg-neutral-950 text-white"
                      : "bg-neutral-100 text-neutral-600",
                  )}
                >
                  Step 1: Choose Template
                </span>

                <span
                  className={classNames(
                    "rounded-full px-3 py-1 text-xs font-bold",
                    step === 2
                      ? "bg-neutral-950 text-white"
                      : "bg-neutral-100 text-neutral-600",
                  )}
                >
                  Step 2: Choose Design
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
                Let’s build your microsite step by step.
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-600 sm:text-[15px]">
                Choose what you’re creating, pick a starting design, then
                customize it in the Ko-Host builder.
              </p>
            </div>
          </div>
        </section>

        {step === 1 ? (
          <section className="mt-8 rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-neutral-950">
                What are you creating?
              </h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Pick the closest category or start from a blank canvas.
              </p>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {["All", ...TEMPLATE_CATEGORIES].map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={classNames(
                    "rounded-full border px-4 py-2 text-xs font-bold transition",
                    selectedCategory === category
                      ? "border-neutral-950 bg-neutral-950 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
                  )}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <button
                type="button"
                onClick={handleSelectBlankCanvas}
                className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 p-5 text-left transition hover:border-neutral-950 hover:bg-white hover:shadow-md"
              >
                <div className="text-sm font-bold text-neutral-950">
                  Blank Canvas
                </div>
                <div className="mt-2 text-xs leading-5 text-neutral-600">
                  Start with an empty microsite and build it your way.
                </div>
                <div className="mt-4 inline-flex rounded-full bg-neutral-950 px-3 py-1 text-[11px] font-bold text-white">
                  Flexible
                </div>
              </button>

              {visibleTemplates.map((template) => (
                <button
                  key={template.key}
                  type="button"
                  onClick={() => handleSelectTemplate(template)}
                  className="rounded-3xl border border-neutral-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-neutral-950 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-neutral-950">
                        {template.title}
                      </div>
                      <div className="mt-2 text-xs leading-5 text-neutral-600">
                        {template.description}
                      </div>
                    </div>

                    <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold text-neutral-600">
                      {template.category}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {template.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-[10px] font-semibold text-neutral-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {step === 2 && selectedTemplate ? (
          <section className="mt-8 rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-neutral-950">
                  Choose a starting design
                </h2>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  Selected template:{" "}
                  <span className="font-semibold text-neutral-900">
                    {selectedTemplate.title}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setSelectedDesignKey("");
                }}
                className="w-fit rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-bold text-neutral-700 transition hover:bg-neutral-50"
              >
                Change Template
              </button>
            </div>

            {selectedTemplate.key === BLANK_TEMPLATE_KEY ? (
              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                <div className="text-sm font-bold text-neutral-950">
                  Start from Blank Canvas
                </div>
                <p className="mt-2 text-xs leading-5 text-neutral-600">
                  You’ll go straight into the builder with an empty custom
                  microsite.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {selectedLayouts.map((layout) => (
                  <button
                    key={layout.designKey}
                    type="button"
                    onClick={() => setSelectedDesignKey(layout.designKey)}
                    className={classNames(
                      "overflow-hidden rounded-3xl border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                      selectedDesignKey === layout.designKey
                        ? "border-neutral-950 ring-2 ring-neutral-950 ring-offset-2"
                        : "border-neutral-200",
                    )}
                  >
                    {layout.card.thumbnail ? (
                      <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                        <img
                          src={layout.card.thumbnail}
                          alt={layout.card.label}
                          className="h-full w-full object-cover object-top"
                          draggable={false}
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[4/3] items-center justify-center bg-neutral-100 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Layout
                      </div>
                    )}

                    <div className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-bold text-neutral-950">
                          {layout.card.label}
                        </div>

                        {layout.recommended ? (
                          <span className="rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white">
                            Recommended
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-neutral-600">
                        {layout.card.description || "Design layout preset"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedDesignKey("blank")}
                className={classNames(
                  "rounded-full border px-4 py-2 text-xs font-bold transition",
                  selectedDesignKey === "blank"
                    ? "border-neutral-950 bg-neutral-950 text-white"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
                )}
              >
                Start From Scratch
              </button>

              <button
                type="button"
                onClick={handleContinueToBuilder}
                disabled={
                  selectedTemplate.key !== BLANK_TEMPLATE_KEY &&
                  !selectedDesignKey
                }
                className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue to Builder
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}