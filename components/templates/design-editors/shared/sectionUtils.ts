import type { MicrositeBlock } from "@/lib/templates/builder";
import type { SectionContainer } from "./sectionTypes";

export function createSection(title = "New Section"): SectionContainer {
  return {
    id: `section_${Math.random().toString(36).slice(2, 10)}`,
    title,
    blocks: [],
  };
}

export function addBlockToSection(
  sections: SectionContainer[],
  sectionId: string,
  block: MicrositeBlock,
) {
  return sections.map((section) =>
    section.id === sectionId
      ? { ...section, blocks: [...section.blocks, block] }
      : section,
  );
}