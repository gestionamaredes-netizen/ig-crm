-- Usuario y clave de acceso (home banking / app) por cuenta: en las cuentas
-- bancarias (sector Cuentas) y en las operativas de los celulares. Correr en
-- Supabase (zjetaihjddoxxvrpzwsb), editor VACÍO. Idempotente.

alter table cuentas        add column if not exists usuario text not null default '';
alter table cuentas        add column if not exists clave   text not null default '';
alter table phone_accounts add column if not exists usuario text not null default '';
alter table phone_accounts add column if not exists clave   text not null default '';

-- Verificación
select table_name, column_name from information_schema.columns
where column_name in ('usuario','clave') and table_name in ('cuentas','phone_accounts')
order by table_name, column_name;
