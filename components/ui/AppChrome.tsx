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
  const isPublicMicrosite = pathname.startsWith("/s/");
  const isPreviewPage = pathname.startsWith("/preview/");
  const shouldShowNav = !isPublicMicrosite;
  const shouldOffsetForFixedNav =
    shouldShowNav && !isPreviewPage;

  return (
    <div className="flex min-h-screen flex-col">
      {shouldShowNav ? <LayoutNavVisibility /> : null}

      <div className={shouldOffsetForFixedNav ? "flex-1 pt-16" : "flex-1"}>
        {children}
      </div>

      {!isPublicMicrosite ? (
        <footer className="border-t border-neutral-200 bg-white">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} Ko-Host. All rights reserved.</div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/terms"
                className="transition hover:text-neutral-950 hover:underline"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="transition hover:text-neutral-950 hover:underline"
              >
                Privacy
              </Link>
              <Link
                href="/support"
                className="transition hover:text-neutral-950 hover:underline"
              >
                Support
              </Link>
            </div>
          </div>
        </footer>
      ) : null}
    </div>
  );
}