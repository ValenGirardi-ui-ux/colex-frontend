-- Datos del negocio para carrusel "Negocios destacados" (usuarios premium/featured).

alter table public.profiles add column if not exists business_name text;
alter table public.profiles add column if not exists business_description text;

notify pgrst, 'reload schema';
