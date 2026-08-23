import type { TemplateLayoutRegistry } from "../../types";

import repair from "./repair";
import clear from "./clear";
import vibes from "./vibes";

const localClassifiedAdLayouts: TemplateLayoutRegistry = {
  templateKey: "local_classified_ad",

  layouts: [
    repair,
    clear,
    vibes,
  ],
};

export default localClassifiedAdLayouts;