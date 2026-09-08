-- Orden del Día + Auditoría de cargas. Correr en Supabase (zjetaihjddoxxvrpzwsb),
-- editor VACÍO. Idempotente. Requiere: es_admin_cambio() y mi_runner_id() (2026-07-30-accesos-runner.sql).

-- 1. Orden del Día: reporte diario de cuentas disponibles con datos
create table if not exists orden_del_dia (
  id                 uuid primary key default gen_random_uuid(),
  company_id         uuid not null references companies(id) on delete cascade,
  fecha              date not null,
  cuenta_id          uuid not null references cuentas(id) on delete cascade,
  runner_id          uuid references runners(id) on delete set null,
  pesos_cargados     numeric not null default 0,
  usd_comprados      numeric not null default 0,
  alias_pesos        text not null default '',
  alias_dolares      text not null default '',
  dni                text not null default '',
  pin                text not null default '',
  created_at         timestamptz not null default now()
);
create unique index if not exists orden_del_dia_cuenta_fecha_idx
  on orden_del_dia(company_id, cuenta_id, fecha);
create index if not exists orden_del_dia_fecha_idx on orden_del_dia(company_id, fecha);
create index if not exists orden_del_dia_runner_idx on orden_del_dia(company_id, runner_id);

-- 2. Auditoría de cargas de cuentas: quién cargó qué, cuándo
create table if not exists carga_cuentas_auditoria (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references companies(id) on delete cascade,
  fecha           date not null,
  runner_id       uuid references runners(id) on delete set null,
  cuenta_id       uuid references cuentas(id) on delete set null,
  pesos_cargados  numeric not null default 0,
  usd_comprados   numeric not null default 0,
  accion          text not null check (accion in ('crear','actualizar','eliminar')),
  datos_anteriores jsonb not null default '{}',
  datos_nuevos    jsonb not null default '{}',
  created_at      timestamptz not null default now()
);
create index if not exists carga_cuentas_auditoria_fecha_idx
  on carga_cuentas_auditoria(company_id, fecha);
create index if not exists carga_cuentas_auditoria_runner_idx
  on carga_cuentas_auditoria(company_id, runner_id);

-- 3. RLS: admin ve todo; runner ve solo sus registros
alter table orden_del_dia enable row level security;
alter table carga_cuentas_auditoria enable row level security;

drop policy if exists "orden_del_dia_pol" on orden_del_dia;
create policy "orden_del_dia_pol" on orden_del_dia for all to authenticated
  using (es_admin_cambio() or runner_id = mi_runner_id())
  with check (es_admin_cambio() or runner_id = mi_runner_id());

drop policy if exists "carga_cuentas_auditoria_pol" on carga_cuentas_auditoria;
create policy "carga_cuentas_auditoria_pol" on carga_cuentas_auditoria
  for all to authenticated using (es_admin_cambio() or runner_id = mi_runner_id())
  with check (es_admin_cambio());

-- 4. Verificación
select tablename, rowsecurity from pg_tables
where tablename in ('orden_del_dia','carga_cuentas_auditoria');
