# Celulares Operativos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Sumar al módulo Cambio un registro de "Celulares Operativos": teléfonos (con modelo y runner a cargo) y las cuentas operativas abiertas en cada uno (titular, DNI, CBU/CVU y alias en pesos y en dólares).

**Architecture:** Dos tablas nuevas (`phones`, `phone_accounts`), capa de datos de lectura, server actions CRUD, y una página `/cambio/celulares`. Registro aislado: no toca `calculo.ts`, `reportes.ts`, `exchange_ops` ni las cajas. Espeja el patrón del subsistema de runners.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase, Vitest.

## Global Constraints

- Empresa en SQL: `where c.name ilike '%gestiones%ma%'`. Proyecto `zjetaihjddoxxvrpzwsb`. SQL idempotente en `web/lib/db/sql/2026-07-24-celulares.sql`, corrido a mano.
- Tablas: `id uuid pk default gen_random_uuid()`, `company_id uuid not null references companies(id) on delete cascade`, `created_at timestamptz not null default now()`. RLS `for all to authenticated using (true) with check (true)`.
- Server actions: `type ResultadoAlta = { ok: true } | { ok: false; error: string }`; `revalidatePath("/cambio/celulares")` en su propio try/catch; log `[cambio]`; SIN candado `tieneAccesoCompleto`; validar entradas antes de `createClient()`.
- Lecturas por `createClient()` de `@/lib/supabase/server`; `const LIMITE = 10000` con `console.error` si `count` supera lo devuelto; mappers snake→camel.
- Estilos inline con CSS variables; acento dorado (`#D9A84E` / `linear-gradient(140deg,#D9A84E,#a9791f)`); mobile-first (tarjetas `.ops-cards` / tabla `.ops-tabla`; grillas `.campo-fila`; modales `.cambio-modal`/`.cambio-modal-overlay`). Reusar `MobileTopBar`.
- **MOLDE:** el subsistema de runners es el patrón a espejar. Archivos de referencia para cada capa: `lib/cambio/runners.ts` (tipos), `lib/cambio/runners-datos.ts` (lecturas), `app/(app)/cambio/runners-actions.ts` (actions), `components/cambio/runner-forms.tsx` (modales crear/editar/eliminar), `components/cambio/runners-historial.tsx` (doble render + lápiz), `app/(app)/cambio/runners/page.tsx` (página).

---

### Task 1: Esquema SQL + runner Ale + precarga de 18 teléfonos

**Files:** Create `web/lib/db/sql/2026-07-24-celulares.sql`.

- [ ] **Step 1: Escribir el SQL** (estilo `2026-07-23-runners.sql`):

```sql
-- Celulares Operativos — módulo Cambio. Correr en Supabase (zjetaihjddoxxvrpzwsb),
-- editor VACÍO antes de pegar. Idempotente.

-- 1. Teléfonos
create table if not exists phones (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  alias      text not null default '',
  model      text not null default '',
  runner_id  uuid references runners(id) on delete set null,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists phones_company_idx on phones(company_id);

-- 2. Cuentas operativas de cada teléfono
create table if not exists phone_accounts (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id) on delete cascade,
  phone_id      uuid not null references phones(id) on delete cascade,
  holder_name   text not null default '',
  dni           text not null default '',
  cbu_pesos     text not null default '',
  alias_pesos   text not null default '',
  cbu_dolares   text not null default '',
  alias_dolares text not null default '',
  status        text not null default 'activa',   -- activa | bloqueada
  notes         text not null default '',
  created_at    timestamptz not null default now()
);
create index if not exists phone_accounts_phone_idx on phone_accounts(company_id, phone_id);

-- 3. RLS
alter table phones         enable row level security;
alter table phone_accounts enable row level security;
drop policy if exists "auth_all_phones" on phones;
create policy "auth_all_phones" on phones for all to authenticated using (true) with check (true);
drop policy if exists "auth_all_phone_accounts" on phone_accounts;
create policy "auth_all_phone_accounts" on phone_accounts for all to authenticated using (true) with check (true);

-- 4. Cuarto runner: Ale
insert into runners (company_id, name)
select c.id, 'Ale' from companies c where c.name ilike '%gestiones%ma%'
on conflict do nothing;

-- 5. Precarga de 18 teléfonos: Owen 5, Zurdo 5, Ale 8 (alias listo, modelo vacío).
--    Idempotente por `not exists` sobre el alias (no hay índice único en alias
--    porque los que crea el usuario pueden quedar sin alias).
insert into phones (company_id, alias, runner_id)
select r.company_id, v.alias, r.id
from runners r
join companies c on c.id = r.company_id
join (values
  ('Owen','Owen 1'),('Owen','Owen 2'),('Owen','Owen 3'),('Owen','Owen 4'),('Owen','Owen 5'),
  ('Zurdo','Zurdo 1'),('Zurdo','Zurdo 2'),('Zurdo','Zurdo 3'),('Zurdo','Zurdo 4'),('Zurdo','Zurdo 5'),
  ('Ale','Ale 1'),('Ale','Ale 2'),('Ale','Ale 3'),('Ale','Ale 4'),
  ('Ale','Ale 5'),('Ale','Ale 6'),('Ale','Ale 7'),('Ale','Ale 8')
) as v(runner, alias) on lower(r.name) = lower(v.runner)
where c.name ilike '%gestiones%ma%'
  and not exists (
    select 1 from phones p where p.company_id = r.company_id and lower(p.alias) = lower(v.alias)
  );

-- 6. Verificación
select tablename, rowsecurity from pg_tables where tablename in ('phones','phone_accounts');
-- 18 filas: 5 Owen, 5 Zurdo, 8 Ale.
select r.name as runner, count(*) from phones p
join runners r on r.id = p.runner_id
join companies c on c.id = p.company_id
where c.name ilike '%gestiones%ma%' group by r.name order by r.name;
```

- [ ] **Step 2: Commit** `feat(cambio): esquema SQL de celulares operativos + runner Ale + 18 teléfonos`.

---

### Task 2: Tipos + capa de datos

**Files:** Create `web/lib/cambio/celulares.ts`, `web/lib/cambio/celulares-datos.ts`; Test `web/lib/cambio/celulares-datos.test.ts`.

**Interfaces (en `celulares.ts`):**
- `type Celular = { id: string; alias: string; modelo: string; runnerId: string | null; runner: string; activo: boolean }`
- `type CuentaOperativa = { id: string; celularId: string; titular: string; dni: string; cbuPesos: string; aliasPesos: string; cbuDolares: string; aliasDolares: string; estado: string; notas: string }`

**Lecturas (en `celulares-datos.ts`, moldeadas en `runners-datos.ts`):**
- `getCelulares(): Promise<Celular[]>` — tabla `phones` con join `runners(name)` → `runner` (usar helper `uno` como en runners para objeto|array). Orden por `alias`.
- `getCuentasOperativas(): Promise<CuentaOperativa[]>` — tabla `phone_accounts`, orden por `created_at`.

- [ ] **Step 1: Tests** (mock supabase como en `runners-datos.test.ts`): mapper snake→camel de cada lectura; `getCelulares` mapea `runners.name`→`runner` (relación objeto y array de uno, y null→""); chequeo de truncado presente. Correr y ver que fallan.
- [ ] **Step 2: Implementar** `celulares.ts` (tipos) y `celulares-datos.ts` (LIMITE 10000, count vs length + console.error, `Number(...)` no hace falta acá porque todo es texto/bool). Correr verde + `tsc`.
- [ ] **Step 3: Commit** `feat(cambio): tipos y lecturas de celulares y cuentas operativas`.

---

### Task 3: Server actions CRUD

**Files:** Create `web/app/(app)/cambio/celulares-actions.ts`; Test `web/app/(app)/cambio/celulares-actions.test.ts`.

**Molde:** `runners-actions.ts` (company_id igual que ahí, contrato estándar). Producir:
- `createPhone(fd)` — `alias`, `model`, `runnerId` (puede ir vacío→null), `active` (default true). Inserta en `phones`.
- `updatePhone(id, fd)` — update por id; `deletePhone(id)` — delete por id (cascade borra sus cuentas).
- `createPhoneAccount(fd)` — `phoneId` (obligatorio), `holderName`, `dni`, `cbuPesos`, `aliasPesos`, `cbuDolares`, `aliasDolares`, `status` (activa|bloqueada, default activa), `notes`. Inserta en `phone_accounts`.
- `updatePhoneAccount(id, fd)`, `deletePhoneAccount(id)`.
Todas: validan id/phoneId vacío antes de la base; contrato estándar; `revalidatePath("/cambio/celulares")` aislado; sin candado.

- [ ] **Step 1: Tests** (patrón `runners-actions.test.ts`): cada create/update escribe la tabla correcta con los campos; delete borra por id; rechazan id/phoneId vacío sin tocar la base; revalidate aislado. Correr rojo.
- [ ] **Step 2: Implementar.** Correr verde + `tsc` + `lint`.
- [ ] **Step 3: Commit** `feat(cambio): server actions CRUD de celulares y cuentas operativas`.

---

### Task 4: Modales (celular y cuenta)

**Files:** Create `web/components/cambio/celular-forms.tsx`.

**Molde:** `runner-forms.tsx` (modales con `modo: "crear"|"editar"`, precarga por `useState`, botón Eliminar con `window.confirm`, guard doble submit, `.cambio-modal`). Producir botones-con-modal client:
- `NuevoCelularButton({ runners })` y `EditarCelularButton({ celular, runners, abierto, onCerrar })` (o un `CelularForm` con modo) — campos: alias, modelo, runner (select de `runners`), estado (activo/fuera de uso). Envían a `createPhone`/`updatePhone`; editar tiene Eliminar (`deletePhone`).
- `NuevaCuentaButton({ celularId })` y `EditarCuentaButton({ cuenta, abierto, onCerrar })` — campos: titular, DNI, CBU/CVU pesos, alias pesos, CBU/CVU dólares, alias dólares, estado (activa/bloqueada), notas. Envían a `createPhoneAccount`/`updatePhoneAccount`; editar tiene Eliminar (`deletePhoneAccount`). Agrupá visualmente "Cuenta en pesos" y "Cuenta en dólares".

Tipos de `@/lib/cambio/celulares`. Sin tests (componentes). `tsc` + `lint` + `vitest run` + `build`.

- [ ] **Step 1: Implementar** los modales. Verificar.
- [ ] **Step 2: Commit** `feat(cambio): modales de celular y cuenta operativa`.

---

### Task 5: Página `/cambio/celulares` + enlace desde Cambio

**Files:** Create `web/components/cambio/celulares-lista.tsx`, `web/app/(app)/cambio/celulares/page.tsx`; Modify `web/app/(app)/cambio/page.tsx`.

- [ ] **Step 1: `celulares-lista.tsx`** (client) — recibe `celulares`, `cuentas`, `runners`. Doble render `.ops-cards`/`.ops-tabla` de la lista de celulares (alias, modelo, runner a cargo, cantidad de cuentas, estado) con lápiz para editar/eliminar (abre `EditarCelularButton`, montado con `key` por id). Al abrir/expandir un celular, mostrar sus cuentas operativas (filtradas por `celularId`) con sus datos (titular, DNI, pesos: CBU+alias, dólares: CBU+alias, estado), botón "Agregar cuenta" (`NuevaCuentaButton` con ese `celularId`) y lápiz por cuenta (`EditarCuentaButton`, key por id). Seguí el patrón de `runners-historial.tsx`. IMPORTANTE: no pasar funciones de la página server a este componente cliente — derivá adentro lo que necesites de `runners`/`cuentas`.
- [ ] **Step 2: Página** (`export const dynamic = "force-dynamic"`, molde `runners/page.tsx`): carga `getCelulares`, `getCuentasOperativas`, `getRunners` con `Promise.all`; encabezado "Celulares", link de vuelta a `/cambio`, botón `NuevoCelularButton`; render `<CelularesLista .../>`. Pasar solo datos serializables (arrays), NO funciones.
- [ ] **Step 3: Enlace** en `web/app/(app)/cambio/page.tsx`: sumar en `cambio-head-actions` un `<Link href="/cambio/celulares">Celulares</Link>` (estilo secundario, como "Runners"), antes de "Descargar Excel".
- [ ] **Step 4:** `tsc` + `lint` + `vitest run` + `npm run build` (que `/cambio/celulares` compile como dinámica).
- [ ] **Step 5: Commit** `feat(cambio): página de celulares operativos con sus cuentas + enlace`.

---

## Verificación final

- Correr `2026-07-24-celulares.sql` en Supabase: 2 tablas con RLS, runner Ale, 18 teléfonos (5 Owen, 5 Zurdo, 8 Ale).
- Suite verde, `tsc`/`lint` limpios, `npm run build` OK.
- Revisión final de rama (Opus): registro aislado (no toca cálculo/cajas), actions no borran de más (siempre `.eq("id", id)`), sin funciones cruzadas server→cliente, datos sensibles solo tras login.
- Merge + deploy. Prueba en navegador: crear un celular, agregar una cuenta con datos de pesos y dólares, editar y eliminar.
