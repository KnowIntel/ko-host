// app/dashboard/page.tsx
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = await auth();

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="text-sm text-neutral-600">Signed in as</div>
      <div className="mt-1 font-mono text-sm">{userId ?? "unknown"}</div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/dashboard/microsites/new"
          className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Create a microsite
        </Link>
        <Link
          href="/#templates"
          className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
        >
          Browse templates
        </Link>
      </div>
    </div>
  );
}