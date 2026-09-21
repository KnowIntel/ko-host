import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_RADII = new Set([5, 10, 25, 50]);
const ZIP_PATTERN = /^\d{5}$/;

function calculateDistanceMiles(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
) {
  const EARTH_RADIUS_MILES = 3958.8;

  const toRadians = (degrees: number) =>
    (degrees * Math.PI) / 180;

  const lat1 = toRadians(latitude1);
  const lat2 = toRadians(latitude2);

  const deltaLat = toRadians(latitude2 - latitude1);
  const deltaLon = toRadians(longitude2 - longitude1);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    );

  return EARTH_RADIUS_MILES * c;
}

async function getOwnedMicrosite(
  micrositeId: string,
  userId: string,
) {
  const sb = getSupabaseAdmin();

  const { data: site, error } = await sb
    .from("microsites")
    .select(
      `
        id,
        slug,
        title,
        is_published,
        is_active,
        owner_clerk_user_id
      `,
    )
    .eq("id", micrositeId)
    .maybeSingle();

  if (error || !site) {
    return {
      sb,
      site: null,
      error: "Microsite not found.",
      status: 404,
    };
  }

  if (site.owner_clerk_user_id !== userId) {
    return {
      sb,
      site: null,
      error: "Unauthorized.",
      status: 401,
    };
  }

  return {
    sb,
    site,
    error: null,
    status: 200,
  };
}

export async function GET(
  _req: Request,
  ctx: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id: micrositeId } = await ctx.params;

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const ownership = await getOwnedMicrosite(
      micrositeId,
      userId,
    );

    if (!ownership.site) {
      return NextResponse.json(
        {
          ok: false,
          error: ownership.error,
        },
        { status: ownership.status },
      );
    }

    const { sb } = ownership;

    const [
      { data: services, error: servicesError },
      { data: profile, error: profileError },
    ] = await Promise.all([
      sb
        .from("connect_services")
        .select("id, slug, name")
        .eq("active", true)
        .order("sort_order", {
          ascending: true,
        })
        .order("name", {
          ascending: true,
        }),

      sb
        .from("connect_provider_profiles")
        .select(
          `
            id,
            microsite_id,
            enabled,
            service_zip_code,
            service_radius_miles,
            created_at,
            updated_at
          `,
        )
        .eq("microsite_id", micrositeId)
        .maybeSingle(),
    ]);

    if (servicesError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to load Ko-Host Connect services.",
        },
        { status: 500 },
      );
    }

    if (profileError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to load Ko-Host Connect provider settings.",
        },
        { status: 500 },
      );
    }

    let selectedServiceIds: string[] = [];

    if (profile?.id) {
      const {
        data: providerServices,
        error: providerServicesError,
      } = await sb
        .from("connect_provider_services")
        .select("service_id")
        .eq("provider_profile_id", profile.id);

      if (providerServicesError) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Unable to load provider services.",
          },
          { status: 500 },
        );
      }

      selectedServiceIds = Array.isArray(
        providerServices,
      )
        ? providerServices
            .map((row) =>
              String(row.service_id || ""),
            )
            .filter(Boolean)
        : [];
    }

    return NextResponse.json({
      ok: true,

      microsite: {
        id: ownership.site.id,
        slug: ownership.site.slug,
        title: ownership.site.title,
        is_published:
          ownership.site.is_published,
        is_active:
          ownership.site.is_active !== false,
      },

      services: services ?? [],

      provider: profile
        ? {
            linked: true,
            id: profile.id,
            enabled: Boolean(profile.enabled),
            serviceZipCode:
              profile.service_zip_code,
            serviceRadiusMiles:
              profile.service_radius_miles,
            serviceIds: selectedServiceIds,
          }
        : {
            linked: false,
            id: null,
            enabled: false,
            serviceZipCode: "",
            serviceRadiusMiles: 10,
            serviceIds: [],
          },
    });
  } catch (error) {
    console.error(
      "Connect provider GET error:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  ctx: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id: micrositeId } = await ctx.params;

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const body = await req
      .json()
      .catch(() => ({}));

    const enabled =
      body?.enabled === true;

    const serviceZipCode = String(
      body?.serviceZipCode || "",
    )
      .trim()
      .replace(/\D/g, "")
      .slice(0, 5);

    const serviceRadiusMiles = Number(
      body?.serviceRadiusMiles ?? 10,
    );

    const requestedServiceIds = Array.isArray(
      body?.serviceIds,
    )
      ? Array.from(
          new Set(
            body.serviceIds
              .map((value: unknown) =>
                String(value || "").trim(),
              )
              .filter(Boolean),
          ),
        )
      : [];

    const ownership = await getOwnedMicrosite(
      micrositeId,
      userId,
    );

    if (!ownership.site) {
      return NextResponse.json(
        {
          ok: false,
          error: ownership.error,
        },
        { status: ownership.status },
      );
    }

    if (!ZIP_PATTERN.test(serviceZipCode)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Enter a valid 5-digit service ZIP code.",
        },
        { status: 400 },
      );
    }

    if (
      !ALLOWED_RADII.has(serviceRadiusMiles)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Service radius must be 5, 10, 25, or 50 miles.",
        },
        { status: 400 },
      );
    }

    if (requestedServiceIds.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Select at least one service.",
        },
        { status: 400 },
      );
    }

    const { sb } = ownership;

    /*
     * Validate every submitted service ID against
     * the controlled active Connect service catalog.
     */
    const {
      data: validServices,
      error: serviceValidationError,
    } = await sb
      .from("connect_services")
      .select("id")
      .eq("active", true)
      .in("id", requestedServiceIds);

    if (serviceValidationError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to validate selected services.",
        },
        { status: 500 },
      );
    }

    const validServiceIds = Array.isArray(
      validServices,
    )
      ? validServices.map((row) =>
          String(row.id),
        )
      : [];

    if (
      validServiceIds.length !==
      requestedServiceIds.length
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "One or more selected services are invalid.",
        },
        { status: 400 },
      );
    }

    /*
     * Upsert the provider profile.
     *
     * microsite_id has a UNIQUE constraint, so each
     * microsite can have only one Connect profile.
     */
    const {
      data: profile,
      error: profileError,
    } = await sb
      .from("connect_provider_profiles")
      .upsert(
        {
          microsite_id: micrositeId,
          enabled,
          service_zip_code: serviceZipCode,
          service_radius_miles:
            serviceRadiusMiles,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict: "microsite_id",
        },
      )
      .select(
        `
          id,
          microsite_id,
          enabled,
          service_zip_code,
          service_radius_miles,
          created_at,
          updated_at
        `,
      )
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        {
          ok: false,
          error:
            profileError?.message ||
            "Failed to save Ko-Host Connect provider settings.",
        },
        { status: 500 },
      );
    }

    /*
     * Replace this provider's service selections.
     *
     * The profile already exists at this point.
     */
    const {
      error: deleteServicesError,
    } = await sb
      .from("connect_provider_services")
      .delete()
      .eq(
        "provider_profile_id",
        profile.id,
      );

    if (deleteServicesError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Provider settings were saved, but existing service selections could not be updated.",
        },
        { status: 500 },
      );
    }

    const serviceRows =
      validServiceIds.map((serviceId) => ({
        provider_profile_id: profile.id,
        service_id: serviceId,
      }));

const {
  error: insertServicesError,
} = await sb
  .from("connect_provider_services")
  .insert(serviceRows);

if (insertServicesError) {
  return NextResponse.json(
    {
      ok: false,
      error:
        "Provider settings were saved, but service selections could not be saved.",
    },
    { status: 500 },
  );
}

/*
 * Reconcile this provider's active request matches
 * whenever Ko-Host Connect settings are saved.
 *
 * Rules:
 *
 * - New / Viewed matches should exist only while
 *   the request still matches the provider's
 *   current Connect settings and geographic radius.
 *
 * - Responded / Closed matches are preserved
 *   because they represent an existing interaction
 *   or historical activity.
 *
 * - When Connect is disabled, New / Viewed matches
 *   are removed from the provider's active queue.
 *
 * - Geographic eligibility is determined using
 *   ZIP/ZCTA representative coordinates and the
 *   provider's configured 5/10/25/50-mile radius.
 */

// =====================================================
// Resolve currently selected service names
// =====================================================

const {
  data: selectedServices,
  error: selectedServicesError,
} = await sb
  .from("connect_services")
  .select("id, name")
  .eq("active", true)
  .in("id", validServiceIds);

if (selectedServicesError) {
  console.error(
    "Connect provider service lookup failed:",
    {
      providerProfileId: profile.id,
      selectedServicesError,
    },
  );

  return NextResponse.json(
    {
      ok: false,
      error:
        "Provider settings were saved, but Connect requests could not be updated.",
    },
    { status: 500 },
  );
}

const selectedServiceNames = (selectedServices ?? [])
  .map((service) =>
    String(service.name || "").trim(),
  )
  .filter(Boolean);

// =====================================================
// Resolve provider ZIP coordinates
// =====================================================

const {
  data: providerZipRow,
  error: providerZipError,
} = await sb
  .from("connect_zip_codes")
  .select("zip_code, latitude, longitude")
  .eq("zip_code", serviceZipCode)
  .maybeSingle();

if (providerZipError) {
  console.error(
    "Connect provider ZIP lookup failed:",
    {
      providerProfileId: profile.id,
      serviceZipCode,
      providerZipError,
    },
  );

  return NextResponse.json(
    {
      ok: false,
      error:
        "Provider settings were saved, but the service area could not be resolved.",
    },
    { status: 500 },
  );
}

if (!providerZipRow) {
  return NextResponse.json(
    {
      ok: false,
      error:
        "That ZIP code is not available for Connect service-area matching.",
    },
    { status: 400 },
  );
}

const providerLatitude = Number(
  providerZipRow.latitude,
);

const providerLongitude = Number(
  providerZipRow.longitude,
);

if (
  !Number.isFinite(providerLatitude) ||
  !Number.isFinite(providerLongitude)
) {
  console.error(
    "Connect provider ZIP has invalid coordinates:",
    {
      providerProfileId: profile.id,
      serviceZipCode,
      providerZipRow,
    },
  );

  return NextResponse.json(
    {
      ok: false,
      error:
        "Provider settings were saved, but the service area coordinates are invalid.",
    },
    { status: 500 },
  );
}

// =====================================================
// Load existing New / Viewed matches
// =====================================================

const {
  data: pendingMatches,
  error: pendingMatchesError,
} = await sb
  .from("connect_request_matches")
  .select(
    `
      id,
      status,
      request_id,
      connect_requests!inner (
        id,
        service,
        zip_code,
        status,
        expires_at
      )
    `,
  )
  .eq(
    "provider_profile_id",
    profile.id,
  )
  .in("status", [
    "new",
    "viewed",
  ]);

if (pendingMatchesError) {
  console.error(
    "Connect provider pending match lookup failed:",
    {
      providerProfileId: profile.id,
      pendingMatchesError,
    },
  );

  return NextResponse.json(
    {
      ok: false,
      error:
        "Provider settings were saved, but existing Connect requests could not be updated.",
    },
    { status: 500 },
  );
}

// =====================================================
// Collect ZIPs needed for reconciliation
// =====================================================

const pendingRequestZipCodes = Array.from(
  new Set(
    (pendingMatches ?? [])
      .map((match) => {
        const request = Array.isArray(
          match.connect_requests,
        )
          ? match.connect_requests[0]
          : match.connect_requests;

        return request
          ? String(request.zip_code || "")
          : "";
      })
      .filter((zipCode) =>
        ZIP_PATTERN.test(zipCode),
      ),
  ),
);

const {
  data: pendingZipRows,
  error: pendingZipError,
} =
  pendingRequestZipCodes.length > 0
    ? await sb
        .from("connect_zip_codes")
        .select(
          "zip_code, latitude, longitude",
        )
        .in(
          "zip_code",
          pendingRequestZipCodes,
        )
    : {
        data: [],
        error: null,
      };

if (pendingZipError) {
  console.error(
    "Connect pending request ZIP lookup failed:",
    {
      providerProfileId: profile.id,
      pendingZipError,
    },
  );

  return NextResponse.json(
    {
      ok: false,
      error:
        "Provider settings were saved, but existing Connect request locations could not be resolved.",
    },
    { status: 500 },
  );
}

const pendingCoordinatesByZip = new Map(
  (pendingZipRows ?? []).map((row) => [
    String(row.zip_code),
    {
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
    },
  ]),
);

// =====================================================
// Remove stale New / Viewed matches
// =====================================================

const nowMs = Date.now();

const staleMatchIds = (pendingMatches ?? [])
  .filter((match) => {
    const request = Array.isArray(
      match.connect_requests,
    )
      ? match.connect_requests[0]
      : match.connect_requests;

    /*
     * If the joined request cannot be resolved,
     * the pending assignment should not remain
     * in the active provider queue.
     */
    if (!request) {
      return true;
    }

    /*
     * Disabling Connect removes all uncommitted
     * New / Viewed assignments.
     */
    if (!enabled) {
      return true;
    }

    /*
     * Only open requests remain eligible.
     */
    if (request.status !== "open") {
      return true;
    }

    /*
     * Request service must still be one of the
     * provider's currently selected services.
     */
    if (
      !selectedServiceNames.includes(
        String(request.service),
      )
    ) {
      return true;
    }

    /*
     * Expired requests should no longer remain
     * in the active provider queue.
     */
    if (request.expires_at) {
      const expiresAt = new Date(
        request.expires_at,
      ).getTime();

      if (
        !Number.isFinite(expiresAt) ||
        expiresAt <= nowMs
      ) {
        return true;
      }
    }

    /*
     * The request ZIP must resolve to coordinates.
     * If it cannot be resolved, it cannot remain
     * an active geographic match.
     */
    const requestZipCode = String(
      request.zip_code || "",
    );

    const requestCoordinates =
      pendingCoordinatesByZip.get(
        requestZipCode,
      );

    if (!requestCoordinates) {
      return true;
    }

    const distanceMiles =
      calculateDistanceMiles(
        providerLatitude,
        providerLongitude,
        requestCoordinates.latitude,
        requestCoordinates.longitude,
      );

    /*
     * Remove the uncommitted assignment if the
     * request is now outside the provider's
     * configured service radius.
     */
    return (
      distanceMiles >
      serviceRadiusMiles
    );
  })
  .map((match) =>
    String(match.id),
  )
  .filter(Boolean);

if (staleMatchIds.length > 0) {
  const {
    error: staleDeleteError,
  } = await sb
    .from("connect_request_matches")
    .delete()
    .in("id", staleMatchIds);

  if (staleDeleteError) {
    console.error(
      "Connect provider stale match cleanup failed:",
      {
        providerProfileId: profile.id,
        staleMatchIds,
        staleDeleteError,
      },
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Provider settings were saved, but outdated Connect requests could not be removed.",
      },
      { status: 500 },
    );
  }
}

// =====================================================
// Backfill currently matching active requests
// =====================================================

if (
  enabled &&
  selectedServiceNames.length > 0
) {
  const nowIso =
    new Date().toISOString();

  /*
   * First load open requests for the provider's
   * selected services.
   *
   * Do NOT filter by ZIP here. Geographic distance
   * is evaluated below.
   */
  const {
    data: candidateRequests,
    error: candidateRequestsError,
  } = await sb
    .from("connect_requests")
    .select(
      `
        id,
        service,
        zip_code,
        status,
        expires_at
      `,
    )
    .eq("status", "open")
    .in(
      "service",
      selectedServiceNames,
    );

  if (candidateRequestsError) {
    console.error(
      "Connect provider request backfill lookup failed:",
      {
        providerProfileId:
          profile.id,
        candidateRequestsError,
      },
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Provider settings were saved, but existing Connect requests could not be matched.",
      },
      { status: 500 },
    );
  }

  /*
   * Remove expired requests before doing geographic
   * work.
   */
  const activeCandidateRequests =
    (candidateRequests ?? []).filter(
      (request) => {
        if (!request.expires_at) {
          return true;
        }

        const expiresAt = new Date(
          request.expires_at,
        ).getTime();

        return (
          Number.isFinite(expiresAt) &&
          expiresAt > nowMs
        );
      },
    );

  /*
   * Resolve all candidate request ZIP coordinates
   * in one database query.
   */
  const candidateZipCodes = Array.from(
    new Set(
      activeCandidateRequests
        .map((request) =>
          String(
            request.zip_code || "",
          ),
        )
        .filter((zipCode) =>
          ZIP_PATTERN.test(zipCode),
        ),
    ),
  );

  const {
    data: candidateZipRows,
    error: candidateZipError,
  } =
    candidateZipCodes.length > 0
      ? await sb
          .from("connect_zip_codes")
          .select(
            "zip_code, latitude, longitude",
          )
          .in(
            "zip_code",
            candidateZipCodes,
          )
      : {
          data: [],
          error: null,
        };

  if (candidateZipError) {
    console.error(
      "Connect candidate request ZIP lookup failed:",
      {
        providerProfileId:
          profile.id,
        candidateZipError,
      },
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Provider settings were saved, but request locations could not be resolved.",
      },
      { status: 500 },
    );
  }

  const candidateCoordinatesByZip =
    new Map(
      (candidateZipRows ?? []).map(
        (row) => [
          String(row.zip_code),
          {
            latitude: Number(
              row.latitude,
            ),
            longitude: Number(
              row.longitude,
            ),
          },
        ],
      ),
    );

  /*
   * Keep only requests whose ZIP representative
   * coordinate falls inside this provider's
   * configured service radius.
   */
  const activeRequests =
    activeCandidateRequests.filter(
      (request) => {
        const requestZipCode = String(
          request.zip_code || "",
        );

        const requestCoordinates =
          candidateCoordinatesByZip.get(
            requestZipCode,
          );

        if (!requestCoordinates) {
          console.error(
            `Connect request ZIP ${requestZipCode} was not found in connect_zip_codes.`,
          );

          return false;
        }

        const distanceMiles =
          calculateDistanceMiles(
            providerLatitude,
            providerLongitude,
            requestCoordinates.latitude,
            requestCoordinates.longitude,
          );

        return (
          distanceMiles <=
          serviceRadiusMiles
        );
      },
    );

  if (activeRequests.length > 0) {
    const matchRows =
      activeRequests.map(
        (request) => ({
          request_id: request.id,
          provider_profile_id:
            profile.id,
          status: "new",
          matched_at: nowIso,
          updated_at: nowIso,
        }),
      );

    /*
     * Do not overwrite an existing match.
     *
     * This preserves Viewed / Responded / Closed
     * state when settings are saved repeatedly.
     */
    const {
      error: matchInsertError,
    } = await sb
      .from(
        "connect_request_matches",
      )
      .upsert(matchRows, {
        onConflict:
          "request_id,provider_profile_id",
        ignoreDuplicates: true,
      });

    if (matchInsertError) {
      console.error(
        "Connect provider request backfill failed:",
        {
          providerProfileId:
            profile.id,
          matchInsertError,
        },
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Provider settings were saved, but existing Connect requests could not be matched.",
        },
        { status: 500 },
      );
    }
  }
}

return NextResponse.json({
  ok: true,

  provider: {
    linked: true,
    id: profile.id,
    enabled: Boolean(profile.enabled),
    serviceZipCode:
      profile.service_zip_code,
    serviceRadiusMiles:
      profile.service_radius_miles,
    serviceIds: validServiceIds,
  },
});
  } catch (error) {
    console.error(
      "Connect provider POST error:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error.",
      },
      { status: 500 },
    );
  }
}