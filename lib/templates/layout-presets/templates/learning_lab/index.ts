import type { TemplateLayoutRegistry } from "../../types";
import algebra from "./algebra";
import foundations from "./foundations";
import atomic from "./atomic";
import literary from "./literary";

const learningLabLayouts: TemplateLayoutRegistry = {
  templateKey: "learning_lab",
  layouts: [atomic, foundations, algebra, literary],
};

export default learningLabLayouts;