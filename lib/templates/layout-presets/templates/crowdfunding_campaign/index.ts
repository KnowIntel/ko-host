import type { TemplateLayoutRegistry } from "../../types";
import elaborate from "./elaborate";

const crowdfundingLayouts: TemplateLayoutRegistry = {
  templateKey: "crowdfunding_campaign",
  layouts: [elaborate],
};

export default crowdfundingLayouts;