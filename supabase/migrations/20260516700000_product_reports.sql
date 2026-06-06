-- Reportes de publicaciones (panel admin).

create table if not exists public.product_reports (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  product_title text not null,
  reporter_id uuid references auth.users (id) on delete set null,
  reporter_email text,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'reviewed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists product_reports_status_created_idx
  on public.product_reports (status, created_at desc);

create index if not exists product_reports_product_id_idx
  on public.product_reports (product_id);

alter table public.product_reports enable row level security;

notify pgrst, 'reload schema';
