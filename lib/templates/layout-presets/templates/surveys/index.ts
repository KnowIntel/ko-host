import type { TemplateLayoutRegistry } from "../../types";
import movie from "./movie";
import truth from "./truth";
import series from "./series";

const surveysLayouts: TemplateLayoutRegistry = {
  templateKey: "surveys",
  layouts: [movie, truth, series],
};

export default surveysLayouts;