import type { TemplateLayoutRegistry } from "../../types";
import movie from "./movie";
import truth from "./truth";

const surveysLayouts: TemplateLayoutRegistry = {
  templateKey: "surveys",
  layouts: [movie, truth],
};

export default surveysLayouts;