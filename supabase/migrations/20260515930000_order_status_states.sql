-- Estados de compra/venta en español

alter table public.orders drop constraint if exists orders_status_check;

update public.orders
set status = case status
  when 'pending' then 'pendiente'
  when 'completed' then 'pagado'
  when 'cancelled' then 'cancelado'
  else status
end
where status in ('pending', 'completed', 'cancelled');

alter table public.orders
  alter column status set default 'pendiente';

alter table public.orders
  add constraint orders_status_check check (
    status in (
      'pendiente',
      'coordinando',
      'pagado',
      'enviado',
      'entregado',
      'cancelado'
    )
  );

create index if not exists orders_seller_id_created_at_idx
  on public.orders (seller_id, created_at desc)
  where seller_id is not null;

drop policy if exists "orders_select_own" on public.orders;
drop policy if exists "orders_update_seller" on public.orders;
drop policy if exists "orders_update_buyer_pay" on public.orders;

create policy "orders_select_participant"
  on public.orders for select to authenticated
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "orders_update_seller"
  on public.orders for update to authenticated
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

create policy "orders_update_buyer_pay"
  on public.orders for update to authenticated
  using (auth.uid() = buyer_id and status = 'pendiente')
  with check (auth.uid() = buyer_id and status = 'pagado');

notify pgrst, 'reload schema';
