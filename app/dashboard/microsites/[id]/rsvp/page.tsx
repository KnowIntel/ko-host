// app/dashboard/microsites/[id]/rsvp/page.tsx
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type RsvpRow = {
  id: number;
  name: string;
  email: string | null;
  attending_count: number;
  has_plus_one: boolean;
  meal_choice: string | null;
  notes: string | null;
  created_at: string;
};

export default async function MicrositeRsvpAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { userId } = await auth();
  if (!userId) return <div className="p-6">Unauthorized</div>;

  const sb = getSupabaseAdmin();

  const { data: site, error: siteErr } = await sb
    .from("microsites")
    .select("id, owner_clerk_user_id, slug, title, template_key")
    .eq("id", id)
    .maybeSingle();

  if (siteErr || !site) return notFound();
  if (site.owner_clerk_user_id !== userId) return <div className="p-6">Forbidden</div>;

  if (site.template_key !== "wedding_rsvp") {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-neutral-600">Ko-Host</div>
              <h1 className="mt-2 text-xl font-semibold tracking-tight">
                RSVP Submissions
              </h1>
              <div className="mt-2 text-sm text-neutral-700">
                <div>
                  <span className="font-medium">Microsite:</span>{" "}
                  {site.title || "(Untitled)"}
                </div>
                <div>
                  <span className="font-medium">Slug:</span>{" "}
                  <span className="font-mono">{site.slug}</span>
                </div>
              </div>
            </div>

            <Link
              href={`/dashboard/microsites/${site.id}`}
              className="text-sm font-medium text-neutral-900 underline underline-offset-4"
            >
              Back
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-sm text-neutral-600">Submissions</div>
          <div className="mt-2 text-sm text-neutral-700">
            No RSVP submissions.
          </div>
        </div>
      </div>
    );
  }

  const { data: rows, error: rowsErr } = await sb
    .from("rsvp_submissions")
    .select("id, name, email, attending_count, has_plus_one, meal_choice, notes, created_at")
    .eq("microsite_id", site.id)
    .order("created_at", { ascending: false })
    .limit(500);

  if (rowsErr) {
    console.error("rsvp list failed", rowsErr);
    return <div className="p-6">Failed to load RSVPs.</div>;
  }

  const rsvps = (rows ?? []) as RsvpRow[];

  const totalResponses = rsvps.length;
  const totalAttending = rsvps.reduce((sum, r) => sum + (r.attending_count ?? 0), 0);
  const totalPlusOnes = rsvps.reduce((sum, r) => sum + (r.has_plus_one ? 1 : 0), 0);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-neutral-600">Ko-Host</div>
            <h1 className="mt-2 text-xl font-semibold tracking-tight">RSVP Admin</h1>
            <div className="mt-2 text-sm text-neutral-700">
              <div>
                <span className="font-medium">Microsite:</span> {site.title || "(Untitled)"}
              </div>
              <div>
                <span className="font-medium">Slug:</span>{" "}
                <span className="font-mono">{site.slug}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`/api/dashboard/microsites/${site.id}/rsvp/export`}
              className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Download CSV
            </a>

            <Link
              href={`/dashboard/microsites/${site.id}`}
              className="text-sm font-medium text-neutral-900 underline underline-offset-4"
            >
              Back
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-xs text-neutral-600">Responses</div>
            <div className="mt-1 text-lg font-semibold">{totalResponses}</div>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-xs text-neutral-600">Total attending</div>
            <div className="mt-1 text-lg font-semibold">{totalAttending}</div>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-xs text-neutral-600">+1 count</div>
            <div className="mt-1 text-lg font-semibold">{totalPlusOnes}</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 font-medium text-neutral-700">When</th>
              <th className="px-4 py-3 font-medium text-neutral-700">Name</th>
              <th className="px-4 py-3 font-medium text-neutral-700">Email</th>
              <th className="px-4 py-3 font-medium text-neutral-700">Count</th>
              <th className="px-4 py-3 font-medium text-neutral-700">+1</th>
              <th className="px-4 py-3 font-medium text-neutral-700">Meal</th>
              <th className="px-4 py-3 font-medium text-neutral-700">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rsvps.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-neutral-600" colSpan={7}>
                  No RSVPs yet.
                </td>
              </tr>
            ) : (
              rsvps.map((r) => (
                <tr key={r.id} className="border-t border-neutral-200 align-top">
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-700">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-neutral-900">{r.name}</td>
                  <td className="px-4 py-3 text-neutral-800">{r.email ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-800">{r.attending_count}</td>
                  <td className="px-4 py-3 text-neutral-800">{r.has_plus_one ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-neutral-800">{r.meal_choice ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-800">{r.notes ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}