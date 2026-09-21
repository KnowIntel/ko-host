alter table public.connect_provider_profiles
add column if not exists display_name text;

alter table public.connect_provider_profiles
add constraint connect_provider_profiles_display_name_length
check (
  display_name is null
  or char_length(trim(display_name)) between 1 and 100
);