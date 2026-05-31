import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "knowintelligentlife@gmail.com";
const MICROSITE_PRICE = 12;

type RevenueMicrosite = {
  id: string;
  slug: string | null;
  title: string | null;
  owner_email: string | null;
  template_key: string | null;
  selected_design_key: string | null;
  is_published: boolean | null;
  paid_until: string | null;
  created_at: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function getDaysUntil(value: string | null) {
  if (!value) return null;

  const ms = new Date(value).getTime() - Date.now();

  if (Number.isNaN(ms)) return null;

  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export default async function AdminRevenuePage() {
  const user = await currentUser();
  const userEmail =
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  const supabase = getSupabaseAdmin();

  const [{ data: microsites }, { data: pendingCheckouts }] = await Promise.all([
    supabase
      .from("microsites")
      .select(`
        id,
        slug,
        title,
        owner_email,
        template_key,
        selected_design_key,
        is_published,
        paid_until,
        created_at
      `)
      .eq("is_preset", false),

    supabase
      .from("pending_microsite_checkouts")
      .select(`
        id,
        slug,
        title,
        template_key,
        selected_design_key,
        created_at,
        processed_at
      `),
  ]);

  const sites = (microsites ?? []) as RevenueMicrosite[];

  const publishedSites = sites.filter((site) => site.is_published);
  const activePaidSites = publishedSites.filter((site) => {
    const days = getDaysUntil(site.paid_until);
    return days !== null && days > 0;
  });

  const expiredPaidSites = publishedSites.filter((site) => {
    const days = getDaysUntil(site.paid_until);
    return days !== null && days <= 0;
  });

  const renewalRiskSites = activePaidSites
    .map((site) => ({
      ...site,
      daysUntilExpiration: getDaysUntil(site.paid_until),
    }))
    .filter(
      (site) =>
        site.daysUntilExpiration !== null &&
        site.daysUntilExpiration <= 14,
    )
    .sort(
      (a, b) =>
        (a.daysUntilExpiration ?? 999) -
        (b.daysUntilExpiration ?? 999),
    );

  const estimatedGrossRevenue = publishedSites.length * MICROSITE_PRICE;
  const activePaidRevenue = activePaidSites.length * MICROSITE_PRICE;
  const expiredRevenue = expiredPaidSites.length * MICROSITE_PRICE;

  const pendingCount =
    pendingCheckouts?.filter((row) => !row.processed_at).length ?? 0;

  const templateRevenue = new Map<string, number>();
  const designRevenue = new Map<string, number>();

  for (const site of publishedSites) {
    const templateKey = site.template_key || "unknown";
    const designKey = site.selected_design_key || "blank";

    templateRevenue.set(
      templateKey,
      (templateRevenue.get(templateKey) ?? 0) + MICROSITE_PRICE,
    );

    designRevenue.set(
      designKey,
      (designRevenue.get(designKey) ?? 0) + MICROSITE_PRICE,
    );
  }

  const topTemplates = Array.from(templateRevenue.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const topDesigns = Array.from(designRevenue.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const recentPaidSites = [...publishedSites]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime(),
    )
    .slice(0, 15);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
              Ko-Host Admin
            </div>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-950">
              Revenue
            </h1>

            <p className="mt-2 text-sm text-neutral-600">
              Estimated platform revenue, paid microsite activity, renewal risk, and template performance.
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
        <Stat label="Published Sites" value={publishedSites.length} />
        <Stat label="Active Paid" value={activePaidSites.length} />
        <Stat label="Expired Paid" value={expiredPaidSites.length} />
        <Stat label="Pending Checkouts" value={pendingCount} />
        <Stat label="Gross Estimate" value={formatCurrency(estimatedGrossRevenue)} />
        <Stat label="Active Revenue" value={formatCurrency(activePaidRevenue)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <RevenueList
          title="Top Revenue Templates"
          rows={topTemplates}
          emptyText="No template revenue yet."
        />

        <RevenueList
          title="Top Revenue Designs"
          rows={topDesigns}
          emptyText="No design revenue yet."
        />

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-neutral-950">
            Revenue Summary
          </h2>

          <div className="mt-4 space-y-2">
            <SummaryRow label="Gross estimate" value={formatCurrency(estimatedGrossRevenue)} />
            <SummaryRow label="Active paid revenue" value={formatCurrency(activePaidRevenue)} />
            <SummaryRow label="Expired revenue" value={formatCurrency(expiredRevenue)} />
            <SummaryRow
              label="Average per published site"
              value={
                publishedSites.length
                  ? formatCurrency(estimatedGrossRevenue / publishedSites.length)
                  : "$0.00"
              }
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <SitePanel
          title="Recent Paid / Published Sites"
          sites={recentPaidSites}
          emptyText="No published sites yet."
        />

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-neutral-950">
            Renewal Risk
          </h2>

          <p className="mt-2 text-sm text-neutral-600">
            Active paid microsites expiring in the next 14 days.
          </p>

          <div className="mt-4 space-y-2">
            {renewalRiskSites.length ? (
              renewalRiskSites.slice(0, 15).map((site) => (
                <div
                  key={site.id}
                  className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
                >
                  <div className="font-bold text-amber-950">
                    {site.title || site.slug || "Untitled"}
                  </div>

                  <div className="mt-1 font-mono text-xs text-amber-700">
                    {site.slug || site.id}
                  </div>

                  <div className="mt-2 text-xs font-black text-amber-800">
                    Expires in {site.daysUntilExpiration} day
                    {site.daysUntilExpiration === 1 ? "" : "s"}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/microsites/${site.id}`}
                      className="rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-amber-800 hover:border-amber-500"
                    >
                      Manage
                    </Link>

                    {site.slug ? (
                      <a
                        href={`https://${site.slug}.ko-host.com`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl bg-amber-700 px-3 py-2 text-xs font-bold text-white hover:bg-amber-800"
                      >
                        Open
                      </a>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center text-sm font-semibold text-neutral-500">
                No renewal risk sites found.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function RevenueList({
  title,
  rows,
  emptyText,
}: {
  title: string;
  rows: [string, number][];
  emptyText: string;
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-black text-neutral-950">{title}</h2>

      <div className="mt-4 space-y-2">
        {rows.length ? (
          rows.map(([label, revenue]) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-xl border border-neutral-100 px-4 py-3"
            >
              <span className="font-semibold">{label}</span>
              <span className="font-black">{formatCurrency(revenue)}</span>
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

function SitePanel({
  title,
  sites,
  emptyText,
}: {
  title: string;
  sites: RevenueMicrosite[];
  emptyText: string;
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-black text-neutral-950">{title}</h2>

      <div className="mt-4 space-y-2">
        {sites.length ? (
          sites.map((site) => (
            <div
              key={site.id}
              className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3"
            >
              <div className="font-bold text-neutral-950">
                {site.title || site.slug || "Untitled"}
              </div>

              <div className="mt-1 font-mono text-xs text-neutral-500">
                {site.slug || site.id}
              </div>

              <div className="mt-2 grid gap-1 text-xs font-semibold text-neutral-600 sm:grid-cols-2">
                <div>Template: {site.template_key || "unknown"}</div>
                <div>Design: {site.selected_design_key || "blank"}</div>
                <div>Owner: {site.owner_email || "unknown"}</div>
                <div>Paid until: {formatDate(site.paid_until)}</div>
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

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-100 px-4 py-3">
      <span className="font-semibold text-neutral-700">{label}</span>
      <span className="font-black text-neutral-950">{value}</span>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
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