import type { TemplateLayoutRegistry } from "../../types";
import worksheet from "./worksheet";
import atomic from "./atomic";

const learningLabLayouts: TemplateLayoutRegistry = {
  templateKey: "learning_lab",
  layouts: [atomic, worksheet],
};

export default learningLabLayouts;