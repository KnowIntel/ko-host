begin;

create table if not exists public.live_experiences (
  id uuid primary key default gen_random_uuid(),

  microsite_id uuid not null
    references public.microsites(id)
    on delete cascade,

  owner_clerk_user_id text not null,

  name text not null default 'Live Experience',

  status text not null default 'before'
    check (status in ('before', 'live', 'paused', 'ended', 'after')),

  is_enabled boolean not null default false,

  started_at timestamptz,
  ended_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint live_experiences_microsite_unique
    unique (microsite_id)
);

create index if not exists live_experiences_owner_idx
  on public.live_experiences(owner_clerk_user_id);

create index if not exists live_experiences_status_idx
  on public.live_experiences(status);

comment on table public.live_experiences is
  'Top-level Ko-Host Live experience associated with a microsite.';

comment on column public.live_experiences.microsite_id is
  'Microsite that owns and renders this Live experience.';

comment on column public.live_experiences.owner_clerk_user_id is
  'Clerk user ID of the Ko-Host owner who controls this Live experience.';

comment on column public.live_experiences.status is
  'Current lifecycle state: before, live, paused, ended, or after.';

comment on column public.live_experiences.is_enabled is
  'Controls whether Ko-Host Live functionality is enabled for the microsite.';

commit;