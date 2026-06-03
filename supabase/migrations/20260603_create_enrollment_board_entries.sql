begin;

create table if not exists public.enrollment_board_entries (
  id uuid primary key default gen_random_uuid(),
  microsite_id uuid not null references public.microsites(id) on delete cascade,
  block_id text not null,
  name text not null,
  quote text,
  email text,
  profile_image_url text,
  profile_image_storage_path text,
  visitor_token_hash text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_enrollment_board_entries_site_block_status
on public.enrollment_board_entries(microsite_id, block_id, status);

create index if not exists idx_enrollment_board_entries_visitor
on public.enrollment_board_entries(microsite_id, block_id, visitor_token_hash, status);

create unique index if not exists idx_enrollment_board_entries_one_active_per_visitor
on public.enrollment_board_entries(microsite_id, block_id, visitor_token_hash)
where status = 'active' and visitor_token_hash is not null;

alter table public.enrollment_board_entries
add constraint enrollment_board_entries_status_check
check (status in ('active', 'deleted', 'hidden'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'enrollment-board-images',
  'enrollment-board-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

commit;