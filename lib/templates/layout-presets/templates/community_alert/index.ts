// lib/templates/layout-presets/templates/community_alert/index.ts

import type { TemplateLayoutRegistry } from "../../types";

import newsletter from "./newsletter";

const communityAlertLayouts: TemplateLayoutRegistry = {
  templateKey: "community_alert",
  layouts: [newsletter],
};

export default communityAlertLayouts;