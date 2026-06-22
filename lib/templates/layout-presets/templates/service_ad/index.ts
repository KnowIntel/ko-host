import type { TemplateLayoutRegistry } from "../../types";
import repair from "./repair";
import vibes from "./vibes";
import clear from "./clear";

const serviceAdLayouts: TemplateLayoutRegistry = {
  templateKey: "service_ad",
  layouts: [repair, clear, vibes],
};

export default serviceAdLayouts;