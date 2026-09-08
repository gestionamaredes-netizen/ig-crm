-- Pool compartido de cuentas bancarias para runners — módulo Cambio.
-- Correr en Supabase (zjetaihjddoxxvrpzwsb), editor VACÍO. Idempotente.
-- Reusa es_admin_cambio() / mi_runner_id().
--
-- Qué cambia:
--  * Antes cada runner veía SOLO sus cuentas bancarias asignadas.
--  * Ahora TODO runner ve TODAS las cuentas (pool compartido) para leerlas y
--    marcarlas como cargadas. Sigue sin poder crearlas ni editarlas (eso es
--    admin). Joni confirmó que está OK que los runners vean todos los datos
--    (CBU/usuario/clave) para poder operar.
--  * Las cargas del día ahora las LEE cualquier runner (para saber qué cuentas
--    ya tomó otro y sacarlas del pool), pero cada uno solo puede
--    crear/editar/borrar SUS PROPIAS cargas.

-- ── CUENTAS ────────────────────────────────────────────────────────────────
-- Se separan lectura y escritura en dos políticas para no abrir el borrado por
-- error: una política `for all` con `using` amplio dejaría a un runner BORRAR
-- cualquier cuenta (delete solo mira `using`, no `with check`). Por eso el
-- SELECT es abierto a runners y la escritura (insert/update/delete) es admin.
drop policy if exists "auth_all_cuentas" on cuentas;
drop policy if exists "cambio_admin_cuentas" on cuentas;
drop policy if exists "cuentas_pol" on cuentas;
drop policy if exists "cuentas_sel" on cuentas;
drop policy if exists "cuentas_admin_write" on cuentas;

create policy "cuentas_sel" on cuentas for select to authenticated
  using (es_admin_cambio() or mi_runner_id() is not null);
create policy "cuentas_admin_write" on cuentas for all to authenticated
  using (es_admin_cambio())
  with check (es_admin_cambio());

-- ── CARGAS ─────────────────────────────────────────────────────────────────
-- Mismo criterio: cualquier runner LEE todas las cargas del día (para sacar del
-- pool lo que ya tomó otro), pero solo crea/edita/borra las suyas.
drop policy if exists "cargas_pol" on cargas;
drop policy if exists "cargas_sel" on cargas;
drop policy if exists "cargas_write" on cargas;

create policy "cargas_sel" on cargas for select to authenticated
  using (es_admin_cambio() or mi_runner_id() is not null);
create policy "cargas_write" on cargas for all to authenticated
  using (es_admin_cambio() or runner_id = mi_runner_id())
  with check (es_admin_cambio() or runner_id = mi_runner_id());

-- Verificación
select tablename, policyname, cmd from pg_policies
where tablename in ('cuentas','cargas') order by tablename, policyname;
