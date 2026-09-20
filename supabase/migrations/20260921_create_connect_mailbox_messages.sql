begin;

/* ================================================================= */
/* KO-HOST CONNECT — PRIVATE PROVIDER CONVERSATION THREADS            */
/* ================================================================= */

/*
 * One thread represents one private conversation between:
 *
 *   Consumer Mailbox <-> Provider Microsite
 *
 * A provider can have only one thread inside a particular mailbox.
 * Different providers receive completely separate threads.
 */
create table if not exists public.connect_mailbox_threads (
  id uuid primary key default gen_random_uuid(),

  mailbox_id uuid not null
    references public.connect_mailboxes(id)
    on delete cascade,

  provider_microsite_id uuid not null
    references public.microsites(id)
    on delete restrict,

  status text not null default 'active'
    check (
      status in (
        'active',
        'closed'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint connect_mailbox_threads_mailbox_provider_unique
    unique (
      mailbox_id,
      provider_microsite_id
    )
);


/* ================================================================= */
/* THREAD INDEXES                                                     */
/* ================================================================= */

create index if not exists
  connect_mailbox_threads_mailbox_id_idx
on public.connect_mailbox_threads (
  mailbox_id
);

create index if not exists
  connect_mailbox_threads_provider_microsite_id_idx
on public.connect_mailbox_threads (
  provider_microsite_id
);

create index if not exists
  connect_mailbox_threads_status_idx
on public.connect_mailbox_threads (
  status
);

create index if not exists
  connect_mailbox_threads_created_at_idx
on public.connect_mailbox_threads (
  created_at desc
);


/* ================================================================= */
/* KO-HOST CONNECT — PRIVATE MESSAGES                                 */
/* ================================================================= */

/*
 * Messages belong to exactly one provider thread.
 *
 * sender_type intentionally identifies only the side of the
 * conversation:
 *
 *   consumer
 *   provider
 *
 * Provider identity comes from the thread's provider_microsite_id.
 * Consumer identity comes from the mailbox itself.
 *
 * We do not duplicate personal contact information here.
 */
create table if not exists public.connect_mailbox_messages (
  id uuid primary key default gen_random_uuid(),

  thread_id uuid not null
    references public.connect_mailbox_threads(id)
    on delete cascade,

  sender_type text not null
    check (
      sender_type in (
        'consumer',
        'provider'
      )
    ),

  message text not null
    check (
      char_length(trim(message)) >= 1
      and char_length(message) <= 5000
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


/* ================================================================= */
/* MESSAGE INDEXES                                                    */
/* ================================================================= */

create index if not exists
  connect_mailbox_messages_thread_id_idx
on public.connect_mailbox_messages (
  thread_id
);

create index if not exists
  connect_mailbox_messages_thread_created_at_idx
on public.connect_mailbox_messages (
  thread_id,
  created_at asc
);

create index if not exists
  connect_mailbox_messages_sender_type_idx
on public.connect_mailbox_messages (
  sender_type
);


/* ================================================================= */
/* ROW LEVEL SECURITY                                                 */
/* ================================================================= */

/*
 * Keep both tables private by default.
 *
 * Consumer access will go through Ko-Host server APIs after
 * verification of the Mailbox HttpOnly access cookie.
 *
 * Provider access will go through server APIs that verify:
 *
 *   Clerk user
 *        ↓
 *   microsites.owner_clerk_user_id
 *        ↓
 *   provider_microsite_id
 *        ↓
 *   this provider's thread only
 *
 * No general public SELECT/INSERT/UPDATE/DELETE policies are created.
 */
alter table public.connect_mailbox_threads
  enable row level security;

alter table public.connect_mailbox_messages
  enable row level security;


/* ================================================================= */
/* COMMENTS                                                           */
/* ================================================================= */

comment on table public.connect_mailbox_threads is
  'Private Ko-Host Connect conversation threads between one consumer mailbox and one provider microsite.';

comment on column public.connect_mailbox_threads.provider_microsite_id is
  'Provider identity for this private conversation. Ownership is resolved through microsites.owner_clerk_user_id.';

comment on table public.connect_mailbox_messages is
  'Private messages exchanged inside a Ko-Host Connect provider conversation thread.';

comment on column public.connect_mailbox_messages.sender_type is
  'Side that sent the message: consumer or provider.';


commit;