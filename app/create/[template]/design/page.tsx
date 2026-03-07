import { DESIGN_PRESETS } from "@/lib/design-presets/designRegistry";
import DesignCard from "@/components/designs/DesignCard";
import {
  TEMPLATE_DEFS,
  getTemplateDef,
  normalizeTemplateKey,
} from "@/lib/templates/registry";

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

export default async function DesignSelectionPage({
  params,
}: {
  params: Promise<{ template: string }>;
}) {
  const { template } = await params;
  const templateDef = resolveTemplateFromRoute(template);
  const templateKey = templateDef.key;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Choose a design</h1>
      <p className="mb-8 text-sm text-neutral-600">
        Template: {templateDef.title}
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {DESIGN_PRESETS.map((design) => (
          <DesignCard
            key={design.key}
            templateKey={templateKey}
            designKey={design.key}
            label={design.label}
            image={`/designs/${design.key}.png`}
          />
        ))}
      </div>
    </main>
  );
}