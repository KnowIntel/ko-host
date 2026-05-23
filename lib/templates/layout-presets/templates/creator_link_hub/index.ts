import type { TemplateLayoutRegistry } from "../../types";

import canvas from "./canvas";
import studio from "./studio";

const creatorLinkHubLayouts: TemplateLayoutRegistry = {
  templateKey: "creator_link_hub",

  layouts: [
    canvas,
    studio,
  ],
};

export default creatorLinkHubLayouts;