import type { TemplateLayoutRegistry } from "../../types";
import worksheet from "./worksheet";

const learningLabLayouts: TemplateLayoutRegistry = {
  templateKey: "learning_lab",
  layouts: [worksheet],
};

export default learningLabLayouts;