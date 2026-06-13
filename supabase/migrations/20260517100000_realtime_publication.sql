-- Habilitar Supabase Realtime en tablas usadas por la app (sin cambiar esquema de datos).

do $$
declare
  t text;
  tables text[] := array[
    'messages',
    'conversations',
    'notifications',
    'orders',
    'favorites',
    'products'
  ];
begin
  foreach t in array tables loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

notify pgrst, 'reload schema';
