import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(
  value: unknown,
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  const s =
    String(value);

  const needsQuotes =
    /[",\n\r]/.test(s);

  const escaped =
    s.replace(
      /"/g,
      '""',
    );

  return needsQuotes
    ? `"${escaped}"`
    : escaped;
}

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

export async function GET(
  _req: NextRequest,
  ctx: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  const {
    id:
      micrositeId,
  } =
    await ctx.params;

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
    return NextResponse.json(
      {
        error:
          "Unauthorized",
      },
      {
        status: 401,
      },
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
        "id, owner_clerk_user_id, slug",
      )
      .eq(
        "id",
        micrositeId,
      )
      .maybeSingle();

  if (
    siteErr ||
    !site
  ) {
    return NextResponse.json(
      {
        error:
          "Not found",
      },
      {
        status: 404,
      },
    );
  }

  if (
    site.owner_clerk_user_id !==
    userId
  ) {
    return NextResponse.json(
      {
        error:
          "Forbidden",
      },
      {
        status: 403,
      },
    );
  }

  /*
   * RSVP is now reusable across templates.
   *
   * Do not restrict this export to template_key ===
   * "wedding_rsvp".
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
          "created_at",
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
        ].join(", "),
      )
      .eq(
        "microsite_id",
        micrositeId,
      )
      .order(
        "created_at",
        {
          ascending:
            true,
        },
      )
      .limit(
        5000,
      );

  if (rowsErr) {
    console.error(
      "RSVP export query failed",
      rowsErr,
    );

    return NextResponse.json(
      {
        error:
          "Server error",
      },
      {
        status: 500,
      },
    );
  }

  /*
   * ============================================================
   * CSV HEADER
   * ============================================================
   */

  const header = [
    "created_at",
    "first_name",
    "last_name",
    "email",
    "address",
    "is_attending",
    "guest_count",
    "guest_names",
    "attending_count",
    "has_plus_one",
    "meal_choice",
    "comments",
    "notes",
  ];

  const lines:
    string[] =
    [];

  lines.push(
    header.join(","),
  );

  /*
   * ============================================================
   * CSV ROWS
   * ============================================================
   */

  for (
    const rawRow of
    rows ?? []
  ) {
    const row =
      rawRow as {
        created_at?:
          | string
          | null;

        first_name?:
          | string
          | null;

        last_name?:
          | string
          | null;

        name?:
          | string
          | null;

        email?:
          | string
          | null;

        address?:
          | string
          | null;

        is_attending?:
          | boolean
          | null;

        guest_count?:
          | number
          | null;

        guest_name?:
          | string
          | null;

        attending_count?:
          | number
          | null;

        has_plus_one?:
          | boolean
          | null;

        meal_choice?:
          | string
          | null;

        comments?:
          | string
          | null;

        notes?:
          | string
          | null;
      };

    /*
     * ----------------------------------------------------------
     * NAME COMPATIBILITY
     * ----------------------------------------------------------
     *
     * Prefer the newer first_name / last_name columns.
     * Fall back to the legacy combined name field where needed.
     */

    const explicitFirstName =
      cleanValue(
        row.first_name,
      );

    const explicitLastName =
      cleanValue(
        row.last_name,
      );

    const legacyName =
      cleanValue(
        row.name,
      );

    const legacyParts =
      legacyName
        ? legacyName
            .split(/\s+/)
            .filter(Boolean)
        : [];

    const firstName =
      explicitFirstName ??
      legacyParts[0] ??
      null;

    const lastName =
      explicitLastName ??
      (
        legacyParts.length >
        1
          ? legacyParts
              .slice(1)
              .join(" ")
          : null
      );

    /*
     * ----------------------------------------------------------
     * NORMALIZED VALUES
     * ----------------------------------------------------------
     */

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

    const mealChoice =
      cleanValue(
        row.meal_choice,
      );

    const comments =
      cleanValue(
        row.comments,
      );

    const notes =
      cleanValue(
        row.notes,
      );

    /*
     * ----------------------------------------------------------
     * WRITE ROW
     * ----------------------------------------------------------
     */

    lines.push(
      [
        csvEscape(
          row.created_at,
        ),

        csvEscape(
          firstName,
        ),

        csvEscape(
          lastName,
        ),

        csvEscape(
          email,
        ),

        csvEscape(
          address,
        ),

        csvEscape(
          row.is_attending,
        ),

        csvEscape(
          row.guest_count ??
            0,
        ),

        csvEscape(
          guestNames,
        ),

        csvEscape(
          row.attending_count ??
            0,
        ),

        csvEscape(
          row.has_plus_one ??
            false,
        ),

        csvEscape(
          mealChoice,
        ),

        csvEscape(
          comments,
        ),

        csvEscape(
          notes,
        ),
      ].join(","),
    );
  }

  /*
   * ============================================================
   * RESPONSE
   * ============================================================
   */

  /*
   * UTF-8 BOM improves Excel compatibility for names and other
   * non-ASCII characters.
   */
  const csv =
    `\uFEFF${lines.join(
      "\n",
    )}`;

  const safeSlug =
    String(
      site.slug ??
        "microsite",
    ).replace(
      /[^a-zA-Z0-9_-]/g,
      "-",
    );

  const filename =
    `rsvp_${safeSlug}.csv`;

  return new NextResponse(
    csv,
    {
      status: 200,

      headers: {
        "content-type":
          "text/csv; charset=utf-8",

        "content-disposition":
          `attachment; filename="${filename}"`,

        "cache-control":
          "no-store",
      },
    },
  );
}