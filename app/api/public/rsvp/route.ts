import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { rateLimitOrThrow } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * ============================================================
 * REQUEST SCHEMA
 * ============================================================
 *
 * First/last name are intentionally allowed to be blank because
 * the RSVP block can hide or disable those fields.
 */

const BodySchema = z.object({
  micrositeSlug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/),

  firstName: z
    .string()
    .max(80)
    .optional()
    .or(z.literal("")),

  lastName: z
    .string()
    .max(80)
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .email()
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .max(200)
    .optional()
    .or(z.literal("")),

  isAttending: z.boolean(),

  mealChoice: z
    .string()
    .max(80)
    .optional()
    .or(z.literal("")),

  bringingGuest: z.boolean(),

  guestCount: z
    .number()
    .int()
    .min(0)
    .max(20),

  /*
   * Multiple guest names are currently stored as a comma-separated
   * string, so allow enough room for several names.
   */
  guestName: z
    .string()
    .max(1000)
    .optional()
    .or(z.literal("")),

  comments: z
    .string()
    .max(1000)
    .optional()
    .or(z.literal("")),

  /*
   * Honeypot field.
   */
  company: z
    .string()
    .max(0)
    .optional()
    .or(z.literal("")),
});

function getClientIp(
  req: Request,
): string {
  const xff =
    req.headers.get(
      "x-forwarded-for",
    );

  if (xff) {
    return (
      xff
        .split(",")[0]
        ?.trim() ||
      "unknown"
    );
  }

  return "unknown";
}

export async function POST(
  req: Request,
) {
  try {
    /*
     * ==========================================================
     * PARSE + VALIDATE
     * ==========================================================
     */

    const json =
      await req
        .json()
        .catch(
          () =>
            null,
        );

    const parsed =
      BodySchema.safeParse(
        json,
      );

    if (
      !parsed.success
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Invalid request",
          issues:
            parsed.error
              .issues,
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ==========================================================
     * HONEYPOT
     * ==========================================================
     */

    if (
      parsed.data
        .company &&
      parsed.data.company
        .length >
        0
    ) {
      /*
       * Silently accept suspected bot submissions.
       */
      return NextResponse.json(
        {
          ok: true,
        },
        {
          status: 200,
        },
      );
    }

    /*
     * ==========================================================
     * RATE LIMIT
     * ==========================================================
     */

    const ip =
      getClientIp(
        req,
      );

    await rateLimitOrThrow(
      {
        key:
          `rsvp:${parsed.data.micrositeSlug}:${ip}`,

        limit: 10,

        windowSeconds:
          10 * 60,
      },
    );

    /*
     * ==========================================================
     * MICROSITE
     * ==========================================================
     */

    const sb =
      getSupabaseAdmin();

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
          "id, is_published, expires_at",
        )
        .eq(
          "slug",
          parsed.data
            .micrositeSlug,
        )
        .maybeSingle();

    if (
      siteErr ||
      !site
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Not found",
        },
        {
          status: 404,
        },
      );
    }

    const now =
      new Date();

    const expired =
      site.expires_at
        ? new Date(
            site.expires_at,
          ) <= now
        : false;

    if (
      !site.is_published ||
      expired
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Not available",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * RSVP is now a reusable builder block.
     *
     * Do NOT restrict submissions to template_key ===
     * "wedding_rsvp". Any published, active microsite may contain
     * an RSVP block.
     */

    /*
     * ==========================================================
     * CLEAN VALUES
     * ==========================================================
     */

    const cleanFirstName =
      parsed.data.firstName
        ?.trim() ??
      "";

    const cleanLastName =
      parsed.data.lastName
        ?.trim() ??
      "";

    const cleanEmail =
      parsed.data.email
        ?.trim() ||
      null;

    const cleanAddress =
      parsed.data.address
        ?.trim() ||
      null;

    const cleanMeal =
      parsed.data.mealChoice
        ?.trim() ||
      null;

    const cleanGuestName =
      parsed.data.guestName
        ?.trim() ||
      null;

    const cleanComments =
      parsed.data.comments
        ?.trim() ||
      null;

    /*
     * ==========================================================
     * NORMALIZE ATTENDANCE
     * ==========================================================
     */

    const guestCount =
      parsed.data
        .isAttending &&
      parsed.data
        .bringingGuest
        ? Math.min(
            20,
            Math.max(
              1,
              parsed.data
                .guestCount ||
                1,
            ),
          )
        : 0;

    const attendingCount =
      parsed.data
        .isAttending
        ? 1 +
          guestCount
        : 0;

    const hasPlusOne =
      parsed.data
        .isAttending &&
      parsed.data
        .bringingGuest &&
      guestCount >
        0;

    /*
     * ==========================================================
     * DISPLAY NAME
     * ==========================================================
     *
     * Older RSVP submissions expected a combined `name` column.
     * Keep populating it while allowing both individual fields to
     * be hidden.
     */

    const combinedName =
      [
        cleanFirstName,
        cleanLastName,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

    /*
     * ==========================================================
     * INSERT
     * ==========================================================
     */

    const {
      error:
        insErr,
    } =
      await sb
        .from(
          "rsvp_submissions",
        )
        .insert({
          microsite_id:
            site.id,

          name:
            combinedName,

          email:
            cleanEmail,

          attending_count:
            attendingCount,

          has_plus_one:
            hasPlusOne,

          meal_choice:
            parsed.data
              .isAttending
              ? cleanMeal
              : null,

          notes:
            null,

          first_name:
            cleanFirstName,

          last_name:
            cleanLastName,

          address:
            cleanAddress,

          is_attending:
            parsed.data
              .isAttending,

          guest_count:
            guestCount,

          guest_name:
            hasPlusOne
              ? cleanGuestName
              : null,

          comments:
            cleanComments,
        });

    if (
      insErr
    ) {
      console.error(
        "rsvp insert failed",
        {
          insErr,
        },
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Server error",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        ok: true,
      },
      {
        status: 200,
      },
    );
  } catch (
    err: any
  ) {
    const status =
      typeof err?.status ===
      "number"
        ? err.status
        : 500;

    const retryAfter =
      err?.retryAfter;

    if (
      status === 429
    ) {
      const res =
        NextResponse.json(
          {
            ok: false,
            error:
              "Rate limited",
          },
          {
            status: 429,
          },
        );

      if (
        retryAfter
      ) {
        res.headers.set(
          "retry-after",
          String(
            retryAfter,
          ),
        );
      }

      return res;
    }

    console.error(
      "public RSVP handler failed",
      err,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Server error",
      },
      {
        status: 500,
      },
    );
  }
}