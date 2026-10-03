begin;

create table if not exists public.live_participants (
  id uuid primary key default gen_random_uuid(),

  experience_id uuid not null
    references public.live_experiences(id)
    on delete cascade,

  display_name text not null,

  avatar_url text,

  status text not null default 'active'
    check (status in ('active', 'inactive', 'removed')),

  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists live_participants_experience_idx
  on public.live_participants(experience_id);

create index if not exists live_participants_experience_status_idx
  on public.live_participants(experience_id, status);

comment on table public.live_participants is
  'Anonymous or temporary participants who join a Ko-Host Live experience.';

comment on column public.live_participants.experience_id is
  'Live experience this participant belongs to.';

comment on column public.live_participants.display_name is
  'Participant-facing display name entered when joining the Live experience.';

comment on column public.live_participants.avatar_url is
  'Optional participant avatar image URL.';

comment on column public.live_participants.status is
  'Participant state within the Live experience: active, inactive, or removed.';

commit;