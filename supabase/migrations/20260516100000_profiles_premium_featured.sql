-- Premium / negocios destacados en home (carrusel).
-- Activar manualmente: update public.profiles set is_premium = true where id = '...';

alter table public.profiles add column if not exists is_premium boolean not null default false;
alter table public.profiles add column if not exists is_featured boolean not null default false;
alter table public.profiles add column if not exists avatar_url text;

create index if not exists profiles_premium_featured_idx
  on public.profiles (is_premium, is_featured)
  where is_premium = true or is_featured = true;

notify pgrst, 'reload schema';
