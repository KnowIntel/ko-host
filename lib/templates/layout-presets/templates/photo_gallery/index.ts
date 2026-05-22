import type { TemplateLayoutRegistry } from "../../types";
import escape from "./escape";

const photoGalleryLayouts: TemplateLayoutRegistry = {
  templateKey: "photo_gallery",
  layouts: [escape],
};

export default photoGalleryLayouts;