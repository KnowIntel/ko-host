import "./globals.css";

import { AppChrome } from "@/components/ui/AppChrome";
import { APP_FONT_VARIABLES } from "@/lib/fontLoaders";

import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Ko-Host",
  description: "Temporary microsites powered by structured templates.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${APP_FONT_VARIABLES} min-h-screen bg-white text-neutral-950 overflow-x-hidden`}
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