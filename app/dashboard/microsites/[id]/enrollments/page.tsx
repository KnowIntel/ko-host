import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import EnrollmentModerationActions from "@/components/dashboard/EnrollmentModerationActions";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

type EnrollmentRow = {
  id: string;
  block_id: string;
  name: string;
  quote: string | null;
  email: string | null;
  profile_image_url: string | null;
  status: string;
  created_at: string;
};

export default async function MicrositeEnrollmentsPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) notFound();

  const { id: micrositeId } = await params;
  const supabase = getSupabaseAdmin();

  const { data: microsite, error: micrositeError } = await supabase
    .from("microsites")
    .select("id, title, owner_clerk_user_id")
    .eq("id", micrositeId)
    .maybeSingle();

  if (micrositeError || !microsite) notFound();
  if (microsite.owner_clerk_user_id !== userId) notFound();

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollment_board_entries")
    .select(
      "id, block_id, name, quote, email, profile_image_url, status, created_at",
    )
    .eq("microsite_id", micrositeId)
    .order("created_at", { ascending: false });

  if (enrollmentsError) {
    throw new Error(enrollmentsError.message);
  }

  const rows = (enrollments ?? []) as EnrollmentRow[];
  const activeRows = rows.filter((row) => row.status === "active");
  const hiddenRows = rows.filter((row) => row.status !== "active");

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                Ko-Host Dashboard
              </div>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-950">
                Enrollments
              </h1>

              <p className="mt-2 text-sm font-medium text-neutral-600">
                View public Enrollment Board submissions for{" "}
                <span className="font-black text-neutral-950">
                  {microsite.title || "this microsite"}
                </span>
                .
              </p>
            </div>

            <Link
              href={`/dashboard/microsites/${micrositeId}`}
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-bold text-neutral-900 hover:border-neutral-900"
            >
              Back to Microsite
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <Stat label="Total Entries" value={rows.length} />
          <Stat label="Active" value={activeRows.length} />
          <Stat label="Hidden / Deleted" value={hiddenRows.length} />
        </section>

        <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-100 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-black text-neutral-950">
                Enrollment Records
              </h2>

              <span className="text-xs font-bold text-neutral-500">
                {rows.length} record{rows.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {rows.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 text-xs uppercase tracking-[0.08em] text-neutral-500">
                  <tr>
                    <th className="px-4 py-3 font-black">Person</th>
                    <th className="px-4 py-3 font-black">Quote</th>
                    <th className="px-4 py-3 font-black">Private Email</th>
                    <th className="px-4 py-3 font-black">Block</th>
                    <th className="px-4 py-3 font-black">Actions</th>
                    <th className="px-4 py-3 font-black">Submitted</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-neutral-100 align-top"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {row.profile_image_url ? (
                            <img
                              src={row.profile_image_url}
                              alt={row.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-sm font-black text-neutral-600">
                              {row.name.slice(0, 1).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="font-black text-neutral-950">
                              {row.name}
                            </div>

                            <div className="mt-1 font-mono text-[11px] font-bold text-neutral-400">
                              {row.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="max-w-xs px-4 py-4 text-sm font-medium text-neutral-700">
                        {row.quote || "—"}
                      </td>

                      <td className="px-4 py-4 text-sm font-bold text-neutral-700">
                        {row.email || "—"}
                      </td>

                      <td className="px-4 py-4 font-mono text-xs font-bold text-neutral-500">
                        {row.block_id}
                      </td>

                        <td className="px-4 py-4">
<EnrollmentModerationActions
  micrositeId={micrositeId}
  entryId={row.id}
  status={row.status}
/>
                        </td>

                      <td className="px-4 py-4 text-xs font-bold text-neutral-500">
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center">
              <div className="text-lg font-black text-neutral-950">
                No enrollments yet.
              </div>

              <p className="mt-2 text-sm font-medium text-neutral-500">
                Public submissions will appear here once visitors use an
                Enrollment Board block.
              </p>
            </div>
          )}
        </section>
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

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active";

  return (
    <span
      className={[
        "rounded-full px-2.5 py-1 text-xs font-black ring-1",
        isActive
          ? "bg-green-50 text-green-700 ring-green-200"
          : "bg-neutral-100 text-neutral-600 ring-neutral-200",
      ].join(" ")}
    >
      {status}
    </span>
  );
}