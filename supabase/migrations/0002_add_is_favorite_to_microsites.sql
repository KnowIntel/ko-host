begin;

alter table public.microsites
add column if not exists is_favorite boolean not null default false;

create index if not exists idx_microsites_owner_favorite
on public.microsites(owner_clerk_user_id, is_favorite);

commit;