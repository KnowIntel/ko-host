import Link from "next/link";
import { getDesignPresets } from "@/lib/design-presets/designRegistry";
import {
  TEMPLATE_DEFS,
  getTemplateDef,
  normalizeTemplateKey,
} from "@/lib/templates/registry";
import DesignCard from "@/components/designs/DesignCard";

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

function sortDesignPresets<
  T extends { key: string; badge?: "Popular" | "New" | "Recommended" | null }
>(presets: T[]) {
  return [...presets].sort((a, b) => {
    const aRecommended = a.badge === "Recommended" ? 1 : 0;
    const bRecommended = b.badge === "Recommended" ? 1 : 0;

    if (aRecommended !== bRecommended) {
      return bRecommended - aRecommended;
    }

    const aBlank = a.key === "blank" ? 1 : 0;
    const bBlank = b.key === "blank" ? 1 : 0;

    if (aBlank !== bBlank) {
      return aBlank - bBlank;
    }

    return 0;
  });
}

export default async function CreateTemplateDesignPage({
  params,
}: {
  params: Promise<{ template: string }>;
}) {
  const { template } = await params;
  const templateDef = resolveTemplateFromRoute(template);
  const templateKey = templateDef.key;

  const designPresets = sortDesignPresets(getDesignPresets());

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.06),_transparent_28%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)]">
      <div className="mx-auto w-full max-w-7xl px-4 py-10">
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
                    Choose a Design Preset
                  </h1>

                  <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-600 sm:text-[15px]">
                    Select the visual layout for{" "}
                    <span className="font-semibold text-neutral-900">
                      {templateDef.title}
                    </span>
                    . The content structure comes from the template, while the design
                    preset controls the overall look and layout.
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

                  <Link
                    href={`/create/${encodeURIComponent(templateKey)}?design=blank`}
                    className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                  >
                    Skip to Blank
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

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
              image={preset.previewImagePath}
              isRecommended={preset.badge === "Recommended"}
            />
          ))}
        </div>
      </div>
    </main>
  );
}