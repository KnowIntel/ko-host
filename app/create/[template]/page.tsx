import Link from "next/link";
import { getDesignPreset } from "@/lib/design-presets/designRegistry";
import { createLayoutDraft } from "@/lib/layout-presets/createLayoutDraft";
import {
  TEMPLATE_DEFS,
  getTemplateDef,
  normalizeTemplateKey,
} from "@/lib/templates/registry";
import TemplateDraftEditor from "@/components/templates/TemplateDraftEditor";

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
  if (badge === "Popular") {
    return "bg-neutral-950 text-white";
  }

  if (badge === "New") {
    return "bg-cyan-700 text-white";
  }

  if (badge === "Recommended") {
    return "bg-emerald-700 text-white";
  }

  return "bg-neutral-200 text-neutral-800";
}

export default async function CreateTemplatePage({
  params,
  searchParams,
}: {
  params: Promise<{ template: string }>;
  searchParams: Promise<{ design?: string }>;
}) {
  const { template } = await params;
  const { design } = await searchParams;

  const templateDef = resolveTemplateFromRoute(template);
  const templateKey = templateDef.key;
  const designKey = design || "blank";
  const designPreset = getDesignPreset(designKey);

  const preset = createLayoutDraft(templateKey, designKey);

  const initialDraft = {
    ...preset,
    title: templateDef.defaultDraft?.title || templateDef.title || "",
    slugSuggestion:
      preset.slugSuggestion ||
      templateDef.defaultDraft?.slugSuggestion ||
      "",
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.06),_transparent_28%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)]">
      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        <div className="mb-8 overflow-hidden rounded-[30px] border border-neutral-200 bg-white shadow-sm">
          <div className="relative px-6 py-8 sm:px-8 sm:py-9">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-violet-100/40 via-sky-100/30 to-emerald-100/40" />

            <div className="relative">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
                  Step 2 of 2
                </span>

                {designPreset.badge ? (
                  <span
                    className={[
                      "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold",
                      badgeClassName(designPreset.badge),
                    ].join(" ")}
                  >
                    {designPreset.badge}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
                    Create {templateDef.title || "Microsite"}
                  </h1>

                  <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-600 sm:text-[15px]">
                    You selected <span className="font-semibold text-neutral-900">{designPreset.label}</span>.
                    Now customize the content, blocks, and layout for your page.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700">
                      Template: {templateDef.title}
                    </span>
                    <span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700">
                      Design: {designPreset.label}
                    </span>
                    <span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700">
                      {designPreset.tone}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <Link
                    href={`/create/${encodeURIComponent(templateKey)}/design`}
                    className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                  >
                    Change design
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <TemplateDraftEditor
          templateKey={templateKey}
          designKey={designKey}
          initialDraft={initialDraft}
          submitLabel="Continue"
        />
      </div>
    </main>
  );
}