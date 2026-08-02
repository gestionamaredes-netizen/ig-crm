-- Registro de cargas diarias por cuenta — módulo Cambio. Correr en Supabase
-- (zjetaihjddoxxvrpzwsb), editor VACÍO. Idempotente. Reusa es_admin_cambio()/mi_runner_id().

create table if not exists cargas (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid not null references companies(id) on delete cascade,
  fecha          date not null,
  runner_id      uuid references runners(id) on delete set null,
  origen         text not null default 'operativa',   -- operativa | bancaria
  source_id      uuid not null,
  titular        text not null default '',
  etiqueta       text not null default '',
  pesos_cargados numeric not null default 0,
  usd_comprados  numeric not null default 0,
  usd_retirados  numeric not null default 0,
  created_at     timestamptz not null default now()
);
create unique index if not exists cargas_cuenta_fecha_idx on cargas(company_id, origen, source_id, fecha);
create index if not exists cargas_fecha_idx on cargas(company_id, fecha);

alter table cargas enable row level security;
drop policy if exists "cargas_pol" on cargas;
create policy "cargas_pol" on cargas for all to authenticated
  using (es_admin_cambio() or runner_id = mi_runner_id())
  with check (es_admin_cambio() or runner_id = mi_runner_id());

-- El runner puede LEER sus cuentas bancarias asignadas (antes admin-only).
-- Sigue sin poder crearlas/editarlas (with check admin).
drop policy if exists "cambio_admin_cuentas" on cuentas;
drop policy if exists "cuentas_pol" on cuentas;
create policy "cuentas_pol" on cuentas for all to authenticated
  using (es_admin_cambio() or runner_id = mi_runner_id())
  with check (es_admin_cambio());

-- Verificación
select tablename, rowsecurity from pg_tables where tablename in ('cargas','cuentas');
