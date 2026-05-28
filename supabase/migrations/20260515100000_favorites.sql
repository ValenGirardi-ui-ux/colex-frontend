-- Favoritos por usuario (productos guardados).
-- Ejecutar en Supabase SQL Editor o con `supabase db push`.

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists favorites_user_id_created_at_idx
  on public.favorites (user_id, created_at desc);

alter table public.favorites enable row level security;

drop policy if exists "favorites_select_own" on public.favorites;
drop policy if exists "favorites_insert_own" on public.favorites;
drop policy if exists "favorites_delete_own" on public.favorites;

create policy "favorites_select_own"
  on public.favorites for select to authenticated
  using (auth.uid() = user_id);

create policy "favorites_insert_own"
  on public.favorites for insert to authenticated
  with check (auth.uid() = user_id);

create policy "favorites_delete_own"
  on public.favorites for delete to authenticated
  using (auth.uid() = user_id);

notify pgrst, 'reload schema';
