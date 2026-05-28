-- Solo lectura de publicaciones activas.
-- Para publicar desde Vender usá el script completo: supabase/products-setup.sql

alter table public.products enable row level security;

drop policy if exists "products_select_active" on public.products;

create policy "products_select_active"
  on public.products for select
  to authenticated, anon
  using (status = 'active');

notify pgrst, 'reload schema';
