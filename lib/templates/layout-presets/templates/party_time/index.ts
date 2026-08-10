import type { TemplateLayoutRegistry } from "../../types";
import bachelor from "./bachelor";
import bachelorette from "./bachelorette";

const partyTimeLayouts: TemplateLayoutRegistry = {
  templateKey: "party_time",
  layouts: [bachelor, bachelorette],
};

export default partyTimeLayouts;