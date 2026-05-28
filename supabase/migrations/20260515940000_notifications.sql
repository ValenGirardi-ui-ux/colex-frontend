-- Notificaciones in-app por usuario

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (
    type in ('purchase_interest', 'new_message', 'order_status')
  ),
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_at_idx
  on public.notifications (user_id, created_at desc);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, created_at desc)
  where read = false;

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
drop policy if exists "notifications_update_own" on public.notifications;

create policy "notifications_select_own"
  on public.notifications for select to authenticated
  using (auth.uid() = user_id);

create policy "notifications_update_own"
  on public.notifications for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Inserción vía RPC (el cliente no inserta filas ajenas directamente)
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

  if p_type not in ('purchase_interest', 'new_message', 'order_status') then
    raise exception 'invalid notification type';
  end if;

  insert into public.notifications (user_id, type, title, message)
  values (p_user_id, p_type, left(p_title, 200), left(p_message, 500))
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.create_notification(uuid, text, text, text) from public;
grant execute on function public.create_notification(uuid, text, text, text) to authenticated;

notify pgrst, 'reload schema';
