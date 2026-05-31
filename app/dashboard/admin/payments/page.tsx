import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "knowintelligentlife@gmail.com";
const MICROSITE_PRICE = 12;

type PaymentMicrosite = {
  id: string;
  slug: string | null;
  title: string | null;
  owner_email: string | null;
  template_key: string | null;
  selected_design_key: string | null;
  is_published: boolean | null;
  is_active: boolean | null;
  paid_until: string | null;
  stripe_account_id: string | null;
  stripe_charges_enabled: boolean | null;
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
  return new Date(value).toLocaleString();
}

function getDaysUntil(value: string | null) {
  if (!value) return null;

  const ms = new Date(value).getTime() - Date.now();

  if (Number.isNaN(ms)) return null;

  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export default async function AdminPaymentsPage() {
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
        is_active,
        paid_until,
        stripe_account_id,
        stripe_charges_enabled,
        created_at
      `)
      .eq("is_preset", false),

    supabase
      .from("pending_microsite_checkouts")
      .select(`
        id,
        owner_clerk_user_id,
        slug,
        title,
        template_key,
        selected_design_key,
        stripe_session_id,
        processed_at,
        created_at
      `)
      .order("created_at", { ascending: false }),
  ]);

  const sites = (microsites ?? []) as PaymentMicrosite[];

  const paidSites = sites.filter((site) => site.paid_until);
  const activePaidSites = paidSites.filter((site) => {
    const days = getDaysUntil(site.paid_until);
    return days !== null && days > 0;
  });
  const expiredPaidSites = paidSites.filter((site) => {
    const days = getDaysUntil(site.paid_until);
    return days !== null && days <= 0;
  });

  const publishedSites = sites.filter((site) => site.is_published);
  const pendingRows = pendingCheckouts ?? [];
  const openPendingRows = pendingRows.filter((row) => !row.processed_at);
  const processedPendingRows = pendingRows.filter((row) => row.processed_at);

  const stripeConnectedSites = sites.filter((site) => site.stripe_account_id);
  const stripeReadySites = sites.filter((site) => site.stripe_charges_enabled);

  const estimatedGross = paidSites.length * MICROSITE_PRICE;
  const activePaidGross = activePaidSites.length * MICROSITE_PRICE;
  const expiredPaidGross = expiredPaidSites.length * MICROSITE_PRICE;

  const checkoutConversionRate =
    pendingRows.length > 0
      ? Math.round((processedPendingRows.length / pendingRows.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
              Ko-Host Admin
            </div>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-950">
              Payments
            </h1>

            <p className="mt-2 text-sm text-neutral-600">
              Payment health, pending checkouts, paid microsites, Stripe readiness, and renewal exposure.
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
        <Stat label="Paid Sites" value={paidSites.length} />
        <Stat label="Active Paid" value={activePaidSites.length} />
        <Stat label="Expired Paid" value={expiredPaidSites.length} />
        <Stat label="Published" value={publishedSites.length} />
        <Stat label="Pending" value={openPendingRows.length} />
        <Stat label="Processed" value={processedPendingRows.length} />
        <Stat label="Gross Estimate" value={formatCurrency(estimatedGross)} />
        <Stat label="Conversion" value={`${checkoutConversionRate}%`} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <SummaryCard
          title="Payment Summary"
          rows={[
            ["Estimated gross", formatCurrency(estimatedGross)],
            ["Active paid gross", formatCurrency(activePaidGross)],
            ["Expired paid gross", formatCurrency(expiredPaidGross)],
            ["Price per microsite", formatCurrency(MICROSITE_PRICE)],
          ]}
        />

        <SummaryCard
          title="Checkout Health"
          rows={[
            ["Pending checkout rows", openPendingRows.length],
            ["Processed checkout rows", processedPendingRows.length],
            ["Conversion rate", `${checkoutConversionRate}%`],
            ["Total checkout rows", pendingRows.length],
          ]}
        />

        <SummaryCard
          title="Stripe Readiness"
          rows={[
            ["Stripe connected sites", stripeConnectedSites.length],
            ["Stripe charges enabled", stripeReadySites.length],
            [
              "Stripe incomplete",
              Math.max(stripeConnectedSites.length - stripeReadySites.length, 0),
            ],
            ["Non-connected sites", Math.max(sites.length - stripeConnectedSites.length, 0)],
          ]}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <PendingCheckoutPanel rows={openPendingRows.slice(0, 20)} />

        <PaidSitesPanel sites={activePaidSites.slice(0, 20)} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ExpiredPaidPanel sites={expiredPaidSites.slice(0, 20)} />

        <StripeIncompletePanel
          sites={stripeConnectedSites
            .filter((site) => !site.stripe_charges_enabled)
            .slice(0, 20)}
        />
      </section>
    </div>
  );
}

function SummaryCard({
  title,
  rows,
}: {
  title: string;
  rows: [string, string | number][];
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-black text-neutral-950">{title}</h2>

      <div className="mt-4 space-y-2">
        {rows.map(([label, value]) => (
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

function PendingCheckoutPanel({ rows }: { rows: any[] }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-black text-neutral-950">
        Open Pending Checkouts
      </h2>

      <div className="mt-4 space-y-2">
        {rows.length ? (
          rows.map((row) => (
            <div
              key={row.id}
              className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
            >
              <div className="font-bold text-amber-950">
                {row.title || row.slug || "Untitled Checkout"}
              </div>

              <div className="mt-1 font-mono text-xs text-amber-700">
                {row.slug || row.id}
              </div>

              <div className="mt-2 text-xs font-semibold text-amber-800">
                Template: {row.template_key || "unknown"} · Design:{" "}
                {row.selected_design_key || "blank"}
              </div>

              <div className="mt-1 text-xs font-semibold text-amber-700">
                Created {formatDate(row.created_at)}
              </div>
            </div>
          ))
        ) : (
          <EmptyState text="No open pending checkouts." />
        )}
      </div>
    </div>
  );
}

function PaidSitesPanel({ sites }: { sites: PaymentMicrosite[] }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-black text-neutral-950">
        Active Paid Sites
      </h2>

      <div className="mt-4 space-y-2">
        {sites.length ? (
          sites.map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              tone="green"
              footer={`Paid until ${formatDate(site.paid_until)}`}
            />
          ))
        ) : (
          <EmptyState text="No active paid sites." />
        )}
      </div>
    </div>
  );
}

function ExpiredPaidPanel({ sites }: { sites: PaymentMicrosite[] }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-black text-neutral-950">
        Expired Paid Sites
      </h2>

      <div className="mt-4 space-y-2">
        {sites.length ? (
          sites.map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              tone="red"
              footer={`Expired ${formatDate(site.paid_until)}`}
            />
          ))
        ) : (
          <EmptyState text="No expired paid sites." />
        )}
      </div>
    </div>
  );
}

function StripeIncompletePanel({ sites }: { sites: PaymentMicrosite[] }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-black text-neutral-950">
        Stripe Incomplete
      </h2>

      <div className="mt-4 space-y-2">
        {sites.length ? (
          sites.map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              tone="amber"
              footer="Stripe account exists, but charges are not enabled."
            />
          ))
        ) : (
          <EmptyState text="No incomplete Stripe sites." />
        )}
      </div>
    </div>
  );
}

function SiteCard({
  site,
  tone,
  footer,
}: {
  site: PaymentMicrosite;
  tone: "green" | "red" | "amber";
  footer: string;
}) {
  const toneClass =
    tone === "green"
      ? "border-green-200 bg-green-50 text-green-900"
      : tone === "red"
        ? "border-red-200 bg-red-50 text-red-900"
        : "border-amber-200 bg-amber-50 text-amber-900";

  const subToneClass =
    tone === "green"
      ? "text-green-700"
      : tone === "red"
        ? "text-red-700"
        : "text-amber-700";

  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneClass}`}>
      <div className="font-bold">
        {site.title || site.slug || "Untitled"}
      </div>

      <div className={`mt-1 font-mono text-xs ${subToneClass}`}>
        {site.slug || site.id}
      </div>

      <div className={`mt-2 text-xs font-semibold ${subToneClass}`}>
        Template: {site.template_key || "unknown"} · Design:{" "}
        {site.selected_design_key || "blank"}
      </div>

      <div className={`mt-1 text-xs font-semibold ${subToneClass}`}>
        Owner: {site.owner_email || "unknown"}
      </div>

      <div className={`mt-2 text-xs font-black ${subToneClass}`}>
        {footer}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={`/dashboard/microsites/${site.id}`}
          className="rounded-xl border border-white/60 bg-white px-3 py-2 text-xs font-bold text-neutral-900 hover:border-neutral-900"
        >
          Manage
        </Link>

        {site.slug ? (
          <a
            href={`https://${site.slug}.ko-host.com`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-neutral-950 px-3 py-2 text-xs font-bold text-white hover:bg-neutral-800"
          >
            Open
          </a>
        ) : null}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center text-sm font-semibold text-neutral-500">
      {text}
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