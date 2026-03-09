// lib/templates/builder.ts

export type ShowcaseImage = {
  id: string
  url: string
}

export type FestiveBackground = {
  id: string
  url: string
}

export type LinkItem = {
  id: string
  label: string
  url: string
}

export type PollOption = {
  id: string
  text: string
}

export type FaqItem = {
  id: string
  question: string
  answer: string
}

export type MessageThreadItem = {
  id: string
  name: string
  message: string
}

export type ShowcaseBlock = {
  id: string
  type: "showcase"
  label: string
  data: {
    images: ShowcaseImage[]
  }
}

export type FestiveBackgroundBlock = {
  id: string
  type: "festiveBackground"
  label: string
  data: {
    image: FestiveBackground
  }
}

export type LinksBlock = {
  id: string
  type: "links"
  label: string
  data: {
    heading: string
    items: LinkItem[]
  }
}

export type CtaBlock = {
  id: string
  type: "cta"
  label: string
  data: {
    heading: string
    body: string
    buttonText: string
    buttonUrl: string
  }
}

export type CountdownBlock = {
  id: string
  type: "countdown"
  label: string
  data: {
    heading: string
    targetIso: string
    completedMessage: string
  }
}

export type MicrositeBlock =
  | ShowcaseBlock
  | FestiveBackgroundBlock
  | LinksBlock
  | CtaBlock
  | CountdownBlock

export type BuilderDraft = {
  title: string
  subtitle?: string
  subtext?: string
  countdownLabel?: string
  slugSuggestion: string
  pageBackground?: string
  blocks: MicrositeBlock[]
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export function createStarterDraft(): BuilderDraft {
  return {
    title: "",
    subtitle: "",
    subtext: "",
    countdownLabel: "Sale Ends In:",
    slugSuggestion: "",
    pageBackground: "none",
    blocks: [],
  }
}

export function createShowcaseBlock(): ShowcaseBlock {
  return {
    id: makeId("showcase"),
    type: "showcase",
    label: "Showcase",
    data: {
      images: Array.from({ length: 10 }).map(() => ({
        id: makeId("img"),
        url: "",
      })),
    },
  }
}

export function createFestiveBackgroundBlock(): FestiveBackgroundBlock {
  return {
    id: makeId("festivebg"),
    type: "festiveBackground",
    label: "Background Image",
    data: {
      image: {
        id: makeId("img"),
        url: "",
      },
    },
  }
}