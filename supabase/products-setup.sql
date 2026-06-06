-- Tabla products + RLS + bucket de imágenes. Ejecutar en Supabase SQL Editor.

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text not null default '',
  price integer not null check ((status = 'draft' and price >= 0) or (status <> 'draft' and price > 0)),
  category text not null default 'Otros',
  condition text not null check (condition in ('nuevo', 'usado')),
  new_condition text check (new_condition in ('con_etiqueta', 'sin_etiqueta')),
  used_condition text check (
    used_condition in ('casi_nuevo', 'algo_desgastado', 'bastante_desgastado', 'roto')
  ),
  institution text,
  brand text,
  location text not null default 'No indicada',
  size text,
  delivery_method text check (
    delivery_method in ('retiro', 'envio', 'envio_domicilio', 'ambos')
  ),
  status text not null default 'active' check (status in ('active', 'sold', 'paused', 'draft')),
  images text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.products add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table public.products add column if not exists title text;
alter table public.products add column if not exists description text;
alter table public.products add column if not exists price integer;
alter table public.products add column if not exists category text;
alter table public.products add column if not exists condition text;
alter table public.products add column if not exists new_condition text;
alter table public.products add column if not exists used_condition text;
alter table public.products add column if not exists institution text;
alter table public.products add column if not exists brand text;
alter table public.products add column if not exists location text;
alter table public.products add column if not exists size text;
alter table public.products add column if not exists delivery_method text;
alter table public.products add column if not exists status text;
alter table public.products add column if not exists images text[];
alter table public.products add column if not exists created_at timestamptz;

alter table public.products enable row level security;

drop policy if exists "products_select_active" on public.products;
drop policy if exists "products_insert_own" on public.products;
drop policy if exists "products_update_own" on public.products;

create policy "products_select_active"
  on public.products for select
  to authenticated, anon
  using (status = 'active');

create policy "products_insert_own"
  on public.products for insert to authenticated
  with check (auth.uid() = user_id);

create policy "products_update_own"
  on public.products for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Storage: solo imágenes de publicaciones (avatares → bucket `avatars`, banners → `shop-banners`)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product_images_select_public" on storage.objects;
drop policy if exists "product_images_insert_own" on storage.objects;
drop policy if exists "product_images_update_own" on storage.objects;
drop policy if exists "product_images_delete_own" on storage.objects;

create policy "product_images_select_public"
  on storage.objects for select
  to authenticated, anon
  using (bucket_id = 'product-images');

create policy "product_images_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "product_images_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "product_images_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

notify pgrst, 'reload schema';
