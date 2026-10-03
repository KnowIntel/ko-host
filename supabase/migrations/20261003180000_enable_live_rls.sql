begin;

alter table public.live_experiences
  enable row level security;

alter table public.live_participants
  enable row level security;

alter table public.live_participant_sessions
  enable row level security;

alter table public.live_experience_state
  enable row level security;

alter table public.live_activities
  enable row level security;

alter table public.live_point_transactions
  enable row level security;

comment on table public.live_experiences is
  'Top-level Ko-Host Live experience associated with a microsite. Direct public database access is restricted by RLS; authoritative access is handled server-side.';

comment on table public.live_participants is
  'Ko-Host Live participants. Direct public database access is restricted by RLS; participant identity is resolved server-side.';

comment on table public.live_participant_sessions is
  'Secure server-managed sessions for Ko-Host Live participants. Session credentials must never be exposed through direct public database access.';

comment on table public.live_experience_state is
  'Authoritative shared runtime state for a Ko-Host Live experience. Direct public writes are prohibited; state changes are performed through validated server actions.';

comment on table public.live_activities is
  'Activities configured within a Ko-Host Live experience. Direct public writes are restricted by RLS.';

comment on table public.live_point_transactions is
  'Authoritative point transaction ledger for Ko-Host Live participants. Direct public writes are prohibited; points are awarded or reversed through validated server actions.';

commit;