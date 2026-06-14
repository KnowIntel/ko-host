import type { TemplateLayoutRegistry } from "../../types";
import worksheet from "./worksheet";
import atomic from "./atomic";
import literary from "./literary";

const learningLabLayouts: TemplateLayoutRegistry = {
  templateKey: "learning_lab",
  layouts: [atomic, worksheet, literary],
};

export default learningLabLayouts;