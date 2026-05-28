-- Calificaciones mutuas comprador ↔ vendedor tras compra entregada.

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  reviewer_id uuid not null references auth.users (id) on delete cascade,
  reviewed_user_id uuid not null references auth.users (id) on delete cascade,
  rating smallint not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  constraint reviews_one_per_order_reviewer unique (order_id, reviewer_id),
  constraint reviews_no_self check (reviewer_id <> reviewed_user_id)
);

create index if not exists reviews_reviewed_user_id_created_at_idx
  on public.reviews (reviewed_user_id, created_at desc);

create index if not exists reviews_order_id_idx on public.reviews (order_id);

alter table public.reviews enable row level security;

drop policy if exists "reviews_select_public" on public.reviews;
drop policy if exists "reviews_insert_participant" on public.reviews;

create policy "reviews_select_public"
  on public.reviews for select
  using (true);

create policy "reviews_insert_participant"
  on public.reviews for insert to authenticated
  with check (
    auth.uid() = reviewer_id
    and exists (
      select 1
      from public.orders o
      where o.id = order_id
        and o.status = 'entregado'
        and (
          (o.buyer_id = auth.uid() and o.seller_id = reviewed_user_id)
          or (o.seller_id = auth.uid() and o.buyer_id = reviewed_user_id)
        )
    )
  );

notify pgrst, 'reload schema';
