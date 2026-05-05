// app\layout.tsx
import "./globals.css";
import { AppChrome } from "@/components/ui/AppChrome";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import {
  Great_Vibes,
  Cormorant_Garamond,
  Inter,
  DM_Sans,
  Poppins,
  Playfair_Display,
  Dancing_Script,
  Pacifico,
  Allura,
  Parisienne,
  Sacramento,
  Playball,
  Satisfy,
  Tangerine,
  Prata,
  Marcellus,
  Bodoni_Moda,
  Anton,
  Bangers,
  Orbitron,
  Righteous,
  Alfa_Slab_One,
  Permanent_Marker,
  Caveat,
  Indie_Flower,
  Exo_2,
  Rajdhani,
  Teko,
  Abril_Fatface,
} from "next/font/google";

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair-display",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
  weight: ["400", "700"],
});

const pacifico = Pacifico({
  subsets: ["latin"],
  variable: "--font-pacifico",
  weight: ["400"],
});

const allura = Allura({
  subsets: ["latin"],
  variable: "--font-allura",
  weight: ["400"],
});

const parisienne = Parisienne({
  subsets: ["latin"],
  variable: "--font-parisienne",
  weight: ["400"],
});

const sacramento = Sacramento({
  subsets: ["latin"],
  variable: "--font-sacramento",
  weight: ["400"],
});

const playball = Playball({
  subsets: ["latin"],
  variable: "--font-playball",
  weight: ["400"],
});

const satisfy = Satisfy({
  subsets: ["latin"],
  variable: "--font-satisfy",
  weight: ["400"],
});

const tangerine = Tangerine({
  subsets: ["latin"],
  variable: "--font-tangerine",
  weight: ["400", "700"],
});

const prata = Prata({
  subsets: ["latin"],
  variable: "--font-prata",
  weight: ["400"],
});

const marcellus = Marcellus({
  subsets: ["latin"],
  variable: "--font-marcellus",
  weight: ["400"],
});

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni-moda",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
});

const bangers = Bangers({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bangers",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

const righteous = Righteous({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-righteous",
});

const alfa = Alfa_Slab_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-alfa-slab-one",
});

const marker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-permanent-marker",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

const indie = Indie_Flower({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-indie-flower",
});

const exo = Exo_2({
  subsets: ["latin"],
  variable: "--font-exo-2",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-rajdhani",
});

const teko = Teko({
  subsets: ["latin"],
  variable: "--font-teko",
});

const abril = Abril_Fatface({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-abril-fatface",
});

export const metadata: Metadata = {
  title: "Ko-Host",
  description: "Temporary microsites powered by structured templates.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
className={[
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
  prata.variable,
  marcellus.variable,
  bodoniModa.variable,
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
  "min-h-screen bg-white text-neutral-950 overflow-x-hidden",
].join(" ")}
      >
        <ClerkProvider
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/templates"
          signUpFallbackRedirectUrl="/templates"
          afterSignOutUrl="/templates"
          afterMultiSessionSingleSignOutUrl="/templates"
        >
          <AppChrome>{children}</AppChrome>
        </ClerkProvider>
      </body>
    </html>
  );
}