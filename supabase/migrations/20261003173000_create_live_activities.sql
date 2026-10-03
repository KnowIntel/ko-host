begin;

create table if not exists public.live_activities (
  id uuid primary key default gen_random_uuid(),

  experience_id uuid not null
    references public.live_experiences(id)
    on delete cascade,

  activity_type text not null,

  name text not null,

  status text not null default 'draft'
    check (
      status in (
        'draft',
        'locked',
        'upcoming',
        'active',
        'completed',
        'cancelled'
      )
    ),

  configuration jsonb not null default '{}'::jsonb,

  scheduled_for timestamptz,
  started_at timestamptz,
  completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists live_activities_experience_idx
  on public.live_activities(experience_id);

create index if not exists live_activities_experience_status_idx
  on public.live_activities(experience_id, status);

create index if not exists live_activities_experience_type_idx
  on public.live_activities(experience_id, activity_type);

comment on table public.live_activities is
  'Activities configured within a Ko-Host Live experience.';

comment on column public.live_activities.activity_type is
  'Generic activity type such as trivia, poll, wheel, scavenger_hunt, lottery, or mystery_drop.';

comment on column public.live_activities.configuration is
  'Experience-specific configuration and rules for this activity.';

comment on column public.live_activities.status is
  'Activity lifecycle state: draft, locked, upcoming, active, completed, or cancelled.';

comment on column public.live_activities.scheduled_for is
  'Optional scheduled start time. Host control remains authoritative over activity activation.';

commit;