-- Módulo Cambio USD — esquema, RLS y datos iniciales
-- Correr en el editor SQL de Supabase, con el editor VACÍO antes de pegar.
-- Es idempotente: se puede correr varias veces sin duplicar nada.

-- ---------------------------------------------------------------
-- 1. Clientes del negocio de cambio
-- ---------------------------------------------------------------
-- Es la CUENTA COMERCIAL: a quien se le atribuye volumen y margen. No se
-- confunde con emisor/receptor, que son texto libre en exchange_ops porque
-- un cliente tiene varios y muchos aparecen una sola vez.

create table if not exists exchange_clients (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name       text not null,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists exchange_clients_name_idx
  on exchange_clients(company_id, lower(name));

-- ---------------------------------------------------------------
-- 2. Cajas (dónde está la plata)
-- ---------------------------------------------------------------
-- adjustment existe para cuando el conteo físico no coincide: la diferencia
-- se registra ahí en vez de alterar operaciones ya cargadas, y queda visible
-- en la UI en lugar de quedar tapada dentro de una operación mal cargada.

create table if not exists exchange_accounts (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references companies(id) on delete cascade,
  name            text not null,
  currency        text not null,                 -- ARS | USD
  opening_balance numeric not null default 0,
  adjustment      numeric not null default 0,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

create unique index if not exists exchange_accounts_name_idx
  on exchange_accounts(company_id, lower(name));

-- ---------------------------------------------------------------
-- 3. Operaciones
-- ---------------------------------------------------------------
-- amount + amount_currency + rate son la ÚNICA fuente de verdad de los
-- importes. Los USD y los pesos se derivan (ver lib/cambio/calculo.ts):
-- guardar los tres permitiría estados contradictorios entre sí.

create table if not exists exchange_ops (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references companies(id) on delete cascade,
  op_date         date not null,
  kind            text not null,                 -- compra | venta
  client_id       uuid references exchange_clients(id) on delete set null,
  sender          text not null default '',      -- quien envía los fondos
  receiver        text not null default '',      -- quien los recibe
  amount          numeric not null,              -- UN solo importe, el que el usuario conoce
  amount_currency text not null,                 -- ARS | USD — en qué moneda está amount
  rate            numeric not null,              -- pesos por dólar
  ars_account_id  uuid references exchange_accounts(id) on delete set null,
  usd_account_id  uuid references exchange_accounts(id) on delete set null,
  fees            numeric not null default 0,
  notes           text not null default '',
  created_at      timestamptz not null default now()
);

-- El cálculo del costo promedio recorre las operaciones ordenadas por fecha,
-- con created_at como desempate estable dentro del mismo día.
create index if not exists exchange_ops_date_idx on exchange_ops(op_date, created_at);
create index if not exists exchange_ops_client_idx on exchange_ops(client_id);

-- ---------------------------------------------------------------
-- 4. RLS — misma plantilla que expenses y las tablas de pautas
-- ---------------------------------------------------------------

alter table exchange_clients  enable row level security;
alter table exchange_accounts enable row level security;
alter table exchange_ops      enable row level security;

drop policy if exists "auth_all_exchange_clients" on exchange_clients;
create policy "auth_all_exchange_clients" on exchange_clients
  for all to authenticated using (true) with check (true);

drop policy if exists "auth_all_exchange_accounts" on exchange_accounts;
create policy "auth_all_exchange_accounts" on exchange_accounts
  for all to authenticated using (true) with check (true);

drop policy if exists "auth_all_exchange_ops" on exchange_ops;
create policy "auth_all_exchange_ops" on exchange_ops
  for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------
-- 5. Cajas iniciales de GESTIONES MA
-- ---------------------------------------------------------------
-- Los nombres son los que ya usaba la planilla. El usuario los renombra
-- después desde la base si sus cuentas se llaman distinto.

insert into exchange_accounts (company_id, name, currency)
select c.id, v.name, v.currency
from companies c
cross join (values
  ('Pesos Físico',  'ARS'),
  ('Pesos Digital', 'ARS'),
  ('USD Físico',    'USD'),
  ('USD Digital',   'USD'),
  ('USDT',          'USD')
) as v(name, currency)
where c.name ilike '%gestiones%ma%'
on conflict do nothing;

-- ---------------------------------------------------------------
-- 6. Verificación — correr y mirar el resultado
-- ---------------------------------------------------------------

-- Tiene que devolver EXACTAMENTE una fila. Si devuelve cero, el insert de
-- cajas de arriba no hizo nada y hay que ajustar el ilike al nombre real.
select id, name from companies where name ilike '%gestiones%ma%';

-- Tiene que devolver 5 filas: 2 en ARS y 3 en USD.
select a.name, a.currency
from exchange_accounts a
join companies c on c.id = a.company_id
where c.name ilike '%gestiones%ma%'
order by a.currency, a.name;

-- Las tres tablas con RLS activo (rowsecurity = true en las tres).
select tablename, rowsecurity from pg_tables
where tablename in ('exchange_clients','exchange_accounts','exchange_ops');
