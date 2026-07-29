# Comprobante por cliente — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Generar un comprobante de las operaciones de un cliente, en dos modos: **interno** (con margen de ganancia) y **para el cliente** (con branding Gestiones MA y frase de agradecimiento, SIN margen). Imprimible / guardable como PDF.

**Architecture:** Una página `/cambio/comprobante` (server) que recibe `?cliente=<nombre>`, carga las operaciones y filtra las de ese cliente; un componente cliente que muestra el comprobante con un toggle interno/cliente, filtro de fechas, y botón imprimir. Botón "Comprobante" por cliente en la sección "Por cliente".

**Tech Stack:** Next.js 16, React 19, TypeScript.

## Global Constraints

- El **comprobante para el cliente NO muestra el margen** (solo el interno).
- Frase de cierre del modo cliente (exacta): **"Gracias por la confianza. Gestiones MA — Soluciones financieras para su bienestar."**
- Branding Gestiones MA: dorado `#D9A84E`, logo `public/logos/gestiones-mark.png` (o texto "Gestiones MA"). El modo interno puede ser más sobrio.
- No toca el cálculo. Reusa `getDatosCambio` (ya devuelve `operaciones` calculadas) y filtra por `op.cliente === nombre`.
- Montos: `formatearPesos` (pesos), `toLocaleString("es-AR",{maximumFractionDigits:2})` (USD).
- Estilos inline con CSS variables; imprimible (CSS `@media print`).

---

### Task 1: Página y componente del comprobante

**Files:** Create `web/app/(app)/cambio/comprobante/page.tsx`, `web/components/cambio/comprobante-cliente.tsx`; Modify `web/app/globals.css` (reglas `@media print`).

**Página (`comprobante/page.tsx`, server, `export const dynamic = "force-dynamic"`):**
- Lee `searchParams.cliente` (string). Carga `getDatosCambio(hoyISO())` (de `@/lib/cambio/datos`) y toma `operaciones`. Filtra `const ops = operaciones.filter((o) => (o.cliente || "(sin cliente)") === cliente)`.
- Renderiza `<ComprobanteCliente cliente={cliente} operaciones={ops} />` (pasar SOLO arrays serializables — NO funciones).
- Un link de vuelta a `/cambio`.

**Componente (`comprobante-cliente.tsx`, `"use client"`):**
- Props: `{ cliente: string; operaciones: OperacionCalculada[] }`.
- Estado: `modo: "interno" | "cliente"` (default "interno"), `desde: string`, `hasta: string` (filtros de fecha, vacío = sin límite).
- Filtra las operaciones por rango: `ops.filter((o) => (!desde || o.fecha >= desde) && (!hasta || o.fecha <= hasta))`.
- Controles (NO se imprimen, clase `.no-print`): toggle Interno / Para cliente; dos inputs date (Desde / Hasta); botón **"Imprimir / Guardar PDF"** que hace `window.print()`.
- **Hoja del comprobante** (clase `.comprobante`):
  - Encabezado: en modo cliente, logo/nombre **Gestiones MA** dorado + "CAJA DE CAMBIO"; en interno, un título "Comprobante interno". Nombre del **cliente**. Rango de fechas (o "todas").
  - **Tabla de operaciones**: Fecha, Tipo (COMPRA/VENTA/CARGA/CANJE), USD, Pesos, TC. (En modo cliente NO incluir columna de margen.)
  - **Totales**: total USD operado, total pesos. En modo **interno** además: **Margen de ganancia** (suma de `o.margen` de las ops filtradas) y comisiones. En modo **cliente**: sin margen.
  - Modo **cliente**: al pie, la frase exacta de agradecimiento (Global Constraints) + "gestionesma.store".
- El canje: mostrar su movimiento (recibió/entregó) o simplemente el tipo CANJE con "—" en USD/pesos (no tenés nombres de cajas acá salvo que los pases; para v1 alcanza con tipo + "—").

**globals.css — `@media print`:** ocultar el chrome de la app y los controles: `@media print { .ig-side, .cambio-mtop, .no-print { display: none !important; } .comprobante { box-shadow: none; } body { background: #fff; } }`. Asegurar que el comprobante se imprima en fondo claro y legible (el modo cliente conviene fondo blanco con texto oscuro para que salga bien impreso — usar colores fijos en `.comprobante`, no depender del tema).

- [ ] **Step 1:** Implementar página + componente + reglas de impresión. Sin tests (UI). Verificar `npx tsc --noEmit`, `npm run lint`, `npx vitest run` (sin regresiones), `npm run build` (que `/cambio/comprobante` compile).
- [ ] **Step 2: Commit** `feat(cambio): comprobante por cliente (interno y para el cliente) imprimible`.

---

### Task 2: Botón "Comprobante" en "Por cliente"

**Files:** Modify `web/components/cambio/rankings.tsx`.

- Leé `rankings.tsx` (la sección "Por cliente"). En cada fila de cliente, agregá un enlace **"Comprobante"** (discreto) que vaya a `/cambio/comprobante?cliente=${encodeURIComponent(nombreCliente)}`. Usá `next/link`. Que se vea bien en la tabla y en mobile.

- [ ] **Step 1:** Implementar. Verificar `tsc` + `lint` + `vitest run` + `build`.
- [ ] **Step 2: Commit** `feat(cambio): enlace a Comprobante por cliente desde el ranking`.

---

## Verificación final

- Revisión de rama: el comprobante CLIENTE no muestra margen; el interno sí; la frase de agradecimiento exacta; imprime limpio (sin sidebar ni controles); no pasa funciones server→cliente.
- Suite verde, `tsc`/`lint` limpios, `build` OK.
- Merge + deploy (no requiere SQL). Probar: desde "Por cliente" → Comprobante → togglear interno/cliente, filtrar fechas, imprimir/guardar PDF.
