-- Notificación cuando alguien marca una publicación como favorita

alter table public.notifications drop constraint if exists notifications_type_check;

alter table public.notifications add constraint notifications_type_check check (
  type in ('purchase_interest', 'new_message', 'order_status', 'product_favorited')
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

  if p_type not in ('purchase_interest', 'new_message', 'order_status', 'product_favorited') then
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
