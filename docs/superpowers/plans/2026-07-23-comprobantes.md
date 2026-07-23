# Comprobante opcional por operación — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Poder adjuntar un comprobante opcional (foto/PDF, hasta 10 MB) a cada operación de la caja — al cargarla o después — guardado en Supabase Storage privado, con enlace temporal firmado para verlo.

**Architecture:** Los archivos van a un bucket privado de Supabase Storage; se suben desde el cliente con la sesión del usuario (RLS authenticated). La operación guarda solo la **ruta** del archivo (`comprobante_path`). El cálculo (stock, margen, cajas) no cambia: el comprobante es metadata que se arrastra con la operación. La validación de archivo (tipo/tamaño) se extrae a una función pura testeada.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Supabase (PostgREST + Storage + RLS), Vitest.

## Global Constraints

- **Spec:** `docs/superpowers/specs/2026-07-23-comprobantes-design.md`. Ante dudas de dominio, manda el spec.
- **Rama:** crear `feat/comprobantes` desde `master` antes de la Task 1.
- **Nombres:** columnas de la base en `snake_case` inglés (`comprobante_path`); tipos y funciones de dominio en **español** (`comprobantePath`).
- **Nada de `null`** salvo que signifique algo: `comprobante_path text not null default ''` (`''` = sin comprobante).
- **RLS obligatorio** en `storage.objects` para el bucket `comprobantes`, solo `authenticated`. Bucket **privado** (`public = false`).
- **Formatos:** `image/jpeg`, `image/png`, `image/webp`, `application/pdf`. Tope **10 MB** (`10 * 1024 * 1024`).
- **Subida y URL firmada** por `createClient()` de `@/lib/supabase/client` (navegador). Lectura de datos por `@/lib/supabase/server`.
- **Siempre loguear el `error` de Supabase** con prefijo `[cambio]`.
- **Server actions:** resultado discriminado `{ ok } | { ok, error }`, `revalidatePath("/cambio")` en su propio try/catch, gateados por acceso a la caja (NO requieren `tieneAccesoCompleto`).
- **Tests:** solo lógica pura (`lib/cambio/*.ts`) y server actions. Nada de componentes React ni de la subida real a Storage (I/O). Los tests existentes tienen que seguir pasando.
- **Verificación por tarea:** `npx tsc --noEmit`, `npm run lint`, `npx vitest run` en verde antes de cada commit.
- **El cálculo no cambia:** `calculo.ts` y `reportes.ts` no se tocan.

## File Structure

| Archivo | Responsabilidad |
|---|---|
| `lib/db/sql/2026-07-23-comprobantes.sql` | Columna `comprobante_path` + bucket `comprobantes` + políticas RLS. A mano en Supabase. |
| `lib/cambio/comprobantes.ts` | `validarComprobante` (pura), `subirComprobante` y `urlComprobante` (usan el client de Supabase). |
| `lib/cambio/comprobantes.test.ts` | Tests de `validarComprobante`. |
| `lib/cambio/tipos.ts` | **Modificar:** `Operacion` gana `comprobantePath: string`. |
| `lib/cambio/datos.ts` | **Modificar:** `OpRow`, `COLUMNAS_OPS`, `aOperacion` arrastran `comprobante_path`. |
| `lib/cambio/calculo.test.ts` · `lib/cambio/reportes.test.ts` | **Modificar:** el builder `op()` de cada uno suma `comprobantePath: ""` a sus defaults. |
| `app/(app)/cambio/actions.ts` | **Modificar:** `createExchangeOp` guarda `comprobante_path`; nuevo `setComprobante`. |
| `app/(app)/cambio/actions.test.ts` | **Modificar:** cubrir `comprobantePath` en el alta y `setComprobante`. |
| `components/cambio/comprobante-input.tsx` | Componente cliente: elegir archivo, subir, "ver". |
| `components/cambio/nueva-operacion-form.tsx` | **Modificar:** sumar `ComprobanteInput` (campo opcional). |
| `components/cambio/tabla-operaciones.tsx` | **Modificar:** celda "Ver" / "Adjuntar". |
| `lib/cambio/excel.ts` | **Modificar:** columna "Comprobante" (Sí/""). |

---

### Task 1: Columna + bucket + RLS en Supabase

**Files:**
- Create: `lib/db/sql/2026-07-23-comprobantes.sql`

**Interfaces:**
- Consumes: tabla `exchange_ops` existente.
- Produces: columna `exchange_ops.comprobante_path`, bucket `comprobantes`, políticas RLS.

- [ ] **Step 1: Crear la rama**

Run: `git checkout -b feat/comprobantes`
Expected: `Switched to a new branch 'feat/comprobantes'`

- [ ] **Step 2: Escribir el SQL**

Crear `lib/db/sql/2026-07-23-comprobantes.sql`:

```sql
-- Comprobante opcional por operación — columna + Storage + RLS
-- Correr en el editor SQL de Supabase (proyecto zjetaihjddoxxvrpzwsb),
-- con el editor VACÍO antes de pegar. Es idempotente.

-- 1. Columna en la operación: ruta del archivo en Storage. '' = sin comprobante.
alter table exchange_ops add column if not exists comprobante_path text not null default '';

-- 2. Bucket privado para los comprobantes (no público: solo authenticated lee).
insert into storage.buckets (id, name, public)
values ('comprobantes', 'comprobantes', false)
on conflict (id) do nothing;

-- 3. Políticas RLS sobre storage.objects, acotadas al bucket comprobantes.
--    authenticated puede subir, leer y reemplazar; nadie anónimo.
drop policy if exists "comprobantes_insert" on storage.objects;
create policy "comprobantes_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'comprobantes');

drop policy if exists "comprobantes_select" on storage.objects;
create policy "comprobantes_select" on storage.objects
  for select to authenticated using (bucket_id = 'comprobantes');

drop policy if exists "comprobantes_update" on storage.objects;
create policy "comprobantes_update" on storage.objects
  for update to authenticated using (bucket_id = 'comprobantes');

-- 4. Verificación — correr y mirar el resultado.
-- La columna existe:
select column_name from information_schema.columns
where table_name = 'exchange_ops' and column_name = 'comprobante_path';
-- El bucket existe y es privado (public = false):
select id, public from storage.buckets where id = 'comprobantes';
```

- [ ] **Step 3: Correrlo en Supabase**

Este paso lo hace **el usuario**. Pegarle el contenido completo del archivo **en el chat** (no la ruta), pedirle que lo corra en el editor SQL con el editor vacío, y confirmar:
1. Una fila `comprobante_path` (la columna existe).
2. Una fila `comprobantes | false` (bucket privado creado).

- [ ] **Step 4: Commit**

```bash
git add lib/db/sql/2026-07-23-comprobantes.sql
git commit -m "feat(cambio): columna comprobante_path + bucket privado de Storage

El comprobante es opcional (default ''). El bucket es privado: solo un
usuario autenticado en la caja puede leer los archivos.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Validación pura del comprobante

**Files:**
- Create: `lib/cambio/comprobantes.ts`
- Test: `lib/cambio/comprobantes.test.ts`

**Interfaces:**
- Consumes: `createClient` de `@/lib/supabase/client` (para las funciones de I/O).
- Produces:
  - `const TIPOS_COMPROBANTE: string[]`, `const MAX_COMPROBANTE: number`
  - `validarComprobante(file: { type: string; size: number }): { ok: true } | { ok: false; error: string }`
  - `subirComprobante(file: File): Promise<{ ok: true; path: string } | { ok: false; error: string }>`
  - `urlComprobante(path: string): Promise<string | null>`

- [ ] **Step 1: Escribir el test que falla**

Crear `lib/cambio/comprobantes.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { validarComprobante, MAX_COMPROBANTE } from "./comprobantes";

describe("validarComprobante", () => {
  it("acepta una imagen JPG dentro del límite", () => {
    expect(validarComprobante({ type: "image/jpeg", size: 500_000 })).toEqual({ ok: true });
  });

  it("acepta PNG, WEBP y PDF", () => {
    for (const type of ["image/png", "image/webp", "application/pdf"]) {
      expect(validarComprobante({ type, size: 1000 }).ok, type).toBe(true);
    }
  });

  it("rechaza un tipo no permitido (ej: video)", () => {
    expect(validarComprobante({ type: "video/mp4", size: 1000 })).toEqual({
      ok: false,
      error: "Solo se aceptan imágenes (JPG, PNG, WEBP) o PDF.",
    });
  });

  it("rechaza un archivo más grande que el tope", () => {
    expect(validarComprobante({ type: "image/jpeg", size: MAX_COMPROBANTE + 1 })).toEqual({
      ok: false,
      error: "El archivo supera los 10 MB.",
    });
  });

  it("acepta exactamente el tamaño máximo", () => {
    expect(validarComprobante({ type: "application/pdf", size: MAX_COMPROBANTE })).toEqual({ ok: true });
  });
});
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `npx vitest run lib/cambio/comprobantes.test.ts`
Expected: FAIL — `Failed to resolve import "./comprobantes"`.

- [ ] **Step 3: Escribir la implementación**

Crear `lib/cambio/comprobantes.ts`:

```ts
import { createClient } from "@/lib/supabase/client";

export const TIPOS_COMPROBANTE = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
export const MAX_COMPROBANTE = 10 * 1024 * 1024; // 10 MB

/** Valida tipo y tamaño de un archivo antes de subirlo. Pura y testeable. */
export function validarComprobante(file: { type: string; size: number }): { ok: true } | { ok: false; error: string } {
  if (!TIPOS_COMPROBANTE.includes(file.type)) {
    return { ok: false, error: "Solo se aceptan imágenes (JPG, PNG, WEBP) o PDF." };
  }
  if (file.size > MAX_COMPROBANTE) {
    return { ok: false, error: "El archivo supera los 10 MB." };
  }
  return { ok: true };
}

/**
 * Sube un comprobante al bucket privado y devuelve su ruta. El nombre es un
 * uuid, sin datos sensibles. La subida corre como el usuario autenticado
 * (RLS), consistente con que la caja es privada.
 */
export async function subirComprobante(file: File): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const v = validarComprobante(file);
  if (!v.ok) return v;
  const ext = (file.name.split(".").pop() ?? "dat").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;
  const sb = createClient();
  const { error } = await sb.storage.from("comprobantes").upload(path, file, { upsert: false });
  if (error) {
    console.error("[cambio] subida de comprobante falló:", error.message);
    return { ok: false, error: "No se pudo subir el comprobante. Probá de nuevo." };
  }
  return { ok: true, path };
}

/** URL firmada temporal (1 hora) para ver un comprobante del bucket privado. */
export async function urlComprobante(path: string): Promise<string | null> {
  if (!path) return null;
  const sb = createClient();
  const { data, error } = await sb.storage.from("comprobantes").createSignedUrl(path, 3600);
  if (error) {
    console.error("[cambio] URL firmada de comprobante falló:", error.message);
    return null;
  }
  return data.signedUrl;
}
```

- [ ] **Step 4: Correr los tests**

Run: `npx vitest run lib/cambio/comprobantes.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Lint y commit**

```bash
npm run lint
git add lib/cambio/comprobantes.ts lib/cambio/comprobantes.test.ts
git commit -m "feat(cambio): validación y subida de comprobantes a Storage

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Arrastrar comprobantePath por los tipos y la lectura

**Files:**
- Modify: `lib/cambio/tipos.ts`
- Modify: `lib/cambio/datos.ts`
- Modify: `lib/cambio/calculo.test.ts`
- Modify: `lib/cambio/reportes.test.ts`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: `Operacion` (y por extensión `OperacionCalculada`) con `comprobantePath: string`.

- [ ] **Step 1: Agregar el campo al tipo**

En `lib/cambio/tipos.ts`, dentro de `type Operacion`, después de `notas: string;`:

```ts
  /** Ruta del comprobante en Storage. '' = sin comprobante. */
  comprobantePath: string;
```

- [ ] **Step 2: Arrastrarlo en la lectura**

En `lib/cambio/datos.ts`:

1. En `type OpRow`, agregar (después de `notes: string;`):
```ts
  comprobante_path: string;
```
2. En la constante `COLUMNAS_OPS`, agregar `,comprobante_path` antes de `,exchange_clients(name)`:
```ts
const COLUMNAS_OPS =
  "id,op_date,created_at,kind,client_id,sender,receiver,amount,amount_currency,rate,ars_account_id,usd_account_id,fees,notes,comprobante_path,exchange_clients(name)";
```
3. En `aOperacion`, agregar al objeto devuelto (después de `notas: r.notes,`):
```ts
    comprobantePath: r.comprobante_path,
```

- [ ] **Step 3: Actualizar los builders de test que construyen Operacion**

En `lib/cambio/calculo.test.ts`, en el helper `op(...)`, agregar `comprobantePath: ""` a los defaults (junto a `notas: ""`):
```ts
    notas: "",
    comprobantePath: "",
```

En `lib/cambio/reportes.test.ts`, en su helper `op(...)`, el mismo agregado:
```ts
    notas: "",
    comprobantePath: "",
```

- [ ] **Step 4: Verificar tipos y que todos los tests pasan**

Run: `npx tsc --noEmit && npx vitest run`
Expected: sin errores de tipo; todo el suite en verde (los builders ahora satisfacen el tipo `Operacion` con el campo nuevo).

- [ ] **Step 5: Lint y commit**

```bash
npm run lint
git add lib/cambio/tipos.ts lib/cambio/datos.ts lib/cambio/calculo.test.ts lib/cambio/reportes.test.ts
git commit -m "feat(cambio): arrastrar comprobantePath por tipos y lectura

El cálculo no lo usa; solo se arrastra con la operación.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Server actions — alta con comprobante y setComprobante

**Files:**
- Modify: `app/(app)/cambio/actions.ts`
- Modify: `app/(app)/cambio/actions.test.ts`

**Interfaces:**
- Consumes: `createClient` de `@/lib/supabase/server`.
- Produces:
  - `createExchangeOp` (existente) ahora persiste `comprobante_path` desde `comprobantePath` del FormData.
  - `setComprobante(opId: string, path: string): Promise<{ ok: true } | { ok: false; error: string }>`

- [ ] **Step 1: Escribir el test que falla**

**Leé `app/(app)/cambio/actions.test.ts` completo primero.** Tiene un `fromMock` que ramifica por nombre de tabla: para `"companies"` devuelve la cadena `select().ilike().limit().single()`, y para el resto devuelve `{ insert: insertMock }`. `setComprobante` hace `sb.from("exchange_ops").update({...}).eq("id", opId)`, así que el mock necesita también `update`.

Hacé estos cambios en ese archivo:

1. En el import de `./actions`, sumar `setComprobante`:
```ts
import { createExchangeOp, setComprobante } from "./actions";
```

2. Con las otras declaraciones de mock (arriba, junto a `insertMock`), agregar el mock de update:
```ts
const updateEq = vi.fn();
const updateFn = vi.fn(() => ({ eq: updateEq }));
```

3. En el `fromMock`, en la rama que NO es `"companies"`, agregar `update: updateFn` al objeto devuelto:
```ts
  return { insert: insertMock, update: updateFn };
```

4. En el `beforeEach` existente (el que resetea los mocks), agregar el default de `updateEq`:
```ts
  updateEq.mockResolvedValue({ error: null });
```

5. En el helper `fd(...)`, agregar `comprobantePath: ""` a la base de campos:
```ts
    notes: "",
    comprobantePath: "",
```

6. Agregar al final del archivo estos dos bloques de tests:
```ts
describe("comprobante en el alta", () => {
  it("guarda comprobante_path cuando viene en el FormData", async () => {
    await createExchangeOp(fd({ comprobantePath: "abc-123.jpg" }));
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ comprobante_path: "abc-123.jpg" }));
  });

  it("guarda comprobante_path vacío cuando no se adjuntó nada", async () => {
    await createExchangeOp(fd());
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ comprobante_path: "" }));
  });
});

describe("setComprobante", () => {
  it("actualiza el comprobante de una operación", async () => {
    const r = await setComprobante("op-1", "nuevo.pdf");
    expect(r).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith("exchange_ops");
    expect(updateFn).toHaveBeenCalledWith({ comprobante_path: "nuevo.pdf" });
    expect(updateEq).toHaveBeenCalledWith("id", "op-1");
  });

  it("rechaza un id vacío sin tocar la base", async () => {
    const r = await setComprobante("", "x.pdf");
    expect(r).toEqual({ ok: false, error: "Falta la operación." });
    expect(updateFn).not.toHaveBeenCalled();
  });

  it("informa el fallo si el update falla", async () => {
    updateEq.mockResolvedValueOnce({ error: { message: "rls", details: "" } });
    const r = await setComprobante("op-1", "x.pdf");
    expect(r).toEqual({ ok: false, error: "No se pudo guardar el comprobante. Probá de nuevo." });
  });
});
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `npx vitest run "app/(app)/cambio/actions.test.ts"`
Expected: FAIL — `setComprobante` no existe / `comprobante_path` no está en el insert.

- [ ] **Step 3: Escribir la implementación**

En `app/(app)/cambio/actions.ts`:

1. En el `.insert({...})` de `createExchangeOp`, agregar (después de `notes: ...`):
```ts
      comprobante_path: String(formData.get("comprobantePath") ?? "").trim(),
```

2. Al final del archivo, agregar:
```ts
export async function setComprobante(opId: string, path: string): Promise<ResultadoAlta> {
  if (!opId) return { ok: false, error: "Falta la operación." };
  try {
    const sb = await createClient();
    const { error } = await sb.from("exchange_ops").update({ comprobante_path: path }).eq("id", opId);
    if (error) {
      console.error("[cambio] set comprobante falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo guardar el comprobante. Probá de nuevo." };
    }
  } catch (e) {
    console.error("[cambio] set comprobante falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo guardar el comprobante. Probá de nuevo." };
  }
  try {
    revalidatePath("/cambio");
  } catch (e) {
    console.error("[cambio] set comprobante ok pero revalidatePath falló:", e instanceof Error ? e.message : String(e));
  }
  return { ok: true };
}
```
(`ResultadoAlta` ya está definido y exportado en ese archivo.)

- [ ] **Step 4: Correr los tests**

Run: `npx vitest run`
Expected: PASS — todo el suite, incluidos los ~5 nuevos.

- [ ] **Step 5: Lint y commit**

```bash
npm run lint
git add "app/(app)/cambio/actions.ts" "app/(app)/cambio/actions.test.ts"
git commit -m "feat(cambio): guardar comprobante en el alta y adjuntarlo después

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Componente ComprobanteInput

**Files:**
- Create: `components/cambio/comprobante-input.tsx`

**Interfaces:**
- Consumes: `subirComprobante`, `urlComprobante` de `@/lib/cambio/comprobantes`.
- Produces: `ComprobanteInput` con props:
  ```ts
  type Props = {
    value: string;                       // path actual ('' = sin comprobante)
    onChange: (path: string) => void;    // avisa el nuevo path tras subir
    compacto?: boolean;                  // true = versión chica para la fila
  };
  ```

- [ ] **Step 1: Escribir el componente**

Crear `components/cambio/comprobante-input.tsx`:

```tsx
"use client";
import { useState } from "react";
import { subirComprobante, urlComprobante } from "@/lib/cambio/comprobantes";

type Props = {
  value: string;
  onChange: (path: string) => void;
  compacto?: boolean;
};

const label: React.CSSProperties = { fontSize: 11.5, color: "var(--muted)", display: "block", marginBottom: 5 };

export function ComprobanteInput({ value, onChange, compacto }: Props) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const elegir = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite re-elegir el mismo archivo
    if (!file) return;
    setSubiendo(true);
    setError(null);
    const r = await subirComprobante(file);
    setSubiendo(false);
    if (r.ok) onChange(r.path);
    else setError(r.error);
  };

  const ver = async () => {
    const url = await urlComprobante(value);
    if (url) window.open(url, "_blank", "noopener");
  };

  const btn: React.CSSProperties = {
    background: "var(--card)", border: "1px solid var(--border)", borderRadius: 9,
    padding: compacto ? "5px 10px" : "9px 12px", fontSize: 12.5, color: "var(--text)", cursor: "pointer",
    display: "inline-flex", alignItems: "center", gap: 6,
  };

  return (
    <div>
      {!compacto && <label style={label}>Comprobante (opcional)</label>}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <label style={{ ...btn, opacity: subiendo ? 0.6 : 1 }}>
          {subiendo ? "Subiendo…" : value ? "Cambiar" : compacto ? "Adjuntar" : "Elegir archivo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={elegir}
            disabled={subiendo}
            style={{ display: "none" }}
          />
        </label>
        {value && (
          <button type="button" onClick={ver} style={{ ...btn, color: "var(--accent)", fontWeight: 600 }}>
            Ver
          </button>
        )}
      </div>
      {error && <p style={{ color: "var(--warn)", fontSize: 11.5, margin: "5px 0 0" }}>{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Lint y commit**

```bash
npm run lint
git add components/cambio/comprobante-input.tsx
git commit -m "feat(cambio): componente para adjuntar y ver comprobante

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Comprobante en el formulario de operación

**Files:**
- Modify: `components/cambio/nueva-operacion-form.tsx`

**Interfaces:**
- Consumes: `ComprobanteInput`.
- Produces: el formulario con un campo opcional de comprobante cuyo path viaja como `comprobantePath`.

- [ ] **Step 1: Agregar el estado y el campo**

En `components/cambio/nueva-operacion-form.tsx`:

1. Import arriba:
```tsx
import { ComprobanteInput } from "@/components/cambio/comprobante-input";
```
2. Junto a los otros `useState` del componente, agregar:
```tsx
  const [comprobante, setComprobante] = useState("");
```
3. En `cerrar()`, sumar el reset (junto a `setMonto("")` etc.):
```tsx
    setComprobante("");
```
4. Dentro del `<form action={async (formData) => {...}}>`, después de `formData.set("amountCurrency", moneda);`, agregar:
```tsx
                formData.set("comprobantePath", comprobante);
```
5. En el cuerpo del formulario, justo **antes** del campo "Notas", agregar el bloque:
```tsx
              <ComprobanteInput value={comprobante} onChange={setComprobante} />
```

- [ ] **Step 2: Verificar tipos, lint, tests y build**

Run: `npx tsc --noEmit && npm run lint && npx vitest run && npm run build`
Expected: sin errores; suite en verde; build OK.

- [ ] **Step 3: Probar en el navegador**

Con el server levantado (`preview_start`) y logueado, abrir `/cambio` → "Nueva operación":
1. Elegir una imagen chica en "Comprobante" → aparece "Cambiar" + "Ver".
2. "Ver" abre la imagen en una pestaña nueva (URL firmada).
3. Guardar la operación → en la tabla, esa fila muestra "Ver" (Task 7).
4. Cargar otra operación **sin** comprobante → se guarda igual, sin problema.

- [ ] **Step 4: Commit**

```bash
git add components/cambio/nueva-operacion-form.tsx
git commit -m "feat(cambio): adjuntar comprobante al cargar una operación

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: Ver / Adjuntar en la tabla de operaciones

**Files:**
- Modify: `components/cambio/tabla-operaciones.tsx`

**Interfaces:**
- Consumes: `ComprobanteInput`, `setComprobante` (server action).
- Produces: una celda "Comprobante" en la tabla con "Ver" o "Adjuntar".

- [ ] **Step 1: Convertir la tabla para soportar el adjuntar-después**

`components/cambio/tabla-operaciones.tsx` hoy es un componente de presentación. Necesita el `ComprobanteInput` (cliente) por fila. Agregar `"use client"` al tope si no lo tiene, y:

1. Imports:
```tsx
import { ComprobanteInput } from "@/components/cambio/comprobante-input";
import { setComprobante } from "@/app/(app)/cambio/actions";
```
2. En el `<thead>`, agregar una celda de encabezado al final de la fila:
```tsx
            <th style={th}>Comprobante</th>
```
3. En el `<tbody>`, en cada fila (`orden.map((o) => ...)`), agregar como última celda:
```tsx
              <td style={{ ...td, textAlign: "center" }}>
                <ComprobanteInput
                  value={o.comprobantePath}
                  compacto
                  onChange={(path) => setComprobante(o.id, path)}
                />
              </td>
```

**Nota:** `setComprobante` es un server action; llamarlo desde el `onChange` (cliente) está bien — persiste el path y revalida la página. `ComprobanteInput` ya subió el archivo a Storage antes de llamar `onChange`.

- [ ] **Step 2: Verificar tipos, lint, tests y build**

Run: `npx tsc --noEmit && npm run lint && npx vitest run && npm run build`
Expected: sin errores; suite en verde; build OK.

- [ ] **Step 3: Probar en el navegador**

En `/cambio`, con el server levantado:
1. Una operación **sin** comprobante muestra "Adjuntar" en su fila.
2. Adjuntar una foto → se sube, y la fila pasa a mostrar "Ver" tras revalidar.
3. "Ver" abre el comprobante.
4. No hay `[cambio]` de error en consola.

- [ ] **Step 4: Commit**

```bash
git add components/cambio/tabla-operaciones.tsx
git commit -m "feat(cambio): ver y adjuntar comprobante desde la tabla

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: Columna Comprobante en el Excel

**Files:**
- Modify: `lib/cambio/excel.ts`

**Interfaces:**
- Consumes: `OperacionCalculada.comprobantePath`.
- Produces: columna "Comprobante" (Sí / "") en la hoja Operaciones del export.

- [ ] **Step 1: Agregar la columna**

En `lib/cambio/excel.ts`, en la definición de columnas de la hoja **Operaciones** (`ops.columns = [...]`), agregar antes de la columna "Notas":
```ts
    { header: "Comprobante", key: "comprobante", width: 12 },
```
Y en el `ops.addRow({...})` de cada operación, agregar el valor:
```ts
      comprobante: o.comprobantePath ? "Sí" : "",
```

**Nota:** se exporta "Sí"/"" y no la URL, porque la URL firmada es temporal y no sirve en un archivo guardado.

- [ ] **Step 2: Verificar tipos, lint, tests y build**

Run: `npx tsc --noEmit && npm run lint && npx vitest run && npm run build`
Expected: sin errores; suite en verde; build OK.

- [ ] **Step 3: Commit**

```bash
git add lib/cambio/excel.ts
git commit -m "feat(cambio): columna Comprobante (Sí/No) en el Excel

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Verificación final

- [ ] `npx vitest run` — todo verde (incluidos los ~10 nuevos: 5 de `comprobantes`, 5 de `actions`).
- [ ] `npm run lint` y `npx tsc --noEmit` — sin errores.
- [ ] `npm run build` — compila.
- [ ] En el navegador: adjuntar al crear, adjuntar después desde la fila, "Ver" abre la URL firmada, y una operación sin comprobante se guarda igual.
- [ ] Confirmar que el cálculo (stock/margen/cajas) y los rankings siguen dando igual — el comprobante no entra en ninguna cuenta.
- [ ] El Excel muestra la columna Comprobante con Sí/No.

## Pendiente para después

- **Borrar** un comprobante (hoy solo se reemplaza).
- **Varios comprobantes** por operación.
- **Miniatura** en la tabla en vez del enlace "Ver".
- **Limpieza de archivos huérfanos** (subidos sin guardar la operación).
