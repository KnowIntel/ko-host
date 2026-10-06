begin;

-- ============================================================
-- LIVE SCHEDULE ENTRIES
-- ============================================================

create table if not exists public.live_schedule_entries (
  id uuid primary key default gen_random_uuid(),

  experience_id uuid not null
    references public.live_experiences(id)
    on delete cascade,

  title text not null,
  description text,

  starts_at timestamptz,
  ends_at timestamptz,

  status text not null default 'upcoming'
    check (
      status in (
        'upcoming',
        'current',
        'completed',
        'cancelled'
      )
    ),

  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint live_schedule_entries_time_order
    check (
      ends_at is null
      or starts_at is null
      or ends_at >= starts_at
    )
);

create index if not exists
  live_schedule_entries_experience_idx
on public.live_schedule_entries(experience_id);

create index if not exists
  live_schedule_entries_experience_sort_idx
on public.live_schedule_entries(
  experience_id,
  sort_order,
  starts_at
);

create index if not exists
  live_schedule_entries_experience_status_idx
on public.live_schedule_entries(
  experience_id,
  status
);

alter table public.live_schedule_entries
  enable row level security;

comment on table public.live_schedule_entries is
  'Server-managed schedule entries for a Ko-Host Live experience.';


-- ============================================================
-- LIVE SONG REQUESTS
-- ============================================================

create table if not exists public.live_song_requests (
  id uuid primary key default gen_random_uuid(),

  experience_id uuid not null
    references public.live_experiences(id)
    on delete cascade,

  participant_id uuid not null
    references public.live_participants(id)
    on delete cascade,

  song_title text not null,
  artist_name text,

  status text not null default 'queued'
    check (
      status in (
        'queued',
        'playing',
        'played',
        'rejected'
      )
    ),

  sort_order integer not null default 0,

  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists
  live_song_requests_experience_idx
on public.live_song_requests(experience_id);

create index if not exists
  live_song_requests_participant_idx
on public.live_song_requests(participant_id);

create index if not exists
  live_song_requests_queue_idx
on public.live_song_requests(
  experience_id,
  status,
  sort_order,
  requested_at
);

alter table public.live_song_requests
  enable row level security;

comment on table public.live_song_requests is
  'Server-authoritative participant song-request queue for Ko-Host Live.';


-- ============================================================
-- LIVE ANNOUNCEMENTS
-- ============================================================

create table if not exists public.live_announcements (
  id uuid primary key default gen_random_uuid(),

  experience_id uuid not null
    references public.live_experiences(id)
    on delete cascade,

  title text,
  message text not null,

  status text not null default 'draft'
    check (
      status in (
        'draft',
        'published',
        'archived'
      )
    ),

  published_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint live_announcements_publish_state
    check (
      status <> 'published'
      or published_at is not null
    )
);

create index if not exists
  live_announcements_experience_idx
on public.live_announcements(experience_id);

create index if not exists
  live_announcements_published_idx
on public.live_announcements(
  experience_id,
  status,
  published_at desc
);

alter table public.live_announcements
  enable row level security;

comment on table public.live_announcements is
  'Host-created announcements published to participants in a Ko-Host Live experience.';


commit;