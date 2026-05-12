// components\templates\design-layout-editor\constants.ts

import type { BottomCategory } from "./types";
import type { BuilderBlockType, ShapeType } from "@/lib/templates/builder";

export const CATEGORY_ORDER: BottomCategory[] = [
  "Text",
  "Media",
  "Layout",
  "Forms",
  "Marketing",
  "Social",
  "Utilities",
];

export const CATEGORY_BUTTONS: Record<
  BottomCategory,
  Array<
    | { kind: "page"; label: string; type: "title" | "subtitle" | "tagline" | "description" }
    | { kind: "shape"; label: string; type: ShapeType }
    | { kind: "block"; label: string; type: BuilderBlockType }
    | { kind: "block"; label: "Input Field"; type: "form_field" }
  >
> = {
  Text: [
    { kind: "page", label: "Title", type: "title" },
    { kind: "page", label: "Subtitle", type: "subtitle" },
    { kind: "page", label: "Tagline", type: "tagline" },
    { kind: "page", label: "Description", type: "description" },
    { kind: "block", label: "Label", type: "label" },
    { kind: "block", label: "TextFX", type: "text_fx" },
  ],
  Media: [
    { kind: "block", label: "Image", type: "image" },
    { kind: "block", label: "Gallery", type: "gallery" },
    { kind: "block", label: "Carousel", type: "image_carousel" },
  ],
  Layout: [
    { kind: "shape", label: "Rectangle", type: "rectangle" },
    { kind: "shape", label: "Circle", type: "circle" },
    { kind: "shape", label: "Line", type: "line" },
    { kind: "block", label: "Spacer", type: "padding" },
  ],
  Forms: [
    { kind: "block", label: "Input Field", type: "form_field" },
    { kind: "block", label: "Poll", type: "poll" },
    { kind: "block", label: "RSVP", type: "rsvp" },
  ],
  Marketing: [
    { kind: "block", label: "Button", type: "cta" },
    { kind: "block", label: "Countdown", type: "countdown" },
    { kind: "block", label: "FAQ", type: "faq" },
  ],
  Social: [{ kind: "block", label: "Thread", type: "thread" }],
  Utilities: [{ kind: "block", label: "Links", type: "links" }],
};

export const MIN_CANVAS_ZOOM = 50;
export const MAX_CANVAS_ZOOM = 200;
export const CANVAS_ZOOM_STEP = 10;
export const PREVIEW_MESSAGE_TYPE = "ko-host-preview-draft";
export const PREVIEW_READY_MESSAGE_TYPE = "ko-host-preview-ready";

export const FONT_FAMILY_OPTIONS = [
  "Anton",
  "Bangers",
  "Orbitron",
  "Righteous",
  "Alfa Slab One",
  "Permanent Marker",
  "Caveat",
  "Indie Flower",
  "Exo 2",
  "Rajdhani",
  "Teko",
  "Abril Fatface",
  "inherit",
  "Inter",
  "DM Sans",
  "Poppins",
  "Playfair Display",
  "Cormorant Garamond",
  "Great Vibes",
  "Dancing Script",
  "Pacifico",
  "Allura",
  "Parisienne",
  "Sacramento",
  "Playball",
  "Satisfy",
  "Tangerine",
  "Prata",
  "Marcellus",
  "Bodoni Moda",
  "Cinzel",
  "Libre Baskerville",
  "Merriweather",
  "Lora",
  "Crimson Text",
  "Arial",
  "Helvetica",
  "Georgia",
  "Times New Roman",
  "Trebuchet MS",
  "Verdana",
  "Courier New",
  "system-ui",
  "Bebas Neue",
] as const;

export const FONT_FAMILY_MAP: Record<string, string> = {
  Inter: 'var(--font-inter), Inter, ui-sans-serif, system-ui, sans-serif',
  "DM Sans":
    'var(--font-dm-sans), "DM Sans", ui-sans-serif, system-ui, sans-serif',
  Poppins:
    'var(--font-poppins), Poppins, ui-sans-serif, system-ui, sans-serif',

  "Playfair Display":
    'var(--font-playfair-display), "Playfair Display", ui-serif, Georgia, serif',
  "Cormorant Garamond":
    'var(--font-cormorant), "Cormorant Garamond", ui-serif, Georgia, serif',
  "Great Vibes": 'var(--font-great-vibes), "Great Vibes", cursive',

  // Script / invitation fonts
  "Dancing Script":
    'var(--font-dancing-script), "Dancing Script", cursive',
  Pacifico: 'var(--font-pacifico), Pacifico, cursive',
  Allura: 'var(--font-allura), Allura, cursive',
  Parisienne: 'var(--font-parisienne), Parisienne, cursive',
  Sacramento: 'var(--font-sacramento), Sacramento, cursive',
  Playball: 'var(--font-playball), Playball, cursive',
  Satisfy: 'var(--font-satisfy), Satisfy, cursive',
  Tangerine: 'var(--font-tangerine), Tangerine, cursive',

  // Elegant serif fonts
  Prata: 'var(--font-prata), Prata, ui-serif, Georgia, serif',
  Marcellus: 'var(--font-marcellus), Marcellus, ui-serif, Georgia, serif',
  "Bodoni Moda":
    'var(--font-bodoni-moda), "Bodoni Moda", ui-serif, Georgia, serif',
  Cinzel: 'var(--font-cinzel), Cinzel, ui-serif, Georgia, serif',
  "Libre Baskerville":
    'var(--font-libre-baskerville), "Libre Baskerville", ui-serif, Georgia, serif',
  Merriweather:
    'var(--font-merriweather), Merriweather, ui-serif, Georgia, serif',
  Lora: 'var(--font-lora), Lora, ui-serif, Georgia, serif',
  "Crimson Text":
    'var(--font-crimson-text), "Crimson Text", ui-serif, Georgia, serif',

// Display / stylized fonts
Anton: 'var(--font-anton), Anton, sans-serif',
"Bebas Neue": 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
Bangers: 'var(--font-bangers), Bangers, cursive',
  Orbitron: 'var(--font-orbitron), Orbitron, sans-serif',
  Righteous: 'var(--font-righteous), Righteous, cursive',
  "Alfa Slab One":
    'var(--font-alfa-slab-one), "Alfa Slab One", serif',
  "Permanent Marker":
    'var(--font-permanent-marker), "Permanent Marker", cursive',
  Caveat: 'var(--font-caveat), Caveat, cursive',
  "Indie Flower": 'var(--font-indie-flower), "Indie Flower", cursive',
  "Exo 2": 'var(--font-exo-2), "Exo 2", sans-serif',
  Rajdhani: 'var(--font-rajdhani), Rajdhani, sans-serif',
  Teko: 'var(--font-teko), Teko, sans-serif',
  "Abril Fatface": 'var(--font-abril-fatface), "Abril Fatface", serif',

  // System fonts
  Arial: "Arial, Helvetica, sans-serif",
  Helvetica: "Helvetica, Arial, sans-serif",
  Georgia: "Georgia, serif",
  "Times New Roman": '"Times New Roman", Times, serif',
  "Trebuchet MS": '"Trebuchet MS", sans-serif',
  Verdana: "Verdana, sans-serif",
  "Courier New": '"Courier New", monospace',
  "system-ui": "system-ui, sans-serif",
};