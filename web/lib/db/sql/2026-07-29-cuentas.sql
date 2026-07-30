-- Sector Cuentas. Correr en Supabase (zjetaihjddoxxvrpzwsb), editor VACÍO. Idempotente.
create table if not exists cuentas (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id) on delete cascade,
  titular       text not null default '',
  dni           text not null default '',
  cbu_pesos     text not null default '',
  alias_pesos   text not null default '',
  cbu_dolares   text not null default '',
  alias_dolares text not null default '',
  notes         text not null default '',
  created_at    timestamptz not null default now()
);
create index if not exists cuentas_company_idx on cuentas(company_id);

alter table cuentas enable row level security;
drop policy if exists "auth_all_cuentas" on cuentas;
create policy "auth_all_cuentas" on cuentas for all to authenticated using (true) with check (true);

-- Verificación:
select tablename, rowsecurity from pg_tables where tablename = 'cuentas';
