# Altas de clientes, emisores y receptores — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar de alta clientes, emisores y receptores desde el formulario de `/cambio` (con un combobox buscador + "+ nuevo") y desde una pantalla de Contactos, sin salir de la plataforma.

**Architecture:** Nueva tabla `exchange_people` que respalda los buscadores de emisor/receptor; clientes usan la `exchange_clients` existente. Un componente cliente reutilizable `ComboAlta` (buscador + "+ nuevo") reemplaza los tres campos del formulario. La lógica pura del combo se extrae a `lib/cambio/combo.ts` y se testea. Emisor/receptor se siguen guardando como **texto** en `exchange_ops`, así que el cálculo, los rankings y la exportación no cambian.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Supabase (PostgREST + RLS), Vitest.

## Global Constraints

- **Spec:** `docs/superpowers/specs/2026-07-23-cambio-altas-design.md`. Ante dudas de dominio, manda el spec.
- **Rama:** `master` está desplegado. Crear rama `feat/cambio-altas` antes de la Task 1.
- **Nombres:** tablas/columnas en `snake_case` inglés; tipos y funciones de dominio en **español**.
- **Enums/estados:** `boolean active default true`; nada de CHECK constraints.
- **RLS obligatorio** en la tabla nueva: `create policy "auth_all_exchange_people" on exchange_people for all to authenticated using (true) with check (true);`
- **Índice único case-insensitive** en el nombre: `(company_id, lower(name))`, igual que `exchange_clients`.
- **Siempre loguear el `error` de Supabase** con prefijo `[cambio]` en cada lectura y escritura.
- **Lectura por `createClient()` de `@/lib/supabase/server`**, nunca Drizzle en runtime.
- **Estilos inline** con las CSS variables de `web/app/globals.css`. Sin shadcn ni Tailwind en componentes. Acento dorado de la caja: la pantalla ya inyecta `--accent`/`--grad` de Gestiones MA; los componentes nuevos usan `var(--accent)`/`var(--grad)`.
- **Tests:** solo lógica pura (`lib/cambio/*.ts`) y server actions. Nada de componentes React (no hay jsdom). Los tests existentes (244 pasando, 5 skipped) tienen que seguir pasando.
- **Server actions:** resultado discriminado, `revalidatePath("/cambio")` en su propio try/catch, gateados por acceso a la caja (el tier actual — todos cambio-only — puede usarlos; NO requieren `tieneAccesoCompleto`).
- **Verificación por tarea:** `npx tsc --noEmit`, `npm run lint`, `npx vitest run` en verde antes de cada commit.
- **El cálculo no cambia:** `exchange_ops.sender`/`receiver` siguen siendo texto.

## File Structure

| Archivo | Responsabilidad |
|---|---|
| `lib/db/sql/2026-07-23-cambio-personas.sql` | Tabla `exchange_people` + índice + RLS. Se corre a mano en Supabase. |
| `lib/cambio/combo.ts` | Lógica pura del combobox: filtrar opciones, detectar coincidencia exacta, decidir el valor a enviar. |
| `lib/cambio/combo.test.ts` | Tests de la lógica del combo. |
| `lib/cambio/datos.ts` | **Modificar:** agregar `getPersonasParaOperacion()` y `getContactos()`. |
| `app/(app)/cambio/contactos-actions.ts` | Server actions: crear cliente/persona, activar/desactivar. |
| `app/(app)/cambio/contactos-actions.test.ts` | Tests de los server actions. |
| `components/cambio/combo-alta.tsx` | Componente cliente reutilizable: buscador + "+ nuevo". |
| `components/cambio/nueva-operacion-form.tsx` | **Modificar:** usar `ComboAlta` en Cliente/Emisor/Receptor; recibir `personas`. |
| `components/cambio/contactos-modal.tsx` | Modal de administración de clientes y personas. |
| `app/(app)/cambio/page.tsx` | **Modificar:** traer personas y contactos; pasar props; botón "Contactos". |

---

### Task 1: Tabla `exchange_people` en Supabase

**Files:**
- Create: `lib/db/sql/2026-07-23-cambio-personas.sql`

**Interfaces:**
- Consumes: tabla `companies` existente.
- Produces: tabla `exchange_people` con columnas `id, company_id, name, active, created_at`.

- [ ] **Step 1: Crear la rama**

Run: `git checkout -b feat/cambio-altas`
Expected: `Switched to a new branch 'feat/cambio-altas'`

- [ ] **Step 2: Escribir el SQL**

Crear `lib/db/sql/2026-07-23-cambio-personas.sql`:

```sql
-- Módulo Cambio — personas (emisores / receptores)
-- Correr en el editor SQL de Supabase (proyecto zjetaihjddoxxvrpzwsb),
-- con el editor VACÍO antes de pegar. Es idempotente.

-- Personas que actúan como emisor o receptor. Una misma persona puede ser
-- ambos, por eso es una sola tabla. En exchange_ops el emisor/receptor se
-- sigue guardando como TEXTO; esta tabla solo alimenta el buscador del alta.
create table if not exists exchange_people (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name       text not null,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists exchange_people_name_idx
  on exchange_people(company_id, lower(name));

alter table exchange_people enable row level security;

drop policy if exists "auth_all_exchange_people" on exchange_people;
create policy "auth_all_exchange_people" on exchange_people
  for all to authenticated using (true) with check (true);

-- Verificación: debe devolver una fila con rowsecurity = true.
select tablename, rowsecurity from pg_tables where tablename = 'exchange_people';
```

- [ ] **Step 3: Correrlo en Supabase**

Este paso lo hace **el usuario**. Pegarle el contenido completo del archivo **en el chat** (no la ruta), pedirle que lo corra en el editor SQL con el editor vacío, y que confirme que la query final devuelve `exchange_people | true`.

- [ ] **Step 4: Commit**

```bash
git add lib/db/sql/2026-07-23-cambio-personas.sql
git commit -m "feat(cambio): tabla de personas para emisores y receptores

Respalda el buscador del alta. En exchange_ops el emisor/receptor sigue
guardándose como texto: el cálculo no cambia.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Lógica pura del combobox

**Files:**
- Create: `lib/cambio/combo.ts`
- Test: `lib/cambio/combo.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `type OpcionCombo = { value: string; nombre: string }`
  - `filtrarOpciones(opciones: OpcionCombo[], texto: string): OpcionCombo[]`
  - `hayCoincidenciaExacta(opciones: OpcionCombo[], texto: string): boolean`
  - `valorASubmit(sel: OpcionCombo | null, texto: string, permitirLibre: boolean): string`

- [ ] **Step 1: Escribir el test que falla**

Crear `lib/cambio/combo.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { filtrarOpciones, hayCoincidenciaExacta, valorASubmit, type OpcionCombo } from "./combo";

const OPS: OpcionCombo[] = [
  { value: "1", nombre: "Juan Perez" },
  { value: "2", nombre: "Maria Gomez" },
  { value: "3", nombre: "Ana Perez" },
];

describe("filtrarOpciones", () => {
  it("con texto vacío devuelve todas", () => {
    expect(filtrarOpciones(OPS, "")).toHaveLength(3);
  });

  it("filtra por coincidencia parcial, sin importar mayúsculas", () => {
    expect(filtrarOpciones(OPS, "perez").map((o) => o.nombre)).toEqual(["Juan Perez", "Ana Perez"]);
  });

  it("ignora espacios al principio y al final del texto", () => {
    expect(filtrarOpciones(OPS, "  maria ").map((o) => o.nombre)).toEqual(["Maria Gomez"]);
  });

  it("sin coincidencias devuelve lista vacía", () => {
    expect(filtrarOpciones(OPS, "xyz")).toEqual([]);
  });
});

describe("hayCoincidenciaExacta", () => {
  it("detecta un nombre igual ignorando mayúsculas y espacios", () => {
    expect(hayCoincidenciaExacta(OPS, "  juan perez ")).toBe(true);
  });

  it("un nombre parcial no es coincidencia exacta", () => {
    expect(hayCoincidenciaExacta(OPS, "juan")).toBe(false);
  });

  it("texto vacío no es coincidencia exacta", () => {
    expect(hayCoincidenciaExacta(OPS, "")).toBe(false);
  });
});

describe("valorASubmit", () => {
  it("si hay una opción elegida, envía su value", () => {
    expect(valorASubmit({ value: "2", nombre: "Maria Gomez" }, "otra cosa", false)).toBe("2");
  });

  it("sin selección y permitiendo texto libre, envía el texto recortado", () => {
    // El caso del emisor/receptor que aparece una sola vez: se guarda tal cual.
    expect(valorASubmit(null, "  Deposito Sur  ", true)).toBe("Deposito Sur");
  });

  it("sin selección y sin permitir texto libre, envía cadena vacía", () => {
    // El caso del cliente: no puede ser texto suelto porque va como FK.
    expect(valorASubmit(null, "algo tipeado", false)).toBe("");
  });
});
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `npx vitest run lib/cambio/combo.test.ts`
Expected: FAIL — `Failed to resolve import "./combo"`.

- [ ] **Step 3: Escribir la implementación**

Crear `lib/cambio/combo.ts`:

```ts
export type OpcionCombo = { value: string; nombre: string };

/** Filtra por coincidencia parcial en el nombre, ignorando mayúsculas y espacios. */
export function filtrarOpciones(opciones: OpcionCombo[], texto: string): OpcionCombo[] {
  const q = texto.trim().toLowerCase();
  if (q === "") return opciones;
  return opciones.filter((o) => o.nombre.toLowerCase().includes(q));
}

/** ¿Algún nombre es exactamente el texto (ignorando mayúsculas y espacios)? */
export function hayCoincidenciaExacta(opciones: OpcionCombo[], texto: string): boolean {
  const q = texto.trim().toLowerCase();
  if (q === "") return false;
  return opciones.some((o) => o.nombre.trim().toLowerCase() === q);
}

/**
 * Qué valor viaja al formulario. Con una opción elegida, su `value`. Sin
 * selección: si el campo admite texto libre (emisor/receptor), el texto
 * recortado; si no (cliente, que es una FK), cadena vacía.
 */
export function valorASubmit(sel: OpcionCombo | null, texto: string, permitirLibre: boolean): string {
  if (sel) return sel.value;
  return permitirLibre ? texto.trim() : "";
}
```

- [ ] **Step 4: Correr los tests**

Run: `npx vitest run lib/cambio/combo.test.ts`
Expected: PASS, 10 tests.

- [ ] **Step 5: Lint y commit**

```bash
npm run lint
git add lib/cambio/combo.ts lib/cambio/combo.test.ts
git commit -m "feat(cambio): lógica del combobox de altas

Filtrado case-insensitive y regla del valor a enviar: emisor/receptor
admiten texto libre, cliente no (es una FK).

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Capa de datos — personas y contactos

**Files:**
- Modify: `lib/cambio/datos.ts` (agregar dos getters al final, junto a `getClientesParaOperacion`)

**Interfaces:**
- Consumes: `createClient` de `@/lib/supabase/server`.
- Produces:
  - `getPersonasParaOperacion(): Promise<{ id: string; nombre: string }[]>` — personas activas.
  - `type ContactoAdmin = { id: string; nombre: string; activo: boolean }`
  - `getContactos(): Promise<{ clientes: ContactoAdmin[]; personas: ContactoAdmin[] }>` — todos, activos e inactivos.

- [ ] **Step 1: Escribir la implementación**

Agregar al final de `lib/cambio/datos.ts` (después de `getCajasParaOperacion`):

```ts
export async function getPersonasParaOperacion(): Promise<{ id: string; nombre: string }[]> {
  const sb = await createClient();
  const { data, error } = await sb.from("exchange_people").select("id,name").eq("active", true).order("name");
  // Mismo criterio que getClientesParaOperacion: un error de lectura se ve
  // igual que "no hay personas" si no se loguea.
  if (error) console.error("[cambio] lectura falló:", error.message, error.details ?? "");
  return (data ?? []).map((p) => ({ id: p.id as string, nombre: p.name as string }));
}

export type ContactoAdmin = { id: string; nombre: string; activo: boolean };

/** Clientes y personas TODOS (activos e inactivos) para la pantalla de Contactos. */
export async function getContactos(): Promise<{ clientes: ContactoAdmin[]; personas: ContactoAdmin[] }> {
  const sb = await createClient();
  const [{ data: cli, error: errCli }, { data: per, error: errPer }] = await Promise.all([
    sb.from("exchange_clients").select("id,name,active").order("name"),
    sb.from("exchange_people").select("id,name,active").order("name"),
  ]);
  const fallo = errCli ?? errPer;
  if (fallo) console.error("[cambio] lectura falló:", fallo.message, fallo.details ?? "");
  const aContacto = (r: { id: string; name: string; active: boolean }): ContactoAdmin => ({
    id: r.id,
    nombre: r.name,
    activo: r.active,
  });
  return {
    clientes: ((cli ?? []) as { id: string; name: string; active: boolean }[]).map(aContacto),
    personas: ((per ?? []) as { id: string; name: string; active: boolean }[]).map(aContacto),
  };
}
```

- [ ] **Step 2: Verificar que compila y los tests siguen pasando**

Run: `npx tsc --noEmit && npx vitest run`
Expected: sin errores de tipo; 244 tests pasando, 5 skipped.

- [ ] **Step 3: Lint y commit**

```bash
npm run lint
git add lib/cambio/datos.ts
git commit -m "feat(cambio): lectura de personas y de contactos

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Server actions de contactos

**Files:**
- Create: `app/(app)/cambio/contactos-actions.ts`
- Test: `app/(app)/cambio/contactos-actions.test.ts`

**Interfaces:**
- Consumes: `createClient` de `@/lib/supabase/server`.
- Produces:
  - `type ResultadoContacto = { ok: true; id: string; nombre: string } | { ok: false; error: string }`
  - `createExchangeClient(nombre: string): Promise<ResultadoContacto>`
  - `createExchangePerson(nombre: string): Promise<ResultadoContacto>`
  - `setContactoActivo(tabla: "cliente" | "persona", id: string, activo: boolean): Promise<{ ok: true } | { ok: false; error: string }>`

- [ ] **Step 1: Escribir el test que falla**

Crear `app/(app)/cambio/contactos-actions.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Cadena de Supabase mockeada. Hay TRES caminos:
//  - companies: select().ilike().limit().single()  → resuelve el company_id
//  - alta:      insert().select().single()          → devuelve el contacto nuevo
//  - baja:      update().eq()                        → activa/desactiva
// singleMock controla el insert; companiesSingle, la resolución de empresa.
const singleMock = vi.fn();
const companiesSingle = vi.fn(async () => ({ data: { id: "empresa-1" }, error: null }));
const insertMock = vi.fn(() => ({ select: () => ({ single: singleMock }) }));
const eqMock = vi.fn(async () => ({ error: null }));
const updateMock = vi.fn(() => ({ eq: eqMock }));
const fromMock = vi.fn((tabla: string) => {
  if (tabla === "companies") {
    return { select: () => ({ ilike: () => ({ limit: () => ({ single: companiesSingle }) }) }) };
  }
  return { insert: insertMock, update: updateMock };
});
const createClientMock = vi.fn(async () => ({ from: fromMock }));

vi.mock("@/lib/supabase/server", () => ({ createClient: () => createClientMock() }));

const revalidatePathMock = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (p: string) => revalidatePathMock(p) }));

import { createExchangeClient, createExchangePerson, setContactoActivo } from "./contactos-actions";

beforeEach(() => {
  vi.clearAllMocks();
  singleMock.mockResolvedValue({ data: { id: "nuevo-1", name: "Juan Perez" }, error: null });
  eqMock.mockResolvedValue({ error: null });
});

describe("createExchangeClient", () => {
  it("da de alta y devuelve el id y el nombre", async () => {
    const r = await createExchangeClient("Juan Perez");
    expect(r).toEqual({ ok: true, id: "nuevo-1", nombre: "Juan Perez" });
    expect(fromMock).toHaveBeenCalledWith("exchange_clients");
  });

  it("recorta el nombre antes de guardar", async () => {
    await createExchangeClient("  Juan Perez  ");
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ name: "Juan Perez" }));
  });

  it("rechaza un nombre vacío sin tocar la base", async () => {
    const r = await createExchangeClient("   ");
    expect(r).toEqual({ ok: false, error: "El nombre no puede estar vacío." });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("avisa cuando el nombre ya existe (choca el índice único)", async () => {
    singleMock.mockResolvedValue({ data: null, error: { code: "23505", message: "duplicate", details: "" } });
    const r = await createExchangeClient("Juan Perez");
    expect(r).toEqual({ ok: false, error: "Ya existe un contacto con ese nombre." });
  });

  it("informa un fallo genérico si el insert falla por otra causa", async () => {
    singleMock.mockResolvedValue({ data: null, error: { code: "XXXXX", message: "boom", details: "" } });
    const r = await createExchangeClient("Juan Perez");
    expect(r).toEqual({ ok: false, error: "No se pudo guardar. Probá de nuevo." });
  });
});

describe("createExchangePerson", () => {
  it("da de alta en la tabla de personas", async () => {
    singleMock.mockResolvedValue({ data: { id: "p1", name: "Ana" }, error: null });
    const r = await createExchangePerson("Ana");
    expect(r).toEqual({ ok: true, id: "p1", nombre: "Ana" });
    expect(fromMock).toHaveBeenCalledWith("exchange_people");
  });
});

describe("setContactoActivo", () => {
  it("desactiva un cliente", async () => {
    const r = await setContactoActivo("cliente", "c1", false);
    expect(r).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith("exchange_clients");
    expect(updateMock).toHaveBeenCalledWith({ active: false });
    expect(eqMock).toHaveBeenCalledWith("id", "c1");
  });

  it("reactiva una persona", async () => {
    const r = await setContactoActivo("persona", "p1", true);
    expect(r).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith("exchange_people");
    expect(updateMock).toHaveBeenCalledWith({ active: true });
  });

  it("informa el fallo si el update falla", async () => {
    eqMock.mockResolvedValue({ error: { message: "rls", details: "" } });
    const r = await setContactoActivo("cliente", "c1", false);
    expect(r).toEqual({ ok: false, error: "No se pudo actualizar. Probá de nuevo." });
  });
});
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `npx vitest run "app/(app)/cambio/contactos-actions.test.ts"`
Expected: FAIL — no existe `./contactos-actions`.

- [ ] **Step 3: Escribir la implementación**

Crear `app/(app)/cambio/contactos-actions.ts`:

```ts
"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ResultadoContacto = { ok: true; id: string; nombre: string } | { ok: false; error: string };
type ResultadoSimple = { ok: true } | { ok: false; error: string };

// company_id de GESTIONES MA, resuelto por nombre. Un contacto siempre
// pertenece a esa empresa (la caja es exclusiva de Gestiones MA).
async function empresaId(sb: Awaited<ReturnType<typeof createClient>>): Promise<string | null> {
  const { data, error } = await sb.from("companies").select("id").ilike("name", "%gestiones%ma%").limit(1).single();
  if (error || !data) {
    console.error("[cambio] no se pudo resolver la empresa:", error?.message ?? "sin datos", error?.details ?? "");
    return null;
  }
  return data.id as string;
}

async function crearContacto(tabla: "exchange_clients" | "exchange_people", nombre: string): Promise<ResultadoContacto> {
  const limpio = nombre.trim();
  if (!limpio) return { ok: false, error: "El nombre no puede estar vacío." };

  try {
    const sb = await createClient();
    const cid = await empresaId(sb);
    if (!cid) return { ok: false, error: "No se encontró la empresa. Avisá al administrador." };

    const { data, error } = await sb.from(tabla).insert({ company_id: cid, name: limpio }).select("id,name").single();
    if (error) {
      // 23505 = violación de índice único: ya existe ese nombre.
      if (error.code === "23505") return { ok: false, error: "Ya existe un contacto con ese nombre." };
      console.error("[cambio] alta de contacto falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo guardar. Probá de nuevo." };
    }
    // El insert commiteó: revalidatePath aislado para no reportar como fallida
    // un alta que sí ocurrió.
    try {
      revalidatePath("/cambio");
    } catch (e) {
      console.error("[cambio] alta ok pero revalidatePath falló:", e instanceof Error ? e.message : String(e));
    }
    return { ok: true, id: data.id as string, nombre: data.name as string };
  } catch (e) {
    console.error("[cambio] alta de contacto falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo guardar. Probá de nuevo." };
  }
}

export async function createExchangeClient(nombre: string): Promise<ResultadoContacto> {
  return crearContacto("exchange_clients", nombre);
}

export async function createExchangePerson(nombre: string): Promise<ResultadoContacto> {
  return crearContacto("exchange_people", nombre);
}

export async function setContactoActivo(
  tabla: "cliente" | "persona",
  id: string,
  activo: boolean,
): Promise<ResultadoSimple> {
  const nombreTabla = tabla === "cliente" ? "exchange_clients" : "exchange_people";
  try {
    const sb = await createClient();
    const { error } = await sb.from(nombreTabla).update({ active: activo }).eq("id", id);
    if (error) {
      console.error("[cambio] baja/alta de contacto falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo actualizar. Probá de nuevo." };
    }
    try {
      revalidatePath("/cambio");
    } catch (e) {
      console.error("[cambio] update ok pero revalidatePath falló:", e instanceof Error ? e.message : String(e));
    }
    return { ok: true };
  } catch (e) {
    console.error("[cambio] baja/alta de contacto falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo actualizar. Probá de nuevo." };
  }
}
```

- [ ] **Step 4: Correr los tests**

Run: `npx vitest run`
Expected: PASS — todo el suite, incluidos los 9 nuevos.

- [ ] **Step 5: Lint y commit**

```bash
npm run lint
git add "app/(app)/cambio/contactos-actions.ts" "app/(app)/cambio/contactos-actions.test.ts"
git commit -m "feat(cambio): alta y baja lógica de clientes y personas

Nombre duplicado (índice único, 23505) da un error claro. Baja lógica con
active=false: no borra, para no romper operaciones históricas.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Componente ComboAlta

**Files:**
- Create: `components/cambio/combo-alta.tsx`

**Interfaces:**
- Consumes: `filtrarOpciones`, `hayCoincidenciaExacta`, `valorASubmit`, `OpcionCombo` de `@/lib/cambio/combo`; `ResultadoContacto` de `@/app/(app)/cambio/contactos-actions`.
- Produces: `ComboAlta` (default export nombrado):
  ```ts
  type ComboAltaProps = {
    name: string;                 // nombre del campo en el FormData
    label: string;
    opciones: OpcionCombo[];
    permitirLibre: boolean;       // emisor/receptor: true; cliente: false
    placeholder?: string;
    onCrear?: (nombre: string) => Promise<ResultadoContacto>;  // "+ nuevo"
  };
  ```

- [ ] **Step 1: Escribir el componente**

Crear `components/cambio/combo-alta.tsx`:

```tsx
"use client";
import { useState } from "react";
import { filtrarOpciones, hayCoincidenciaExacta, valorASubmit, type OpcionCombo } from "@/lib/cambio/combo";
import type { ResultadoContacto } from "@/app/(app)/cambio/contactos-actions";

type ComboAltaProps = {
  name: string;
  label: string;
  opciones: OpcionCombo[];
  permitirLibre: boolean;
  placeholder?: string;
  onCrear?: (nombre: string) => Promise<ResultadoContacto>;
};

const field: React.CSSProperties = {
  width: "100%", background: "var(--card)", border: "1px solid var(--border)",
  borderRadius: 10, padding: "9px 11px", fontSize: 13, color: "var(--text)",
};
const label: React.CSSProperties = { fontSize: 11.5, color: "var(--muted)", display: "block", marginBottom: 5 };

export function ComboAlta({ name, label: etiqueta, opciones, permitirLibre, placeholder, onCrear }: ComboAltaProps) {
  const [lista, setLista] = useState<OpcionCombo[]>(opciones);
  const [texto, setTexto] = useState("");
  const [sel, setSel] = useState<OpcionCombo | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtradas = filtrarOpciones(lista, texto);
  const exacta = hayCoincidenciaExacta(lista, texto);
  const puedeCrear = !!onCrear && texto.trim() !== "" && !exacta;
  const valor = valorASubmit(sel, texto, permitirLibre);

  const elegir = (o: OpcionCombo) => {
    setSel(o);
    setTexto(o.nombre);
    setAbierto(false);
    setError(null);
  };

  const crear = async () => {
    if (!onCrear || creando) return;
    setCreando(true);
    setError(null);
    const r = await onCrear(texto.trim());
    setCreando(false);
    if (r.ok) {
      const nueva = { value: r.id, nombre: r.nombre };
      setLista((prev) => [...prev, nueva].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      elegir(nueva);
    } else {
      setError(r.error);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <label style={label}>{etiqueta}</label>
      {/* El valor real que lee el formulario. */}
      <input type="hidden" name={name} value={valor} readOnly />
      <input
        value={texto}
        placeholder={placeholder}
        onChange={(e) => {
          setTexto(e.target.value);
          setSel(null); // al reescribir, se deselecciona; el valor vuelve a texto/""
          setAbierto(true);
          setError(null);
        }}
        onFocus={() => setAbierto(true)}
        // Se cierra con un pequeño delay para que el click en una opción llegue.
        onBlur={() => setTimeout(() => setAbierto(false), 150)}
        style={field}
        autoComplete="off"
      />
      {abierto && (filtradas.length > 0 || puedeCrear) && (
        <div
          style={{
            position: "absolute", zIndex: 10, top: "100%", left: 0, right: 0, marginTop: 4,
            background: "var(--card)", border: "1px solid var(--border-2)", borderRadius: 10,
            maxHeight: 190, overflowY: "auto", boxShadow: "0 16px 40px -16px #000",
          }}
        >
          {filtradas.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => elegir(o)}
              style={{
                display: "block", width: "100%", textAlign: "left", background: "none", border: "none",
                padding: "9px 11px", fontSize: 13, color: "var(--text)", cursor: "pointer",
              }}
            >
              {o.nombre}
            </button>
          ))}
          {puedeCrear && (
            <button
              type="button"
              onClick={crear}
              disabled={creando}
              style={{
                display: "block", width: "100%", textAlign: "left", background: "none",
                border: "none", borderTop: filtradas.length ? "1px solid var(--border)" : "none",
                padding: "9px 11px", fontSize: 13, color: "var(--accent)", fontWeight: 600, cursor: "pointer",
              }}
            >
              {creando ? "Agregando…" : `+ Nuevo: "${texto.trim()}"`}
            </button>
          )}
        </div>
      )}
      {error && <p style={{ color: "var(--warn)", fontSize: 11.5, margin: "5px 0 0" }}>{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sin errores. (El componente todavía no se usa; solo tiene que tipar.)

- [ ] **Step 3: Lint y commit**

```bash
npm run lint
git add components/cambio/combo-alta.tsx
git commit -m "feat(cambio): componente ComboAlta (buscador + nuevo)

Reutilizable para cliente, emisor y receptor. Envía el valor por un input
oculto: el id para cliente, el nombre para emisor/receptor (que admiten texto
libre). El '+ nuevo' llama al server action y agrega la opción sin recargar.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Usar ComboAlta en el formulario de operación

**Files:**
- Modify: `components/cambio/nueva-operacion-form.tsx`
- Modify: `app/(app)/cambio/page.tsx`

**Interfaces:**
- Consumes: `ComboAlta`; `createExchangeClient`, `createExchangePerson`; `getPersonasParaOperacion`.
- Produces: el formulario con los tres campos como combobox; `NuevaOperacionButton` recibe además `personas`.

- [ ] **Step 1: Actualizar el tipo de props y los tres campos en el formulario**

En `components/cambio/nueva-operacion-form.tsx`:

1. Agregar imports arriba:
```tsx
import { ComboAlta } from "@/components/cambio/combo-alta";
import { createExchangeClient, createExchangePerson } from "@/app/(app)/cambio/contactos-actions";
```

2. Extender `Props`:
```tsx
type Props = {
  clientes: { id: string; nombre: string }[];
  personas: { id: string; nombre: string }[];
  cajas: { id: string; nombre: string; moneda: Moneda }[];
};
```
y la firma: `export function NuevaOperacionButton({ clientes, personas, cajas }: Props) {`

3. Reemplazar el bloque del campo **Cliente** (el `<div><label>Cliente</label><select name="clientId">…</select></div>`) por:
```tsx
                <ComboAlta
                  name="clientId"
                  label="Cliente"
                  permitirLibre={false}
                  placeholder="Buscar o agregar…"
                  opciones={clientes.map((c) => ({ value: c.id, nombre: c.nombre }))}
                  onCrear={createExchangeClient}
                />
```

4. Reemplazar el bloque de **Emisor** y **Receptor** (los dos `<div><label>…</label><input name="sender|receiver" /></div>`) por:
```tsx
                <ComboAlta
                  name="sender"
                  label="Emisor (quien manda los fondos)"
                  permitirLibre
                  placeholder="Buscar, escribir o agregar…"
                  opciones={personas.map((p) => ({ value: p.nombre, nombre: p.nombre }))}
                  onCrear={createExchangePerson}
                />
```
```tsx
                <ComboAlta
                  name="receiver"
                  label="Receptor (quien los recibe)"
                  permitirLibre
                  placeholder="Buscar, escribir o agregar…"
                  opciones={personas.map((p) => ({ value: p.nombre, nombre: p.nombre }))}
                  onCrear={createExchangePerson}
                />
```

**Importante:** para emisor/receptor, `value` de la opción es el **nombre** (no el id), porque `exchange_ops.sender`/`receiver` guardan texto. Así, elegir de la lista o escribir libre produce el mismo tipo de valor.

- [ ] **Step 2: Traer personas y pasarlas en page.tsx**

En `app/(app)/cambio/page.tsx`:

1. Agregar `getPersonasParaOperacion` al import de `@/lib/cambio/datos`.
2. Sumar al `Promise.all`:
```tsx
  const [{ operaciones, saldos, resumen, clientes: rankingDeClientes, personas }, clientes, cajas, personasAlta] =
    await Promise.all([
      getDatosCambio(hoy),
      getClientesParaOperacion(),
      getCajasParaOperacion(),
      getPersonasParaOperacion(),
    ]);
```
(cuidado con el nombre: `personas` ya se usa para el ranking; la lista para el alta va como `personasAlta`.)
3. Pasar la prop:
```tsx
          <NuevaOperacionButton clientes={clientes} personas={personasAlta} cajas={cajas} />
```

- [ ] **Step 3: Verificar tipos, lint, tests y build**

Run: `npx tsc --noEmit && npm run lint && npx vitest run && npm run build`
Expected: sin errores; 244 tests pasando, 5 skipped; build OK.

- [ ] **Step 4: Probar en el navegador**

Con el server levantado (`preview_start`), abrir `/cambio` y "Nueva operación":
1. **Cliente**: escribir un nombre nuevo → aparece `+ Nuevo: "…"` → clic → queda agregado y seleccionado. Cargar la operación y confirmar que el cliente quedó asociado en la tabla y en el ranking.
2. **Emisor**: escribir un nombre que no está y **no** darle "+ nuevo" → igual se guarda como texto al cargar la operación (caso de una sola vez). Verificar que aparece en la tabla.
3. **Emisor** otra vez: ahora el nombre creado en el paso 1 (si fue persona) aparece en el buscador.
4. Confirmar que **no** hay `[cambio]` de error en la consola/logs.

- [ ] **Step 5: Commit**

```bash
git add components/cambio/nueva-operacion-form.tsx "app/(app)/cambio/page.tsx"
git commit -m "feat(cambio): altas inline en el formulario de operación

Cliente, emisor y receptor pasan a combobox con buscador y '+ nuevo'. Emisor
y receptor admiten un nombre suelto (caso de una sola vez) sin obligar a
registrarlo. El cálculo no cambia: se siguen guardando como texto.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: Pantalla de Contactos

**Files:**
- Create: `components/cambio/contactos-modal.tsx`
- Modify: `app/(app)/cambio/page.tsx`

**Interfaces:**
- Consumes: `ContactoAdmin`, `getContactos`; `createExchangeClient`, `createExchangePerson`, `setContactoActivo`.
- Produces: `<ContactosButton clientes={…} personas={…} />` (botón + modal).

- [ ] **Step 1: Escribir el modal**

Crear `components/cambio/contactos-modal.tsx`:

```tsx
"use client";
import { useState } from "react";
import type { ContactoAdmin } from "@/lib/cambio/datos";
import { createExchangeClient, createExchangePerson, setContactoActivo } from "@/app/(app)/cambio/contactos-actions";

type Props = { clientes: ContactoAdmin[]; personas: ContactoAdmin[] };

const field: React.CSSProperties = {
  flex: 1, background: "var(--card)", border: "1px solid var(--border)",
  borderRadius: 9, padding: "8px 10px", fontSize: 13, color: "var(--text)",
};

function Lista({
  titulo,
  items,
  tabla,
  onCrear,
}: {
  titulo: string;
  items: ContactoAdmin[];
  tabla: "cliente" | "persona";
  onCrear: (nombre: string) => ReturnType<typeof createExchangeClient>;
}) {
  const [lista, setLista] = useState<ContactoAdmin[]>(items);
  const [nuevo, setNuevo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const agregar = async () => {
    if (ocupado || nuevo.trim() === "") return;
    setOcupado(true);
    setError(null);
    const r = await onCrear(nuevo.trim());
    setOcupado(false);
    if (r.ok) {
      setLista((prev) => [...prev, { id: r.id, nombre: r.nombre, activo: true }].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setNuevo("");
    } else {
      setError(r.error);
    }
  };

  const toggle = async (c: ContactoAdmin) => {
    const r = await setContactoActivo(tabla, c.id, !c.activo);
    if (r.ok) {
      setLista((prev) => prev.map((x) => (x.id === c.id ? { ...x, activo: !x.activo } : x)));
    }
  };

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 10px" }}>{titulo}</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && agregar()}
          placeholder="Agregar…"
          style={field}
        />
        <button
          type="button"
          onClick={agregar}
          disabled={ocupado}
          style={{ background: "var(--grad)", color: "#fff", border: 0, borderRadius: 9, padding: "0 14px", fontSize: 13, fontWeight: 650, cursor: "pointer" }}
        >
          +
        </button>
      </div>
      {error && <p style={{ color: "var(--warn)", fontSize: 11.5, margin: "0 0 8px" }}>{error}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 260, overflowY: "auto" }}>
        {lista.length === 0 && <p style={{ fontSize: 12.5, color: "var(--muted)", margin: 0 }}>Todavía no hay.</p>}
        {lista.map((c) => (
          <div
            key={c.id}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "7px 4px",
              borderBottom: "1px solid var(--border)", opacity: c.activo ? 1 : 0.45,
            }}
          >
            <span style={{ fontSize: 13, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {c.nombre}
            </span>
            <button
              type="button"
              onClick={() => toggle(c)}
              style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "3px 9px", fontSize: 11.5, color: "var(--muted)", cursor: "pointer" }}
            >
              {c.activo ? "Desactivar" : "Reactivar"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContactosButton({ clientes, personas }: Props) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)", cursor: "pointer" }}
      >
        Contactos
      </button>
      {abierto && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", zIndex: 50, padding: 20 }}
          onClick={() => setAbierto(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, width: "min(680px,100%)", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ fontSize: 17, fontWeight: 740, margin: 0 }}>Contactos</h2>
              <button
                onClick={() => setAbierto(false)}
                style={{ marginLeft: "auto", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "6px 12px", fontSize: 13, color: "var(--text)", cursor: "pointer" }}
              >
                Cerrar
              </button>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 18px" }}>
              Desactivar saca el contacto del buscador pero no borra las operaciones que ya lo usan.
            </p>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <Lista titulo="Clientes" items={clientes} tabla="cliente" onCrear={createExchangeClient} />
              <Lista titulo="Emisores / receptores" items={personas} tabla="persona" onCrear={createExchangePerson} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Enchufar el botón en page.tsx**

En `app/(app)/cambio/page.tsx`:

1. Imports: agregar `getContactos` al import de `@/lib/cambio/datos` y `import { ContactosButton } from "@/components/cambio/contactos-modal";`.
2. Sumar `getContactos()` al `Promise.all` y desestructurar:
```tsx
  const [{ operaciones, saldos, resumen, clientes: rankingDeClientes, personas }, clientes, cajas, personasAlta, contactos] =
    await Promise.all([
      getDatosCambio(hoy),
      getClientesParaOperacion(),
      getCajasParaOperacion(),
      getPersonasParaOperacion(),
      getContactos(),
    ]);
```
3. En el header, antes del botón "Descargar Excel", agregar (dentro del mismo flex `marginLeft: auto`):
```tsx
          <ContactosButton clientes={contactos.clientes} personas={contactos.personas} />
```

- [ ] **Step 3: Verificar tipos, lint, tests y build**

Run: `npx tsc --noEmit && npm run lint && npx vitest run && npm run build`
Expected: sin errores; 244 tests pasando, 5 skipped; build OK.

- [ ] **Step 4: Probar en el navegador**

Con el server levantado, en `/cambio`:
1. Clic en **Contactos** → abre el modal con las dos listas.
2. Agregar un cliente y una persona desde ahí → aparecen en la lista.
3. **Desactivar** uno → se atenúa; abrir "Nueva operación" y confirmar que **no** aparece en el buscador de ese campo.
4. **Reactivar** → vuelve a aparecer en el buscador.
5. Confirmar que no hay `[cambio]` de error.

- [ ] **Step 5: Commit**

```bash
git add components/cambio/contactos-modal.tsx "app/(app)/cambio/page.tsx"
git commit -m "feat(cambio): pantalla de Contactos

Agregar y desactivar clientes y personas. La baja lógica los saca del
buscador sin borrar las operaciones históricas.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Verificación final

- [ ] `npx vitest run` — todo verde (244 previos + 19 nuevos: 10 de `combo`, 9 de `contactos-actions`).
- [ ] `npm run lint` y `npx tsc --noEmit` — sin errores.
- [ ] `npm run build` — compila.
- [ ] En el navegador: alta de cliente inline, emisor de una sola vez (texto libre), persona reutilizable, y desactivar/reactivar desde Contactos. Ningún `[cambio]` de error.
- [ ] Confirmar que los rankings y el Excel siguen mostrando los emisores/receptores por nombre (no cambió el cálculo).

## Pendiente para después

- **Editar el nombre** de un contacto ya creado (hoy se desactiva y se crea de nuevo).
- **Runners** (subsistema aparte): logística de transporte/retiro con pago fijo por período.
