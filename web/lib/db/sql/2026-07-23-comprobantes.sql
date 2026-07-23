-- Comprobante opcional por operación — columna + Storage + RLS
-- Correr en el editor SQL de Supabase (proyecto zjetaihjddoxxvrpzwsb),
-- con el editor VACÍO antes de pegar. Es idempotente.

-- 1. Columna en la operación: ruta del archivo en Storage. '' = sin comprobante.
alter table exchange_ops add column if not exists comprobante_path text not null default '';

-- 2. Bucket privado para los comprobantes (no público: solo authenticated lee).
--    Con tope de tamaño (10 MB) y tipos permitidos aplicados EN EL SERVIDOR, no
--    solo en el cliente: aunque alguien saltee la validación del navegador,
--    Storage rechaza el archivo. 10 MB = 10485760 bytes.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('comprobantes', 'comprobantes', false, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;

-- Si el bucket ya existía (corriste una versión anterior sin límites), aplicáselos.
update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
where id = 'comprobantes';

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
-- El bucket existe, es privado (public = false) y tiene los límites aplicados:
select id, public, file_size_limit, allowed_mime_types from storage.buckets where id = 'comprobantes';
