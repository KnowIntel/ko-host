begin;

-- Existing feature
alter table public.microsites
add column if not exists is_favorite boolean not null default false;

create index if not exists idx_microsites_owner_favorite
on public.microsites(owner_clerk_user_id, is_favorite);

-------------------------------------------------------
-- Visibility system
-------------------------------------------------------

-- public | private
alter table public.microsites
add column if not exists site_visibility text not null default 'public';

-- null | passcode | members_only
alter table public.microsites
add column if not exists private_mode text;

-- hashed passcode if passcode protection is enabled
alter table public.microsites
add column if not exists passcode_hash text;

-------------------------------------------------------
-- Members-only device tracking
-------------------------------------------------------

create table if not exists public.microsite_members (
  id uuid primary key default gen_random_uuid(),
  microsite_id uuid not null references public.microsites(id) on delete cascade,
  device_fingerprint text not null,
  allowed boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_microsite_members_site
on public.microsite_members(microsite_id);

create index if not exists idx_microsite_members_device
on public.microsite_members(device_fingerprint);

commit;