-- Lectura pública de perfiles (ficha de vendedor, /perfil/[id]).
-- La escritura sigue limitada al dueño (profiles_insert_own / profiles_update_own).

drop policy if exists "profiles_select_public" on public.profiles;

create policy "profiles_select_public"
  on public.profiles for select
  to authenticated, anon
  using (true);

notify pgrst, 'reload schema';
