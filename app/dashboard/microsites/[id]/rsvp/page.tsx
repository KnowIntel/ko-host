import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type RsvpRow = {
  id: number;

  first_name: string | null;
  last_name: string | null;
  name: string | null;

  email: string | null;
  address: string | null;

  is_attending: boolean | null;

  guest_count: number | null;
  guest_name: string | null;

  attending_count: number;
  has_plus_one: boolean;

  meal_choice: string | null;

  comments: string | null;
  notes: string | null;

  created_at: string;
};

function cleanValue(
  value:
    | string
    | null
    | undefined,
) {
  const cleaned =
    value?.trim();

  return cleaned
    ? cleaned
    : null;
}

function getFirstName(
  row: RsvpRow,
) {
  const firstName =
    cleanValue(
      row.first_name,
    );

  if (firstName) {
    return firstName;
  }

  const legacyName =
    cleanValue(
      row.name,
    );

  if (!legacyName) {
    return "—";
  }

  return (
    legacyName
      .split(/\s+/)
      .filter(Boolean)[0] ||
    "—"
  );
}

function getLastName(
  row: RsvpRow,
) {
  const lastName =
    cleanValue(
      row.last_name,
    );

  if (lastName) {
    return lastName;
  }

  const legacyName =
    cleanValue(
      row.name,
    );

  if (!legacyName) {
    return "—";
  }

  const parts =
    legacyName
      .split(/\s+/)
      .filter(Boolean);

  if (
    parts.length <= 1
  ) {
    return "—";
  }

  return (
    parts
      .slice(1)
      .join(" ") ||
    "—"
  );
}

function getAttendanceLabel(
  row: RsvpRow,
) {
  if (
    row.is_attending ===
    null
  ) {
    return "—";
  }

  return row.is_attending
    ? "Yes"
    : "No";
}

export default async function MicrositeRsvpAdminPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const {
    id,
  } =
    await params;

  /*
   * ============================================================
   * AUTH
   * ============================================================
   */

  const {
    userId,
  } =
    await auth();

  if (!userId) {
    return (
      <div className="p-6">
        Unauthorized
      </div>
    );
  }

  const sb =
    getSupabaseAdmin();

  /*
   * ============================================================
   * MICROSITE
   * ============================================================
   */

  const {
    data: site,
    error:
      siteErr,
  } =
    await sb
      .from(
        "microsites",
      )
      .select(
        "id, owner_clerk_user_id, slug, title",
      )
      .eq(
        "id",
        id,
      )
      .maybeSingle();

  if (
    siteErr ||
    !site
  ) {
    return notFound();
  }

  if (
    site.owner_clerk_user_id !==
    userId
  ) {
    return (
      <div className="p-6">
        Forbidden
      </div>
    );
  }

  /*
   * RSVP is now a reusable builder block.
   *
   * Do not restrict this dashboard to a particular template_key.
   */

  /*
   * ============================================================
   * RSVP SUBMISSIONS
   * ============================================================
   */

  const {
    data: rows,
    error:
      rowsErr,
  } =
    await sb
      .from(
        "rsvp_submissions",
      )
      .select(
        [
          "id",
          "first_name",
          "last_name",
          "name",
          "email",
          "address",
          "is_attending",
          "guest_count",
          "guest_name",
          "attending_count",
          "has_plus_one",
          "meal_choice",
          "comments",
          "notes",
          "created_at",
        ].join(", "),
      )
      .eq(
        "microsite_id",
        site.id,
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        },
      )
      .limit(
        500,
      );

  if (rowsErr) {
    console.error(
      "rsvp list failed",
      rowsErr,
    );

    return (
      <div className="p-6">
        Failed to load RSVPs.
      </div>
    );
  }

const rsvps =
  (rows ??
    []) as unknown as RsvpRow[];

  /*
   * ============================================================
   * SUMMARY
   * ============================================================
   */

  const totalResponses =
    rsvps.length;

  const attendingResponses =
    rsvps.reduce(
      (
        sum,
        row,
      ) =>
        sum +
        (
          row.is_attending ===
          true
            ? 1
            : 0
        ),
      0,
    );

  const notAttendingResponses =
    rsvps.reduce(
      (
        sum,
        row,
      ) =>
        sum +
        (
          row.is_attending ===
          false
            ? 1
            : 0
        ),
      0,
    );

  const totalAttending =
    rsvps.reduce(
      (
        sum,
        row,
      ) =>
        sum +
        Math.max(
          0,
          row.attending_count ??
            0,
        ),
      0,
    );

  const totalGuests =
    rsvps.reduce(
      (
        sum,
        row,
      ) =>
        sum +
        Math.max(
          0,
          row.guest_count ??
            0,
        ),
      0,
    );

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <div className="space-y-6">
      {/* ===================================================== */}
      {/* HEADER                                                */}
      {/* ===================================================== */}

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="text-sm text-neutral-600">
              Ko-Host
            </div>

            <h1 className="mt-2 text-xl font-semibold tracking-tight text-neutral-950">
              RSVP Admin
            </h1>

            <div className="mt-2 space-y-1 text-sm text-neutral-700">
              <div>
                <span className="font-medium">
                  Microsite:
                </span>{" "}
                {site.title ||
                  "(Untitled)"}
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

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <a
              href={`/api/dashboard/microsites/${site.id}/rsvp/export`}
              className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Download CSV
            </a>

            <Link
              href="/dashboard/microsites"
              className="text-sm font-medium text-neutral-900 underline underline-offset-4"
            >
              Back
            </Link>
          </div>
        </div>

        {/* =================================================== */}
        {/* SUMMARY                                             */}
        {/* =================================================== */}

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-xs font-medium text-neutral-600">
              Responses
            </div>

            <div className="mt-1 text-lg font-semibold text-neutral-950">
              {totalResponses}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-xs font-medium text-neutral-600">
              Attending Yes
            </div>

            <div className="mt-1 text-lg font-semibold text-neutral-950">
              {attendingResponses}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-xs font-medium text-neutral-600">
              Attending No
            </div>

            <div className="mt-1 text-lg font-semibold text-neutral-950">
              {notAttendingResponses}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-xs font-medium text-neutral-600">
              Total Attending
            </div>

            <div className="mt-1 text-lg font-semibold text-neutral-950">
              {totalAttending}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-xs font-medium text-neutral-600">
              Total Guests
            </div>

            <div className="mt-1 text-lg font-semibold text-neutral-950">
              {totalGuests}
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================== */}
      {/* RSVP TABLE                                            */}
      {/* ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {rsvps.length ===
        0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-base font-semibold text-neutral-900">
              No RSVPs yet
            </div>

            <div className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-600">
              RSVP submissions
              from this
              microsite will
              appear here.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1280px] text-left text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-neutral-700">
                    When
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-medium text-neutral-700">
                    First Name
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-medium text-neutral-700">
                    Last Name
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-medium text-neutral-700">
                    Email
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-medium text-neutral-700">
                    Address
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-medium text-neutral-700">
                    Attending
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-medium text-neutral-700">
                    Total Party
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-medium text-neutral-700">
                    Guest Count
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-medium text-neutral-700">
                    Guest Names
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-medium text-neutral-700">
                    Meal
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-medium text-neutral-700">
                    Comments
                  </th>
                </tr>
              </thead>

              <tbody>
                {rsvps.map(
                  (
                    row,
                  ) => {
                    const email =
                      cleanValue(
                        row.email,
                      );

                    const address =
                      cleanValue(
                        row.address,
                      );

                    const guestNames =
                      cleanValue(
                        row.guest_name,
                      );

                    const meal =
                      cleanValue(
                        row.meal_choice,
                      );

                    const comments =
                      cleanValue(
                        row.comments,
                      );

                    return (
                      <tr
                        key={
                          row.id
                        }
                        className="border-t border-neutral-200 align-top"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-neutral-700">
                          {new Date(
                            row.created_at,
                          ).toLocaleString()}
                        </td>

                        <td className="px-4 py-3 font-medium text-neutral-900">
                          {getFirstName(
                            row,
                          )}
                        </td>

                        <td className="px-4 py-3 text-neutral-800">
                          {getLastName(
                            row,
                          )}
                        </td>

                        <td className="px-4 py-3 text-neutral-800">
                          {email ? (
                            <a
                              href={`mailto:${email}`}
                              className="underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-700"
                            >
                              {email}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="max-w-[260px] px-4 py-3 text-neutral-800">
                          <div className="whitespace-pre-wrap break-words">
                            {address ??
                              "—"}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-neutral-800">
                          {getAttendanceLabel(
                            row,
                          )}
                        </td>

                        <td className="px-4 py-3 text-neutral-800">
                          {row.attending_count ??
                            0}
                        </td>

                        <td className="px-4 py-3 text-neutral-800">
                          {row.guest_count ??
                            0}
                        </td>

                        <td className="max-w-[260px] px-4 py-3 text-neutral-800">
                          <div className="whitespace-pre-wrap break-words">
                            {guestNames ??
                              "—"}
                          </div>
                        </td>

                        <td className="max-w-[220px] px-4 py-3 text-neutral-800">
                          <div className="whitespace-pre-wrap break-words">
                            {meal ??
                              "—"}
                          </div>
                        </td>

                        <td className="max-w-[340px] px-4 py-3 text-neutral-800">
                          <div className="whitespace-pre-wrap break-words">
                            {comments ??
                              "—"}
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}