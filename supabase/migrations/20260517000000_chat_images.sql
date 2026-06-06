-- Imágenes en chat: columnas en messages + bucket chat-images.

alter table public.messages add column if not exists image_url text;
alter table public.messages add column if not exists message_type text not null default 'text';

alter table public.messages drop constraint if exists messages_content_check;
alter table public.messages drop constraint if exists messages_type_check;
alter table public.messages drop constraint if exists messages_payload_check;

alter table public.messages alter column content set default '';

update public.messages
set message_type = 'text'
where message_type is null or message_type = '';

alter table public.messages
  add constraint messages_type_check check (message_type in ('text', 'image'));

alter table public.messages
  add constraint messages_payload_check check (
    (message_type = 'text' and char_length(trim(content)) > 0 and image_url is null)
    or (message_type = 'image' and image_url is not null and char_length(trim(image_url)) > 0)
  );

-- Storage: imágenes de chat (lectura pública por URL; subida solo participantes).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-images',
  'chat-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "chat_images_select_participant" on storage.objects;
drop policy if exists "chat_images_insert_participant" on storage.objects;
drop policy if exists "chat_images_update_participant" on storage.objects;
drop policy if exists "chat_images_delete_participant" on storage.objects;

create policy "chat_images_select_participant"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'chat-images'
    and exists (
      select 1
      from public.conversations c
      where c.id::text = (storage.foldername(name))[1]
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- Bucket público: lectura anónima para mostrar en <img> (rutas difíciles de adivinar).
drop policy if exists "chat_images_select_public" on storage.objects;
create policy "chat_images_select_public"
  on storage.objects for select
  to anon
  using (bucket_id = 'chat-images');

create policy "chat_images_insert_participant"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'chat-images'
    and (storage.foldername(name))[2] = auth.uid()::text
    and exists (
      select 1
      from public.conversations c
      where c.id::text = (storage.foldername(name))[1]
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create policy "chat_images_update_participant"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'chat-images'
    and (storage.foldername(name))[2] = auth.uid()::text
    and exists (
      select 1
      from public.conversations c
      where c.id::text = (storage.foldername(name))[1]
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create policy "chat_images_delete_participant"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'chat-images'
    and (storage.foldername(name))[2] = auth.uid()::text
    and exists (
      select 1
      from public.conversations c
      where c.id::text = (storage.foldername(name))[1]
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

notify pgrst, 'reload schema';
