-- =============================================================================
-- DIRECCIONES DE USUARIO — ejecutar en Supabase → SQL Editor → Run
-- Si ves: "Could not find the table 'public.user_addresses' in the schema cache"
-- es porque este script aún no se aplicó en tu proyecto.
-- =============================================================================

create table if not exists public.user_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  line1 text not null,
  street text,
  street_number text,
  address_notes text,
  city text not null,
  region text not null,
  postal_code text not null,
  country text not null default 'Argentina',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists user_addresses_user_id_created_at_idx
  on public.user_addresses (user_id, created_at desc);

alter table public.user_addresses enable row level security;

drop policy if exists "user_addresses_select_own" on public.user_addresses;
drop policy if exists "user_addresses_insert_own" on public.user_addresses;
drop policy if exists "user_addresses_update_own" on public.user_addresses;
drop policy if exists "user_addresses_delete_own" on public.user_addresses;

create policy "user_addresses_select_own"
  on public.user_addresses for select to authenticated
  using (auth.uid() = user_id);

create policy "user_addresses_insert_own"
  on public.user_addresses for insert to authenticated
  with check (auth.uid() = user_id);

create policy "user_addresses_update_own"
  on public.user_addresses for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_addresses_delete_own"
  on public.user_addresses for delete to authenticated
  using (auth.uid() = user_id);

notify pgrst, 'reload schema';
