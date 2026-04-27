import type { BuilderDraft } from "@/lib/templates/builder";
import type { DesignPresetLayout } from "@/lib/templates/designPresets";

import { TEMPLATE_DESIGN_OVERLAY_CONTENT } from "@/lib/templates/templateDesignOverlayContent";
import { normalizeTemplateName } from "@/lib/templates/normalizeTemplateName";

function readStringField(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function createTemplateDraft(
  templateName: string,
  designLayout: DesignPresetLayout | string,
): BuilderDraft {
  const normalized = normalizeTemplateName(templateName);

  const draft: BuilderDraft = {
    slugSuggestion: normalized,

    title: "",
    subtitle: "",
    subtext: "",
    description: "",

    titleStyle: undefined,
    subtitleStyle: undefined,
    subtextStyle: undefined,
    descriptionStyle: undefined,

    pageBackground: "",
    blocks: [],
  };

  return draft;
}

export const createLayoutDraft = createTemplateDraft;

export default createTemplateDraft;