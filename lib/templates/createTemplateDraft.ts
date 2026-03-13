import type { BuilderDraft } from "@/lib/templates/builder";
import type { DesignPresetLayout } from "@/lib/templates/designPresets";

import { TEMPLATE_DESIGN_OVERLAY_CONTENT } from "@/lib/templates/templateDesignOverlayContent";
import { normalizeTemplateName } from "@/lib/templates/normalizeTemplateName";

export function createTemplateDraft(
  templateName: string,
  designLayout: DesignPresetLayout,
): BuilderDraft {

  const normalized = normalizeTemplateName(templateName);

  const templateContent =
    TEMPLATE_DESIGN_OVERLAY_CONTENT[normalized]?.[designLayout];

  const title =
    typeof templateContent?.title === "string"
      ? templateContent.title
      : "";

  const description =
    typeof templateContent?.description === "string"
      ? templateContent.description
      : "";

  return {
    slugSuggestion: normalized,

    title,
    subtitle: "",
    subtext: "",
    description,

    titleStyle: undefined,
    subtitleStyle: undefined,
    subtextStyle: undefined,
    descriptionStyle: undefined,

    pageBackground: "",
    blocks: [],
  };
}