begin;

create table if not exists public.live_participant_sessions (
  id uuid primary key default gen_random_uuid(),

  participant_id uuid not null
    references public.live_participants(id)
    on delete cascade,

  experience_id uuid not null
    references public.live_experiences(id)
    on delete cascade,

  token_hash text not null unique,

  expires_at timestamptz not null,

  last_used_at timestamptz not null default now(),

  created_at timestamptz not null default now()
);

create index if not exists live_participant_sessions_participant_idx
  on public.live_participant_sessions(participant_id);

create index if not exists live_participant_sessions_experience_idx
  on public.live_participant_sessions(experience_id);

create index if not exists live_participant_sessions_expires_idx
  on public.live_participant_sessions(expires_at);

comment on table public.live_participant_sessions is
  'Secure server-managed sessions for anonymous Ko-Host Live participants.';

comment on column public.live_participant_sessions.token_hash is
  'Hash of the opaque participant session credential. The raw credential is never stored in the database.';

comment on column public.live_participant_sessions.expires_at is
  'Time after which this participant session credential is no longer valid.';

comment on column public.live_participant_sessions.last_used_at is
  'Most recent time this session was successfully resolved by the server.';

commit;