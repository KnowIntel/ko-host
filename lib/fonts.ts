export const FONT_FAMILY_OPTIONS = [
  "inherit",

  // Display / Decorative
  "Abril Fatface",
  "Advent Pro",
  "Alfa Slab One",
  "Amatic SC",
  "Anton",
  "Architects Daughter",
  "Bangers",
  "Barlow",
  "Bebas Neue",
  "Black Ops One",
  "Brusher",
  "Bungee",
  "Bungee Shade",
  "Caveat",
  "Chelsea Market",
  "Chewy",
  "Comforter Brush",
  "Creepster",
  "Exo 2",
  "Faster One",
  "Gloria Hallelujah",
  "Grenze Gotisch",
  "Indie Flower",
  "Josefin Slab",
  "Kaushan Script",
  "Luckiest Guy",
  "Orbitron",
  "Oswald",
  "Patrick Hand",
  "Permanent Marker",
  "Poiret One",
  "Protest Revolution",
  "Rajdhani",
  "Righteous",
  "Rock Salt",
  "Saira Stencil",
  "Six Caps",
  "Smooch Sans",
  "Special Elite",
  "Style Script",
  "Teko",
  "Titan One",
  "Wallpoet",

  // Script
  "Allura",
  "Dancing Script",
  "Great Vibes",
  "Pacifico",
  "Parisienne",
  "Playball",
  "Sacramento",
  "Satisfy",
  "Tangerine",

  // Serif
  "Bodoni Moda",
  "Cinzel",
  "Cormorant Garamond",
  "Crimson Text",
  "Georgia",
  "Libre Baskerville",
  "Lora",
  "Marcellus",
  "Merriweather",
  "Playfair Display",
  "Prata",
  "Times New Roman",

  // Sans Serif
  "Arial",
  "DM Sans",
  "Helvetica",
  "Inter",
  "Modern UI",
  "Montserrat",
  "Montserrat SemiBold",
  "Open Sans",
  "Poppins",
  "Source Sans Pro",
  "Trebuchet MS",
  "Verdana",

  // Monospace / Utility
  "Courier New",
  "Courier Prime",
  "Handwritten",
  "system-ui",
  "Typewriter",
] as const;

export type FontFamilyOption = (typeof FONT_FAMILY_OPTIONS)[number];

export const FONT_FAMILY_MAP: Record<string, string> = {
  // Core
  Inter:
    'var(--font-inter), Inter, ui-sans-serif, system-ui, sans-serif',

  "DM Sans":
    'var(--font-dm-sans), "DM Sans", ui-sans-serif, system-ui, sans-serif',

  Poppins:
    'var(--font-poppins), Poppins, ui-sans-serif, system-ui, sans-serif',

  "Playfair Display":
    'var(--font-playfair-display), "Playfair Display", ui-serif, Georgia, serif',

  "Cormorant Garamond":
    'var(--font-cormorant), "Cormorant Garamond", ui-serif, Georgia, serif',

  "Great Vibes":
    'var(--font-great-vibes), "Great Vibes", cursive',

  // Script
  "Dancing Script":
    'var(--font-dancing-script), "Dancing Script", cursive',

  Pacifico:
    'var(--font-pacifico), Pacifico, cursive',

  Allura:
    'var(--font-allura), Allura, cursive',

  Parisienne:
    'var(--font-parisienne), Parisienne, cursive',

  Sacramento:
    'var(--font-sacramento), Sacramento, cursive',

  Playball:
    'var(--font-playball), Playball, cursive',

  Satisfy:
    'var(--font-satisfy), Satisfy, cursive',

  Tangerine:
    'var(--font-tangerine), Tangerine, cursive',

  Brusher:
    'var(--font-brusher), Brusher, "Brush Script MT", cursive',

  // Serif
  Prata:
    'var(--font-prata), Prata, ui-serif, Georgia, serif',

  Marcellus:
    'var(--font-marcellus), Marcellus, ui-serif, Georgia, serif',

  "Bodoni Moda":
    'var(--font-bodoni-moda), "Bodoni Moda", ui-serif, Georgia, serif',

  Cinzel:
    'var(--font-cinzel), Cinzel, ui-serif, Georgia, serif',

  "Libre Baskerville":
    'var(--font-libre-baskerville), "Libre Baskerville", ui-serif, Georgia, serif',

  Merriweather:
    'var(--font-merriweather), Merriweather, ui-serif, Georgia, serif',

  Lora:
    'var(--font-lora), Lora, ui-serif, Georgia, serif',

  "Crimson Text":
    'var(--font-crimson-text), "Crimson Text", ui-serif, Georgia, serif',

  "Josefin Slab":
    '"Josefin Slab", serif',

  // Display
  Anton:
    'var(--font-anton), Anton, sans-serif',

  Bangers:
    'var(--font-bangers), Bangers, cursive',

  Orbitron:
    'var(--font-orbitron), Orbitron, sans-serif',

  Righteous:
    'var(--font-righteous), Righteous, cursive',

  "Alfa Slab One":
    'var(--font-alfa-slab-one), "Alfa Slab One", serif',

  "Permanent Marker":
    'var(--font-permanent-marker), "Permanent Marker", cursive',

  Caveat:
    'var(--font-caveat), Caveat, cursive',

  "Indie Flower":
    'var(--font-indie-flower), "Indie Flower", cursive',

  "Exo 2":
    'var(--font-exo-2), "Exo 2", sans-serif',

  Rajdhani:
    'var(--font-rajdhani), Rajdhani, sans-serif',

  Teko:
    'var(--font-teko), Teko, sans-serif',

  "Abril Fatface":
    'var(--font-abril-fatface), "Abril Fatface", serif',

  "Bebas Neue":
    'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',

  "Special Elite":
    'var(--font-special-elite), "Special Elite", monospace',

  "Architects Daughter":
    'var(--font-architects-daughter), "Architects Daughter", cursive',

  Bungee:
    'var(--font-bungee), Bungee, display, sans-serif',

  "Courier Prime":
    'var(--font-courier-prime), "Courier Prime", "Courier New", monospace',

  "Gloria Hallelujah":
    'var(--font-gloria-hallelujah), "Gloria Hallelujah", cursive',

  Handwritten:
    'var(--font-patrick-hand), "Patrick Hand", var(--font-architects-daughter), "Architects Daughter", var(--font-gloria-hallelujah), "Gloria Hallelujah", var(--font-caveat), Caveat, cursive',

  "Luckiest Guy":
    'var(--font-luckiest-guy), "Luckiest Guy", display, sans-serif',

  "Modern UI":
    'var(--font-open-sans), "Open Sans", var(--font-source-sans-3), "Source Sans Pro", "Source Sans 3", ui-sans-serif, system-ui, sans-serif',

  "Montserrat SemiBold":
    'var(--font-montserrat), Montserrat, ui-sans-serif, system-ui, sans-serif',

  "Open Sans":
    'var(--font-open-sans), "Open Sans", ui-sans-serif, system-ui, sans-serif',

  Oswald:
    'var(--font-oswald), Oswald, ui-sans-serif, system-ui, sans-serif',

  "Patrick Hand":
    'var(--font-patrick-hand), "Patrick Hand", cursive',

  "Source Sans Pro":
    'var(--font-source-sans-3), "Source Sans Pro", "Source Sans 3", ui-sans-serif, system-ui, sans-serif',

  Chewy:
    'Chewy, cursive',

  "Black Ops One":
    '"Black Ops One", sans-serif',

  "Chelsea Market":
    '"Chelsea Market", cursive',

  Barlow:
    'Barlow, ui-sans-serif, system-ui, sans-serif',

  "Smooch Sans":
    '"Smooch Sans", sans-serif',

  "Advent Pro":
    '"Advent Pro", sans-serif',

  "Amatic SC":
    '"Amatic SC", cursive',

  "Titan One":
    '"Titan One", sans-serif',

  Creepster:
    'Creepster, cursive',

  "Rock Salt":
    '"Rock Salt", cursive',

  "Poiret One":
    '"Poiret One", cursive',

  "Saira Stencil":
    '"Saira Stencil One", sans-serif',

  "Six Caps":
    '"Six Caps", sans-serif',

  "Bungee Shade":
    '"Bungee Shade", sans-serif',

  "Faster One":
    '"Faster One", cursive',

  "Style Script":
    '"Style Script", cursive',

  "Grenze Gotisch":
    '"Grenze Gotisch", serif',

  Wallpoet:
    'Wallpoet, sans-serif',

  Typewriter:
    'var(--font-special-elite), "Special Elite", var(--font-courier-prime), "Courier Prime", "Courier New", monospace',

  // System
  Arial:
    "Arial, Helvetica, sans-serif",

  Helvetica:
    "Helvetica, Arial, sans-serif",

  Georgia:
    "Georgia, serif",

  "Times New Roman":
    '"Times New Roman", Times, serif',

  "Trebuchet MS":
    '"Trebuchet MS", sans-serif',

  Verdana:
    "Verdana, sans-serif",

  "Courier New":
    '"Courier New", monospace',

  "system-ui":
    "system-ui, sans-serif",
};

export function getFontFamily(fontFamily?: string | null): string {
  if (!fontFamily || fontFamily === "inherit") {
    return "inherit";
  }

  return FONT_FAMILY_MAP[fontFamily] ?? fontFamily;
}