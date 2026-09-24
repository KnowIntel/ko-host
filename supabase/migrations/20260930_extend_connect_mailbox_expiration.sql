begin;

-- =========================================================
-- Ko-Host Connect
-- Extend request/mailbox lifetime from 12 to 30 days
-- =========================================================

-- New mailboxes will expire 30 days after creation.
alter table public.connect_mailboxes
  alter column expires_at
  set default (now() + interval '30 days');


-- =========================================================
-- Extend currently active mailboxes as well
-- =========================================================
--
-- Recalculate expiration from the original creation date
-- so every currently active request receives the same
-- 30-day lifetime as new requests.
--
-- This does NOT revive mailboxes that have already expired.
-- =========================================================

update public.connect_mailboxes
set
  expires_at = created_at + interval '30 days',
  updated_at = now()
where
  status = 'active'
  and expires_at > now();


comment on column public.connect_mailboxes.expires_at is
  'Expiration timestamp for the Connect request mailbox. Mailboxes remain active for 30 days from creation.';


commit;