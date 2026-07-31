# Accesos por rol en el módulo Cambio — Design

**Fecha:** 2026-07-30
**Estado:** Aprobado en brainstorming (3 secciones), pendiente de review del spec.

## Goal

Pasar el módulo Cambio de *un único usuario compartido* a **usuarios con identidad y rol**:
**admins** (Capi, Marce) que ven todo, y **runners** (Zurdo, Ale) que entran a un panel
propio y reducido y solo acceden a lo suyo. El aislamiento es **estricto** (RLS en la base,
no solo en la pantalla).

## Architecture

Tres piezas:

1. **Identidad + rol** — tabla `perfiles_cambio (user_id, rol, runner_id)` como fuente de
   verdad en la base; `auth-config.ts` suma los usuarios y marca a los admins para el ruteo.
2. **Panel del runner** — área nueva `/panel`, aparte de `/cambio`. El runner cae ahí al
   entrar y solo ve sus celulares y sus cuentas operativas.
3. **Candado (RLS)** — funciones `es_admin_cambio()` / `mi_runner_id()` y políticas
   reescritas: runner-scoped en `phones`/`phone_accounts`, admin-only en todo lo sensible.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Supabase (Auth + Postgres +
RLS), Vitest. Deploy Vercel. Proyecto Supabase `zjetaihjddoxxvrpzwsb` (CRM INICIATIVA GLOBAL).

## Global Constraints

- SQL idempotente en `web/lib/db/sql/2026-07-30-accesos-runner.sql`, corrido a mano por el
  usuario (yo no toco claves ni corro DDL destructivo). Empresa: `where c.name ilike
  '%gestiones%ma%'`.
- **Los usuarios de auth los crea el usuario** en Supabase (email + contraseña). El seed de
  `perfiles_cambio` los referencia por email (`auth.users`), así que corre DESPUÉS de crearlos.
- **Desplegar el código schema-dependiente DESPUÉS de correr el SQL** (regla ya aprendida:
  si el código lee columnas/tablas que no existen, el tablero se rompe).
- Server actions: `type Resultado = { ok: true } | { ok: false; error: string }`;
  `revalidatePath` en try/catch aislado; log `[cambio]`; validar antes de `createClient()`.
- Estilos inline + CSS vars, acento dorado Gestiones MA (`#D9A84E`), mobile-first
  (`.ops-cards`/`.ops-tabla`, `.campo-fila`, `.cambio-modal`). NO pasar funciones de server a
  client components.
- Fallar cerrado: si falta el perfil o el dato de rol, el usuario NO ve datos sensibles.

---

## Sección 1 — Usuarios y roles

### Usuarios de auth (los crea el usuario en Supabase)

| Usuario (login) | Email interno | Rol |
|---|---|---|
| Marce | `marce@gestionesma.store` | admin |
| Zurdo | `zurdo@gestionesma.store` | runner → runner "Zurdo" |
| Ale | `ale@gestionesma.store` | runner → runner "Ale" |

Capi (`capi@gestionesma.store`) ya existe y sigue siendo admin. Entran igual que hoy:
usuario + contraseña; `usuarioAEmail("Marce")` → `marce@gestionesma.store`.

### Tabla `perfiles_cambio`

```sql
create table if not exists perfiles_cambio (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  rol        text not null check (rol in ('admin','runner')),
  runner_id  uuid references runners(id) on delete set null,
  created_at timestamptz not null default now()
);
```

- `rol='admin'` → ve todo (Capi, Marce, **y los emails de acceso completo del CRM**, para no
  romper el deploy CRM que también entra a `/cambio`). `runner_id` va NULL.
- `rol='runner'` → `runner_id` apunta a su registro en `runners`.

El seed inserta por email (idempotente, `on conflict do update`), resolviendo `runner_id`
con `select id from runners r join companies c ... where c.name ilike '%gestiones%ma%' and
lower(r.name)=lower('zurdo')`.

### `auth-config.ts`

- `CAMBIO_ONLY` suma `marce@`, `zurdo@`, `ale@` (autorizados a entrar).
- Nueva `CAMBIO_ADMINS = ["capi@gestionesma.store", "marce@gestionesma.store"]`.
- Nueva `esAdminCambio(email): boolean`.
- Nuevo tipo de rol de ruteo: un usuario tier `cambio` que **no** está en `CAMBIO_ADMINS` es
  **runner**. `landingPath` y `canAccessPath` se extienden:
  - admin-cambio → `/cambio` y subrutas (como hoy).
  - runner → **solo** `/panel` y subrutas; cualquier otra ruta se redirige a `/panel`.
  - `landingPath` de un runner devuelve `/panel`.

> El ruteo (middleware) usa la lista de admins del código (sin tocar la base, por velocidad).
> El candado (RLS) usa `perfiles_cambio` en la base. Dos capas, cada una con su fuente; se
> mantienen en sync listando a las mismas personas como admin.

---

## Sección 2 — Panel del runner

Área nueva `/panel` (fuera de `/cambio`), layout propio simple, header "Gestiones MA" + nombre
del runner. Secciones:

- **`/panel` (o `/panel/celulares`)** — **Mis celulares**: lista de `phones` con
  `runner_id = mi runner`. Solo lectura (los celus se los asigna el admin).
- **Mis cuentas** — `phone_accounts` colgadas de esos celus. El runner puede **agregar** y
  **editar/eliminar las suyas** (botón "Agregar cuenta", modal). Reutiliza el modal/lista de
  cuentas operativas que ya existe, alimentado solo con lo suyo.
- *(Mi hoja de ruta — proyecto siguiente, ver abajo.)*

El runner **no ve**: tablero, margen, operaciones, otros runners, Cuentas bancarias, Runners,
Export. Los admins (Capi/Marce) siguen en `/cambio` completo, sin cambios.

**Datos de la página (`/panel`, server component):** lee el perfil del usuario actual
(`perfiles_cambio` por `auth.uid()`) para obtener su `runner_id` y nombre; carga sus `phones`
y `phone_accounts`. Todo serializable a los client components (sin funciones).

---

## Sección 3 — El candado (RLS)

Funciones (SQL, `security definer` sobre `perfiles_cambio`):

```sql
create or replace function es_admin_cambio() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfiles_cambio p
                 where p.user_id = auth.uid() and p.rol = 'admin');
$$;

create or replace function mi_runner_id() returns uuid
  language sql stable security definer set search_path = public as $$
  select runner_id from perfiles_cambio
  where user_id = auth.uid() and rol = 'runner';
$$;
```

Políticas (reemplazan las `using(true)` actuales):

- **`phones`** — `for all`: `using (es_admin_cambio() or runner_id = mi_runner_id())`;
  `with check` igual. (Runner solo agrega/edita celus propios; en la práctica los agrega el
  admin, pero la política es coherente.)
- **`phone_accounts`** — `using (es_admin_cambio() or phone_id in (select id from phones
  where runner_id = mi_runner_id()))`; `with check` igual → el runner solo carga cuentas en
  SUS celus.
- **Admin-only** (solo `es_admin_cambio()`): `exchange_clients`, `exchange_accounts`,
  `exchange_ops`, `exchange_people`, `runner_accounts`, `runner_gestiones`, `runner_payments`,
  `cuentas` (bancarias), `cobros_clientes`, `cobros`, `cobros_costos`, `cobros_pagos`, y la
  tabla de comprobantes.
- **`runners`** — `using (es_admin_cambio() or id = mi_runner_id())` (el runner lee solo su
  propia fila, para el nombre). `with check`: solo admin.
- **`perfiles_cambio`** — `using (es_admin_cambio() or user_id = auth.uid())`; `with check`:
  solo admin (los perfiles se siembran/gestionan por SQL, no desde la app).

### Alcance del candado (honesto)

- Cubre **todas las tablas del módulo Cambio**. Un runner autenticado no puede leer
  operaciones, margen, ni datos de otros runners, ni por fuera de la pantalla.
- **Fuera de alcance:** las tablas propias del CRM general (`ad_accounts`, `campaigns`,
  `campaign_metrics`, `expenses`) siguen con su RLS actual. Son de otro deploy/dominio y no se
  tocan acá; lockearlas afectaría al CRM. Se deja anotado como limitación conocida.

---

## Testing

- `auth-config.test.ts`: `esAdminCambio` (admin vs runner vs no autorizado); `canAccessPath`
  para runner (solo `/panel/*`, se le niega `/cambio` y `/dashboard`); `landingPath` de runner
  → `/panel`; `CAMBIO_ONLY` incluye los nuevos emails.
- Datos del panel: mapper de perfil (snake→camel), lectura de phones/phone_accounts del runner
  (mock supabase como en `celulares-datos.test.ts`), chequeo de truncado.
- Server actions de cuenta operativa del runner: create/update/delete escriben columnas
  correctas; rechazan id vacío; revalidate aislado.
- Verificación manual post-SQL: entrar como Zurdo → ve solo sus celus/cuentas, no ve `/cambio`;
  entrar como Marce → ve todo.

## Error handling

- Perfil ausente / `runner_id` NULL en un runner → panel vacío con aviso "Tu usuario todavía
  no está vinculado a un runner. Avisale a Capi." (no rompe).
- RLS niega una lectura → la app muestra vacío, nunca datos de otro.
- Middleware: runner que fuerza una URL de `/cambio` → redirect a `/panel`.

---

## Proyecto siguiente — Hoja de ruta (fuera de alcance de este spec, requisitos capturados)

Se construye **encima** de esta base (necesita la identidad del runner). Requisitos del usuario:

- El **admin** (Capi/Marce) le **asigna** una hoja de ruta a un runner para un día.
- El runner la puede **imprimir** o sacarle **foto** para mandar por WhatsApp.
- Contenido de la hoja: **orden del día**, **cantidad de cuentas**, y **las cuentas a operar
  ese día** con sus datos: **alias + CBU, en pesos y en dólares**.
- Los datos de cuenta salen de `phone_accounts` (ya tiene `cbu_pesos`, `alias_pesos`,
  `cbu_dolares`, `alias_dolares`). Modelo tentativo: tabla `hojas_ruta (id, company_id,
  runner_id, fecha, orden, notas)` + `hoja_ruta_cuentas (hoja_id, phone_account_id, orden)`;
  vista imprimible en `/panel` (runner) y alta/asignación en `/cambio` (admin).

---

## Verificación final

- Correr `2026-07-30-accesos-runner.sql` en Supabase (tabla + funciones + políticas + seed).
- Suite verde, `tsc`/`lint` limpios, `build` OK.
- Revisión: aislado (no toca cálculo); un runner no lee nada sensible ni de otro runner; sin
  funciones server→cliente; el CRM full-access sigue viendo todo `/cambio`.
- Merge + deploy DESPUÉS del SQL. Probar como Zurdo, Ale y Marce.
