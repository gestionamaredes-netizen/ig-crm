# Registro de cargas diarias por cuenta — Design

**Fecha:** 2026-07-31
**Estado:** Aprobado en brainstorming, pendiente de plan.

## Goal

Que cada runner registre, desde su panel, las **cargas del día** por cuenta: marca una cuenta
como usada y anota el **ciclo completo** (pesos cargados, dólares comprados, dólares retirados).
Una carga por cuenta por día; al otro día se reinicia. Los admins ven el total del día y el
movimiento por cuenta. Se apoya en los accesos por rol ya implementados ([[cambio-accesos-por-rol]]).

## Architecture

Tabla `cargas` nueva (un registro por cuenta+día, con los tres montos y un snapshot del
titular/etiqueta), capa de datos, server actions, una sección "Cargas de hoy" en `/panel`
(runner) y una página "Cargas" en `/cambio` (admin). El runner ve sus cuentas operativas (de
sus celulares) **y** sus bancarias asignadas: para eso se abre la RLS de `cuentas` a que el
runner lea **solo las suyas** (`runner_id = mi_runner_id()`). Reusa `es_admin_cambio()` /
`mi_runner_id()`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase (Postgres + RLS), Vitest.

## Global Constraints

- SQL idempotente en `web/lib/db/sql/2026-07-31-cargas.sql`, corrido a mano por el usuario
  (Joni) en el proyecto de PRODUCCIÓN `zjetaihjddoxxvrpzwsb` ("CAJA GESTION MA"). Desplegar el
  código schema-dependiente DESPUÉS de correr el SQL.
- Reusa `es_admin_cambio()` y `mi_runner_id()`.
- Server actions: `type ResultadoAlta = { ok: true } | { ok: false; error: string }`;
  `revalidatePath` en try/catch aislado; log `[cambio]`; validar antes de `createClient()`.
- Montos con `parsearMonto` (formato argentino) del módulo de finanzas, mismo criterio que las
  operaciones. Un monto vacío = 0 (los tres son opcionales, pero al menos uno > 0 para marcar).
- Estilos inline + CSS vars, acento dorado `#D9A84E`, mobile-first. NO pasar funciones de
  server a client components.

## Parte 1 — Modelo de datos y candado

```sql
create table cargas (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid not null references companies(id) on delete cascade,
  fecha          date not null,
  runner_id      uuid references runners(id) on delete set null,
  origen         text not null,               -- 'operativa' | 'bancaria'
  source_id      uuid not null,
  titular        text not null default '',    -- snapshot para mostrar
  etiqueta       text not null default '',     -- snapshot (alias del celu o 'Bancaria')
  pesos_cargados numeric not null default 0,
  usd_comprados  numeric not null default 0,
  usd_retirados  numeric not null default 0,
  created_at     timestamptz not null default now()
);
create unique index cargas_cuenta_fecha_idx on cargas(company_id, origen, source_id, fecha);
create index cargas_fecha_idx on cargas(company_id, fecha);
```

- **Una carga por cuenta por día**: el índice único `(company_id, origen, source_id, fecha)`.
  "Marcar" es un upsert por ese índice; "desmarcar" borra la fila.
- `runner_id`: se deriva **de la cuenta** (el runner del celular para operativas, el
  `runner_id` de la cuenta para bancarias), no de quién marca. Así el total del admin agrupa
  bien aunque marque un admin.

### RLS

```sql
alter table cargas enable row level security;
create policy "cargas_pol" on cargas for all to authenticated
  using (es_admin_cambio() or runner_id = mi_runner_id())
  with check (es_admin_cambio() or runner_id = mi_runner_id());

-- El runner puede LEER sus cuentas bancarias asignadas (antes eran admin-only).
-- Sigue sin poder crearlas/editarlas (with check admin).
drop policy if exists "cambio_admin_cuentas" on cuentas;
create policy "cuentas_pol" on cuentas for all to authenticated
  using (es_admin_cambio() or runner_id = mi_runner_id())
  with check (es_admin_cambio());
```

## Parte 2 — El runner marca (en `/panel`)

Sección nueva **"Cargas de hoy"** arriba en `/panel`. Junta las cuentas del runner:
- **Operativas**: `getCuentasOperativas()` (RLS ya las limita a sus celulares).
- **Bancarias**: `getCuentas()` (con la RLS nueva, el runner recibe solo las suyas).

Cada cuenta tiene una **clave** `origen:sourceId`. Se cruza con `getMisCargasDelDia(hoy)`:
- Sin carga hoy → grupo **"A disposición"**, con botón **"Marcar como cargada"** → modal con
  **pesos cargados / dólares comprados / dólares retirados** → `marcarCarga(...)`.
- Con carga hoy → grupo **"Cargadas hoy"**, muestra los tres montos y un botón **"Desmarcar"**
  (`desmarcarCarga(id)`).

Solo lo del runner logueado (RLS). Datos serializables al client component.

## Parte 3 — El admin ve el total (en `/cambio/cargas`)

Página nueva `/cambio/cargas` (link "Cargas" en el header de `/cambio`):
- Selector de **día** (por defecto hoy).
- Tabla de las cargas del día: **runner, cuenta (titular · etiqueta), pesos cargados, dólares
  comprados, dólares retirados**.
- **Totales del día** (suma de cada columna).
- **Movimiento por cuenta**: subtotales agrupados por cuenta (titular) del día — cuánto movió
  cada una. Solo lectura.

## Server actions

- `marcarCarga(origen, sourceId, fecha, pesos, comprados, retirados)`: valida origen/sourceId/
  fecha; parsea los tres montos (`parsearMonto`, vacío = 0); exige al menos uno > 0; resuelve
  `company_id`, y del `sourceId` saca `runner_id` + `titular` + `etiqueta` (de `phone_accounts`
  +`phones` si operativa, de `cuentas` si bancaria); upsert en `cargas` por el índice único.
- `desmarcarCarga(id)`: valida id; borra la fila.

## Testing

- Mappers de datos (`cargas`) snake→camel; `getMisCargasDelDia`/`getCargasDelDia`.
- `marcarCarga`: rechaza inputs vacíos y "los tres en cero"; arma el snapshot desde la fuente
  correcta (operativa vs bancaria); upsert por cuenta+día; revalidate aislado. `desmarcarCarga`:
  valida id.
- Reportes de totales del día y subtotal por cuenta (función pura, testeable).
- Verificación manual post-SQL: runner marca una cuenta con los tres montos → pasa a "Cargadas
  hoy"; desmarca → vuelve; no puede marcar dos veces la misma; el admin ve el total y el
  movimiento por cuenta; Ale no ve lo de Zurdo.

## Error handling / fuera de alcance

- Sin cargas hoy → grupos vacíos con aviso, no rompe.
- RLS niega lectura ajena → el runner ve solo lo suyo.
- Fuera de alcance por ahora: editar una carga ya hecha (se desmarca y se vuelve a marcar);
  historial por cuenta navegable multi-día (se ve cambiando la fecha en el admin); export.

## Verificación final

- Correr `2026-07-31-cargas.sql` en Supabase (tabla + RLS + cambio de RLS de `cuentas`).
- Suite verde, `tsc`/`lint` limpios, `build` OK. Merge + deploy DESPUÉS del SQL.
