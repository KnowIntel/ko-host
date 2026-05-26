import type { TemplateLayoutRegistry } from "../../types";

import canvas from "./canvas";
import studio from "./studio";
import digital from "./digital";

const creatorLinkHubLayouts: TemplateLayoutRegistry = {
  templateKey: "creator_link_hub",

  layouts: [
    canvas,
    studio,
    digital,
  ],
};

export default creatorLinkHubLayouts;