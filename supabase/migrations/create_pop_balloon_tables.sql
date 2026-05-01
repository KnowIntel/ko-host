create table if not exists public.pop_balloon_games (
  id uuid primary key default gen_random_uuid(),
  microsite_id uuid not null,
  block_id text not null,
  title text not null default 'Pop the Balloon',
  status text not null default 'waiting',
  current_round_id uuid,
  host_name text default 'Host',
  require_pop_reason boolean not null default true,
  audience_voting_enabled boolean not null default false,
  anonymous_viewing_enabled boolean not null default true,
  match_result_mode text not null default 'public',
  theme text not null default 'red_balloons',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pop_balloon_games_status_check
    check (status in ('waiting', 'live', 'ended')),
  constraint pop_balloon_games_match_result_mode_check
    check (match_result_mode in ('public', 'private', 'contact_form', 'private_chat_later')),
  constraint pop_balloon_games_theme_check
    check (theme in ('red_balloons', 'hearts', 'party', 'formal', 'custom'))
);

create table if not exists public.pop_balloon_participants (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.pop_balloon_games(id) on delete cascade,
  browser_key text,
  name text not null,
  age text,
  intro text,
  looking_for text,
  fun_fact text,
  photo_url text,
  contact_hidden text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  constraint pop_balloon_participants_status_check
    check (status in ('active', 'hidden', 'removed'))
);

create table if not exists public.pop_balloon_rounds (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.pop_balloon_games(id) on delete cascade,
  featured_participant_id uuid references public.pop_balloon_participants(id) on delete set null,
  status text not null default 'waiting',
  prompt text,
  started_at timestamptz,
  ended_at timestamptz,
  selected_match_id uuid,
  created_at timestamptz not null default now(),
  constraint pop_balloon_rounds_status_check
    check (status in ('waiting', 'live', 'ended'))
);

create table if not exists public.pop_balloon_round_entries (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.pop_balloon_rounds(id) on delete cascade,
  participant_id uuid not null references public.pop_balloon_participants(id) on delete cascade,
  balloon_status text not null default 'active',
  pop_reason text,
  popped_at timestamptz,
  created_at timestamptz not null default now(),
  unique(round_id, participant_id),
  constraint pop_balloon_round_entries_balloon_status_check
    check (balloon_status in ('active', 'popped', 'kept', 'selected'))
);

create table if not exists public.pop_balloon_matches (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.pop_balloon_games(id) on delete cascade,
  round_id uuid not null references public.pop_balloon_rounds(id) on delete cascade,
  featured_participant_id uuid references public.pop_balloon_participants(id) on delete set null,
  matched_participant_id uuid references public.pop_balloon_participants(id) on delete set null,
  visibility text not null default 'public',
  created_at timestamptz not null default now(),
  constraint pop_balloon_matches_visibility_check
    check (visibility in ('public', 'private', 'contact_form', 'private_chat_later'))
);

create index if not exists pop_balloon_games_microsite_block_idx
  on public.pop_balloon_games(microsite_id, block_id);

create index if not exists pop_balloon_participants_game_idx
  on public.pop_balloon_participants(game_id);

create index if not exists pop_balloon_rounds_game_idx
  on public.pop_balloon_rounds(game_id);

create index if not exists pop_balloon_round_entries_round_idx
  on public.pop_balloon_round_entries(round_id);

alter table public.pop_balloon_games enable row level security;
alter table public.pop_balloon_participants enable row level security;
alter table public.pop_balloon_rounds enable row level security;
alter table public.pop_balloon_round_entries enable row level security;
alter table public.pop_balloon_matches enable row level security;