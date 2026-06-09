import type { TemplateLayoutRegistry } from "../../types";
import community from "./community";

const meetAndGreetLayouts: TemplateLayoutRegistry = {
  templateKey: "meet_and_greet",
  layouts: [community],
};

export default meetAndGreetLayouts;