import type { TemplateLayoutRegistry } from "../../types";
import timeless from "./timeless";

const memoryTimelineLayouts: TemplateLayoutRegistry = {
  templateKey: "memory_timeline",
  layouts: [timeless],
};

export default memoryTimelineLayouts;