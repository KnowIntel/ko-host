"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function Nav() {
  const pathname = usePathname() || "";

  // ✅ Hide global nav on published microsite pages (your route: /s/[slug]/...)
  if (pathname === "/s" || pathname.startsWith("/s/")) return null;

  return (
    <header className="border-b border-neutral-200">
      <Container className="flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <img
            src="/icon.png"
            alt="Ko-Host"
            width={22}
            height={22}
            className="h-[22px] w-[22px] rounded-[6px]"
            draggable={false}
          />
          <span>Ko-Host</span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link href="/templates" className="text-sm text-neutral-700 hover:text-neutral-900">
            Templates
          </Link>

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