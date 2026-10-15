begin;

-- Anonymous visitor identity is scoped to a single published microsite.
-- The application server generates the participant UUID and random token.
-- Only the SHA-256 token hash is stored; the raw token remains in an
-- HttpOnly, Secure cookie and is never accepted as a participant UUID.
create table if not exists public.progress_tracker_participant_sessions (
  id uuid primary key default gen_random_uuid(),
  site_key text not null,
  participant_id uuid not null default gen_random_uuid(),
  token_hash text not null unique,
  expires_at timestamptz not null,
  last_used_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint progress_tracker_session_token_hash_format
    check (token_hash ~ '^[0-9a-f]{64}$'),
  constraint progress_tracker_session_site_participant_unique
    unique (site_key, participant_id)
);

create index if not exists progress_tracker_sessions_expiry_idx
  on public.progress_tracker_participant_sessions (expires_at);

alter table public.progress_tracker_participant_sessions enable row level security;

-- Session lookup and creation must occur only in authorized server routes.
revoke all on public.progress_tracker_participant_sessions
  from public, anon, authenticated;

commit;
