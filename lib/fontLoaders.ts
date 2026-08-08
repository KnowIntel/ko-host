import {
  Abril_Fatface,
  Alfa_Slab_One,
  Allura,
  Anton,
  Bangers,
  Bebas_Neue,
  Bodoni_Moda,
  Caveat,
  Cinzel,
  Comforter_Brush,
  Cormorant_Garamond,
  Crimson_Text,
  Dancing_Script,
  DM_Sans,
  Exo_2,
  Great_Vibes,
  Indie_Flower,
  Inter,
  Kaushan_Script,
  Libre_Baskerville,
  Lora,
  Marcellus,
  Merriweather,
  Orbitron,
  Pacifico,
  Parisienne,
  Permanent_Marker,
  Playball,
  Playfair_Display,
  Poppins,
  Prata,
  Protest_Revolution,
  Rajdhani,
  Righteous,
  Sacramento,
  Satisfy,
  Special_Elite,
  Tangerine,
  Teko,
} from "next/font/google";

export const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
});

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair-display",
});

export const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
  weight: ["400", "700"],
});

export const pacifico = Pacifico({
  subsets: ["latin"],
  variable: "--font-pacifico",
  weight: ["400"],
});

export const allura = Allura({
  subsets: ["latin"],
  variable: "--font-allura",
  weight: ["400"],
});

export const parisienne = Parisienne({
  subsets: ["latin"],
  variable: "--font-parisienne",
  weight: ["400"],
});

export const sacramento = Sacramento({
  subsets: ["latin"],
  variable: "--font-sacramento",
  weight: ["400"],
});

export const playball = Playball({
  subsets: ["latin"],
  variable: "--font-playball",
  weight: ["400"],
});

export const satisfy = Satisfy({
  subsets: ["latin"],
  variable: "--font-satisfy",
  weight: ["400"],
});

export const tangerine = Tangerine({
  subsets: ["latin"],
  variable: "--font-tangerine",
  weight: ["400", "700"],
});

export const kaushanScript = Kaushan_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-kaushan-script",
});

export const comforterBrush = Comforter_Brush({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-comforter-brush",
});

export const protestRevolution = Protest_Revolution({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-protest-revolution",
});

export const prata = Prata({
  subsets: ["latin"],
  variable: "--font-prata",
  weight: ["400"],
});

export const marcellus = Marcellus({
  subsets: ["latin"],
  variable: "--font-marcellus",
  weight: ["400"],
});

export const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni-moda",
});

export const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
});

export const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre-baskerville",
});

export const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-merriweather",
});

export const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

export const crimsonText = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-crimson-text",
});

export const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
});

export const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas-neue",
});

export const bangers = Bangers({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bangers",
});

export const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const righteous = Righteous({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-righteous",
});

export const alfa = Alfa_Slab_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-alfa-slab-one",
});

export const marker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-permanent-marker",
});

export const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

export const indie = Indie_Flower({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-indie-flower",
});

export const exo = Exo_2({
  subsets: ["latin"],
  variable: "--font-exo-2",
});

export const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-rajdhani",
});

export const teko = Teko({
  subsets: ["latin"],
  variable: "--font-teko",
});

export const abril = Abril_Fatface({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-abril-fatface",
});

export const specialElite = Special_Elite({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-special-elite",
});

export const APP_FONT_VARIABLES = [
  greatVibes.variable,
  cormorant.variable,
  inter.variable,
  dmSans.variable,
  poppins.variable,
  playfairDisplay.variable,
  dancingScript.variable,
  pacifico.variable,
  allura.variable,
  parisienne.variable,
  sacramento.variable,
  playball.variable,
  satisfy.variable,
  tangerine.variable,
  kaushanScript.variable,
  comforterBrush.variable,
  protestRevolution.variable,
  prata.variable,
  marcellus.variable,
  bodoniModa.variable,
  cinzel.variable,
  libreBaskerville.variable,
  merriweather.variable,
  lora.variable,
  crimsonText.variable,
  anton.variable,
  bangers.variable,
  orbitron.variable,
  righteous.variable,
  alfa.variable,
  marker.variable,
  caveat.variable,
  indie.variable,
  exo.variable,
  rajdhani.variable,
  teko.variable,
  abril.variable,
  bebasNeue.variable,
  specialElite.variable,
].join(" ");