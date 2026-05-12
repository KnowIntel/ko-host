import type { TemplateLayoutRegistry } from "../../types";
import welcome from "./welcome";

const petAdoptionLayouts: TemplateLayoutRegistry = {
  templateKey: "pet_adoption",
  layouts: [welcome],
};

export default petAdoptionLayouts;