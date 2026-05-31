import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "knowintelligentlife@gmail.com";

const blockCategories = [
  "Text",
  "Media",
  "Layout",
  "Forms",
  "Exchange",
  "Utilities",
  "Data & Metrics",
  "Scheduling",
  "Premium",
];

const futureTools = [
  "Enable / Disable Block",
  "Premium Only Toggle",
  "Experimental Flag",
  "Beta Release Flag",
  "Usage Analytics",
  "Abandonment Analytics",
  "Render Failure Tracking",
  "Category Assignment",
];

export default async function AdminBlocksPage() {
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Ko-Host Admin
            </div>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-950">
              Block Registry
            </h1>

            <p className="mt-2 text-sm text-neutral-600">
              Future control panel for builder blocks, premium access, beta releases, and usage analytics.
            </p>
          </div>

          <Link
            href="/dashboard/admin"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-bold text-neutral-900 hover:border-neutral-900"
          >
            Back to Admin
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Block Categories" value={blockCategories.length} />
        <Stat label="Registry Status" value="Read Only" />
        <Stat label="Analytics" value="Planned" />
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-neutral-950">
          Builder Categories
        </h2>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {blockCategories.map((category) => (
            <div
              key={category}
              className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-sm font-bold text-neutral-700"
            >
              {category}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-neutral-950">
          Future Registry Tools
        </h2>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {futureTools.map((tool) => (
            <div
              key={tool}
              className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-sm font-bold text-neutral-700"
            >
              {tool}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
        {label}
      </div>

      <div className="mt-3 text-3xl font-black tracking-tight text-neutral-950">
        {value}
      </div>
    </div>
  );
}