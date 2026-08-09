import type { TemplateLayoutRegistry } from "../../types";
import bachelor from "./bachelor";

const partyTimeLayouts: TemplateLayoutRegistry = {
  templateKey: "party_time",
  layouts: [bachelor],
};

export default partyTimeLayouts;