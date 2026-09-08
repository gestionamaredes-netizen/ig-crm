-- Accesos de runners autoservicio — módulo Cambio.
-- Correr en Supabase (zjetaihjddoxxvrpzwsb), editor VACÍO. Idempotente.
--
-- Guarda el "usuario" (nombre de login, ej. "ori") junto al perfil, para poder
-- mostrar con qué usuario entra cada runner y evitar duplicados. El acceso en sí
-- (crear el usuario de Auth + esta fila) lo hace la app con la service role.

alter table perfiles_cambio add column if not exists usuario text;

-- Verificación
select column_name from information_schema.columns
where table_name = 'perfiles_cambio' and column_name = 'usuario';
