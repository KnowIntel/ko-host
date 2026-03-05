"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";
import InstallButton from "@/components/pwa/InstallButton";

export function Nav() {
  const pathname = usePathname() || "";

  // Hide nav on published microsite pages
  if (pathname === "/s" || pathname.startsWith("/s/")) return null;

  const isTemplatesPage = pathname.startsWith("/templates");

  return (
    <header className="border-b border-neutral-200">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/KH_LOGO.png"
            alt="Ko-Host"
            width={92}
            height={44}
            className="h-[44px] w-[92px]"
            draggable={false}
          />
        </Link>

        <nav className="flex items-center gap-3">
          {/* Install button (only appears when browser allows it) */}
          <InstallButton label="Install" />

          {!isTemplatesPage && (
            <Link href="/templates" className="text-sm text-neutral-700 hover:text-neutral-900">
              Templates
            </Link>
          )}

          <SignedOut>
            <ButtonLink href="/sign-in" variant="secondary">
              Sign in
            </ButtonLink>
            <ButtonLink href="/templates">Get started</ButtonLink>
          </SignedOut>

          <SignedIn>
            <ButtonLink href="/dashboard" variant="secondary">
              Dashboard
            </ButtonLink>
            <UserButton />
          </SignedIn>
        </nav>
      </Container>
    </header>
  );
}