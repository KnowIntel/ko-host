import type { TemplateLayoutRegistry } from "../../types";
import city from "./city";

const electionCampaignLayouts: TemplateLayoutRegistry = {
  templateKey: "election_campaign",
  layouts: [city],
};

export default electionCampaignLayouts;