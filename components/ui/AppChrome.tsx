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
  const shouldOffsetForFixedNav = shouldShowNav && !isPreviewPage;

  return (
    <div className="flex min-h-screen flex-col">
      {shouldShowNav ? <LayoutNavVisibility /> : null}

      <div className={shouldOffsetForFixedNav ? "flex-1 pt-16" : "flex-1"}>
        {children}
      </div>

      {!isPublicMicrosite ? (
        <footer className="border-t border-neutral-200 bg-white">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex w-full flex-col items-center justify-between gap-3 text-center text-sm text-neutral-600 sm:flex-row sm:text-left">
              <div className="min-w-0">
                © 2026 Ko-Host. All rights reserved.
              </div>

              <div className="flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:w-auto sm:justify-end">
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
          </div>
        </footer>
      ) : null}
    </div>
  );
}