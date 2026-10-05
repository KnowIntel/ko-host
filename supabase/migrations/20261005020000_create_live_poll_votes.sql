begin;

create table if not exists public.live_poll_votes (
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

  question_id text not null,
  choice_id text not null,

  created_at timestamptz not null default now(),

  constraint live_poll_votes_unique
    unique (
      participant_id,
      activity_id,
      question_id
    )
);

create index if not exists live_poll_votes_experience_idx
  on public.live_poll_votes(experience_id);

create index if not exists live_poll_votes_activity_idx
  on public.live_poll_votes(activity_id);

create index if not exists live_poll_votes_participant_idxy
  on public.live_poll_votes(participant_id);

alter table public.live_poll_votes
  enable row level security;

comment on table public.live_poll_votes is
  'Server-authoritative Ko-Host Live Poll votes. One vote per participant per Poll question.';

commit;
