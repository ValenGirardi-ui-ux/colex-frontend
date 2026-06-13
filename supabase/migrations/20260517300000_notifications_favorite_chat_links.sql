-- Enlaces de chat para notificaciones de favorito (producto + usuario que marcó favorito)

alter table public.notifications
  add column if not exists related_product_id uuid references public.products (id) on delete set null;

alter table public.notifications
  add column if not exists actor_user_id uuid references auth.users (id) on delete set null;

drop function if exists public.create_notification(uuid, text, text, text);

create or replace function public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_related_product_id uuid default null,
  p_actor_user_id uuid default null
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

  if p_type not in ('purchase_interest', 'new_message', 'order_status', 'product_favorited') then
    raise exception 'invalid notification type';
  end if;

  insert into public.notifications (
    user_id,
    type,
    title,
    message,
    related_product_id,
    actor_user_id
  )
  values (
    p_user_id,
    p_type,
    left(p_title, 200),
    left(p_message, 500),
    p_related_product_id,
    p_actor_user_id
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.create_notification(uuid, text, text, text, uuid, uuid) from public;
grant execute on function public.create_notification(uuid, text, text, text, uuid, uuid) to authenticated;

notify pgrst, 'reload schema';
