import type { TemplateLayoutRegistry } from "../../types";

import spotlight from "./spotlight";
import prestige from "./prestige";

const graduationLayouts: TemplateLayoutRegistry = {
  templateKey: "graduation",
  layouts: [spotlight, prestige],
}

export default graduationLayouts;