-- Canje entre formas: recibir una forma, entregar otra. 4 columnas nuevas en
-- exchange_ops (solo se usan cuando kind='canje'). Correr en Supabase
-- (zjetaihjddoxxvrpzwsb), editor VACÍO. Idempotente.

alter table exchange_ops add column if not exists canje_in_account  uuid references exchange_accounts(id) on delete set null;
alter table exchange_ops add column if not exists canje_in_amount   numeric not null default 0;
alter table exchange_ops add column if not exists canje_out_account uuid references exchange_accounts(id) on delete set null;
alter table exchange_ops add column if not exists canje_out_amount  numeric not null default 0;

-- Verificación:
select column_name from information_schema.columns
where table_name = 'exchange_ops' and column_name like 'canje_%' order by column_name;
