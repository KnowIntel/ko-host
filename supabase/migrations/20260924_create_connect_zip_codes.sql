create table if not exists public.connect_zip_codes (
  zip_code text primary key,
  latitude double precision not null,
  longitude double precision not null,
  city text,
  state_code text,
  created_at timestamptz not null default now(),

  constraint connect_zip_codes_zip_format
    check (zip_code ~ '^\d{5}$'),

  constraint connect_zip_codes_latitude_range
    check (
      latitude >= -90
      and latitude <= 90
    ),

  constraint connect_zip_codes_longitude_range
    check (
      longitude >= -180
      and longitude <= 180
    )
);

create index if not exists
  connect_zip_codes_state_code_idx
on public.connect_zip_codes (state_code);

alter table public.connect_zip_codes
enable row level security;