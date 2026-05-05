import type { TemplateLayoutRegistry } from "../../types";
import inclusive from "./inclusive";

const sweepstakesLayouts: TemplateLayoutRegistry = {
  templateKey: "sweepstakes",
  layouts: [inclusive],
};

export default sweepstakesLayouts;