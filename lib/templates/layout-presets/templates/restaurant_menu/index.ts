import type { TemplateLayoutRegistry } from "../../types";
import deluxe from "./deluxe";
import hometown from "./hometown";

const restaurantMenuLayouts: TemplateLayoutRegistry = {
  templateKey: "restaurant_menu",
  layouts: [deluxe, hometown],
};

export default restaurantMenuLayouts;