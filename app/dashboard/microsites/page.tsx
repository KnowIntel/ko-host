// app/dashboard/microsites/page.tsx

import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import MicrositesTableClient from "./MicrositesTableClient";

export const dynamic = "force-dynamic";

type MicrositeRow = {
  id: string;
  slug: string;
  title: string;
  template_key: string;
  is_published: boolean;
  paid_until: string | null;
  created_at: string;
  is_favorite: boolean;
  owner_clerk_user_id: string;
};

function isPaidActive(paidUntil: string | null) {
  if (!paidUntil) return false;
  return new Date(paidUntil).getTime() > Date.now();
}

export default async function MicrositesListPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div className="p-6">Unauthorized</div>;
  }

  const supabase = getSupabaseAdmin();

  const { data: allMicrosites, error: allError } = await supabase
    .from("microsites")
    .select(`
      id,
      slug,
      title,
      template_key,
      is_published,
      paid_until,
      created_at,
      is_favorite,
      owner_clerk_user_id
    `)
    .eq("owner_clerk_user_id", userId)
    .order("created_at", { ascending: false });

  if (allError) {
    console.error("microsites list failed", allError);
    return <div className="p-6">Failed to load microsites.</div>;
  }

  const allRows = ((allMicrosites ?? []) as MicrositeRow[]).map((row) => ({
    ...row,
    _paid_active: isPaidActive(row.paid_until),
    _should_show: row.is_favorite && isPaidActive(row.paid_until),
  }));

  const visibleMicrosites = allRows.filter((row) => row._should_show);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-lg font-semibold text-amber-900">
          Temporary Debug Panel
        </h2>

        <p className="mt-2 text-sm text-amber-900/80">
          This shows every microsite owned by the current signed-in Clerk user and
          why it is or is not appearing in the dashboard list.
        </p>

        <div className="mt-4 text-sm text-amber-900">
          <div>
            <span className="font-semibold">Current userId:</span> {userId}
          </div>
          <div>
            <span className="font-semibold">Total owned microsites:</span>{" "}
            {allRows.length}
          </div>
          <div>
            <span className="font-semibold">Visible in filtered list:</span>{" "}
            {visibleMicrosites.length}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-amber-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-amber-100/60">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Favorite</th>
                <th className="px-3 py-2">Paid Until</th>
                <th className="px-3 py-2">Paid Active</th>
                <th className="px-3 py-2">Published</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Should Show</th>
              </tr>
            </thead>
            <tbody>
              {allRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-3 text-neutral-600">
                    No microsites found for this Clerk user.
                  </td>
                </tr>
              ) : (
                allRows.map((row) => (
                  <tr key={row.id} className="border-t border-neutral-200">
                    <td className="px-3 py-2">{row.title || "(Untitled)"}</td>
                    <td className="px-3 py-2 font-mono">{row.slug}</td>
                    <td className="px-3 py-2">{row.is_favorite ? "true" : "false"}</td>
                    <td className="px-3 py-2">
                      {row.paid_until ? new Date(row.paid_until).toLocaleString() : "null"}
                    </td>
                    <td className="px-3 py-2">
                      {row._paid_active ? "true" : "false"}
                    </td>
                    <td className="px-3 py-2">
                      {row.is_published ? "true" : "false"}
                    </td>
                    <td className="px-3 py-2 font-mono">{row.owner_clerk_user_id}</td>
                    <td className="px-3 py-2 font-semibold">
                      {row._should_show ? "true" : "false"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MicrositesTableClient microsites={visibleMicrosites} />
    </main>
  );
}