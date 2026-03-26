import type { BuilderDraft } from "@/lib/templates/builder";
import weddingClassicDraft from "@/drafts/wedding/classic.draft";
import weddingModernDraft from "@/drafts/wedding/modern.draft";
import reunionElegantDraft from "@/drafts/reunion/elegant.draft";

const DRAFT_PRESETS: Record<string, BuilderDraft> = {
  "wedding_rsvp:classic": weddingClassicDraft,
  "wedding_rsvp:modern": weddingModernDraft,
  "family_reunion:elegant": reunionElegantDraft,
};

function normalizeDraftKeyPart(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

export function loadTemplateDraftPreset(
  templateKey: string,
  designKey: string,
): BuilderDraft | null {
  const key = `${normalizeDraftKeyPart(templateKey)}:${normalizeDraftKeyPart(designKey)}`;
  return DRAFT_PRESETS[key] ?? null;
}

export function hasTemplateDraftPreset(
  templateKey: string,
  designKey: string,
): boolean {
  return loadTemplateDraftPreset(templateKey, designKey) !== null;
}

export function listTemplateDraftPresetKeys(): string[] {
  return Object.keys(DRAFT_PRESETS);
}