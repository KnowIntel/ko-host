// lib\templates\layout-presets\layoutRegistry.ts

import type { TemplateLayoutRegistry } from "./types";
import weddingLayouts from "./templates/wedding";
import babyShowerLayouts from "./templates/baby_shower";
import memorial_tributeLayouts from "./templates/memorial_tribute";
import enthusiastLayouts from "./templates/enthusiast_networking";
import birthdayLayouts from "./templates/birthday";
import reunionLayouts from "./templates/reunion";
import roastLayouts from "./templates/roast_session";
import property_listingLayouts from "./templates/property_listing";
import productLaunchLayouts from "./templates/product_launch";
import crowdfundingLayouts from "./templates/crowdfunding_campaign";
import resumeprofileLayouts from "./templates/resume_profile";
import betaTestingLayouts from "./templates/beta_testing";
import restaurantLayouts from "./templates/restaurant_menu";
import sweepstakesLayouts from "./templates/sweepstakes";
import learningLayouts from "./templates/learning_lab";
import forLayouts from "./templates/for_sale_by_owner";
import communityLayouts from "./templates/community_alert";
import churchLayouts from "./templates/church_event";
import graduationLayouts from "./templates/graduation";
import petLayouts from "./templates/pet_adoption";
import memoryLayouts from "./templates/memory_timeline";
import photoLayouts from "./templates/photo_gallery";
import creatorLayouts from "./templates/creator_link_hub";
import guidedLayouts from "./templates/guided_tutorial";
import electionLayouts from "./templates/election_campaign";
import liveLayouts from "./templates/live_entertainment";
import watchLayouts from "./templates/watch_club";
import meetLayouts from "./templates/meet_and_greet";
import gameLayouts from "./templates/game_day_central";
import engagementLayouts from "./templates/engagement_announcement";
import serviceLayouts from "./templates/service_ad";


import blankLayout from "./layouts/blank";

const registry: Record<string, TemplateLayoutRegistry> = {
  wedding_rsvp: weddingLayouts,
  baby_shower: babyShowerLayouts,
  memorial_tribute: memorial_tributeLayouts,
  enthusiast_networking: enthusiastLayouts,
  birthday_party: birthdayLayouts,
  family_reunion: reunionLayouts,
  property_listing: property_listingLayouts,
  roast_session: roastLayouts,
  product_launch: productLaunchLayouts,
  crowdfunding_campaign: crowdfundingLayouts,
  resume_profile: resumeprofileLayouts,
  beta_testing: betaTestingLayouts,
  restaurant_menu: restaurantLayouts,
  sweepstakes: sweepstakesLayouts,
  learning_lab: learningLayouts,
  for_sale_by_owner: forLayouts,
  community_alert: communityLayouts,
  church_event: churchLayouts,
  graduation: graduationLayouts,
  pet_adoption: petLayouts,
  memory_timeline: memoryLayouts,
  photo_gallery: photoLayouts,
  creator_link_hub: creatorLayouts,
  guided_tutorial: guidedLayouts,
  election_campaign: electionLayouts,
  live_entertainment: liveLayouts,
  watch_club: watchLayouts,
  meet_and_greet: meetLayouts,
  game_day_central: gameLayouts,
  engagement_announcement: engagementLayouts,
  service_ad: serviceLayouts,

  
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