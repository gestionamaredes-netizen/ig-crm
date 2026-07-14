# IG CRM — Fase 1, Plan 2: Auth + Base de datos (Supabase) — Implementation Plan

**Goal:** Reemplazar los datos locales por una base de datos real (Supabase/Postgres con Drizzle) y proteger la app con login.

**Estado:** capa de datos scaffolded (esquema, cliente, config, seed). **Bloqueado en el paso 0** (crear proyecto Supabase — lo hace Fabricio).

## Global Constraints
- Claude NO crea cuentas ni maneja contraseñas: Fabricio crea el proyecto Supabase y pega las claves en `web/.env.local`.
- No commitear `.env.local` (ya está en `.gitignore`).
- Verificación: `npm run build` + probar login y lectura de datos en el navegador.

## Paso 0 — Fabricio crea Supabase (bloqueante)
1. Entrar a https://supabase.com → **Start your project** → crear cuenta (gratis).
2. **New project**: nombre `ig-crm`, definir una **contraseña de base de datos** (guardarla), región cercana (South America / São Paulo).
3. Esperar ~2 min a que se aprovisione.
4. **Project Settings → API**: copiar `Project URL` y `anon public key`.
5. **Project Settings → Database → Connection string → Transaction pooler (URI)**: copiar y reemplazar `[YOUR-PASSWORD]`.
6. Crear `web/.env.local` (copiar de `web/.env.local.example`) y pegar los 3 valores.

## Tareas (Claude, una vez que existan las claves)
1. `npm run db:push` — crear las tablas en Supabase desde el esquema Drizzle.
2. `npm run db:seed` — cargar las 4 empresas + etapas + leads + tareas + actividad.
3. **Supabase clients** (`lib/supabase/client.ts` browser, `lib/supabase/server.ts` server con cookies) usando `@supabase/ssr`.
4. **Login** (`app/(auth)/login/page.tsx`) email/password + acción de sign-in/sign-out.
5. **Middleware** (`middleware.ts`) que protege el grupo `(app)` y refresca sesión.
6. **Migrar lecturas**: cambiar dashboard y workspaces de `lib/*` a queries Drizzle (`db.select…`).
7. Crear el primer usuario admin (Fabricio) desde Supabase Auth.
8. Verificar: build + login + datos reales en pantalla.

## Fuera de alcance (fases siguientes)
Drag & drop con guardado (Plan 3), CRUD de tareas/calendario (Plan 4), integraciones reales (Fase 3), IA real (Fase 4).
