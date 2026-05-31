import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "knowintelligentlife@gmail.com";

export default async function AdminEmailPage() {
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  const supabase = getSupabaseAdmin();

  const [{ data: claimRequests }, { data: supportRequests }] = await Promise.all([
    supabase
      .from("claim_offer_requests")
      .select("id, name, email, resend_message_id, status, created_at")
      .order("created_at", { ascending: false })
      .limit(50),

    supabase
      .from("support_requests")
      .select("id, name, email, resend_message_id, status, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const claimEmailCount = claimRequests?.filter((item) => item.resend_message_id).length ?? 0;
  const supportEmailCount = supportRequests?.filter((item) => item.resend_message_id).length ?? 0;

  const allEmailItems = [
    ...(claimRequests ?? []).map((item) => ({
      ...item,
      source: "Claim Offer",
    })),
    ...(supportRequests ?? []).map((item) => ({
      ...item,
      source: "Support",
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 75);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Ko-Host Admin
            </div>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-950">
              Email Center
            </h1>

            <p className="mt-2 text-sm text-neutral-600">
              Review outgoing email-linked requests, Resend message IDs, support replies, and future campaign tools.
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Claim Emails" value={claimEmailCount} />
        <Stat label="Support Emails" value={supportEmailCount} />
        <Stat label="Tracked Emails" value={claimEmailCount + supportEmailCount} />
        <Stat
          label="Missing Resend IDs"
          value={allEmailItems.filter((item) => !item.resend_message_id).length}
        />
        <Stat label="Center Status" value="Read Only" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-100 px-5 py-4">
            <h2 className="text-sm font-black text-neutral-950">
              Recent Email-Linked Requests
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-[0.08em] text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-black">Source</th>
                  <th className="px-4 py-3 font-black">Recipient</th>
                  <th className="px-4 py-3 font-black">Status</th>
                  <th className="px-4 py-3 font-black">Resend ID</th>
                  <th className="px-4 py-3 font-black">Created</th>
                </tr>
              </thead>

              <tbody>
                {allEmailItems.length ? (
                  allEmailItems.map((item) => (
                    <tr key={`${item.source}-${item.id}`} className="border-t border-neutral-100 align-top">
                      <td className="px-4 py-4 text-xs font-black text-neutral-900">
                        {item.source}
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-semibold text-neutral-900">
                          {item.name || "Unnamed"}
                        </div>

                        <div className="mt-1 text-xs text-neutral-500">
                          {item.email}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-200">
                          {item.status || "new"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="max-w-[220px] break-all font-mono text-xs text-neutral-600">
                          {item.resend_message_id || "N/A"}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-xs font-semibold text-neutral-600">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm font-semibold text-neutral-500"
                    >
                      No email-linked requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-neutral-950">
            Future Email Tools
          </h2>

          <div className="mt-4 grid gap-2">
            {[
              "Email delivery status",
              "Failed email retry",
              "Requester follow-up templates",
              "Support reply history",
              "Admin announcements",
              "Maintenance notices",
              "Campaign blasts",
              "Open/click tracking",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-sm font-bold text-neutral-700"
              >
                {item}
              </div>
            ))}
          </div>
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