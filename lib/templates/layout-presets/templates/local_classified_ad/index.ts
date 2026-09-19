import type { TemplateLayoutRegistry } from "../../types";

import repair from "./repair";
import clear from "./clear";
import vibes from "./vibes";
import dog from "./dog";

const localClassifiedAdLayouts: TemplateLayoutRegistry = {
  templateKey: "local_classified_ad",

  layouts: [
    repair,
    clear,
    vibes,
    dog,
  ],
};

export default localClassifiedAdLayouts;