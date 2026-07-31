# Accesos por rol en el módulo Cambio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pasar el módulo Cambio de un usuario compartido a usuarios con rol (admin Capi/Marce, runners Zurdo/Ale), donde el runner entra a un panel propio `/panel` y solo accede a sus celulares y cuentas, con aislamiento estricto por RLS.

**Architecture:** Tabla `perfiles_cambio (user_id, rol, runner_id)` como fuente de verdad en la base + funciones `es_admin_cambio()` / `mi_runner_id()` que las políticas RLS consultan. En el código, un nuevo tier de ruteo `runner` (allowlist explícita en `auth-config.ts`) manda al runner a `/panel`. El panel reutiliza los datos y actions de celulares/cuentas operativas que ya existen — la RLS hace el filtrado por runner, así que la capa de datos casi no cambia.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Supabase (Auth + Postgres + RLS), Vitest.

## Global Constraints

- SQL idempotente en `web/lib/db/sql/2026-07-30-accesos-runner.sql`, corrido a mano por el usuario. Empresa: `where c.name ilike '%gestiones%ma%'`. Proyecto `zjetaihjddoxxvrpzwsb`.
- Los usuarios de auth (marce@/zurdo@/ale@ `@gestionesma.store`) los crea el usuario en Supabase (con Auto Confirm). El seed de `perfiles_cambio` los referencia por email en `auth.users` → corre DESPUÉS de crearlos.
- Desplegar el código schema-dependiente DESPUÉS de correr el SQL (si lee tablas/columnas que no existen, se rompe).
- Server actions: `type ResultadoAlta = { ok: true } | { ok: false; error: string }`; `revalidatePath` en try/catch aislado; log `[cambio]`; validar antes de `createClient()`.
- Estilos inline + CSS vars, acento dorado `#D9A84E`, mobile-first (`.ops-cards`/`.ops-tabla`, `.campo-fila`, `.cambio-modal`). NO pasar funciones de server a client components.
- Fallar cerrado: si falta el perfil o el `runner_id`, el runner NO ve datos sensibles (panel vacío con aviso).

---

### Task 1: Esquema SQL (tabla, funciones, políticas, seed)

**Files:**
- Create: `web/lib/db/sql/2026-07-30-accesos-runner.sql`

Este task no tiene test automatizado (es DDL que corre el usuario). El "test" es la verificación al final del script.

- [ ] **Step 1: Escribir el SQL**

```sql
-- Accesos por rol — módulo Cambio. Correr en Supabase (zjetaihjddoxxvrpzwsb),
-- editor VACÍO antes de pegar. Idempotente.
-- PRE-REQUISITO: crear antes en Auth → Users (con Auto Confirm) los usuarios
--   marce@gestionesma.store, zurdo@gestionesma.store, ale@gestionesma.store.

-- 1. Perfil de cada usuario de la caja: su rol y, si es runner, a qué runner mapea.
create table if not exists perfiles_cambio (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  rol        text not null check (rol in ('admin','runner')),
  runner_id  uuid references runners(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 2. Funciones para las políticas. SECURITY DEFINER + search_path fijo: leen
--    perfiles_cambio saltando su propia RLS, sin depender del search_path del
--    llamador. STABLE: no escriben.
create or replace function es_admin_cambio() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from perfiles_cambio p
    where p.user_id = auth.uid() and p.rol = 'admin'
  );
$$;

create or replace function mi_runner_id() returns uuid
  language sql stable security definer set search_path = public as $$
  select runner_id from perfiles_cambio
  where user_id = auth.uid() and rol = 'runner';
$$;

-- 3. Políticas runner-scoped: el runner ve/edita SOLO lo suyo; el admin, todo.
alter table phones         enable row level security;
alter table phone_accounts enable row level security;

drop policy if exists "auth_all_phones" on phones;
drop policy if exists "cambio_phones" on phones;
create policy "cambio_phones" on phones for all to authenticated
  using (es_admin_cambio() or runner_id = mi_runner_id())
  with check (es_admin_cambio() or runner_id = mi_runner_id());

drop policy if exists "auth_all_phone_accounts" on phone_accounts;
drop policy if exists "cambio_phone_accounts" on phone_accounts;
create policy "cambio_phone_accounts" on phone_accounts for all to authenticated
  using (
    es_admin_cambio()
    or phone_id in (select id from phones where runner_id = mi_runner_id())
  )
  with check (
    es_admin_cambio()
    or phone_id in (select id from phones where runner_id = mi_runner_id())
  );

-- 4. runners y perfiles_cambio: el runner lee solo su propia fila.
drop policy if exists "auth_all_runners" on runners;
drop policy if exists "cambio_runners" on runners;
create policy "cambio_runners" on runners for all to authenticated
  using (es_admin_cambio() or id = mi_runner_id())
  with check (es_admin_cambio());

alter table perfiles_cambio enable row level security;
drop policy if exists "cambio_perfiles" on perfiles_cambio;
create policy "cambio_perfiles" on perfiles_cambio for all to authenticated
  using (es_admin_cambio() or user_id = auth.uid())
  with check (es_admin_cambio());

-- 5. Todo lo sensible: SOLO admins.
do $$
declare t text;
begin
  foreach t in array array[
    'exchange_clients','exchange_accounts','exchange_ops','exchange_people',
    'runner_accounts','runner_gestiones','runner_payments','cuentas',
    'cobros_clientes','cobros','cobros_costos','cobros_pagos'
  ]
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "auth_all_%s" on %I', t, t);
    execute format('drop policy if exists "cambio_admin_%s" on %I', t, t);
    execute format(
      'create policy "cambio_admin_%s" on %I for all to authenticated using (es_admin_cambio()) with check (es_admin_cambio())',
      t, t);
  end loop;
end $$;

-- 6. Seed de perfiles. Admin = todos los que hoy ven todo (Capi, Marce y los
--    mails viejos/owner), para no cortarle el acceso a nadie. Runner = Zurdo, Ale.
--    Idempotente: on conflict actualiza rol/runner.
insert into perfiles_cambio (user_id, rol, runner_id)
select u.id, 'admin', null from auth.users u
where lower(u.email) in (
  'capi@gestionesma.store','marce@gestionesma.store','crm@gestionesma.store',
  'blackcrm25@gmail.com','gestionama.redes@gmail.com','gestionesma.redes@gmail.com',
  'ortegafaben@gmail.com','amablur.ok@gmail.com'
)
on conflict (user_id) do update set rol = excluded.rol, runner_id = excluded.runner_id;

insert into perfiles_cambio (user_id, rol, runner_id)
select u.id, 'runner',
  (select r.id from runners r join companies c on c.id = r.company_id
   where c.name ilike '%gestiones%ma%' and lower(r.name) = 'zurdo' limit 1)
from auth.users u where lower(u.email) = 'zurdo@gestionesma.store'
on conflict (user_id) do update set rol = excluded.rol, runner_id = excluded.runner_id;

insert into perfiles_cambio (user_id, rol, runner_id)
select u.id, 'runner',
  (select r.id from runners r join companies c on c.id = r.company_id
   where c.name ilike '%gestiones%ma%' and lower(r.name) = 'ale' limit 1)
from auth.users u where lower(u.email) = 'ale@gestionesma.store'
on conflict (user_id) do update set rol = excluded.rol, runner_id = excluded.runner_id;

-- 7. Verificación
select p.rol, u.email, r.name as runner
from perfiles_cambio p
join auth.users u on u.id = p.user_id
left join runners r on r.id = p.runner_id
order by p.rol, u.email;
-- Esperado: Zurdo y Ale como runner con su runner enganchado; el resto admin.
select tablename, rowsecurity from pg_tables
where tablename in ('phones','phone_accounts','perfiles_cambio','exchange_ops');
```

- [ ] **Step 2: Commit**

```bash
git add web/lib/db/sql/2026-07-30-accesos-runner.sql
git commit -m "feat(cambio): SQL de accesos por rol (perfiles_cambio + RLS runner-scoped)"
```

---

### Task 2: Tier `runner` en auth-config + ruteo

**Files:**
- Modify: `web/lib/auth-config.ts`
- Modify: `web/lib/auth-config.test.ts`
- Modify: `web/lib/supabase/middleware.ts`

**Interfaces:**
- Produces:
  - `AccessTier` ahora incluye `"runner"`.
  - `CAMBIO_RUNNERS: string[]` (allowlist explícita de emails runner).
  - `accessTier(email)` devuelve `"runner"` para un email de la caja que está en `CAMBIO_RUNNERS`.
  - `canAccessPath("runner", path)` → true solo para `/panel` y `/panel/*`.
  - `landingPath("runner")` → `/panel`.

- [ ] **Step 1: Escribir los tests que fallan** (agregar a `web/lib/auth-config.test.ts`)

```ts
// (agregar el import de CAMBIO_RUNNERS arriba)
// import { ..., CAMBIO_RUNNERS } from "@/lib/auth-config";

const emailRunner = CAMBIO_RUNNERS[0];
const itRunner = emailRunner ? it : it.skip;

describe("accessTier — runner", () => {
  itRunner("un email de CAMBIO_RUNNERS da 'runner'", () => {
    expect(accessTier(emailRunner)).toBe("runner");
  });
  itRunner("case-insensitive: en mayúsculas también da 'runner'", () => {
    expect(accessTier(emailRunner.toUpperCase())).toBe("runner");
  });
  itRunner("un runner está permitido (isAllowed)", () => {
    expect(isAllowed(emailRunner)).toBe(true);
  });
});

describe("canAccessPath — tier 'runner'", () => {
  it("ve /panel", () => {
    expect(canAccessPath("runner", "/panel")).toBe(true);
  });
  it("ve /panel/celulares (subruta)", () => {
    expect(canAccessPath("runner", "/panel/celulares")).toBe(true);
  });
  it("NO ve /cambio", () => {
    expect(canAccessPath("runner", "/cambio")).toBe(false);
  });
  it("NO ve /dashboard", () => {
    expect(canAccessPath("runner", "/dashboard")).toBe(false);
  });
  it("NO ve /panelxx (empieza con 'panel' pero no es el panel)", () => {
    expect(canAccessPath("runner", "/panelxx")).toBe(false);
  });
});

describe("landingPath — runner", () => {
  it("'runner' aterriza en /panel", () => {
    expect(landingPath("runner")).toBe("/panel");
  });
});
```

- [ ] **Step 2: Correr los tests y verlos fallar**

Run: `cd web && npx vitest run lib/auth-config.test.ts`
Expected: FAIL (`CAMBIO_RUNNERS` no existe / tipo `"runner"` no asignable / `canAccessPath` no reconoce runner).

- [ ] **Step 3: Implementar en `web/lib/auth-config.ts`**

Sumar los emails nuevos a `CAMBIO_ONLY`, agregar `CAMBIO_RUNNERS`, extender `AccessTier`, y hacer que `accessTier`/`canAccessPath`/`landingPath` contemplen `runner`:

```ts
export const CAMBIO_ONLY: string[] = [
  "capi@gestionesma.store",
  "marce@gestionesma.store",
  "zurdo@gestionesma.store",
  "ale@gestionesma.store",
  // Mails viejos (login por email). Se dejan para no cortar sesiones abiertas.
  "blackcrm25@gmail.com",
  "blackrm25@gmail.com",
  "gestionama.redes@gmail.com",
  "gestionesma.consultora@gmail.com",
  "ortegafaben@gmail.com",
];

// Runners: subconjunto de la caja con acceso REDUCIDO (solo su panel). Es una
// allowlist explícita, no "todo el que no es admin": así un email nuevo de la
// caja nunca cae por accidente en el rol reducido, y solo Zurdo/Ale quedan
// restringidos. Deben tener su fila runner en perfiles_cambio (ver SQL).
export const CAMBIO_RUNNERS: string[] = [
  "zurdo@gestionesma.store",
  "ale@gestionesma.store",
];

export type AccessTier = "full" | "cambio" | "runner" | "none";

export function accessTier(email: string | null | undefined): AccessTier {
  if (!email) return "none";
  const e = email.toLowerCase();
  if (FULL_ACCESS.map((x) => x.toLowerCase()).includes(e)) return "full";
  if (CAMBIO_ONLY.map((x) => x.toLowerCase()).includes(e)) {
    return CAMBIO_RUNNERS.map((x) => x.toLowerCase()).includes(e) ? "runner" : "cambio";
  }
  return "none";
}

export function landingPath(tier: AccessTier): string {
  if (tier === "runner") return "/panel";
  return tier === "cambio" ? "/cambio" : "/dashboard";
}

export function canAccessPath(tier: AccessTier, path: string): boolean {
  if (tier === "full") return true;
  if (tier === "cambio") return path === "/cambio" || path.startsWith("/cambio/");
  if (tier === "runner") return path === "/panel" || path.startsWith("/panel/");
  return false;
}
```

`isAllowed` no cambia (sigue siendo `accessTier(...) !== "none"`, y `runner` no es `none`).

- [ ] **Step 4: Correr los tests y verlos pasar**

Run: `cd web && npx vitest run lib/auth-config.test.ts`
Expected: PASS (incluye los casos viejos de `cambio`, que siguen verdes porque `capi@` no está en `CAMBIO_RUNNERS`).

- [ ] **Step 5: Arreglar el redirect del middleware** en `web/lib/supabase/middleware.ts`

El redirect de "ruta no permitida" hoy manda a `/cambio` fijo; un runner no puede ver `/cambio`, así que caería en un loop. Mandarlo a su propia landing:

```ts
  // Usuario sin permiso para esta ruta → a su pantalla de inicio (según su tier).
  // Antes iba fijo a /cambio, lo que dejaba a un runner en un loop de redirects
  // (el runner no puede ver /cambio). landingPath resuelve la pantalla correcta.
  if (user && !isPublic && !canAccessPath(tier, path)) {
    const url = request.nextUrl.clone();
    url.pathname = landingPath(tier);
    return NextResponse.redirect(url);
  }
```

- [ ] **Step 6: Verificar tsc + lint**

Run: `cd web && npx tsc --noEmit && npx eslint lib/auth-config.ts lib/supabase/middleware.ts`
Expected: sin errores.

- [ ] **Step 7: Commit**

```bash
git add web/lib/auth-config.ts web/lib/auth-config.test.ts web/lib/supabase/middleware.ts
git commit -m "feat(cambio): tier runner en auth-config + ruteo a /panel"
```

---

### Task 3: Capa de datos del perfil del runner

**Files:**
- Create: `web/lib/cambio/perfiles.ts`
- Create: `web/lib/cambio/perfiles-datos.ts`
- Test: `web/lib/cambio/perfiles-datos.test.ts`

**Interfaces:**
- Produces:
  - `type Perfil = { rol: "admin" | "runner"; runnerId: string | null; runnerNombre: string }`.
  - `getMiPerfil(): Promise<Perfil | null>` — lee `perfiles_cambio` de `auth.uid()` (RLS ya lo limita a la propia fila) con `runners(name)`; `null` si no hay perfil. Molde: `celulares-datos.ts` (`uno()` para la relación, log `[cambio]`).

- [ ] **Step 1: Escribir el test que falla** (`web/lib/cambio/perfiles-datos.test.ts`)

Mockear supabase como en `celulares-datos.test.ts`. Mirar ese archivo para copiar el patrón exacto del mock (encadenado `from().select().eq().limit().single()` o el que use). El test verifica el mapper:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSingle = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: mockSingle }),
      }),
    }),
  })),
}));

import { getMiPerfil } from "@/lib/cambio/perfiles-datos";

beforeEach(() => mockSingle.mockReset());

describe("getMiPerfil", () => {
  it("mapea un runner con su nombre (snake→camel)", async () => {
    mockSingle.mockResolvedValue({
      data: { rol: "runner", runner_id: "r1", runners: { name: "Zurdo" } },
      error: null,
    });
    expect(await getMiPerfil()).toEqual({ rol: "runner", runnerId: "r1", runnerNombre: "Zurdo" });
  });

  it("un admin no tiene runner (runnerId null, nombre vacío)", async () => {
    mockSingle.mockResolvedValue({
      data: { rol: "admin", runner_id: null, runners: null },
      error: null,
    });
    expect(await getMiPerfil()).toEqual({ rol: "admin", runnerId: null, runnerNombre: "" });
  });

  it("sin fila devuelve null", async () => {
    mockSingle.mockResolvedValue({ data: null, error: null });
    expect(await getMiPerfil()).toBeNull();
  });
});
```

> Nota para el implementador: ajustá la forma del mock (`maybeSingle` vs `single`, y la cadena de `.eq()`) a lo que realmente use `getMiPerfil` según el molde de `celulares-datos.test.ts`. El contrato a cumplir es el del `expect`.

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `cd web && npx vitest run lib/cambio/perfiles-datos.test.ts`
Expected: FAIL (`getMiPerfil` no existe).

- [ ] **Step 3: Implementar `perfiles.ts` y `perfiles-datos.ts`**

`web/lib/cambio/perfiles.ts`:
```ts
export type Perfil = {
  rol: "admin" | "runner";
  runnerId: string | null;
  runnerNombre: string;
};
```

`web/lib/cambio/perfiles-datos.ts` (molde `celulares-datos.ts`):
```ts
import { createClient } from "@/lib/supabase/server";
import type { Perfil } from "./perfiles";

function uno<T>(rel: T | T[] | null): T | null {
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

type PerfilRow = {
  rol: "admin" | "runner";
  runner_id: string | null;
  runners: { name: string } | { name: string }[] | null;
};

/**
 * El perfil del usuario logueado. La RLS de perfiles_cambio ya limita la
 * lectura a la propia fila (o todas, si es admin), así que se filtra por
 * user_id = auth.uid() para traer exactamente una. `null` si no tiene perfil
 * (usuario sin cargar en perfiles_cambio): el llamador lo trata como "sin
 * acceso a datos" y muestra un aviso, nunca datos de otro.
 */
export async function getMiPerfil(): Promise<Perfil | null> {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  const { data, error } = await sb
    .from("perfiles_cambio")
    .select("rol,runner_id,runners(name)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[cambio] lectura de perfil falló:", error.message, error.details ?? "");
    return null;
  }
  if (!data) return null;

  const row = data as unknown as PerfilRow;
  return {
    rol: row.rol,
    runnerId: row.runner_id,
    runnerNombre: uno(row.runners)?.name ?? "",
  };
}
```

- [ ] **Step 4: Correr el test y verlo pasar**

Run: `cd web && npx vitest run lib/cambio/perfiles-datos.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add web/lib/cambio/perfiles.ts web/lib/cambio/perfiles-datos.ts web/lib/cambio/perfiles-datos.test.ts
git commit -m "feat(cambio): capa de datos del perfil del runner (getMiPerfil)"
```

---

### Task 4: Panel del runner (`/panel`)

**Files:**
- Create: `web/app/(panel)/layout.tsx`
- Create: `web/app/(panel)/panel/page.tsx`
- Create: `web/components/cambio/panel-celulares.tsx`

**Interfaces:**
- Consumes: `getMiPerfil` (Task 3); `getCelulares`, `getCuentasOperativas` de `@/lib/cambio/celulares-datos` (RLS ya las filtra al runner); `NuevaCuentaButton`, `EditarCuentaButton` de `@/components/cambio/celular-forms` (ya existen y son RLS-safe).

Notas de diseño:
- `/panel` va en su PROPIO route group `(panel)` con su layout mínimo (sin el `Sidebar` del CRM): es la "app reducida". El middleware ya protege todas las rutas (matcher en `proxy.ts`) y `canAccessPath("runner", ...)` solo deja pasar `/panel/*`.
- El runner ve sus celulares en **solo lectura** (no edita el teléfono; se lo asigna el admin) y sus cuentas con **agregar/editar/eliminar** (reusa los modales de `celular-forms.tsx`).
- `getCelulares()`/`getCuentasOperativas()` no reciben runnerId: la RLS de `phones`/`phone_accounts` ya devuelve solo lo del runner logueado. No hace falta filtrar en el server.

- [ ] **Step 1: Crear el layout mínimo** `web/app/(panel)/layout.tsx`

```tsx
import { AmbientGlow } from "@/components/shell/ambient-glow";

// Layout de la "app reducida" del runner: SIN el Sidebar del CRM. El runner
// solo tiene su panel, así que no hay navegación lateral que mostrar. El
// candado de rutas lo pone el middleware (proxy.ts) + canAccessPath("runner").
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <AmbientGlow />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Crear el componente** `web/components/cambio/panel-celulares.tsx`

Client component. Molde: `celulares-lista.tsx` (doble render `.ops-cards`/`.ops-tabla`, expand/collapse, `EditarCuentaButton` montado fuera del map con `key`), PERO sin editar el celular (sin `EditarCelularButton`, sin columna Runner). Cada celular expande sus cuentas con `NuevaCuentaButton`/edición.

```tsx
"use client";
import { Fragment, useState } from "react";
import { Pencil, ChevronDown, ChevronRight } from "lucide-react";
import type { Celular, CuentaOperativa } from "@/lib/cambio/celulares";
import { NuevaCuentaButton, EditarCuentaButton } from "@/components/cambio/celular-forms";

const botonLapiz: React.CSSProperties = {
  background: "var(--card)", border: "1px solid var(--border)", borderRadius: 9,
  padding: "7px 9px", display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", color: "var(--muted)",
};

function CuentasDeCelular({
  celularId, cuentas, onEditar,
}: {
  celularId: string; cuentas: CuentaOperativa[]; onEditar: (c: CuentaOperativa) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 2px 4px" }}>
      {cuentas.length === 0 && (
        <p style={{ fontSize: 12.5, color: "var(--muted)", margin: 0 }}>Este celular todavía no tiene cuentas cargadas.</p>
      )}
      {cuentas.map((c) => (
        <div key={c.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "11px 13px", display: "flex", flexDirection: "column", gap: 6, background: "var(--card)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 650 }}>{c.titular || "—"}</div>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{c.dni}</span>
            <button type="button" aria-label="Editar cuenta" title="Editar" onClick={() => onEditar(c)} style={{ ...botonLapiz, marginLeft: "auto" }}>
              <Pencil size={14} />
            </button>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Pesos: {c.cbuPesos || "—"} · {c.aliasPesos || "—"}</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Dólares: {c.cbuDolares || "—"} · {c.aliasDolares || "—"}</div>
        </div>
      ))}
      <div><NuevaCuentaButton celularId={celularId} /></div>
    </div>
  );
}

export function PanelCelulares({
  celulares, cuentas,
}: {
  celulares: Celular[]; cuentas: CuentaOperativa[];
}) {
  const [editandoCuenta, setEditandoCuenta] = useState<CuentaOperativa | null>(null);
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});
  const cuentasDe = (celularId: string): CuentaOperativa[] => cuentas.filter((c) => c.celularId === celularId);
  const toggle = (id: string) => setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }));

  if (celulares.length === 0) {
    return (
      <p style={{ fontSize: 13.5, color: "var(--muted)", margin: 0, padding: "6px 0" }}>
        Todavía no tenés celulares asignados. Pedile a Capi que te asigne los tuyos.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {celulares.map((c) => {
        const propias = cuentasDe(c.id);
        const abierto = !!expandidos[c.id];
        return (
          <Fragment key={c.id}>
            <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "12px 13px", display: "flex", flexDirection: "column", gap: 9, background: "var(--card)", opacity: c.activo ? 1 : 0.6 }}>
              <div onClick={() => toggle(c.id)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <span aria-hidden style={{ color: "var(--muted)" }}>{abierto ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 650 }}>{c.alias}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{c.modelo || "—"}</div>
                </div>
                <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--accent)", fontWeight: 600 }}>
                  {abierto ? "Ocultar" : "Ver / agregar"} cuentas ({propias.length})
                </span>
              </div>
              {abierto && (
                <div style={{ borderTop: "1px solid var(--border)" }}>
                  <CuentasDeCelular celularId={c.id} cuentas={propias} onEditar={setEditandoCuenta} />
                </div>
              )}
            </div>
          </Fragment>
        );
      })}

      {editandoCuenta && (
        <EditarCuentaButton
          key={editandoCuenta.id}
          cuenta={editandoCuenta}
          abierto
          onCerrar={() => setEditandoCuenta(null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Crear la página** `web/app/(panel)/panel/page.tsx`

```tsx
import { getMiPerfil } from "@/lib/cambio/perfiles-datos";
import { getCelulares, getCuentasOperativas } from "@/lib/cambio/celulares-datos";
import { PanelCelulares } from "@/components/cambio/panel-celulares";

export const dynamic = "force-dynamic";

const GM_ACCENT = "#D9A84E";
const GM_GRAD = "linear-gradient(140deg,#D9A84E,#a9791f)";

const panel: React.CSSProperties = {
  background: "var(--glass)", backdropFilter: "blur(16px)",
  border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20,
};

export default async function PanelPage() {
  // RLS filtra celulares/cuentas al runner logueado: no hace falta pasar runnerId.
  const [perfil, celulares, cuentas] = await Promise.all([
    getMiPerfil(),
    getCelulares(),
    getCuentasOperativas(),
  ]);

  return (
    <div style={{ ["--accent" as string]: GM_ACCENT, ["--grad" as string]: GM_GRAD }}>
      <div style={{ padding: "26px 22px 40px", display: "flex", flexDirection: "column", gap: 20, maxWidth: 760, margin: "0 auto" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 780, letterSpacing: "-.5px", margin: 0 }}>
            Hola{perfil?.runnerNombre ? `, ${perfil.runnerNombre}` : ""}
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "5px 0 0" }}>
            Tus celulares y cuentas de Gestiones MA.
          </p>
        </div>

        {!perfil?.runnerId ? (
          <div style={panel}>
            <p style={{ fontSize: 13.5, color: "var(--muted)", margin: 0 }}>
              Tu usuario todavía no está vinculado a un runner. Avisale a Capi para que te habilite.
            </p>
          </div>
        ) : (
          <div style={panel}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 14px" }}>Mis celulares y cuentas</h2>
            <PanelCelulares celulares={celulares} cuentas={cuentas} />
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verificar tsc + lint + tests + build**

Run: `cd web && npx tsc --noEmit && npx eslint app/(panel) components/cambio/panel-celulares.tsx && npx vitest run && npm run build`
Expected: sin errores; `/panel` compila; suite verde.

> Si `npx eslint app/(panel)` se queja por los paréntesis en la ruta (glob), correr `npx eslint "app/(panel)/**/*.tsx"` con comillas.

- [ ] **Step 5: Commit**

```bash
git add web/app/(panel) web/components/cambio/panel-celulares.tsx
git commit -m "feat(cambio): panel reducido del runner en /panel"
```

---

## Verificación final

- Correr `2026-07-30-accesos-runner.sql` en Supabase (DESPUÉS de crear los 3 usuarios con Auto Confirm). Revisar que el select final muestre Zurdo/Ale como runner enganchados a su runner.
- Suite verde, `tsc`/`lint` limpios, `build` OK.
- Merge + deploy DESPUÉS del SQL.
- Prueba manual:
  - Entrar como **Zurdo** → cae en `/panel`, ve solo sus celulares/cuentas, puede agregar una cuenta; forzar `/cambio` en la URL → lo redirige a `/panel`.
  - Entrar como **Ale** → ve lo suyo, NO lo de Zurdo.
  - Entrar como **Marce** → ve todo `/cambio` como Capi.
  - Confirmar que Capi (y los mails viejos) siguen viendo todo (no se rompió el acceso admin).

## Self-review (hecho)

- **Cobertura del spec:** Sección 1 (usuarios/roles) → Task 1 (seed) + Task 2 (auth-config). Sección 2 (panel) → Task 3 (perfil) + Task 4 (UI). Sección 3 (RLS) → Task 1. Requisitos capturados de hoja de ruta → fuera de alcance, anotados en el spec.
- **Placeholders:** ninguno; todo el código va completo. La única nota abierta es ajustar la forma exacta del mock de supabase en el test de Task 3 al molde existente (contrato fijado por el `expect`).
- **Consistencia de tipos:** `Perfil`/`getMiPerfil` iguales en Task 3 y Task 4; `PanelCelulares` props `{celulares, cuentas}` iguales en componente y página; `AccessTier` con `"runner"` usado consistente en auth-config y middleware.
