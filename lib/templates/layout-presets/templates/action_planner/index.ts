import type { TemplateLayoutRegistry } from "../../types";
import workout from "./workout";

const actionPlannerLayouts: TemplateLayoutRegistry = {
  templateKey: "action_planner",
  layouts: [workout],
};

export default actionPlannerLayouts;