import type { TemplateLayoutRegistry } from "../../types";
import subtle from "./subtle";
import classic from "./classic";
import golden from "./golden";
import evergreen from "./evergreen";
import modern from "./modern";

const weddingLayouts: TemplateLayoutRegistry = {
  templateKey: "wedding_rsvp",
  layouts: [subtle, evergreen, golden, modern, classic],
};


export default weddingLayouts;