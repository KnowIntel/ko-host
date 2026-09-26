begin;

alter table public.connect_mailboxes
  add column if not exists reminder_3_day_sent_at timestamptz,
  add column if not exists reminder_2_day_sent_at timestamptz,
  add column if not exists reminder_1_day_sent_at timestamptz;

comment on column public.connect_mailboxes.reminder_3_day_sent_at is
  'Timestamp when the consumer was sent the 3-day mailbox expiration reminder.';

comment on column public.connect_mailboxes.reminder_2_day_sent_at is
  'Timestamp when the consumer was sent the 2-day mailbox expiration reminder.';

comment on column public.connect_mailboxes.reminder_1_day_sent_at is
  'Timestamp when the consumer was sent the final 1-day mailbox expiration reminder.';

commit;