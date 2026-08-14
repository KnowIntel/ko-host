import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type CalendarBookingRow = {
  id: string;
  block_id: string;
  source_slot_id: string;
  booking_subject: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string | null;
  choice_id: string | null;
  choice_label: string | null;
  booking_date: string;
  start_time: string;
  end_time: string | null;
  status: "confirmed" | "cancelled";
  created_at: string;
  updated_at: string;
};

type SearchParams = {
  q?: string | string[];
  status?: string | string[];
  sort?: string | string[];
};

function firstParam(
  value: string | string[] | undefined,
) {
  return Array.isArray(value)
    ? value[0] ?? ""
    : value ?? "";
}

function formatTime(value?: string | null) {
  if (!value) return "—";

  const [hourRaw, minuteRaw] = value.split(":");

  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);

  if (
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return value;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(
    2,
    "0",
  )} ${suffix}`;
}

function formatBookingDate(value?: string | null) {
  if (!value) return "—";

  const parsed = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getAppointmentTime(
  booking: CalendarBookingRow,
) {
  const value = `${booking.booking_date}T${
    booking.start_time || "00:00"
  }`;

  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getCreatedTime(
  booking: CalendarBookingRow,
) {
  const timestamp = new Date(
    booking.created_at,
  ).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export default async function MicrositeCalendarBookingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  const searchQuery = firstParam(
    resolvedSearchParams.q,
  ).trim();

  const statusFilter = firstParam(
    resolvedSearchParams.status,
  );

  const sortMode =
    firstParam(resolvedSearchParams.sort) ||
    "appointment_asc";

  const { userId } = await auth();

  if (!userId) {
    return <div className="p-6">Unauthorized</div>;
  }

  const sb = getSupabaseAdmin();

  /*
   * Ownership check
   */
  const { data: site, error: siteErr } = await sb
    .from("microsites")
    .select(
      "id, owner_clerk_user_id, slug, title, template_key",
    )
    .eq("id", id)
    .maybeSingle();

  if (siteErr || !site) {
    return notFound();
  }

  if (site.owner_clerk_user_id !== userId) {
    return <div className="p-6">Forbidden</div>;
  }

  /*
   * Load Professional Calendar bookings.
   *
   * Filtering and sorting happen below so the summary
   * cards continue to represent the complete booking set.
   */
  const { data: rows, error: rowsErr } = await sb
    .from("calendar_bookings")
    .select(
      [
        "id",
        "block_id",
        "source_slot_id",
        "booking_subject",
        "visitor_name",
        "visitor_email",
        "visitor_phone",
        "choice_id",
        "choice_label",
        "booking_date",
        "start_time",
        "end_time",
        "status",
        "created_at",
        "updated_at",
      ].join(","),
    )
    .eq("microsite_id", site.id)
    .limit(5000);

  if (rowsErr) {
    console.error(
      "calendar bookings list failed",
      rowsErr,
    );

    return (
      <div className="p-6">
        Failed to load calendar bookings.
      </div>
    );
  }

  const bookings =
    (rows ?? []) as unknown as CalendarBookingRow[];

  /*
   * Summary data
   */
  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "confirmed",
  );

  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "cancelled",
  );

  const todayKey = new Date()
    .toISOString()
    .slice(0, 10);

  const upcomingBookings =
    confirmedBookings.filter(
      (booking) =>
        booking.booking_date >= todayKey,
    );

  const pastBookings = confirmedBookings.filter(
    (booking) =>
      booking.booking_date < todayKey,
  );

  /*
   * Search + filter
   */
  const normalizedSearch =
    searchQuery.toLowerCase();

  let visibleBookings = bookings.filter(
    (booking) => {
      if (
        statusFilter === "confirmed" &&
        booking.status !== "confirmed"
      ) {
        return false;
      }

      if (
        statusFilter === "cancelled" &&
        booking.status !== "cancelled"
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableValues = [
        booking.visitor_name,
        booking.visitor_email,
        booking.visitor_phone,
        booking.booking_subject,
        booking.choice_label,
        booking.booking_date,
        booking.start_time,
      ];

      return searchableValues.some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(normalizedSearch),
      );
    },
  );

  /*
   * Sorting
   */
  visibleBookings = [...visibleBookings].sort(
    (a, b) => {
      switch (sortMode) {
        case "appointment_desc":
          return (
            getAppointmentTime(b) -
            getAppointmentTime(a)
          );

        case "submitted_desc":
          return (
            getCreatedTime(b) -
            getCreatedTime(a)
          );

        case "submitted_asc":
          return (
            getCreatedTime(a) -
            getCreatedTime(b)
          );

        case "appointment_asc":
        default:
          return (
            getAppointmentTime(a) -
            getAppointmentTime(b)
          );
      }
    },
  );

  const hasActiveFilters =
    Boolean(searchQuery) ||
    statusFilter === "confirmed" ||
    statusFilter === "cancelled" ||
    sortMode !== "appointment_asc";

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm text-neutral-500">
                Ko-Host
              </div>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
                Calendar Bookings
              </h1>

              <div className="mt-3 space-y-1 text-sm text-neutral-700">
                <div>
                  <span className="font-medium">
                    Microsite:
                  </span>{" "}
                  {site.title || "(Untitled)"}
                </div>

                <div>
                  <span className="font-medium">
                    Slug:
                  </span>{" "}
                  <span className="font-mono">
                    {site.slug}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`/api/dashboard/microsites/${site.id}/calendar-bookings/export`}
                className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Download CSV
              </a>

              <Link
                href={`/dashboard/microsites/${site.id}`}
                className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:border-neutral-900"
              >
                Back to Manage Site
              </Link>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="text-xs font-medium text-neutral-500">
                Confirmed
              </div>

              <div className="mt-1 text-2xl font-semibold text-neutral-900">
                {confirmedBookings.length}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="text-xs font-medium text-neutral-500">
                Upcoming
              </div>

              <div className="mt-1 text-2xl font-semibold text-neutral-900">
                {upcomingBookings.length}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="text-xs font-medium text-neutral-500">
                Past
              </div>

              <div className="mt-1 text-2xl font-semibold text-neutral-900">
                {pastBookings.length}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="text-xs font-medium text-neutral-500">
                Cancelled
              </div>

              <div className="mt-1 text-2xl font-semibold text-neutral-900">
                {cancelledBookings.length}
              </div>
            </div>
          </div>
        </div>

        {/* BOOKINGS */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-neutral-900">
                  Booking Activity
                </div>

                <div className="mt-1 text-sm text-neutral-500">
                  Review scheduled Professional Calendar
                  appointments and visitor details.
                </div>
              </div>

              <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                {visibleBookings.length}{" "}
                {visibleBookings.length === 1
                  ? "result"
                  : "results"}
              </div>
            </div>

            {/* SEARCH / FILTER / SORT */}
            <form
              method="get"
              className="mt-4 grid gap-3 lg:grid-cols-[minmax(260px,1fr)_180px_220px_auto]"
            >
              <input
                type="search"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search name, email, phone, subject..."
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

                <option value="confirmed">
                  Confirmed
                </option>

                <option value="cancelled">
                  Cancelled
                </option>
              </select>

              <select
                name="sort"
                defaultValue={sortMode}
                className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
              >
                <option value="appointment_asc">
                  Appointment: Soonest
                </option>

                <option value="appointment_desc">
                  Appointment: Latest
                </option>

                <option value="submitted_desc">
                  Submitted: Newest
                </option>

                <option value="submitted_asc">
                  Submitted: Oldest
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
                    href={`/dashboard/microsites/${site.id}/calendar-bookings`}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-700 hover:border-neutral-900"
                  >
                    Clear
                  </Link>
                ) : null}
              </div>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-neutral-700">
                    Date
                  </th>

                  <th className="px-4 py-3 font-medium text-neutral-700">
                    Time
                  </th>

                  <th className="px-4 py-3 font-medium text-neutral-700">
                    Subject
                  </th>

                  <th className="px-4 py-3 font-medium text-neutral-700">
                    Choice
                  </th>

                  <th className="px-4 py-3 font-medium text-neutral-700">
                    Name
                  </th>

                  <th className="px-4 py-3 font-medium text-neutral-700">
                    Email
                  </th>

                  <th className="px-4 py-3 font-medium text-neutral-700">
                    Phone
                  </th>

                  <th className="px-4 py-3 font-medium text-neutral-700">
                    Status
                  </th>

                  <th className="px-4 py-3 font-medium text-neutral-700">
                    Submitted
                  </th>

                  <th className="px-4 py-3 font-medium text-neutral-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {visibleBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-12 text-center"
                    >
                      <div className="text-sm font-medium text-neutral-700">
                        {bookings.length === 0
                          ? "No calendar bookings yet."
                          : "No bookings match your current filters."}
                      </div>

                      {bookings.length > 0 &&
                      hasActiveFilters ? (
                        <div className="mt-3">
                          <Link
                            href={`/dashboard/microsites/${site.id}/calendar-bookings`}
                            className="text-sm font-medium text-neutral-900 underline underline-offset-4"
                          >
                            Clear filters
                          </Link>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ) : (
                  visibleBookings.map(
                    (booking) => {
                      const isCancelled =
                        booking.status ===
                        "cancelled";

                      const isPast =
                        booking.booking_date <
                        todayKey;

                      return (
                        <tr
                          key={booking.id}
                          className={[
                            isCancelled
                              ? "bg-neutral-50/70 opacity-70"
                              : "",
                            !isCancelled && isPast
                              ? "bg-neutral-50/40"
                              : "",
                          ].join(" ")}
                        >
                          <td className="whitespace-nowrap px-4 py-3 font-medium text-neutral-900">
                            {formatBookingDate(
                              booking.booking_date,
                            )}

                            {!isCancelled &&
                            isPast ? (
                              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
                                Past
                              </div>
                            ) : null}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-neutral-800">
                            {formatTime(
                              booking.start_time,
                            )}

                            {booking.end_time
                              ? ` – ${formatTime(
                                  booking.end_time,
                                )}`
                              : ""}
                          </td>

                          <td className="px-4 py-3 text-neutral-900">
                            {booking.booking_subject ||
                              "Appointment"}
                          </td>

                          <td className="px-4 py-3 text-neutral-700">
                            {booking.choice_label ||
                              "—"}
                          </td>

                          <td className="px-4 py-3 font-medium text-neutral-900">
                            {booking.visitor_name}
                          </td>

                          <td className="px-4 py-3 text-neutral-700">
                            <a
                              href={`mailto:${booking.visitor_email}`}
                              className="underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-900"
                            >
                              {
                                booking.visitor_email
                              }
                            </a>
                          </td>

                          <td className="px-4 py-3 text-neutral-700">
                            {booking.visitor_phone ? (
                              <a
                                href={`tel:${booking.visitor_phone}`}
                                className="underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-900"
                              >
                                {
                                  booking.visitor_phone
                                }
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={[
                                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                                booking.status ===
                                "confirmed"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-neutral-100 text-neutral-600",
                              ].join(" ")}
                            >
                              {booking.status ===
                              "confirmed"
                                ? "Confirmed"
                                : "Cancelled"}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-neutral-600">
                            {booking.created_at
                              ? new Date(
                                  booking.created_at,
                                ).toLocaleString()
                              : "—"}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3">
                            {booking.status ===
                            "confirmed" ? (
                              <form
                                action={`/api/dashboard/microsites/${site.id}/calendar-bookings/${booking.id}/cancel`}
                                method="post"
                              >
                                <button
                                  type="submit"
                                  className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:border-red-400 hover:bg-red-50"
                                >
                                  Cancel Booking
                                </button>
                              </form>
                            ) : booking.status ===
                              "cancelled" ? (
                              <form
                                action={`/api/dashboard/microsites/${site.id}/calendar-bookings/${booking.id}/restore`}
                                method="post"
                              >
                                <button
                                  type="submit"
                                  className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50"
                                >
                                  Restore Booking
                                </button>
                              </form>
                            ) : (
                              <span className="text-xs text-neutral-400">
                                —
                              </span>
                            )}
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