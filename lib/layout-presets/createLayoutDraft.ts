import type { BuilderDraft } from "@/lib/templates/builder"
import {
  createShowcaseBlock,
  createFestiveBackgroundBlock,
} from "@/lib/templates/builder"

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export function createLayoutDraft(
  templateKey: string,
  designKey: string,
): BuilderDraft {
  if (designKey === "minimal") {
    return {
      title: "Beautiful Art",
      subtitle: "by a Freelancer",
      slugSuggestion: "",
      pageBackground: "none",
      blocks: [createShowcaseBlock()],
    }
  }

  if (designKey === "gallery") {
    return {
      title: "Celebrate the Season",
      subtitle: "Holiday Sale",
      subtext: "Huge discounts on gifts for the whole family!",
      countdownLabel: "Sale Ends In:",
      slugSuggestion: "",
      pageBackground: "none",
      blocks: [
        createFestiveBackgroundBlock(),
        {
          id: makeId("cta"),
          type: "cta",
          label: "Button",
          data: {
            heading: "",
            body: "",
            buttonText: "Shop Now",
            buttonUrl: "#",
          },
        },
        {
          id: makeId("countdown"),
          type: "countdown",
          label: "Countdown",
          data: {
            heading: "",
            targetIso: "",
            completedMessage: "Sale ended",
          },
        },
      ],
    }
  }

  return {
    title: "",
    subtitle: "",
    slugSuggestion: "",
    pageBackground: "none",
    blocks: [],
  }
}