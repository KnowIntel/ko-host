import type { TemplateLayoutRegistry } from "../../types";
// import minimal from "./minimal";
import playful from "./playful";
import grown from "./grown";

const birthdayLayouts: TemplateLayoutRegistry = {
  templateKey: "birthday_party",
  layouts: [playful, grown],
};


export default birthdayLayouts;