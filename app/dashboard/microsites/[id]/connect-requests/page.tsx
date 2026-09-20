import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type MatchStatus =
  | "new"
  | "viewed"
  | "responded"
  | "closed";

type RequestStatus =
  | "open"
  | "fulfilled"
  | "cancelled"
  | "expired";

type ConnectProviderProfileRow = {
  id: string;
  enabled: boolean;
  service_zip_code: string;
  service_radius_miles: number;
};

type MicrositeRow = {
  id: string;
  owner_clerk_user_id: string;
  slug: string;
  title: string;
  is_published: boolean;
  is_active: boolean | null;
};

type ConnectRequestRow = {
  id: string;
  status: MatchStatus;
  matched_at: string;
  viewed_at: string | null;
  responded_at: string | null;
  closed_at: string | null;
  connect_requests: {
    id: string;
    request_code: string;
    service: string;
    zip_code: string;
    service_needed_date: string | null;
    details: string;
    status: RequestStatus;
    created_at: string;
    expires_at: string | null;
  } | null;
};

type SearchParams = {
  q?: string | string[];
  status?: string | string[];
  service?: string | string[];
  sort?: string | string[];
};

function firstParam(
  value: string | string[] | undefined,
) {
  return Array.isArray(value)
    ? value[0] ?? ""
    : value ?? "";
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const parsed = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

function getTimestamp(value?: string | null) {
  if (!value) return 0;

  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
}

function getServiceDateTimestamp(
  value?: string | null,
) {
  if (!value) return Number.MAX_SAFE_INTEGER;

  const timestamp = new Date(
    `${value}T00:00:00`,
  ).getTime();

  return Number.isNaN(timestamp)
    ? Number.MAX_SAFE_INTEGER
    : timestamp;
}

function getMatchStatusLabel(
  status: MatchStatus,
) {
  switch (status) {
    case "new":
      return "New";

    case "viewed":
      return "Viewed";

    case "responded":
      return "Responded";

    case "closed":
      return "Closed";

    default:
      return status;
  }
}

export default async function ConnectRequestsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { id } = await params;
  const resolvedSearchParams =
    await searchParams;

  const searchQuery = firstParam(
    resolvedSearchParams.q,
  ).trim();

  const statusFilter = firstParam(
    resolvedSearchParams.status,
  );

  const serviceFilter = firstParam(
    resolvedSearchParams.service,
  );

  const sortMode =
    firstParam(resolvedSearchParams.sort) ||
    "newest";

  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="p-6">
        Unauthorized
      </div>
    );
  }

  const sb = getSupabaseAdmin();

  // =====================================================
  // Verify microsite ownership
  // =====================================================

const {
  data: siteData,
  error: siteError,
} = await sb
  .from("microsites")
  .select(
    [
      "id",
      "owner_clerk_user_id",
      "slug",
      "title",
      "is_published",
      "is_active",
    ].join(","),
  )
  .eq("id", id)
  .maybeSingle();

const site =
  siteData as unknown as MicrositeRow | null;

  if (siteError || !site) {
    return notFound();
  }

  if (
    site.owner_clerk_user_id !== userId
  ) {
    return (
      <div className="p-6">
        Forbidden
      </div>
    );
  }

  // =====================================================
  // Load provider profile
  // =====================================================

const {
  data: providerProfileData,
  error: providerError,
} = await sb
  .from("connect_provider_profiles")
  .select(
    [
      "id",
      "enabled",
      "service_zip_code",
      "service_radius_miles",
    ].join(","),
  )
  .eq("microsite_id", site.id)
  .maybeSingle();

const providerProfile =
  providerProfileData as unknown as
    | ConnectProviderProfileRow
    | null;

  if (providerError) {
    console.error(
      "Connect provider profile load failed:",
      providerError,
    );

    return (
      <div className="p-6">
        Failed to load Ko-Host Connect
        provider settings.
      </div>
    );
  }

  if (!providerProfile) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Connect Requests
          </h1>

          <p className="mt-2 text-sm text-neutral-600">
            This microsite has not been linked
            to Ko-Host Connect yet.
          </p>

          <Link
            href={`/dashboard/microsites/${site.id}`}
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Back to Manage Site
          </Link>
        </div>
      </main>
    );
  }

  // =====================================================
  // Load persistent request assignments
  // =====================================================

  const {
    data: matchRows,
    error: matchesError,
  } = await sb
    .from("connect_request_matches")
    .select(
      `
        id,
        status,
        matched_at,
        viewed_at,
        responded_at,
        closed_at,
        connect_requests!inner (
          id,
          request_code,
          service,
          zip_code,
          service_needed_date,
          details,
          status,
          created_at,
          expires_at
        )
      `,
    )
    .eq(
      "provider_profile_id",
      providerProfile.id,
    )
    .limit(5000);

  if (matchesError) {
    console.error(
      "Connect requests list failed:",
      matchesError,
    );

    return (
      <div className="p-6">
        Failed to load Connect requests.
      </div>
    );
  }

  const matches =
    (matchRows ??
      []) as unknown as ConnectRequestRow[];

  // =====================================================
  // Summary
  // =====================================================

  const newCount = matches.filter(
    (row) => row.status === "new",
  ).length;

  const viewedCount = matches.filter(
    (row) => row.status === "viewed",
  ).length;

  const respondedCount = matches.filter(
    (row) => row.status === "responded",
  ).length;

  const openCount = matches.filter(
    (row) =>
      row.connect_requests?.status ===
      "open",
  ).length;

  // =====================================================
  // Service filter options
  // =====================================================

  const availableServices = Array.from(
    new Set(
      matches
        .map(
          (row) =>
            row.connect_requests?.service,
        )
        .filter(
          (value): value is string =>
            Boolean(value),
        ),
    ),
  ).sort((a, b) =>
    a.localeCompare(b),
  );

  // =====================================================
  // Search + filters
  // =====================================================

  const normalizedSearch =
    searchQuery.toLowerCase();

  let visibleMatches = matches.filter(
    (row) => {
      const request =
        row.connect_requests;

      if (!request) {
        return false;
      }

      if (
        statusFilter &&
        row.status !== statusFilter
      ) {
        return false;
      }

      if (
        serviceFilter &&
        request.service !== serviceFilter
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableValues = [
        request.request_code,
        request.service,
        request.zip_code,
        request.service_needed_date,
        request.details,
      ];

      return searchableValues.some(
        (value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(normalizedSearch),
      );
    },
  );

  // =====================================================
  // Sorting
  // =====================================================

  visibleMatches = [
    ...visibleMatches,
  ].sort((a, b) => {
    switch (sortMode) {
case "oldest":
  return (
    getTimestamp(
      a.connect_requests?.created_at,
    ) -
    getTimestamp(
      b.connect_requests?.created_at,
    )
  );

      case "service_date_asc":
        return (
          getServiceDateTimestamp(
            a.connect_requests
              ?.service_needed_date,
          ) -
          getServiceDateTimestamp(
            b.connect_requests
              ?.service_needed_date,
          )
        );

      case "service_date_desc":
        return (
          getServiceDateTimestamp(
            b.connect_requests
              ?.service_needed_date,
          ) -
          getServiceDateTimestamp(
            a.connect_requests
              ?.service_needed_date,
          )
        );

case "newest":
default:
  return (
    getTimestamp(
      b.connect_requests?.created_at,
    ) -
    getTimestamp(
      a.connect_requests?.created_at,
    )
  );
    }
  });

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(statusFilter) ||
    Boolean(serviceFilter) ||
    sortMode !== "newest";

  // =====================================================
  // Render
  // =====================================================

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm text-neutral-500">
                Ko-Host Connect
              </div>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
                Connect Requests
              </h1>

              <div className="mt-3 space-y-1 text-sm text-neutral-700">
                <div>
                  <span className="font-medium">
                    Microsite:
                  </span>{" "}
                  {site.title ||
                    "(Untitled)"}
                </div>

                <div>
                  <span className="font-medium">
                    Service Area:
                  </span>{" "}
                  {providerProfile.service_zip_code}
                  {" · "}
                  {
                    providerProfile.service_radius_miles
                  }{" "}
                  miles
                </div>

                <div>
                  <span className="font-medium">
                    Connect:
                  </span>{" "}
                  {providerProfile.enabled
                    ? "Enabled"
                    : "Disabled"}
                </div>
              </div>
            </div>

            <Link
              href={`/dashboard/microsites/${site.id}`}
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:border-neutral-900"
            >
              Back to Manage Site
            </Link>
          </div>

          {/* SUMMARY */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="text-xs font-medium text-neutral-500">
                New
              </div>

              <div className="mt-1 text-2xl font-semibold text-neutral-900">
                {newCount}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="text-xs font-medium text-neutral-500">
                Viewed
              </div>

              <div className="mt-1 text-2xl font-semibold text-neutral-900">
                {viewedCount}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="text-xs font-medium text-neutral-500">
                Responded
              </div>

              <div className="mt-1 text-2xl font-semibold text-neutral-900">
                {respondedCount}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="text-xs font-medium text-neutral-500">
                Open Requests
              </div>

              <div className="mt-1 text-2xl font-semibold text-neutral-900">
                {openCount}
              </div>
            </div>
          </div>
        </div>

        {/* REQUESTS */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-neutral-900">
                  Request Activity
                </div>

                <div className="mt-1 text-sm text-neutral-500">
                  Review service requests
                  matched to this provider.
                </div>
              </div>

              <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                {visibleMatches.length}{" "}
                {visibleMatches.length === 1
                  ? "request"
                  : "requests"}
              </div>
            </div>

            {/* FILTERS */}
            <form
              method="get"
              className="mt-4 grid gap-3 lg:grid-cols-[minmax(240px,1fr)_170px_200px_210px_auto]"
            >
              <input
                type="search"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search requests..."
                className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-900"
              />

              <select
                name="status"
                defaultValue={statusFilter}
                className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
              >
                <option value="">
                  All Statuses
                </option>
                <option value="new">
                  New
                </option>
                <option value="viewed">
                  Viewed
                </option>
                <option value="responded">
                  Responded
                </option>
                <option value="closed">
                  Closed
                </option>
              </select>

              <select
                name="service"
                defaultValue={serviceFilter}
                className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
              >
                <option value="">
                  All Services
                </option>

                {availableServices.map(
                  (service) => (
                    <option
                      key={service}
                      value={service}
                    >
                      {service}
                    </option>
                  ),
                )}
              </select>

              <select
                name="sort"
                defaultValue={sortMode}
                className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
              >
                <option value="newest">
                  Received: Newest
                </option>

                <option value="oldest">
                  Received: Oldest
                </option>

                <option value="service_date_asc">
                  Service Date: Soonest
                </option>

                <option value="service_date_desc">
                  Service Date: Latest
                </option>
              </select>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-neutral-900 px-4 text-sm font-semibold text-white hover:bg-neutral-800"
                >
                  Apply
                </button>

                {hasActiveFilters ? (
                  <Link
                    href={`/dashboard/microsites/${site.id}/connect-requests`}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-700 hover:border-neutral-900"
                  >
                    Clear
                  </Link>
                ) : null}
              </div>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-neutral-700">
                    Date
                  </th>

                  <th className="px-4 py-3 font-medium text-neutral-700">
                    Time
                  </th>

                  <th className="px-4 py-3 font-medium text-neutral-700">
                    Service
                  </th>

                  <th className="px-4 py-3 font-medium text-neutral-700">
                    Service Needed
                  </th>

                  <th className="px-4 py-3 font-medium text-neutral-700">
                    Location
                  </th>

                  <th className="px-4 py-3 font-medium text-neutral-700">
                    Status
                  </th>

                  <th className="px-4 py-3 font-medium text-neutral-700">
                    Request
                  </th>

                  <th className="px-4 py-3 font-medium text-neutral-700">
                    Link
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {visibleMatches.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center"
                    >
                      <div className="text-sm font-medium text-neutral-700">
                        {matches.length === 0
                          ? "No Connect requests yet."
                          : "No requests match your current filters."}
                      </div>

                      {matches.length > 0 &&
                      hasActiveFilters ? (
                        <div className="mt-3">
                          <Link
                            href={`/dashboard/microsites/${site.id}/connect-requests`}
                            className="text-sm font-medium text-neutral-900 underline underline-offset-4"
                          >
                            Clear filters
                          </Link>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ) : (
                  visibleMatches.map(
                    (match) => {
                      const request =
                        match.connect_requests;

                      if (!request) {
                        return null;
                      }

const receivedDate =
  new Date(
    request.created_at,
  );

                      return (
                        <tr key={match.id}>
                          <td className="whitespace-nowrap px-4 py-3 text-neutral-800">
                            {receivedDate.toLocaleDateString()}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-neutral-700">
                            {receivedDate.toLocaleTimeString(
                              [],
                              {
                                hour: "numeric",
                                minute: "2-digit",
                              },
                            )}
                          </td>

                          <td className="px-4 py-3 font-medium text-neutral-900">
                            {request.service}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-neutral-700">
                            {formatDate(
                              request.service_needed_date,
                            )}
                          </td>

                          <td className="px-4 py-3 text-neutral-700">
                            ZIP {request.zip_code}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={[
                                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                                match.status ===
                                "new"
                                  ? "bg-blue-50 text-blue-700"
                                  : match.status ===
                                      "responded"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : match.status ===
                                        "closed"
                                      ? "bg-neutral-100 text-neutral-500"
                                      : "bg-amber-50 text-amber-700",
                              ].join(" ")}
                            >
                              {getMatchStatusLabel(
                                match.status,
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <Link
                              href={`/dashboard/microsites/${site.id}/connect-requests/${request.request_code}`}
                              className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900"
                            >
                              View Request
                            </Link>
                          </td>

                          <td className="px-4 py-3">
                            <button
                              type="button"
                              disabled
                              title="Copy link will be enabled with the request detail page."
                              className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-400"
                            >
                              Copy Link
                            </button>
                          </td>
                        </tr>
                      );
                    },
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}