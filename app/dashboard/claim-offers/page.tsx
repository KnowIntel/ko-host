import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { logAdminActivity } from "@/lib/adminActivity";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "knowintelligentlife@gmail.com";
const ATTACHMENT_BUCKET = "claim-offer-attachments";
const STATUSES = ["new", "in_progress", "complete", "archived"] as const;
const PRIORITIES = ["low", "normal", "high", "urgent"] as const;

const CANNED_REPLIES = [
  {
    label: "Received",
    subject: "Re: Your Ko-Host claim offer request",
    body: "Hi, thanks for submitting your Ko-Host claim offer request. We received it and are reviewing the details now.",
  },
  {
    label: "Need Details",
    subject: "Re: More details needed for your Ko-Host request",
    body: "Hi, thanks for your request. We need a few more details before we can move forward. Could you send any extra context, examples, deadlines, or files that would help us complete this?",
  },
  {
    label: "Completed",
    subject: "Re: Your Ko-Host request is complete",
    body: "Hi, your Ko-Host request has been completed. Please review it and let us know if anything else needs to be adjusted.",
  },
];

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
  priority: string;
  admin_notes: string | null;
  assigned_to: string | null;
  created_at: string;
  download_url?: string | null;
  converted_to_support: boolean;
  is_archived: boolean;
};

async function updateClaimOfferStatus(formData: FormData) {
  "use server";

  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) notFound();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id || !STATUSES.includes(status as any)) return;

  const sb = getSupabaseAdmin();

  await sb.from("claim_offer_requests").update({ status }).eq("id", id);

  await logAdminActivity({
    adminEmail: userEmail,
    action: "claim_offer_status_updated",
    targetType: "claim_offer_request",
    targetId: id,
    details: { status },
  });

  revalidatePath("/dashboard/claim-offers");
}

async function updateClaimOfferDetails(formData: FormData) {
  "use server";

  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) notFound();

  const id = String(formData.get("id") ?? "");
  const priority = String(formData.get("priority") ?? "normal");
  const assignedTo = String(formData.get("assigned_to") ?? "").trim();
  const adminNotes = String(formData.get("admin_notes") ?? "").trim();

  if (!id || !PRIORITIES.includes(priority as any)) return;

  const sb = getSupabaseAdmin();

  await sb
    .from("claim_offer_requests")
    .update({
      priority,
      assigned_to: assignedTo || null,
      admin_notes: adminNotes || null,
    })
    .eq("id", id);

  await logAdminActivity({
    adminEmail: userEmail,
    action: "claim_offer_details_updated",
    targetType: "claim_offer_request",
    targetId: id,
    details: { priority, assignedTo },
  });

  revalidatePath("/dashboard/claim-offers");
}

async function convertClaimOfferToSupportTicket(formData: FormData) {
  "use server";

  const user = await currentUser();
  const userEmail =
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  const id = String(formData.get("id") ?? "");

  if (!id) return;

  const sb = getSupabaseAdmin();

  const { data: request } = await sb
    .from("claim_offer_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (!request) return;

  await sb.from("support_requests").insert({
    name: request.name,
    email: request.email,
    message: request.description,
    source: "claim-offer",
    status: "new",
  });

  await sb
    .from("claim_offer_requests")
    .update({
      converted_to_support: true,
    })
    .eq("id", id);

  await logAdminActivity({
    adminEmail: userEmail,
    action: "claim_offer_converted_to_support",
    targetType: "claim_offer_request",
    targetId: id,
    details: { supportEmail: request.email },
  });

  revalidatePath("/dashboard/claim-offers");
}

async function duplicateClaimOfferRequest(formData: FormData) {
  "use server";

  const user = await currentUser();
  const userEmail =
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  const id = String(formData.get("id") ?? "");

  if (!id) return;

  const sb = getSupabaseAdmin();

  const { data: request } = await sb
    .from("claim_offer_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (!request) return;

  await sb.from("claim_offer_requests").insert({
    name: request.name,
    email: request.email,
    site_url: request.site_url,
    description: request.description,
    deadline: request.deadline,
    file_name: request.file_name,
    file_path: request.file_path,
    priority: "normal",
    status: "new",
    assigned_to: null,
    admin_notes: null,
  });

  await logAdminActivity({
    adminEmail: userEmail,
    action: "claim_offer_duplicated",
    targetType: "claim_offer_request",
    targetId: id,
    details: { email: request.email },
  });

  revalidatePath("/dashboard/claim-offers");
}

async function archiveClaimOfferRequest(formData: FormData) {
  "use server";

  const user = await currentUser();
  const userEmail =
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  const id = String(formData.get("id") ?? "");

  if (!id) return;

  const sb = getSupabaseAdmin();

  await sb
    .from("claim_offer_requests")
    .update({
      is_archived: true,
      status: "archived",
    })
    .eq("id", id);

  await logAdminActivity({
    adminEmail: userEmail,
    action: "claim_offer_archived",
    targetType: "claim_offer_request",
    targetId: id,
  });

  revalidatePath("/dashboard/claim-offers");
}

async function deleteClaimOfferRequest(formData: FormData) {
  "use server";

  const user = await currentUser();
  const userEmail =
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  const id = String(formData.get("id") ?? "");

  if (!id) return;

  const sb = getSupabaseAdmin();

  await sb.from("claim_offer_requests").delete().eq("id", id);

  await logAdminActivity({
    adminEmail: userEmail,
    action: "claim_offer_deleted",
    targetType: "claim_offer_request",
    targetId: id,
  });

  revalidatePath("/dashboard/claim-offers");
}

async function archiveCompletedRequests() {
  "use server";

  const user = await currentUser();
  const userEmail =
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  const sb = getSupabaseAdmin();

  await sb
    .from("claim_offer_requests")
    .update({
      is_archived: true,
    })
    .eq("status", "complete")
    .eq("is_archived", false);

  await logAdminActivity({
    adminEmail: userEmail,
    action: "claim_offers_completed_archived",
    targetType: "claim_offer_request",
  });

  revalidatePath("/dashboard/claim-offers");
}

async function markAllUnassignedUrgent() {
  "use server";

  const user = await currentUser();
  const userEmail =
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  const sb = getSupabaseAdmin();

  await sb
    .from("claim_offer_requests")
    .update({
      priority: "urgent",
    })
    .is("assigned_to", null)
    .neq("status", "complete");

  await logAdminActivity({
    adminEmail: userEmail,
    action: "claim_offers_unassigned_flagged",
    targetType: "claim_offer_request",
  });

  revalidatePath("/dashboard/claim-offers");
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function getPriorityClass(priority: string) {
  if (priority === "urgent") return "bg-red-50 text-red-700 ring-red-200";
  if (priority === "high") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (priority === "low")
    return "bg-neutral-100 text-neutral-600 ring-neutral-200";
  return "bg-blue-50 text-blue-700 ring-blue-200";
}


export default async function ClaimOffersDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{
  status?: string;
  priority?: string;
  assigned?: string;
  owner?: string;
  sort?: string;
  search?: string;
}>;
}) {
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) notFound();

  const params = await searchParams;
const activeStatus = params?.status || "all";
const activePriority = params?.priority || "all";
const activeAssigned = params?.assigned || "all";
const activeOwner = params?.owner || "all";
const activeSort = params?.sort || "newest";
const search = params?.search?.trim() ?? "";
const normalizedSearch = search.toLowerCase();

  const supabaseAdmin = getSupabaseAdmin();

  let query = supabaseAdmin
    .from("claim_offer_requests")
.select(
  "id, name, email, site_url, description, deadline, file_name, file_path, resend_message_id, status, priority, admin_notes, assigned_to, converted_to_support, is_archived, created_at",
)
    .order("created_at", {
  ascending: activeSort === "oldest",
});

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

if (activeOwner !== "all") {
  query = query.eq("assigned_to", activeOwner);
}

  const { data, error } = await query;

const filteredData = ((data ?? []) as ClaimOfferRequest[]).filter(
  (request) =>
    !normalizedSearch ||
    request.name?.toLowerCase().includes(normalizedSearch) ||
    request.email?.toLowerCase().includes(normalizedSearch) ||
    request.description?.toLowerCase().includes(normalizedSearch) ||
    request.site_url?.toLowerCase().includes(normalizedSearch) ||
    request.assigned_to?.toLowerCase().includes(normalizedSearch),
);

const requests = await Promise.all(
  filteredData.map(async (request) => {
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
              Review, prioritize, assign, and manage custom development requests.
            </p>
          </div>

<div className="flex flex-wrap gap-2">
  <a
    href="/api/dashboard/admin/export/claims"
    className="inline-flex items-center justify-center rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100"
  >
    Export CSV
  </a>

  <Link
    href="/dashboard/admin"
    className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-bold text-neutral-900 hover:border-neutral-900"
  >
    Back to Admin
  </Link>
</div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {["all", ...STATUSES].map((status) => {
            const nextParams = new URLSearchParams();
            if (status !== "all") nextParams.set("status", status);
            if (activePriority !== "all") nextParams.set("priority", activePriority);
            if (activeAssigned !== "all") nextParams.set("assigned", activeAssigned);

            const href = `/dashboard/claim-offers${
              nextParams.toString() ? `?${nextParams.toString()}` : ""
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
            const nextParams = new URLSearchParams();
            if (activeStatus !== "all") nextParams.set("status", activeStatus);
            if (priority !== "all") nextParams.set("priority", priority);
            if (activeAssigned !== "all") nextParams.set("assigned", activeAssigned);

            const href = `/dashboard/claim-offers${
              nextParams.toString() ? `?${nextParams.toString()}` : ""
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
    const nextParams = new URLSearchParams();

    if (activeStatus !== "all") nextParams.set("status", activeStatus);
    if (activePriority !== "all") nextParams.set("priority", activePriority);
    if (value !== "all") nextParams.set("assigned", value);

    const href = `/dashboard/claim-offers${
      nextParams.toString() ? `?${nextParams.toString()}` : ""
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

<div className="mt-3 flex flex-wrap gap-2">
  {[
    ["all", "All Owners"],
    ["MD", "My Requests"],
  ].map(([value, label]) => {
    const params = new URLSearchParams();

    if (activeStatus !== "all") params.set("status", activeStatus);
    if (activePriority !== "all") params.set("priority", activePriority);
    if (activeAssigned !== "all") params.set("assigned", activeAssigned);
    if (value !== "all") params.set("owner", value);

    const href = `/dashboard/claim-offers${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    return (
      <Link
        key={value}
        href={href}
        className={[
          "rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] transition",
          activeOwner === value
            ? "bg-indigo-600 text-white"
            : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
        ].join(" ")}
      >
        {label}
      </Link>
    );
  })}
</div>

<div className="mt-3 flex flex-wrap gap-2">
  {[
    ["newest", "Newest"],
    ["oldest", "Oldest"],
  ].map(([value, label]) => {
    const params = new URLSearchParams();

    if (activeStatus !== "all") params.set("status", activeStatus);
    if (activePriority !== "all") params.set("priority", activePriority);
    if (activeAssigned !== "all") params.set("assigned", activeAssigned);

    params.set("sort", value);

    return (
      <Link
        key={value}
        href={`/dashboard/claim-offers?${params.toString()}`}
        className={[
          "rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] transition",
          activeSort === value
            ? "bg-purple-600 text-white"
            : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
        ].join(" ")}
      >
        {label}
      </Link>
    );
  })}
</div>

<div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-xs font-bold text-neutral-600">
  <span>Active Filters:</span>
  <span>Status: {activeStatus}</span>
  <span>Priority: {activePriority}</span>
  <span>Assignment: {activeAssigned}</span>
  <span>Owner: {activeOwner}</span>
  <span>Sort: {activeSort}</span>
  {search ? <span>Search: {search}</span> : null}

<form action={markAllUnassignedUrgent}>
  <button
    type="submit"
    className="rounded-full bg-red-50 px-3 py-1 text-red-700 ring-1 ring-red-200 hover:bg-red-100"
  >
    Flag Unassigned
  </button>
</form>

<form action={archiveCompletedRequests}>
  <button
    type="submit"
    onClick={(e) => {
      if (
        !window.confirm(
          "Archive all completed claim offer requests?",
        )
      ) {
        e.preventDefault();
      }
    }}
    className="rounded-full bg-amber-50 px-3 py-1 text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100"
  >
    Archive Completed
  </button>
</form>

  <Link
    href="/dashboard/claim-offers"
    className="ml-auto rounded-full bg-neutral-50 px-3 py-1 text-neutral-900 ring-1 ring-neutral-200 hover:ring-neutral-400"
  >
    Reset
  </Link>
</div>

<form method="GET" className="mt-4">
  <div className="flex flex-col gap-2 sm:flex-row">
    <input
      name="search"
      defaultValue={search}
      placeholder="Search by name, email, description, site URL, or assignee..."
      className="h-11 flex-1 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-900 outline-none focus:border-neutral-400"
    />

    {activeStatus !== "all" ? (
      <input type="hidden" name="status" value={activeStatus} />
    ) : null}

    {activePriority !== "all" ? (
      <input type="hidden" name="priority" value={activePriority} />
    ) : null}

    {activeAssigned !== "all" ? (
      <input type="hidden" name="assigned" value={activeAssigned} />
    ) : null}

    {activeOwner !== "all" ? (
      <input type="hidden" name="owner" value={activeOwner} />
    ) : null}

    <input type="hidden" name="sort" value={activeSort} />

    <button
      type="submit"
      className="inline-flex h-11 items-center justify-center rounded-xl bg-neutral-950 px-5 text-sm font-bold text-white hover:bg-neutral-800"
    >
      Search
    </button>
  </div>
</form>


        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
          <Stat label="Showing" value={requests.length} />
          <Stat
            label="Urgent"
            value={requests.filter((request) => request.priority === "urgent").length}
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
  label="Unassigned"
  value={requests.filter((request) => !request.assigned_to?.trim()).length}
/>
        </section>

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
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-lg font-black text-neutral-950">
                        {request.name}
                      </div>

                      <span
                        className={[
                          "rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-[0.08em] ring-1",
                          getPriorityClass(request.priority || "normal"),
                        ].join(" ")}
                      >
                        {request.priority || "normal"}
                      </span>
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
                    <Info label="Submitted" value={formatDate(request.created_at)} />

<Info
  label="Age"
  value={`${Math.floor(
    (Date.now() - new Date(request.created_at).getTime()) /
      (1000 * 60 * 60 * 24),
  )} day(s)`}
/>
                    <Info label="Site URL" value={request.site_url || "N/A"} />
                    <Info label="Status" value={request.status || "new"} />
                    <Info label="Priority" value={request.priority || "normal"} />
                    <Info label="Assigned To" value={request.assigned_to || "N/A"} />
                    <Info label="Deadline" value={request.deadline || "N/A"} />
                    <Info label="Resend ID" value={request.resend_message_id || "N/A"} />
                    <div>
  <div className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
    Request ID
  </div>

  <div className="mt-1 flex items-center gap-2">
    <code className="text-xs font-semibold text-neutral-700">
      {request.id}
    </code>

    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(request.id)}
      className="rounded-lg border border-neutral-200 px-2 py-1 text-[10px] font-bold"
    >
      Copy
    </button>
  </div>
</div>

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

                    {request.admin_notes ? (
                      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-800">
                        {request.admin_notes}
                      </div>
                    ) : null}

                    <form
                      action={updateClaimOfferDetails}
                      className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4"
                    >
                      <input type="hidden" name="id" value={request.id} />

                      <div className="grid gap-4 sm:grid-cols-2">
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
                          Assigned To
                          <input
                            name="assigned_to"
                            defaultValue={request.assigned_to || ""}
                            placeholder="admin/team member"
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
  Reply by Email
</a>

{!request.converted_to_support ? (
  <form action={convertClaimOfferToSupportTicket}>
    <input type="hidden" name="id" value={request.id} />

    <button
      type="submit"
      className="inline-flex items-center justify-center rounded-xl border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100"
    >
      Convert to Support Ticket
    </button>
  </form>
) : (
  <div className="inline-flex items-center justify-center rounded-xl border border-green-300 bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
    Converted to Support
  </div>
)}

<form action={duplicateClaimOfferRequest}>
  <input type="hidden" name="id" value={request.id} />

  <button
    type="submit"
    className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-bold text-neutral-900 hover:border-neutral-900"
  >
    Duplicate Request
  </button>
</form>

{!request.is_archived ? (
  <form action={archiveClaimOfferRequest}>
    <input type="hidden" name="id" value={request.id} />

    <button
      type="submit"
      className="inline-flex items-center justify-center rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 hover:bg-amber-100"
    >
      Archive Request
    </button>
  </form>
) : (
  <div className="inline-flex items-center justify-center rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">
    Archived
  </div>
)}

<form action={deleteClaimOfferRequest}>
  <input type="hidden" name="id" value={request.id} />

  <button
    type="submit"
    onClick={(e) => {
      if (
        !window.confirm(
          "Are you sure you want to permanently delete this request?",
        )
      ) {
        e.preventDefault();
      }
    }}
    className="inline-flex items-center justify-center rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100"
  >
    Delete Request
  </button>
</form>

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