import type { TemplateLayoutRegistry } from "../../types";
import movie from "./movie";

const surveysLayouts: TemplateLayoutRegistry = {
  templateKey: "surveys",
  layouts: [movie],
};

export default surveysLayouts;