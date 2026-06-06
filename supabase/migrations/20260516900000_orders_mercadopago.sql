-- Metadatos de pago Mercado Pago en órdenes (confirmación vía webhook).

alter table public.orders add column if not exists mp_preference_id text;
alter table public.orders add column if not exists mp_payment_id text;

create index if not exists orders_mp_payment_id_idx
  on public.orders (mp_payment_id)
  where mp_payment_id is not null;

notify pgrst, 'reload schema';
