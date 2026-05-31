import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "knowintelligentlife@gmail.com";

export default async function AdminNotificationsPage() {
  const user = await currentUser();
  const userEmail =
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  const supabase = getSupabaseAdmin();

  const [
    { data: claims },
    { data: support },
    { data: microsites },
    { data: pendingCheckouts },
  ] = await Promise.all([
    supabase
      .from("claim_offer_requests")
      .select("id,status,is_archived,created_at"),

    supabase
      .from("support_requests")
      .select("id,status,priority,created_at"),

    supabase
      .from("microsites")
      .select(
        "id,title,slug,is_published,is_active,paid_until",
      )
      .eq("is_preset", false),

    supabase
      .from("pending_microsite_checkouts")
      .select(
        "id,title,slug,processed_at,created_at",
      ),
  ]);

  const now = Date.now();

  const expiredPublished =
    microsites?.filter(
      (site) =>
        site.is_published &&
        site.paid_until &&
        new Date(site.paid_until).getTime() < now,
    ) ?? [];

  const urgentSupport =
    support?.filter(
      (item) => item.priority === "urgent",
    ) ?? [];

  const openClaims =
    claims?.filter(
      (item) =>
        item.status !== "complete" &&
        item.status !== "archived" &&
        item.is_archived !== true,
    ) ?? [];

  const pending =
    pendingCheckouts?.filter(
      (item) => !item.processed_at,
    ) ?? [];

  const notificationCount =
    expiredPublished.length +
    urgentSupport.length +
    openClaims.length +
    pending.length;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">
              Ko-Host Admin
            </div>

            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Notifications
            </h1>

            <p className="mt-2 text-sm text-neutral-600">
              Items requiring attention.
            </p>
          </div>

          <Link
            href="/dashboard/admin"
            className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-bold"
          >
            Back to Admin
          </Link>
        </div>
      </section>

<section className="grid gap-4 sm:grid-cols-5">
  <Stat label="Total Alerts" value={notificationCount} />
  <Stat label="Urgent Support" value={urgentSupport.length} />
  <Stat label="Open Claims" value={openClaims.length} />
  <Stat label="Expired Sites" value={expiredPublished.length} />
  <Stat label="Pending Checkouts" value={pending.length} />
</section>

<section className="grid gap-4 lg:grid-cols-4">
  <NotificationPanel
    title="Urgent Support"
    count={urgentSupport.length}
    items={urgentSupport.map((item) => ({
      id: item.id,
      label: item.priority || "urgent",
    }))}
  />

  <NotificationPanel
    title="Open Claims"
    count={openClaims.length}
    items={openClaims.map((item) => ({
      id: item.id,
      label: item.status || "open",
    }))}
  />

  <NotificationPanel
    title="Expired Sites"
    count={expiredPublished.length}
    items={expiredPublished.map((item) => ({
      id: item.id,
      label: item.slug || item.title || "microsite",
    }))}
  />

  <NotificationPanel
    title="Pending Checkouts"
    count={pending.length}
    items={pending.map((item) => ({
      id: item.id,
      label: item.slug || item.title || "checkout",
    }))}
  />
</section>
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

function NotificationPanel({
  title,
  count,
  items,
}: {
  title: string;
  count: number;
  items: {
    id: string;
    label: string;
  }[];
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-neutral-950">
          {title}
        </h2>

        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-black text-neutral-700">
          {count}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {items.length ? (
          items.slice(0, 10).map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-700"
            >
              {item.label}
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-200 px-3 py-6 text-center text-sm text-neutral-500">
            No alerts
          </div>
        )}
      </div>
    </div>
  );
}