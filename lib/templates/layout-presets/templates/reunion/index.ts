import type { TemplateLayoutRegistry } from "../../types";
import elegant from "./elegant";
import playful from "./playful";

const babyshowerLayouts: TemplateLayoutRegistry = {
  templateKey: "baby_shower",
  layouts: [elegant, playful],
};


export default babyshowerLayouts;