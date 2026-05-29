import type { TemplateLayoutRegistry } from "../../types";
import adventure from "./adventure";

const liveEntertainmentLayouts: TemplateLayoutRegistry = {
  templateKey: "live_entertainment",
  layouts: [adventure],
};

export default liveEntertainmentLayouts;