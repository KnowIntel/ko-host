import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "knowintelligentlife@gmail.com";
const ATTACHMENT_BUCKET = "claim-offer-attachments";
const STATUSES = ["new", "in_progress", "complete", "archived"] as const;

type ClaimOfferRequest = {
  id: string;
  name: string;
  email: string;
  site_url: string | null;
  description: string;
  deadline: string | null;
  file_name: string | null;
  file_path: string | null;
  resend_message_id: string | null;
  status: string;
  created_at: string;
  download_url?: string | null;
};

async function updateClaimOfferStatus(formData: FormData) {
  "use server";

  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id || !STATUSES.includes(status as any)) return;

  const sb = getSupabaseAdmin();

  await sb
    .from("claim_offer_requests")
    .update({ status })
    .eq("id", id);

  revalidatePath("/dashboard/claim-offers");
}

export default async function ClaimOffersDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  const params = await searchParams;
  const activeStatus = params?.status || "all";

  const supabaseAdmin = getSupabaseAdmin();

  let query = supabaseAdmin
    .from("claim_offer_requests")
    .select(
      "id, name, email, site_url, description, deadline, file_name, file_path, resend_message_id, status, created_at",
    )
    .order("created_at", { ascending: false });

  if (STATUSES.includes(activeStatus as any)) {
    query = query.eq("status", activeStatus);
  }

  const { data, error } = await query;

  const requests = await Promise.all(
    ((data ?? []) as ClaimOfferRequest[]).map(async (request) => {
      if (!request.file_path) return { ...request, download_url: null };

      const { data: signed } = await supabaseAdmin.storage
        .from(ATTACHMENT_BUCKET)
        .createSignedUrl(request.file_path, 60 * 30);

      return {
        ...request,
        download_url: signed?.signedUrl ?? null,
      };
    }),
  );

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-950">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
              Ko-Host Admin
            </div>

            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Claim Offer Requests
            </h1>

            <p className="mt-2 text-sm text-neutral-600">
              Review and manage custom development requests.
            </p>
          </div>

          <div className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-bold text-neutral-700 shadow-sm">
            {requests.length} request{requests.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {["all", ...STATUSES].map((status) => (
            <Link
              key={status}
              href={
                status === "all"
                  ? "/dashboard/claim-offers"
                  : `/dashboard/claim-offers?status=${status}`
              }
              className={[
                "rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] transition",
                activeStatus === status
                  ? "bg-neutral-950 text-white"
                  : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
              ].join(" ")}
            >
              {status.replaceAll("_", " ")}
            </Link>
          ))}
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
                <div className="flex flex-col gap-4 border-b border-neutral-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-lg font-black text-neutral-950">
                      {request.name}
                    </div>

                    <div className="mt-1 text-sm text-neutral-600">
                      {request.email}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((status) => (
                      <form key={status} action={updateClaimOfferStatus}>
                        <input type="hidden" name="id" value={request.id} />
                        <input type="hidden" name="status" value={status} />

                        <button
                          type="submit"
                          className={[
                            "rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.08em]",
                            request.status === status
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50",
                          ].join(" ")}
                        >
                          {status.replaceAll("_", " ")}
                        </button>
                      </form>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 px-5 py-5 lg:grid-cols-[0.72fr_1.28fr]">
                  <div className="space-y-3 text-sm">
                    <Info label="Submitted" value={new Date(request.created_at).toLocaleString()} />
                    <Info label="Site URL" value={request.site_url || "N/A"} />
                    <Info label="Deadline" value={request.deadline || "N/A"} />
                    <Info label="Resend ID" value={request.resend_message_id || "N/A"} />

                    <div>
                      <div className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
                        Attachment
                      </div>

                      {request.download_url ? (
                        <a
                          href={request.download_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-bold text-white hover:bg-neutral-800"
                        >
                          Download {request.file_name || "file"}
                        </a>
                      ) : (
                        <div className="mt-1 break-all font-semibold text-neutral-700">
                          {request.file_name || "None"}
                        </div>
                      )}
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
              No claim offer requests found.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
        {label}
      </div>
      <div className="mt-1 break-all font-semibold text-neutral-700">
        {value}
      </div>
    </div>
  );
}