import type { TemplateLayoutRegistry } from "../../types";
import roll from "./roll";

const gameNightLayouts: TemplateLayoutRegistry = {
  templateKey: "game_night",
  layouts: [roll],
};

export default gameNightLayouts;