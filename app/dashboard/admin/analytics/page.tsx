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

const [
  { data: microsites },
  { data: pendingCheckouts },
  { data: claimRequests },
  { data: supportRequests },
] = await Promise.all([
  supabase
    .from("microsites")
    .select(`
      id,
      template_key,
      selected_design_key,
      is_active,
      is_published,
      paid_until,
      created_at
    `)
    .eq("is_preset", false),

  supabase
    .from("pending_microsite_checkouts")
    .select(`
      id,
      template_key,
      selected_design_key,
      processed_at,
      created_at
    `),

  supabase
    .from("claim_offer_requests")
    .select(`
      id,
      status,
      created_at
    `),

  supabase
    .from("support_requests")
    .select(`
      id,
      status,
      created_at
    `),
]);

const totalMicrosites = microsites?.length ?? 0;

const publishedMicrosites =
  microsites?.filter((site) => site.is_published).length ?? 0;

const activeMicrosites =
  microsites?.filter((site) => site.is_active).length ?? 0;

const expiredMicrosites =
  microsites?.filter(
    (site) =>
      site.paid_until &&
      new Date(site.paid_until).getTime() < Date.now(),
  ).length ?? 0;

const pendingCount =
  pendingCheckouts?.filter((row) => !row.processed_at).length ?? 0;

const claimOffers = claimRequests?.length ?? 0;
const supportCount = supportRequests?.length ?? 0;

const publishedRate =
  totalMicrosites > 0
    ? Math.round((publishedMicrosites / totalMicrosites) * 100)
    : 0;

const stats = [
  {
    label: "Microsites",
    value: totalMicrosites,
    note: "All microsites",
  },
  {
    label: "Published",
    value: publishedMicrosites,
    note: `${publishedRate}% publish rate`,
  },
  {
    label: "Active",
    value: activeMicrosites,
    note: "Currently active",
  },
  {
    label: "Expired",
    value: expiredMicrosites,
    note: "Past paid term",
  },
  {
    label: "Pending",
    value: pendingCount,
    note: "Pending checkout",
  },
  {
    label: "Claims",
    value: claimOffers,
    note: "Custom requests",
  },
  {
    label: "Support",
    value: supportCount,
    note: "Support tickets",
  },
  {
    label: "Revenue",
    value: `$${publishedMicrosites * 12}`,
    note: "Estimated gross",
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
              Analytics
            </h1>

            <p className="mt-2 text-sm text-neutral-600">
              Lightweight platform metrics using existing Ko-Host tables.
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

<section className="grid gap-4 lg:grid-cols-4">
  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
    <h2 className="text-lg font-black text-neutral-950">
      Top Templates
    </h2>

    <div className="mt-4 space-y-2">
      {Array.from(
        (microsites ?? []).reduce((map, site) => {
          const key = site.template_key || "unknown";
          map.set(key, (map.get(key) ?? 0) + 1);
          return map;
        }, new Map<string, number>()),
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([template, count]) => (
          <div
            key={template}
            className="flex items-center justify-between rounded-xl border border-neutral-100 px-3 py-2"
          >
            <span className="font-semibold">{template}</span>
            <span className="font-black">{count}</span>
          </div>
        ))}
    </div>
  </div>

  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
    <h2 className="text-lg font-black text-neutral-950">
      Top Designs
    </h2>

    <div className="mt-4 space-y-2">
      {Array.from(
        (microsites ?? []).reduce((map, site) => {
          const key = site.selected_design_key || "blank";
          map.set(key, (map.get(key) ?? 0) + 1);
          return map;
        }, new Map<string, number>()),
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([design, count]) => (
          <div
            key={design}
            className="flex items-center justify-between rounded-xl border border-neutral-100 px-3 py-2"
          >
            <span className="font-semibold">{design}</span>
            <span className="font-black">{count}</span>
          </div>
        ))}
    </div>
  </div>

  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
    <h2 className="text-lg font-black text-neutral-950">
      Recent Activity
    </h2>

    <div className="mt-4 space-y-2">
      {[
        ...(microsites ?? []).map((item) => ({
          type: "Microsite",
          date: item.created_at,
          label: item.template_key || "unknown",
        })),
        ...(claimRequests ?? []).map((item) => ({
          type: "Claim",
          date: item.created_at,
          label: item.status || "new",
        })),
        ...(supportRequests ?? []).map((item) => ({
          type: "Support",
          date: item.created_at,
          label: item.status || "new",
        })),
      ]
        .sort(
          (a, b) =>
            new Date(b.date).getTime() -
            new Date(a.date).getTime(),
        )
        .slice(0, 15)
        .map((activity, index) => (
          <div
            key={`${activity.type}-${index}`}
            className="rounded-xl border border-neutral-100 px-3 py-2"
          >
            <div className="font-bold">
              {activity.type}
            </div>

            <div className="text-xs text-neutral-500">
              {activity.label}
            </div>
          </div>
        ))}
    </div>
  </div>

  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
  <h2 className="text-lg font-black text-neutral-950">
    Conversion Funnel
  </h2>

  <div className="mt-4 space-y-3">
    <div className="flex items-center justify-between rounded-xl border border-neutral-100 px-4 py-3">
      <span>Pending Checkouts</span>
      <span className="font-black">{pendingCount}</span>
    </div>

    <div className="flex items-center justify-between rounded-xl border border-neutral-100 px-4 py-3">
      <span>Published</span>
      <span className="font-black">{publishedMicrosites}</span>
    </div>

    <div className="flex items-center justify-between rounded-xl border border-neutral-100 px-4 py-3">
      <span>Active</span>
      <span className="font-black">{activeMicrosites}</span>
    </div>

    <div className="flex items-center justify-between rounded-xl border border-neutral-100 px-4 py-3">
      <span>Expired</span>
      <span className="font-black">{expiredMicrosites}</span>
    </div>
  </div>
</div>
</section>
    </div>
  );
}