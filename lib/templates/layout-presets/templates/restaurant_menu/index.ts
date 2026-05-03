import type { TemplateLayoutRegistry } from "../../types";
import deluxe from "./deluxe";

const restaurantMenuLayouts: TemplateLayoutRegistry = {
  templateKey: "restaurant_menu",
  layouts: [deluxe],
};

export default restaurantMenuLayouts;