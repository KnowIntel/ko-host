import type { TemplateLayoutRegistry } from "../../types";
import caffeine from "./caffeine";

const projectLayouts: TemplateLayoutRegistry = {
  templateKey: "project",
  layouts: [caffeine],
};

export default projectLayouts;