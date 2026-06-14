import type { TemplateLayoutRegistry } from "../../types";
import forever from "./forever";
import perfect from "./perfect";

const engagementAnnouncementLayouts: TemplateLayoutRegistry = {
  templateKey: "engagement_announcement",
  layouts: [forever, perfect],
};

export default engagementAnnouncementLayouts;