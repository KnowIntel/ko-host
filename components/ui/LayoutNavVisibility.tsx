"use client";

import { usePathname } from "next/navigation";
import { Nav } from "@/components/ui/Nav";

export function LayoutNavVisibility() {
  const pathname = usePathname();

  const hideNav =
    pathname === "/preview/draft" ||
    pathname.startsWith("/s/") ||
    pathname === "/s";

  if (hideNav) {
    return null;
  }

  return <Nav />;
}