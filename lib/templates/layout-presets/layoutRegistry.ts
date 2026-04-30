import type { TemplateLayoutRegistry } from "./types";
import weddingLayouts from "./templates/wedding";
import babyShowerLayouts from "./templates/baby_shower";
import memorial_tributeLayouts from "./templates/memorial_tribute";
import enthusiast_networking from "./templates/enthusiast_networking";
import birthdayLayouts from "./templates/birthday";
import reunionLayouts from "./templates/reunion";
import roastLayouts from "./templates/roast_session";
import open_houseLayouts from "./templates/open_house";
import productLaunchLayouts from "./templates/product_launch";
import crowdfundingLayouts from "./templates/crowdfunding_campaign";
import betaTestingLayouts from "./templates/beta_testing";
import blankLayout from "./layouts/blank";

const registry: Record<string, TemplateLayoutRegistry> = {
  wedding_rsvp: weddingLayouts,
  baby_shower: babyShowerLayouts,
  memorial_tribute: memorial_tributeLayouts,
  enthusiast_networking: enthusiast_networking,
  birthday_party: birthdayLayouts,
  family_reunion: reunionLayouts,
  open_house: open_houseLayouts,
  roast_session: roastLayouts,
  product_launch: productLaunchLayouts,
  crowdfunding_campaign: crowdfundingLayouts,
  beta_testing: betaTestingLayouts,
};


function withStandardLayouts(
  template: TemplateLayoutRegistry,
): TemplateLayoutRegistry {
  const filtered = template.layouts.filter(
    (layout) =>
      layout.designKey !== "blank" &&
      layout.designKey !== "photo" // ← ADD THIS LINE
  );

  return {
    ...template,
    layouts: [...filtered, blankLayout],
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