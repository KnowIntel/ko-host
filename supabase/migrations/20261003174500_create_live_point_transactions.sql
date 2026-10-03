begin;

create table if not exists public.live_point_transactions (
  id uuid primary key default gen_random_uuid(),

  experience_id uuid not null
    references public.live_experiences(id)
    on delete cascade,

  participant_id uuid not null
    references public.live_participants(id)
    on delete cascade,

  amount integer not null,

  source_type text not null,
  source_id text,

  reason text,

  reversal_of uuid
    references public.live_point_transactions(id)
    on delete restrict,

  created_at timestamptz not null default now()
);

create index if not exists live_point_transactions_experience_idx
  on public.live_point_transactions(experience_id);

create index if not exists live_point_transactions_participant_idx
  on public.live_point_transactions(participant_id);

create index if not exists live_point_transactions_participant_created_idx
  on public.live_point_transactions(participant_id, created_at);

create index if not exists live_point_transactions_source_idx
  on public.live_point_transactions(experience_id, source_type, source_id);

comment on table public.live_point_transactions is
  'Authoritative point transaction ledger for Ko-Host Live participants.';

comment on column public.live_point_transactions.amount is
  'Signed point amount. Positive values award points and negative values deduct points.';

comment on column public.live_point_transactions.source_type is
  'Reason category that generated the transaction, such as trivia, scavenger, challenge, host, or reversal.';

comment on column public.live_point_transactions.source_id is
  'Optional identifier of the activity, response, discovery, or other record that generated the transaction.';

comment on column public.live_point_transactions.reversal_of is
  'Optional reference to an earlier point transaction that this transaction reverses.';

commit;