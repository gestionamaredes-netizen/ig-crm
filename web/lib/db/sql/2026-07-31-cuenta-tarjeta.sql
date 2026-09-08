-- Sello "TARJETA" en las cuentas bancarias (sector Cuentas). Marca las que se
-- manejan por tarjeta, sin celular. Correr en Supabase (zjetaihjddoxxvrpzwsb),
-- editor VACÍO. Idempotente.

alter table cuentas add column if not exists tarjeta boolean not null default false;

-- Verificación
select column_name, data_type from information_schema.columns
where table_name = 'cuentas' and column_name = 'tarjeta';
