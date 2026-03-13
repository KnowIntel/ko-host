import Link from "next/link";
import { getDesignPreset } from "@/lib/design-presets/designRegistry";
import { createLayoutDraft } from "@/lib/layout-presets/createLayoutDraft";
import {
  TEMPLATE_DEFS,
  getTemplateDef,
  normalizeTemplateKey,
} from "@/lib/templates/registry";
import TemplateDraftEditor from "@/components/templates/TemplateDraftEditor";
import type { BuilderDraft } from "@/lib/templates/builder";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  const templateName = templateDef.title || templateKey;

  const requestedDesignKey = normalizeTemplateKey(design || "blank");
  const designPreset = getDesignPreset(requestedDesignKey);
  const designKey = designPreset.key;

  const presetDraft = createLayoutDraft({
    templateName,
    presetId: designKey,
    existingDraft: {
      slugSuggestion: templateDef.defaultDraft?.slugSuggestion || "",
    },
  });

  const initialDraft: BuilderDraft = {
    ...presetDraft,
    slugSuggestion:
      presetDraft.slugSuggestion ||
      templateDef.defaultDraft?.slugSuggestion ||
      "",
    blocks: Array.isArray(presetDraft.blocks) ? presetDraft.blocks : [],
  } as BuilderDraft;

  const editorInstanceKey = [
    templateKey,
    designKey,
    initialDraft.title || "",
    initialDraft.subtitle || "",
    initialDraft.description || "",
    initialDraft.blocks.length,
    initialDraft.blocks.map((block) => `${block.type}:${block.id}`).join("|"),
  ].join("::");

  return (
    <main className="min-h-screen bg-[#f6f4f2]">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm">
          <div className="relative px-6 py-7 sm:px-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-rose-100/35 via-stone-100/30 to-amber-100/35" />

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
                    You selected{" "}
                    <span className="font-semibold text-neutral-900">
                      {designPreset.label}
                    </span>
                    . Customize the layout visually using the left toolbox and
                    live page canvas.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700">
                      Template: {templateDef.title}
                    </span>
                    <span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700">
                      Design: {designPreset.label}
                    </span>
                    <span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700">
                      Editor
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-3">
                  <Link
                    href="/preview/draft"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                  >
                    Open Preview
                  </Link>

                  <Link
                    href={`/create/${encodeURIComponent(templateKey)}/design`}
                    className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                  >
                    Change Design
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <TemplateDraftEditor
          key={editorInstanceKey}
          templateName={templateName}
          designLayout={designKey}
          initialDraft={initialDraft}
        />
      </div>
    </main>
  );
}