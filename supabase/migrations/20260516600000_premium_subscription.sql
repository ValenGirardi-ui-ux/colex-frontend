-- Suscripción Premium: ciclo mensual por aniversario y baja al fin del período.

alter table public.profiles add column if not exists premium_started_at timestamptz;
alter table public.profiles add column if not exists premium_current_period_end timestamptz;
alter table public.profiles add column if not exists premium_cancel_at_period_end boolean not null default false;
alter table public.profiles add column if not exists premium_last_payment_at timestamptz;
alter table public.profiles add column if not exists premium_payment_provider text;
alter table public.profiles add column if not exists premium_payment_ref text;

create index if not exists profiles_premium_billing_due_idx
  on public.profiles (premium_current_period_end)
  where is_premium = true and premium_current_period_end is not null;

notify pgrst, 'reload schema';
