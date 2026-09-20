-- supabase/migrations/0002_calendar_bookings.sql
-- Calendar Event > Professional scheduling persistence

begin;

-- =========================
-- Professional calendar slots
-- =========================

create table if not exists public.calendar_booking_slots (
  id uuid primary key default gen_random_uuid(),

  microsite_id uuid not null
    references public.microsites(id)
    on delete cascade,

  block_id text not null,

  -- ID stored in CalendarEventBlock.data.professionalSlots[]
  source_slot_id text not null,

  booking_date date not null,
  start_time time not null,
  end_time time null,

  enabled boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (microsite_id, block_id, source_slot_id)
);

create index if not exists idx_calendar_booking_slots_microsite
  on public.calendar_booking_slots(microsite_id);

create index if not exists idx_calendar_booking_slots_block
  on public.calendar_booking_slots(microsite_id, block_id);

create index if not exists idx_calendar_booking_slots_date
  on public.calendar_booking_slots(microsite_id, block_id, booking_date);

-- =========================
-- Professional calendar bookings
-- =========================

create table if not exists public.calendar_bookings (
  id uuid primary key default gen_random_uuid(),

  microsite_id uuid not null
    references public.microsites(id)
    on delete cascade,

  block_id text not null,

  slot_id uuid null
    references public.calendar_booking_slots(id)
    on delete set null,

  source_slot_id text not null,

  booking_subject text not null,

  visitor_name text not null,
  visitor_email text not null,
  visitor_phone text null,

  choice_id text null,
  choice_label text null,

  booking_date date not null,
  start_time time not null,
  end_time time null,

  status text not null default 'confirmed'
    check (
      status in (
        'confirmed',
        'cancelled'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_calendar_bookings_microsite
  on public.calendar_bookings(microsite_id);

create index if not exists idx_calendar_bookings_block
  on public.calendar_bookings(microsite_id, block_id);

create index if not exists idx_calendar_bookings_date
  on public.calendar_bookings(
    microsite_id,
    block_id,
    booking_date
  );

create index if not exists idx_calendar_bookings_email
  on public.calendar_bookings(visitor_email);

-- Critical protection against double booking.
--
-- Only one CONFIRMED booking may exist for the same
-- Professional Calendar block + configured slot.
--
-- A cancelled booking releases the slot because cancelled
-- rows are excluded from this partial unique index.

create unique index if not exists uq_calendar_bookings_confirmed_slot
  on public.calendar_bookings(
    microsite_id,
    block_id,
    source_slot_id
  )
  where status = 'confirmed';

-- =========================
-- RLS
-- =========================

alter table public.calendar_booking_slots
  enable row level security;

alter table public.calendar_bookings
  enable row level security;

-- Owners may read their configured slots.

drop policy if exists "calendar_slots_owner_select"
  on public.calendar_booking_slots;

create policy "calendar_slots_owner_select"
on public.calendar_booking_slots
for select
to public
using (
  exists (
    select 1
    from public.microsites m
    where m.id = microsite_id
      and (auth.jwt() ->> 'sub') = m.owner_clerk_user_id
  )
);

-- Owners may insert slots.

drop policy if exists "calendar_slots_owner_insert"
  on public.calendar_booking_slots;

create policy "calendar_slots_owner_insert"
on public.calendar_booking_slots
for insert
to public
with check (
  exists (
    select 1
    from public.microsites m
    where m.id = microsite_id
      and (auth.jwt() ->> 'sub') = m.owner_clerk_user_id
  )
);

-- Owners may update slots.

drop policy if exists "calendar_slots_owner_update"
  on public.calendar_booking_slots;

create policy "calendar_slots_owner_update"
on public.calendar_booking_slots
for update
to public
using (
  exists (
    select 1
    from public.microsites m
    where m.id = microsite_id
      and (auth.jwt() ->> 'sub') = m.owner_clerk_user_id
  )
)
with check (
  exists (
    select 1
    from public.microsites m
    where m.id = microsite_id
      and (auth.jwt() ->> 'sub') = m.owner_clerk_user_id
  )
);

-- Owners may delete configured slots.

drop policy if exists "calendar_slots_owner_delete"
  on public.calendar_booking_slots;

create policy "calendar_slots_owner_delete"
on public.calendar_booking_slots
for delete
to public
using (
  exists (
    select 1
    from public.microsites m
    where m.id = microsite_id
      and (auth.jwt() ->> 'sub') = m.owner_clerk_user_id
  )
);

-- Owners may read bookings belonging to their microsites.

drop policy if exists "calendar_bookings_owner_select"
  on public.calendar_bookings;

create policy "calendar_bookings_owner_select"
on public.calendar_bookings
for select
to public
using (
  exists (
    select 1
    from public.microsites m
    where m.id = microsite_id
      and (auth.jwt() ->> 'sub') = m.owner_clerk_user_id
  )
);

-- Owners may update bookings, primarily for cancellation/status changes.

drop policy if exists "calendar_bookings_owner_update"
  on public.calendar_bookings;

create policy "calendar_bookings_owner_update"
on public.calendar_bookings
for update
to public
using (
  exists (
    select 1
    from public.microsites m
    where m.id = microsite_id
      and (auth.jwt() ->> 'sub') = m.owner_clerk_user_id
  )
)
with check (
  exists (
    select 1
    from public.microsites m
    where m.id = microsite_id
      and (auth.jwt() ->> 'sub') = m.owner_clerk_user_id
  )
);

-- Public visitors do NOT receive direct insert/update/select policies.
-- Public scheduling APIs will use getSupabaseAdmin() / service role
-- after validating the microsite, block and requested slot server-side.

commit;