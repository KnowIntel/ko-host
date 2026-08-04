import type { TemplateLayoutRegistry } from "../../types";
import bible from "./bible";

const bookClubLayouts: TemplateLayoutRegistry = {
  templateKey: "book_club",
  layouts: [bible],
};

export default bookClubLayouts;