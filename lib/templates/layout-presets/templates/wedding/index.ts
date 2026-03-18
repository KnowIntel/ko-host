import type { TemplateLayoutRegistry } from "../../types";
import classic from "./classic";
import modern from "./modern";

const weddingLayouts: TemplateLayoutRegistry = {
  templateKey: "wedding_rsvp",
  layouts: [classic, modern],
};


export default weddingLayouts;