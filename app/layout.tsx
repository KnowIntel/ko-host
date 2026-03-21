import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
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
import { LayoutNavVisibility } from "@/components/ui/LayoutNavVisibility";

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
          <div className="flex min-h-screen flex-col">
            <LayoutNavVisibility />
            <div className="flex-1">{children}</div>

            <footer className="border-t border-neutral-200 bg-white">
              <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
                <div>© {new Date().getFullYear()} Ko-Host. All rights reserved.</div>

                <div className="flex flex-wrap items-center gap-4">
                  <Link href="/terms" className="transition hover:text-neutral-950 hover:underline">
                    Terms
                  </Link>
                  <Link href="/privacy" className="transition hover:text-neutral-950 hover:underline">
                    Privacy
                  </Link>
                  <Link href="/support" className="transition hover:text-neutral-950 hover:underline">
                    Support
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}