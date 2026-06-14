import type { TemplateLayoutRegistry } from "../../types";
import forever from "./forever";

const engagementAnnouncementLayouts: TemplateLayoutRegistry = {
  templateKey: "engagement_announcement",
  layouts: [forever],
};

export default engagementAnnouncementLayouts;