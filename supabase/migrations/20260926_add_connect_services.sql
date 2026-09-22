begin;

-- =========================================================
-- Ko-Host Connect
-- Expand service catalog from 28 to 51 services
-- =========================================================

insert into public.connect_services (
  slug,
  name,
  sort_order
)
values
  ('babysitting', 'Babysitting', 290),
  ('elder-care', 'Elder Care', 300),
  ('house-sitting', 'House Sitting', 310),
  ('pool-cleaning', 'Pool Cleaning', 320),
  ('gutter-cleaning', 'Gutter Cleaning', 330),
  ('window-cleaning', 'Window Cleaning', 340),
  ('home-security-installation', 'Home Security Installation', 350),
  ('locksmith', 'Locksmith', 360),
  ('garage-door-repair', 'Garage Door Repair', 370),
  ('flooring-installation', 'Flooring Installation', 380),
  ('drywall-repair', 'Drywall Repair', 390),
  ('fence-installation-repair', 'Fence Installation & Repair', 400),
  ('concrete-masonry', 'Concrete & Masonry', 410),
  ('interior-design', 'Interior Design', 420),
  ('personal-training', 'Personal Training', 430),
  ('makeup-artist', 'Makeup Artist', 440),
  ('hair-stylist-barber', 'Hair Stylist / Barber', 450),
  ('catering', 'Catering', 460),
  ('event-planning', 'Event Planning', 470),
  ('dj-services', 'DJ Services', 480),
  ('tax-preparation', 'Tax Preparation', 490),
  ('notary-services', 'Notary Services', 500)
  ('companion', 'Companion', 510)
on conflict (slug) do nothing;

commit;