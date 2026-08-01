-- Runner a cargo de cada cuenta bancaria (sector Cuentas). Opcional: null =
-- cuenta general sin runner. Correr en Supabase (zjetaihjddoxxvrpzwsb),
-- editor VACÍO. Idempotente.

alter table cuentas add column if not exists runner_id uuid references runners(id) on delete set null;
create index if not exists cuentas_runner_idx on cuentas(runner_id);

-- Verificación
select column_name, data_type from information_schema.columns
where table_name = 'cuentas' and column_name = 'runner_id';
