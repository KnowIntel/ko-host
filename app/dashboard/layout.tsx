"use client";

import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isBuilderRoute =
    pathname?.includes("/dashboard/microsites/") &&
    pathname?.endsWith("/builder");

  if (isBuilderRoute) {
    return <main className="w-full">{children}</main>;
  }

  return (
    <main>
      <Container className="py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        </div>
        <div className="mt-6">{children}</div>
      </Container>
    </main>
  );
}