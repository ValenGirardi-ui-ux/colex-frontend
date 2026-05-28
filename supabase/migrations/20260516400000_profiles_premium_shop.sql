-- Tienda premium: slug único, banner, descripción extendida y redes.

alter table public.profiles add column if not exists shop_slug text;
alter table public.profiles add column if not exists shop_banner_url text;
alter table public.profiles add column if not exists shop_description text;
alter table public.profiles add column if not exists shop_social_links jsonb not null default '{}'::jsonb;

create unique index if not exists profiles_shop_slug_lower_unique_idx
  on public.profiles (lower(shop_slug))
  where shop_slug is not null and trim(shop_slug) <> '';

notify pgrst, 'reload schema';
