// components/ui/Nav.tsx
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function Nav() {
  return (
    <header className="border-b border-neutral-200">
      <Container className="flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">
          Ko-Host
        </Link>

        <nav className="flex items-center gap-3">
          <Link href="/#templates" className="text-sm text-neutral-700 hover:text-neutral-900">
            Templates
          </Link>

          <SignedOut>
            <ButtonLink href="/sign-in" variant="secondary">
              Sign in
            </ButtonLink>
            <ButtonLink href="/sign-up">Get started</ButtonLink>
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