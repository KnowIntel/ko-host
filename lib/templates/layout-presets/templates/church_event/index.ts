// lib/templates/layout-presets/templates/church_event/index.ts

import type { TemplateLayoutRegistry } from "../../types";

import easter from "./easter";

const churchEventLayouts: TemplateLayoutRegistry = {
  templateKey: "church_event",
  layouts: [easter],
};

export default churchEventLayouts;