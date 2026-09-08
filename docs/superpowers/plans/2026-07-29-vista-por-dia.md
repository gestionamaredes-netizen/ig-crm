# Vista por día — Implementation Plan (Parte 1 de "interfaz de trabajo diario")

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Que el tablero de `/cambio` se pueda ver POR DÍA: un selector de fecha (por defecto hoy) que enfoca las operaciones y los totales de ese día, mostrando los stocks/cajas/costo promedio como quedaron AL CIERRE de ese día. Cada día arranca con la lista limpia; nada se borra.

**Architecture:** El page lee `?dia=YYYY-MM-DD` (default hoy). Se recompone lo del día desde las operaciones calculadas: las operaciones del día para la tabla y los rankings; los totales del día (margen/comisiones/volumen); y el estado acumulado (stock, costo, cajas) al final de ese día. Un selector cliente cambia la fecha en la URL.

**Tech Stack:** Next.js 16, React 19, TypeScript.

## Global Constraints

- No toca el cálculo (`calcular`): se REUSAN `saldosDeCajas`, `rankingClientes`, `rankingPersonas` sobre subconjuntos de operaciones.
- Los stocks/cajas/costo son ACUMULATIVOS (inventario real): se muestran "al cierre del día" = estado tras todas las operaciones con `fecha <= dia`.
- Lo del día (operaciones, margen, comisiones, volumen, rankings) sale de `fecha === dia`.
- `operaciones` de `getDatosCambio` viene ordenado cronológicamente (así lo devuelve `calcular`).
- No pasar funciones de server a client components.

---

### Task 1: Helper de resumen del día + exponer cajas

**Files:** Modify `web/lib/cambio/reportes.ts`, `web/lib/cambio/datos.ts`; Test `web/lib/cambio/reportes.test.ts`.

- `reportes.ts`: agregar
  ```ts
  export type ResumenDia = {
    margenDia: number; comisionesDia: number; volumenPesosDia: number; volumenUsdDia: number;
    stockUsd: number; costoPromedio: number; margenAcumulado: number;
  };
  export function resumenDelDia(ops: OperacionCalculada[], dia: string): ResumenDia {
    const hasta = ops.filter((o) => o.fecha <= dia);
    const delDia = ops.filter((o) => o.fecha === dia);
    const esTrading = (o: OperacionCalculada) => o.tipo !== "carga" && o.tipo !== "canje";
    const ultima = hasta[hasta.length - 1];
    return {
      margenDia: delDia.reduce((s, o) => s + o.margen, 0),
      comisionesDia: delDia.reduce((s, o) => s + o.costos, 0),
      volumenPesosDia: delDia.filter(esTrading).reduce((s, o) => s + o.ars, 0),
      volumenUsdDia: delDia.filter(esTrading).reduce((s, o) => s + o.usd, 0),
      stockUsd: ultima?.stock ?? 0,
      costoPromedio: ultima?.costoPromedio ?? 0,
      margenAcumulado: hasta.reduce((s, o) => s + o.margen, 0),
    };
  }
  ```
- `datos.ts`: que `getDatosCambio` devuelva ADEMÁS `cajas: Caja[]` (la lista cruda que ya carga y usa internamente para `saldosDeCajas`). Es decir, sumar `cajas: listaCajas` (o como se llame la variable) al objeto de retorno, y al type del retorno. NO cambiar nada más de lo que ya devuelve.

- [ ] **Step 1: Tests** en `reportes.test.ts` para `resumenDelDia`: con ops en dos fechas, verificar que `margenDia`/`comisionesDia`/`volumenPesosDia` son solo del día pedido; que `stockUsd`/`costoPromedio` son los de la última op con `fecha <= dia` (estado al cierre de ese día); que `margenAcumulado` suma hasta ese día inclusive. Correr rojo.
- [ ] **Step 2: Implementar** el helper y el `cajas` en getDatosCambio.
- [ ] **Step 3:** `npx vitest run lib/cambio/reportes.test.ts` + `tsc` + `vitest run` completo.
- [ ] **Step 4: Commit** `feat(cambio): resumenDelDia + getDatosCambio expone cajas`.

---

### Task 2: Selector de fecha + tablero por día

**Files:** Create `web/components/cambio/selector-dia.tsx`; Modify `web/app/(app)/cambio/page.tsx`.

**Selector (`selector-dia.tsx`, `"use client"`):** props `{ dia: string }`. Muestra: botón ◀ (día anterior), un `<input type="date" value={dia}>`, botón ▶ (día siguiente). Al cambiar, navega con `useRouter().push('/cambio?dia=' + nuevaFecha)`. Prev/next calculan la fecha ±1 día (parsear YYYY-MM-DD, sumar/restar un día, sin problemas de zona horaria — operar sobre el string o con Date UTC). Estilo acorde (botones con `var(--card)`/`var(--border)`, dorado el acento).

**Página (`page.tsx`):**
- `searchParams` (en Next 16 es Promise): `const sp = await searchParams; const dia = typeof sp.dia === "string" && sp.dia ? sp.dia : hoy;` (hoy = `hoyISO()`).
- Traer `cajas` (Caja[]) del `getDatosCambio` (Task 1). Calcular:
  - `const opsHastaDia = operaciones.filter((o) => o.fecha <= dia);`
  - `const opsDelDia = operaciones.filter((o) => o.fecha === dia);`
  - `const rd = resumenDelDia(operaciones, dia);`
  - `const saldosDia = saldosDeCajas(opsHastaDia, cajas);` (cajas al cierre del día)
  - `const stockUsdt = saldosDia.filter((s) => s.nombre.trim().toUpperCase() === "USDT").reduce((a, s) => a + s.saldo, 0);`
  - `const rankClientesDia = rankingClientes(opsDelDia);`
  - `const rankPersonasDia = rankingPersonas(opsDelDia);`
- Poné el `<SelectorDia dia={dia} />` arriba (después del encabezado), con un texto tipo "Mostrando: {dia formateado}" y, si `dia !== hoy`, un link "Volver a hoy".
- KPIs pasan a ser del día + acumulados:
  - Stock de dólares = `rd.stockUsd`; Stock de USDT = `stockUsdt`; Costo promedio = `rd.costoPromedio` (todos al cierre del día).
  - **Margen del día** = `rd.margenDia`; **Margen acumulado** = `rd.margenAcumulado`; **Comisiones del día** = `rd.comisionesDia`; **Volumen del día (pesos)** = `rd.volumenPesosDia`.
- **Cajas**: usar `saldosDia` (al cierre del día) en vez de los saldos de todo.
- **Margen por día**: dejar la sección como está (overview de todos los días) — es útil como navegación; opcional: que cada fila sea un `<Link href={'/cambio?dia=' + d.fecha}>` para saltar a ese día.
- **Tabla de operaciones**: pasar `opsDelDia` en vez de todas.
- **Por cliente / Por emisor y receptor**: usar `rankClientesDia` / `rankPersonasDia`.
- El botón "Nueva operación" y los demás no cambian. El formulario de alta sigue con fecha default hoy (o podría pre-cargar `dia`; no obligatorio en esta parte).
- Si `opsDelDia` está vacío, la tabla ya muestra su mensaje "Todavía no cargaste operaciones…"; está bien para un día sin movimientos.

- [ ] **Step 1:** Implementar selector + página. Verificar `tsc`, `lint`, `vitest run` (sin regresiones), `npm run build`.
- [ ] **Step 2: Commit** `feat(cambio): vista por día con selector de fecha`.

---

## Verificación final

- Revisión: los stocks/cajas/costo son al cierre del día (acumulativo, no del día); las operaciones/rankings/margen-del-día son solo del día; navegación de fechas anda; no se pasan funciones server→cliente; no se rompió el cálculo ni compra/venta/carga/canje.
- Suite verde, `tsc`/`lint` limpios, `build` OK.
- Merge + deploy (sin SQL). Probar: entrar (default hoy, lista del día), navegar a 28/07 (ver ese día), volver a hoy.
