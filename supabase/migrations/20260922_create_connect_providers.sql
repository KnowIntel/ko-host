begin;

/* ================================================================= */
/* KO-HOST CONNECT — PROVIDER PROFILES                                */
/* ================================================================= */

/*
 * A Connect provider profile belongs to exactly one Ko-Host microsite.
 *
 * The microsite remains the provider's public-facing business identity.
 * This table stores only Ko-Host Connect enrollment/routing settings.
 */
create table if not exists public.connect_provider_profiles (
  id uuid primary key default gen_random_uuid(),

  microsite_id uuid not null
    references public.microsites(id)
    on delete cascade,

  enabled boolean not null default true,

  service_zip_code text not null
    check (
      service_zip_code ~ '^[0-9]{5}$'
    ),

  service_radius_miles integer not null default 10
    check (
      service_radius_miles in (
        5,
        10,
        25,
        50
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint connect_provider_profiles_microsite_unique
    unique (microsite_id)
);


/* ================================================================= */
/* PROVIDER PROFILE INDEXES                                           */
/* ================================================================= */

create index if not exists
  connect_provider_profiles_microsite_id_idx
on public.connect_provider_profiles (
  microsite_id
);

create index if not exists
  connect_provider_profiles_enabled_idx
on public.connect_provider_profiles (
  enabled
);

create index if not exists
  connect_provider_profiles_service_zip_code_idx
on public.connect_provider_profiles (
  service_zip_code
);

create index if not exists
  connect_provider_profiles_enabled_zip_idx
on public.connect_provider_profiles (
  enabled,
  service_zip_code
);


/* ================================================================= */
/* KO-HOST CONNECT — PROVIDER SERVICES                                */
/* ================================================================= */

/*
 * A provider may offer multiple services.
 *
 * Services reference the same controlled connect_services table used
 * by the consumer request form.
 */
create table if not exists public.connect_provider_services (
  provider_profile_id uuid not null
    references public.connect_provider_profiles(id)
    on delete cascade,

  service_id uuid not null
    references public.connect_services(id)
    on delete restrict,

  created_at timestamptz not null default now(),

  primary key (
    provider_profile_id,
    service_id
  )
);


/* ================================================================= */
/* PROVIDER SERVICE INDEXES                                           */
/* ================================================================= */

create index if not exists
  connect_provider_services_provider_profile_id_idx
on public.connect_provider_services (
  provider_profile_id
);

create index if not exists
  connect_provider_services_service_id_idx
on public.connect_provider_services (
  service_id
);


/* ================================================================= */
/* ROW LEVEL SECURITY                                                 */
/* ================================================================= */

/*
 * Provider configuration remains private by default.
 *
 * Dashboard/server APIs will verify the authenticated Clerk user
 * against:
 *
 *   microsites.owner_clerk_user_id
 *
 * before reading or changing provider configuration.
 *
 * Public visitors do not receive direct table access.
 */
alter table public.connect_provider_profiles
  enable row level security;

alter table public.connect_provider_services
  enable row level security;


/* ================================================================= */
/* COMMENTS                                                           */
/* ================================================================= */

comment on table public.connect_provider_profiles is
  'Ko-Host Connect enrollment and geographic service settings for provider microsites.';

comment on column public.connect_provider_profiles.microsite_id is
  'Ko-Host microsite acting as the provider identity in Ko-Host Connect.';

comment on column public.connect_provider_profiles.enabled is
  'Controls whether this provider microsite currently participates in Ko-Host Connect request matching.';

comment on column public.connect_provider_profiles.service_zip_code is
  'Provider base ZIP code used for geographic request matching.';

comment on column public.connect_provider_profiles.service_radius_miles is
  'Declared provider service radius in miles. Allowed values are 5, 10, 25, or 50.';

comment on table public.connect_provider_services is
  'Services offered by a Ko-Host Connect provider, referencing the controlled connect_services catalog.';


commit;