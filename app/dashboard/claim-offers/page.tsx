import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "knowintelligentlife@gmail.com";

type ClaimOfferRequest = {
  id: string;
  name: string;
  email: string;
  site_url: string | null;
  description: string;
  deadline: string | null;
  file_name: string | null;
  resend_message_id: string | null;
  status: string;
  created_at: string;
};

export default async function ClaimOffersDashboardPage() {
  const user = await currentUser();
  const userEmail =
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("claim_offer_requests")
    .select(
      "id, name, email, site_url, description, deadline, file_name, resend_message_id, status, created_at",
    )
    .order("created_at", { ascending: false });

  const requests = (data ?? []) as ClaimOfferRequest[];

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-950">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
              Ko-Host Admin
            </div>

            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Claim Offer Requests
            </h1>

            <p className="mt-2 text-sm text-neutral-600">
              Review custom development requests submitted from the limited-time offer page.
            </p>
          </div>

          <div className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-bold text-neutral-700 shadow-sm">
            {requests.length} request{requests.length === 1 ? "" : "s"}
          </div>
        </div>

        {error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            Failed to load requests: {error.message}
          </div>
        ) : null}

        <div className="mt-8 grid gap-5">
          {requests.length ? (
            requests.map((request) => (
              <article
                key={request.id}
                className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm"
              >
                <div className="flex flex-col gap-4 border-b border-neutral-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-lg font-black text-neutral-950">
                      {request.name}
                    </div>

                    <div className="mt-1 text-sm text-neutral-600">
                      {request.email}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      {request.status || "new"}
                    </span>

                    {request.deadline ? (
                      <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                        Deadline: {request.deadline}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-5 px-5 py-5 lg:grid-cols-[0.72fr_1.28fr]">
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
                        Submitted
                      </div>
                      <div className="mt-1 font-semibold text-neutral-700">
                        {new Date(request.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
                        Site URL
                      </div>
                      <div className="mt-1 break-all font-semibold text-neutral-700">
                        {request.site_url || "N/A"}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
                        Attachment
                      </div>
                      <div className="mt-1 break-all font-semibold text-neutral-700">
                        {request.file_name || "None"}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
                        Resend ID
                      </div>
                      <div className="mt-1 break-all font-semibold text-neutral-700">
                        {request.resend_message_id || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
                      Design Request
                    </div>

                    <div className="mt-2 whitespace-pre-wrap rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-4 text-sm leading-7 text-neutral-700">
                      {request.description}
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center text-sm font-semibold text-neutral-500">
              No claim offer requests yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}