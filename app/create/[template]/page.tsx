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
    <main className="mx-auto w-full max-w-7xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Create {templateDef.title || "Microsite"}
        </h1>

        <p className="mt-2 text-sm text-neutral-600">
          Design preset: {designKey}
        </p>
      </div>

      <TemplateDraftEditor
        templateKey={templateKey}
        designKey={designKey}
        initialDraft={initialDraft}
        submitLabel="Continue"
      />
    </main>
  );
}