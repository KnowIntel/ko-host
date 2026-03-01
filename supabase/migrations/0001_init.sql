-- supabase/migrations/0001_init.sql
-- ko-host Phase 1 schema + seed
-- Assumptions:
-- 1) Clerk is the identity provider.
-- 2) Requests that should be subject to RLS will pass a JWT whose "sub" == Clerk user id.
--    Policies below use auth.jwt()->>'sub' (works with JWT claims, not Supabase Auth UID).

begin;

-- Extensions
create extension if not exists pgcrypto;

-- Enums
do $$ begin
  create type public.microsite_status as enum ('draft', 'published', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.entitlement_status as enum ('active', 'past_due', 'canceled', 'incomplete', 'trialing');
exception
  when duplicate_object then null;
end $$;

-- Templates catalog
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null unique, -- e.g., 'wedding_rsvp'
  name text not null,
  description text not null default '',
  hero_icon text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.template_modules (
  id uuid primary key default gen_random_uuid(),
  template_key text not null references public.templates(template_key) on delete cascade,
  module_key text not null, -- e.g., 'rsvp', 'poll', 'gallery'
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique(template_key, module_key)
);

-- Microsites
create table if not exists public.microsites (
  id uuid primary key default gen_random_uuid(),
  owner_clerk_user_id text not null,
  template_key text not null references public.templates(template_key),
  slug text not null unique, -- {slug}.ko-host.com
  title text not null,
  status public.microsite_status not null default 'draft',
  published_at timestamptz null,
  expires_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_microsites_owner on public.microsites(owner_clerk_user_id);
create index if not exists idx_microsites_template_key on public.microsites(template_key);
create index if not exists idx_microsites_status on public.microsites(status);

-- Microsite settings (small theme settings)
create table if not exists public.microsite_settings (
  microsite_id uuid primary key references public.microsites(id) on delete cascade,
  accent_color text null, -- e.g. '#FF3366'
  cover_image_url text null,
  logo_url text null,
  theme_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Stripe mapping (Phase 2 uses this heavily, but we create now)
create table if not exists public.stripe_customers (
  clerk_user_id text primary key,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Entitlements: active template subscriptions per user
create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  template_key text not null references public.templates(template_key),
  status public.entitlement_status not null default 'active',
  stripe_subscription_id text null,
  current_period_end timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(clerk_user_id, template_key)
);

create index if not exists idx_entitlements_user on public.entitlements(clerk_user_id);
create index if not exists idx_entitlements_template on public.entitlements(template_key);
create index if not exists idx_entitlements_status on public.entitlements(status);

-- =========================
-- RLS
-- =========================
alter table public.templates enable row level security;
alter table public.template_modules enable row level security;
alter table public.microsites enable row level security;
alter table public.microsite_settings enable row level security;
alter table public.stripe_customers enable row level security;
alter table public.entitlements enable row level security;

-- Public can read templates + module catalog
drop policy if exists "templates_public_read" on public.templates;
create policy "templates_public_read"
on public.templates
for select
to public
using (true);

drop policy if exists "template_modules_public_read" on public.template_modules;
create policy "template_modules_public_read"
on public.template_modules
for select
to public
using (true);

-- Helper: owner id from JWT "sub" claim
-- Note: auth.jwt() returns JSON claims if a JWT is supplied to Supabase.
-- If no JWT, auth.jwt() may be null; comparisons will be false.

-- Microsites: owner can CRUD
drop policy if exists "microsites_owner_select" on public.microsites;
create policy "microsites_owner_select"
on public.microsites
for select
to public
using ((auth.jwt() ->> 'sub') = owner_clerk_user_id);

drop policy if exists "microsites_owner_insert" on public.microsites;
create policy "microsites_owner_insert"
on public.microsites
for insert
to public
with check ((auth.jwt() ->> 'sub') = owner_clerk_user_id);

drop policy if exists "microsites_owner_update" on public.microsites;
create policy "microsites_owner_update"
on public.microsites
for update
to public
using ((auth.jwt() ->> 'sub') = owner_clerk_user_id)
with check ((auth.jwt() ->> 'sub') = owner_clerk_user_id);

drop policy if exists "microsites_owner_delete" on public.microsites;
create policy "microsites_owner_delete"
on public.microsites
for delete
to public
using ((auth.jwt() ->> 'sub') = owner_clerk_user_id);

-- Microsite settings: only owner via join
drop policy if exists "settings_owner_select" on public.microsite_settings;
create policy "settings_owner_select"
on public.microsite_settings
for select
to public
using (
  exists (
    select 1 from public.microsites m
    where m.id = microsite_id
      and (auth.jwt() ->> 'sub') = m.owner_clerk_user_id
  )
);

drop policy if exists "settings_owner_upsert" on public.microsite_settings;
create policy "settings_owner_upsert"
on public.microsite_settings
for insert
to public
with check (
  exists (
    select 1 from public.microsites m
    where m.id = microsite_id
      and (auth.jwt() ->> 'sub') = m.owner_clerk_user_id
  )
);

drop policy if exists "settings_owner_update" on public.microsite_settings;
create policy "settings_owner_update"
on public.microsite_settings
for update
to public
using (
  exists (
    select 1 from public.microsites m
    where m.id = microsite_id
      and (auth.jwt() ->> 'sub') = m.owner_clerk_user_id
  )
)
with check (
  exists (
    select 1 from public.microsites m
    where m.id = microsite_id
      and (auth.jwt() ->> 'sub') = m.owner_clerk_user_id
  )
);

-- Entitlements + stripe_customers are private (owner-only read)
drop policy if exists "stripe_customers_owner_read" on public.stripe_customers;
create policy "stripe_customers_owner_read"
on public.stripe_customers
for select
to public
using ((auth.jwt() ->> 'sub') = clerk_user_id);

drop policy if exists "entitlements_owner_read" on public.entitlements;
create policy "entitlements_owner_read"
on public.entitlements
for select
to public
using ((auth.jwt() ->> 'sub') = clerk_user_id);

-- Writes to entitlements/stripe_customers will be via service role in Phase 2 webhooks/routes.
-- So we do NOT allow public inserts/updates here.

-- =========================
-- Seed template catalog + module enablement
-- =========================
insert into public.templates (template_key, name, description, hero_icon)
values
  ('wedding_rsvp', 'Wedding RSVP', 'RSVP + schedule + travel + registry + optional gallery + announcements + countdown', '💍'),
  ('party_birthday', 'Party / Birthday', 'RSVP + map + countdown + poll + optional gallery', '🎉'),
  ('baby_shower', 'Baby Shower', 'RSVP + registry + poll + map + countdown', '🍼'),
  ('family_reunion', 'Family Reunion', 'RSVP + contributions + schedule + polls + optional gallery', '👨‍👩‍👧‍👦'),
  ('memorial_tribute', 'Memorial / Tribute', 'Service info + donations + guestbook + gallery + map', '🕯️'),
  ('property_listing_rental', 'Property Listing (Rental)', 'Photos + features + inquiry + pre-screen + map + booking embed + downloads', '🏠'),
  ('open_house', 'Open House', 'Time-slot RSVP + QR + sign-in + map + photos + follow-up capture', '📍'),
  ('product_launch_waitlist', 'Product Launch / Waitlist', 'Email capture + countdown + FAQ + announcements + social share', '🚀'),
  ('crowdfunding_campaign', 'Crowdfunding / Campaign', 'Story + progress meter + email capture + donation links + updates', '📣'),
  ('resume_portfolio_temp', 'Resume / Portfolio (Temporary)', 'About + projects + PDF download + contact + booking embed', '🧑‍💼')
on conflict (template_key) do nothing;

-- module keys we’ll implement later; this is enablement mapping
-- Common module keys: rsvp, schedule, map, registry, gallery, announcements, countdown, poll, payments, guestbook, inquiry, prescreen, qr, booking, photos, features, downloads, waitlist, faq, social_share, story, progress, updates, projects, pdf_download, contact
insert into public.template_modules (template_key, module_key, enabled)
values
  -- 1) Wedding RSVP
  ('wedding_rsvp','rsvp',true),
  ('wedding_rsvp','schedule',true),
  ('wedding_rsvp','map',true),
  ('wedding_rsvp','registry',true),
  ('wedding_rsvp','gallery',true),
  ('wedding_rsvp','announcements',true),
  ('wedding_rsvp','countdown',true),

  -- 2) Party / Birthday
  ('party_birthday','rsvp',true),
  ('party_birthday','map',true),
  ('party_birthday','countdown',true),
  ('party_birthday','poll',true),
  ('party_birthday','gallery',true),

  -- 3) Baby Shower
  ('baby_shower','rsvp',true),
  ('baby_shower','registry',true),
  ('baby_shower','poll',true),
  ('baby_shower','map',true),
  ('baby_shower','countdown',true),

  -- 4) Family Reunion
  ('family_reunion','rsvp',true),
  ('family_reunion','payments',true),
  ('family_reunion','schedule',true),
  ('family_reunion','poll',true),
  ('family_reunion','gallery',true),

  -- 5) Memorial / Tribute
  ('memorial_tribute','service_info',true),
  ('memorial_tribute','donations',true),
  ('memorial_tribute','guestbook',true),
  ('memorial_tribute','gallery',true),
  ('memorial_tribute','map',true),

  -- 6) Property Listing (Rental)
  ('property_listing_rental','photos',true),
  ('property_listing_rental','features',true),
  ('property_listing_rental','inquiry',true),
  ('property_listing_rental','prescreen',true),
  ('property_listing_rental','map',true),
  ('property_listing_rental','booking',true),
  ('property_listing_rental','downloads',true),

  -- 7) Open House
  ('open_house','rsvp',true),
  ('open_house','time_slots',true),
  ('open_house','qr',true),
  ('open_house','sign_in',true),
  ('open_house','map',true),
  ('open_house','photos',true),
  ('open_house','follow_up',true),

  -- 8) Product Launch / Waitlist
  ('product_launch_waitlist','waitlist',true),
  ('product_launch_waitlist','countdown',true),
  ('product_launch_waitlist','faq',true),
  ('product_launch_waitlist','announcements',true),
  ('product_launch_waitlist','social_share',true),

  -- 9) Crowdfunding / Campaign
  ('crowdfunding_campaign','story',true),
  ('crowdfunding_campaign','progress',true),
  ('crowdfunding_campaign','waitlist',true),
  ('crowdfunding_campaign','donations',true),
  ('crowdfunding_campaign','updates',true),

  -- 10) Resume / Portfolio (Temporary)
  ('resume_portfolio_temp','about',true),
  ('resume_portfolio_temp','projects',true),
  ('resume_portfolio_temp','pdf_download',true),
  ('resume_portfolio_temp','contact',true),
  ('resume_portfolio_temp','booking',true)
on conflict (template_key, module_key) do nothing;

commit;