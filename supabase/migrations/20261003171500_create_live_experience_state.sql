begin;

create table if not exists public.live_experience_state (
  id uuid primary key default gen_random_uuid(),

  experience_id uuid not null
    references public.live_experiences(id)
    on delete cascade,

  current_activity_type text,
  current_activity_id uuid,

  state jsonb not null default '{}'::jsonb,

  updated_at timestamptz not null default now(),

  constraint live_experience_state_experience_unique
    unique (experience_id)
);

create index if not exists live_experience_state_activity_idx
  on public.live_experience_state(current_activity_id);

comment on table public.live_experience_state is
  'Authoritative shared runtime state for a Ko-Host Live experience.';

comment on column public.live_experience_state.experience_id is
  'Live experience whose shared runtime state is represented by this row.';

comment on column public.live_experience_state.current_activity_type is
  'Type of activity currently active in the Live experience.';

comment on column public.live_experience_state.current_activity_id is
  'Identifier of the currently active activity when applicable.';

comment on column public.live_experience_state.state is
  'Extensible shared runtime state that is visible across participants in the experience.';

commit;