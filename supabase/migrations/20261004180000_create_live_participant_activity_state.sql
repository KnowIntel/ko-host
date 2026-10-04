begin;

create table if not exists public.live_participant_activity_state (
  id uuid primary key default gen_random_uuid(),

  experience_id uuid not null
    references public.live_experiences(id)
    on delete cascade,

  participant_id uuid not null
    references public.live_participants(id)
    on delete cascade,

  activity_id uuid not null
    references public.live_activities(id)
    on delete cascade,

  state jsonb not null default '{}'::jsonb,

  completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint live_participant_activity_state_unique
    unique (participant_id, activity_id)
);

create index if not exists live_participant_activity_experience_idx
  on public.live_participant_activity_state(experience_id);

create index if not exists live_participant_activity_activity_idx
  on public.live_participant_activity_state(activity_id);

create index if not exists live_participant_activity_participant_idx
  on public.live_participant_activity_state(participant_id);

comment on table public.live_participant_activity_state is
  'Server-authoritative participant progress and activity state for Ko-Host Live activities.';

alter table public.live_participant_activity_state
  enable row level security;

commit;