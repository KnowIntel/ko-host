export const PRESET_MICROSITE_URLS: Record<string, string> = {
  "baby_shower:playful": "baby-shower-playful-preview",
  "baby_shower:elegant": "baby-shower-elegant-preview",

  "birthday:playful": "birthday-playful-preview",
  "birthday:grown": "birthday-grown-preview",

  "wedding:classic": "wedding-classic-preview",
  "wedding:modern": "wedding-modern-preview",
};

export function getPresetMicrositeSlug(templateKey: string, designKey: string) {
  return PRESET_MICROSITE_URLS[`${templateKey}:${designKey}`] || "";
}

export function getPresetPageUrl(
  templateKey: string,
  designKey: string,
  pageSlug = "home",
) {
  const micrositeSlug = getPresetMicrositeSlug(templateKey, designKey);

  if (!micrositeSlug) return "";

  return pageSlug && pageSlug !== "home"
    ? `/s/${micrositeSlug}/${pageSlug}`
    : `/s/${micrositeSlug}`;
}