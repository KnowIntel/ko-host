import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { logAdminActivity } from "@/lib/adminActivity";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "knowintelligentlife@gmail.com";

type AdminMicrositeRow = {
  id: string;
  owner_clerk_user_id: string | null;
  slug: string | null;
  title: string | null;
  template_key: string | null;
  selected_design_key: string | null;
  is_active: boolean | null;
  is_published: boolean | null;
  paid_until: string | null;
  created_at: string;
  updated_at: string | null;
  is_favorite: boolean | null;
  admin_notes: string | null;
  total_views?: number;
  unique_visitors?: number;
  views_today?: number;
  last_visit_at?: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function getActiveLabel(row: AdminMicrositeRow) {
  if (row.is_active === false) return "Deactivated";

  if (!row.paid_until) return "No paid term";

  const expiresAt = new Date(row.paid_until).getTime();

  if (Number.isNaN(expiresAt)) return "Unknown";

  return expiresAt > Date.now() ? "Active" : "Expired";
}

function getStatusClass(label: string) {
  if (label === "Active") return "bg-green-50 text-green-700 ring-green-200";
  if (label === "Expired") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (label === "Deactivated") return "bg-red-50 text-red-700 ring-red-200";
  return "bg-neutral-100 text-neutral-600 ring-neutral-200";
}

async function updateMicrositeActiveStatus(formData: FormData) {
  "use server";

  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  const id = String(formData.get("id") ?? "");
  const nextActive = String(formData.get("is_active") ?? "") === "true";

  if (!id) return;

  const supabase = getSupabaseAdmin();

  await supabase
    .from("microsites")
    .update(
      nextActive
        ? { is_active: true }
        : { is_active: false, is_published: false },
    )
    .eq("id", id)
    .eq("is_preset", false);

  await logAdminActivity({
    adminEmail: userEmail,
    action: nextActive ? "microsite_reactivated" : "microsite_deactivated",
    targetType: "microsite",
    targetId: id,
    details: { is_active: nextActive },
  });

  revalidatePath("/dashboard/admin/microsites");
}

async function extendMicrositePublishDuration(formData: FormData) {
  "use server";

  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  const id = String(formData.get("id") ?? "");
  const currentPaidUntil = String(formData.get("paid_until") ?? "");

  if (!id) return;

  const now = new Date();
  const currentDate = currentPaidUntil ? new Date(currentPaidUntil) : null;
  const baseDate =
    currentDate && !Number.isNaN(currentDate.getTime()) && currentDate > now
      ? currentDate
      : now;

  baseDate.setDate(baseDate.getDate() + 90);

  const nextPaidUntil = baseDate.toISOString();
  const supabase = getSupabaseAdmin();

  await supabase
    .from("microsites")
    .update({
      paid_until: nextPaidUntil,
      is_active: true,
    })
    .eq("id", id)
    .eq("is_preset", false);

  await logAdminActivity({
    adminEmail: userEmail,
    action: "microsite_extended_90_days",
    targetType: "microsite",
    targetId: id,
    details: {
      previousPaidUntil: currentPaidUntil || null,
      nextPaidUntil,
    },
  });

  revalidatePath("/dashboard/admin/microsites");
}

async function updateAdminNotes(formData: FormData) {
  "use server";

  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  const id = String(formData.get("id") ?? "");
  const notes = String(formData.get("admin_notes") ?? "").trim();

  if (!id) return;

  const supabase = getSupabaseAdmin();

  await supabase
    .from("microsites")
    .update({
      admin_notes: notes || null,
    })
    .eq("id", id);

  await logAdminActivity({
    adminEmail: userEmail,
    action: "microsite_admin_notes_updated",
    targetType: "microsite",
    targetId: id,
    details: { hasNotes: Boolean(notes) },
  });

  revalidatePath("/dashboard/admin/microsites");
}

export default async function AdminMicrositesPage({
  searchParams,
}: {
  searchParams?: Promise<{
  filter?: string;
  search?: string;
}>;
}) {
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  const params = await searchParams;
  const activeFilter = params?.filter || "all";
const search = params?.search?.trim() ?? "";
const normalizedSearch = search.toLowerCase();

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("microsites")
    .select(
      `
        id,
        owner_clerk_user_id,
        slug,
        title,
        template_key,
        selected_design_key,
        is_active,
        is_published,
        paid_until,
        created_at,
        updated_at,
        is_favorite,
        admin_notes
      `,
    )
    .eq("is_preset", false)
    .order("created_at", { ascending: false });

  if (activeFilter === "published") {
    query = query.eq("is_published", true);
  }

  if (activeFilter === "unpublished") {
    query = query.eq("is_published", false);
  }

  if (activeFilter === "deactivated") {
    query = query.eq("is_active", false);
  }

  const { data, error } = await query;

const micrositeIds = ((data ?? []) as AdminMicrositeRow[]).map((row) => row.id);

const today = new Date();
today.setHours(0, 0, 0, 0);

const { data: visitRows } = micrositeIds.length
  ? await supabase
      .from("microsite_visits")
      .select("microsite_id, visitor_key, created_at")
      .in("microsite_id", micrositeIds)
      .eq("is_owner_or_admin", false)
  : { data: [] };

const visitStats = new Map<
  string,
  {
    totalViews: number;
    uniqueVisitors: Set<string>;
    viewsToday: number;
    lastVisitAt: string | null;
  }
>();

for (const visit of visitRows ?? []) {
  const micrositeId = String(visit.microsite_id || "");

  if (!visitStats.has(micrositeId)) {
    visitStats.set(micrositeId, {
      totalViews: 0,
      uniqueVisitors: new Set<string>(),
      viewsToday: 0,
      lastVisitAt: null,
    });
  }

  const stat = visitStats.get(micrositeId)!;

  stat.totalViews += 1;

  if (visit.visitor_key) {
    stat.uniqueVisitors.add(String(visit.visitor_key));
  }

  if (visit.created_at && new Date(visit.created_at).getTime() >= today.getTime()) {
    stat.viewsToday += 1;
  }

  if (
    visit.created_at &&
    (!stat.lastVisitAt ||
      new Date(visit.created_at).getTime() >
        new Date(stat.lastVisitAt).getTime())
  ) {
    stat.lastVisitAt = visit.created_at;
  }
}

const rows = ((data ?? []) as AdminMicrositeRow[])
  .map((row) => {
    const stat = visitStats.get(row.id);

    return {
      ...row,
      total_views: stat?.totalViews ?? 0,
      unique_visitors: stat?.uniqueVisitors.size ?? 0,
      views_today: stat?.viewsToday ?? 0,
      last_visit_at: stat?.lastVisitAt ?? null,
    };
  })
  .filter((row) => {
  const matchesSearch =
    !normalizedSearch ||
    row.title?.toLowerCase().includes(normalizedSearch) ||
    row.slug?.toLowerCase().includes(normalizedSearch) ||
    row.owner_clerk_user_id?.toLowerCase().includes(normalizedSearch) ||
    row.template_key?.toLowerCase().includes(normalizedSearch) ||
    row.selected_design_key?.toLowerCase().includes(normalizedSearch) ||
    row.admin_notes?.toLowerCase().includes(normalizedSearch);

  if (!matchesSearch) return false;

  if (activeFilter === "active") {
    return row.is_active !== false && row.paid_until
      ? new Date(row.paid_until).getTime() > Date.now()
      : false;
  }

  if (activeFilter === "expired") {
    return row.is_active !== false && row.paid_until
      ? new Date(row.paid_until).getTime() <= Date.now()
      : false;
  }

  if (activeFilter === "with_notes") {
    return Boolean(row.admin_notes?.trim());
  }

  return true;
});

const filters = [
  ["all", "All"],
  ["published", "Published"],
  ["unpublished", "Unpublished"],
  ["active", "Active"],
  ["expired", "Expired"],
  ["deactivated", "Deactivated"],
  ["with_notes", "With Notes"],
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
              Microsites Manager
            </h1>

            <p className="mt-2 text-sm text-neutral-600">
              Review all published, unpublished, active, expired, and deactivated microsites.
            </p>
          </div>

<div className="flex flex-wrap gap-2">
  <a
    href="/api/dashboard/admin/export/microsites"
    className="inline-flex items-center justify-center rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100"
  >
    Export CSV
  </a>

  <Link
    href="/dashboard/admin"
    className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-bold text-neutral-900 hover:border-neutral-900"
  >
    Back to Admin
  </Link>
</div>
        </div>

<div className="mt-6 flex flex-wrap gap-2">
  {filters.map(([key, label]) => {
    const nextParams = new URLSearchParams();

    if (key !== "all") nextParams.set("filter", key);
    if (search) nextParams.set("search", search);

    const href = `/dashboard/admin/microsites${
      nextParams.toString() ? `?${nextParams.toString()}` : ""
    }`;

    return (
      <Link
        key={key}
        href={href}
        className={[
          "rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] transition",
          activeFilter === key
            ? "bg-neutral-950 text-white"
            : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
        ].join(" ")}
      >
        {label}
      </Link>
    );
  })}
</div>

<form method="GET" className="mt-4">
  <div className="flex flex-col gap-2 sm:flex-row">
    <input
      name="search"
      defaultValue={search}
      placeholder="Search by title, slug, owner, template, design, or notes..."
      className="h-11 flex-1 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-900 outline-none focus:border-neutral-400"
    />

    {activeFilter !== "all" ? (
      <input type="hidden" name="filter" value={activeFilter} />
    ) : null}

    <button
      type="submit"
      className="inline-flex h-11 items-center justify-center rounded-xl bg-neutral-950 px-5 text-sm font-bold text-white hover:bg-neutral-800"
    >
      Search
    </button>

    {search ? (
      <Link
        href={
          activeFilter === "all"
            ? "/dashboard/admin/microsites"
            : `/dashboard/admin/microsites?filter=${activeFilter}`
        }
        className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 text-sm font-bold text-neutral-900 hover:border-neutral-900"
      >
        Clear
      </Link>
    ) : null}
  </div>
</form>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Failed to load microsites: {error.message}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-8">
    <Stat label="Showing" value={rows.length} />
    <Stat
        label="Published"
        value={rows.filter((row) => row.is_published).length}
    />
    <Stat
        label="Active"
        value={
        rows.filter((row) => getActiveLabel(row) === "Active").length
        }
    />
    <Stat
        label="Expired"
        value={
        rows.filter((row) => getActiveLabel(row) === "Expired").length
        }
    />
    <Stat
        label="With Notes"
        value={rows.filter((row) => row.admin_notes?.trim()).length}
    />

    <Stat
  label="Total Views"
  value={rows.reduce((total, row) => total + (row.total_views ?? 0), 0)}
/>

<Stat
  label="Unique Visitors"
  value={rows.reduce((total, row) => total + (row.unique_visitors ?? 0), 0)}
/>

<Stat
  label="Views Today"
  value={rows.reduce((total, row) => total + (row.views_today ?? 0), 0)}
/>
    </section>

      <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 px-5 py-4">
          <div className="text-sm font-black text-neutral-950">
            {rows.length} microsite{rows.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-[0.08em] text-neutral-500">
<tr>
  <th className="px-4 py-3 font-black">Site</th>
  <th className="px-4 py-3 font-black">Owner</th>
  <th className="px-4 py-3 font-black">Template</th>
  <th className="px-4 py-3 font-black">Status</th>
  <th className="px-4 py-3 font-black">Published</th>
  <th className="px-4 py-3 font-black">Views</th>
  <th className="px-4 py-3 font-black">Visitors</th>
  <th className="px-4 py-3 font-black">Today</th>
  <th className="px-4 py-3 font-black">Last Visit</th>
  <th className="px-4 py-3 font-black">Views</th>
  <th className="px-4 py-3 font-black">Visitors</th>
  <th className="px-4 py-3 font-black">Today</th>
  <th className="px-4 py-3 font-black">Last Visit</th>
  <th className="px-4 py-3 font-black">Paid Until</th>
  <th className="px-4 py-3 font-black">Updated</th>
  <th className="px-4 py-3 font-black">Notes</th>
  <th className="px-4 py-3 font-black">Actions</th>
</tr>
            </thead>

            <tbody>
              {rows.length ? (
                rows.map((row) => {
                  const activeLabel = getActiveLabel(row);

                  return (
                    <tr key={row.id} className="border-t border-neutral-100 align-top">
                      <td className="px-4 py-4">
                        <div className="font-bold text-neutral-950">
                          {row.title || "(Untitled)"}
                        </div>

                        <div className="mt-1 font-mono text-xs text-neutral-600">
                          {row.slug || "No slug"}
                        </div>

                        <div className="mt-1 text-xs text-neutral-500">
                          Created {formatDate(row.created_at)}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="max-w-[220px] break-all font-mono text-xs text-neutral-700">
                          {row.owner_clerk_user_id || "—"}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-mono text-xs font-semibold text-neutral-800">
                          {row.template_key || "—"}
                        </div>

                        <div className="mt-1 font-mono text-xs text-neutral-500">
                          Design: {row.selected_design_key || "blank"}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1",
                            getStatusClass(activeLabel),
                          ].join(" ")}
                        >
                          {activeLabel}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1",
                            row.is_published
                              ? "bg-green-50 text-green-700 ring-green-200"
                              : "bg-neutral-100 text-neutral-600 ring-neutral-200",
                          ].join(" ")}
                        >
                          {row.is_published ? "Yes" : "No"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-xs font-semibold text-neutral-700">
                        {row.total_views ?? 0}
                      </td>

                      <td className="px-4 py-4 text-xs font-semibold text-neutral-700">
                        {row.unique_visitors ?? 0}
                      </td>

                      <td className="px-4 py-4 text-xs font-semibold text-neutral-700">
                        {row.views_today ?? 0}
                      </td>

                      <td className="px-4 py-4 text-xs font-semibold text-neutral-700">
                        {formatDate(row.last_visit_at || null)}
                      </td>

                      <td className="px-4 py-4 text-xs font-semibold text-neutral-700">
                        {formatDate(row.paid_until)}
                      </td>

<td className="px-4 py-4 text-xs font-semibold text-neutral-700">
  {formatDate(row.updated_at || row.created_at)}
</td>

<td className="px-4 py-4">
  {row.admin_notes ? (
    <div className="max-w-[220px] rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-amber-800 ring-1 ring-amber-200">
      {row.admin_notes}
    </div>
  ) : (
    <span className="text-xs font-semibold text-neutral-400">No notes</span>
  )}
</td>

<td className="px-4 py-4">
<div className="grid min-w-[220px] grid-cols-2 gap-2">
  <Link
    href={`/dashboard/microsites/${row.id}`}
    className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-bold text-neutral-900 hover:border-neutral-900"
  >
    Manage
  </Link>

  {row.slug ? (
    <a
      href={`https://${row.slug}.ko-host.com`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center rounded-xl border border-blue-600 bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
    >
      Open
    </a>
  ) : null}

  <form action={updateMicrositeActiveStatus}>
    <input type="hidden" name="id" value={row.id} />
    <input
      type="hidden"
      name="is_active"
      value={row.is_active === false ? "true" : "false"}
    />

    <button
      type="submit"
      className={[
        "inline-flex w-full items-center justify-center rounded-xl border px-3 py-2 text-xs font-bold",
        row.is_active === false
          ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
          : "border-red-300 bg-red-50 text-red-700 hover:bg-red-100",
      ].join(" ")}
    >
      {row.is_active === false ? "Reactivate" : "Deactivate"}
    </button>
  </form>

<form action={extendMicrositePublishDuration}>
  <input type="hidden" name="id" value={row.id} />
  <input type="hidden" name="paid_until" value={row.paid_until || ""} />

  <button
    type="submit"
    className="inline-flex w-full items-center justify-center rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
  >
    +90 Days
  </button>
</form>

<a
  href={`/api/dashboard/admin/microsites/${row.id}/export`}
  className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-bold text-neutral-900 hover:border-neutral-900"
>
  Export JSON
</a>

<form action={`/api/dashboard/admin/microsites/${row.id}/duplicate`} method="POST">
  <button
    type="submit"
    className="inline-flex w-full items-center justify-center rounded-xl border border-purple-300 bg-purple-50 px-3 py-2 text-xs font-bold text-purple-700 hover:bg-purple-100"
  >
    Duplicate
  </button>
</form>
</div>

<form action={updateAdminNotes} className="mt-3 space-y-2">
  <input type="hidden" name="id" value={row.id} />

  <textarea
    name="admin_notes"
    defaultValue={row.admin_notes || ""}
    placeholder="Admin notes..."
    className="min-h-[70px] w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs"
  />

  <button
    type="submit"
    className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-bold text-neutral-900 hover:border-neutral-900"
  >
    Save Notes
  </button>
</form>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="px-4 py-8 text-center text-sm font-semibold text-neutral-500" colSpan={13}>
                    No microsites found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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