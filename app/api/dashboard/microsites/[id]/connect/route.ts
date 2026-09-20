import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_RADII = new Set([5, 10, 25, 50]);
const ZIP_PATTERN = /^\d{5}$/;

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
 * Backfill currently active requests whenever
 * this provider enables/saves Ko-Host Connect.
 *
 * This allows a newly linked provider to see
 * requests that were submitted BEFORE the
 * provider joined Connect.
 *
 * IMPORTANT:
 * Geographic matching is temporarily exact-ZIP
 * only. The stored 5/10/25/50-mile radius will
 * be used once ZIP-coordinate distance matching
 * is added.
 */
if (enabled) {
  /*
   * Resolve the selected service IDs to their
   * controlled service names because
   * connect_requests currently stores the
   * service name rather than service_id.
   */
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
      "Connect provider backfill service lookup failed:",
      {
        providerProfileId: profile.id,
        selectedServicesError,
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

  const selectedServiceNames =
    (selectedServices ?? [])
      .map((service) =>
        String(service.name || "").trim(),
      )
      .filter(Boolean);

  if (selectedServiceNames.length > 0) {
    const nowIso =
      new Date().toISOString();

    /*
     * Only currently open requests qualify.
     *
     * A null expires_at means the request has
     * no explicit request expiration date.
     *
     * We load the exact-ZIP open candidates
     * first, then remove expired rows below.
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
      .eq("zip_code", serviceZipCode)
      .in("service", selectedServiceNames);

    if (candidateRequestsError) {
      console.error(
        "Connect provider request backfill lookup failed:",
        {
          providerProfileId: profile.id,
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

    const nowMs = Date.now();

    const activeRequests =
      (candidateRequests ?? []).filter(
        (request) => {
          if (!request.expires_at) {
            return true;
          }

          const expiresAt =
            new Date(
              request.expires_at,
            ).getTime();

          return (
            Number.isFinite(expiresAt) &&
            expiresAt > nowMs
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
       * The database has:
       *
       * unique(request_id, provider_profile_id)
       *
       * ignoreDuplicates prevents an existing
       * Viewed/Responded/Closed match from being
       * reset back to New when settings are saved.
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