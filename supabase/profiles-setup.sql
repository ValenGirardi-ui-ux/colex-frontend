-- Ejecutar en SQL Editor de Supabase para `public.profiles`.
-- Proyectos existentes: preferí `supabase/migrations/20260515000000_profiles_editable_columns.sql`
-- (o `supabase db push`) para crear columnas faltantes y recargar la caché de PostgREST.
-- Cada fila usa el mismo `id` que `auth.users`; RLS limita lectura/escritura al dueño.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  username text,
  phone text,
  institution text,
  bio text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- Migración desde esquemas antiguos (solo añade columnas que falten).
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists institution text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists created_at timestamptz;
alter table public.profiles add column if not exists updated_at timestamptz;
alter table public.profiles add column if not exists is_premium boolean not null default false;
alter table public.profiles add column if not exists is_featured boolean not null default false;
alter table public.profiles add column if not exists avatar_url text;

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

-- Lectura pública (perfil de vendedor en /perfil/[id]). Ver también profiles-public-read-policy.sql
drop policy if exists "profiles_select_public" on public.profiles;

create policy "profiles_select_public"
  on public.profiles for select
  to authenticated, anon
  using (true);

-- Opcional: mantener `updated_at` al actualizar (requiere extensión pgcrypto o función manual).
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

-- Refresca caché de esquema de PostgREST (evita "column ... not found in the schema cache").
notify pgrst, 'reload schema';
