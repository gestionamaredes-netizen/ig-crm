-- Comprobante opcional por operación — columna + Storage + RLS
-- Correr en el editor SQL de Supabase (proyecto zjetaihjddoxxvrpzwsb),
-- con el editor VACÍO antes de pegar. Es idempotente.

-- 1. Columna en la operación: ruta del archivo en Storage. '' = sin comprobante.
alter table exchange_ops add column if not exists comprobante_path text not null default '';

-- 2. Bucket privado para los comprobantes (no público: solo authenticated lee).
insert into storage.buckets (id, name, public)
values ('comprobantes', 'comprobantes', false)
on conflict (id) do nothing;

-- 3. Políticas RLS sobre storage.objects, acotadas al bucket comprobantes.
--    authenticated puede subir, leer y reemplazar; nadie anónimo.
drop policy if exists "comprobantes_insert" on storage.objects;
create policy "comprobantes_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'comprobantes');

drop policy if exists "comprobantes_select" on storage.objects;
create policy "comprobantes_select" on storage.objects
  for select to authenticated using (bucket_id = 'comprobantes');

drop policy if exists "comprobantes_update" on storage.objects;
create policy "comprobantes_update" on storage.objects
  for update to authenticated using (bucket_id = 'comprobantes');

-- 4. Verificación — correr y mirar el resultado.
-- La columna existe:
select column_name from information_schema.columns
where table_name = 'exchange_ops' and column_name = 'comprobante_path';
-- El bucket existe y es privado (public = false):
select id, public from storage.buckets where id = 'comprobantes';
