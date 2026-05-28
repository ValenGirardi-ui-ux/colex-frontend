-- =============================================================================
-- Colex · dev-reset-data.sql
-- =============================================================================
--
-- ⚠️  SOLO DESARROLLO / TESTING — NUNCA en producción.
--
-- Objetivo: vaciar datos de prueba generados por usuarios, sin tocar cuentas
-- ni la estructura de la base.
--
-- NO MODIFICA:
--   • auth.users
--   • public.profiles  (email, premium, destacado, shop_slug, avatar_url, etc.)
--   • tablas, columnas, índices, RLS, policies, funciones ni triggers
--   • variables de entorno ni configuración del proyecto
--
-- ELIMINA TODAS LAS FILAS EN (si la tabla existe):
--   • public.messages
--   • public.conversations
--   • public.reviews
--   • public.orders
--   • public.favorites
--   • public.product_images      (FK → products; truncar antes o junto con products)
--   • public.products          (incluye borradores: status = 'draft')
--   • public.store_followers
--   • public.notifications
--   • public.user_addresses
--
-- STORAGE (opcional, comentado al final):
--   • Puede borrar imágenes huérfanas de publicaciones en bucket product-images
--   • Conserva avatar.* y banner.* usados por perfiles/tiendas premium
--
-- -----------------------------------------------------------------------------
-- Uso (Supabase → SQL Editor, o psql contra la DB de dev):
--
--   1. Abrí este archivo.
--   2. Cambiá v_enabled de false a true (bloque DO, ~línea 48).
--   3. Ejecutá todo el script.
--   4. Revisá los mensajes NOTICE: conteos finales deben ser 0.
--
-- Dry-run: dejá v_enabled en false → aborta sin cambiar datos.
--
-- Después del reset el frontend sigue funcionando: usuarios pueden iniciar
-- sesión, ver perfiles y volver a publicar desde cero.
-- =============================================================================

do $$
declare
  -- ⚠️ Cambiá a true SOLO en tu entorno local/staging de desarrollo.
  v_enabled constant boolean := false;

  v_tables constant text[] := array[
    'messages',
    'reviews',
    'favorites',
    'product_images',
    'conversations',
    'orders',
    'products',
    'store_followers',
    'notifications',
    'user_addresses'
  ];

  v_table text;
  v_count bigint;
  v_existing text[] := '{}';
  v_truncate_sql text;
begin
  if not v_enabled then
    raise exception using
      errcode = 'P0001',
      message = 'Reset abortado por seguridad.',
      hint = 'Editá supabase/dev-reset-data.sql y seteá v_enabled := true solo en dev/testing.';
  end if;

  raise notice '=== Colex dev reset — inicio ===';

  -- Recolectar tablas que existen (por si alguna migración aún no se aplicó).
  foreach v_table in array v_tables loop
    if to_regclass(format('public.%I', v_table)) is not null then
      v_existing := array_append(v_existing, v_table);
    else
      raise notice 'Omitida (no existe): public.%', v_table;
    end if;
  end loop;

  if coalesce(array_length(v_existing, 1), 0) = 0 then
    raise notice 'Nada que limpiar: ninguna tabla de datos de usuario encontrada.';
    return;
  end if;

  select string_agg(format('public.%I', t), ', ' order by t)
  into v_truncate_sql
  from unnest(v_existing) as t;

  -- TRUNCATE grupal (+ CASCADE): incluye hijos como product_images → products.
  -- CASCADE solo afecta tablas referenciadas por las listadas; no toca profiles
  -- ni auth.users porque no están en este grupo.
  execute format('truncate table %s restart identity cascade', v_truncate_sql);

  raise notice 'Tablas truncadas: %', array_to_string(v_existing, ', ');

  foreach v_table in array v_existing loop
    execute format('select count(*) from public.%I', v_table) into v_count;
    raise notice '  public.% → % filas', v_table, v_count;
  end loop;

  raise notice '=== Colex dev reset — listo ===';
end $$;

-- -----------------------------------------------------------------------------
-- OPCIONAL: limpiar imágenes de publicaciones en Storage
-- -----------------------------------------------------------------------------
-- El bucket product-images también guarda avatar.* y banner.* de perfiles.
-- NO descomentes el bloque siguiente si no querés tocar archivos de Storage.
-- Si lo usás, solo borra objetos que NO sean avatar ni banner.
--
-- delete from storage.objects
-- where bucket_id = 'product-images'
--   and not (name ~ '(^|/)avatar\.(jpe?g|png|webp|gif)$')
--   and not (name ~ '(^|/)banner\.(jpe?g|png|webp|gif)$');
--
-- -----------------------------------------------------------------------------
-- OPCIONAL: resetear flags de prueba en perfiles (desactivado por defecto)
-- -----------------------------------------------------------------------------
-- Si activaste premium/destacado solo para probar y querés volver a cero
-- SIN borrar cuentas, descomentá:
--
-- update public.profiles
-- set
--   is_premium = false,
--   is_featured = false,
--   shop_slug = null,
--   shop_banner_url = null,
--   shop_description = null,
--   shop_social_links = null
-- where true;
--
-- ⚠️ Eso SÍ modifica profiles; úsalo solo si lo necesitás explícitamente.

notify pgrst, 'reload schema';
