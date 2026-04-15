// app\create\[template]\design\page.tsx
import Link from "next/link";
import { getTemplateLayoutRegistry } from "@/lib/templates/layout-presets/layoutRegistry";
import {
  TEMPLATE_DEFS,
  getTemplateDef,
  normalizeTemplateKey,
} from "@/lib/templates/registry";
import DesignCard from "@/components/designs/DesignCard";
import { createDraftFromLayoutDefinition } from "@/lib/templates/layout-presets/layoutToDraft";

function resolveTemplateFromRoute(rawTemplate: string) {
  const normalized = normalizeTemplateKey(rawTemplate);

  return (
    getTemplateDef(normalized) ||
    TEMPLATE_DEFS.find((t) => normalizeTemplateKey(t.demoSlug) === normalized) ||
    TEMPLATE_DEFS.find((t) => normalizeTemplateKey(t.thumb) === normalized) ||
    TEMPLATE_DEFS.find(
      (t) => normalizeTemplateKey(t.title.replace(/\s+/g, "_")) === normalized,
    ) ||
    TEMPLATE_DEFS[0]
  );
}

function badgeClassName(badge?: "Popular" | "New" | "Recommended" | null) {
  if (badge === "Popular") return "bg-neutral-950 text-white";
  if (badge === "New") return "bg-cyan-700 text-white";
  if (badge === "Recommended") return "bg-emerald-700 text-white";
  return "bg-neutral-200 text-neutral-800";
}

export default async function CreateTemplateDesignPage({
  params,
}: {
  params: Promise<{ template: string }>;
}) {
  const { template } = await params;

  const templateDef = resolveTemplateFromRoute(template);
  const templateKey = templateDef.key;

  const layoutRegistry = getTemplateLayoutRegistry(templateKey);

  const designPresets =
    layoutRegistry?.layouts.map((layout) => {
      // ✅ USE LAYOUT ONLY (NO DRAFTS)
      const previewDraft = createDraftFromLayoutDefinition({
        templateKey,
        layout,
        slugSuggestion: templateDef.defaultDraft?.slugSuggestion || "",
      });

      return {
        key: layout.designKey,
        label: layout.card.label,
        description: layout.card.description || "",
        backgroundImage: layout.card.thumbnail || "",
        badge: layout.recommended ? ("Recommended" as const) : null,
        previewDraft,
      };
    }) ?? [];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.06),_transparent_28%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)]">
      <div className="w-full px-4 pb-10 pt-12">
        <div className="mb-8 overflow-hidden rounded-[30px] border border-neutral-200 bg-white shadow-sm">
          <div className="relative px-6 py-8 sm:px-8 sm:py-9">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-violet-100/40 via-sky-100/30 to-emerald-100/40" />

            <div className="relative">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
                  Step 1 of 2
                </span>

                <span className="inline-flex items-center rounded-full bg-neutral-950 px-2.5 py-1 text-[10px] font-semibold text-white">
                  Choose Design
                </span>
              </div>

              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
                    Choose a Design Layout
                  </h1>

                  <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-600 sm:text-[15px]">
                    Select the visual layout for{" "}
                    <span className="font-semibold text-neutral-900">
                      {templateDef.title}
                    </span>
                    .
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700">
                      Template: {templateDef.title}
                    </span>
                    <span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700">
                      {designPresets.length} Design Presets
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-3">
                  <Link
                    href="/templates"
                    className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                  >
                    Back to Templates
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {designPresets.length > 0 ? (
          <>
            <div className="mb-5 flex flex-wrap gap-2">
              {designPresets.map((preset) => (
                <span
                  key={preset.key}
                  className={[
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                    badgeClassName(preset.badge),
                  ].join(" ")}
                >
                  {preset.label}
                </span>
              ))}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {designPresets.map((preset) => (
                <DesignCard
                  key={preset.key}
                  templateKey={templateKey}
                  designKey={preset.key}
                  label={preset.label}
                  description={preset.description}
                  backgroundImage={preset.backgroundImage}
                  previewDraft={preset.previewDraft}
                  isRecommended={preset.badge === "Recommended"}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-[24px] border border-dashed border-neutral-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-neutral-900">
              No new design layouts available yet
            </h2>
            <p className="mt-3 text-sm text-neutral-600">
              This template has not been migrated into the new metadata-driven
              layout preset system yet.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}