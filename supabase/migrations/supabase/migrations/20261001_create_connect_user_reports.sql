begin;

create table if not exists public.connect_user_reports (
  id uuid primary key default gen_random_uuid(),

  mailbox_id uuid not null
    references public.connect_mailboxes(id)
    on delete cascade,

  request_id uuid not null
    references public.connect_requests(id)
    on delete cascade,

  thread_id uuid not null
    references public.connect_mailbox_threads(id)
    on delete cascade,

  provider_microsite_id uuid not null
    references public.microsites(id)
    on delete cascade,

  reported_by text not null
    default 'consumer'
    check (reported_by in ('consumer', 'provider')),

  reason text not null
    check (
      reason in (
        'harassment',
        'spam',
        'fraud_scam',
        'inappropriate_content',
        'unsafe_behavior',
        'other'
      )
    ),

  details text not null,

  status text not null
    default 'new'
    check (
      status in (
        'new',
        'reviewing',
        'resolved',
        'dismissed'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists
  connect_user_reports_mailbox_id_idx
on public.connect_user_reports(mailbox_id);

create index if not exists
  connect_user_reports_request_id_idx
on public.connect_user_reports(request_id);

create index if not exists
  connect_user_reports_thread_id_idx
on public.connect_user_reports(thread_id);

create index if not exists
  connect_user_reports_provider_microsite_id_idx
on public.connect_user_reports(provider_microsite_id);

create index if not exists
  connect_user_reports_status_idx
on public.connect_user_reports(status);

alter table public.connect_user_reports
  enable row level security;

comment on table public.connect_user_reports is
  'Reports submitted about conduct within private Ko-Host Connect conversations.';

commit;