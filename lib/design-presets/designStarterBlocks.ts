import type { MicrositeBlock } from "@/lib/templates/builder";
import {
  createFestiveBackgroundBlock,
  createShowcaseBlock,
} from "@/lib/templates/builder";

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function createLinksBlock(items?: Array<{ label: string; url: string }>): MicrositeBlock {
  return {
    id: makeId("links"),
    type: "links",
    label: "Links",
    data: {
      heading: "Navigation",
      items:
        items?.map((item) => ({
          id: makeId("link"),
          label: item.label,
          url: item.url,
        })) ?? [
          { id: makeId("link"), label: "Home", url: "#" },
          { id: makeId("link"), label: "Gallery", url: "#" },
          { id: makeId("link"), label: "About", url: "#" },
          { id: makeId("link"), label: "Contact", url: "#" },
        ],
    },
  };
}

function createCtaBlock(
  buttonText = "Learn More",
  buttonUrl = "#",
  heading = "",
  body = "",
): MicrositeBlock {
  return {
    id: makeId("cta"),
    type: "cta",
    label: "Call To Action",
    data: {
      heading,
      body,
      buttonText,
      buttonUrl,
    },
  };
}

function createCountdownBlock(
  heading = "",
  targetIso = "",
  completedMessage = "Sale ended",
): MicrositeBlock {
  return {
    id: makeId("countdown"),
    type: "countdown",
    label: "Countdown",
    data: {
      heading,
      targetIso,
      completedMessage,
    },
  };
}

export const DESIGN_STARTER_BLOCKS: Record<string, MicrositeBlock[]> = {
  blank: [],

  minimal: [
    createShowcaseBlock(),
    createLinksBlock([
      { label: "Home", url: "#" },
      { label: "Gallery", url: "#" },
      { label: "About", url: "#" },
      { label: "Contact", url: "#" },
    ]),
    createCtaBlock(
      "View Gallery",
      "#",
      "Explore a collection of unique paintings created with passion.",
      "",
    ),
  ],

  gallery: [
    createFestiveBackgroundBlock(),
    createLinksBlock([
      { label: "Home", url: "#" },
      { label: "Shop", url: "#" },
      { label: "Deals", url: "#" },
      { label: "Contact", url: "#" },
    ]),
    createCtaBlock("Shop Now", "#", "", ""),
    createCountdownBlock("", "", "Sale ended"),
  ],

  modern: [
    createLinksBlock([
      { label: "Home", url: "#" },
      { label: "Features", url: "#" },
      { label: "Pricing", url: "#" },
      { label: "Contact", url: "#" },
    ]),
    createCtaBlock("Get Started", "#", "", ""),
  ],

  elegant: [
    createLinksBlock([
      { label: "Home", url: "#" },
      { label: "Story", url: "#" },
      { label: "Gallery", url: "#" },
      { label: "Contact", url: "#" },
    ]),
    createCtaBlock("Learn More", "#", "", ""),
  ],

  classic: [
    createLinksBlock([
      { label: "Home", url: "#" },
      { label: "Services", url: "#" },
      { label: "About", url: "#" },
      { label: "Contact", url: "#" },
    ]),
    createCtaBlock("Contact Us", "#", "", ""),
  ],
};

export function getDesignStarterBlocks(designKey: string): MicrositeBlock[] {
  return DESIGN_STARTER_BLOCKS[designKey] ?? [];
}