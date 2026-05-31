import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "knowintelligentlife@gmail.com";

export default async function AdminActivityPage() {
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  const supabase = getSupabaseAdmin();

  const { data: recentActivity } = await supabase
  .from("admin_activity_log")
  .select(
    "id, action, target_type, target_id, admin_email, created_at",
  )
  .order("created_at", { ascending: false })
  .limit(10);

const { data: logs, error } = await supabase
  .from("admin_activity_log")
  .select("id, admin_email, action, target_type, target_id, details, created_at")
  .order("created_at", { ascending: false })
  .limit(250);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Ko-Host Admin
            </div>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-950">
              Admin Activity
            </h1>

            <p className="mt-2 text-sm text-neutral-600">
              Audit trail for admin actions, support updates, claim requests, and platform changes.
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

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Failed to load activity log: {error.message}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Shown Logs" value={logs?.length ?? 0} />
<Stat
  label="Microsite Actions"
  value={(logs ?? []).filter((log) => log.target_type === "microsite").length}
/>
        <Stat
          label="Unique Actions"
          value={new Set((logs ?? []).map((log) => log.action)).size}
        />
        <Stat
          label="Admins"
          value={new Set((logs ?? []).map((log) => log.admin_email)).size}
        />
      </section>

      <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 px-5 py-4">
          <h2 className="text-sm font-black text-neutral-950">
            Recent Admin Activity
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-[0.08em] text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-black">Date</th>
                <th className="px-4 py-3 font-black">Admin</th>
                <th className="px-4 py-3 font-black">Action</th>
                <th className="px-4 py-3 font-black">Target</th>
                <th className="px-4 py-3 font-black">Details</th>
              </tr>
            </thead>

            <tbody>
              {logs?.length ? (
                logs.map((log) => (
                  <tr key={log.id} className="border-t border-neutral-100 align-top">
                    <td className="px-4 py-4 text-xs font-semibold text-neutral-600">
                      {new Date(log.created_at).toLocaleString()}
                    </td>

                    <td className="px-4 py-4 text-xs font-semibold text-neutral-700">
                      {log.admin_email}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-200">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-xs font-semibold text-neutral-700">
                      <div>{log.target_type || "—"}</div>
                      <div className="mt-1 break-all font-mono text-neutral-500">
                        {log.target_id || ""}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <pre className="max-w-xl overflow-auto rounded-xl bg-neutral-50 p-3 text-xs text-neutral-700">
                        {JSON.stringify(log.details ?? {}, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm font-semibold text-neutral-500"
                  >
                    No admin activity logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-neutral-950">
            Recent Admin Activity Summary
          </h2>

          <Link
            href="/dashboard/admin"
            className="text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            Admin Home
          </Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            label="Microsite Actions"
            value={
              (logs ?? []).filter(
                (log) => log.target_type === "microsite",
              ).length
            }
          />

          <Stat
            label="Support Actions"
            value={
              (logs ?? []).filter(
                (log) => log.target_type === "support_request",
              ).length
            }
          />

          <Stat
            label="Claim Actions"
            value={
              (logs ?? []).filter(
                (log) => log.target_type === "claim_offer_request",
              ).length
            }
          />

          <Stat
            label="Unique Admins"
            value={
              new Set((logs ?? []).map((log) => log.admin_email)).size
            }
          />
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