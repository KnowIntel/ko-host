import type { TemplateLayoutRegistry } from "../../types";
import heart from "./heart";
import elaborate from "./elaborate";

const crowdfundingLayouts: TemplateLayoutRegistry = {
  templateKey: "crowdfunding_campaign",
  layouts: [heart, elaborate],
};

export default crowdfundingLayouts;