-- Borradores: status draft, updated_at, condition opcional en borradores, RLS propietario.

alter table public.products add column if not exists updated_at timestamptz not null default now();

alter table public.products drop constraint if exists products_status_check;
alter table public.products add constraint products_status_check
  check (status in ('active', 'sold', 'paused', 'draft'));

alter table public.products drop constraint if exists products_price_check;
alter table public.products add constraint products_price_check
  check ((status = 'draft' and price >= 0) or (status <> 'draft' and price > 0));

-- Borrador puede guardarse sin condición definida aún
alter table public.products alter column condition drop not null;

alter table public.products drop constraint if exists products_draft_condition_check;
alter table public.products add constraint products_draft_condition_check
  check (
    status <> 'draft'
    or condition is null
    or condition in ('nuevo', 'usado')
  );

create or replace function public.set_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row
  execute procedure public.set_products_updated_at();

drop policy if exists "products_select_own" on public.products;
create policy "products_select_own"
  on public.products for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "products_insert_own" on public.products;
create policy "products_insert_own"
  on public.products for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "products_update_own" on public.products;
create policy "products_update_own"
  on public.products for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "products_delete_own" on public.products;
create policy "products_delete_own"
  on public.products for delete to authenticated
  using (auth.uid() = user_id);

create index if not exists products_user_draft_updated_idx
  on public.products (user_id, updated_at desc)
  where status = 'draft';

notify pgrst, 'reload schema';
