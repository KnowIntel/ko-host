import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "knowintelligentlife@gmail.com";

type HealthMicrosite = {
  id: string;
  slug: string | null;
  title: string | null;
  is_active: boolean | null;
  is_published: boolean | null;
  paid_until: string | null;
  stripe_account_id: string | null;
  stripe_charges_enabled: boolean | null;
};

export default async function AdminHealthPage() {
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  const supabase = getSupabaseAdmin();

  const [{ data: microsites }, { data: claims }, { data: support }] =
    await Promise.all([
      supabase
        .from("microsites")
        .select(
          "id, slug, title, is_active, is_published, paid_until, stripe_account_id, stripe_charges_enabled",
        )
        .eq("is_preset", false),

      supabase
        .from("claim_offer_requests")
        .select("id, status, is_archived"),

      supabase
        .from("support_requests")
        .select("id, status, priority"),
    ]);

  const sites = (microsites ?? []) as HealthMicrosite[];
  const now = Date.now();

  const expiredPublishedSites = sites.filter(
    (site) =>
      site.is_published &&
      site.paid_until &&
      new Date(site.paid_until).getTime() < now,
  );

  const inactivePublishedSites = sites.filter(
    (site) => site.is_published && site.is_active === false,
  );

  const stripeIncompleteSites = sites.filter(
    (site) => site.stripe_account_id && !site.stripe_charges_enabled,
  );

  const stripeConnected = sites.filter((site) => site.stripe_account_id).length;
  const stripeReady = sites.filter((site) => site.stripe_charges_enabled).length;

  const openClaims =
    claims?.filter(
      (item) =>
        item.status !== "complete" &&
        item.status !== "archived" &&
        item.is_archived !== true,
    ).length ?? 0;

  const urgentSupport =
    support?.filter((item) => item.priority === "urgent").length ?? 0;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-red-600">
              Ko-Host Admin
            </div>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-950">
              System Health
            </h1>

            <p className="mt-2 text-sm text-neutral-600">
              Operational checks for expired sites, publishing state, Stripe readiness, and admin queues.
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Stat label="Microsites" value={sites.length} />
        <Stat label="Expired Published" value={expiredPublishedSites.length} />
        <Stat label="Inactive Published" value={inactivePublishedSites.length} />
        <Stat label="Stripe Connected" value={stripeConnected} />
        <Stat label="Payments Ready" value={stripeReady} />
        <Stat label="Urgent Support" value={urgentSupport} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <HealthCard
          title="Publishing Health"
          items={[
            ["Expired but published", expiredPublishedSites.length],
            ["Inactive but published", inactivePublishedSites.length],
            ["Open claim requests", openClaims],
          ]}
        />

        <HealthCard
          title="Stripe Health"
          items={[
            ["Sites with Stripe account", stripeConnected],
            ["Payment-ready sites", stripeReady],
            ["Stripe incomplete", stripeIncompleteSites.length],
          ]}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <SiteList
          title="Expired Published Sites"
          emptyText="No expired published sites."
          sites={expiredPublishedSites}
        />

        <SiteList
          title="Inactive Published Sites"
          emptyText="No inactive published sites."
          sites={inactivePublishedSites}
        />

        <SiteList
          title="Stripe Incomplete Sites"
          emptyText="No incomplete Stripe sites."
          sites={stripeIncompleteSites}
        />
      </section>
    </div>
  );
}

function HealthCard({
  title,
  items,
}: {
  title: string;
  items: [string, number][];
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-black text-neutral-950">{title}</h2>

      <div className="mt-4 space-y-2">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-xl border border-neutral-100 px-4 py-3"
          >
            <span className="font-semibold text-neutral-700">{label}</span>
            <span className="font-black text-neutral-950">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SiteList({
  title,
  emptyText,
  sites,
}: {
  title: string;
  emptyText: string;
  sites: HealthMicrosite[];
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-black text-neutral-950">{title}</h2>

      <div className="mt-4 space-y-2">
        {sites.length ? (
          sites.slice(0, 12).map((site) => (
            <div
              key={site.id}
              className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3"
            >
              <div className="font-bold text-neutral-950">
                {site.title || site.slug || "Untitled"}
              </div>

              <div className="mt-1 break-all font-mono text-xs text-neutral-500">
                {site.slug || site.id}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/microsites/${site.id}`}
                  className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-bold text-neutral-900 hover:border-neutral-900"
                >
                  Manage
                </Link>

                {site.slug ? (
                  <a
                    href={`https://${site.slug}.ko-host.com`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-blue-600 bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
                  >
                    Open
                  </a>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center text-sm font-semibold text-neutral-500">
            {emptyText}
          </div>
        )}
      </div>
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