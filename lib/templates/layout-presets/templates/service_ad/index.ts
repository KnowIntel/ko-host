import type { TemplateLayoutRegistry } from "../../types";
import repair from "./repair";
import vibes from "./vibes";

const serviceAdLayouts: TemplateLayoutRegistry = {
  templateKey: "service_ad",
  layouts: [repair, vibes],
};

export default serviceAdLayouts;