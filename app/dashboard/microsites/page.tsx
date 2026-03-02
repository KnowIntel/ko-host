// app/dashboard/microsites/page.tsx
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type MicrositeRow = {
  id: string;
  slug: string;
  title: string;
  template_key: string;
  is_published: boolean;
  created_at: string;
};

export default async function MicrositesListPage() {
  const { userId } = await auth();
  if (!userId) return <div className="p-6">Unauthorized</div>;

  const sb = getSupabaseAdmin();

  const { data, error } = await sb
    .from("microsites")
    .select("id, slug, title, template_key, is_published, created_at")
    .eq("owner_clerk_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("microsites list failed", error);
    return <div className="p-6">Failed to load microsites.</div>;
  }

  const microsites = (data ?? []) as MicrositeRow[];

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Microsites</h1>
          <p className="mt-1 text-sm text-neutral-700">
            Manage your sites and view submissions.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="text-sm font-medium text-neutral-900 underline underline-offset-4"
        >
          Back
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 font-medium text-neutral-700">Title</th>
              <th className="px-4 py-3 font-medium text-neutral-700">Slug</th>
              <th className="px-4 py-3 font-medium text-neutral-700">Template</th>
              <th className="px-4 py-3 font-medium text-neutral-700">Published</th>
              <th className="px-4 py-3 font-medium text-neutral-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {microsites.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-neutral-600" colSpan={5}>
                  No microsites yet.
                </td>
              </tr>
            ) : (
              microsites.map((m) => (
                <tr key={m.id} className="border-t border-neutral-200">
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {m.title || "(Untitled)"}
                  </td>
                  <td className="px-4 py-3 font-mono text-neutral-800">
                    {m.slug}
                  </td>
                  <td className="px-4 py-3 font-mono text-neutral-800">
                    {m.template_key}
                  </td>
                  <td className="px-4 py-3">
                    {m.is_published ? (
                      <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                        Yes
                      </span>
                    ) : (
                      <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/microsites/${m.id}/rsvp`}
                      className="text-sm font-medium text-neutral-900 underline underline-offset-4"
                    >
                      RSVP submissions
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}