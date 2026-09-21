import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProviderProfileRow = {
  id: string;
  display_name: string | null;
  microsites: {
  title: string;
  slug: string;
  homepage_thumbnail_url: string | null;
  share_preview_auto_image_url: string | null;
  share_preview_custom_image_url: string | null;
  share_preview_mode: string | null;
  is_published: boolean;
  is_active: boolean | null;
} | null;
};

type ProviderServiceRow = {
  provider_profile_id: string;
  connect_services: {
    name: string;
  } | null;
};

export async function GET() {
  const sb = getSupabaseAdmin();

  try {
    // =====================================================
    // Load enabled Connect providers + safe microsite data
    // =====================================================

    const {
      data: providerRows,
      error: providerError,
    } = await sb
      .from("connect_provider_profiles")
.select(
  `
    id,
    display_name,
    microsites!inner (
  title,
  slug,
  homepage_thumbnail_url,
  share_preview_auto_image_url,
  share_preview_custom_image_url,
  share_preview_mode,
  is_published,
  is_active
)
        `,
      )
      .eq("enabled", true)
      .eq("microsites.is_published", true)
      .eq("microsites.is_active", true)
      .limit(100);

    if (providerError) {
      throw providerError;
    }

    const providers =
      (providerRows ??
        []) as unknown as ProviderProfileRow[];

    if (providers.length === 0) {
      return NextResponse.json({
        ok: true,
        providers: [],
      });
    }

    const providerIds = providers.map(
      (provider) => provider.id,
    );

    // =====================================================
    // Load offered service names
    // =====================================================

    const {
      data: serviceRows,
      error: serviceError,
    } = await sb
      .from("connect_provider_services")
      .select(
        `
          provider_profile_id,
          connect_services!inner (
            name
          )
        `,
      )
      .in(
        "provider_profile_id",
        providerIds,
      );

    if (serviceError) {
      throw serviceError;
    }

    const services =
      (serviceRows ??
        []) as unknown as ProviderServiceRow[];

    // =====================================================
    // Return public-safe provider representation only
    // =====================================================

    const publicProviders = providers
      .filter(
        (provider) =>
          provider.microsites &&
          provider.microsites.slug,
      )
      .map((provider) => {
        const site = provider.microsites!;

        const offeredServices = services
          .filter(
            (row) =>
              row.provider_profile_id ===
              provider.id,
          )
          .map(
            (row) =>
              row.connect_services?.name,
          )
          .filter(
            (name): name is string =>
              Boolean(name),
          )
          .sort((a, b) =>
            a.localeCompare(b),
          );

        // Do not publicly list providers who
        // currently have no Connect services selected.
        if (offeredServices.length === 0) {
          return null;
        }

        return {
          title:
            provider.display_name?.trim() ||
            site.title ||
            "Local Provider",

          slug: site.slug,

          imageUrl:
            site.share_preview_mode === "custom" &&
            site.share_preview_custom_image_url
              ? site.share_preview_custom_image_url
              : site.share_preview_auto_image_url ||
                site.homepage_thumbnail_url ||
                null,

          services: offeredServices,
        };
      })
      .filter(
        (
          provider,
        ): provider is NonNullable<
          typeof provider
        > => provider !== null,
      );

    return NextResponse.json({
      ok: true,
      providers: publicProviders,
    });
  } catch (error) {
    console.error(
      "Connect public providers load failed:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to load Connect providers.",
      },
      {
        status: 500,
      },
    );
  }
}