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
          "min-h-screen bg-white text-neutral-950",
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
          <div className="pt-16">
            <AppChrome>{children}</AppChrome>
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}