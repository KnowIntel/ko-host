import type { TemplateLayoutRegistry } from "../../types";
import algebra from "./algebra";
import foundations from "./foundations";
import spelling from "./spelling";
import atomic from "./atomic";
import literary from "./literary";

const learningLabLayouts: TemplateLayoutRegistry = {
  templateKey: "learning_lab",
  layouts: [atomic, foundations, spelling, algebra, literary],
};

export default learningLabLayouts;