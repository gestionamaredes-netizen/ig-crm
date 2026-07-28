-- Módulo Cobros: tablas + RLS + los dos clientes reales de la agencia.
-- Correr en el editor SQL de Supabase, con el editor VACÍO antes de pegar.
-- Idempotente: se puede correr más de una vez sin duplicar.

-- 1. Tablas -----------------------------------------------------------------

create table if not exists cobros_clientes (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  tipo       text not null default 'unico',   -- unico | mensual
  notas      text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists cobros (
  id         uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references cobros_clientes(id) on delete cascade,
  concepto   text not null default '',
  total      numeric not null default 0,      -- facturado
  fecha      date not null,
  created_at timestamptz not null default now()
);

create table if not exists cobros_costos (
  id        uuid primary key default gen_random_uuid(),
  cobro_id  uuid not null references cobros(id) on delete cascade,
  concepto  text not null default '',
  monto     numeric not null default 0
);

create table if not exists cobros_pagos (
  id         uuid primary key default gen_random_uuid(),
  cobro_id   uuid not null references cobros(id) on delete cascade,
  monto      numeric not null default 0,
  fecha      date not null,
  medio      text not null default '',         -- PREX | efectivo | transferencia | ...
  cuenta     text not null default '',         -- dónde cayó, ej. "Fabricio · PREX"
  created_at timestamptz not null default now()
);

create index if not exists cobros_cliente_idx on cobros(cliente_id);
create index if not exists cobros_costos_idx  on cobros_costos(cobro_id);
create index if not exists cobros_pagos_idx   on cobros_pagos(cobro_id);

-- 2. RLS (igual que el resto del CRM: acceso a usuarios autenticados) --------

alter table cobros_clientes enable row level security;
alter table cobros          enable row level security;
alter table cobros_costos   enable row level security;
alter table cobros_pagos    enable row level security;

drop policy if exists "auth_all_cobros_clientes" on cobros_clientes;
create policy "auth_all_cobros_clientes" on cobros_clientes for all to authenticated using (true) with check (true);
drop policy if exists "auth_all_cobros" on cobros;
create policy "auth_all_cobros" on cobros for all to authenticated using (true) with check (true);
drop policy if exists "auth_all_cobros_costos" on cobros_costos;
create policy "auth_all_cobros_costos" on cobros_costos for all to authenticated using (true) with check (true);
drop policy if exists "auth_all_cobros_pagos" on cobros_pagos;
create policy "auth_all_cobros_pagos" on cobros_pagos for all to authenticated using (true) with check (true);

-- 3. Los dos clientes reales ------------------------------------------------
-- OJO: la fecha va con hoy (2026-07-27) como marcador; cambiala por la real
-- desde la app cuando puedas. Los montos SÍ son los reales que pasaste.

-- BELLAVISTA CERRAMIENTOS: $100.000, sin costos, pagado por PREX a Fabricio.
insert into cobros_clientes (nombre, tipo, notas)
select 'BELLAVISTA CERRAMIENTOS', 'unico', ''
where not exists (select 1 from cobros_clientes where nombre = 'BELLAVISTA CERRAMIENTOS');

with cli as (select id from cobros_clientes where nombre = 'BELLAVISTA CERRAMIENTOS'),
     nuevo as (
       insert into cobros (cliente_id, concepto, total, fecha)
       select cli.id, 'Manual de marca, branding y optimización de Instagram', 100000, '2026-07-27'
       from cli
       where not exists (select 1 from cobros c where c.cliente_id = cli.id)
       returning id
     )
insert into cobros_pagos (cobro_id, monto, fecha, medio, cuenta)
select id, 100000, '2026-07-27', 'PREX', 'Fabricio Ortega · PREX' from nuevo;

-- UPGRADE DETAILING: mensual $350.000, costos filmaker $90.000 + viáticos $10.000.
insert into cobros_clientes (nombre, tipo, notas)
select 'UPGRADE DETAILING', 'mensual', ''
where not exists (select 1 from cobros_clientes where nombre = 'UPGRADE DETAILING');

with cli as (select id from cobros_clientes where nombre = 'UPGRADE DETAILING'),
     nuevo as (
       insert into cobros (cliente_id, concepto, total, fecha)
       select cli.id, 'Gestión mensual de redes — filmación, edición y posteos', 350000, '2026-07-27'
       from cli
       where not exists (select 1 from cobros c where c.cliente_id = cli.id)
       returning id
     )
insert into cobros_costos (cobro_id, concepto, monto)
select id, 'Jornada filmaker (2/semana)', 90000 from nuevo
union all
select id, 'Viáticos filmaker', 10000 from nuevo;

-- 4. Verificación -----------------------------------------------------------
select cl.nombre, cl.tipo, c.total,
       coalesce((select sum(monto) from cobros_costos where cobro_id = c.id), 0) as costos,
       coalesce((select sum(monto) from cobros_pagos  where cobro_id = c.id), 0) as pagado
from cobros_clientes cl
join cobros c on c.cliente_id = cl.id
order by cl.nombre;
