import type { TemplateLayoutRegistry } from "./types";
import weddingLayouts from "./templates/wedding";
import babyShowerLayouts from "./templates/baby_shower";
import blankLayout from "./layouts/blank";

const registry: Record<string, TemplateLayoutRegistry> = {
  wedding_rsvp: weddingLayouts,
  baby_shower: babyShowerLayouts,
};

function withStandardLayouts(
  template: TemplateLayoutRegistry,
): TemplateLayoutRegistry {
  const withoutBlank = template.layouts.filter(
    (layout) => layout.designKey !== "blank",
  );

  return {
    ...template,
    layouts: [...withoutBlank, blankLayout],
  };
}

function createFallbackTemplateRegistry(
  templateKey: string,
): TemplateLayoutRegistry {
  return {
    templateKey,
    layouts: [blankLayout],
  };
}

export function getTemplateLayoutRegistry(
  templateKey: string,
): TemplateLayoutRegistry | null {
  const template =
    registry[templateKey] ?? createFallbackTemplateRegistry(templateKey);

  return withStandardLayouts(template);
}

export function getTemplateLayouts(templateKey: string) {
  return getTemplateLayoutRegistry(templateKey)?.layouts ?? null;
}

export function getRecommendedLayout(templateKey: string) {
  const layouts = getTemplateLayoutRegistry(templateKey)?.layouts ?? null;
  if (!layouts?.length) return null;

  return layouts.find((l) => l.recommended) ?? layouts[0] ?? null;
}