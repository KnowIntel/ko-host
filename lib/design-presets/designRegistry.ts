export type DesignPresetKey =
  | "blank"
  | "minimal"
  | "elegant"
  | "startup"
  | "gallery"
  | "portfolio"
  | "event"
  | "fundraiser"
  | "community"
  | "product";

export type DesignTone =
  | "neutral"
  | "clean"
  | "soft"
  | "bold"
  | "warm"
  | "editorial"
  | "image-forward";

export type DesignPreviewFrame =
  | "plain"
  | "card"
  | "soft"
  | "hero"
  | "gallery"
  | "spotlight";

export type DesignPreset = {
  key: DesignPresetKey;
  label: string;
  shortDescription: string;
  longDescription: string;
  bestFor: string[];
  tone: DesignTone;
  previewFrame: DesignPreviewFrame;
  sectionClassName: string;
  containerClassName: string;
  headingClassName: string;
  bodyClassName: string;
  accentClassName: string;
  badge?: "Popular" | "New" | "Recommended" | null;
};

export const DESIGN_PRESETS: DesignPreset[] = [
  {
    key: "blank",
    label: "Blank Design",
    shortDescription: "Start from scratch with full flexibility.",
    longDescription:
      "A neutral base design for users who want complete freedom to build their microsite their own way.",
    bestFor: ["Custom builds", "Advanced users", "Open-ended pages"],
    tone: "neutral",
    previewFrame: "plain",
    sectionClassName:
      "rounded-2xl border border-neutral-200 bg-white px-6 py-6 shadow-sm",
    containerClassName: "mx-auto max-w-3xl space-y-6",
    headingClassName:
      "text-2xl font-semibold tracking-tight text-neutral-900",
    bodyClassName: "text-sm leading-7 text-neutral-600",
    accentClassName: "text-neutral-900",
    badge: null,
  },
  {
    key: "minimal",
    label: "Minimal Design",
    shortDescription: "Clean, quiet, and modern.",
    longDescription:
      "A restrained layout with strong spacing and low visual noise, ideal for pages that need clarity and focus.",
    bestFor: ["Announcements", "Property pages", "Simple landing pages"],
    tone: "clean",
    previewFrame: "plain",
    sectionClassName:
      "rounded-2xl border border-neutral-200/80 bg-white px-6 py-7",
    containerClassName: "mx-auto max-w-3xl space-y-5",
    headingClassName:
      "text-2xl font-semibold tracking-tight text-neutral-950",
    bodyClassName: "text-sm leading-7 text-neutral-600",
    accentClassName: "text-neutral-800",
    badge: "Recommended",
  },
  {
    key: "elegant",
    label: "Elegant Design",
    shortDescription: "Refined, graceful, and polished.",
    longDescription:
      "A softer, more elevated presentation style with centered rhythm and a more ceremonial feel.",
    bestFor: ["Weddings", "Memorials", "Formal events"],
    tone: "soft",
    previewFrame: "soft",
    sectionClassName:
      "rounded-[28px] border border-stone-200 bg-gradient-to-b from-white to-stone-50 px-7 py-8 shadow-sm",
    containerClassName: "mx-auto max-w-3xl space-y-7",
    headingClassName:
      "text-3xl font-semibold tracking-tight text-stone-900 text-center",
    bodyClassName: "text-sm leading-7 text-stone-600",
    accentClassName: "text-stone-800",
    badge: "Popular",
  },
  {
    key: "startup",
    label: "Startup Launch",
    shortDescription: "Sharp, punchy, and conversion-oriented.",
    longDescription:
      "A more assertive launch style built for momentum, product reveals, and fast call-to-action flows.",
    bestFor: ["Product launches", "Waitlists", "Demo days"],
    tone: "bold",
    previewFrame: "hero",
    sectionClassName:
      "rounded-3xl border border-neutral-900/10 bg-white px-6 py-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
    containerClassName: "mx-auto max-w-4xl space-y-6",
    headingClassName:
      "text-3xl font-bold tracking-tight text-neutral-950",
    bodyClassName: "text-sm leading-7 text-neutral-600",
    accentClassName: "text-blue-700",
    badge: "Popular",
  },
  {
    key: "gallery",
    label: "Photo Gallery",
    shortDescription: "Image-first and visually immersive.",
    longDescription:
      "A layout style designed to let imagery do most of the work, with supporting text kept secondary.",
    bestFor: ["Photo galleries", "Memories", "Showcase pages"],
    tone: "image-forward",
    previewFrame: "gallery",
    sectionClassName:
      "rounded-3xl border border-neutral-200 bg-white px-5 py-5 shadow-sm",
    containerClassName: "mx-auto max-w-5xl space-y-6",
    headingClassName:
      "text-2xl font-semibold tracking-tight text-neutral-950",
    bodyClassName: "text-sm leading-7 text-neutral-600",
    accentClassName: "text-fuchsia-700",
    badge: "Popular",
  },
  {
    key: "portfolio",
    label: "Portfolio Design",
    shortDescription: "Structured and showcase-driven.",
    longDescription:
      "A confident presentation style for creators and professionals who want their work and links to stand out cleanly.",
    bestFor: ["Portfolios", "Creator pages", "Professional profiles"],
    tone: "editorial",
    previewFrame: "card",
    sectionClassName:
      "rounded-2xl border border-neutral-200 bg-white px-6 py-6 shadow-sm",
    containerClassName: "mx-auto max-w-4xl space-y-6",
    headingClassName:
      "text-2xl font-bold tracking-tight text-neutral-950",
    bodyClassName: "text-sm leading-7 text-neutral-600",
    accentClassName: "text-violet-700",
    badge: "Recommended",
  },
  {
    key: "event",
    label: "Event Landing",
    shortDescription: "Direct, organized, and action-ready.",
    longDescription:
      "A practical event-focused design that prioritizes schedule, RSVP, countdown, and clear next steps.",
    bestFor: ["Church events", "Conferences", "Meetups", "Invites"],
    tone: "clean",
    previewFrame: "hero",
    sectionClassName:
      "rounded-2xl border border-neutral-200 bg-white px-6 py-6 shadow-sm",
    containerClassName: "mx-auto max-w-4xl space-y-6",
    headingClassName:
      "text-3xl font-semibold tracking-tight text-neutral-950",
    bodyClassName: "text-sm leading-7 text-neutral-600",
    accentClassName: "text-emerald-700",
    badge: "Recommended",
  },
  {
    key: "fundraiser",
    label: "Fundraiser Design",
    shortDescription: "Mission-forward and supportive.",
    longDescription:
      "A warm action-oriented style built to communicate cause, urgency, and donation/support paths clearly.",
    bestFor: ["Fundraisers", "Relief campaigns", "School support pages"],
    tone: "warm",
    previewFrame: "spotlight",
    sectionClassName:
      "rounded-3xl border border-amber-200 bg-gradient-to-b from-white to-amber-50 px-6 py-6 shadow-sm",
    containerClassName: "mx-auto max-w-4xl space-y-6",
    headingClassName:
      "text-3xl font-semibold tracking-tight text-amber-950",
    bodyClassName: "text-sm leading-7 text-amber-900/70",
    accentClassName: "text-amber-700",
    badge: null,
  },
  {
    key: "community",
    label: "Community Hub",
    shortDescription: "Friendly, accessible, and conversational.",
    longDescription:
      "A welcoming layout style for groups, neighborhoods, local communities, and shared updates.",
    bestFor: ["Community pages", "Neighborhood alerts", "Discussion hubs"],
    tone: "warm",
    previewFrame: "card",
    sectionClassName:
      "rounded-3xl border border-sky-200 bg-gradient-to-b from-white to-sky-50 px-6 py-6 shadow-sm",
    containerClassName: "mx-auto max-w-4xl space-y-6",
    headingClassName:
      "text-2xl font-semibold tracking-tight text-sky-950",
    bodyClassName: "text-sm leading-7 text-sky-900/70",
    accentClassName: "text-sky-700",
    badge: "New",
  },
  {
    key: "product",
    label: "Product Showcase",
    shortDescription: "Confident, visual, and sales-ready.",
    longDescription:
      "A polished showcase style for products, offers, and featured launches with stronger visual emphasis.",
    bestFor: ["Products", "Promotions", "Offers", "Launch pages"],
    tone: "bold",
    previewFrame: "spotlight",
    sectionClassName:
      "rounded-3xl border border-neutral-200 bg-white px-6 py-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)]",
    containerClassName: "mx-auto max-w-4xl space-y-6",
    headingClassName:
      "text-3xl font-bold tracking-tight text-neutral-950",
    bodyClassName: "text-sm leading-7 text-neutral-600",
    accentClassName: "text-rose-700",
    badge: "Popular",
  },
];

export function getDesignPreset(designKey?: string): DesignPreset {
  return (
    DESIGN_PRESETS.find((preset) => preset.key === designKey) ||
    DESIGN_PRESETS.find((preset) => preset.key === "blank") ||
    DESIGN_PRESETS[0]
  );
}