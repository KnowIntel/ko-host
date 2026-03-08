export type DesignPresetKey =
  | "blank"
  | "minimal"
  | "elegant"
  | "gallery"
  | "modern"
  | "classic";

export type DesignTone =
  | "neutral"
  | "clean"
  | "soft"
  | "image-forward"
  | "modern"
  | "timeless";

export type DesignPreviewFrame =
  | "plain"
  | "card"
  | "soft"
  | "gallery"
  | "editorial";

export type DesignFontMood =
  | "neutral-sans"
  | "clean-sans"
  | "luxury-serif"
  | "geometric-sans"
  | "classic-serif";

export type DesignTheme = {
  pageClassName: string;
  containerClassName: string;
  sectionClassName: string;
  titleWrapClassName: string;
  headingClassName: string;
  subheadingClassName: string;
  bodyClassName: string;
  mutedTextClassName: string;
  accentClassName: string;
  linkClassName: string;
  buttonClassName: string;
  buttonSecondaryClassName: string;
  inputClassName: string;
  softSurfaceClassName: string;
  blockGapClassName: string;
  cardRadiusClassName: string;
  fontMood: DesignFontMood;
};

export type DesignPreset = {
  key: DesignPresetKey;
  label: string;
  shortDescription: string;
  longDescription: string;
  bestFor: string[];
  tone: DesignTone;
  previewFrame: DesignPreviewFrame;
  badge?: null;
  previewImageAlt: string;
  theme: DesignTheme;
};

const neutralInput =
  "rounded-xl border px-3 py-2 text-sm outline-none transition bg-white";
const neutralButton =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition";
const secondaryButton =
  "inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition";

export const DESIGN_PRESETS: DesignPreset[] = [
  {
    key: "minimal",
    label: "Showcase Design",
    shortDescription: "Clean, polished, and presentation-ready.",
    longDescription:
      "A restrained layout that gives your content room to breathe while still feeling polished and professional.",
    bestFor: ["Portfolios", "Showcases", "Profiles"],
    tone: "clean",
    previewFrame: "plain",
    badge: null,
    previewImageAlt: "Showcase Design preview",
    theme: {
      pageClassName: "bg-white",
      containerClassName: "mx-auto max-w-3xl",
      sectionClassName:
        "rounded-2xl border border-neutral-200/80 bg-white px-6 py-7",
      titleWrapClassName: "text-center",
      headingClassName:
        "font-sans text-3xl font-semibold tracking-tight text-neutral-950",
      subheadingClassName:
        "font-sans text-lg font-semibold tracking-tight text-neutral-900",
      bodyClassName: "font-sans text-sm leading-8 text-neutral-600",
      mutedTextClassName:
        "font-sans text-xs uppercase tracking-[0.18em] text-neutral-400",
      accentClassName: "text-neutral-800",
      linkClassName:
        "font-sans text-sm font-medium text-neutral-800 underline underline-offset-4",
      buttonClassName: `${neutralButton} bg-neutral-950 text-white hover:bg-neutral-800`,
      buttonSecondaryClassName: `${secondaryButton} border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50`,
      inputClassName: `${neutralInput} border-neutral-300 text-neutral-800 focus:border-neutral-950`,
      softSurfaceClassName:
        "rounded-2xl border border-neutral-200 bg-neutral-50/70",
      blockGapClassName: "space-y-8",
      cardRadiusClassName: "rounded-2xl",
      fontMood: "clean-sans",
    },
  },
  {
    key: "modern",
    label: "Modern Design",
    shortDescription: "Sleek, current, and high-contrast.",
    longDescription:
      "A sharper contemporary style with stronger contrast and a more current app-like visual treatment.",
    bestFor: ["Modern pages", "Tech pages", "Campaigns"],
    tone: "modern",
    previewFrame: "card",
    badge: null,
    previewImageAlt: "Modern Design preview",
    theme: {
      pageClassName: "bg-slate-100",
      containerClassName: "mx-auto max-w-4xl",
      sectionClassName:
        "rounded-[24px] border border-slate-200 bg-white px-6 py-6 shadow-[0_12px_28px_rgba(15,23,42,0.08)]",
      titleWrapClassName: "text-center",
      headingClassName:
        "font-sans text-4xl font-bold tracking-tight text-slate-950",
      subheadingClassName:
        "font-sans text-xl font-semibold tracking-tight text-slate-950",
      bodyClassName: "font-sans text-sm leading-7 text-slate-600",
      mutedTextClassName:
        "font-sans text-xs uppercase tracking-[0.22em] text-slate-400",
      accentClassName: "text-cyan-700",
      linkClassName:
        "font-sans text-sm font-medium text-cyan-700 underline underline-offset-4",
      buttonClassName: `${neutralButton} bg-cyan-700 text-white hover:bg-cyan-600`,
      buttonSecondaryClassName: `${secondaryButton} border-slate-300 bg-white text-slate-900 hover:bg-slate-50`,
      inputClassName: `${neutralInput} border-slate-300 text-slate-800 focus:border-cyan-700`,
      softSurfaceClassName:
        "rounded-[24px] border border-cyan-100 bg-cyan-50/50",
      blockGapClassName: "space-y-8",
      cardRadiusClassName: "rounded-[24px]",
      fontMood: "geometric-sans",
    },
  },
  {
    key: "elegant",
    label: "Elegant Design",
    shortDescription: "Refined, graceful, and softer in tone.",
    longDescription:
      "A more ceremonial presentation with elevated typography, softer surfaces, and more breathing room.",
    bestFor: ["Formal pages", "Memorials", "Refined presentations"],
    tone: "soft",
    previewFrame: "soft",
    badge: null,
    previewImageAlt: "Elegant Design preview",
    theme: {
      pageClassName: "bg-stone-50",
      containerClassName: "mx-auto max-w-3xl",
      sectionClassName:
        "rounded-[28px] border border-stone-200 bg-gradient-to-b from-white to-stone-50 px-7 py-8 shadow-sm",
      titleWrapClassName: "text-center",
      headingClassName:
        "font-serif text-4xl font-semibold tracking-tight text-stone-900",
      subheadingClassName:
        "font-serif text-xl font-semibold tracking-tight text-stone-900",
      bodyClassName: "font-sans text-sm leading-8 text-stone-600",
      mutedTextClassName:
        "font-sans text-xs uppercase tracking-[0.26em] text-stone-400",
      accentClassName: "text-stone-800",
      linkClassName:
        "font-sans text-sm font-medium text-stone-700 underline underline-offset-4",
      buttonClassName: `${neutralButton} bg-stone-800 text-white hover:bg-stone-700`,
      buttonSecondaryClassName: `${secondaryButton} border-stone-300 bg-white text-stone-800 hover:bg-stone-50`,
      inputClassName: `${neutralInput} border-stone-300 text-stone-800 focus:border-stone-700`,
      softSurfaceClassName:
        "rounded-[24px] border border-stone-200 bg-stone-50/80",
      blockGapClassName: "space-y-10",
      cardRadiusClassName: "rounded-[28px]",
      fontMood: "luxury-serif",
    },
  },
  {
    key: "gallery",
    label: "Festive Design",
    shortDescription: "Bright, celebratory, and lively.",
    longDescription:
      "A more expressive visual treatment designed for joyful, memorable, and energetic pages.",
    bestFor: ["Celebrations", "Invites", "Festive pages"],
    tone: "image-forward",
    previewFrame: "gallery",
    badge: null,
    previewImageAlt: "Festive Design preview",
    theme: {
      pageClassName: "bg-neutral-100",
      containerClassName: "mx-auto max-w-5xl",
      sectionClassName:
        "rounded-3xl border border-neutral-200 bg-white px-5 py-5 shadow-sm",
      titleWrapClassName: "text-center",
      headingClassName:
        "font-sans text-3xl font-semibold tracking-tight text-neutral-950",
      subheadingClassName:
        "font-sans text-xl font-semibold tracking-tight text-neutral-900",
      bodyClassName: "font-sans text-sm leading-7 text-neutral-600",
      mutedTextClassName:
        "font-sans text-xs uppercase tracking-[0.2em] text-neutral-400",
      accentClassName: "text-fuchsia-700",
      linkClassName:
        "font-sans text-sm font-medium text-fuchsia-700 underline underline-offset-4",
      buttonClassName: `${neutralButton} bg-fuchsia-700 text-white hover:bg-fuchsia-600`,
      buttonSecondaryClassName: `${secondaryButton} border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50`,
      inputClassName: `${neutralInput} border-neutral-300 text-neutral-800 focus:border-fuchsia-700`,
      softSurfaceClassName:
        "rounded-3xl border border-fuchsia-100 bg-fuchsia-50/40",
      blockGapClassName: "space-y-8",
      cardRadiusClassName: "rounded-3xl",
      fontMood: "clean-sans",
    },
  },
  {
    key: "classic",
    label: "Business Design",
    shortDescription: "Structured, credible, and professional.",
    longDescription:
      "A more traditional and business-friendly presentation with balanced typography and dependable structure.",
    bestFor: ["Business pages", "Professional pages", "Information pages"],
    tone: "timeless",
    previewFrame: "soft",
    badge: null,
    previewImageAlt: "Business Design preview",
    theme: {
      pageClassName: "bg-stone-100",
      containerClassName: "mx-auto max-w-4xl",
      sectionClassName:
        "rounded-2xl border border-stone-300 bg-white px-6 py-6 shadow-sm",
      titleWrapClassName: "text-center",
      headingClassName:
        "font-serif text-4xl font-semibold tracking-tight text-stone-950",
      subheadingClassName:
        "font-serif text-xl font-semibold tracking-tight text-stone-900",
      bodyClassName: "font-sans text-sm leading-8 text-stone-700",
      mutedTextClassName:
        "font-sans text-xs uppercase tracking-[0.22em] text-stone-500",
      accentClassName: "text-stone-800",
      linkClassName:
        "font-sans text-sm font-medium text-stone-800 underline underline-offset-4",
      buttonClassName: `${neutralButton} bg-stone-800 text-white hover:bg-stone-700`,
      buttonSecondaryClassName: `${secondaryButton} border-stone-300 bg-white text-stone-900 hover:bg-stone-50`,
      inputClassName: `${neutralInput} border-stone-300 text-stone-800 focus:border-stone-700`,
      softSurfaceClassName:
        "rounded-2xl border border-stone-200 bg-stone-50/80",
      blockGapClassName: "space-y-8",
      cardRadiusClassName: "rounded-2xl",
      fontMood: "classic-serif",
    },
  },
  {
    key: "blank",
    label: "Blank Design",
    shortDescription: "Start simple with a neutral base.",
    longDescription:
      "A neutral starting point for users who want full control from the beginning.",
    bestFor: ["Scratch builds", "Custom layouts", "Open-ended pages"],
    tone: "neutral",
    previewFrame: "plain",
    badge: null,
    previewImageAlt: "Blank Design preview",
    theme: {
      pageClassName: "bg-neutral-50",
      containerClassName: "mx-auto max-w-3xl",
      sectionClassName:
        "rounded-2xl border border-neutral-200 bg-white px-6 py-6 shadow-sm",
      titleWrapClassName: "text-center",
      headingClassName:
        "font-sans text-3xl font-semibold tracking-tight text-neutral-950",
      subheadingClassName:
        "font-sans text-lg font-semibold tracking-tight text-neutral-900",
      bodyClassName: "font-sans text-sm leading-7 text-neutral-600",
      mutedTextClassName: "font-sans text-xs text-neutral-500",
      accentClassName: "text-neutral-900",
      linkClassName:
        "font-sans text-sm font-medium text-neutral-900 underline underline-offset-4",
      buttonClassName: `${neutralButton} bg-neutral-900 text-white hover:bg-neutral-800`,
      buttonSecondaryClassName: `${secondaryButton} border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50`,
      inputClassName: `${neutralInput} border-neutral-300 text-neutral-800 focus:border-neutral-900`,
      softSurfaceClassName:
        "rounded-2xl border border-neutral-200 bg-neutral-50",
      blockGapClassName: "space-y-8",
      cardRadiusClassName: "rounded-2xl",
      fontMood: "neutral-sans",
    },
  },
];

export function getDesignPreset(designKey?: string): DesignPreset {
  return (
    DESIGN_PRESETS.find((preset) => preset.key === designKey) ||
    DESIGN_PRESETS.find((preset) => preset.key === "blank") ||
    DESIGN_PRESETS[0]
  );
}