import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { logAdminActivity } from "@/lib/adminActivity";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "knowintelligentlife@gmail.com";
const STATUSES = ["new", "in_progress", "complete", "archived"] as const;
const PRIORITIES = ["low", "normal", "high", "urgent"] as const;

const CANNED_REPLIES = [
  {
    label: "General Support",
    subject: "Re: Your Ko-Host support request",
    body: "Hi, thanks for reaching out to Ko-Host. We received your request and are reviewing it now. We’ll follow up with next steps shortly.",
  },
  {
    label: "Billing Help",
    subject: "Re: Ko-Host billing support",
    body: "Hi, thanks for contacting Ko-Host. We’re reviewing your billing question and will help confirm the payment, renewal, or checkout details.",
  },
  {
    label: "Technical Issue",
    subject: "Re: Ko-Host technical support",
    body: "Hi, thanks for reporting this issue. We’re checking the microsite, builder, or account behavior now and will follow up once we’ve reviewed it.",
  },
];

type SupportRequest = {
  id: string;
  name: string | null;
  email: string;
  message: string;
  source: string | null;
  status: string;
  priority: string;
  votes: number;
  category: string | null;
  assigned_to: string | null;
  admin_notes: string | null;
  resend_message_id: string | null;
  last_response_at: string | null;
  created_at: string;
};

async function updateSupportRequestStatus(formData: FormData) {
  "use server";

  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) notFound();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id || !STATUSES.includes(status as any)) return;

  const sb = getSupabaseAdmin();

  await sb.from("feature_requests").update({ status }).eq("id", id);

  await logAdminActivity({
    adminEmail: userEmail,
    action: "support_status_updated",
    targetType: "feature_request",
    targetId: id,
    details: { status },
  });

  revalidatePath("/dashboard/admin/support");
}

async function updateSupportRequestDetails(formData: FormData) {
  "use server";

  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) notFound();

  const id = String(formData.get("id") ?? "");
  const priority = String(formData.get("priority") ?? "normal");
  const votes = Number(formData.get("votes") ?? 0);
  const category = String(formData.get("category") ?? "").trim();
  const assignedTo = String(formData.get("assigned_to") ?? "").trim();
  const adminNotes = String(formData.get("admin_notes") ?? "").trim();

  if (!id || !PRIORITIES.includes(priority as any)) return;

  const sb = getSupabaseAdmin();

  await sb
    .from("feature_requests")
    .update({
    priority,
    votes: Math.max(0, votes),
    category: category || null,
    assigned_to: assignedTo || null,
    admin_notes: adminNotes || null,
    })
    .eq("id", id);

  await logAdminActivity({
    adminEmail: userEmail,
    action: "support_details_updated",
    targetType: "feature_request",
    targetId: id,
    details: {
      priority,
      category,
      assignedTo,
    },
  });

  revalidatePath("/dashboard/admin/support");
}

async function updateFeatureVotes(formData: FormData) {
  "use server";

  const user = await currentUser();
  const userEmail =
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  const id = String(formData.get("id") ?? "");
  const votes = Number(formData.get("votes") ?? 0);

  if (!id) return;

  const supabase = getSupabaseAdmin();

  await supabase
    .from("feature_requests")
    .update({
      votes: Math.max(0, votes),
    })
    .eq("id", id);

  revalidatePath("/dashboard/admin/feature-requests");
}

async function markSupportRequestResponded(formData: FormData) {
  "use server";

  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) notFound();

  const id = String(formData.get("id") ?? "");

  if (!id) return;

  const sb = getSupabaseAdmin();

  await sb
    .from("feature_requests")
    .update({
      last_response_at: new Date().toISOString(),
      status: "in_progress",
    })
    .eq("id", id);

  await logAdminActivity({
    adminEmail: userEmail,
    action: "support_marked_responded",
    targetType: "feature_request",
    targetId: id,
  });

  revalidatePath("/dashboard/admin/support");
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function getPriorityClass(priority: string) {
  if (priority === "urgent") return "bg-red-50 text-red-700 ring-red-200";
  if (priority === "high") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (priority === "low") return "bg-neutral-100 text-neutral-600 ring-neutral-200";
  return "bg-blue-50 text-blue-700 ring-blue-200";
}

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; priority?: string; assigned?: string }>;
}) {
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  const params = await searchParams;
  const activeStatus = params?.status || "all";
  const activePriority = params?.priority || "all";
  const activeAssigned = params?.assigned || "all";

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("feature_requests")
    .select(
    `
        id,
        name,
        email,
        message,
        source,
        status,
        priority,
        votes,
        category,
        assigned_to,
        admin_notes,
        resend_message_id,
        last_response_at,
        created_at
    `,
    )
    .order("created_at", { ascending: false });

  if (STATUSES.includes(activeStatus as any)) {
    query = query.eq("status", activeStatus);
  }
if (PRIORITIES.includes(activePriority as any)) {
  query = query.eq("priority", activePriority);
}

if (activeAssigned === "assigned") {
  query = query.not("assigned_to", "is", null);
}

if (activeAssigned === "unassigned") {
  query = query.is("assigned_to", null);
}

  const { data, error } = await query;
  const requests = (data ?? []) as SupportRequest[];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Ko-Host Admin
            </div>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-950">
              Feature Requests
            </h1>

<p className="mt-2 text-sm text-neutral-600">
  Review, prioritize, assign, and track platform feature requests submitted by Ko-Host users.
</p>
          </div>

          <Link
            href="/dashboard/admin"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-bold text-neutral-900 hover:border-neutral-900"
          >
            Back to Admin
          </Link>
        </div>

<div className="mt-6 flex flex-wrap gap-2">
  {["all", ...STATUSES].map((status) => {
    const params = new URLSearchParams();

    if (status !== "all") params.set("status", status);
    if (activePriority !== "all") params.set("priority", activePriority);
    if (activeAssigned !== "all") params.set("assigned", activeAssigned);

    const href = `/dashboard/admin/support${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    return (
      <Link
        key={status}
        href={href}
        className={[
          "rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] transition",
          activeStatus === status
            ? "bg-neutral-950 text-white"
            : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
        ].join(" ")}
      >
        {status.replaceAll("_", " ")}
      </Link>
    );
  })}
</div>

<div className="mt-3 flex flex-wrap gap-2">
  {["all", ...PRIORITIES].map((priority) => {
    const params = new URLSearchParams();

    if (activeStatus !== "all") params.set("status", activeStatus);
    if (priority !== "all") params.set("priority", priority);
    if (activeAssigned !== "all") params.set("assigned", activeAssigned);

    const href = `/dashboard/admin/support${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    return (
      <Link
        key={priority}
        href={href}
        className={[
          "rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] transition",
          activePriority === priority
            ? "bg-blue-600 text-white"
            : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
        ].join(" ")}
      >
        {priority}
      </Link>
    );
  })}
</div>

<div className="mt-3 flex flex-wrap gap-2">
  {[
    ["all", "All Requests"],
    ["assigned", "Assigned"],
    ["unassigned", "Unassigned"],
  ].map(([value, label]) => {
    const params = new URLSearchParams();

    if (activeStatus !== "all") params.set("status", activeStatus);
    if (activePriority !== "all") params.set("priority", activePriority);
    if (value !== "all") params.set("assigned", value);

    const href = `/dashboard/admin/support${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    return (
      <Link
        key={value}
        href={href}
        className={[
          "rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] transition",
          activeAssigned === value
            ? "bg-emerald-600 text-white"
            : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
        ].join(" ")}
      >
        {label}
      </Link>
    );
  })}
</div>

<div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-bold text-neutral-600">
  <span>Active Filters:</span>
  <span>Status: {activeStatus}</span>
  <span>Priority: {activePriority}</span>
  <span>Assignment: {activeAssigned}</span>

  <Link
    href="/dashboard/admin/support"
    className="ml-auto rounded-full bg-white px-3 py-1 text-neutral-900 ring-1 ring-neutral-200 hover:ring-neutral-400"
  >
    Reset
  </Link>
</div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
        <Stat label="Showing" value={requests.length} />
<Stat
  label="Urgent"
  value={requests.filter((request) => request.priority === "urgent").length}
/>

<Stat
  label="Top Voted"
  value={
    Math.max(
      ...requests.map((request) => request.votes || 0),
      0,
    )
  }
/>

<Stat
  label="High Priority"
  value={requests.filter((request) => request.priority === "high").length}
/>
        <Stat
          label="Open"
          value={
            requests.filter(
              (request) =>
                request.status === "new" || request.status === "in_progress",
            ).length
          }
        />
<Stat
  label="With Notes"
  value={requests.filter((request) => request.admin_notes?.trim()).length}
/>

<Stat
  label="Assigned"
  value={requests.filter((request) => request.assigned_to?.trim()).length}
/>

<Stat
  label="Top Votes"
  value={Math.max(...requests.map((r) => r.votes || 0), 0)}
/>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Failed to load support requests: {error.message}
        </div>
      ) : null}

      <section className="grid gap-5">
        {requests.length ? (
          requests.map((request) => (
            <article
              key={request.id}
              className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-4 border-b border-neutral-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-lg font-black text-neutral-950">
                      {request.name || "Unnamed User"}
                    </div>

                    <span
                      className={[
                        "rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-[0.08em] ring-1",
                        getPriorityClass(request.priority || "normal"),
                      ].join(" ")}
                    >
                      {request.priority || "normal"}
                    </span>

                    <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-black uppercase tracking-[0.08em] text-purple-700 ring-1 ring-purple-200">
                    {request.votes ?? 0} Votes
                    </span>
                  </div>

                  <div className="mt-1 text-sm text-neutral-600">
                    {request.email}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((status) => (
                    <form key={status} action={updateSupportRequestStatus}>
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
                  <Info label="Submitted" value={formatDate(request.created_at)} />
                  <Info label="Source" value={request.source || "N/A"} />
                  <Info label="Status" value={request.status || "new"} />
                  <Info label="Priority" value={request.priority || "normal"} />
                  <Info
                        label="Votes"
                        value={String(request.votes ?? 0)}
                        />
                  <Info label="Category" value={request.category || "N/A"} />
                  <Info label="Assigned To" value={request.assigned_to || "N/A"} />
                  <Info label="Last Response" value={formatDate(request.last_response_at)} />
                  <Info label="Resend ID" value={request.resend_message_id || "N/A"} />
                  <Info label="Ticket ID" value={request.id} />
                </div>

<div>
  <div className="flex items-center justify-between">
    <div className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
      Feature Description
    </div>

    <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-purple-700 ring-1 ring-purple-200">
      Feature Request
    </span>
  </div>

  <div className="mt-2 whitespace-pre-wrap rounded-2xl border border-purple-100 bg-purple-50/40 px-4 py-4 text-sm leading-7 text-neutral-700">
    {request.message}
  </div>

                  {request.admin_notes ? (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-800">
                      {request.admin_notes}
                    </div>
                  ) : null}

                  <form action={updateSupportRequestDetails} className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
                    <input type="hidden" name="id" value={request.id} />

                    <div className="grid gap-4 sm:grid-cols-4">
                      <label className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
                        Priority
                        <select
                          name="priority"
                          defaultValue={request.priority || "normal"}
                          className="mt-2 h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm normal-case tracking-normal text-neutral-900"
                        >
                          {PRIORITIES.map((priority) => (
                            <option key={priority} value={priority}>
                              {priority}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
                        Category
                        <input
                          name="category"
                          defaultValue={request.category || ""}
                          placeholder="billing, bug, account..."
                          className="mt-2 h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm normal-case tracking-normal text-neutral-900"
                        />
                      </label>

                      <label className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
                        Assigned To
                        <input
                          name="assigned_to"
                          defaultValue={request.assigned_to || ""}
                          placeholder="admin/team member"
                          className="mt-2 h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm normal-case tracking-normal text-neutral-900"
                        />
                      </label>

                      <label className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
                        Votes
                        <input
                          type="number"
                          min="0"
                          name="votes"
                          defaultValue={request.votes ?? 0}
                          className="mt-2 h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm normal-case tracking-normal text-neutral-900"
                        />
                      </label>
                    </div>

                    <label className="mt-4 block text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
                      Internal Notes
                      <textarea
                        name="admin_notes"
                        defaultValue={request.admin_notes || ""}
                        placeholder="Add internal notes..."
                        className="mt-2 min-h-[90px] w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm normal-case tracking-normal text-neutral-900"
                      />
                    </label>

                    <button
                      type="submit"
                      className="mt-3 inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-bold text-neutral-900 hover:border-neutral-900"
                    >
                      Save Request Details
                    </button>
                  </form>

                  <div className="mt-4 flex flex-wrap gap-2">
<a
  href={`mailto:${request.email}`}
  className="inline-flex items-center justify-center rounded-xl bg-neutral-950 px-4 py-2 text-sm font-bold text-white hover:bg-neutral-800"
>
  Contact Requester
</a>

{CANNED_REPLIES.map((reply) => (
  <a
    key={reply.label}
    href={`mailto:${request.email}?subject=${encodeURIComponent(
      reply.subject,
    )}&body=${encodeURIComponent(reply.body)}`}
    className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-bold text-neutral-900 hover:border-neutral-900"
  >
    {reply.label}
  </a>
))}

<form action={markSupportRequestResponded}>
  <input type="hidden" name="id" value={request.id} />

  <button
    type="submit"
    className="inline-flex items-center justify-center rounded-xl border border-green-300 bg-green-50 px-4 py-2 text-sm font-bold text-green-700 hover:bg-green-100"
  >
    Mark Responded
  </button>
</form>

{request.last_response_at ? (
  <div className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
    Responded {formatDate(request.last_response_at)}
  </div>
) : null}
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center text-sm font-semibold text-neutral-500">
            No feature requests found.
          </div>
        )}
      </section>
    </div>
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