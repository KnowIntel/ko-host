// app\dashboard\layout.tsx

"use client";

import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Container } from "@/components/ui/Container";

const ADMIN_EMAIL = "knowintelligentlife@gmail.com";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useUser();

  const isAdmin =
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() === ADMIN_EMAIL;

  const isBuilderRoute =
    pathname?.includes("/dashboard/microsites/") &&
    pathname?.endsWith("/builder");

  if (isBuilderRoute) {
    return <main className="w-full">{children}</main>;
  }

  return (
    <main>
      <Container className="pt-20 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

          <div className="flex items-center gap-2">
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 hover:border-neutral-900"
            >
              Dashboard Home
            </a>

            {isAdmin ? (
              <a
                href="/dashboard/admin"
                className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100"
              >
                Admin Control Center
              </a>
            ) : null}
          </div>
        </div>

        <div className="mt-6">{children}</div>
      </Container>
    </main>
  );
}