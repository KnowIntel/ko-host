export const FONT_FAMILY_OPTIONS = [
  "inherit",

// Display / Decorative
  "Aboreto",
  "Abril Fatface",
  "Advent Pro",
  "Alfa Slab One",
  "Amatic SC",
  "Antonio",
  "Anton",
  "Architects Daughter",
  "Bangers",
  "Barlow",
  "Bebas Neue",
  "Black Ops One",
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
  "Rubik Wet Paint",
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

  Montserrat:
    'var(--font-montserrat), Montserrat, ui-sans-serif, system-ui, sans-serif',

  "Montserrat SemiBold":
    'var(--font-montserrat), Montserrat, ui-sans-serif, system-ui, sans-serif',

  "Open Sans":
    'var(--font-open-sans), "Open Sans", ui-sans-serif, system-ui, sans-serif',

  "Source Sans Pro":
    'var(--font-source-sans-3), "Source Sans 3", "Source Sans Pro", ui-sans-serif, system-ui, sans-serif',

  "Modern UI":
    'var(--font-open-sans), "Open Sans", var(--font-source-sans-3), "Source Sans 3", ui-sans-serif, system-ui, sans-serif',

  // Script
  "Great Vibes":
    'var(--font-great-vibes), "Great Vibes", cursive',

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

  "Kaushan Script":
    'var(--font-kaushan-script), "Kaushan Script", cursive',

  "Comforter Brush":
    'var(--font-comforter-brush), "Comforter Brush", cursive',

  "Style Script":
    'var(--font-style-script), "Style Script", cursive',

  // Brusher is not a next/font Google family.
  // Keep the UI option, but resolve it through real loaded brush fonts.
  Brusher:
    'var(--font-comforter-brush), "Comforter Brush", "Brush Script MT", cursive',

  // Serif
  "Playfair Display":
    'var(--font-playfair-display), "Playfair Display", ui-serif, Georgia, serif',

  "Cormorant Garamond":
    'var(--font-cormorant), "Cormorant Garamond", ui-serif, Georgia, serif',

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
    'var(--font-josefin-slab), "Josefin Slab", ui-serif, Georgia, serif',

  "Grenze Gotisch":
    'var(--font-grenze-gotisch), "Grenze Gotisch", serif',

  Aboreto:
  'var(--font-aboreto), Aboreto, serif',

  // Display / Decorative
  "Abril Fatface":
    'var(--font-abril-fatface), "Abril Fatface", serif',

  "Advent Pro":
    'var(--font-advent-pro), "Advent Pro", sans-serif',

  "Alfa Slab One":
    'var(--font-alfa-slab-one), "Alfa Slab One", serif',

  "Amatic SC":
    'var(--font-amatic-sc), "Amatic SC", cursive',

  Antonio:
  'var(--font-antonio), Antonio, ui-sans-serif, system-ui, sans-serif',

  Anton:
    'var(--font-anton), Anton, sans-serif',

  "Architects Daughter":
    'var(--font-architects-daughter), "Architects Daughter", cursive',

  Bangers:
    'var(--font-bangers), Bangers, cursive',

  Barlow:
    'var(--font-barlow), Barlow, ui-sans-serif, system-ui, sans-serif',

  "Bebas Neue":
    'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',

  "Black Ops One":
    'var(--font-black-ops-one), "Black Ops One", sans-serif',

  Bungee:
    'var(--font-bungee), Bungee, sans-serif',

  "Bungee Shade":
    'var(--font-bungee-shade), "Bungee Shade", sans-serif',

  Caveat:
    'var(--font-caveat), Caveat, cursive',

  "Chelsea Market":
    'var(--font-chelsea-market), "Chelsea Market", cursive',

  Chewy:
    'var(--font-chewy), Chewy, cursive',

  Creepster:
    'var(--font-creepster), Creepster, cursive',

  "Exo 2":
    'var(--font-exo-2), "Exo 2", sans-serif',

  "Faster One":
    'var(--font-faster-one), "Faster One", cursive',

  "Gloria Hallelujah":
    'var(--font-gloria-hallelujah), "Gloria Hallelujah", cursive',

  "Indie Flower":
    'var(--font-indie-flower), "Indie Flower", cursive',

  "Luckiest Guy":
    'var(--font-luckiest-guy), "Luckiest Guy", sans-serif',

  Orbitron:
    'var(--font-orbitron), Orbitron, sans-serif',

  Oswald:
    'var(--font-oswald), Oswald, ui-sans-serif, system-ui, sans-serif',

  "Patrick Hand":
    'var(--font-patrick-hand), "Patrick Hand", cursive',

  "Permanent Marker":
    'var(--font-permanent-marker), "Permanent Marker", cursive',

  "Poiret One":
    'var(--font-poiret-one), "Poiret One", cursive',

  "Protest Revolution":
    'var(--font-protest-revolution), "Protest Revolution", sans-serif',

  Rajdhani:
    'var(--font-rajdhani), Rajdhani, sans-serif',

  Righteous:
    'var(--font-righteous), Righteous, cursive',

  "Rubik Wet Paint":
  'var(--font-rubik-wet-paint), "Rubik Wet Paint", cursive',

  "Rock Salt":
    'var(--font-rock-salt), "Rock Salt", cursive',

  "Saira Stencil":
    'var(--font-saira-stencil), "Saira Stencil One", sans-serif',

  "Six Caps":
    'var(--font-six-caps), "Six Caps", sans-serif',

  "Smooch Sans":
    'var(--font-smooch-sans), "Smooch Sans", sans-serif',

  "Special Elite":
    'var(--font-special-elite), "Special Elite", monospace',

  Teko:
    'var(--font-teko), Teko, sans-serif',

  "Titan One":
    'var(--font-titan-one), "Titan One", sans-serif',

  Wallpoet:
    'var(--font-wallpoet), Wallpoet, sans-serif',

  // Utility aliases
  Handwritten:
    'var(--font-patrick-hand), "Patrick Hand", var(--font-architects-daughter), "Architects Daughter", var(--font-gloria-hallelujah), "Gloria Hallelujah", var(--font-caveat), Caveat, cursive',

  Typewriter:
    'var(--font-special-elite), "Special Elite", var(--font-courier-prime), "Courier Prime", "Courier New", monospace',

  "Courier Prime":
    'var(--font-courier-prime), "Courier Prime", "Courier New", monospace',

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