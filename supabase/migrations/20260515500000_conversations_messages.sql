-- Conversaciones y mensajes (misma definición que messages-setup.sql)

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  product_title text not null default '',
  buyer_id uuid not null references auth.users (id) on delete cascade,
  seller_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_buyer_seller_different check (buyer_id <> seller_id),
  constraint conversations_product_buyer_seller_unique unique (product_id, buyer_id, seller_id)
);

create index if not exists conversations_buyer_updated_idx
  on public.conversations (buyer_id, updated_at desc);

create index if not exists conversations_seller_updated_idx
  on public.conversations (seller_id, updated_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at asc);

create or replace function public.touch_conversation_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists messages_touch_conversation on public.messages;
create trigger messages_touch_conversation
  after insert on public.messages
  for each row
  execute procedure public.touch_conversation_on_message();

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

drop policy if exists "conversations_select_participant" on public.conversations;
drop policy if exists "conversations_insert_participant" on public.conversations;

create policy "conversations_select_participant"
  on public.conversations for select to authenticated
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "conversations_insert_participant"
  on public.conversations for insert to authenticated
  with check (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "messages_select_participant" on public.messages;
drop policy if exists "messages_insert_participant" on public.messages;

create policy "messages_select_participant"
  on public.messages for select to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create policy "messages_insert_participant"
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

drop policy if exists "profiles_select_chat_peer" on public.profiles;

create policy "profiles_select_chat_peer"
  on public.profiles for select to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
        and (c.buyer_id = profiles.id or c.seller_id = profiles.id)
    )
  );

notify pgrst, 'reload schema';
