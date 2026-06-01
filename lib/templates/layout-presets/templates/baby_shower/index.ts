import type { TemplateLayoutRegistry } from "../../types";
import elegant from "./elegant";
import playful from "./playful";
import treasure from "./treasure";

const babyshowerLayouts: TemplateLayoutRegistry = {
  templateKey: "baby_shower",
  layouts: [treasure, elegant, playful],
};


export default babyshowerLayouts;