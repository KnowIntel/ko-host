import type { TemplateLayoutRegistry } from "../../types";
import casual from "./casual";
import warm from "./warm";

const reunionLayouts: TemplateLayoutRegistry = {
  templateKey: "family_reunion",
  layouts: [warm, casual],
};


export default reunionLayouts;