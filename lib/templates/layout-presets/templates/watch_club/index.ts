import type { TemplateLayoutRegistry } from "../../types";
import dunder from "./dunder";
import hangout from "./hangout";

const watchClubLayouts: TemplateLayoutRegistry = {
  templateKey: "watch_club",
  layouts: [dunder, hangout],
};

export default watchClubLayouts;