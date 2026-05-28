-- Alinea public.profiles con el frontend (bio, username, phone, location, institution, updated_at).
-- Idempotente: seguro re-ejecutar. Tras DDL, notifica a PostgREST para refrescar la caché de esquema.

-- Tabla mínima si no existía (proyectos viejos solo con id / nombre / email).
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists institution text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists created_at timestamptz;
alter table public.profiles add column if not exists updated_at timestamptz;

alter table public.profiles enable row level security;

drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;

create policy "profiles_insert_own"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute procedure public.set_profiles_updated_at();

notify pgrst, 'reload schema';
