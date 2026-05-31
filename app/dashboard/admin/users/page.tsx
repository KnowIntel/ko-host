import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "knowintelligentlife@gmail.com";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string }>;
}) {
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  const params = await searchParams;
const search = params?.search?.trim() ?? "";
const normalizedSearch = search.toLowerCase();

const supabase = getSupabaseAdmin();

const [
  { data: microsites, error },
  { data: supportRequests },
  { data: claimRequests },
] = await Promise.all([
  supabase
    .from("microsites")
    .select(`
      owner_clerk_user_id,
      owner_email,
      id,
      is_published,
      is_active,
      is_favorite,
      created_at
    `)
    .eq("is_preset", false),

  supabase
    .from("support_requests")
    .select("email"),

  supabase
    .from("claim_offer_requests")
    .select("email"),
]);

const ownersMap = new Map<
  string,
  {
    ownerId: string;
    email: string;
    micrositeCount: number;
    publishedCount: number;
    activeCount: number;
    favoriteCount: number;
    joinedAt: string | null;
  }
>();

for (const site of microsites ?? []) {
  const ownerId = site.owner_clerk_user_id || "unknown";

  if (!ownersMap.has(ownerId)) {
    ownersMap.set(ownerId, {
      ownerId,
      email: site.owner_email || "Unknown",
      micrositeCount: 0,
      publishedCount: 0,
      activeCount: 0,
      favoriteCount: 0,
      joinedAt: site.created_at,
    });
  }

  const owner = ownersMap.get(ownerId)!;

  owner.micrositeCount++;

  if (site.is_published) owner.publishedCount++;
  if (site.is_active) owner.activeCount++;
  if (site.is_favorite) owner.favoriteCount++;

  if (
    site.created_at &&
    (!owner.joinedAt ||
      new Date(site.created_at) < new Date(owner.joinedAt))
  ) {
    owner.joinedAt = site.created_at;
  }
}

const owners = Array.from(ownersMap.values())
  .filter(
    (owner) =>
      !normalizedSearch ||
      owner.ownerId.toLowerCase().includes(normalizedSearch) ||
      owner.email.toLowerCase().includes(normalizedSearch),
  )
  .sort((a, b) => b.micrositeCount - a.micrositeCount);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Ko-Host Admin
            </div>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-950">
              Users
            </h1>

            <p className="mt-2 text-sm text-neutral-600">
              Lightweight user overview based on existing microsite ownership data.
            </p>
          </div>

<div className="flex flex-wrap gap-2">
  <a
    href="/api/dashboard/admin/export/users"
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

        <form method="GET" className="mt-5">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by owner ID or email..."
              className="h-11 flex-1 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-900 outline-none focus:border-neutral-400"
            />

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-neutral-950 px-5 text-sm font-bold text-white hover:bg-neutral-800"
            >
              Search
            </button>

            {search ? (
              <Link
                href="/dashboard/admin/users"
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
          Failed to load user ownership data: {error.message}
        </div>
      ) : null}

<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-8">
  <Stat label="Owners" value={owners.length} />

  <Stat
    label="Microsites"
    value={owners.reduce(
      (total, owner) => total + owner.micrositeCount,
      0,
    )}
  />

  <Stat
    label="Published"
    value={owners.reduce(
      (total, owner) => total + owner.publishedCount,
      0,
    )}
  />

  <Stat
    label="Active"
    value={owners.reduce(
      (total, owner) => total + owner.activeCount,
      0,
    )}
  />

  <Stat
    label="Favorites"
    value={owners.reduce(
      (total, owner) => total + owner.favoriteCount,
      0,
    )}
  />

  <Stat
    label="Support"
    value={supportRequests?.length ?? 0}
  />

  <Stat
    label="Claims"
    value={claimRequests?.length ?? 0}
  />

  <Stat label="Status" value="Live" />
</section>

<section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
  <div className="border-b border-neutral-100 px-5 py-4">
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-black text-neutral-950">
        User Overview
      </h2>

      <div className="text-xs font-bold text-neutral-500">
        {owners.length} owner{owners.length === 1 ? "" : "s"}
      </div>
    </div>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full text-left text-sm">
      <thead className="bg-neutral-50 text-xs uppercase tracking-[0.08em] text-neutral-500">
        <tr>
          <th className="px-4 py-3 font-black">User</th>
          <th className="px-4 py-3 font-black">Microsites</th>
          <th className="px-4 py-3 font-black">Published</th>
          <th className="px-4 py-3 font-black">Active</th>
          <th className="px-4 py-3 font-black">Favorites</th>
          <th className="px-4 py-3 font-black">Joined</th>
        </tr>
      </thead>

      <tbody>
        {owners.length ? (
          owners.map((owner) => (
            <tr
              key={owner.ownerId}
              className="border-t border-neutral-100"
            >
              <td className="px-4 py-4">
                <div className="font-semibold text-neutral-900">
                  {owner.email}
                </div>

                <div className="mt-1 break-all font-mono text-xs text-neutral-500">
                  {owner.ownerId}
                </div>
              </td>

              <td className="px-4 py-4">{owner.micrositeCount}</td>
              <td className="px-4 py-4">{owner.publishedCount}</td>
              <td className="px-4 py-4">{owner.activeCount}</td>
              <td className="px-4 py-4">{owner.favoriteCount}</td>

              <td className="px-4 py-4 text-xs text-neutral-600">
                {owner.joinedAt
                  ? new Date(owner.joinedAt).toLocaleDateString()
                  : "—"}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={6}
              className="px-4 py-8 text-center text-sm font-semibold text-neutral-500"
            >
              No owner data found.
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