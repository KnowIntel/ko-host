// app/dashboard/admin/help-feedback/page.tsx

import Link from "next/link";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const STATUSES = [
  "new",
  "in_progress",
  "resolved",
  "archived",
] as const;

type HelpFeedbackStatus =
  (typeof STATUSES)[number];

type HelpFeedbackRequest = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  request_type: string;
  subject: string | null;
  message: string;
  site_url: string | null;
  status: string | null;
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

function getStatusLabel(
  status: string | null,
) {
  switch (status) {
    case "in_progress":
      return "In Progress";

    case "resolved":
      return "Resolved";

    case "archived":
      return "Archived";

    default:
      return "New";
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case "question":
      return "Question";

    case "technical_problem":
      return "Technical Problem";

    case "suggestion":
      return "Suggestion";

    case "feature_request":
      return "Feature Request";

    case "billing_account":
      return "Billing / Account";

    case "other":
      return "Other";

    default:
      return type || "Message";
  }
}

function getStatusClasses(
  status: string | null,
) {
  switch (status) {
    case "in_progress":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "resolved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "archived":
      return "border-neutral-200 bg-neutral-100 text-neutral-600";

    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

async function updateStatus(
  formData: FormData,
) {
  "use server";

  const id = String(
    formData.get("id") ?? "",
  ).trim();

  const status = String(
    formData.get("status") ?? "",
  ).trim() as HelpFeedbackStatus;

  if (
    !id ||
    !STATUSES.includes(status)
  ) {
    return;
  }

  const supabaseAdmin =
    getSupabaseAdmin();

  const { error } =
    await supabaseAdmin
      .from("help_feedback_requests")
      .update({
        status,
      })
      .eq("id", id);

  if (error) {
    console.error(
      "Help feedback status update failed:",
      error,
    );

    return;
  }

  revalidatePath(
    "/dashboard/admin/help-feedback",
  );
}

export default async function HelpFeedbackAdminPage() {
  const supabaseAdmin =
    getSupabaseAdmin();

  const { data, error } =
    await supabaseAdmin
      .from("help_feedback_requests")
.select(
  `
    id,
    created_at,
    name,
    email,
    request_type,
    subject,
    message,
    site_url,
    status
  `,
)
      .order(
        "created_at",
        {
          ascending: false,
        },
      );

  const requests =
    (data ??
      []) as HelpFeedbackRequest[];

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/dashboard/admin"
              className="text-sm font-semibold text-neutral-500 transition hover:text-neutral-900"
            >
              ← Admin Dashboard
            </Link>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-neutral-950">
              Help & Feedback
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
              Review customer questions,
              suggestions, bug reports,
              and general feedback.
            </p>
          </div>

          <div className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm">
            {requests.length}{" "}
            {requests.length === 1
              ? "message"
              : "messages"}
          </div>
        </div>

        {error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
            Unable to load Help &
            Feedback requests.
          </div>
        ) : null}

        {!error &&
        !requests.length ? (
          <div className="mt-8 rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
            <div className="text-lg font-bold text-neutral-900">
              No messages yet
            </div>

            <div className="mt-2 text-sm text-neutral-500">
              Customer questions and
              feedback will appear here.
            </div>
          </div>
        ) : null}

        {requests.length ? (
          <div className="mt-8 space-y-4">
            {requests.map(
              (request) => (
                <article
                  key={request.id}
                  className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm"
                >
                  <div className="flex flex-col gap-4 border-b border-neutral-100 px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={[
                            "rounded-full border px-2.5 py-1 text-[11px] font-bold",
                            getStatusClasses(
                              request.status,
                            ),
                          ].join(" ")}
                        >
                          {getStatusLabel(
                            request.status,
                          )}
                        </span>

                        <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-bold text-neutral-600">
                          {getTypeLabel(
                            request.request_type,
                          )}
                        </span>
                      </div>

                      <div className="mt-3 text-lg font-bold text-neutral-950">
                        {request.subject ||
                          getTypeLabel(
                            request.request_type,
                          )}
                      </div>

                      <div className="mt-1 text-sm text-neutral-600">
                        {request.name}
                        {" • "}
                        <a
                          href={`mailto:${request.email}`}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {request.email}
                        </a>
                      </div>

                      <div className="mt-1 text-xs text-neutral-400">
                        {formatDate(
                          request.created_at,
                        )}
                      </div>
                    </div>

                    <form
                      action={
                        updateStatus
                      }
                      className="flex shrink-0 items-center gap-2"
                    >
                      <input
                        type="hidden"
                        name="id"
                        value={request.id}
                      />

                      <select
                        name="status"
                        defaultValue={
                          request.status ||
                          "new"
                        }
                        className="h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 outline-none focus:ring-2 focus:ring-blue-500/30"
                      >
                        {STATUSES.map(
                          (status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {getStatusLabel(
                                status,
                              )}
                            </option>
                          ),
                        )}
                      </select>

                      <button
                        type="submit"
                        className="h-10 rounded-xl bg-neutral-950 px-4 text-sm font-bold text-white transition hover:bg-neutral-800"
                      >
                        Update
                      </button>
                    </form>
                  </div>

                  <div className="px-5 py-5">
                    {request.site_url ? (
                      <div className="mb-4 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-400">
                          Microsite
                        </div>

                        <div className="mt-1 break-all text-sm font-medium text-neutral-700">
                          {request.site_url}
                        </div>
                      </div>
                    ) : null}

                    <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-400">
                      Message
                    </div>

                    <div className="mt-2 whitespace-pre-wrap text-sm leading-7 text-neutral-700">
                      {request.message}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <a
                        href={`mailto:${request.email}?subject=${encodeURIComponent(
                          `Re: ${
                            request.subject ||
                            "Your Ko-Host message"
                          }`,
                        )}`}
                        className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
                      >
                        Reply by Email
                      </a>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}