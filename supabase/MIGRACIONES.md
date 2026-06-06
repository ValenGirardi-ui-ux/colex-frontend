# Migraciones Colex (Supabase)

Ejecutá en **Supabase → SQL Editor** en este orden. Si un archivo ya se aplicó, Postgres suele ignorar `create table if not exists` / `add column if not exists` sin romper.

## Antes de las migraciones (proyecto nuevo)

Si la base está vacía, corré primero los setups base (una sola vez):

1. `supabase/profiles-setup.sql` — tabla `profiles`
2. `supabase/products-setup.sql` — tabla `products` + bucket imágenes

Sin `products`, la migración de **favoritos** falla por la foreign key.

## Orden de migraciones (`supabase/migrations/`)

| # | Archivo | Qué agrega |
|---|---------|------------|
| 1 | `20260515000000_profiles_editable_columns.sql` | Columnas editables en `profiles` |
| 2 | `20260515100000_favorites.sql` | Tabla **`favorites`** |
| 3 | `20260515200000_products_delivery_envio_domicilio.sql` | Envío a domicilio en `products` |
| 4 | `20260515300000_orders.sql` | Tabla `orders` |
| 5 | `20260515400000_orders_shipping_location.sql` | Campos envío en `orders` |
| 6 | `20260515500000_conversations_messages.sql` | `conversations` + `messages` |
| 7 | `20260515600000_profiles_public_read.sql` | Lectura pública de perfiles |
| 8 | `20260515700000_products_draft_status.sql` | Estado `draft` en productos |
| 9 | `20260515800000_user_addresses.sql` | `user_addresses` |
| 10 | `20260515900000_conversation_type.sql` | Tipo chat/venta en conversaciones |
| 11 | `20260515910000_products_drafts_complete.sql` | Borradores completos |
| 12 | `20260515920000_user_addresses_edit_fields.sql` | Campos extra direcciones |
| 13 | `20260515930000_order_status_states.sql` | Estados de orden |
| 14 | `20260515940000_notifications.sql` | `notifications` + RPC |
| 15 | `20260516100000_profiles_premium_featured.sql` | `is_premium`, `is_featured` |
| 16 | `20260516200000_profiles_business_fields.sql` | Campos negocio en `profiles` |
| 17 | `20260516300000_reviews.sql` | `reviews` |
| 18 | `20260516400000_profiles_premium_shop.sql` | Tienda premium (`shop_slug`, etc.) |
| 19 | `20260516500000_store_followers.sql` | Seguir tiendas + RPC contador |
| 20 | `20260516600000_premium_subscription.sql` | Cobro mensual, baja Premium, fechas de período |
| 21 | `20260516700000_product_reports.sql` | Reportes de publicaciones (panel admin) |

## Favoritos (error actual)

Si ves:

`Could not find the table 'public.favorites' in the schema cache`

→ Ejecutá **`20260515100000_favorites.sql`** (fila #2 de la tabla).

## Admin / sesión en servidor

Después de actualizar el código con middleware + cookies:

1. **Cerrá sesión** (o borrá cookies del sitio).
2. Volvé a **iniciar sesión** en `/login`.
3. Entrá a `/admin` o `/login?next=/admin`.

La sesión vieja en `localStorage` no se migra sola; hace falta un login nuevo para escribir cookies.

## Reset solo datos de prueba (no borra usuarios)

`supabase/dev-reset-data.sql` — ver instrucciones dentro del archivo (`v_enabled := true` solo en dev).
