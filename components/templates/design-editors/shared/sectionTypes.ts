import type { MicrositeBlock } from "@/lib/templates/builder";

export type SectionContainer = {
  id: string;
  title: string;
  blocks: MicrositeBlock[];
};