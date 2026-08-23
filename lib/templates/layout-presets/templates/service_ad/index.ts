import type { TemplateLayoutRegistry } from "../../types";

import repair from "../local_classified_ad/repair";
import clear from "../local_classified_ad/clear";
import vibes from "../local_classified_ad/vibes";

const serviceAdLayouts: TemplateLayoutRegistry = {
  templateKey: "service_ad",

  layouts: [
    repair,
    clear,
    vibes,
  ],
};

export default serviceAdLayouts;