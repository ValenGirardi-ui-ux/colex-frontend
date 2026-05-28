-- Ampliar métodos de entrega: envío a domicilio por Colex

alter table public.products drop constraint if exists products_delivery_method_check;

alter table public.products
  add constraint products_delivery_method_check
  check (
    delivery_method is null
    or delivery_method in ('retiro', 'envio', 'envio_domicilio', 'ambos')
  );
