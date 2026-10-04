begin;

create unique index if not exists live_point_transactions_source_unique
  on public.live_point_transactions (
    experience_id,
    participant_id,
    source_type,
    source_id
  )
  where source_id is not null
    and reversal_of is null;

commit;