begin;

create table if not exists public.connect_assistance_requests (
  id uuid primary key default gen_random_uuid(),

  mailbox_id uuid not null
    references public.connect_mailboxes(id)
    on delete cascade,

  request_id uuid not null
    references public.connect_requests(id)
    on delete cascade,

  thread_id uuid
    references public.connect_mailbox_threads(id)
    on delete cascade,

  provider_microsite_id uuid
    references public.microsites(id)
    on delete cascade,

  assistance_type text not null
    check (
      assistance_type in (
        'question',
        'conversation_concern',
        'provider_issue',
        'technical_problem',
        'other'
      )
    ),

  message text not null,

  status text not null
    default 'new'
    check (
      status in (
        'new',
        'reviewing',
        'resolved',
        'closed'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists connect_assistance_requests_mailbox_id_idx
on public.connect_assistance_requests(mailbox_id);

create index if not exists connect_assistance_requests_request_id_idx
on public.connect_assistance_requests(request_id);

create index if not exists connect_assistance_requests_thread_id_idx
on public.connect_assistance_requests(thread_id);

create index if not exists connect_assistance_requests_provider_microsite_id_idx
on public.connect_assistance_requests(provider_microsite_id);

create index if not exists connect_assistance_requests_status_idx
on public.connect_assistance_requests(status);

alter table public.connect_assistance_requests
  enable row level security;

comment on table public.connect_assistance_requests is
  'Support and assistance requests submitted from authenticated Ko-Host Connect consumer mailboxes.';

commit;