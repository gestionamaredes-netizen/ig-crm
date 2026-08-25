-- Agregar columna usd_recibidos a cargas (dólares recibidos de otras cuentas)
alter table cargas add column usd_recibidos numeric default 0;

-- Actualizar el RLS si es necesario (sin cambios, la RLS existente sigue siendo válida)
