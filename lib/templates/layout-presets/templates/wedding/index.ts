import type { TemplateLayoutRegistry } from "../../types";
import classic from "./classic";
import evergreen from "./evergreen";
import modern from "./modern";
import subtle from "./subtle";

const weddingLayouts: TemplateLayoutRegistry = {
  templateKey: "wedding_rsvp",
  layouts: [classic, modern, subtle, evergreen],
};


export default weddingLayouts;