"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutNavVisibility } from "@/components/ui/LayoutNavVisibility";

export function AppChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

const isPublicMicrosite =
  pathname === "/s" ||
  pathname.startsWith("/s/") ||
  pathname.startsWith("/s");

  const isPreviewPage = pathname.startsWith("/preview/");

  const shouldShowNav = !isPublicMicrosite;
  const shouldShowFooter = !isPublicMicrosite;

  const shouldOffsetForFixedNav =
    shouldShowNav && !isPreviewPage;

  return (
    <div className="flex min-h-screen flex-col">
      {shouldShowNav ? <LayoutNavVisibility /> : null}

      <div
        className={`w-full min-h-screen bg-white ${
          shouldOffsetForFixedNav ? "pt-6" : ""
        }`}
      >
        {children}
      </div>


    </div>
  );
}