# Registro de cargas diarias por cuenta — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Que cada runner registre las cargas del día por cuenta (pesos cargados, dólares comprados, dólares retirados), una por cuenta por día, con vista de "a disposición" vs "cargadas hoy"; y que el admin vea el total del día y el movimiento por cuenta.

**Architecture:** Tabla `cargas` (un registro por cuenta+día con los tres montos y snapshot de titular/etiqueta), capa de datos, server actions, sección en `/panel` (runner) y página en `/cambio/cargas` (admin). La RLS de `cuentas` se abre para que el runner lea sus bancarias asignadas. Reusa `es_admin_cambio()`/`mi_runner_id()`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase, Vitest.

## Global Constraints

- SQL idempotente en `web/lib/db/sql/2026-07-31-cargas.sql`, corrido a mano por Joni en PRODUCCIÓN `zjetaihjddoxxvrpzwsb`. Desplegar el código schema-dependiente DESPUÉS del SQL.
- Reusa `es_admin_cambio()`/`mi_runner_id()`.
- Server actions: `type ResultadoAlta = { ok: true } | { ok: false; error: string }`; `revalidatePath` en try/catch aislado; log `[cambio]`; validar antes de `createClient()`.
- Montos con `parsearMonto` de `@/lib/finanzas/montos` (vacío = 0; al menos uno > 0 para marcar).
- Estilos inline + CSS vars, acento dorado `#D9A84E`, mobile-first. NO pasar funciones server→cliente.

---

### Task 1: Esquema SQL

**Files:** Create `web/lib/db/sql/2026-07-31-cargas.sql`.

- [ ] **Step 1: Escribir el SQL**

```sql
-- Registro de cargas diarias por cuenta — módulo Cambio. Correr en Supabase
-- (zjetaihjddoxxvrpzwsb), editor VACÍO. Idempotente. Reusa es_admin_cambio()/mi_runner_id().

create table if not exists cargas (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid not null references companies(id) on delete cascade,
  fecha          date not null,
  runner_id      uuid references runners(id) on delete set null,
  origen         text not null default 'operativa',   -- operativa | bancaria
  source_id      uuid not null,
  titular        text not null default '',
  etiqueta       text not null default '',
  pesos_cargados numeric not null default 0,
  usd_comprados  numeric not null default 0,
  usd_retirados  numeric not null default 0,
  created_at     timestamptz not null default now()
);
create unique index if not exists cargas_cuenta_fecha_idx on cargas(company_id, origen, source_id, fecha);
create index if not exists cargas_fecha_idx on cargas(company_id, fecha);

alter table cargas enable row level security;
drop policy if exists "cargas_pol" on cargas;
create policy "cargas_pol" on cargas for all to authenticated
  using (es_admin_cambio() or runner_id = mi_runner_id())
  with check (es_admin_cambio() or runner_id = mi_runner_id());

-- El runner puede LEER sus cuentas bancarias asignadas (antes admin-only).
-- Sigue sin poder crearlas/editarlas (with check admin).
drop policy if exists "cambio_admin_cuentas" on cuentas;
drop policy if exists "cuentas_pol" on cuentas;
create policy "cuentas_pol" on cuentas for all to authenticated
  using (es_admin_cambio() or runner_id = mi_runner_id())
  with check (es_admin_cambio());

-- Verificación
select tablename, rowsecurity from pg_tables where tablename in ('cargas','cuentas');
```

- [ ] **Step 2: Commit** `feat(cambio): esquema SQL de cargas diarias`.

---

### Task 2: Tipos, reportes y capa de datos

**Files:** Create `web/lib/cambio/cargas.ts`, `web/lib/cambio/cargas-datos.ts`; Test `web/lib/cambio/cargas.test.ts`, `web/lib/cambio/cargas-datos.test.ts`.

**Interfaces:**
- Produces:
  - `type OrigenCarga = "operativa" | "bancaria"`
  - `type Carga = { id: string; fecha: string; runnerId: string | null; origen: OrigenCarga; sourceId: string; titular: string; etiqueta: string; pesosCargados: number; usdComprados: number; usdRetirados: number }`
  - `type TotalCargas = { pesosCargados: number; usdComprados: number; usdRetirados: number; cantidad: number }`
  - `type SubtotalCuenta = { clave: string; titular: string; etiqueta: string; pesosCargados: number; usdComprados: number; usdRetirados: number; cantidad: number }`
  - `totalDeCargas(cargas: Carga[]): TotalCargas`
  - `subtotalPorCuenta(cargas: Carga[]): SubtotalCuenta[]` — agrupa por `origen:sourceId`, ordena por pesosCargados desc.
  - `claveCarga(origen, sourceId): string` — `` `${origen}:${sourceId}` ``.
  - `getCargasDelDia(fecha: string): Promise<Carga[]>` — RLS limita al runner (o todas para admin).

- [ ] **Step 1: Escribir `cargas.ts`** (tipos + reportes puros)

```ts
export type OrigenCarga = "operativa" | "bancaria";

export type Carga = {
  id: string;
  fecha: string;
  runnerId: string | null;
  origen: OrigenCarga;
  sourceId: string;
  titular: string;
  etiqueta: string;
  pesosCargados: number;
  usdComprados: number;
  usdRetirados: number;
};

export type TotalCargas = { pesosCargados: number; usdComprados: number; usdRetirados: number; cantidad: number };
export type SubtotalCuenta = {
  clave: string; titular: string; etiqueta: string;
  pesosCargados: number; usdComprados: number; usdRetirados: number; cantidad: number;
};

export function claveCarga(origen: OrigenCarga, sourceId: string): string {
  return `${origen}:${sourceId}`;
}

export function totalDeCargas(cargas: Carga[]): TotalCargas {
  return cargas.reduce(
    (t, c) => ({
      pesosCargados: t.pesosCargados + c.pesosCargados,
      usdComprados: t.usdComprados + c.usdComprados,
      usdRetirados: t.usdRetirados + c.usdRetirados,
      cantidad: t.cantidad + 1,
    }),
    { pesosCargados: 0, usdComprados: 0, usdRetirados: 0, cantidad: 0 },
  );
}

export function subtotalPorCuenta(cargas: Carga[]): SubtotalCuenta[] {
  const acc = new Map<string, SubtotalCuenta>();
  for (const c of cargas) {
    const clave = claveCarga(c.origen, c.sourceId);
    const f = acc.get(clave) ?? {
      clave, titular: c.titular, etiqueta: c.etiqueta,
      pesosCargados: 0, usdComprados: 0, usdRetirados: 0, cantidad: 0,
    };
    f.pesosCargados += c.pesosCargados;
    f.usdComprados += c.usdComprados;
    f.usdRetirados += c.usdRetirados;
    f.cantidad += 1;
    acc.set(clave, f);
  }
  return [...acc.values()].sort((a, b) => b.pesosCargados - a.pesosCargados);
}
```

- [ ] **Step 2: Escribir el test de reportes** (`web/lib/cambio/cargas.test.ts`)

```ts
import { describe, it, expect } from "vitest";
import { totalDeCargas, subtotalPorCuenta, claveCarga, type Carga } from "@/lib/cambio/cargas";

function carga(over: Partial<Carga>): Carga {
  return {
    id: "c1", fecha: "2026-07-31", runnerId: "r1", origen: "operativa", sourceId: "a1",
    titular: "Juan", etiqueta: "Zurdo 1", pesosCargados: 0, usdComprados: 0, usdRetirados: 0, ...over,
  };
}

describe("totalDeCargas", () => {
  it("suma las tres columnas y cuenta", () => {
    const t = totalDeCargas([
      carga({ pesosCargados: 100, usdComprados: 10, usdRetirados: 9 }),
      carga({ pesosCargados: 200, usdComprados: 20, usdRetirados: 18 }),
    ]);
    expect(t).toEqual({ pesosCargados: 300, usdComprados: 30, usdRetirados: 27, cantidad: 2 });
  });
  it("lista vacía da todo en cero", () => {
    expect(totalDeCargas([])).toEqual({ pesosCargados: 0, usdComprados: 0, usdRetirados: 0, cantidad: 0 });
  });
});

describe("subtotalPorCuenta", () => {
  it("agrupa por origen:sourceId y ordena por pesos desc", () => {
    const r = subtotalPorCuenta([
      carga({ origen: "operativa", sourceId: "a1", pesosCargados: 100 }),
      carga({ origen: "bancaria", sourceId: "b1", titular: "Ana", etiqueta: "Bancaria", pesosCargados: 300 }),
      carga({ origen: "operativa", sourceId: "a1", pesosCargados: 50, fecha: "2026-07-30" }),
    ]);
    expect(r.map((s) => s.clave)).toEqual(["bancaria:b1", "operativa:a1"]);
    expect(r.find((s) => s.clave === "operativa:a1")).toMatchObject({ pesosCargados: 150, cantidad: 2 });
  });
});

describe("claveCarga", () => {
  it("arma origen:sourceId", () => {
    expect(claveCarga("bancaria", "x")).toBe("bancaria:x");
  });
});
```

- [ ] **Step 3: Correr y ver pasar** (los reportes son puros; se implementaron en el Step 1)

Run: `cd web && npx vitest run lib/cambio/cargas.test.ts` → PASS.

- [ ] **Step 4: Escribir el test de datos** (`web/lib/cambio/cargas-datos.test.ts`)

Molde: `perfiles-datos.test.ts` para el mock. `getCargasDelDia` hace `from("cargas").select(COLS).eq("fecha", fecha).order("created_at")`.

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockOrder = vi.fn();
const fromMock = vi.fn(() => ({ select: () => ({ eq: () => ({ order: mockOrder }) }) }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn(async () => ({ from: fromMock })) }));

import { getCargasDelDia } from "@/lib/cambio/cargas-datos";

beforeEach(() => vi.clearAllMocks());

describe("getCargasDelDia", () => {
  it("mapea snake→camel", async () => {
    mockOrder.mockResolvedValue({
      data: [{
        id: "c1", fecha: "2026-07-31", runner_id: "r1", origen: "bancaria", source_id: "b1",
        titular: "Ana", etiqueta: "Bancaria", pesos_cargados: "100", usd_comprados: "10", usd_retirados: "9",
      }],
      error: null,
    });
    const cargas = await getCargasDelDia("2026-07-31");
    expect(cargas[0]).toEqual({
      id: "c1", fecha: "2026-07-31", runnerId: "r1", origen: "bancaria", sourceId: "b1",
      titular: "Ana", etiqueta: "Bancaria", pesosCargados: 100, usdComprados: 10, usdRetirados: 9,
    });
  });
  it("sin datos da lista vacía", async () => {
    mockOrder.mockResolvedValue({ data: null, error: null });
    expect(await getCargasDelDia("2026-07-31")).toEqual([]);
  });
});
```

- [ ] **Step 5: Correr y ver fallar** → FAIL (no existe `cargas-datos`).

- [ ] **Step 6: Escribir `cargas-datos.ts`**

```ts
import { createClient } from "@/lib/supabase/server";
import type { Carga, OrigenCarga } from "./cargas";

function origenDe(v: unknown): OrigenCarga {
  return v === "bancaria" ? "bancaria" : "operativa";
}

type CargaRow = {
  id: string; fecha: string; runner_id: string | null; origen: string; source_id: string;
  titular: string; etiqueta: string;
  pesos_cargados: number | string; usd_comprados: number | string; usd_retirados: number | string;
};

const COLS = "id,fecha,runner_id,origen,source_id,titular,etiqueta,pesos_cargados,usd_comprados,usd_retirados";

function aCarga(r: CargaRow): Carga {
  return {
    id: r.id, fecha: r.fecha, runnerId: r.runner_id, origen: origenDe(r.origen), sourceId: r.source_id,
    titular: r.titular, etiqueta: r.etiqueta,
    pesosCargados: Number(r.pesos_cargados), usdComprados: Number(r.usd_comprados), usdRetirados: Number(r.usd_retirados),
  };
}

/** Cargas de un día. RLS: el runner ve solo las suyas; el admin, todas. */
export async function getCargasDelDia(fecha: string): Promise<Carga[]> {
  const sb = await createClient();
  const { data, error } = await sb.from("cargas").select(COLS).eq("fecha", fecha).order("created_at");
  if (error) { console.error("[cambio] lectura de cargas falló:", error.message, error.details ?? ""); return []; }
  return ((data ?? []) as unknown as CargaRow[]).map(aCarga);
}
```

- [ ] **Step 7: Correr y ver pasar** → PASS. Y `cd web && npx tsc --noEmit`.

- [ ] **Step 8: Commit** `feat(cambio): tipos, reportes y lectura de cargas`.

---

### Task 3: Server actions

**Files:** Create `web/app/(app)/cambio/cargas-actions.ts`; Test `web/app/(app)/cambio/cargas-actions.test.ts`.

**Interfaces:**
- Consumes: `OrigenCarga` de `@/lib/cambio/cargas`; `parsearMonto` de `@/lib/finanzas/montos`.
- Produces:
  - `marcarCarga(origen: OrigenCarga, sourceId: string, fecha: string, pesos: string, comprados: string, retirados: string): Promise<ResultadoAlta>`
  - `desmarcarCarga(id: string): Promise<ResultadoAlta>`

Molde: `web/app/(app)/cambio/hojas-actions.ts` NO existe en esta rama; usar `celulares-actions.ts` (`empresaId`, `revalidate*` aislado, `ResultadoAlta`, `uno`).

- [ ] **Step 1: Escribir los tests que fallan** (`cargas-actions.test.ts`)

Molde de mock: `celulares-actions.test.ts`. Verificar validaciones (no tocan la base):

```ts
import { describe, it, expect, vi } from "vitest";

const fromMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn(async () => ({ from: fromMock })) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { marcarCarga, desmarcarCarga } from "@/app/(app)/cambio/cargas-actions";

describe("marcarCarga — validación", () => {
  it("rechaza sourceId vacío sin tocar la base", async () => {
    const r = await marcarCarga("operativa", "", "2026-07-31", "100", "", "");
    expect(r.ok).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });
  it("rechaza fecha vacía", async () => {
    const r = await marcarCarga("operativa", "a1", "", "100", "", "");
    expect(r.ok).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });
  it("rechaza cuando los tres montos son cero/vacíos", async () => {
    const r = await marcarCarga("operativa", "a1", "2026-07-31", "", "", "");
    expect(r.ok).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });
  it("rechaza un monto con formato inválido", async () => {
    const r = await marcarCarga("operativa", "a1", "2026-07-31", "10,5,3", "", "");
    expect(r.ok).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });
});

describe("desmarcarCarga — validación", () => {
  it("rechaza id vacío sin tocar la base", async () => {
    const r = await desmarcarCarga("");
    expect(r.ok).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Correr y ver fallar** → FAIL.

- [ ] **Step 3: Escribir `cargas-actions.ts`**

```ts
"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parsearMonto } from "@/lib/finanzas/montos";
import type { OrigenCarga } from "@/lib/cambio/cargas";

export type ResultadoAlta = { ok: true } | { ok: false; error: string };

function uno<T>(rel: T | T[] | null): T | null {
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

// Vacío = 0; si hay algo, tiene que ser un monto válido (o null = inválido).
function montoOpcional(texto: string): number | null {
  return texto.trim() === "" ? 0 : parsearMonto(texto);
}

async function empresaId(sb: Awaited<ReturnType<typeof createClient>>): Promise<string | null> {
  const { data, error } = await sb.from("companies").select("id").ilike("name", "%gestiones%ma%").limit(1).single();
  if (error) { console.error("[cambio] búsqueda de empresa falló:", error.message, error.details ?? ""); return null; }
  if (!data) { console.error("[cambio] no se encontró la empresa GESTIONES MA en companies"); return null; }
  return data.id as string;
}

function revalidarCargas(mensaje: string): void {
  try {
    revalidatePath("/panel");
    revalidatePath("/cambio/cargas");
  } catch (e) {
    console.error(`[cambio] ${mensaje} pero revalidatePath falló:`, e instanceof Error ? e.message : String(e));
  }
}

type PhoneAccountRow = { holder_name: string; runner_id: string | null; phones: { alias: string; runner_id: string | null } | { alias: string; runner_id: string | null }[] | null };
type CuentaRow = { titular: string; runner_id: string | null };

export async function marcarCarga(
  origen: OrigenCarga, sourceId: string, fecha: string, pesos: string, comprados: string, retirados: string,
): Promise<ResultadoAlta> {
  if (!sourceId) return { ok: false, error: "Falta la cuenta." };
  if (!fecha) return { ok: false, error: "Falta la fecha." };

  const p = montoOpcional(pesos);
  const c = montoOpcional(comprados);
  const r = montoOpcional(retirados);
  if (p === null || c === null || r === null) return { ok: false, error: "Revisá los montos: alguno no es válido." };
  if (p === 0 && c === 0 && r === 0) return { ok: false, error: "Cargá al menos un monto." };

  try {
    const sb = await createClient();
    const cid = await empresaId(sb);
    if (!cid) return { ok: false, error: "No se encontró la empresa. Avisá al administrador." };

    // Snapshot + runner desde la cuenta.
    let titular = "";
    let etiqueta = "";
    let runnerId: string | null = null;
    if (origen === "operativa") {
      const { data } = await sb.from("phone_accounts").select("holder_name,phones(alias,runner_id)").eq("id", sourceId).limit(1).single();
      const row = data as unknown as PhoneAccountRow | null;
      if (!row) return { ok: false, error: "No se encontró la cuenta." };
      titular = row.holder_name ?? "";
      etiqueta = uno(row.phones)?.alias ?? "";
      runnerId = uno(row.phones)?.runner_id ?? null;
    } else {
      const { data } = await sb.from("cuentas").select("titular,runner_id").eq("id", sourceId).limit(1).single();
      const row = data as unknown as CuentaRow | null;
      if (!row) return { ok: false, error: "No se encontró la cuenta." };
      titular = row.titular ?? "";
      etiqueta = "Bancaria";
      runnerId = row.runner_id ?? null;
    }

    const { error } = await sb.from("cargas").upsert(
      { company_id: cid, fecha, origen, source_id: sourceId, runner_id: runnerId, titular, etiqueta,
        pesos_cargados: p, usd_comprados: c, usd_retirados: r },
      { onConflict: "company_id,origen,source_id,fecha" },
    );
    if (error) {
      console.error("[cambio] marcar carga falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo guardar la carga. Probá de nuevo." };
    }
  } catch (e) {
    console.error("[cambio] marcarCarga falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo guardar la carga. Probá de nuevo." };
  }

  revalidarCargas("la carga se guardó");
  return { ok: true };
}

export async function desmarcarCarga(id: string): Promise<ResultadoAlta> {
  if (!id) return { ok: false, error: "Falta la carga." };
  try {
    const sb = await createClient();
    const { error } = await sb.from("cargas").delete().eq("id", id);
    if (error) {
      console.error("[cambio] desmarcar carga falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo desmarcar. Probá de nuevo." };
    }
  } catch (e) {
    console.error("[cambio] desmarcarCarga falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo desmarcar. Probá de nuevo." };
  }
  revalidarCargas("la carga se borró");
  return { ok: true };
}
```

- [ ] **Step 4: Correr y ver pasar** + `tsc` + `lint`.

Run: `cd web && npx vitest run "app/(app)/cambio/cargas-actions.test.ts" && npx tsc --noEmit && npx eslint "app/(app)/cambio/cargas-actions.ts"`.

- [ ] **Step 5: Commit** `feat(cambio): server actions de cargas (marcar/desmarcar)`.

---

### Task 4: Sección "Cargas de hoy" del runner (`/panel`)

**Files:** Create `web/components/cambio/cargas-runner.tsx`; Modify `web/app/(panel)/panel/page.tsx`.

**Interfaces:**
- Consumes: `getCuentasOperativas` (`@/lib/cambio/celulares-datos`), `getCuentas` (`@/lib/cambio/cuentas-datos`), `getCargasDelDia` (`@/lib/cambio/cargas-datos`), `hoyISO` (`@/lib/cambio/datos`), `claveCarga`/tipos (`@/lib/cambio/cargas`), `marcarCarga`/`desmarcarCarga` (`@/app/(app)/cambio/cargas-actions`), tipos `CuentaOperativa`/`Cuenta`.

Notas:
- La página arma una lista unificada de "cuentas del runner" (serializable, NO funciones): por cada operativa `{clave:'operativa:'+id, origen:'operativa', sourceId:id, titular, etiqueta:'(alias del celu — se resuelve en la página con los celulares)', datos}` y por cada bancaria `{clave:'bancaria:'+id, origen:'bancaria', sourceId:id, titular, etiqueta:'Bancaria'}`. Para no pasar el alias del celu (que requiere cruzar con celulares), la operativa usa como etiqueta el titular o vacío; el back-end igual snapshotea el alias real al marcar. Mantener simple: etiqueta de operativa = "" (la página no tiene el alias sin cargar celulares; si se quiere, cargá `getCelulares()` y mapeá `celularId`→alias).
- El componente cruza cada cuenta con `cargasHoy` por `clave` para separarlas.

- [ ] **Step 1: Escribir `cargas-runner.tsx`** (client)

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { marcarCarga, desmarcarCarga } from "@/app/(app)/cambio/cargas-actions";
import type { Carga, OrigenCarga } from "@/lib/cambio/cargas";
import { claveCarga } from "@/lib/cambio/cargas";

export type CuentaDelRunner = {
  clave: string;
  origen: OrigenCarga;
  sourceId: string;
  titular: string;
  etiqueta: string;
};

const panel: React.CSSProperties = {
  background: "var(--glass)", backdropFilter: "blur(16px)",
  border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20,
};
const field: React.CSSProperties = {
  width: "100%", background: "var(--card)", border: "1px solid var(--border)",
  borderRadius: 10, padding: "10px 12px", fontSize: 16, color: "var(--text)", fontFamily: "inherit",
};
const label: React.CSSProperties = { fontSize: 11.5, color: "var(--muted)", display: "block", marginBottom: 5 };
const botonDorado: React.CSSProperties = {
  background: "var(--grad)", color: "#fff", border: 0, borderRadius: 11, padding: "10px 16px",
  fontSize: 13, fontWeight: 700, cursor: "pointer",
};
const botonSec: React.CSSProperties = {
  background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "8px 14px",
  fontSize: 13, fontWeight: 600, color: "var(--text)", cursor: "pointer",
};

function fmt(n: number): string {
  return n.toLocaleString("es-AR", { maximumFractionDigits: 2 });
}

export function CargasRunner({
  cuentas, cargasHoy, fecha,
}: {
  cuentas: CuentaDelRunner[];
  cargasHoy: Carga[];
  fecha: string;
}) {
  const router = useRouter();
  const [marcando, setMarcando] = useState<string | null>(null); // clave en edición
  const [pesos, setPesos] = useState("");
  const [comprados, setComprados] = useState("");
  const [retirados, setRetirados] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const cargaDe = (clave: string): Carga | undefined =>
    cargasHoy.find((c) => claveCarga(c.origen, c.sourceId) === clave);

  const disponibles = cuentas.filter((c) => !cargaDe(c.clave));
  const usadas = cuentas.filter((c) => cargaDe(c.clave));

  const abrir = (clave: string) => {
    setMarcando(clave); setPesos(""); setComprados(""); setRetirados(""); setError(null);
  };
  const cancelar = () => { setMarcando(null); setError(null); };

  const guardar = async (cta: CuentaDelRunner) => {
    if (ocupado) return;
    setOcupado(true); setError(null);
    try {
      const r = await marcarCarga(cta.origen, cta.sourceId, fecha, pesos, comprados, retirados);
      if (r.ok) { setMarcando(null); router.refresh(); }
      else setError(r.error);
    } catch { setError("No se pudo conectar. Probá de nuevo."); }
    finally { setOcupado(false); }
  };

  const desmarcar = async (c: Carga) => {
    if (ocupado) return;
    if (!window.confirm("¿Desmarcar esta carga?")) return;
    setOcupado(true);
    try {
      const r = await desmarcarCarga(c.id);
      if (r.ok) router.refresh();
    } catch { /* noop */ }
    finally { setOcupado(false); }
  };

  return (
    <div style={panel}>
      <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>Cargas de hoy</h2>
      <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 14px" }}>
        Marcá cada cuenta a medida que la usás. Al otro día se reinicia.
      </p>

      <h3 style={{ fontSize: 12.5, fontWeight: 800, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 10px" }}>
        A disposición ({disponibles.length})
      </h3>
      {disponibles.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 16px" }}>No te quedan cuentas por usar hoy.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {disponibles.map((cta) => (
            <div key={cta.clave} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "11px 13px", background: "var(--card)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 650 }}>{cta.titular || "—"}</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{cta.etiqueta}</div>
                </div>
                {marcando !== cta.clave && (
                  <button type="button" onClick={() => abrir(cta.clave)} style={botonDorado}>Marcar como cargada</button>
                )}
              </div>
              {marcando === cta.clave && (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="campo-fila" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    <div><label style={label}>Pesos cargados</label><input inputMode="decimal" value={pesos} onChange={(e) => setPesos(e.target.value)} style={field} placeholder="0" /></div>
                    <div><label style={label}>Dólares comprados</label><input inputMode="decimal" value={comprados} onChange={(e) => setComprados(e.target.value)} style={field} placeholder="0" /></div>
                    <div><label style={label}>Dólares retirados</label><input inputMode="decimal" value={retirados} onChange={(e) => setRetirados(e.target.value)} style={field} placeholder="0" /></div>
                  </div>
                  {error && <p style={{ color: "var(--warn)", fontSize: 12.5, margin: 0 }}>{error}</p>}
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button type="button" onClick={cancelar} disabled={ocupado} style={botonSec}>Cancelar</button>
                    <button type="button" onClick={() => guardar(cta)} disabled={ocupado} style={{ ...botonDorado, opacity: ocupado ? 0.6 : 1 }}>
                      {ocupado ? "Guardando…" : "Guardar carga"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <h3 style={{ fontSize: 12.5, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 10px" }}>
        Cargadas hoy ({usadas.length})
      </h3>
      {usadas.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Todavía no marcaste ninguna.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {usadas.map((cta) => {
            const c = cargaDe(cta.clave)!;
            return (
              <div key={cta.clave} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "11px 13px", background: "var(--card)", opacity: 0.9 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 650 }}>✓ {cta.titular || "—"}</div>
                    <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{cta.etiqueta}</div>
                  </div>
                  <button type="button" onClick={() => desmarcar(c)} disabled={ocupado} style={{ ...botonSec, color: "var(--warn)" }}>Desmarcar</button>
                </div>
                <div style={{ marginTop: 8, fontSize: 12.5, color: "var(--muted)" }}>
                  Pesos: {fmt(c.pesosCargados)} · Comprados: USD {fmt(c.usdComprados)} · Retirados: USD {fmt(c.usdRetirados)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Enganchar en `web/app/(panel)/panel/page.tsx`**

Importar y cargar los datos, armar la lista `CuentaDelRunner[]` y mostrar `<CargasRunner>` arriba de "Mis celulares y cuentas". Añadir imports:

```tsx
import { getCuentas } from "@/lib/cambio/cuentas-datos";
import { getCargasDelDia } from "@/lib/cambio/cargas-datos";
import { hoyISO } from "@/lib/cambio/datos";
import { CargasRunner, type CuentaDelRunner } from "@/components/cambio/cargas-runner";
```

En el `Promise.all`, sumar `getCuentas()` y `getCargasDelDia(hoyISO())` (y ya está `getCuentasOperativas()` como `cuentas`). Ojo con el nombre: hoy la página nombra `cuentas` a las operativas; renombrá a `operativas` para no chocar con las bancarias. Resultado:

```tsx
  const hoy = hoyISO();
  const [perfil, celulares, operativas, bancarias, cargasHoy] = await Promise.all([
    getMiPerfil(),
    getCelulares(),
    getCuentasOperativas(),
    getCuentas(),
    getCargasDelDia(hoy),
  ]);

  // Lista unificada de cuentas del runner para las cargas (solo datos serializables).
  const cuentasDelRunner: CuentaDelRunner[] = [
    ...operativas.map((o) => ({
      clave: `operativa:${o.id}`, origen: "operativa" as const, sourceId: o.id,
      titular: o.titular, etiqueta: celulares.find((cel) => cel.id === o.celularId)?.alias ?? "Celular",
    })),
    ...bancarias.map((b) => ({
      clave: `bancaria:${b.id}`, origen: "bancaria" as const, sourceId: b.id,
      titular: b.titular, etiqueta: "Bancaria",
    })),
  ];
```

Y en el bloque `perfil?.runnerId` verdadero, ANTES de `<div style={panel}>Mis celulares…`, insertá:

```tsx
            <CargasRunner cuentas={cuentasDelRunner} cargasHoy={cargasHoy} fecha={hoy} />
```

Y en el `PanelCelulares` de más abajo, cambiá `cuentas={cuentas}` por `cuentas={operativas}`.

- [ ] **Step 3: Verificar** `cd web && npx tsc --noEmit && npx eslint components/cambio/cargas-runner.tsx "app/(panel)/panel/page.tsx" && npx vitest run && npm run build`.

- [ ] **Step 4: Commit** `feat(cambio): sección Cargas de hoy en el panel del runner`.

---

### Task 5: Página "Cargas" del admin (`/cambio/cargas`)

**Files:** Create `web/components/cambio/cargas-admin.tsx`, `web/app/(app)/cambio/cargas/page.tsx`; Modify `web/app/(app)/cambio/page.tsx` (link).

**Interfaces:**
- Consumes: `getCargasDelDia` (`@/lib/cambio/cargas-datos`), `totalDeCargas`/`subtotalPorCuenta`/tipos (`@/lib/cambio/cargas`), `getRunners` (`@/lib/cambio/runners-datos`), `hoyISO` (`@/lib/cambio/datos`).

- [ ] **Step 1: Escribir `cargas-admin.tsx`** (client — selector de día por router)

```tsx
"use client";
import { useRouter } from "next/navigation";
import type { Carga, TotalCargas, SubtotalCuenta } from "@/lib/cambio/cargas";
import type { Runner } from "@/lib/cambio/runners";

const panel: React.CSSProperties = {
  background: "var(--glass)", backdropFilter: "blur(16px)",
  border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20,
};
const th: React.CSSProperties = { textAlign: "right", fontSize: 11, color: "var(--muted)", fontWeight: 600, padding: "0 0 10px", whiteSpace: "nowrap" };
const td: React.CSSProperties = { textAlign: "right", fontSize: 13, padding: "10px 0", borderTop: "1px solid var(--border)", whiteSpace: "nowrap" };

function fmt(n: number): string { return n.toLocaleString("es-AR", { maximumFractionDigits: 2 }); }

export function CargasAdmin({
  cargas, total, porCuenta, runners, fecha,
}: {
  cargas: Carga[]; total: TotalCargas; porCuenta: SubtotalCuenta[]; runners: Runner[]; fecha: string;
}) {
  const router = useRouter();
  const nombreRunner = (id: string | null): string => (id ? runners.find((r) => r.id === id)?.nombre ?? "—" : "—");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <input type="date" value={fecha} onChange={(e) => e.target.value && router.push(`/cambio/cargas?dia=${e.target.value}`)}
          style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "9px 12px", fontSize: 13, color: "var(--text)" }} />
        <span style={{ fontSize: 13, color: "var(--muted)" }}>{cargas.length} carga(s) · {fecha.split("-").reverse().join("/")}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
        {[
          { k: "Pesos cargados", v: fmt(total.pesosCargados) },
          { k: "Dólares comprados", v: `USD ${fmt(total.usdComprados)}` },
          { k: "Dólares retirados", v: `USD ${fmt(total.usdRetirados)}` },
        ].map((c) => (
          <div key={c.k} style={{ ...panel, padding: "16px 18px" }}>
            <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{c.k}</div>
            <b className="tnum" style={{ fontSize: 22, fontWeight: 780, display: "block", marginTop: 8 }}>{c.v}</b>
          </div>
        ))}
      </div>

      <div style={panel}>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>Movimientos del día</h2>
        {cargas.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>No hay cargas para este día.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={{ ...th, textAlign: "left" }}>Runner</th>
                <th style={{ ...th, textAlign: "left" }}>Cuenta</th>
                <th style={th}>Pesos</th><th style={th}>USD comprados</th><th style={th}>USD retirados</th>
              </tr></thead>
              <tbody>
                {cargas.map((c) => (
                  <tr key={c.id}>
                    <td style={{ ...td, textAlign: "left" }}>{nombreRunner(c.runnerId)}</td>
                    <td style={{ ...td, textAlign: "left" }}>{c.titular || "—"} <span style={{ color: "var(--muted)" }}>· {c.etiqueta}</span></td>
                    <td style={td} className="tnum">{fmt(c.pesosCargados)}</td>
                    <td style={td} className="tnum">{fmt(c.usdComprados)}</td>
                    <td style={td} className="tnum">{fmt(c.usdRetirados)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={panel}>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>Movimiento por cuenta</h2>
        {porCuenta.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Sin datos.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={{ ...th, textAlign: "left" }}>Cuenta</th>
                <th style={th}>Pesos</th><th style={th}>USD comprados</th><th style={th}>USD retirados</th><th style={th}>Cargas</th>
              </tr></thead>
              <tbody>
                {porCuenta.map((s) => (
                  <tr key={s.clave}>
                    <td style={{ ...td, textAlign: "left" }}>{s.titular || "—"} <span style={{ color: "var(--muted)" }}>· {s.etiqueta}</span></td>
                    <td style={td} className="tnum">{fmt(s.pesosCargados)}</td>
                    <td style={td} className="tnum">{fmt(s.usdComprados)}</td>
                    <td style={td} className="tnum">{fmt(s.usdRetirados)}</td>
                    <td style={td} className="tnum">{s.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Escribir `web/app/(app)/cambio/cargas/page.tsx`** (server)

```tsx
import Link from "next/link";
import { getCargasDelDia } from "@/lib/cambio/cargas-datos";
import { getRunners } from "@/lib/cambio/runners-datos";
import { totalDeCargas, subtotalPorCuenta } from "@/lib/cambio/cargas";
import { hoyISO } from "@/lib/cambio/datos";
import { CargasAdmin } from "@/components/cambio/cargas-admin";
import { MobileTopBar } from "@/components/cambio/mobile-topbar";

export const dynamic = "force-dynamic";

const GM_ACCENT = "#D9A84E";
const GM_GRAD = "linear-gradient(140deg,#D9A84E,#a9791f)";

export default async function CargasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const fecha = typeof sp.dia === "string" && sp.dia ? sp.dia : hoyISO();
  const [cargas, runners] = await Promise.all([getCargasDelDia(fecha), getRunners()]);
  const total = totalDeCargas(cargas);
  const porCuenta = subtotalPorCuenta(cargas);

  return (
    <div style={{ ["--accent" as string]: GM_ACCENT, ["--grad" as string]: GM_GRAD }}>
      <MobileTopBar />
      <div className="cambio-page" style={{ padding: "26px 30px 40px", display: "flex", flexDirection: "column", gap: 18, maxWidth: 900, margin: "0 auto" }}>
        <div className="cambio-head" style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 780, letterSpacing: "-.5px", margin: 0 }}>Cargas</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "5px 0 0" }}>Las cargas del día por cuenta y por runner.</p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Link href="/cambio" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)", display: "inline-flex", alignItems: "center" }}>← Volver a la caja</Link>
          </div>
        </div>
        <CargasAdmin cargas={cargas} total={total} porCuenta={porCuenta} runners={runners} fecha={fecha} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Link "Cargas" en el header de `/cambio`** — en `web/app/(app)/cambio/page.tsx`, dentro de `cambio-head-actions`, después del link "Cuentas":

```tsx
          <Link
            href="/cambio/cargas"
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)", display: "inline-flex", alignItems: "center" }}
          >
            Cargas
          </Link>
```

- [ ] **Step 4: Verificar** `cd web && npx tsc --noEmit && npx eslint components/cambio/cargas-admin.tsx "app/(app)/cambio/cargas/page.tsx" && npx vitest run && npm run build`.

- [ ] **Step 5: Commit** `feat(cambio): página de cargas del admin con totales y por cuenta`.

---

## Verificación final

- Correr `2026-07-31-cargas.sql` en Supabase (tabla + RLS + cambio de RLS de `cuentas`).
- Suite verde, `tsc`/`lint` limpios, `build` OK. Merge + deploy DESPUÉS del SQL.
- Prueba manual: como Zurdo en `/panel`, marcar una cuenta con los tres montos → pasa a "Cargadas hoy"; desmarcar → vuelve; no se puede marcar dos veces. Como admin en `/cambio/cargas`, ver los totales y el movimiento por cuenta; cambiar la fecha. Ale no ve lo de Zurdo.

## Self-review (hecho)

- **Cobertura del spec:** Parte 1 → Task 1; tipos/reportes/datos → Task 2; actions → Task 3; runner → Task 4; admin → Task 5. Ciclo completo (3 montos) en Task 2/3/4/5. RLS de `cuentas` abierta al runner → Task 1.
- **Placeholders:** ninguno; código completo. Nota abierta: ajustar la forma exacta del mock de supabase en los tests al molde existente; los `expect` fijan el contrato.
- **Consistencia de tipos:** `Carga`/`OrigenCarga`/`claveCarga` iguales en Task 2/3/4/5; `marcarCarga(origen, sourceId, fecha, pesos, comprados, retirados)` misma firma en action (Task 3) y runner (Task 4); `getCargasDelDia(fecha)` usada por runner y admin.
```
