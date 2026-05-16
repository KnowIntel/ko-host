import type { TemplateLayoutRegistry } from "../../types";
import classic from "./classic";
import modern from "./modern";
import subtle from "./subtle";

const weddingLayouts: TemplateLayoutRegistry = {
  templateKey: "wedding_rsvp",
  layouts: [classic, modern, subtle],
};


export default weddingLayouts;