-- Tabla orders para compras con método de entrega del comprador

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null,
  seller_id uuid references auth.users (id) on delete set null,
  product_title text not null,
  product_price integer not null check (product_price > 0),
  buyer_delivery_method text not null check (
    buyer_delivery_method in ('coordinar_vendedor', 'envio_domicilio')
  ),
  shipping_fee integer not null default 0 check (shipping_fee >= 0),
  total_amount integer not null check (total_amount > 0),
  status text not null default 'completed' check (status in ('pending', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists orders_buyer_id_created_at_idx
  on public.orders (buyer_id, created_at desc);

alter table public.orders enable row level security;

drop policy if exists "orders_select_own" on public.orders;
drop policy if exists "orders_insert_own" on public.orders;

create policy "orders_select_own"
  on public.orders for select to authenticated
  using (auth.uid() = buyer_id);

create policy "orders_insert_own"
  on public.orders for insert to authenticated
  with check (auth.uid() = buyer_id);

notify pgrst, 'reload schema';
