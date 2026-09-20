begin;

/* ================================================================= */
/* KO-HOST CONNECT — REQUEST / PROVIDER MATCHES                       */
/* ================================================================= */

/*
 * Stores the permanent assignment of a consumer request to a provider.
 *
 * Matches are created when a request is routed to an eligible provider.
 * They are persisted so provider dashboards do not have to recompute
 * historical request eligibility every time they load.
 *
 * A provider may receive a request only once.
 */
create table if not exists public.connect_request_matches (
  id uuid primary key default gen_random_uuid(),

  request_id uuid not null
    references public.connect_requests(id)
    on delete cascade,

  provider_profile_id uuid not null
    references public.connect_provider_profiles(id)
    on delete cascade,

  /*
   * Provider-side lifecycle.
   *
   * new:
   *   Provider has received the request but has not opened it.
   *
   * viewed:
   *   Provider has opened/viewed the request.
   *
   * responded:
   *   Provider has sent at least one private mailbox response.
   *
   * closed:
   *   Provider has dismissed/closed the request from their workflow.
   */
  status text not null default 'new'
    check (
      status in (
        'new',
        'viewed',
        'responded',
        'closed'
      )
    ),

  matched_at timestamptz not null default now(),
  viewed_at timestamptz null,
  responded_at timestamptz null,
  closed_at timestamptz null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint connect_request_matches_request_provider_unique
    unique (
      request_id,
      provider_profile_id
    )
);


/* ================================================================= */
/* INDEXES                                                            */
/* ================================================================= */

/*
 * Fast lookup of every provider assigned to a request.
 */
create index if not exists
  connect_request_matches_request_id_idx
on public.connect_request_matches (
  request_id
);


/*
 * Main provider dashboard lookup.
 */
create index if not exists
  connect_request_matches_provider_profile_id_idx
on public.connect_request_matches (
  provider_profile_id
);


/*
 * Supports provider dashboard filtering by request status.
 */
create index if not exists
  connect_request_matches_provider_status_idx
on public.connect_request_matches (
  provider_profile_id,
  status
);


/*
 * Supports newest-first provider request lists.
 */
create index if not exists
  connect_request_matches_provider_matched_at_idx
on public.connect_request_matches (
  provider_profile_id,
  matched_at desc
);


/* ================================================================= */
/* ROW LEVEL SECURITY                                                 */
/* ================================================================= */

/*
 * Matches are private.
 *
 * Provider dashboard/server APIs authenticate with Clerk and verify:
 *
 *   connect_request_matches
 *       -> connect_provider_profiles
 *       -> microsites
 *       -> owner_clerk_user_id
 *
 * Public visitors never receive direct access to provider assignments.
 */
alter table public.connect_request_matches
  enable row level security;


/* ================================================================= */
/* COMMENTS                                                           */
/* ================================================================= */

comment on table public.connect_request_matches is
  'Persistent assignments of Ko-Host Connect consumer requests to eligible provider profiles.';

comment on column public.connect_request_matches.request_id is
  'Consumer request assigned to the provider.';

comment on column public.connect_request_matches.provider_profile_id is
  'Connect provider profile that received the request.';

comment on column public.connect_request_matches.status is
  'Provider-side request lifecycle: new, viewed, responded, or closed.';

comment on column public.connect_request_matches.matched_at is
  'Time the consumer request was assigned to this provider.';

comment on column public.connect_request_matches.viewed_at is
  'First time the provider viewed the assigned request.';

comment on column public.connect_request_matches.responded_at is
  'First time the provider sent a private response for the assigned request.';

comment on column public.connect_request_matches.closed_at is
  'Time the provider closed the request from their workflow.';


commit;