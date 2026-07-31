# Hoja de ruta diaria de runners — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que un admin le arme a un runner una hoja de ruta del día (consigna + cuentas a operar) y que el runner la vea en `/panel` e imprima o saque foto para WhatsApp.

**Architecture:** Dos tablas nuevas (`hojas_ruta` + `hoja_ruta_cuentas` con snapshot de los datos de cada cuenta), capa de datos, server actions, página de armado en `/cambio/hojas` (admin) y sección de lectura en `/panel` (runner). Reusa las funciones RLS `es_admin_cambio()`/`mi_runner_id()` ya existentes.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Supabase (Postgres + RLS), Vitest.

## Global Constraints

- SQL idempotente en `web/lib/db/sql/2026-07-31-hojas-ruta.sql`, corrido a mano por el usuario. Desplegar el código schema-dependiente DESPUÉS de correr el SQL.
- Reusa `es_admin_cambio()` y `mi_runner_id()` (ya existen en la base).
- Server actions: `type ResultadoAlta = { ok: true } | { ok: false; error: string }`; `revalidatePath` en try/catch aislado; log `[cambio]`; validar antes de `createClient()`.
- Estilos inline + CSS vars, acento dorado `#D9A84E`, mobile-first (`.campo-fila`, `.cambio-modal`). NO pasar funciones de server a client components.
- La hoja muestra por cuenta: **titular + alias + CBU (pesos y dólares)**. Sin DNI.
- Lecturas por `createClient()` de `@/lib/supabase/server`; mappers snake→camel; log `[cambio]` en error.

---

### Task 1: Esquema SQL

**Files:** Create `web/lib/db/sql/2026-07-31-hojas-ruta.sql`.

- [ ] **Step 1: Escribir el SQL**

```sql
-- Hojas de ruta de runners — módulo Cambio. Correr en Supabase (zjetaihjddoxxvrpzwsb),
-- editor VACÍO antes de pegar. Idempotente. Reusa es_admin_cambio()/mi_runner_id().

create table if not exists hojas_ruta (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  runner_id  uuid not null references runners(id) on delete cascade,
  fecha      date not null,
  nota       text not null default '',
  created_at timestamptz not null default now()
);
create unique index if not exists hojas_ruta_runner_fecha_idx on hojas_ruta(company_id, runner_id, fecha);

create table if not exists hoja_ruta_cuentas (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id) on delete cascade,
  hoja_id       uuid not null references hojas_ruta(id) on delete cascade,
  orden         int  not null default 0,
  origen        text not null default 'operativa',   -- operativa | bancaria
  source_id     uuid,
  etiqueta      text not null default '',
  titular       text not null default '',
  alias_pesos   text not null default '',
  cbu_pesos     text not null default '',
  alias_dolares text not null default '',
  cbu_dolares   text not null default '',
  created_at    timestamptz not null default now()
);
create index if not exists hoja_ruta_cuentas_hoja_idx on hoja_ruta_cuentas(hoja_id);

alter table hojas_ruta        enable row level security;
alter table hoja_ruta_cuentas enable row level security;

drop policy if exists "hojas_ruta_pol" on hojas_ruta;
create policy "hojas_ruta_pol" on hojas_ruta for all to authenticated
  using (es_admin_cambio() or runner_id = mi_runner_id())
  with check (es_admin_cambio());

drop policy if exists "hoja_ruta_cuentas_pol" on hoja_ruta_cuentas;
create policy "hoja_ruta_cuentas_pol" on hoja_ruta_cuentas for all to authenticated
  using (es_admin_cambio() or hoja_id in (select id from hojas_ruta where runner_id = mi_runner_id()))
  with check (es_admin_cambio());

-- Verificación
select tablename, rowsecurity from pg_tables where tablename in ('hojas_ruta','hoja_ruta_cuentas');
```

- [ ] **Step 2: Commit** `feat(cambio): esquema SQL de hojas de ruta`.

---

### Task 2: Tipos + capa de datos

**Files:** Create `web/lib/cambio/hojas.ts`, `web/lib/cambio/hojas-datos.ts`; Test `web/lib/cambio/hojas-datos.test.ts`.

**Interfaces:**
- Produces:
  - `type OrigenCuenta = "operativa" | "bancaria"`
  - `type HojaCuenta = { id: string; orden: number; origen: OrigenCuenta; sourceId: string | null; etiqueta: string; titular: string; aliasPesos: string; cbuPesos: string; aliasDolares: string; cbuDolares: string }`
  - `type Hoja = { id: string; runnerId: string; fecha: string; nota: string; cuentas: HojaCuenta[] }`
  - `getMiHojaDelDia(fecha: string): Promise<Hoja | null>` — la hoja del runner logueado (RLS la limita).
  - `getHojaParaEditar(runnerId: string, fecha: string): Promise<Hoja | null>` — la hoja de un runner puntual (admin).

- [ ] **Step 1: Escribir `hojas.ts`**

```ts
export type OrigenCuenta = "operativa" | "bancaria";

export type HojaCuenta = {
  id: string;
  orden: number;
  origen: OrigenCuenta;
  sourceId: string | null;
  etiqueta: string;
  titular: string;
  aliasPesos: string;
  cbuPesos: string;
  aliasDolares: string;
  cbuDolares: string;
};

export type Hoja = {
  id: string;
  runnerId: string;
  fecha: string;
  nota: string;
  cuentas: HojaCuenta[];
};
```

- [ ] **Step 2: Escribir el test que falla** (`web/lib/cambio/hojas-datos.test.ts`)

Mirá `web/lib/cambio/perfiles-datos.test.ts` para copiar el estilo del mock (mock de `@/lib/supabase/server` con `from().select().eq()...maybeSingle`). `getMiHojaDelDia` hace `from("hojas_ruta").select(COLS).eq("fecha",fecha).limit(1).maybeSingle()`. Ajustá la cadena del mock a eso; el contrato lo fijan los `expect`.

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockMaybeSingle = vi.fn();
const eqMock = vi.fn(() => ({ eq: eqMock, limit: () => ({ maybeSingle: mockMaybeSingle }) }));
const fromMock = vi.fn(() => ({ select: () => ({ eq: eqMock }) }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from: fromMock })),
}));

import { getMiHojaDelDia } from "@/lib/cambio/hojas-datos";

beforeEach(() => { vi.clearAllMocks(); });

describe("getMiHojaDelDia", () => {
  it("mapea la hoja con sus cuentas ordenadas por orden (snake→camel)", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        id: "h1", runner_id: "r1", fecha: "2026-07-31", nota: "priorizar retiros",
        hoja_ruta_cuentas: [
          { id: "c2", orden: 2, origen: "bancaria", source_id: "b1", etiqueta: "Bancaria",
            titular: "Ana", alias_pesos: "ana.ars", cbu_pesos: "111", alias_dolares: "ana.usd", cbu_dolares: "222" },
          { id: "c1", orden: 1, origen: "operativa", source_id: "o1", etiqueta: "Zurdo 1",
            titular: "Juan", alias_pesos: "juan.ars", cbu_pesos: "333", alias_dolares: "juan.usd", cbu_dolares: "444" },
        ],
      },
      error: null,
    });
    const hoja = await getMiHojaDelDia("2026-07-31");
    expect(hoja?.nota).toBe("priorizar retiros");
    expect(hoja?.cuentas.map((c) => c.orden)).toEqual([1, 2]);
    expect(hoja?.cuentas[0]).toEqual({
      id: "c1", orden: 1, origen: "operativa", sourceId: "o1", etiqueta: "Zurdo 1",
      titular: "Juan", aliasPesos: "juan.ars", cbuPesos: "333", aliasDolares: "juan.usd", cbuDolares: "444",
    });
  });

  it("sin hoja devuelve null", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    expect(await getMiHojaDelDia("2026-07-31")).toBeNull();
  });

  it("sin cuentas devuelve la hoja con lista vacía", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { id: "h1", runner_id: "r1", fecha: "2026-07-31", nota: "solo consigna", hoja_ruta_cuentas: null },
      error: null,
    });
    const hoja = await getMiHojaDelDia("2026-07-31");
    expect(hoja?.cuentas).toEqual([]);
  });
});
```

- [ ] **Step 3: Correr el test y verlo fallar**

Run: `cd web && npx vitest run lib/cambio/hojas-datos.test.ts`
Expected: FAIL (`getMiHojaDelDia` no existe).

- [ ] **Step 4: Escribir `hojas-datos.ts`**

```ts
import { createClient } from "@/lib/supabase/server";
import type { Hoja, HojaCuenta, OrigenCuenta } from "./hojas";

function origenDe(v: unknown): OrigenCuenta {
  // Cualquier valor raro cae a "operativa" (el default de la columna).
  return v === "bancaria" ? "bancaria" : "operativa";
}

type CuentaRow = {
  id: string; orden: number; origen: string; source_id: string | null; etiqueta: string;
  titular: string; alias_pesos: string; cbu_pesos: string; alias_dolares: string; cbu_dolares: string;
};
type HojaRow = {
  id: string; runner_id: string; fecha: string; nota: string;
  hoja_ruta_cuentas: CuentaRow[] | null;
};

const COLS =
  "id,runner_id,fecha,nota,hoja_ruta_cuentas(id,orden,origen,source_id,etiqueta,titular,alias_pesos,cbu_pesos,alias_dolares,cbu_dolares)";

function aHojaCuenta(r: CuentaRow): HojaCuenta {
  return {
    id: r.id, orden: r.orden, origen: origenDe(r.origen), sourceId: r.source_id,
    etiqueta: r.etiqueta, titular: r.titular,
    aliasPesos: r.alias_pesos, cbuPesos: r.cbu_pesos,
    aliasDolares: r.alias_dolares, cbuDolares: r.cbu_dolares,
  };
}

function aHoja(r: HojaRow): Hoja {
  const cuentas = (r.hoja_ruta_cuentas ?? []).map(aHojaCuenta).sort((a, b) => a.orden - b.orden);
  return { id: r.id, runnerId: r.runner_id, fecha: r.fecha, nota: r.nota, cuentas };
}

/** La hoja del runner logueado para un día. RLS la limita a la suya. */
export async function getMiHojaDelDia(fecha: string): Promise<Hoja | null> {
  const sb = await createClient();
  const { data, error } = await sb.from("hojas_ruta").select(COLS).eq("fecha", fecha).limit(1).maybeSingle();
  if (error) { console.error("[cambio] lectura de mi hoja falló:", error.message, error.details ?? ""); return null; }
  if (!data) return null;
  return aHoja(data as unknown as HojaRow);
}

/** La hoja de un runner puntual para editar (admin). */
export async function getHojaParaEditar(runnerId: string, fecha: string): Promise<Hoja | null> {
  if (!runnerId) return null;
  const sb = await createClient();
  const { data, error } = await sb
    .from("hojas_ruta").select(COLS).eq("runner_id", runnerId).eq("fecha", fecha).limit(1).maybeSingle();
  if (error) { console.error("[cambio] lectura de hoja para editar falló:", error.message, error.details ?? ""); return null; }
  if (!data) return null;
  return aHoja(data as unknown as HojaRow);
}
```

> Nota: el test mockea la cadena `eq(...).eq(...).limit().maybeSingle()`. `getMiHojaDelDia` usa un solo `.eq`, `getHojaParaEditar` usa dos; el mock del test (con `eqMock` que se devuelve a sí mismo) cubre ambos. Ajustá si tu mock necesita otra forma — los `expect` no se tocan.

- [ ] **Step 5: Correr el test y verlo pasar**

Run: `cd web && npx vitest run lib/cambio/hojas-datos.test.ts` → PASS. Y `cd web && npx tsc --noEmit`.

- [ ] **Step 6: Commit** `feat(cambio): tipos y lectura de hojas de ruta`.

---

### Task 3: Server actions

**Files:** Create `web/app/(app)/cambio/hojas-actions.ts`; Test `web/app/(app)/cambio/hojas-actions.test.ts`.

**Interfaces:**
- Consumes: `OrigenCuenta` de `@/lib/cambio/hojas`.
- Produces:
  - `type SeleccionCuenta = { origen: OrigenCuenta; sourceId: string; orden: number }`
  - `guardarHoja(runnerId: string, fecha: string, nota: string, seleccion: SeleccionCuenta[]): Promise<ResultadoAlta>`
  - `borrarHoja(id: string): Promise<ResultadoAlta>`

Molde: `web/app/(app)/cambio/celulares-actions.ts` (`empresaId`, `revalidate*` aislado, `ResultadoAlta`).

- [ ] **Step 1: Escribir los tests que fallan** (`web/app/(app)/cambio/hojas-actions.test.ts`)

Mirá `web/app/(app)/cambio/celulares-actions.test.ts` para el estilo del mock de supabase. Verificá: `guardarHoja` rechaza runner/fecha vacíos y rechaza cuando no hay nota ni cuentas; `borrarHoja` rechaza id vacío. (La lógica de snapshot/upsert se valida en la prueba manual del final; acá alcanza con las validaciones y que no toquen la base cuando el input es inválido.)

```ts
import { describe, it, expect, vi } from "vitest";

const fromMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn(async () => ({ from: fromMock })) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { guardarHoja, borrarHoja } from "@/app/(app)/cambio/hojas-actions";

describe("guardarHoja — validación", () => {
  it("rechaza runner vacío sin tocar la base", async () => {
    const r = await guardarHoja("", "2026-07-31", "hola", []);
    expect(r).toEqual({ ok: false, error: expect.any(String) });
    expect(fromMock).not.toHaveBeenCalled();
  });
  it("rechaza fecha vacía sin tocar la base", async () => {
    const r = await guardarHoja("r1", "", "hola", []);
    expect(r.ok).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });
  it("rechaza cuando no hay ni nota ni cuentas", async () => {
    const r = await guardarHoja("r1", "2026-07-31", "   ", []);
    expect(r.ok).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });
});

describe("borrarHoja — validación", () => {
  it("rechaza id vacío sin tocar la base", async () => {
    const r = await borrarHoja("");
    expect(r.ok).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Correr y ver fallar**

Run: `cd web && npx vitest run "app/(app)/cambio/hojas-actions.test.ts"` → FAIL (no existe el módulo).

- [ ] **Step 3: Escribir `hojas-actions.ts`**

```ts
"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OrigenCuenta } from "@/lib/cambio/hojas";

export type ResultadoAlta = { ok: true } | { ok: false; error: string };
export type SeleccionCuenta = { origen: OrigenCuenta; sourceId: string; orden: number };

function uno<T>(rel: T | T[] | null): T | null {
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

async function empresaId(sb: Awaited<ReturnType<typeof createClient>>): Promise<string | null> {
  const { data, error } = await sb.from("companies").select("id").ilike("name", "%gestiones%ma%").limit(1).single();
  if (error) { console.error("[cambio] búsqueda de empresa falló:", error.message, error.details ?? ""); return null; }
  if (!data) { console.error("[cambio] no se encontró la empresa GESTIONES MA en companies"); return null; }
  return data.id as string;
}

function revalidarHojas(mensaje: string): void {
  try {
    revalidatePath("/cambio/hojas");
    revalidatePath("/panel");
  } catch (e) {
    console.error(`[cambio] ${mensaje} pero revalidatePath falló:`, e instanceof Error ? e.message : String(e));
  }
}

type PhoneAccountRow = {
  id: string; holder_name: string; alias_pesos: string; cbu_pesos: string;
  alias_dolares: string; cbu_dolares: string; phones: { alias: string } | { alias: string }[] | null;
};
type CuentaBancariaRow = {
  id: string; titular: string; alias_pesos: string; cbu_pesos: string; alias_dolares: string; cbu_dolares: string;
};

export async function guardarHoja(
  runnerId: string, fecha: string, nota: string, seleccion: SeleccionCuenta[],
): Promise<ResultadoAlta> {
  if (!runnerId) return { ok: false, error: "Elegí un runner." };
  if (!fecha) return { ok: false, error: "Elegí un día." };
  const notaLimpia = (nota ?? "").trim();
  if (!notaLimpia && seleccion.length === 0) {
    return { ok: false, error: "Cargá al menos una cuenta o una consigna." };
  }

  try {
    const sb = await createClient();
    const cid = await empresaId(sb);
    if (!cid) return { ok: false, error: "No se encontró la empresa. Avisá al administrador." };

    // Snapshot desde la base (no se confía en el cliente para los datos de cuenta).
    const opIds = seleccion.filter((s) => s.origen === "operativa").map((s) => s.sourceId);
    const banIds = seleccion.filter((s) => s.origen === "bancaria").map((s) => s.sourceId);

    const opMap = new Map<string, PhoneAccountRow>();
    if (opIds.length) {
      const { data } = await sb
        .from("phone_accounts")
        .select("id,holder_name,alias_pesos,cbu_pesos,alias_dolares,cbu_dolares,phones(alias)")
        .in("id", opIds);
      for (const r of (data ?? []) as unknown as PhoneAccountRow[]) opMap.set(r.id, r);
    }
    const banMap = new Map<string, CuentaBancariaRow>();
    if (banIds.length) {
      const { data } = await sb
        .from("cuentas")
        .select("id,titular,alias_pesos,cbu_pesos,alias_dolares,cbu_dolares")
        .in("id", banIds);
      for (const r of (data ?? []) as unknown as CuentaBancariaRow[]) banMap.set(r.id, r);
    }

    // Upsert de la hoja (una por runner+fecha).
    const { data: hojaRow, error: upErr } = await sb
      .from("hojas_ruta")
      .upsert({ company_id: cid, runner_id: runnerId, fecha, nota: notaLimpia }, { onConflict: "company_id,runner_id,fecha" })
      .select("id")
      .single();
    if (upErr || !hojaRow) {
      console.error("[cambio] alta de hoja falló:", upErr?.message, upErr?.details ?? "");
      return { ok: false, error: "No se pudo guardar la hoja. Probá de nuevo." };
    }
    const hojaId = hojaRow.id as string;

    // Reemplazar las cuentas: borrar las viejas e insertar las nuevas.
    const { error: delErr } = await sb.from("hoja_ruta_cuentas").delete().eq("hoja_id", hojaId);
    if (delErr) {
      console.error("[cambio] limpieza de cuentas de hoja falló:", delErr.message, delErr.details ?? "");
      return { ok: false, error: "No se pudo guardar la hoja. Probá de nuevo." };
    }

    const filas = seleccion
      .map((s) => {
        if (s.origen === "operativa") {
          const r = opMap.get(s.sourceId);
          if (!r) return null;
          return {
            company_id: cid, hoja_id: hojaId, orden: s.orden, origen: "operativa", source_id: s.sourceId,
            etiqueta: uno(r.phones)?.alias ?? "", titular: r.holder_name ?? "",
            alias_pesos: r.alias_pesos ?? "", cbu_pesos: r.cbu_pesos ?? "",
            alias_dolares: r.alias_dolares ?? "", cbu_dolares: r.cbu_dolares ?? "",
          };
        }
        const r = banMap.get(s.sourceId);
        if (!r) return null;
        return {
          company_id: cid, hoja_id: hojaId, orden: s.orden, origen: "bancaria", source_id: s.sourceId,
          etiqueta: "Bancaria", titular: r.titular ?? "",
          alias_pesos: r.alias_pesos ?? "", cbu_pesos: r.cbu_pesos ?? "",
          alias_dolares: r.alias_dolares ?? "", cbu_dolares: r.cbu_dolares ?? "",
        };
      })
      .filter((f): f is NonNullable<typeof f> => f !== null);

    if (filas.length) {
      const { error: insErr } = await sb.from("hoja_ruta_cuentas").insert(filas);
      if (insErr) {
        console.error("[cambio] alta de cuentas de hoja falló:", insErr.message, insErr.details ?? "");
        return { ok: false, error: "No se pudo guardar la hoja. Probá de nuevo." };
      }
    }
  } catch (e) {
    console.error("[cambio] guardarHoja falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo guardar la hoja. Probá de nuevo." };
  }

  revalidarHojas("la hoja se guardó");
  return { ok: true };
}

export async function borrarHoja(id: string): Promise<ResultadoAlta> {
  if (!id) return { ok: false, error: "Falta la hoja." };
  try {
    const sb = await createClient();
    const { error } = await sb.from("hojas_ruta").delete().eq("id", id);
    if (error) {
      console.error("[cambio] borrado de hoja falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo borrar la hoja. Probá de nuevo." };
    }
  } catch (e) {
    console.error("[cambio] borrarHoja falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo borrar la hoja. Probá de nuevo." };
  }
  revalidarHojas("la hoja se borró");
  return { ok: true };
}
```

- [ ] **Step 4: Correr los tests y verlos pasar** + `tsc` + `lint`

Run: `cd web && npx vitest run "app/(app)/cambio/hojas-actions.test.ts" && npx tsc --noEmit && npx eslint "app/(app)/cambio/hojas-actions.ts"` → todo verde.

- [ ] **Step 5: Commit** `feat(cambio): server actions de hojas de ruta`.

---

### Task 4: Página de armado del admin (`/cambio/hojas`)

**Files:** Create `web/components/cambio/hoja-builder.tsx`, `web/app/(app)/cambio/hojas/page.tsx`; Modify `web/app/(app)/cambio/page.tsx` (link en el header).

**Interfaces:**
- Consumes: `getRunners` (`@/lib/cambio/runners-datos`), `getCelulares`/`getCuentasOperativas` (`@/lib/cambio/celulares-datos`), `getCuentas` (`@/lib/cambio/cuentas-datos`), `getHojaParaEditar` (`@/lib/cambio/hojas-datos`), `hoyISO` (`@/lib/cambio/datos`), `guardarHoja`/`borrarHoja` (`@/app/(app)/cambio/hojas-actions`), tipos `Hoja`/`SeleccionCuenta`.

- [ ] **Step 1: Escribir `hoja-builder.tsx`** (client)

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Celular, CuentaOperativa } from "@/lib/cambio/celulares";
import type { Cuenta } from "@/lib/cambio/cuentas";
import type { Runner } from "@/lib/cambio/runners";
import type { Hoja } from "@/lib/cambio/hojas";
import { guardarHoja, borrarHoja, type SeleccionCuenta } from "@/app/(app)/cambio/hojas-actions";

const panel: React.CSSProperties = {
  background: "var(--glass)", backdropFilter: "blur(16px)",
  border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 18,
};
const field: React.CSSProperties = {
  width: "100%", background: "var(--card)", border: "1px solid var(--border)",
  borderRadius: 10, padding: "10px 12px", fontSize: 16, color: "var(--text)", fontFamily: "inherit",
};
const label: React.CSSProperties = { fontSize: 11.5, color: "var(--muted)", display: "block", marginBottom: 5 };
const botonDorado: React.CSSProperties = {
  background: "var(--grad)", color: "#fff", border: 0, borderRadius: 11, padding: "11px 20px",
  fontSize: 14, fontWeight: 700, cursor: "pointer",
};
const botonSec: React.CSSProperties = {
  background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "7px 12px",
  fontSize: 13, fontWeight: 600, color: "var(--text)", cursor: "pointer",
};

type Item = { key: string; origen: "operativa" | "bancaria"; sourceId: string; titular: string; etiqueta: string };

export function HojaBuilder({
  runners, runnerId, fecha, celulares, operativas, bancarias, hojaInicial,
}: {
  runners: Runner[];
  runnerId: string;
  fecha: string;
  celulares: Celular[];
  operativas: CuentaOperativa[];
  bancarias: Cuenta[];
  hojaInicial: Hoja | null;
}) {
  const router = useRouter();
  const [nota, setNota] = useState(hojaInicial?.nota ?? "");
  // Selección ordenada: se arranca desde la hoja existente (si hay).
  const [sel, setSel] = useState<Item[]>(
    (hojaInicial?.cuentas ?? []).map((c) => ({
      key: `${c.origen}:${c.sourceId}`, origen: c.origen, sourceId: c.sourceId ?? "",
      titular: c.titular, etiqueta: c.etiqueta,
    })),
  );
  const [guardando, setGuardando] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const irRunner = (rid: string) => router.push(`/cambio/hojas?runner=${rid}&dia=${fecha}`);
  const irDia = (d: string) => { if (d) router.push(`/cambio/hojas?runner=${runnerId}&dia=${d}`); };

  const enSel = (key: string) => sel.some((s) => s.key === key);
  const toggle = (item: Item) => {
    setSel((prev) => (prev.some((s) => s.key === item.key) ? prev.filter((s) => s.key !== item.key) : [...prev, item]));
  };
  const mover = (i: number, delta: number) => {
    setSel((prev) => {
      const j = i + delta;
      if (j < 0 || j >= prev.length) return prev;
      const copia = [...prev];
      [copia[i], copia[j]] = [copia[j], copia[i]];
      return copia;
    });
  };

  const guardar = async () => {
    if (guardando) return;
    setGuardando(true); setError(null); setMsg(null);
    const seleccion: SeleccionCuenta[] = sel.map((s, i) => ({ origen: s.origen, sourceId: s.sourceId, orden: i + 1 }));
    try {
      const r = await guardarHoja(runnerId, fecha, nota, seleccion);
      if (r.ok) { setMsg("Hoja guardada."); router.refresh(); }
      else setError(r.error);
    } catch { setError("No se pudo conectar. Probá de nuevo."); }
    finally { setGuardando(false); }
  };

  const borrar = async () => {
    if (!hojaInicial || borrando) return;
    if (!window.confirm("¿Borrar la hoja de este día? No se puede deshacer.")) return;
    setBorrando(true); setError(null);
    try {
      const r = await borrarHoja(hojaInicial.id);
      if (r.ok) { setSel([]); setNota(""); setMsg("Hoja borrada."); router.refresh(); }
      else setError(r.error);
    } catch { setError("No se pudo conectar. Probá de nuevo."); }
    finally { setBorrando(false); }
  };

  const operativasDe = (celId: string): CuentaOperativa[] => operativas.filter((o) => o.celularId === celId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Selección de runner + día */}
      <div style={{ ...panel, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ minWidth: 180 }}>
          <label style={label}>Runner</label>
          <select value={runnerId} onChange={(e) => irRunner(e.target.value)} style={field}>
            <option value="">— elegí un runner —</option>
            {runners.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Día</label>
          <input type="date" value={fecha} onChange={(e) => irDia(e.target.value)} style={{ ...field, width: "auto" }} />
        </div>
      </div>

      {!runnerId ? (
        <p style={{ fontSize: 13.5, color: "var(--muted)" }}>Elegí un runner para armar su hoja del día.</p>
      ) : (
        <>
          {/* Orden del día */}
          <div style={panel}>
            <label style={label}>Orden del día (consigna)</label>
            <textarea
              value={nota} onChange={(e) => setNota(e.target.value)} rows={3}
              placeholder="Ej: priorizar retiros antes de las 14hs, empezar por Santander…"
              style={{ ...field, resize: "vertical" }}
            />
          </div>

          {/* Cuentas elegidas, en orden */}
          <div style={panel}>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>
              Cuentas a operar ({sel.length})
            </h2>
            {sel.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Tildá cuentas abajo para agregarlas.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sel.map((s, i) => (
                  <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid var(--border)", borderRadius: 10, padding: "8px 10px", background: "var(--card)" }}>
                    <span style={{ fontWeight: 800, color: "var(--accent)", minWidth: 20 }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 650 }}>{s.titular || "—"}</div>
                      <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{s.etiqueta}</div>
                    </div>
                    <button type="button" onClick={() => mover(i, -1)} style={botonSec} aria-label="Subir">▲</button>
                    <button type="button" onClick={() => mover(i, 1)} style={botonSec} aria-label="Bajar">▼</button>
                    <button type="button" onClick={() => toggle(s)} style={{ ...botonSec, color: "var(--warn)" }} aria-label="Quitar">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selector: celulares (con operativas) + bancarias */}
          <div style={panel}>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>Elegí las cuentas</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {celulares.map((cel) => {
                const cuentas = operativasDe(cel.id);
                if (cuentas.length === 0) return null;
                return (
                  <div key={cel.id}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>
                      📱 {cel.alias} · {cel.runner || "sin runner"}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {cuentas.map((c) => {
                        const key = `operativa:${c.id}`;
                        return (
                          <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                            <input type="checkbox" checked={enSel(key)} onChange={() => toggle({ key, origen: "operativa", sourceId: c.id, titular: c.titular, etiqueta: cel.alias })} />
                            <span>{c.titular || "—"} <span style={{ color: "var(--muted)" }}>· {c.aliasPesos || c.cbuPesos || "sin datos"}</span></span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {bancarias.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>🏦 Cuentas bancarias</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {bancarias.map((c) => {
                      const key = `bancaria:${c.id}`;
                      return (
                        <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                          <input type="checkbox" checked={enSel(key)} onChange={() => toggle({ key, origen: "bancaria", sourceId: c.id, titular: c.titular, etiqueta: "Bancaria" })} />
                          <span>{c.titular || "—"} <span style={{ color: "var(--muted)" }}>· {c.aliasPesos || c.cbuPesos || "sin datos"}</span></span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && <p style={{ color: "var(--warn)", fontSize: 13, margin: 0 }}>{error}</p>}
          {msg && <p style={{ color: "var(--accent)", fontSize: 13, margin: 0 }}>{msg}</p>}

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button type="button" onClick={guardar} disabled={guardando} style={{ ...botonDorado, opacity: guardando ? 0.6 : 1 }}>
              {guardando ? "Guardando…" : "Guardar hoja"}
            </button>
            {hojaInicial && (
              <button type="button" onClick={borrar} disabled={borrando} style={{ background: "transparent", border: "1px solid var(--warn)", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 650, color: "var(--warn)", cursor: "pointer", opacity: borrando ? 0.6 : 1 }}>
                {borrando ? "Borrando…" : "Borrar hoja"}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Escribir `web/app/(app)/cambio/hojas/page.tsx`** (server)

```tsx
import Link from "next/link";
import { getRunners } from "@/lib/cambio/runners-datos";
import { getCelulares, getCuentasOperativas } from "@/lib/cambio/celulares-datos";
import { getCuentas } from "@/lib/cambio/cuentas-datos";
import { getHojaParaEditar } from "@/lib/cambio/hojas-datos";
import { hoyISO } from "@/lib/cambio/datos";
import { HojaBuilder } from "@/components/cambio/hoja-builder";
import { MobileTopBar } from "@/components/cambio/mobile-topbar";

export const dynamic = "force-dynamic";

const GM_ACCENT = "#D9A84E";
const GM_GRAD = "linear-gradient(140deg,#D9A84E,#a9791f)";

export default async function HojasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const runnerId = typeof sp.runner === "string" ? sp.runner : "";
  const fecha = typeof sp.dia === "string" && sp.dia ? sp.dia : hoyISO();

  const [runners, celulares, operativas, bancarias, hojaInicial] = await Promise.all([
    getRunners(),
    getCelulares(),
    getCuentasOperativas(),
    getCuentas(),
    runnerId ? getHojaParaEditar(runnerId, fecha) : Promise.resolve(null),
  ]);

  return (
    <div style={{ ["--accent" as string]: GM_ACCENT, ["--grad" as string]: GM_GRAD }}>
      <MobileTopBar />
      <div className="cambio-page" style={{ padding: "26px 30px 40px", display: "flex", flexDirection: "column", gap: 18, maxWidth: 820, margin: "0 auto" }}>
        <div className="cambio-head" style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 780, letterSpacing: "-.5px", margin: 0 }}>Hojas de ruta</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "5px 0 0" }}>Armá la hoja del día de cada runner.</p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Link href="/cambio" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)", display: "inline-flex", alignItems: "center" }}>
              ← Volver a la caja
            </Link>
          </div>
        </div>

        <HojaBuilder
          key={`${runnerId}-${fecha}`}
          runners={runners}
          runnerId={runnerId}
          fecha={fecha}
          celulares={celulares}
          operativas={operativas}
          bancarias={bancarias}
          hojaInicial={hojaInicial}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Sumar el link "Hojas de ruta" en el header de `/cambio`** — en `web/app/(app)/cambio/page.tsx`, dentro de `cambio-head-actions`, después del link a "Runners":

```tsx
          <Link
            href="/cambio/hojas"
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)", display: "inline-flex", alignItems: "center" }}
          >
            Hojas de ruta
          </Link>
```

- [ ] **Step 4: Verificar** `cd web && npx tsc --noEmit && npx eslint "app/(app)/cambio/hojas/page.tsx" components/cambio/hoja-builder.tsx && npx vitest run && npm run build` → todo verde, `/cambio/hojas` compila.

- [ ] **Step 5: Commit** `feat(cambio): página de armado de hojas de ruta`.

---

### Task 5: Vista del runner + impresión (`/panel`)

**Files:** Create `web/components/cambio/hoja-runner.tsx`; Modify `web/app/(panel)/panel/page.tsx`, `web/app/globals.css`.

**Interfaces:**
- Consumes: `getMiHojaDelDia` (`@/lib/cambio/hojas-datos`), `hoyISO` (`@/lib/cambio/datos`), tipo `Hoja`.

- [ ] **Step 1: Escribir `hoja-runner.tsx`** (client — necesita `window.print()`)

```tsx
"use client";
import type { Hoja } from "@/lib/cambio/hojas";

const panel: React.CSSProperties = {
  background: "var(--glass)", backdropFilter: "blur(16px)",
  border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20,
};

export function HojaRunner({ hoja }: { hoja: Hoja | null }) {
  if (!hoja) {
    return (
      <div style={panel}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px" }}>Mi hoja de ruta</h2>
        <p style={{ fontSize: 13.5, color: "var(--muted)", margin: 0 }}>Todavía no tenés hoja para hoy.</p>
      </div>
    );
  }

  const fechaLinda = hoja.fecha.split("-").reverse().join("/");

  return (
    <div className="hoja-print" style={panel}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 780, margin: 0 }}>Mi hoja de ruta</h2>
          <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "3px 0 0" }}>
            {fechaLinda} · {hoja.cuentas.length} {hoja.cuentas.length === 1 ? "cuenta" : "cuentas"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="no-print"
          style={{ marginLeft: "auto", background: "var(--grad)", color: "#fff", border: 0, borderRadius: 11, padding: "9px 15px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
        >
          Imprimir / compartir
        </button>
      </div>

      {hoja.nota && (
        <div style={{ marginTop: 14, background: "rgba(217,168,78,.12)", border: "1px solid rgba(217,168,78,.4)", borderRadius: 12, padding: "12px 14px" }}>
          <div style={{ fontSize: 11, letterSpacing: 1, color: "var(--accent)", fontWeight: 800, marginBottom: 5 }}>ORDEN DEL DÍA</div>
          <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0, whiteSpace: "pre-wrap" }}>{hoja.nota}</p>
        </div>
      )}

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {hoja.cuentas.map((c, i) => (
          <div key={c.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px", background: "var(--card)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: "var(--accent)" }}>{i + 1}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{c.titular || "—"}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{c.etiqueta}</div>
              </div>
            </div>
            <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
              <div style={{ fontSize: 13.5 }}>
                <b style={{ color: "var(--muted)", fontWeight: 700 }}>Pesos:</b> {c.aliasPesos || "—"} · {c.cbuPesos || "—"}
              </div>
              <div style={{ fontSize: 13.5 }}>
                <b style={{ color: "var(--muted)", fontWeight: 700 }}>Dólares:</b> {c.aliasDolares || "—"} · {c.cbuDolares || "—"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Enganchar en `web/app/(panel)/panel/page.tsx`** — importar y mostrar la hoja arriba de "Mis celulares" (solo cuando el runner está vinculado). Importás:

```tsx
import { getMiHojaDelDia } from "@/lib/cambio/hojas-datos";
import { hoyISO } from "@/lib/cambio/datos";
import { HojaRunner } from "@/components/cambio/hoja-runner";
```

Cambiá el `Promise.all` para traer también la hoja de hoy:

```tsx
  const [perfil, celulares, cuentas, hoja] = await Promise.all([
    getMiPerfil(),
    getCelulares(),
    getCuentasOperativas(),
    getMiHojaDelDia(hoyISO()),
  ]);
```

Y en el bloque donde `perfil?.runnerId` es verdadero, poné `<HojaRunner hoja={hoja} />` ANTES del panel "Mis celulares y cuentas":

```tsx
        ) : (
          <>
            <HojaRunner hoja={hoja} />
            <div style={panel}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 14px" }}>Mis celulares y cuentas</h2>
              <PanelCelulares celulares={celulares} cuentas={cuentas} />
            </div>
          </>
        )}
```

- [ ] **Step 3: CSS de impresión** — agregá al final de `web/app/globals.css`:

```css
/* Impresión de la hoja de ruta del runner: al imprimir (o "guardar como PDF"
   desde el celular), se deja solo la tarjeta .hoja-print y se ocultan botones
   y el resto de la pantalla. */
@media print {
  body * { visibility: hidden; }
  .hoja-print, .hoja-print * { visibility: visible; }
  .hoja-print { position: absolute; inset: 0; margin: 0; width: 100%; border: none; background: #fff; color: #000; }
  .hoja-print .no-print { display: none !important; }
}
```

- [ ] **Step 4: Verificar** `cd web && npx tsc --noEmit && npx eslint components/cambio/hoja-runner.tsx "app/(panel)/panel/page.tsx" && npx vitest run && npm run build` → todo verde, `/panel` compila.

- [ ] **Step 5: Commit** `feat(cambio): hoja de ruta del runner en /panel con impresión`.

---

## Verificación final

- Correr `2026-07-31-hojas-ruta.sql` en Supabase (tablas + RLS).
- Suite verde, `tsc`/`lint` limpios, `build` OK.
- Merge + deploy DESPUÉS del SQL.
- Prueba manual: como admin en `/cambio/hojas`, elegir a Zurdo + hoy, escribir una consigna, tildar cuentas de varios celulares + una bancaria, ordenarlas, Guardar. Entrar como Zurdo → en `/panel` ve "Mi hoja de ruta" con la consigna y las cuentas numeradas; "Imprimir / compartir" muestra solo la hoja. Como Ale, NO ve la de Zurdo. Volver como admin, editar (pisa la del día) y borrar.

## Self-review (hecho)

- **Cobertura del spec:** Parte 1 (modelo+RLS) → Task 1; tipos/lectura → Task 2. Parte 2 (armado admin) → Task 3 (actions) + Task 4 (UI). Parte 3 (runner+impresión) → Task 5. "Cantidad de cuentas" = `hoja.cuentas.length` (Task 5). Snapshot desde la fuente → Task 3. Sin DNI → ningún task lo incluye.
- **Placeholders:** ninguno; código completo. Única nota abierta: ajustar la forma exacta del mock de supabase en los tests (Task 2/3) al molde existente; los `expect` fijan el contrato.
- **Consistencia de tipos:** `Hoja`/`HojaCuenta`/`OrigenCuenta` iguales en Task 2, 4 y 5; `SeleccionCuenta` definida en Task 3 y usada en Task 4; `guardarHoja(runnerId, fecha, nota, seleccion)` misma firma en action (Task 3) y builder (Task 4).
```
