// components/ui/Nav.tsx

"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Container } from "@/components/ui/Container";
import InstallButton from "@/components/pwa/InstallButton";

function isMicrositeHostname(hostname: string) {
  if (!hostname) return false;

  const normalized = hostname.toLowerCase();

  if (normalized === "localhost" || normalized === "127.0.0.1") {
    return false;
  }

  if (normalized.endsWith(".ko-host.com")) {
    return true;
  }

  if (normalized.includes(".vercel.app")) {
    const firstLabel = normalized.split(".")[0] || "";

    if (firstLabel && firstLabel !== "www" && firstLabel !== "ko-host") {
      return true;
    }
  }

  return false;
}

export function Nav() {
  const pathname = usePathname() || "";
  const params = useParams();
  const { isSignedIn } = useAuth();

  const [hostname, setHostname] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (typeof window !== "undefined") {
      setHostname(window.location.hostname || "");
    }
  }, []);

  const isPublishedMicrositePath =
    pathname === "/s" || pathname.startsWith("/s/");

  const isPublishedMicrositeSubdomain = useMemo(
    () => isMicrositeHostname(hostname),
    [hostname],
  );

  if (isPublishedMicrositePath || isPublishedMicrositeSubdomain) {
    return null;
  }

  const isTemplatesPage = pathname.startsWith("/templates");
  const isConnectPage =
  pathname === "/connect" || pathname.startsWith("/connect/");

  const isCreateBuilderPage =
    pathname.startsWith("/create/") &&
    !pathname.includes("/publish") &&
    !pathname.includes("/design");

  const currentTemplate =
    typeof params?.template === "string" ? params.template : "";

  const designsHref = currentTemplate
    ? `/create/${encodeURIComponent(currentTemplate)}/design`
    : "/templates";

  function navigateTo(href: string) {
    if (typeof window === "undefined") return;

    window.location.href = href;
  }

  const secondaryButtonClass =
    "inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50";

  const primaryButtonClass =
    "inline-flex items-center justify-center rounded-xl border border-neutral-900 bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-800";

  return (
    <header className="fixed inset-x-0 top-0 z-[100] border-b border-neutral-200 bg-white">
      <Container
        fullWidth
        className="relative flex h-16 items-center justify-between gap-4 px-4"
      >
        <button
          type="button"
          onClick={() => navigateTo("/")}
          className="relative z-10 flex shrink-0 items-center gap-2 font-semibold tracking-tight"
          aria-label="Go to Ko-Host home"
        >
<img
  src={isConnectPage ? "/KHC_LOGO.png" : "/KH_LOGO.png"}
  alt={isConnectPage ? "Ko-Host Connect" : "Ko-Host"}
  width={isConnectPage ? 101 : 92}
  height={isConnectPage ? 48 : 44}
  className={
    isConnectPage
      ? "h-[48px] w-[101px] object-contain"
      : "h-[44px] w-[92px] object-contain"
  }
  draggable={false}
/>
        </button>

        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex">
<Image
  src={
    isConnectPage
      ? "/CONNECT_BANNER.png"
      : "/SLOGAN BANNER.png"
  }
  alt={
    isConnectPage
      ? "Ko-Host Connect"
      : "Ko-Host slogan"
  }
  width={isConnectPage ? 840 : 420}
  height={isConnectPage ? 80 : 40}
  className={
    isConnectPage
      ? "h-auto max-h-[80px] w-auto object-contain"
      : "h-auto max-h-10 w-auto object-contain"
  }
  priority
/>
        </div>

        <nav className="relative z-10 flex shrink-0 items-center gap-2">
          {!mounted ? (
            <>
              {!isTemplatesPage ? (
                <button
                  type="button"
                  onClick={() => navigateTo("/templates")}
                  className="hidden text-sm text-neutral-700 transition hover:text-neutral-900 sm:inline-flex"
                >
                  Templates
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => navigateTo("/sign-in")}
                className={secondaryButtonClass}
              >
                Sign in
              </button>

<button
  type="button"
  onClick={() => navigateTo("/connect")}
  className={primaryButtonClass}
>
  Connect
</button>
            </>
          ) : !isSignedIn ? (
            <>
              {!isTemplatesPage ? (
                <button
                  type="button"
                  onClick={() => navigateTo("/templates")}
                  className="hidden text-sm text-neutral-700 transition hover:text-neutral-900 sm:inline-flex"
                >
                  Templates
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => navigateTo("/sign-in")}
                className={secondaryButtonClass}
              >
                Sign in
              </button>

<button
  type="button"
  onClick={() => navigateTo("/connect")}
  className={primaryButtonClass}
>
  Connect
</button>
            </>
          ) : (
            <>
              <div className="sm:hidden">
                <InstallButton label="Install" />
              </div>

              {!isTemplatesPage ? (
                <button
                  type="button"
                  onClick={() => navigateTo("/templates")}
                  className={secondaryButtonClass}
                >
                  Templates
                </button>
              ) : null}

              {isCreateBuilderPage ? (
                <button
                  type="button"
                  onClick={() => navigateTo(designsHref)}
                  className={secondaryButtonClass}
                >
                  Designs
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => navigateTo("/dashboard")}
                className={secondaryButtonClass}
              >
                Dashboard
              </button>

              <UserButton />
            </>
          )}
        </nav>
      </Container>
    </header>
  );
}