import type { BuilderDraft } from "@/lib/templates/builder";
import type { DesignPresetLayout } from "@/lib/templates/designPresets";
import { createTemplateDraft } from "@/lib/templates/createTemplateDraft";

function normalizePresetId(
  value: string | null | undefined,
): DesignPresetLayout {
  if (value === "blank") return "blank";
  if (value === "modern") return "modern";
  if (value === "elegant") return "elegant";
  if (value === "business" || value === "classic") return "business";
  if (value === "festive" || value === "gallery") return "festive";
  if (value === "showcase") return "showcase";
  return "showcase";
}

export function createLayoutDraft(params: {
  presetId?: string | null;
  templateName?: string | null;
  existingDraft?: Partial<BuilderDraft> | null;
}): BuilderDraft {
  const presetId = normalizePresetId(params.presetId);
  const templateName = params.templateName ?? "";

  return createTemplateDraft({
    presetId,
    templateName,
    existingDraft: params.existingDraft ?? null,
  });
}