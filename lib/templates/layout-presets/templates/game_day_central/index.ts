import type { TemplateLayoutRegistry } from "../../types";
import championship from "./championship";

const gameDayCentralLayouts: TemplateLayoutRegistry = {
  templateKey: "game_day_central",
  layouts: [championship],
};

export default gameDayCentralLayouts;