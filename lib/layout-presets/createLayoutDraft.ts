import type { BuilderDraft } from "@/lib/templates/builder";
import type { DesignPresetLayout } from "@/lib/templates/designPresets";
import { createTemplateDraft } from "@/lib/templates/createTemplateDraft";

export function createLayoutDraft(
  templateName: string,
  designLayout: DesignPresetLayout,
): BuilderDraft {
  return createTemplateDraft(templateName, designLayout);
}