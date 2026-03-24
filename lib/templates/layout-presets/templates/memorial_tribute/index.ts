import type { TemplateLayoutRegistry } from "../../types";
import elegant from "./elegant";
import soft from "./soft";
import photo from "./photo";

const memorial_tributeLayouts: TemplateLayoutRegistry = {
  templateKey: "memorial_tribute",
  layouts: [elegant, soft, photo],
};


export default memorial_tributeLayouts;
