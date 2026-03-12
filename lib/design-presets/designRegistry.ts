// lib/design-presets/designRegistry.ts

export type DesignTheme = {
  pageClassName: string;
  containerClassName: string;
  sectionClassName: string;
  blockGapClassName: string;
  titleWrapClassName: string;
  headingClassName: string;
  subheadingClassName: string;
  bodyClassName: string;
  mutedTextClassName: string;
  cardRadiusClassName: string;
  inputClassName: string;
  buttonClassName: string;
  buttonSecondaryClassName: string;
  linkClassName: string;
  softSurfaceClassName: string;
};

export type DesignPreset = {
  key: string;
  label: string;
  shortDescription: string;
  tone: string;
  bestFor: string[];
  badge?: "Popular" | "New" | "Recommended" | null;
  previewImageAlt?: string;
  previewImagePath: string;
  theme: DesignTheme;
};

const baseTheme: DesignTheme = {
  pageClassName: "bg-white",
  containerClassName: "mx-auto max-w-6xl",
  sectionClassName: "rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm",
  blockGapClassName: "space-y-6",
  titleWrapClassName: "space-y-3",
  headingClassName: "text-4xl font-semibold tracking-tight text-neutral-950",
  subheadingClassName: "text-2xl font-semibold tracking-tight text-neutral-900",
  bodyClassName: "text-sm leading-7 text-neutral-700",
  mutedTextClassName: "text-xs uppercase tracking-[0.18em] text-neutral-500",
  cardRadiusClassName: "rounded-3xl",
  inputClassName:
    "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-500",
  buttonClassName:
    "inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800",
  buttonSecondaryClassName:
    "inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50",
  linkClassName:
    "text-sm font-medium text-neutral-900 underline underline-offset-4",
  softSurfaceClassName: "rounded-2xl border border-neutral-200 bg-neutral-50",
};

const DESIGN_PRESETS: DesignPreset[] = [
  {
    key: "blank",
    label: "Blank Design",
    shortDescription:
      "A clean starting point with no preset visual structure.",
    tone: "Minimal",
    bestFor: ["Custom layout", "Starting from scratch", "Flexible editing"],
    badge: null,
    previewImageAlt: "Blank design preset preview",
    previewImagePath: "/designs/design_blank.webp",
    theme: {
      ...baseTheme,
    },
  },
  {
    key: "showcase",
    label: "Showcase Design",
    shortDescription:
      "An elegant portfolio-style layout with featured artwork and gallery canvases.",
    tone: "Showcase",
    bestFor: ["Artists", "Photographers", "Portfolios"],
    badge: "Recommended",
    previewImageAlt: "Showcase design preset preview",
    previewImagePath: "/designs/design_showcase.webp",
    theme: {
      ...baseTheme,
      pageClassName: "bg-[#fcfbf8]",
      sectionClassName:
        "rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm",
    },
  },
  {
    key: "festive",
    label: "Festive Design",
    shortDescription:
      "A seasonal promotional layout built for sales, countdowns, and holiday events.",
    tone: "Festive",
    bestFor: ["Holiday sales", "Seasonal pages", "Promotions"],
    badge: "Popular",
    previewImageAlt: "Festive design preset preview",
    previewImagePath: "/designs/design_festive.webp",
    theme: {
      ...baseTheme,
      pageClassName: "bg-[#fcfbf8]",
    },
  },
  {
    key: "modern",
    label: "Modern Design",
    shortDescription:
      "A polished contemporary layout for launches, products, and sleek branded pages.",
    tone: "Modern",
    bestFor: ["Product launches", "Brands", "Startups"],
    badge: "New",
    previewImageAlt: "Modern design preset preview",
    previewImagePath: "/designs/design_modern.webp",
    theme: {
      ...baseTheme,
      pageClassName: "bg-slate-50",
      sectionClassName:
        "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
      bodyClassName: "text-sm leading-7 text-slate-700",
      mutedTextClassName: "text-xs uppercase tracking-[0.18em] text-slate-500",
      linkClassName:
        "text-sm font-medium text-slate-900 underline underline-offset-4",
    },
  },
  {
    key: "elegant",
    label: "Elegant Design",
    shortDescription:
      "A refined editorial-style layout suited for formal invitations and curated pages.",
    tone: "Elegant",
    bestFor: ["Invitations", "Editorial", "Luxury pages"],
    badge: null,
    previewImageAlt: "Elegant design preset preview",
    previewImagePath: "/designs/design_elegant.webp",
    theme: {
      ...baseTheme,
      pageClassName: "bg-stone-50",
      sectionClassName:
        "rounded-3xl border border-stone-200 bg-white p-6 shadow-sm",
      bodyClassName: "text-sm leading-7 text-stone-700",
      mutedTextClassName: "text-xs uppercase tracking-[0.18em] text-stone-500",
      linkClassName:
        "text-sm font-medium text-stone-900 underline underline-offset-4",
    },
  },
  {
    key: "business",
    label: "Business Design",
    shortDescription:
      "A structured professional layout for services, agencies, and informational microsites.",
    tone: "Business",
    bestFor: ["Services", "Agencies", "Informational pages"],
    badge: null,
    previewImageAlt: "Business design preset preview",
    previewImagePath: "/designs/design_business.webp",
    theme: {
      ...baseTheme,
      pageClassName: "bg-neutral-50",
    },
  },
];

export function getDesignPresets() {
  return DESIGN_PRESETS;
}

export function getDesignPreset(key?: string) {
  return (
    DESIGN_PRESETS.find((preset) => preset.key === key) ||
    DESIGN_PRESETS.find((preset) => preset.key === "blank") ||
    DESIGN_PRESETS[0]
  );
}