# Cambio USD — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Módulo `/cambio` en IG OS para registrar compras y ventas de dólares de GESTIONES MA, con costo promedio ponderado, saldos de caja, rankings por cliente y persona, y exportación a Excel.

**Architecture:** Sigue la anatomía del módulo `finanzas`: SQL crudo idempotente corrido a mano en Supabase, lecturas por `createClient()` de `@/lib/supabase/server` (nunca Drizzle en runtime), lógica aritmética pura y testeada en `lib/cambio/`, server component con `Promise.all`, y server actions con resultado discriminado. La diferencia clave con la planilla que reemplaza: el costo promedio se calcula sobre la lista **ordenada por fecha en el servidor**, así que el orden de carga deja de importar.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Supabase (PostgREST + RLS), Vitest, `exceljs` (dependencia nueva).

## Global Constraints

- **Spec:** `docs/superpowers/specs/2026-07-22-cambio-usd-design.md`. Ante cualquier duda de dominio, manda el spec.
- **Rama:** `feat/cambio-usd`, ya creada.
- **Nombres:** tablas y columnas en `snake_case` **inglés**; tipos y funciones de dominio en TS en **español**. La capa de mapeo entre ambos vive en `lib/cambio/datos.ts`.
- **Enums:** `text not null default '...'` **sin CHECK constraint**, dominio documentado en comentario y validado en TS contra el mismo array de literals que usa la lectura.
- **RLS obligatorio** en cada tabla nueva, con la plantilla fija del proyecto: `create policy "auth_all_<tabla>" on <tabla> for all to authenticated using (true) with check (true);`
- **Nunca `null`** salvo que signifique algo. Todo `not null default ''` / `default 0`.
- **Siempre loguear `error`** en cada lectura y escritura de Supabase: con RLS activo una lectura sin permisos devuelve 0 filas sin error, indistinguible de "no hay datos". Prefijo `[cambio]`.
- **Estilos:** inline con las CSS variables de `app/globals.css` (`--glass`, `--border`, `--radius`, `--muted`, `--text`, `--accent`, `--ok`, `--warn`). No hay shadcn ni `components/ui`. Números con `className="tnum"`.
- **Tests:** solo lógica pura (`lib/cambio/*.ts`) y server actions. Nada de componentes React — no hay jsdom. Correr con `npm test`.
- **Verificación por tarea:** `npm test` y `npm run lint` deben pasar antes de cada commit.
- **Montos que tipea el usuario** se parsean con `parsearMonto` de `@/lib/finanzas/montos` (convención argentina: punto para miles, coma para decimales). No escribir un parser nuevo.

## File Structure

| Archivo | Responsabilidad |
|---|---|
| `lib/db/sql/2026-07-22-cambio.sql` | Tablas, índices, RLS y seed. Se corre a mano en Supabase. |
| `lib/cambio/tipos.ts` | Tipos de dominio y uniones de string literals. Sin lógica. |
| `lib/cambio/calculo.ts` | Aritmética pura: importes, costo promedio móvil, margen, stock. El corazón del módulo. |
| `lib/cambio/calculo.test.ts` | Tests del cálculo, incluido el caso de referencia del spec. |
| `lib/cambio/reportes.ts` | Agregaciones puras: saldos de caja, ranking de clientes, ranking de personas, resumen. |
| `lib/cambio/reportes.test.ts` | Tests de las agregaciones. |
| `lib/cambio/datos.ts` | Único lugar que lee Supabase. `COLUMNAS`, tipos `Row`, mappers, getters. |
| `lib/cambio/excel.ts` | Arma el workbook con `exceljs`. Puro salvo por la librería: recibe datos ya calculados. |
| `app/(app)/cambio/page.tsx` | Server component. `Promise.all` de los getters + layout. Cero lógica. |
| `app/(app)/cambio/actions.ts` | `"use server"`. Alta de operación. |
| `app/(app)/cambio/actions.test.ts` | Test del server action con mocks. |
| `app/(app)/cambio/export/route.ts` | Route handler que devuelve el `.xlsx`. |
| `components/cambio/tabla-operaciones.tsx` | Tabla de operaciones. |
| `components/cambio/nueva-operacion-form.tsx` | Botón + modal con cálculo en vivo. `"use client"`. |
| `components/cambio/rankings.tsx` | Tablas de clientes y personas. |
| `components/shell/sidebar.tsx` | **Modificar:** agregar la entrada al array `nav`. |
| `app/(app)/[section]/page.tsx` | **Modificar:** no tiene clave `cambio` en `titles`; verificar y dejar como está. |

---

### Task 1: Esquema en Supabase

**Files:**
- Create: `lib/db/sql/2026-07-22-cambio.sql`

**Interfaces:**
- Consumes: la tabla existente `companies` (`id uuid`, `name text`).
- Produces: tablas `exchange_clients`, `exchange_accounts`, `exchange_ops` con las columnas exactas que consumen las Tasks 4, 5 y 9.

- [ ] **Step 1: Escribir el SQL**

Crear `lib/db/sql/2026-07-22-cambio.sql`:

```sql
-- Módulo Cambio USD — esquema, RLS y datos iniciales
-- Correr en el editor SQL de Supabase, con el editor VACÍO antes de pegar.
-- Es idempotente: se puede correr varias veces sin duplicar nada.

-- ---------------------------------------------------------------
-- 1. Clientes del negocio de cambio
-- ---------------------------------------------------------------
-- Es la CUENTA COMERCIAL: a quien se le atribuye volumen y margen. No se
-- confunde con emisor/receptor, que son texto libre en exchange_ops porque
-- un cliente tiene varios y muchos aparecen una sola vez.

create table if not exists exchange_clients (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name       text not null,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists exchange_clients_name_idx
  on exchange_clients(company_id, lower(name));

-- ---------------------------------------------------------------
-- 2. Cajas (dónde está la plata)
-- ---------------------------------------------------------------
-- adjustment existe para cuando el conteo físico no coincide: la diferencia
-- se registra ahí en vez de alterar operaciones ya cargadas, y queda visible
-- en la UI en lugar de quedar tapada dentro de una operación mal cargada.

create table if not exists exchange_accounts (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references companies(id) on delete cascade,
  name            text not null,
  currency        text not null,                 -- ARS | USD
  opening_balance numeric not null default 0,
  adjustment      numeric not null default 0,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

create unique index if not exists exchange_accounts_name_idx
  on exchange_accounts(company_id, lower(name));

-- ---------------------------------------------------------------
-- 3. Operaciones
-- ---------------------------------------------------------------
-- amount + amount_currency + rate son la ÚNICA fuente de verdad de los
-- importes. Los USD y los pesos se derivan (ver lib/cambio/calculo.ts):
-- guardar los tres permitiría estados contradictorios entre sí.

create table if not exists exchange_ops (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references companies(id) on delete cascade,
  op_date         date not null,
  kind            text not null,                 -- compra | venta
  client_id       uuid references exchange_clients(id) on delete set null,
  sender          text not null default '',      -- quien envía los fondos
  receiver        text not null default '',      -- quien los recibe
  amount          numeric not null,              -- UN solo importe, el que el usuario conoce
  amount_currency text not null,                 -- ARS | USD — en qué moneda está amount
  rate            numeric not null,              -- pesos por dólar
  ars_account_id  uuid references exchange_accounts(id) on delete set null,
  usd_account_id  uuid references exchange_accounts(id) on delete set null,
  fees            numeric not null default 0,
  notes           text not null default '',
  created_at      timestamptz not null default now()
);

-- El cálculo del costo promedio recorre las operaciones ordenadas por fecha,
-- con created_at como desempate estable dentro del mismo día.
create index if not exists exchange_ops_date_idx on exchange_ops(op_date, created_at);
create index if not exists exchange_ops_client_idx on exchange_ops(client_id);

-- ---------------------------------------------------------------
-- 4. RLS — misma plantilla que expenses y las tablas de pautas
-- ---------------------------------------------------------------

alter table exchange_clients  enable row level security;
alter table exchange_accounts enable row level security;
alter table exchange_ops      enable row level security;

drop policy if exists "auth_all_exchange_clients" on exchange_clients;
create policy "auth_all_exchange_clients" on exchange_clients
  for all to authenticated using (true) with check (true);

drop policy if exists "auth_all_exchange_accounts" on exchange_accounts;
create policy "auth_all_exchange_accounts" on exchange_accounts
  for all to authenticated using (true) with check (true);

drop policy if exists "auth_all_exchange_ops" on exchange_ops;
create policy "auth_all_exchange_ops" on exchange_ops
  for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------
-- 5. Cajas iniciales de GESTIONES MA
-- ---------------------------------------------------------------
-- Los nombres son los que ya usaba la planilla. El usuario los renombra
-- después desde la base si sus cuentas se llaman distinto.

insert into exchange_accounts (company_id, name, currency)
select c.id, v.name, v.currency
from companies c
cross join (values
  ('Efectivo $',   'ARS'),
  ('Banco $',      'ARS'),
  ('Mercado Pago', 'ARS'),
  ('Efectivo USD', 'USD'),
  ('Banco USD',    'USD'),
  ('USDT',         'USD')
) as v(name, currency)
where c.name ilike '%gestiones%ma%'
on conflict do nothing;

-- ---------------------------------------------------------------
-- 6. Verificación — correr y mirar el resultado
-- ---------------------------------------------------------------

-- Tiene que devolver EXACTAMENTE una fila. Si devuelve cero, el insert de
-- cajas de arriba no hizo nada y hay que ajustar el ilike al nombre real.
select id, name from companies where name ilike '%gestiones%ma%';

-- Tiene que devolver 6 filas: 3 en ARS y 3 en USD.
select a.name, a.currency
from exchange_accounts a
join companies c on c.id = a.company_id
where c.name ilike '%gestiones%ma%'
order by a.currency, a.name;

-- Las tres tablas con RLS activo (rowsecurity = true en las tres).
select tablename, rowsecurity from pg_tables
where tablename in ('exchange_clients','exchange_accounts','exchange_ops');
```

- [ ] **Step 2: Correr el SQL en Supabase**

Este paso lo hace **el usuario**, no el agente. Pegarle el contenido completo del archivo **en el chat** (no un link ni la ruta del archivo: copiar el nombre del archivo y pegarlo en Supabase falla) y pedirle que lo corra en el editor SQL con el editor vacío.

Esperado de las tres queries de verificación:
1. Una fila con el `id` y el nombre de GESTIONES MA.
2. Seis filas de cajas: `Banco $`, `Efectivo $`, `Mercado Pago` (ARS) y `Banco USD`, `Efectivo USD`, `USDT` (USD).
3. Tres filas con `rowsecurity = true`.

Si la query 1 devuelve cero filas, el nombre de la empresa en `companies` no matchea `%gestiones%ma%`: pedirle al usuario el resultado de `select id, name from companies;` y ajustar el `ilike` antes de seguir.

- [ ] **Step 3: Commit**

```bash
git add lib/db/sql/2026-07-22-cambio.sql
git commit -m "feat(cambio): esquema de operaciones, clientes y cajas

Emisor y receptor van como texto libre y no como tabla: un cliente tiene
varios y muchos aparecen una sola vez, así que exigir un alta previa fue un
obstáculo real en la planilla que este módulo reemplaza.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Tipos y cálculo del costo promedio

El corazón del módulo. Es lo que la planilla hacía con una cadena de fórmulas frágil.

**Files:**
- Create: `lib/cambio/tipos.ts`
- Create: `lib/cambio/calculo.ts`
- Test: `lib/cambio/calculo.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `type TipoOperacion = "compra" | "venta"`, `type Moneda = "ARS" | "USD"`
  - `type Operacion` (ver código abajo)
  - `type OperacionCalculada = Operacion & { usd, ars, costoPromedio, margen, stock, costoTotal: number }`
  - `importes(op: { monto: number; moneda: Moneda; tc: number }): { usd: number; ars: number }`
  - `calcular(ops: Operacion[]): OperacionCalculada[]`

- [ ] **Step 1: Escribir los tipos**

Crear `lib/cambio/tipos.ts`:

```ts
export type TipoOperacion = "compra" | "venta";
export type Moneda = "ARS" | "USD";

/** Las fechas son YYYY-MM-DD: comparar strings equivale a comparar cronológicamente. */
export type Operacion = {
  id: string;
  fecha: string;
  /** Desempate estable entre operaciones del mismo día. ISO 8601. */
  creadaEn: string;
  tipo: TipoOperacion;
  /** null = la operación quedó sin cliente (el cliente se borró). */
  clienteId: string | null;
  cliente: string;
  emisor: string;
  receptor: string;
  /** El único importe que se guarda. Los USD y los pesos se derivan de acá. */
  monto: number;
  /** En qué moneda está `monto`. */
  moneda: Moneda;
  /** Pesos por dólar. */
  tc: number;
  cajaArsId: string | null;
  cajaUsdId: string | null;
  costos: number;
  notas: string;
};

export type Caja = {
  id: string;
  nombre: string;
  moneda: Moneda;
  saldoInicial: number;
  ajuste: number;
};

export type ClienteCambio = { id: string; nombre: string };
```

- [ ] **Step 2: Escribir el test que falla**

Crear `lib/cambio/calculo.test.ts`. Los números son el caso de referencia del spec, ya verificados con el usuario contra la planilla:

```ts
import { describe, it, expect } from "vitest";
import { importes, calcular } from "./calculo";
import type { Operacion } from "./tipos";

function op(over: Partial<Operacion> & Pick<Operacion, "fecha" | "tipo" | "monto" | "moneda" | "tc">): Operacion {
  return {
    id: over.fecha + over.tipo + over.monto,
    creadaEn: `${over.fecha}T10:00:00Z`,
    clienteId: null,
    cliente: "",
    emisor: "",
    receptor: "",
    cajaArsId: null,
    cajaUsdId: null,
    costos: 0,
    notas: "",
    ...over,
  };
}

describe("importes", () => {
  it("con monto en USD, los pesos salen de multiplicar por el TC", () => {
    expect(importes({ monto: 1000, moneda: "USD", tc: 1400 })).toEqual({ usd: 1000, ars: 1400000 });
  });

  it("con monto en ARS, los dólares salen de dividir por el TC", () => {
    // El caso que motivó el módulo: el usuario recibe 452.500 pesos a 1520 y
    // no tiene por qué hacer la división a mano.
    const { usd, ars } = importes({ monto: 452500, moneda: "ARS", tc: 1520 });
    expect(ars).toBe(452500);
    expect(usd).toBeCloseTo(297.6973684, 6);
  });

  it("con TC cero devuelve ceros en vez de dividir por cero", () => {
    expect(importes({ monto: 452500, moneda: "ARS", tc: 0 })).toEqual({ usd: 0, ars: 0 });
  });
});

describe("calcular", () => {
  it("una compra deja el costo promedio en el TC de esa compra", () => {
    const [r] = calcular([op({ fecha: "2026-07-01", tipo: "compra", monto: 1000, moneda: "USD", tc: 1400 })]);
    expect(r.stock).toBe(1000);
    expect(r.costoPromedio).toBe(1400);
    expect(r.margen).toBe(0);
  });

  it("una segunda compra promedia los dos lotes", () => {
    const r = calcular([
      op({ fecha: "2026-07-01", tipo: "compra", monto: 1000, moneda: "USD", tc: 1400 }),
      op({ fecha: "2026-07-02", tipo: "compra", monto: 730000, moneda: "ARS", tc: 1460 }),
    ]);
    expect(r[1].usd).toBe(500);
    expect(r[1].stock).toBe(1500);
    expect(r[1].costoPromedio).toBe(1420);
  });

  it("una venta genera margen contra el costo promedio previo, neto de costos", () => {
    const r = calcular([
      op({ fecha: "2026-07-01", tipo: "compra", monto: 1000, moneda: "USD", tc: 1400 }),
      op({ fecha: "2026-07-02", tipo: "compra", monto: 730000, moneda: "ARS", tc: 1460 }),
      op({ fecha: "2026-07-03", tipo: "venta", monto: 800, moneda: "USD", tc: 1480, costos: 5000 }),
    ]);
    // 800 × (1480 − 1420) = 48.000, menos 5.000 de costos
    expect(r[2].margen).toBe(43000);
    expect(r[2].stock).toBe(700);
    expect(r[2].costoPromedio).toBe(1420);
  });

  it("caso de referencia completo del spec", () => {
    const r = calcular([
      op({ fecha: "2026-07-01", tipo: "compra", monto: 1000, moneda: "USD", tc: 1400 }),
      op({ fecha: "2026-07-02", tipo: "compra", monto: 730000, moneda: "ARS", tc: 1460 }),
      op({ fecha: "2026-07-03", tipo: "venta", monto: 800, moneda: "USD", tc: 1480, costos: 5000 }),
      op({ fecha: "2026-07-04", tipo: "venta", monto: 452500, moneda: "ARS", tc: 1520 }),
    ]);
    expect(r[3].usd).toBeCloseTo(297.6973684, 6);
    expect(r[3].ars).toBe(452500);
    expect(r[3].margen).toBeCloseTo(29769.74, 2);
    expect(r[3].stock).toBeCloseTo(402.3026316, 6);
    expect(r[3].costoTotal).toBeCloseTo(571269.74, 2);
    expect(r.reduce((s, x) => s + x.margen, 0)).toBeCloseTo(72769.74, 2);
  });

  it("ordena por fecha antes de calcular: el orden de carga no cambia el resultado", () => {
    // Ésta es la diferencia central con la planilla, donde cargar una
    // operación fuera de orden rompía todos los números de abajo.
    const desordenadas = calcular([
      op({ fecha: "2026-07-03", tipo: "venta", monto: 800, moneda: "USD", tc: 1480, costos: 5000 }),
      op({ fecha: "2026-07-01", tipo: "compra", monto: 1000, moneda: "USD", tc: 1400 }),
      op({ fecha: "2026-07-02", tipo: "compra", monto: 730000, moneda: "ARS", tc: 1460 }),
    ]);
    expect(desordenadas.map((x) => x.fecha)).toEqual(["2026-07-01", "2026-07-02", "2026-07-03"]);
    expect(desordenadas[2].margen).toBe(43000);
  });

  it("desempata por creadaEn dentro del mismo día", () => {
    const r = calcular([
      { ...op({ fecha: "2026-07-01", tipo: "venta", monto: 100, moneda: "USD", tc: 1500 }), id: "b", creadaEn: "2026-07-01T12:00:00Z" },
      { ...op({ fecha: "2026-07-01", tipo: "compra", monto: 100, moneda: "USD", tc: 1400 }), id: "a", creadaEn: "2026-07-01T09:00:00Z" },
    ]);
    expect(r.map((x) => x.id)).toEqual(["a", "b"]);
    expect(r[1].margen).toBe(10000);
  });

  it("vender más de lo que hay deja el stock negativo en vez de fingir que cierra", () => {
    // Es una señal de carga: falta una compra. Se muestra en rojo en la UI,
    // no se corrige en silencio.
    const r = calcular([
      op({ fecha: "2026-07-01", tipo: "compra", monto: 100, moneda: "USD", tc: 1400 }),
      op({ fecha: "2026-07-02", tipo: "venta", monto: 150, moneda: "USD", tc: 1500 }),
    ]);
    expect(r[1].stock).toBe(-50);
    // Sin stock no hay costo promedio nuevo: se conserva el último válido.
    expect(r[1].costoPromedio).toBe(1400);
  });

  it("no muta el array que recibe", () => {
    const entrada = [
      op({ fecha: "2026-07-03", tipo: "compra", monto: 1, moneda: "USD", tc: 1400 }),
      op({ fecha: "2026-07-01", tipo: "compra", monto: 1, moneda: "USD", tc: 1400 }),
    ];
    calcular(entrada);
    expect(entrada.map((x) => x.fecha)).toEqual(["2026-07-03", "2026-07-01"]);
  });
});
```

- [ ] **Step 3: Correr el test para verificar que falla**

Run: `npm test -- lib/cambio/calculo.test.ts`
Expected: FAIL — `Failed to resolve import "./calculo"`.

- [ ] **Step 4: Escribir la implementación**

Crear `lib/cambio/calculo.ts`:

```ts
import type { Operacion, Moneda } from "./tipos";

export type OperacionCalculada = Operacion & {
  /** Dólares que se movieron. */
  usd: number;
  /** Pesos que se movieron. */
  ars: number;
  /** Costo promedio del stock DESPUÉS de esta operación. */
  costoPromedio: number;
  /** Ganancia de esta operación. Cero en las compras. */
  margen: number;
  /** Stock de dólares DESPUÉS de esta operación. */
  stock: number;
  /** Costo total en pesos del stock DESPUÉS de esta operación. */
  costoTotal: number;
};

/**
 * El usuario carga UN solo importe y aclara en qué moneda está: a veces
 * conoce el monto en pesos ("recibí 452.500") y a veces en dólares ("me
 * pidieron 300"). Forzar una sola dirección obliga a dividir a mano la mitad
 * de las veces, que es lo que hacía inusable la planilla anterior.
 */
export function importes(op: { monto: number; moneda: Moneda; tc: number }): { usd: number; ars: number } {
  // Un TC en cero no es "gratis": es una fila a medio cargar. Devolver ceros
  // deja la fila neutra en vez de propagar Infinity por todo el cálculo.
  if (!Number.isFinite(op.tc) || op.tc <= 0) return { usd: 0, ars: 0 };
  return op.moneda === "ARS"
    ? { usd: op.monto / op.tc, ars: op.monto }
    : { usd: op.monto, ars: op.monto * op.tc };
}

/** Fecha, y dentro del mismo día el orden de carga. */
function porFecha(a: Operacion, b: Operacion): number {
  if (a.fecha !== b.fecha) return a.fecha < b.fecha ? -1 : 1;
  if (a.creadaEn !== b.creadaEn) return a.creadaEn < b.creadaEn ? -1 : 1;
  return 0;
}

/**
 * Costo promedio ponderado móvil: cada compra recalcula el costo promedio de
 * todo el stock, cada venta descarga a ese costo. Los costos se capitalizan
 * en las compras y se restan del margen en las ventas.
 *
 * Ordena por fecha ANTES de recorrer. En la planilla que este módulo
 * reemplaza el cálculo dependía del orden físico de las filas, así que
 * cargar una operación de ayer rompía todos los números de abajo en
 * silencio. Acá el orden de carga es irrelevante.
 */
export function calcular(ops: Operacion[]): OperacionCalculada[] {
  const ordenadas = [...ops].sort(porFecha);

  let stock = 0;
  let costoTotal = 0;
  let ultimoPromedio = 0;

  return ordenadas.map((op) => {
    const { usd, ars } = importes(op);
    const promedioPrevio = stock > 0 ? costoTotal / stock : ultimoPromedio;
    let margen = 0;

    if (op.tipo === "compra") {
      stock += usd;
      costoTotal += ars + op.costos;
    } else {
      margen = ars - usd * promedioPrevio - op.costos;
      costoTotal -= usd * promedioPrevio;
      stock -= usd;
    }

    // Sin stock no hay promedio que calcular: se conserva el último válido en
    // vez de devolver cero, que se leería como "los dólares no costaron nada".
    const costoPromedio = stock > 0 ? costoTotal / stock : promedioPrevio;
    ultimoPromedio = costoPromedio;

    return { ...op, usd, ars, margen, stock, costoTotal, costoPromedio };
  });
}
```

- [ ] **Step 5: Correr los tests**

Run: `npm test -- lib/cambio/calculo.test.ts`
Expected: PASS, 11 tests.

- [ ] **Step 6: Lint y commit**

```bash
npm run lint
git add lib/cambio/tipos.ts lib/cambio/calculo.ts lib/cambio/calculo.test.ts
git commit -m "feat(cambio): costo promedio ponderado móvil

Ordena por fecha antes de recorrer: a diferencia de la planilla que
reemplaza, el orden de carga no altera los números. Vender más de lo que hay
deja el stock negativo a propósito, como señal de que falta cargar una compra.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Agregaciones (cajas, clientes, personas, resumen)

**Files:**
- Create: `lib/cambio/reportes.ts`
- Test: `lib/cambio/reportes.test.ts`

**Interfaces:**
- Consumes: `OperacionCalculada` de `./calculo`, `Caja` de `./tipos`.
- Produces:
  - `type SaldoCaja = { id, nombre, moneda, saldoInicial, movimientos, ajuste, saldo }`
  - `type FilaCliente = { cliente, usdComprados, usdVendidos, volumen, margen, tcPromedioCompra, tcPromedioVenta, operaciones }`
  - `type FilaPersona = { persona, comoEmisor, comoReceptor, volumen, operaciones }`
  - `type ResumenCambio = { stockUsd, costoPromedio, costoTotal, margenTotal, margenDelMes, volumenUsd, operaciones }`
  - `saldosDeCajas(ops, cajas): SaldoCaja[]`
  - `rankingClientes(ops): FilaCliente[]`
  - `rankingPersonas(ops): FilaPersona[]`
  - `resumir(ops, hoy: string): ResumenCambio`

- [ ] **Step 1: Escribir el test que falla**

Crear `lib/cambio/reportes.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { calcular } from "./calculo";
import { saldosDeCajas, rankingClientes, rankingPersonas, resumir } from "./reportes";
import type { Operacion, Caja } from "./tipos";

const CAJAS: Caja[] = [
  { id: "ars1", nombre: "Banco $", moneda: "ARS", saldoInicial: 0, ajuste: 0 },
  { id: "usd1", nombre: "Efectivo USD", moneda: "USD", saldoInicial: 0, ajuste: 0 },
];

function op(over: Partial<Operacion> & Pick<Operacion, "fecha" | "tipo" | "monto" | "moneda" | "tc">): Operacion {
  return {
    id: String(Math.random()),
    creadaEn: `${over.fecha}T10:00:00Z`,
    clienteId: "c1",
    cliente: "Juan Perez",
    emisor: "Juan Perez",
    receptor: "Ana Perez",
    cajaArsId: "ars1",
    cajaUsdId: "usd1",
    costos: 0,
    notas: "",
    ...over,
  };
}

const OPS = calcular([
  op({ fecha: "2026-07-01", tipo: "compra", monto: 1000, moneda: "USD", tc: 1400 }),
  op({ fecha: "2026-07-02", tipo: "venta", monto: 800, moneda: "USD", tc: 1480, costos: 5000, cliente: "Carlos Ruiz", clienteId: "c2", emisor: "Deposito Sur", receptor: "Carlos Ruiz" }),
]);

describe("saldosDeCajas", () => {
  it("la caja de pesos baja con las compras, sube con las ventas y descuenta los costos", () => {
    const s = saldosDeCajas(OPS, CAJAS);
    // −1.400.000 de la compra, +1.184.000 de la venta, −5.000 de costos
    expect(s.find((x) => x.id === "ars1")!.saldo).toBe(-221000);
  });

  it("la caja de dólares sube con las compras y baja con las ventas", () => {
    expect(saldosDeCajas(OPS, CAJAS).find((x) => x.id === "usd1")!.saldo).toBe(200);
  });

  it("suma el saldo inicial y el ajuste manual", () => {
    const cajas: Caja[] = [{ ...CAJAS[1], saldoInicial: 50, ajuste: -3 }];
    expect(saldosDeCajas(OPS, cajas)[0].saldo).toBe(247);
  });

  it("una caja sin movimientos queda en su saldo inicial, no se omite", () => {
    const cajas: Caja[] = [{ id: "z", nombre: "USDT", moneda: "USD", saldoInicial: 10, ajuste: 0 }];
    expect(saldosDeCajas(OPS, cajas)[0]).toMatchObject({ movimientos: 0, saldo: 10 });
  });
});

describe("rankingClientes", () => {
  it("atribuye el margen al cliente de la operación", () => {
    const r = rankingClientes(OPS);
    // OPS tiene SOLO dos operaciones, así que el costo promedio es 1400 (no
    // 1420, que corresponde al escenario de tres de calculo.test.ts):
    // 800 × 1480 − 800 × 1400 − 5000 = 59.000
    expect(r.find((x) => x.cliente === "Carlos Ruiz")!.margen).toBe(59000);
    expect(r.find((x) => x.cliente === "Juan Perez")!.margen).toBe(0);
  });

  it("separa dólares comprados de vendidos y calcula el TC promedio de cada lado", () => {
    const juan = rankingClientes(OPS).find((x) => x.cliente === "Juan Perez")!;
    expect(juan.usdComprados).toBe(1000);
    expect(juan.usdVendidos).toBe(0);
    expect(juan.tcPromedioCompra).toBe(1400);
    expect(juan.tcPromedioVenta).toBe(0);
  });

  it("ordena por volumen descendente", () => {
    expect(rankingClientes(OPS).map((x) => x.cliente)).toEqual(["Juan Perez", "Carlos Ruiz"]);
  });
});

describe("rankingPersonas", () => {
  it("cuenta a cada persona como emisor y como receptor por separado", () => {
    const r = rankingPersonas(OPS);
    expect(r.find((x) => x.persona === "Ana Perez")).toMatchObject({ comoEmisor: 0, comoReceptor: 1000 });
    expect(r.find((x) => x.persona === "Juan Perez")).toMatchObject({ comoEmisor: 1000, comoReceptor: 0 });
  });

  it("agrupa ignorando mayúsculas y espacios de más", () => {
    // El usuario escribe a mano: "Ana Perez" y "ana perez " son la misma
    // persona y tienen que sumar en una sola fila.
    const ops = calcular([
      op({ fecha: "2026-07-01", tipo: "compra", monto: 100, moneda: "USD", tc: 1400, receptor: "Ana Perez" }),
      op({ fecha: "2026-07-02", tipo: "compra", monto: 100, moneda: "USD", tc: 1400, receptor: "  ana perez " }),
    ]);
    const ana = rankingPersonas(ops).filter((x) => x.persona.toLowerCase().trim() === "ana perez");
    expect(ana).toHaveLength(1);
    expect(ana[0].comoReceptor).toBe(200);
    // Conserva la primera forma que se escribió, no la última ni la normalizada.
    expect(ana[0].persona).toBe("Ana Perez");
  });

  it("ignora los nombres vacíos", () => {
    const ops = calcular([op({ fecha: "2026-07-01", tipo: "compra", monto: 100, moneda: "USD", tc: 1400, emisor: "", receptor: "" })]);
    expect(rankingPersonas(ops)).toEqual([]);
  });
});

describe("resumir", () => {
  it("toma el stock y el costo promedio de la última operación", () => {
    const r = resumir(OPS, "2026-07-15");
    expect(r.stockUsd).toBe(200);
    expect(r.costoPromedio).toBe(1400);
  });

  it("el margen del mes solo cuenta las operaciones del mes de hoy", () => {
    const ops = calcular([
      op({ fecha: "2026-06-10", tipo: "compra", monto: 1000, moneda: "USD", tc: 1400 }),
      op({ fecha: "2026-06-20", tipo: "venta", monto: 500, moneda: "USD", tc: 1500 }),
      op({ fecha: "2026-07-05", tipo: "venta", monto: 100, moneda: "USD", tc: 1600 }),
    ]);
    const r = resumir(ops, "2026-07-15");
    expect(r.margenTotal).toBeCloseTo(50000 + 20000, 2);
    expect(r.margenDelMes).toBeCloseTo(20000, 2);
  });

  it("sin operaciones devuelve todo en cero en vez de romper", () => {
    expect(resumir([], "2026-07-15")).toMatchObject({ stockUsd: 0, costoPromedio: 0, margenTotal: 0, operaciones: 0 });
  });
});
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `npm test -- lib/cambio/reportes.test.ts`
Expected: FAIL — `Failed to resolve import "./reportes"`.

- [ ] **Step 3: Escribir la implementación**

Crear `lib/cambio/reportes.ts`:

```ts
import type { OperacionCalculada } from "./calculo";
import type { Caja, Moneda } from "./tipos";

export type SaldoCaja = {
  id: string;
  nombre: string;
  moneda: Moneda;
  saldoInicial: number;
  movimientos: number;
  ajuste: number;
  saldo: number;
};

export type FilaCliente = {
  cliente: string;
  usdComprados: number;
  usdVendidos: number;
  volumen: number;
  margen: number;
  tcPromedioCompra: number;
  tcPromedioVenta: number;
  operaciones: number;
};

export type FilaPersona = {
  persona: string;
  comoEmisor: number;
  comoReceptor: number;
  volumen: number;
  operaciones: number;
};

export type ResumenCambio = {
  stockUsd: number;
  costoPromedio: number;
  costoTotal: number;
  margenTotal: number;
  margenDelMes: number;
  volumenUsd: number;
  operaciones: number;
};

/**
 * Movimientos de cada caja. Una caja sin movimientos aparece igual, en su
 * saldo inicial: omitirla la haría ver como si no existiera.
 */
export function saldosDeCajas(ops: OperacionCalculada[], cajas: Caja[]): SaldoCaja[] {
  return cajas.map((caja) => {
    let movimientos = 0;
    for (const op of ops) {
      if (caja.moneda === "ARS" && op.cajaArsId === caja.id) {
        // En una venta entran pesos, en una compra salen. Los costos siempre
        // salen de la caja de pesos.
        movimientos += (op.tipo === "venta" ? op.ars : -op.ars) - op.costos;
      } else if (caja.moneda === "USD" && op.cajaUsdId === caja.id) {
        movimientos += op.tipo === "compra" ? op.usd : -op.usd;
      }
    }
    return {
      id: caja.id,
      nombre: caja.nombre,
      moneda: caja.moneda,
      saldoInicial: caja.saldoInicial,
      movimientos,
      ajuste: caja.ajuste,
      saldo: caja.saldoInicial + movimientos + caja.ajuste,
    };
  });
}

/** El margen es de la relación comercial, así que se atribuye al cliente. */
export function rankingClientes(ops: OperacionCalculada[]): FilaCliente[] {
  const acc = new Map<string, FilaCliente & { arsCompra: number; arsVenta: number }>();

  for (const op of ops) {
    const clave = op.cliente.trim() || "(sin cliente)";
    const f = acc.get(clave) ?? {
      cliente: clave, usdComprados: 0, usdVendidos: 0, volumen: 0, margen: 0,
      tcPromedioCompra: 0, tcPromedioVenta: 0, operaciones: 0, arsCompra: 0, arsVenta: 0,
    };
    f.operaciones += 1;
    f.margen += op.margen;
    if (op.tipo === "compra") {
      f.usdComprados += op.usd;
      f.arsCompra += op.ars;
    } else {
      f.usdVendidos += op.usd;
      f.arsVenta += op.ars;
    }
    acc.set(clave, f);
  }

  return [...acc.values()]
    .map((f) => ({
      cliente: f.cliente,
      usdComprados: f.usdComprados,
      usdVendidos: f.usdVendidos,
      volumen: f.usdComprados + f.usdVendidos,
      margen: f.margen,
      // Promedio ponderado por monto, no de los TC sueltos: una operación de
      // 10.000 pesa más que una de 100 al describir a qué precio se opera.
      tcPromedioCompra: f.usdComprados > 0 ? f.arsCompra / f.usdComprados : 0,
      tcPromedioVenta: f.usdVendidos > 0 ? f.arsVenta / f.usdVendidos : 0,
      operaciones: f.operaciones,
    }))
    .sort((a, b) => b.volumen - a.volumen);
}

/**
 * Emisores y receptores se escriben a mano, así que "Ana Perez" y
 * "ana perez " son la misma persona y tienen que sumar en una sola fila. Se
 * agrupa por el nombre normalizado y se muestra la primera forma escrita.
 */
export function rankingPersonas(ops: OperacionCalculada[]): FilaPersona[] {
  const acc = new Map<string, FilaPersona>();

  const sumar = (nombre: string, usd: number, rol: "emisor" | "receptor") => {
    const limpio = nombre.trim();
    if (!limpio) return;
    const clave = limpio.toLowerCase();
    const f = acc.get(clave) ?? { persona: limpio, comoEmisor: 0, comoReceptor: 0, volumen: 0, operaciones: 0 };
    if (rol === "emisor") f.comoEmisor += usd;
    else f.comoReceptor += usd;
    f.volumen += usd;
    f.operaciones += 1;
    acc.set(clave, f);
  };

  for (const op of ops) {
    sumar(op.emisor, op.usd, "emisor");
    sumar(op.receptor, op.usd, "receptor");
  }

  return [...acc.values()].sort((a, b) => b.volumen - a.volumen);
}

export function resumir(ops: OperacionCalculada[], hoy: string): ResumenCambio {
  // `calcular` ya devolvió las operaciones ordenadas, así que el stock y el
  // costo promedio vigentes son los de la última.
  const ultima = ops[ops.length - 1];
  const inicioDeMes = `${hoy.slice(0, 7)}-01`;

  return {
    stockUsd: ultima?.stock ?? 0,
    costoPromedio: ultima?.costoPromedio ?? 0,
    costoTotal: ultima?.costoTotal ?? 0,
    margenTotal: ops.reduce((s, o) => s + o.margen, 0),
    margenDelMes: ops.filter((o) => o.fecha >= inicioDeMes).reduce((s, o) => s + o.margen, 0),
    volumenUsd: ops.reduce((s, o) => s + o.usd, 0),
    operaciones: ops.length,
  };
}
```

- [ ] **Step 4: Correr los tests**

Run: `npm test -- lib/cambio/`
Expected: PASS, los 10 de `calculo` más los 13 de `reportes`.

- [ ] **Step 5: Lint y commit**

```bash
npm run lint
git add lib/cambio/reportes.ts lib/cambio/reportes.test.ts
git commit -m "feat(cambio): saldos de caja, rankings y resumen

Las personas se agrupan por nombre normalizado: se escriben a mano y
'Ana Perez' y 'ana perez' son la misma. El TC promedio se pondera por monto,
no por cantidad de operaciones.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Capa de datos

**Files:**
- Create: `lib/cambio/datos.ts`

**Interfaces:**
- Consumes: `calcular` de `./calculo`; `saldosDeCajas`, `rankingClientes`, `rankingPersonas`, `resumir` de `./reportes`; `createClient` de `@/lib/supabase/server`; `hoyISO` de `@/lib/finanzas/datos`.
- Produces:
  - `getDatosCambio(hoy?: string): Promise<{ operaciones, cajas, clientes, personas, saldos, resumen }>`
  - `getClientesParaOperacion(): Promise<{ id: string; nombre: string }[]>`
  - `getCajasParaOperacion(): Promise<{ id: string; nombre: string; moneda: Moneda }[]>`

- [ ] **Step 1: Escribir la implementación**

Crear `lib/cambio/datos.ts`:

```ts
import { createClient } from "@/lib/supabase/server";
import { hoyISO } from "@/lib/finanzas/datos";
import { calcular, type OperacionCalculada } from "./calculo";
import { saldosDeCajas, rankingClientes, rankingPersonas, resumir } from "./reportes";
import type { Operacion, Caja, Moneda, TipoOperacion } from "./tipos";
import type { SaldoCaja, FilaCliente, FilaPersona, ResumenCambio } from "./reportes";

export { hoyISO };

const TIPOS: TipoOperacion[] = ["compra", "venta"];
const MONEDAS: Moneda[] = ["ARS", "USD"];

/**
 * Un valor desconocido en la base no rompe la UI: cae al default declarado,
 * pero deja rastro. Sin esto un `kind` corrupto se vuelve "compra" para
 * siempre y nada lo dice — y una compra fantasma infla el stock.
 */
function unaDe<T extends string>(campo: string, valores: T[], v: unknown, porDefecto: T): T {
  if (valores.includes(v as T)) return v as T;
  console.warn(`[cambio] valor desconocido en ${campo}:`, v);
  return porDefecto;
}

function uno<T>(rel: T | T[] | null): T | null {
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

type OpRow = {
  id: string;
  op_date: string;
  created_at: string;
  kind: string;
  client_id: string | null;
  sender: string;
  receiver: string;
  amount: number | string;
  amount_currency: string;
  rate: number | string;
  ars_account_id: string | null;
  usd_account_id: string | null;
  fees: number | string;
  notes: string;
  exchange_clients: { name: string } | { name: string }[] | null;
};

const COLUMNAS_OPS =
  "id,op_date,created_at,kind,client_id,sender,receiver,amount,amount_currency,rate,ars_account_id,usd_account_id,fees,notes,exchange_clients(name)";

function aOperacion(r: OpRow): Operacion {
  return {
    id: r.id,
    fecha: r.op_date,
    creadaEn: r.created_at,
    tipo: unaDe("kind", TIPOS, r.kind, "compra"),
    clienteId: r.client_id,
    cliente: uno(r.exchange_clients)?.name ?? "",
    emisor: r.sender,
    receptor: r.receiver,
    monto: Number(r.amount),
    moneda: unaDe("amount_currency", MONEDAS, r.amount_currency, "USD"),
    tc: Number(r.rate),
    cajaArsId: r.ars_account_id,
    cajaUsdId: r.usd_account_id,
    costos: Number(r.fees),
    notas: r.notes,
  };
}

type CajaRow = {
  id: string;
  name: string;
  currency: string;
  opening_balance: number | string;
  adjustment: number | string;
};

function aCaja(r: CajaRow): Caja {
  return {
    id: r.id,
    nombre: r.name,
    moneda: unaDe("currency", MONEDAS, r.currency, "ARS"),
    saldoInicial: Number(r.opening_balance),
    ajuste: Number(r.adjustment),
  };
}

export type DatosCambio = {
  operaciones: OperacionCalculada[];
  saldos: SaldoCaja[];
  clientes: FilaCliente[];
  personas: FilaPersona[];
  resumen: ResumenCambio;
};

/**
 * Una sola lectura para toda la pantalla: el costo promedio de cualquier
 * operación depende de todas las anteriores, así que no se puede paginar ni
 * traer un subconjunto sin recalcular mal.
 */
export async function getDatosCambio(hoy: string = hoyISO()): Promise<DatosCambio> {
  const sb = await createClient();
  const [{ data: ops, error: errOps }, { data: cajas, error: errCajas }] = await Promise.all([
    sb.from("exchange_ops").select(COLUMNAS_OPS),
    sb.from("exchange_accounts").select("id,name,currency,opening_balance,adjustment").eq("active", true).order("currency").order("name"),
  ]);

  // Con RLS activo una lectura sin sesión devuelve cero filas SIN error: se
  // ve igual que "todavía no cargaste operaciones". Sin este log, una
  // política mal puesta pasa por estado vacío legítimo.
  const fallo = errOps ?? errCajas;
  if (fallo) console.error("[cambio] lectura falló:", fallo.message, fallo.details ?? "");

  const operaciones = calcular(((ops ?? []) as unknown as OpRow[]).map(aOperacion));
  const listaCajas = ((cajas ?? []) as unknown as CajaRow[]).map(aCaja);

  return {
    operaciones,
    saldos: saldosDeCajas(operaciones, listaCajas),
    clientes: rankingClientes(operaciones),
    personas: rankingPersonas(operaciones),
    resumen: resumir(operaciones, hoy),
  };
}

export async function getClientesParaOperacion(): Promise<{ id: string; nombre: string }[]> {
  const sb = await createClient();
  const { data, error } = await sb.from("exchange_clients").select("id,name").eq("active", true).order("name");
  // Sin este log, un error de lectura se ve igual que "no hay clientes": el
  // select queda vacío y no se puede cargar ninguna operación.
  if (error) console.error("[cambio] lectura falló:", error.message, error.details ?? "");
  return (data ?? []).map((c) => ({ id: c.id as string, nombre: c.name as string }));
}

export async function getCajasParaOperacion(): Promise<{ id: string; nombre: string; moneda: Moneda }[]> {
  const sb = await createClient();
  const { data, error } = await sb
    .from("exchange_accounts")
    .select("id,name,currency")
    .eq("active", true)
    .order("name");
  if (error) console.error("[cambio] lectura falló:", error.message, error.details ?? "");
  return (data ?? []).map((c) => ({
    id: c.id as string,
    nombre: c.name as string,
    moneda: unaDe("currency", MONEDAS, c.currency, "ARS"),
  }));
}
```

- [ ] **Step 2: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sin errores en `lib/cambio/`.

- [ ] **Step 3: Lint y commit**

```bash
npm run lint
git add lib/cambio/datos.ts
git commit -m "feat(cambio): capa de lectura

Una sola lectura para toda la pantalla: el costo promedio de cada operación
depende de todas las anteriores, así que paginar daría números mal.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Server action de alta

**Files:**
- Create: `app/(app)/cambio/actions.ts`
- Test: `app/(app)/cambio/actions.test.ts`

**Interfaces:**
- Consumes: `parsearMonto` de `@/lib/finanzas/montos`; `createClient` de `@/lib/supabase/server`.
- Produces: `createExchangeOp(formData: FormData): Promise<ResultadoAlta>` con `ResultadoAlta = { ok: true } | { ok: false; error: string }`. Campos del FormData: `kind`, `opDate`, `clientId`, `sender`, `receiver`, `amount`, `amountCurrency`, `rate`, `arsAccountId`, `usdAccountId`, `fees`, `notes`.

- [ ] **Step 1: Escribir el test que falla**

Crear `app/(app)/cambio/actions.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const insertMock = vi.fn();
const singleMock = vi.fn(async () => ({ data: { id: "empresa-1" }, error: null }));
const fromMock = vi.fn((tabla: string) => {
  if (tabla === "companies") {
    return { select: () => ({ ilike: () => ({ limit: () => ({ single: singleMock }) }) }) };
  }
  return { insert: insertMock };
});
const createClientMock = vi.fn(async () => ({ from: fromMock }));

vi.mock("@/lib/supabase/server", () => ({ createClient: () => createClientMock() }));

const revalidatePathMock = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (p: string) => revalidatePathMock(p) }));

import { createExchangeOp } from "./actions";

function fd(overrides: Record<string, string> = {}): FormData {
  const base: Record<string, string> = {
    kind: "venta",
    opDate: "2026-07-22",
    clientId: "cli-1",
    sender: "Deposito Sur SRL",
    receiver: "Carlos Ruiz",
    amount: "452.500",
    amountCurrency: "ARS",
    rate: "1520",
    arsAccountId: "ars-1",
    usdAccountId: "usd-1",
    fees: "",
    notes: "",
  };
  const data = new FormData();
  for (const [k, v] of Object.entries({ ...base, ...overrides })) data.set(k, v);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  insertMock.mockResolvedValue({ error: null });
});

describe("createExchangeOp", () => {
  it("guarda el monto tal como lo tipeó el usuario, a la argentina", async () => {
    const r = await createExchangeOp(fd());
    expect(r).toEqual({ ok: true });
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 452500, amount_currency: "ARS", rate: 1520, kind: "venta" }),
    );
  });

  it("no guarda los USD ni los pesos: se derivan del monto y el TC", async () => {
    await createExchangeOp(fd());
    const payload = insertMock.mock.calls[0][0];
    expect(payload).not.toHaveProperty("usd");
    expect(payload).not.toHaveProperty("ars");
  });

  it("rechaza un tipo de operación que no sea compra o venta", async () => {
    expect(await createExchangeOp(fd({ kind: "regalo" }))).toEqual({
      ok: false,
      error: "El tipo de operación no es válido.",
    });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rechaza una moneda que no sea ARS o USD", async () => {
    expect(await createExchangeOp(fd({ amountCurrency: "EUR" }))).toEqual({
      ok: false,
      error: "La moneda del monto no es válida.",
    });
  });

  it("rechaza un TC en cero: dividiría por cero al calcular los dólares", async () => {
    const r = await createExchangeOp(fd({ rate: "0" }));
    expect(r.ok).toBe(false);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rechaza un monto mal escrito en vez de adivinar", async () => {
    const r = await createExchangeOp(fd({ amount: "452.5oo" }));
    expect(r.ok).toBe(false);
  });

  it("exige la fecha", async () => {
    expect(await createExchangeOp(fd({ opDate: "" }))).toEqual({ ok: false, error: "Falta la fecha." });
  });

  it("los costos vacíos son cero, no un error", async () => {
    await createExchangeOp(fd({ fees: "" }));
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ fees: 0 }));
  });

  it('escribir "0" en costos es cero, no un error de validación', async () => {
    // parsearMonto rechaza el cero por diseño, pero acá el cero es el caso
    // normal: la mayoría de las operaciones no tienen comisión, y el
    // formulario sugiere justamente "0" como placeholder.
    for (const cero of ["0", "0,00", "00"]) {
      insertMock.mockClear();
      const r = await createExchangeOp(fd({ fees: cero }));
      expect(r, `fees=${cero}`).toEqual({ ok: true });
      expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ fees: 0 }));
    }
  });

  it("sigue rechazando un costo mal escrito", async () => {
    expect(await createExchangeOp(fd({ fees: "5oo" }))).toEqual({
      ok: false,
      error: "Los costos no son un monto válido.",
    });
  });

  it("informa el fallo cuando el insert devuelve error", async () => {
    insertMock.mockResolvedValue({ error: { message: "rls", details: "" } });
    expect(await createExchangeOp(fd())).toEqual({
      ok: false,
      error: "No se pudo guardar la operación. Probá de nuevo.",
    });
  });

  it("informa el fallo cuando el insert rechaza la promesa", async () => {
    insertMock.mockRejectedValue(new Error("red caída"));
    const r = await createExchangeOp(fd());
    expect(r.ok).toBe(false);
  });

  it("una operación guardada sigue siendo ok aunque revalidatePath falle", async () => {
    // Reportar como fallida un alta ya commiteada hace que el usuario la
    // vuelva a cargar y duplique la operación.
    revalidatePathMock.mockImplementationOnce(() => {
      throw new Error("boom");
    });
    expect(await createExchangeOp(fd())).toEqual({ ok: true });
  });
});
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `npm test -- app/\(app\)/cambio/actions.test.ts`
Expected: FAIL — no existe `./actions`.

- [ ] **Step 3: Escribir la implementación**

Crear `app/(app)/cambio/actions.ts`:

```ts
"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parsearMonto } from "@/lib/finanzas/montos";
import type { TipoOperacion, Moneda } from "@/lib/cambio/tipos";

// Las mismas uniones de tipos.ts, como array para poder validar un valor de
// FormData en runtime. Si tipos.ts cambia, este array se actualiza a mano:
// TypeScript no deriva un array de miembros desde una unión de literals.
const TIPOS: TipoOperacion[] = ["compra", "venta"];
const MONEDAS: Moneda[] = ["ARS", "USD"];

function esTipoValido(v: string): v is TipoOperacion {
  return (TIPOS as string[]).includes(v);
}

function esMonedaValida(v: string): v is Moneda {
  return (MONEDAS as string[]).includes(v);
}

/**
 * Los costos son opcionales y CERO es un valor legítimo: la mayoría de las
 * operaciones no tienen comisión. `parsearMonto` rechaza el cero a propósito
 * (un gasto de $0 no es un gasto), así que acá el caso se resuelve antes de
 * delegarle — si no, escribir "0" en el campo daba error de validación.
 */
function parsearCostos(texto: string): number | null {
  const s = texto.trim();
  if (s === "") return 0;
  if (/^0+([.,]0+)?$/.test(s)) return 0;
  return parsearMonto(s);
}

export type ResultadoAlta = { ok: true } | { ok: false; error: string };

export async function createExchangeOp(formData: FormData): Promise<ResultadoAlta> {
  const opDate = String(formData.get("opDate") ?? "").trim();
  if (!opDate) return { ok: false, error: "Falta la fecha." };

  // Un <select> nunca manda algo fuera de estos sets, pero un server action
  // recibe FormData arbitrario: se valida contra la misma fuente de verdad
  // que usa la lectura en vez de confiar en el origen del pedido.
  const kind = String(formData.get("kind") ?? "");
  if (!esTipoValido(kind)) return { ok: false, error: "El tipo de operación no es válido." };

  const amountCurrency = String(formData.get("amountCurrency") ?? "");
  if (!esMonedaValida(amountCurrency)) return { ok: false, error: "La moneda del monto no es válida." };

  const amount = parsearMonto(String(formData.get("amount") ?? ""));
  if (amount === null) {
    return {
      ok: false,
      error: "El monto no es válido. Escribilo a la argentina, con coma decimal (ej: 452.500,50).",
    };
  }

  // Un TC en cero o negativo haría dividir por cero al derivar los dólares, y
  // dejaría la operación neutra en todos los totales sin decir por qué.
  const rate = parsearMonto(String(formData.get("rate") ?? ""));
  if (rate === null) {
    return { ok: false, error: "El tipo de cambio no es válido. Tiene que ser un número mayor a cero." };
  }

  const fees = parsearCostos(String(formData.get("fees") ?? ""));
  if (fees === null) return { ok: false, error: "Los costos no son un monto válido." };

  try {
    const sb = await createClient();

    const { data: empresa } = await sb
      .from("companies")
      .select("id")
      .ilike("name", "%gestiones%ma%")
      .limit(1)
      .single();

    if (!empresa) {
      console.error("[cambio] no se encontró la empresa GESTIONES MA en companies");
      return { ok: false, error: "No se encontró la empresa. Avisá al administrador." };
    }

    const { error } = await sb.from("exchange_ops").insert({
      company_id: empresa.id,
      op_date: opDate,
      kind,
      client_id: String(formData.get("clientId") ?? "") || null,
      sender: String(formData.get("sender") ?? "").trim(),
      receiver: String(formData.get("receiver") ?? "").trim(),
      // Se guarda UN solo importe. Los USD y los pesos se derivan en
      // lib/cambio/calculo.ts: guardar los tres permitiría estados que se
      // contradicen entre sí.
      amount,
      amount_currency: amountCurrency,
      rate,
      ars_account_id: String(formData.get("arsAccountId") ?? "") || null,
      usd_account_id: String(formData.get("usdAccountId") ?? "") || null,
      fees,
      notes: String(formData.get("notes") ?? "").trim(),
    });

    // Una inserción que falla en silencio se ve, desde el modal, igual que
    // una que funcionó: el usuario cierra el form creyendo que quedó.
    if (error) {
      console.error("[cambio] alta de operación falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo guardar la operación. Probá de nuevo." };
    }
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[cambio] alta de operación falló:", err.message);
    return { ok: false, error: "No se pudo guardar la operación. Probá de nuevo." };
  }

  // El insert ya commiteó. revalidatePath es best-effort y va en su propio
  // try/catch: reportar como fallida un alta que ya ocurrió hace que el
  // usuario la vuelva a cargar y duplique la operación.
  try {
    revalidatePath("/cambio");
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[cambio] la operación se guardó pero revalidatePath falló:", err.message);
  }

  return { ok: true };
}
```

- [ ] **Step 4: Correr los tests**

Run: `npm test`
Expected: PASS — todo el suite, incluidos los 13 nuevos.

- [ ] **Step 5: Lint y commit**

```bash
npm run lint
git add "app/(app)/cambio/actions.ts" "app/(app)/cambio/actions.test.ts"
git commit -m "feat(cambio): alta de operación

Guarda un solo importe con su moneda: los USD y los pesos se derivan, así no
pueden quedar contradiciéndose. Rechaza TC en cero, que dividiría por cero.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Pantalla y tabla de operaciones

**Files:**
- Create: `app/(app)/cambio/page.tsx`
- Create: `components/cambio/tabla-operaciones.tsx`
- Modify: `components/shell/sidebar.tsx` (array `nav`, línea ~19)

**Interfaces:**
- Consumes: `getDatosCambio`, `getClientesParaOperacion`, `getCajasParaOperacion`, `hoyISO` de `@/lib/cambio/datos`; `formatearPesos` de `@/lib/formato`; `NuevaOperacionButton` de `@/components/cambio/nueva-operacion-form` (Task 7 — hasta entonces, dejar el botón fuera).
- Produces: la ruta `/cambio` renderizando KPIs y tabla.

- [ ] **Step 1: Escribir la tabla**

Crear `components/cambio/tabla-operaciones.tsx`:

```tsx
import type { OperacionCalculada } from "@/lib/cambio/calculo";
import { formatearPesos } from "@/lib/formato";

const th: React.CSSProperties = {
  textAlign: "right", fontSize: 11, color: "var(--muted)", fontWeight: 600,
  padding: "0 0 10px", whiteSpace: "nowrap",
};
const td: React.CSSProperties = {
  textAlign: "right", fontSize: 13, padding: "11px 0", borderTop: "1px solid var(--border)",
  whiteSpace: "nowrap",
};

function usd(n: number): string {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function TablaOperaciones({ filas }: { filas: OperacionCalculada[] }) {
  if (filas.length === 0) {
    return (
      <p style={{ fontSize: 13.5, color: "var(--muted)", margin: 0, padding: "6px 0" }}>
        Todavía no cargaste operaciones. Empezá con el botón <b>Nueva operación</b>.
      </p>
    );
  }

  // Más recientes primero para mirar: `calcular` las devuelve en orden
  // cronológico porque lo necesita para el costo promedio.
  const orden = [...filas].reverse();

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...th, textAlign: "left" }}>Fecha</th>
            <th style={{ ...th, textAlign: "left" }}>Tipo</th>
            <th style={{ ...th, textAlign: "left" }}>Cliente</th>
            <th style={{ ...th, textAlign: "left" }}>Emisor → Receptor</th>
            <th style={th}>USD</th>
            <th style={th}>Pesos</th>
            <th style={th}>TC</th>
            <th style={th}>Margen</th>
            <th style={th}>Stock</th>
          </tr>
        </thead>
        <tbody>
          {orden.map((o) => (
            <tr key={o.id}>
              <td style={{ ...td, textAlign: "left" }}>{o.fecha.split("-").reverse().join("/")}</td>
              <td style={{ ...td, textAlign: "left" }}>
                <span
                  style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                    color: o.tipo === "compra" ? "var(--ok)" : "var(--accent)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {o.tipo === "compra" ? "COMPRA" : "VENTA"}
                </span>
              </td>
              <td style={{ ...td, textAlign: "left" }}>{o.cliente || "—"}</td>
              <td style={{ ...td, textAlign: "left", color: "var(--muted)", fontSize: 12 }}>
                {o.emisor || "—"} → {o.receptor || "—"}
              </td>
              <td style={td} className="tnum">{usd(o.usd)}</td>
              <td style={td} className="tnum">{formatearPesos(o.ars)}</td>
              <td style={td} className="tnum">{o.tc.toLocaleString("es-AR")}</td>
              <td style={{ ...td, color: o.margen > 0 ? "var(--ok)" : "var(--muted)" }} className="tnum">
                {o.tipo === "venta" ? formatearPesos(o.margen) : "—"}
              </td>
              {/* Stock negativo = falta cargar una compra. Se marca en vez de disimularse. */}
              <td style={{ ...td, color: o.stock < 0 ? "var(--warn)" : undefined }} className="tnum">
                {usd(o.stock)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Escribir la página**

Crear `app/(app)/cambio/page.tsx`:

```tsx
import { getDatosCambio, hoyISO } from "@/lib/cambio/datos";
import { formatearPesos } from "@/lib/formato";
import { TablaOperaciones } from "@/components/cambio/tabla-operaciones";

export const dynamic = "force-dynamic";

const panel: React.CSSProperties = {
  background: "var(--glass)",
  backdropFilter: "blur(16px)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: 20,
};

export default async function CambioPage() {
  const hoy = hoyISO();
  const { operaciones, saldos, resumen } = await getDatosCambio(hoy);

  const kpis = [
    { label: "Stock de dólares", valor: resumen.stockUsd.toLocaleString("es-AR", { maximumFractionDigits: 2 }) },
    { label: "Costo promedio", valor: formatearPesos(resumen.costoPromedio) },
    { label: "Margen del mes", valor: formatearPesos(resumen.margenDelMes) },
    { label: "Margen acumulado", valor: formatearPesos(resumen.margenTotal) },
  ];

  return (
    <div style={{ padding: "26px 30px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 780, letterSpacing: "-.5px", margin: 0 }}>Cambio</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "5px 0 0" }}>
            Compra y venta de dólares de Gestiones MA.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ ...panel, padding: "16px 18px" }}>
            <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{k.label}</div>
            <b className="tnum" style={{ fontSize: 23, fontWeight: 780, letterSpacing: "-.6px", display: "block", marginTop: 8 }}>
              {k.valor}
            </b>
          </div>
        ))}
      </div>

      <div style={panel}>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>Cajas</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
          {saldos.map((s) => (
            <div key={s.id}>
              <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{s.nombre}</div>
              <b className="tnum" style={{ fontSize: 16, display: "block", marginTop: 4 }}>
                {s.moneda === "ARS"
                  ? formatearPesos(s.saldo)
                  : `USD ${s.saldo.toLocaleString("es-AR", { maximumFractionDigits: 2 })}`}
              </b>
            </div>
          ))}
        </div>
      </div>

      <div style={panel}>
        <TablaOperaciones filas={operaciones} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Registrar la sección en el sidebar**

En `components/shell/sidebar.tsx`, agregar `ArrowLeftRight` al import de `lucide-react` y una entrada al array `nav`, justo después de la de Finanzas:

```ts
  { href: "/finanzas", label: "Finanzas", icon: Wallet },
  { href: "/cambio", label: "Cambio", icon: ArrowLeftRight },
```

Verificar que `app/(app)/[section]/page.tsx` **no** tenga una clave `cambio` en el mapa `titles`. Si la tiene, sacarla: la ruta concreta gana sobre el catch-all, pero dejarla listada confunde.

- [ ] **Step 4: Probar en el navegador**

Levantar el server con `preview_start` (nunca con Bash) y abrir `/cambio`.

Verificar: la sección aparece en el menú lateral; los cuatro KPIs muestran cero; las seis cajas aparecen en cero; la tabla muestra el mensaje de vacío. Revisar la consola del navegador y los logs del server: no puede haber ningún `[cambio] lectura falló`. Si aparece, el SQL de la Task 1 no se corrió o RLS está mal.

- [ ] **Step 5: Lint y commit**

```bash
npm run lint
git add "app/(app)/cambio/page.tsx" components/cambio/tabla-operaciones.tsx components/shell/sidebar.tsx
git commit -m "feat(cambio): pantalla de operaciones con KPIs y cajas

El stock negativo se muestra en ámbar: significa que falta cargar una compra,
y es información, no un error a disimular.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: Formulario con cálculo en vivo

Es el punto donde fracasó la planilla: el usuario a veces conoce el importe en pesos y a veces en dólares, y no debe dividir a mano nunca.

**Files:**
- Create: `components/cambio/nueva-operacion-form.tsx`
- Modify: `app/(app)/cambio/page.tsx` (agregar el botón al header)

**Interfaces:**
- Consumes: `createExchangeOp` de `@/app/(app)/cambio/actions`; `importes` de `@/lib/cambio/calculo`; `parsearMonto` de `@/lib/finanzas/montos`.
- Produces: `<NuevaOperacionButton clientes={...} cajas={...} />`.

- [ ] **Step 1: Escribir el componente**

Crear `components/cambio/nueva-operacion-form.tsx`:

```tsx
"use client";
import { useState } from "react";
import { createExchangeOp } from "@/app/(app)/cambio/actions";
import { importes } from "@/lib/cambio/calculo";
import { parsearMonto } from "@/lib/finanzas/montos";
import { formatearPesos } from "@/lib/formato";
import type { Moneda, TipoOperacion } from "@/lib/cambio/tipos";

type Props = {
  clientes: { id: string; nombre: string }[];
  cajas: { id: string; nombre: string; moneda: Moneda }[];
};

const field: React.CSSProperties = {
  width: "100%", background: "var(--card)", border: "1px solid var(--border)",
  borderRadius: 10, padding: "9px 11px", fontSize: 13, color: "var(--text)",
};
const label: React.CSSProperties = { fontSize: 11.5, color: "var(--muted)", display: "block", marginBottom: 5 };

function hoy(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function NuevaOperacionButton({ clientes, cajas }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [tipo, setTipo] = useState<TipoOperacion>("compra");
  const [moneda, setMoneda] = useState<Moneda>("ARS");
  const [monto, setMonto] = useState("");
  const [tc, setTc] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // La cuenta que el usuario ya no tiene que hacer a mano. Se recalcula en
  // cada tecla para que vea el otro importe antes de confirmar.
  const montoNum = parsearMonto(monto);
  const tcNum = parsearMonto(tc);
  const previo =
    montoNum !== null && tcNum !== null ? importes({ monto: montoNum, moneda, tc: tcNum }) : null;

  const cajasArs = cajas.filter((c) => c.moneda === "ARS");
  const cajasUsd = cajas.filter((c) => c.moneda === "USD");

  const cerrar = () => {
    setAbierto(false);
    setError(null);
    setMonto("");
    setTc("");
  };

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        style={{ background: "var(--grad)", color: "#fff", border: 0, borderRadius: 11, padding: "10px 18px", fontSize: 13, fontWeight: 650, cursor: "pointer" }}
      >
        Nueva operación
      </button>

      {abierto && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", zIndex: 50, padding: 20 }}
          onClick={cerrar}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, width: "min(560px,100%)", maxHeight: "90vh", overflowY: "auto" }}
          >
            <h2 style={{ fontSize: 17, fontWeight: 740, margin: "0 0 16px" }}>Nueva operación</h2>

            <form
              action={async (formData) => {
                setGuardando(true);
                setError(null);
                formData.set("kind", tipo);
                formData.set("amountCurrency", moneda);
                const r = await createExchangeOp(formData);
                setGuardando(false);
                // Solo se cierra si guardó: si falla, el error se muestra
                // acá con los datos todavía cargados.
                if (r.ok) cerrar();
                else setError(r.error);
              }}
              style={{ display: "flex", flexDirection: "column", gap: 13 }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {(["compra", "venta"] as TipoOperacion[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    style={{
                      padding: "13px 10px", borderRadius: 11, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
                      border: `1px solid ${tipo === t ? "var(--accent)" : "var(--border)"}`,
                      background: tipo === t ? "var(--card)" : "transparent",
                      color: tipo === t ? "var(--text)" : "var(--muted)",
                    }}
                  >
                    {t === "compra" ? "COMPRA" : "VENTA"}
                    <span style={{ display: "block", fontSize: 10.5, fontWeight: 500, marginTop: 3 }}>
                      {t === "compra" ? "entrego pesos, recibo dólares" : "recibo pesos, entrego dólares"}
                    </span>
                  </button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={label}>Fecha</label>
                  <input type="date" name="opDate" defaultValue={hoy()} required style={field} />
                </div>
                <div>
                  <label style={label}>Cliente</label>
                  <select name="clientId" style={field}>
                    <option value="">—</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={label}>Emisor (quien manda los fondos)</label>
                  <input name="sender" style={field} />
                </div>
                <div>
                  <label style={label}>Receptor (quien los recibe)</label>
                  <input name="receiver" style={field} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr 1fr", gap: 10 }}>
                <div>
                  <label style={label}>Monto</label>
                  <input name="amount" value={monto} onChange={(e) => setMonto(e.target.value)} required style={field} placeholder="452.500" />
                </div>
                <div>
                  <label style={label}>Moneda</label>
                  <select value={moneda} onChange={(e) => setMoneda(e.target.value as Moneda)} style={field}>
                    <option value="ARS">Pesos</option>
                    <option value="USD">Dólares</option>
                  </select>
                </div>
                <div>
                  <label style={label}>TC ($ por USD)</label>
                  <input name="rate" value={tc} onChange={(e) => setTc(e.target.value)} required style={field} placeholder="1520" />
                </div>
              </div>

              {previo && (
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "11px 13px", fontSize: 13 }}>
                  <span style={{ color: "var(--muted)" }}>{tipo === "compra" ? "Entregás" : "Recibís"} </span>
                  <b className="tnum">{formatearPesos(previo.ars)}</b>
                  <span style={{ color: "var(--muted)" }}> y {tipo === "compra" ? "recibís" : "entregás"} </span>
                  <b className="tnum">USD {previo.usd.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label style={label}>Caja de pesos</label>
                  <select name="arsAccountId" style={field}>
                    <option value="">—</option>
                    {cajasArs.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>Caja de dólares</label>
                  <select name="usdAccountId" style={field}>
                    <option value="">—</option>
                    {cajasUsd.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>Costos</label>
                  <input name="fees" style={field} placeholder="0" />
                </div>
              </div>

              <div>
                <label style={label}>Notas</label>
                <input name="notes" style={field} />
              </div>

              {error && (
                <p style={{ color: "var(--warn)", fontSize: 12.5, margin: 0 }}>{error}</p>
              )}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                <button type="button" onClick={cerrar} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, color: "var(--text)", cursor: "pointer" }}>
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} style={{ background: "var(--grad)", color: "#fff", border: 0, borderRadius: 11, padding: "10px 20px", fontSize: 13, fontWeight: 650, cursor: "pointer", opacity: guardando ? 0.6 : 1 }}>
                  {guardando ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Enchufar el botón en la página**

En `app/(app)/cambio/page.tsx`: agregar los imports de `getClientesParaOperacion` y `getCajasParaOperacion` a la línea de `@/lib/cambio/datos`, más `import { NuevaOperacionButton } from "@/components/cambio/nueva-operacion-form";`. Reemplazar la carga de datos por un `Promise.all` y agregar el botón al header:

```tsx
  const [{ operaciones, saldos, resumen }, clientes, cajas] = await Promise.all([
    getDatosCambio(hoy),
    getClientesParaOperacion(),
    getCajasParaOperacion(),
  ]);
```

```tsx
        <div style={{ marginLeft: "auto" }}>
          <NuevaOperacionButton clientes={clientes} cajas={cajas} />
        </div>
```

- [ ] **Step 3: Probar en el navegador**

Con el server levantado, abrir `/cambio` y cargar la operación real del usuario: **VENTA**, monto `452.500`, moneda **Pesos**, TC `1520`.

Verificar:
1. Al escribir el monto y el TC, el recuadro dice **"Recibís $452.500 y entregás USD 297,70"** antes de guardar.
2. Al guardar, el modal cierra y la operación aparece en la tabla.
3. El stock queda en **−297,70** en ámbar (no hay compras previas: es correcto y es la señal esperada).
4. Cargar una COMPRA anterior de 1000 USD a 1400 con fecha **anterior**, y verificar que la tabla se reordena sola y el margen de la venta pasa a **$29.769,74**. Esto es la prueba de que el orden de carga ya no importa.
5. Probar con el TC vacío: no debe guardar, y el mensaje aparece dentro del modal sin perder lo cargado.

- [ ] **Step 4: Lint y commit**

```bash
npm run lint
git add components/cambio/nueva-operacion-form.tsx "app/(app)/cambio/page.tsx"
git commit -m "feat(cambio): formulario con conversión en vivo

Un solo campo de monto más la moneda: el usuario ve el otro importe mientras
escribe y no divide a mano nunca. Es el punto exacto donde fracasó la planilla.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: Rankings de clientes y personas

**Files:**
- Create: `components/cambio/rankings.tsx`
- Modify: `app/(app)/cambio/page.tsx`

**Interfaces:**
- Consumes: `FilaCliente`, `FilaPersona` de `@/lib/cambio/reportes`.
- Produces: `<Rankings clientes={...} personas={...} />`.

- [ ] **Step 1: Escribir el componente**

Crear `components/cambio/rankings.tsx`:

```tsx
import type { FilaCliente, FilaPersona } from "@/lib/cambio/reportes";
import { formatearPesos } from "@/lib/formato";

const th: React.CSSProperties = { textAlign: "right", fontSize: 11, color: "var(--muted)", fontWeight: 600, padding: "0 0 10px" };
const td: React.CSSProperties = { textAlign: "right", fontSize: 13, padding: "10px 0", borderTop: "1px solid var(--border)" };

function usd(n: number): string {
  return n.toLocaleString("es-AR", { maximumFractionDigits: 2 });
}

export function Rankings({ clientes, personas }: { clientes: FilaCliente[]; personas: FilaPersona[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>Por cliente</h2>
        {clientes.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Sin operaciones todavía.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...th, textAlign: "left" }}>Cliente</th>
                <th style={th}>Volumen USD</th>
                <th style={th}>Margen</th>
                <th style={th}>Ops</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.cliente}>
                  <td style={{ ...td, textAlign: "left" }}>{c.cliente}</td>
                  <td style={td} className="tnum">{usd(c.volumen)}</td>
                  <td style={{ ...td, color: c.margen > 0 ? "var(--ok)" : undefined }} className="tnum">
                    {formatearPesos(c.margen)}
                  </td>
                  <td style={td} className="tnum">{c.operaciones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>Por emisor y receptor</h2>
        {/* No lleva columna de margen a propósito: el margen es de la relación
            comercial y se atribuye al cliente, no a quien puso la cuenta. */}
        {personas.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Sin operaciones todavía.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...th, textAlign: "left" }}>Persona</th>
                <th style={th}>Como emisor</th>
                <th style={th}>Como receptor</th>
                <th style={th}>Ops</th>
              </tr>
            </thead>
            <tbody>
              {personas.map((p) => (
                <tr key={p.persona}>
                  <td style={{ ...td, textAlign: "left" }}>{p.persona}</td>
                  <td style={td} className="tnum">{usd(p.comoEmisor)}</td>
                  <td style={td} className="tnum">{usd(p.comoReceptor)}</td>
                  <td style={td} className="tnum">{p.operaciones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Enchufarlo en la página**

En `app/(app)/cambio/page.tsx`: agregar `clientes: rankingDeClientes, personas` al destructuring de `getDatosCambio` (cuidado con el choque de nombres: la variable `clientes` ya se usa para el select del formulario), importar `Rankings` y agregar antes del panel de la tabla:

```tsx
      <div style={panel}>
        <Rankings clientes={rankingDeClientes} personas={personas} />
      </div>
```

- [ ] **Step 3: Verificar en el navegador**

Con las operaciones de la Task 7 cargadas: el cliente de la venta muestra su margen; el de la compra muestra $0; y las personas aparecen con su volumen como emisor y como receptor por separado.

- [ ] **Step 4: Lint y commit**

```bash
npm run lint
git add components/cambio/rankings.tsx "app/(app)/cambio/page.tsx"
git commit -m "feat(cambio): rankings por cliente y por persona

El ranking de personas no lleva margen: el margen es de la relación comercial
y se atribuye al cliente, no a quien puso la cuenta.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 9: Exportar a Excel

**Files:**
- Create: `lib/cambio/excel.ts`
- Create: `app/(app)/cambio/export/route.ts`
- Modify: `app/(app)/cambio/page.tsx` (botón de descarga)
- Modify: `package.json` (dependencia `exceljs`)

**Interfaces:**
- Consumes: `DatosCambio` de `@/lib/cambio/datos`.
- Produces: `construirWorkbook(datos: DatosCambio): Promise<Buffer>`; la ruta `GET /cambio/export`.

- [ ] **Step 1: Instalar la dependencia**

```bash
npm install exceljs
```

- [ ] **Step 2: Escribir el generador**

Crear `lib/cambio/excel.ts`:

```ts
import ExcelJS from "exceljs";
import type { DatosCambio } from "./datos";

const ARS = '"$"#,##0';
const USD = "#,##0.00";
const TC = "#,##0.00";

/**
 * El archivo lleva VALORES, no fórmulas. Es una foto para archivar o mandar
 * al contador: la planilla que este módulo reemplaza se rompía justamente al
 * moverla entre programas, porque el cálculo vivía en las celdas.
 */
export async function construirWorkbook(datos: DatosCambio): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "IG OS — Gestiones MA";

  const encabezar = (ws: ExcelJS.Worksheet) => {
    ws.getRow(1).font = { bold: true };
    ws.views = [{ state: "frozen", ySplit: 1 }];
  };

  const ops = wb.addWorksheet("Operaciones");
  ops.columns = [
    { header: "Fecha", key: "fecha", width: 12 },
    { header: "Tipo", key: "tipo", width: 10 },
    { header: "Cliente", key: "cliente", width: 22 },
    { header: "Emisor", key: "emisor", width: 22 },
    { header: "Receptor", key: "receptor", width: 22 },
    { header: "USD", key: "usd", width: 13, style: { numFmt: USD } },
    { header: "Pesos", key: "ars", width: 16, style: { numFmt: ARS } },
    { header: "TC", key: "tc", width: 11, style: { numFmt: TC } },
    { header: "Costos", key: "costos", width: 12, style: { numFmt: ARS } },
    { header: "Costo prom.", key: "costoPromedio", width: 13, style: { numFmt: TC } },
    { header: "Margen", key: "margen", width: 14, style: { numFmt: ARS } },
    { header: "Stock USD", key: "stock", width: 13, style: { numFmt: USD } },
    { header: "Notas", key: "notas", width: 30 },
  ];
  for (const o of datos.operaciones) {
    ops.addRow({
      fecha: o.fecha, tipo: o.tipo === "compra" ? "COMPRA" : "VENTA", cliente: o.cliente,
      emisor: o.emisor, receptor: o.receptor, usd: o.usd, ars: o.ars, tc: o.tc,
      costos: o.costos, costoPromedio: o.costoPromedio,
      margen: o.tipo === "venta" ? o.margen : null, stock: o.stock, notas: o.notas,
    });
  }
  encabezar(ops);

  const cli = wb.addWorksheet("Clientes");
  cli.columns = [
    { header: "Cliente", key: "cliente", width: 24 },
    { header: "USD comprados", key: "usdComprados", width: 15, style: { numFmt: USD } },
    { header: "USD vendidos", key: "usdVendidos", width: 15, style: { numFmt: USD } },
    { header: "Volumen USD", key: "volumen", width: 15, style: { numFmt: USD } },
    { header: "Margen", key: "margen", width: 16, style: { numFmt: ARS } },
    { header: "TC prom. compra", key: "tcPromedioCompra", width: 16, style: { numFmt: TC } },
    { header: "TC prom. venta", key: "tcPromedioVenta", width: 16, style: { numFmt: TC } },
    { header: "Operaciones", key: "operaciones", width: 12 },
  ];
  datos.clientes.forEach((c) => cli.addRow(c));
  encabezar(cli);

  const per = wb.addWorksheet("Personas");
  per.columns = [
    { header: "Persona", key: "persona", width: 26 },
    { header: "Como emisor", key: "comoEmisor", width: 15, style: { numFmt: USD } },
    { header: "Como receptor", key: "comoReceptor", width: 15, style: { numFmt: USD } },
    { header: "Volumen USD", key: "volumen", width: 15, style: { numFmt: USD } },
    { header: "Operaciones", key: "operaciones", width: 12 },
  ];
  datos.personas.forEach((p) => per.addRow(p));
  encabezar(per);

  const caj = wb.addWorksheet("Cajas");
  caj.columns = [
    { header: "Caja", key: "nombre", width: 20 },
    { header: "Moneda", key: "moneda", width: 10 },
    { header: "Saldo inicial", key: "saldoInicial", width: 16 },
    { header: "Movimientos", key: "movimientos", width: 16 },
    { header: "Ajuste", key: "ajuste", width: 14 },
    { header: "Saldo", key: "saldo", width: 16 },
  ];
  for (const s of datos.saldos) {
    const fila = caj.addRow(s);
    // El formato depende de la moneda de cada caja, así que va por fila y no
    // en la definición de la columna.
    const fmt = s.moneda === "ARS" ? ARS : USD;
    for (const col of [3, 4, 5, 6]) fila.getCell(col).numFmt = fmt;
  }
  encabezar(caj);

  const res = wb.addWorksheet("Resumen");
  res.columns = [
    { header: "Concepto", key: "k", width: 30 },
    { header: "Valor", key: "v", width: 20 },
  ];
  const r = datos.resumen;
  res.addRow({ k: "Stock de dólares (USD)", v: r.stockUsd }).getCell(2).numFmt = USD;
  res.addRow({ k: "Costo promedio del stock", v: r.costoPromedio }).getCell(2).numFmt = TC;
  res.addRow({ k: "Costo total del stock", v: r.costoTotal }).getCell(2).numFmt = ARS;
  res.addRow({ k: "Margen acumulado", v: r.margenTotal }).getCell(2).numFmt = ARS;
  res.addRow({ k: "Margen del mes", v: r.margenDelMes }).getCell(2).numFmt = ARS;
  res.addRow({ k: "Volumen operado (USD)", v: r.volumenUsd }).getCell(2).numFmt = USD;
  res.addRow({ k: "Cantidad de operaciones", v: r.operaciones });
  encabezar(res);

  return (await wb.xlsx.writeBuffer()) as Buffer;
}
```

- [ ] **Step 3: Escribir el route handler**

Crear `app/(app)/cambio/export/route.ts`:

```ts
import { getDatosCambio } from "@/lib/cambio/datos";
import { construirWorkbook } from "@/lib/cambio/excel";

// exceljs necesita APIs de Node: no corre en el runtime edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const datos = await getDatosCambio();
    const buffer = await construirWorkbook(datos);
    const fecha = new Date().toISOString().slice(0, 10);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="cambio-usd-${fecha}.xlsx"`,
      },
    });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[cambio] la exportación falló:", err.message);
    return new Response("No se pudo generar el Excel.", { status: 500 });
  }
}
```

- [ ] **Step 4: Agregar el botón**

En `app/(app)/cambio/page.tsx`, dentro del `<div style={{ marginLeft: "auto" }}>` del header, antes del `NuevaOperacionButton`, envolviendo ambos en un flex:

```tsx
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <a
            href="/cambio/export"
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)", display: "inline-flex", alignItems: "center" }}
          >
            Descargar Excel
          </a>
          <NuevaOperacionButton clientes={clientes} cajas={cajas} />
        </div>
```

- [ ] **Step 5: Probar la descarga**

Con el server levantado y las operaciones cargadas, hacer clic en **Descargar Excel**. Abrir el archivo y verificar:

1. Cinco hojas: Operaciones, Clientes, Personas, Cajas, Resumen.
2. En Operaciones, la venta de 452.500 muestra USD 297,70 y margen $29.769,74.
3. **Ninguna celda tiene fórmula** — hacer clic en una celda de Margen y confirmar que la barra de fórmulas muestra el número, no un `=`.
4. La hoja Cajas muestra los saldos en pesos con formato de pesos y los de dólares con dos decimales.

- [ ] **Step 6: Lint, build y commit**

```bash
npm run lint
npm run build
git add lib/cambio/excel.ts "app/(app)/cambio/export/route.ts" "app/(app)/cambio/page.tsx" package.json package-lock.json
git commit -m "feat(cambio): exportar a Excel

Valores, no fórmulas: es una foto para archivar o mandar al contador, no un
mecanismo que se rompa al moverlo de programa — que es exactamente lo que
falló con la planilla original al importarla a Google Drive.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Verificación final

Antes de dar el módulo por terminado:

- [ ] `npm test` — todo verde, con los 37 tests nuevos: 11 de `calculo`, 13 de `reportes` y 13 de `actions`.
- [ ] `npm run lint` — sin errores.
- [ ] `npm run build` — compila.
- [ ] En el navegador: cargar una compra y una venta **fuera de orden de fecha** y confirmar que los números quedan bien igual. Es la regresión que motivó todo el módulo.
- [ ] Confirmar que no hay ningún `[cambio] lectura falló` ni `[cambio] valor desconocido` en los logs.
- [ ] Descargar el Excel y confirmar las cinco hojas.

## Pendiente para después de esta entrega

Del spec, explícitamente fuera de alcance acá:

- **Editar y borrar operaciones.** Hoy corregir un error requiere tocar la base. Es lo primero a agregar.
- **Cuentas corrientes de clientes** (saldos a favor y deudas).
- **Filtrar la exportación por rango de fechas.**
- **Conectar el subdominio** de `gestionesma.store` en Vercel.
