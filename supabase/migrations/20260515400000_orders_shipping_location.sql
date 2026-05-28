-- Ubicación del comprador y distancia de envío en órdenes (opcional, compatible con filas previas)

alter table public.orders add column if not exists buyer_location_label text;
alter table public.orders add column if not exists shipping_distance_km integer;

notify pgrst, 'reload schema';
