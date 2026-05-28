-- Ejecutar en Supabase si /perfil/[id] no carga datos del vendedor (RLS).
-- Permite leer perfiles a usuarios anónimos y autenticados; solo el dueño puede editar.

drop policy if exists "profiles_select_public" on public.profiles;

create policy "profiles_select_public"
  on public.profiles for select
  to authenticated, anon
  using (true);

notify pgrst, 'reload schema';
