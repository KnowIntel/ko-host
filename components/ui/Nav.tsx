"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";
import InstallButton from "@/components/pwa/InstallButton";

export function Nav() {
  const pathname = usePathname() || "";
  const params = useParams();
  const { isSignedIn } = useAuth();

  const hostname =
    typeof window !== "undefined" ? window.location.hostname.toLowerCase() : "";

  const isPublicMicrositeHost =
    hostname.endsWith(".ko-host.com") && hostname !== "ko-host.com";

  if (isPublicMicrositeHost || pathname === "/s" || pathname.startsWith("/s/")) {
    return null;
  }

  const isTemplatesPage = pathname.startsWith("/templates");
  const isCreateBuilderPage =
    pathname.startsWith("/create/") &&
    !pathname.includes("/publish") &&
    !pathname.includes("/design");

  const currentTemplate =
    typeof params?.template === "string" ? params.template : "";

  const designsHref = currentTemplate
    ? `/create/${encodeURIComponent(currentTemplate)}/design`
    : "/templates";

  return (
    <header className="fixed inset-x-0 top-0 z-[100] border-b border-neutral-200 bg-white">
      <Container className="relative flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="relative z-10 flex shrink-0 items-center gap-2 font-semibold tracking-tight"
        >
          <img
            src="/KH_LOGO.png"
            alt="Ko-Host"
            width={92}
            height={44}
            className="h-[44px] w-[92px]"
            draggable={false}
          />
        </Link>

        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex">
          <Image
            src="/SLOGAN BANNER.png"
            alt="Ko-Host slogan"
            width={420}
            height={40}
            className="h-auto max-h-10 w-auto object-contain"
            priority
          />
        </div>

        <nav className="relative z-10 flex shrink-0 items-center gap-2">
          {!isSignedIn ? (
            <>
              {!isTemplatesPage ? (
                <Link
                  href="/templates"
                  className="hidden text-sm text-neutral-700 hover:text-neutral-900 sm:inline-flex"
                >
                  Templates
                </Link>
              ) : null}

              <ButtonLink href="/sign-in" variant="secondary">
                Sign in
              </ButtonLink>

              <ButtonLink href="/templates">Get started</ButtonLink>
            </>
          ) : (
            <>
              <div className="sm:hidden">
                <InstallButton label="Install" />
              </div>

              {!isTemplatesPage ? (
                <ButtonLink href="/templates" variant="secondary">
                  Templates
                </ButtonLink>
              ) : null}

              {isCreateBuilderPage ? (
                <ButtonLink href={designsHref} variant="secondary">
                  Designs
                </ButtonLink>
              ) : null}

              <ButtonLink href="/dashboard" variant="secondary">
                Dashboard
              </ButtonLink>

              <UserButton />
            </>
          )}
        </nav>
      </Container>
    </header>
  );
}