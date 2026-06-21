import type { TemplateLayoutRegistry } from "../../types";
import repair from "./repair";

const serviceAdLayouts: TemplateLayoutRegistry = {
  templateKey: "service_ad",
  layouts: [repair],
};

export default serviceAdLayouts;