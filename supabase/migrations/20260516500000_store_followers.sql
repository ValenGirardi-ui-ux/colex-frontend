-- Seguir tiendas / negocios premium

create table if not exists public.store_followers (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users (id) on delete cascade,
  store_user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint store_followers_no_self check (follower_id <> store_user_id),
  unique (follower_id, store_user_id)
);

create index if not exists store_followers_follower_created_idx
  on public.store_followers (follower_id, created_at desc);

create index if not exists store_followers_store_user_id_idx
  on public.store_followers (store_user_id);

alter table public.store_followers enable row level security;

drop policy if exists "store_followers_select_own" on public.store_followers;
drop policy if exists "store_followers_insert_own" on public.store_followers;
drop policy if exists "store_followers_delete_own" on public.store_followers;

-- El usuario ve sus propios follows (lista "Tiendas que seguís")
create policy "store_followers_select_own"
  on public.store_followers for select to authenticated
  using (auth.uid() = follower_id);

create policy "store_followers_insert_own"
  on public.store_followers for insert to authenticated
  with check (
    auth.uid() = follower_id
    and follower_id <> store_user_id
    and exists (
      select 1
      from public.profiles p
      where p.id = store_user_id
        and p.is_premium = true
    )
  );

create policy "store_followers_delete_own"
  on public.store_followers for delete to authenticated
  using (auth.uid() = follower_id);

-- Conteo público sin filtrar filas en el cliente
create or replace function public.store_follower_count(p_store_user_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.store_followers
  where store_user_id = p_store_user_id;
$$;

revoke all on function public.store_follower_count(uuid) from public;
grant execute on function public.store_follower_count(uuid) to anon, authenticated;

create or replace function public.is_following_store(p_store_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.store_followers
    where store_user_id = p_store_user_id
      and follower_id = auth.uid()
  );
$$;

revoke all on function public.is_following_store(uuid) from public;
grant execute on function public.is_following_store(uuid) to authenticated;

-- Base para notificaciones futuras (ej. "Ferniplast publicó nuevos productos")
alter table public.notifications drop constraint if exists notifications_type_check;

alter table public.notifications add constraint notifications_type_check check (
  type in (
    'purchase_interest',
    'new_message',
    'order_status',
    'store_new_products'
  )
);

create or replace function public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if p_type not in (
    'purchase_interest',
    'new_message',
    'order_status',
    'store_new_products'
  ) then
    raise exception 'invalid notification type';
  end if;

  insert into public.notifications (user_id, type, title, message)
  values (p_user_id, p_type, left(p_title, 200), left(p_message, 500))
  returning id into v_id;

  return v_id;
end;
$$;

notify pgrst, 'reload schema';
