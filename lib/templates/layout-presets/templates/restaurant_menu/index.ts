import type { TemplateLayoutRegistry } from "../../types";
import hometown from "./hometown";
import deluxe from "./deluxe";

const restaurantMenuLayouts: TemplateLayoutRegistry = {
  templateKey: "restaurant_menu",
  layouts: [hometown, deluxe],
};

export default restaurantMenuLayouts;