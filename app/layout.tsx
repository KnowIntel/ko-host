// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Nav } from "@/components/ui/Nav";

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
      <body>
        <ClerkProvider>
          <Nav />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}