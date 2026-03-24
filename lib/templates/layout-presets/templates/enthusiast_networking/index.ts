import type { TemplateLayoutRegistry } from "../../types";
import meetup from "./meetup";
import showcase from "./showcase";

const enthusiastnetworkingLayouts: TemplateLayoutRegistry = {
  templateKey: "enthusiast_networking",
  layouts: [meetup, showcase],
};


export default enthusiastnetworkingLayouts;