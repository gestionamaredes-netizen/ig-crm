# Hoja de ruta diaria de runners — Design

**Fecha:** 2026-07-31
**Estado:** Aprobado en brainstorming (3 partes), pendiente de review del spec.

## Goal

Que un admin (Capi/Marce) le **arme a un runner una hoja de ruta del día** — una consigna
("orden del día") más las **cuentas a operar** ese día — y que el runner la vea en su panel y
la **imprima o saque foto** para mandar por WhatsApp. Se apoya en los accesos por rol ya
implementados ([[cambio-accesos-por-rol]]).

## Architecture

Dos tablas nuevas (`hojas_ruta` + `hoja_ruta_cuentas`), capa de datos, server actions, una
página de armado en `/cambio` (admin) y una sección de lectura en `/panel` (runner). Las
cuentas elegidas se **copian** (snapshot) a la hoja: la hoja de un día queda congelada aunque
después cambie o se borre una cuenta, y el runner nunca necesita permiso para leer cuentas que
no son de sus celus. RLS: admin maneja todo, el runner **solo lee su propia hoja**.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Supabase (Postgres + RLS),
Vitest. Proyecto Supabase `zjetaihjddoxxvrpzwsb`.

## Global Constraints

- SQL idempotente en `web/lib/db/sql/2026-07-31-hojas-ruta.sql`, corrido a mano por el usuario.
  Empresa: `where c.name ilike '%gestiones%ma%'`. Desplegar el código schema-dependiente
  DESPUÉS de correr el SQL.
- Reusa las funciones RLS ya existentes `es_admin_cambio()` y `mi_runner_id()`.
- Server actions: `type ResultadoAlta = { ok: true } | { ok: false; error: string }`;
  `revalidatePath` en try/catch aislado; log `[cambio]`; validar antes de `createClient()`.
- Estilos inline + CSS vars, acento dorado `#D9A84E`, mobile-first (`.campo-fila`,
  `.cambio-modal`). NO pasar funciones de server a client components.
- La hoja muestra por cuenta: **titular + alias + CBU (pesos y dólares)**. **Sin DNI** (dato
  sensible; no hace falta para operar).

---

## Parte 1 — Modelo de datos y candado

### Tablas

```sql
create table hojas_ruta (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  runner_id  uuid not null references runners(id) on delete cascade,
  fecha      date not null,
  nota       text not null default '',           -- el "orden del día" (consigna libre)
  created_at timestamptz not null default now()
);
-- Una hoja por runner por día: "editar" es volver a la misma (upsert por este índice).
create unique index hojas_ruta_runner_fecha_idx on hojas_ruta(company_id, runner_id, fecha);

create table hoja_ruta_cuentas (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references companies(id) on delete cascade,
  hoja_id      uuid not null references hojas_ruta(id) on delete cascade,
  orden        int  not null default 0,          -- 1, 2, 3… el orden de operación
  origen       text not null,                    -- 'operativa' | 'bancaria'
  source_id    uuid,                             -- back-ref a phone_accounts/cuentas (informativo)
  etiqueta     text not null default '',         -- alias del celular, o 'Bancaria'
  titular      text not null default '',
  alias_pesos   text not null default '',
  cbu_pesos     text not null default '',
  alias_dolares text not null default '',
  cbu_dolares   text not null default '',
  created_at   timestamptz not null default now()
);
create index hoja_ruta_cuentas_hoja_idx on hoja_ruta_cuentas(hoja_id);
```

Los campos `titular/alias_*/cbu_*` son la **copia** al momento de armar la hoja. `source_id` +
`origen` quedan solo como referencia (no se usan para leer datos vivos).

### RLS

```sql
alter table hojas_ruta        enable row level security;
alter table hoja_ruta_cuentas enable row level security;

-- Admin: todo. Runner: lee solo SUS hojas; no crea ni edita (with check admin).
create policy "hojas_ruta_pol" on hojas_ruta for all to authenticated
  using (es_admin_cambio() or runner_id = mi_runner_id())
  with check (es_admin_cambio());

create policy "hoja_ruta_cuentas_pol" on hoja_ruta_cuentas for all to authenticated
  using (es_admin_cambio() or hoja_id in (select id from hojas_ruta where runner_id = mi_runner_id()))
  with check (es_admin_cambio());
```

---

## Parte 2 — Armado por el admin (`/cambio/hojas`)

Página nueva `/cambio/hojas` (link "Hojas de ruta" en el header de `/cambio`). Flujo:

1. **Elegir runner** (selector con los runners activos) y **día** (por defecto hoy; reusa el
   patrón de `SelectorDia`).
2. Al elegir runner+día, si ya hay hoja, se **precarga** (nota + cuentas en su orden) para editar.
3. **Orden del día**: un `textarea` para la consigna (`nota`).
4. **Elegir cuentas**: lista agrupada para tildar —
   - por **celular** (aparecen **todos los celulares**; cada uno con sus cuentas operativas), y
   - un grupo **"Cuentas bancarias"** (las del sector Cuentas).
   Datos: `getCelulares()`, `getCuentasOperativas()`, `getCuentas()` (el admin ve todo por RLS).
5. Las tildadas caen en una **lista ordenada** con **subir/bajar** (setean `orden`).
6. **Guardar** → `guardarHoja`. Si ya había hoja ese día para ese runner, la pisa.

**`guardarHoja(runnerId, fecha, nota, seleccion[])`** (server action, admin): `seleccion` es
`[{ origen: 'operativa'|'bancaria', sourceId, orden }]`. El server **resuelve el snapshot desde
la base** (no confía en el cliente): busca cada `sourceId` en `phone_accounts`/`cuentas`, arma
`titular/alias_*/cbu_*/etiqueta`, hace **upsert** de `hojas_ruta` (por el índice único) y
**reemplaza** las filas de `hoja_ruta_cuentas` (borra las viejas de esa hoja, inserta las
nuevas). También `borrarHoja(id)` para descartar.

---

## Parte 3 — Lectura e impresión por el runner (`/panel`)

Una sección **"Mi hoja de ruta"** arriba de "Mis celulares" en `/panel`, mostrando la hoja de
**hoy** (`getMiHojaDelDia(hoy)`; RLS ya la limita al runner logueado):

- **Orden del día** (la `nota`) y la **cantidad de cuentas** (contadas).
- Las cuentas **numeradas** (por `orden`), cada una con **titular**, **alias + CBU en pesos** y
  **alias + CBU en dólares**, en tipografía grande y legible.
- Botón **"Imprimir / compartir"** → `window.print()` con CSS de impresión que deja solo la
  hoja (el runner imprime o saca captura). La tarjeta está pensada para verse bien como foto.
- Si no hay hoja para hoy: "Todavía no tenés hoja para hoy."

Solo lectura. El componente de impresión es cliente; recibe solo datos serializables.

---

## Testing

- Mappers de datos (snake→camel) de `hojas_ruta` y `hoja_ruta_cuentas` (mock supabase como en
  `celulares-datos.test.ts`); chequeo de truncado.
- `guardarHoja`: arma el snapshot desde la fuente correcta (operativa vs bancaria); upsert por
  (runner, fecha); reemplaza las filas hijas; rechaza `runnerId`/`fecha` vacíos; revalidate
  aislado. `borrarHoja`: valida id.
- Conteo de "cantidad de cuentas" = filas de la hoja.
- Verificación manual post-SQL: admin arma una hoja para Zurdo → Zurdo la ve en `/panel`,
  imprime; Ale NO ve la de Zurdo; editar pisa la del día.

## Error handling

- Sin hoja para hoy → aviso, no rompe.
- `guardarHoja` sin cuentas seleccionadas → permitido (hoja con solo consigna) o mínimo 1: se
  permite guardar con al menos la nota; si no hay nota ni cuentas, se rechaza ("Cargá al menos
  una cuenta o una consigna.").
- RLS niega lectura ajena → el runner ve vacío, nunca la hoja de otro.

## Fuera de alcance (por ahora)

- Marcar cuentas como "operada/hecha" por el runner (v1 es solo lectura).
- Historial de hojas viejas navegable por el runner (ve la de hoy; el admin sí elige fecha).
- DNI en la hoja.

## Verificación final

- Correr `2026-07-31-hojas-ruta.sql` en Supabase (tablas + RLS).
- Suite verde, `tsc`/`lint` limpios, `build` OK.
- Merge + deploy DESPUÉS del SQL. Probar el flujo admin→runner e impresión.
