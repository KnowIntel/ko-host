begin;

-- =========================================================
-- Ko-Host Connect
-- Expand service catalog from 50 to 54 services
-- =========================================================

insert into public.connect_services (
  slug,
  name,
  sort_order
)
values
  ('animal-control', 'Animal Control', 510),
  ('companionship', 'Companionship', 520),
  ('real-estate', 'Real Estate', 530),
  ('financial-services', 'Financial Services', 540)
on conflict (slug) do nothing;

commit;