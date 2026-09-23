begin;

/* ================================================================= */
/* KO-HOST CONNECT — SCHEDULED / COMPLETED PROVIDER STATUSES          */
/* ================================================================= */

/*
 * Expands the provider-specific request lifecycle:
 *
 * new
 * viewed
 * responded
 * scheduled
 * completed
 * closed
 *
 * These statuses belong to the individual provider/request match.
 * They do not change the consumer request globally because multiple
 * providers may be matched to the same request.
 */


/* ----------------------------------------------------------------- */
/* REMOVE EXISTING STATUS CHECK                                      */
/* ----------------------------------------------------------------- */

alter table public.connect_request_matches
  drop constraint if exists connect_request_matches_status_check;


/* ----------------------------------------------------------------- */
/* ADD EXPANDED STATUS CHECK                                         */
/* ----------------------------------------------------------------- */

alter table public.connect_request_matches
  add constraint connect_request_matches_status_check
  check (
    status in (
      'new',
      'viewed',
      'responded',
      'scheduled',
      'completed',
      'closed'
    )
  );


/* ----------------------------------------------------------------- */
/* TRACK STATUS TIMESTAMPS                                           */
/* ----------------------------------------------------------------- */

alter table public.connect_request_matches
  add column if not exists scheduled_at timestamptz null;

alter table public.connect_request_matches
  add column if not exists completed_at timestamptz null;


/* ----------------------------------------------------------------- */
/* COMMENTS                                                          */
/* ----------------------------------------------------------------- */

comment on column public.connect_request_matches.status is
  'Provider-side request lifecycle: new, viewed, responded, scheduled, completed, or closed.';

comment on column public.connect_request_matches.scheduled_at is
  'Time the provider confirmed that service was scheduled with the consumer.';

comment on column public.connect_request_matches.completed_at is
  'Time the provider confirmed that service was completed for the consumer.';


commit;