import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "knowintelligentlife@gmail.com";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default async function AdminAnalyticsPage() {
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  const supabase = getSupabaseAdmin();

const { data: activityLogs } = await supabase
  .from("admin_activity_log")
  .select(`
    id,
    admin_email,
    action,
    target_type,
    target_id,
    created_at
  `)
  .order("created_at", { ascending: false })
  .limit(1000);

const logs = activityLogs ?? [];

const today = new Date();
today.setHours(0, 0, 0, 0);

const totalLogs = logs.length;

const todayLogs = logs.filter(
  (log) =>
    new Date(log.created_at).getTime() >= today.getTime(),
).length;

const micrositeLogs = logs.filter(
  (log) => log.target_type === "microsite",
).length;

const supportLogs = logs.filter(
  (log) => log.target_type === "support_request",
).length;

const claimLogs = logs.filter(
  (log) => log.target_type === "claim_offer_request",
).length;

const featureLogs = logs.filter(
  (log) => log.target_type === "feature_request",
).length;

const uniqueAdmins = new Set(
  logs.map((log) => log.admin_email),
).size;

const stats = [
  {
    label: "Total Activity",
    value: totalLogs,
    note: "Logged admin actions",
  },
  {
    label: "Today",
    value: todayLogs,
    note: "Actions today",
  },
  {
    label: "Microsites",
    value: micrositeLogs,
    note: "Microsite activity",
  },
  {
    label: "Support",
    value: supportLogs,
    note: "Support activity",
  },
  {
    label: "Claims",
    value: claimLogs,
    note: "Claim activity",
  },
  {
    label: "Features",
    value: featureLogs,
    note: "Feature activity",
  },
  {
    label: "Admins",
    value: uniqueAdmins,
    note: "Unique admins",
  },
];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Ko-Host Admin
            </div>

<h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-950">
  Audit Dashboard
</h1>

<p className="mt-2 text-sm text-neutral-600">
  Monitor admin activity, operational trends, and recent platform changes.
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <div className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
              {stat.label}
            </div>

<div className="mt-3 text-4xl font-black tracking-tight text-neutral-950">
  {typeof stat.value === "number" ? formatNumber(stat.value) : stat.value}
</div>

            <p className="mt-2 text-xs font-semibold text-neutral-500">
              {stat.note}
            </p>
          </div>
        ))}
      </section>

<section className="grid gap-4 lg:grid-cols-3">
  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
    <h2 className="text-lg font-black text-neutral-950">
      Most Common Actions
    </h2>

    <div className="mt-4 space-y-2">
      {Object.entries(
        logs.reduce((acc, log) => {
          acc[log.action] = (acc[log.action] ?? 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([action, count]) => (
          <div
            key={action}
            className="flex items-center justify-between rounded-xl border border-neutral-100 px-4 py-3"
          >
            <span className="font-semibold text-neutral-700">
              {action}
            </span>

            <span className="font-black text-neutral-950">
              {count}
            </span>
          </div>
        ))}
    </div>
  </div>

  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
    <h2 className="text-lg font-black text-neutral-950">
      Activity By Type
    </h2>

    <div className="mt-4 space-y-2">
      {Object.entries(
        logs.reduce((acc, log) => {
          const key = log.target_type || "unknown";
          acc[key] = (acc[key] ?? 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      )
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => (
          <div
            key={type}
            className="flex items-center justify-between rounded-xl border border-neutral-100 px-4 py-3"
          >
            <span className="font-semibold text-neutral-700">
              {type}
            </span>

            <span className="font-black text-neutral-950">
              {count}
            </span>
          </div>
        ))}
    </div>
  </div>

  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
    <h2 className="text-lg font-black text-neutral-950">
      Recent Activity
    </h2>

    <div className="mt-4 space-y-2">
      {logs.slice(0, 25).map((log) => (
        <div
          key={log.id}
          className="rounded-xl border border-neutral-100 px-4 py-3"
        >
          <div className="font-bold text-neutral-900">
            {log.action}
          </div>

          <div className="mt-1 text-xs text-neutral-500">
            {log.target_type || "system"}
          </div>

          <div className="mt-1 text-xs text-neutral-400">
            {new Date(log.created_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
    </div>
  );
}