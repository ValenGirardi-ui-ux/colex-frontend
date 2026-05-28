-- Tipo de conversación: consulta previa (chat) vs compra confirmada (sale).

alter table public.conversations
  add column if not exists conversation_type text not null default 'chat';

alter table public.conversations
  drop constraint if exists conversations_conversation_type_check;

alter table public.conversations
  add constraint conversations_conversation_type_check
  check (conversation_type in ('chat', 'sale'));

create index if not exists conversations_type_updated_idx
  on public.conversations (conversation_type, updated_at desc);

drop policy if exists "conversations_update_participant" on public.conversations;

create policy "conversations_update_participant"
  on public.conversations for update to authenticated
  using (auth.uid() = buyer_id or auth.uid() = seller_id)
  with check (auth.uid() = buyer_id or auth.uid() = seller_id);

notify pgrst, 'reload schema';
