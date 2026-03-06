"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";

export function Nav() {
  const pathname = usePathname() || "";

  if (pathname === "/s" || pathname.startsWith("/s/")) return null;

  return (
    <header className="border-b border-neutral-200 bg-white">
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
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-900"
            title="Install"
          >
            ↓
          </button>

          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900"
          >
            Dashboard
          </Link>

          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900"
          >
            Profile
          </button>
        </nav>
      </Container>
    </header>
  );
}