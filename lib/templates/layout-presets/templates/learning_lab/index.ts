import type { TemplateLayoutRegistry } from "../../types";
import algebra from "./algebra";
import atomic from "./atomic";
import literary from "./literary";

const learningLabLayouts: TemplateLayoutRegistry = {
  templateKey: "learning_lab",
  layouts: [atomic, algebra, literary],
};

export default learningLabLayouts;