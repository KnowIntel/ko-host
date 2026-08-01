import type { TemplateLayoutRegistry } from "../../types";
// import minimal from "./minimal";
import golden from "./golden";
import blast from "./blast";
import playful from "./playful";
import grown from "./grown";

const birthdayLayouts: TemplateLayoutRegistry = {
  templateKey: "birthday_party",
  layouts: [golden, blast, playful, grown],
};


export default birthdayLayouts;