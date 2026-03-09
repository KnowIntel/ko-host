// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Great_Vibes, Cormorant_Garamond } from "next/font/google";
import { LayoutNavVisibility } from "@/components/ui/LayoutNavVisibility";

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
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
    <ClerkProvider>
      <html lang="en">
        <body className={`${greatVibes.variable} ${cormorant.variable}`}>
          <LayoutNavVisibility />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}