-- Runners (gestiones y pagos) — módulo Cambio
-- Correr en el editor SQL de Supabase (proyecto zjetaihjddoxxvrpzwsb), editor
-- VACÍO antes de pegar. Idempotente.

-- 1. Runners (personas de logística)
create table if not exists runners (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name       text not null,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index if not exists runners_name_idx on runners(company_id, lower(name));

-- 2. Cuentas de gestión (con el pago al runner por gestión, en pesos)
create table if not exists runner_accounts (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name       text not null,
  currency   text not null,               -- ARS | USD (lo que se mueve)
  fee        numeric not null default 0,  -- pago al runner por gestión, en pesos
  active     boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index if not exists runner_accounts_name_idx on runner_accounts(company_id, lower(name));

-- 3. Gestiones (cada retiro/transferencia que hace un runner)
create table if not exists runner_gestiones (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references companies(id) on delete cascade,
  gestion_date date not null,
  runner_id    uuid not null references runners(id) on delete restrict,
  account_id   uuid not null references runner_accounts(id) on delete restrict,
  kind         text not null,               -- retiro | transferencia
  amount       numeric not null default 0,  -- monto movido, solo informativo
  fee          numeric not null default 0,  -- pago de esta gestión, en pesos
  notes        text not null default '',
  created_at   timestamptz not null default now()
);
create index if not exists runner_gestiones_runner_idx on runner_gestiones(company_id, runner_id);
create index if not exists runner_gestiones_date_idx on runner_gestiones(company_id, gestion_date);

-- 4. Pagos a runners (aparte: bajan el saldo)
create table if not exists runner_payments (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references companies(id) on delete cascade,
  payment_date date not null,
  runner_id    uuid not null references runners(id) on delete restrict,
  amount       numeric not null default 0,  -- pesos
  notes        text not null default '',
  created_at   timestamptz not null default now()
);
create index if not exists runner_payments_runner_idx on runner_payments(company_id, runner_id);

-- 5. RLS (misma plantilla que el resto del cambio)
alter table runners          enable row level security;
alter table runner_accounts  enable row level security;
alter table runner_gestiones enable row level security;
alter table runner_payments  enable row level security;

drop policy if exists "auth_all_runners" on runners;
create policy "auth_all_runners" on runners for all to authenticated using (true) with check (true);
drop policy if exists "auth_all_runner_accounts" on runner_accounts;
create policy "auth_all_runner_accounts" on runner_accounts for all to authenticated using (true) with check (true);
drop policy if exists "auth_all_runner_gestiones" on runner_gestiones;
create policy "auth_all_runner_gestiones" on runner_gestiones for all to authenticated using (true) with check (true);
drop policy if exists "auth_all_runner_payments" on runner_payments;
create policy "auth_all_runner_payments" on runner_payments for all to authenticated using (true) with check (true);

-- 6. Runners iniciales de Gestiones MA
insert into runners (company_id, name)
select c.id, v.name
from companies c
cross join (values ('Owen'), ('Zurdo'), ('Capi')) as v(name)
where c.name ilike '%gestiones%ma%'
on conflict do nothing;

-- 7. Verificación
-- Tiene que devolver 3 filas: Owen, Zurdo, Capi.
select r.name from runners r join companies c on c.id = r.company_id
where c.name ilike '%gestiones%ma%' order by r.name;
-- Las cuatro tablas con RLS activo.
select tablename, rowsecurity from pg_tables
where tablename in ('runners','runner_accounts','runner_gestiones','runner_payments');
