-- Buckets separados para avatares/logos y banners de tienda (no product-images).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'shop-banners',
  'shop-banners',
  true,
  6291456,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Avatares: lectura pública, escritura solo en la carpeta del usuario autenticado.
drop policy if exists "avatars_select_public" on storage.objects;
drop policy if exists "avatars_insert_own" on storage.objects;
drop policy if exists "avatars_update_own" on storage.objects;
drop policy if exists "avatars_delete_own" on storage.objects;

create policy "avatars_select_public"
  on storage.objects for select
  to authenticated, anon
  using (bucket_id = 'avatars');

create policy "avatars_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Banners de tienda: lectura pública; escritura solo usuarios premium en su carpeta.
drop policy if exists "shop_banners_select_public" on storage.objects;
drop policy if exists "shop_banners_insert_premium_own" on storage.objects;
drop policy if exists "shop_banners_update_premium_own" on storage.objects;
drop policy if exists "shop_banners_delete_premium_own" on storage.objects;

create policy "shop_banners_select_public"
  on storage.objects for select
  to authenticated, anon
  using (bucket_id = 'shop-banners');

create policy "shop_banners_insert_premium_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'shop-banners'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.is_premium = true
    )
  );

create policy "shop_banners_update_premium_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'shop-banners'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.is_premium = true
    )
  )
  with check (
    bucket_id = 'shop-banners'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.is_premium = true
    )
  );

create policy "shop_banners_delete_premium_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'shop-banners'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.is_premium = true
    )
  );

notify pgrst, 'reload schema';
