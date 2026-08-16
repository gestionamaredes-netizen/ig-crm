-- Campo "banco" en las cuentas bancarias: una misma persona puede tener varias
-- cuentas (una por banco: Bru, Galicia, etc.), con el mismo titular/DNI y
-- distinto CBU/login. Correr en Supabase (zjetaihjddoxxvrpzwsb), editor VACÍO.
-- Idempotente.

alter table cuentas add column if not exists banco text not null default '';

-- Verificación
select column_name from information_schema.columns
where table_name = 'cuentas' and column_name = 'banco';
