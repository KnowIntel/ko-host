import type { TemplateLayoutRegistry } from "../../types";

import spotlight from "./spotlight";

const graduationLayouts: TemplateLayoutRegistry = {
  templateKey: "graduation",
  layouts: [spotlight],
}

export default graduationLayouts;