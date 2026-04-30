import type { TemplateLayoutRegistry } from "../../types";
import direct from "./direct";
import showcase from "./showcase";

const enthusiastnetworkingLayouts: TemplateLayoutRegistry = {
  templateKey: "enthusiast_networking",
  layouts: [direct, showcase],
};


export default enthusiastnetworkingLayouts;