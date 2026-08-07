import type { TemplateLayoutRegistry } from "../../types";
import comfort from "./comfort";

const productShowcaseLayouts: TemplateLayoutRegistry = {
  templateKey: "product_showcase",
  layouts: [comfort],
};

export default productShowcaseLayouts;