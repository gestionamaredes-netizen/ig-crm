-- Módulo de Gastos — esquema, RLS y datos iniciales
-- Correr en el editor SQL de Supabase (proyecto zjetaihjddoxxvrpzwsb).
-- Es idempotente: se puede correr varias veces sin duplicar nada.

-- ---------------------------------------------------------------
-- 1. Tabla
-- ---------------------------------------------------------------

create table if not exists expenses (
  id           uuid primary key default gen_random_uuid(),
  -- null = gasto de la agencia (Iniciativa Global), no imputable a una empresa cliente
  company_id   uuid references companies(id) on delete cascade,
  category     text not null,                    -- dominio | hosting | herramienta | merch | servicio | otro
  concept      text not null,
  vendor       text not null default '',
  external_ref text not null default '',
  amount       numeric not null,                 -- TOTAL pagado, no unitario
  quantity     integer not null default 1,
  currency     text not null default 'ARS',
  paid_at      date,                             -- null = pendiente de pago
  renews_at    date,                             -- null = gasto único
  period       text not null default 'unico',    -- unico | mensual | anual
  source       text not null default 'manual',   -- manual | meta | google
  external_id  text not null default '',
  notes        text not null default '',
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- 2. Índices (el módulo filtra por empresa y ordena por vencimiento)
-- ---------------------------------------------------------------

create index if not exists expenses_company_idx on expenses(company_id);
create index if not exists expenses_renews_idx  on expenses(renews_at);

-- Evita duplicar un gasto si este script se corre dos veces. La referencia de
-- Donweb (#6138993) es única por ítem; los gastos sin referencia se controlan
-- por concepto en los inserts de más abajo.
create unique index if not exists expenses_ref_idx
  on expenses(external_ref) where external_ref <> '';

-- ---------------------------------------------------------------
-- 3. RLS — igual que las tablas de pautas
-- ---------------------------------------------------------------

alter table expenses enable row level security;

drop policy if exists "auth_all_expenses" on expenses;
create policy "auth_all_expenses" on expenses
  for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------
-- 4. Dominios de Donweb — pagados el 05/07/2026, renuevan el 05/07/2027
-- ---------------------------------------------------------------

insert into expenses (company_id, category, concept, vendor, external_ref, amount, paid_at, renews_at, period)
select c.id, 'dominio', d.concept, 'Donweb', d.ref, d.amount, date '2026-07-05', date '2027-07-05', 'anual'
from (values
  ('nypro',        'nyproimports.com.ar',  '#6138993', 27000),
  ('nypro',        'nyproimports.com',     '#6138996', 44000),
  ('nypro',        'nyproimports.online',  '#6138999', 52580),
  ('nypro',        'nyproimports.store',   '#6139002', 63320),
  ('gestiones',    'gestionesma.com',      '#6139499', 44000),
  ('gestiones',    'gestionesma.com.ar',   '#6139502', 27000),
  ('gestiones',    'gestionesma.online',   '#6139505', 52580),
  ('gestiones',    'gestionesma.store',    '#6139508', 63320),
  ('premoldeados', 'premoldeadosma.com',   '#6139543', 44000)
) as d(slug, concept, ref, amount)
join companies c on c.slug = d.slug
on conflict do nothing;

-- ---------------------------------------------------------------
-- 5. Hosting — todavía NO pagado, vence el 05/08/2026
-- ---------------------------------------------------------------

-- company_id queda en null hasta confirmar a qué empresa se imputa: el panel
-- de Donweb no lo discrimina y adivinarlo ensuciaría los totales por empresa.
insert into expenses (company_id, category, concept, vendor, external_ref, amount, paid_at, renews_at, period, notes)
values (null, 'hosting', 'Web Hosting Plan Empresa', 'Donweb', '#6139713', 20000,
        null, date '2026-08-05', 'mensual', 'Falta confirmar a qué empresa se imputa')
on conflict do nothing;

-- ---------------------------------------------------------------
-- 6. Merch de la agencia — company_id null
-- ---------------------------------------------------------------

insert into expenses (company_id, category, concept, amount, quantity, paid_at, period, notes)
select null, 'merch', m.concept, m.amount, m.qty, date '2026-07-22', 'unico', 'Falta confirmar proveedor'
from (values
  ('Chombas bordadas IG', 102000, 3),
  ('Buzos bordados IG',   135000, 3)
) as m(concept, amount, qty)
where not exists (select 1 from expenses e where e.concept = m.concept);

-- ---------------------------------------------------------------
-- 7. Verificación
-- ---------------------------------------------------------------

select coalesce(c.name, 'Iniciativa Global') as empresa,
       e.category, e.concept, e.quantity, e.amount, e.paid_at, e.renews_at
from expenses e
left join companies c on c.id = e.company_id
order by e.category, e.concept;

-- Totales esperados: 654.800 pagado (417.800 dominios + 237.000 merch), 20.000 pendiente (hosting).
select sum(amount) filter (where paid_at is not null) as pagado,
       sum(amount) filter (where paid_at is null)     as pendiente
from expenses;
