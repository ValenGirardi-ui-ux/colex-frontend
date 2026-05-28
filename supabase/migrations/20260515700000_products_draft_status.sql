-- Borradores de publicaciones (status = draft). Publicado = active (visible en catálogo).

alter table public.products drop constraint if exists products_status_check;
alter table public.products add constraint products_status_check
  check (status in ('active', 'sold', 'paused', 'draft'));

alter table public.products drop constraint if exists products_price_check;
alter table public.products add constraint products_price_check
  check ((status = 'draft' and price >= 0) or (status <> 'draft' and price > 0));

-- El dueño puede leer sus borradores y publicaciones propias
drop policy if exists "products_select_own" on public.products;

create policy "products_select_own"
  on public.products for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "products_delete_own" on public.products;

create policy "products_delete_own"
  on public.products for delete to authenticated
  using (auth.uid() = user_id);

notify pgrst, 'reload schema';
