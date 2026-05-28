-- Campos estructurados para edición de direcciones (calle, número, referencias).

alter table public.user_addresses add column if not exists street text;
alter table public.user_addresses add column if not exists street_number text;
alter table public.user_addresses add column if not exists address_notes text;

update public.user_addresses
set street = line1
where street is null or trim(street) = '';

drop policy if exists "user_addresses_update_own" on public.user_addresses;
create policy "user_addresses_update_own"
  on public.user_addresses for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

notify pgrst, 'reload schema';
