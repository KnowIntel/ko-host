import type { TemplateLayoutRegistry } from "../../types";
import subtle from "./subtle";
import classic from "./classic";
import evergreen from "./evergreen";
import modern from "./modern";

const weddingLayouts: TemplateLayoutRegistry = {
  templateKey: "wedding_rsvp",
  layouts: [subtle, evergreen, modern, classic],
};


export default weddingLayouts;