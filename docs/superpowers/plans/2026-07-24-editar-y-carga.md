# Editar/eliminar + tipo "Carga de stock" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Sumar al módulo Cambio (1) un tercer tipo de operación "carga de stock propio" y (2) editar y eliminar operaciones, gestiones de runner y pagos de runner.

**Architecture:** El tipo `carga` se suma a `kind` y se comporta como una compra para el stock/costo pero sin mover la caja de pesos, sin cliente y sin margen. Editar/eliminar reutiliza los formularios existentes en modo edición + nuevas server actions update/delete; el cálculo es derivado, así que no hay recálculo manual.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase, Vitest.

## Global Constraints

- Server actions: resultado discriminado `type ResultadoAlta = { ok: true } | { ok: false; error: string }`; `revalidatePath(...)` en su propio try/catch; log `[cambio]`; SIN candado `tieneAccesoCompleto`; validar entradas antes de `createClient()`.
- Operaciones revalidan `"/cambio"`; runners revalidan `"/cambio/runners"`.
- Montos: `parsearMonto` (obligatorio, rechaza cero) y `parsearMontoOpcional` (acepta cero/vacío) de `@/lib/finanzas/montos`; salida con `formatearPesos` de `@/lib/formato`.
- `TipoOperacion = "compra" | "venta" | "carga"`. Una `carga`: suma stock, capitaliza costo `usd*tc`, margen 0, sin cliente/emisor/receptor, sin caja de pesos, caja USD +usd.
- El cálculo es derivado (`calcular` corre sobre todas las ops en cada render `force-dynamic`): editar/eliminar no requiere lógica de recálculo.
- Estilos inline con CSS variables; acento dorado; mobile-first (lápiz tocable en tarjetas). TDD donde hay lógica.

---

### Task 1: Tipo `carga` en el cálculo

**Files:** Modify `web/lib/cambio/tipos.ts`, `web/lib/cambio/calculo.ts`; Test `web/lib/cambio/calculo.test.ts`.

**Interfaces:** `TipoOperacion` suma `"carga"`. `calcular` trata `carga` como `compra` para stock/costo; `margen` = 0.

- [ ] **Step 1: Test.** En `calculo.test.ts` agregar casos: (a) una `carga` de 100 USD a tc 1000 deja `stock=100`, `costoPromedio=1000`, `margen=0`, `costoTotal=100000`; (b) tras esa carga, una `venta` de 100 a 1200 da `margen = 100*1200 - 100*1000 = 20000`; (c) `carga` no genera margen (margen 0). Usar el patrón `opcionNueva`/helpers ya presentes en el archivo. Correr y ver que fallan.
- [ ] **Step 2: tipos.ts.** `export type TipoOperacion = "compra" | "venta" | "carga";`
- [ ] **Step 3: calculo.ts.** Cambiar `if (op.tipo === "compra")` por `if (op.tipo === "compra" || op.tipo === "carga")`. El `else` sigue siendo la venta. Nada más cambia (margen queda 0 en esa rama).
- [ ] **Step 4:** Correr `npx vitest run lib/cambio/calculo.test.ts` (verde) + `npx tsc --noEmit`.
- [ ] **Step 5: Commit** `feat(cambio): tipo carga de stock en el cálculo`.

---

### Task 2: `carga` en cajas y rankings

**Files:** Modify `web/lib/cambio/reportes.ts`; Test `web/lib/cambio/reportes.test.ts`.

- [ ] **Step 1: Test.** Agregar: (a) `saldosDeCajas` — una `carga` con `cajaUsdId=U` suma +usd a la caja U y NO mueve ninguna caja ARS; (b) `rankingClientes` ignora las cargas (no aparecen como comprado/vendido ni suman fila); (c) `resumir` — `volumenUsd` NO cuenta las cargas, pero `stockUsd` sí las refleja. Correr y ver que fallan.
- [ ] **Step 2: reportes.ts — `saldosDeCajas`.** Rama USD: `movimientos += (op.tipo === "compra" || op.tipo === "carga") ? op.usd : -op.usd;`. Rama ARS: `movimientos += (op.tipo === "venta" ? op.ars : op.tipo === "compra" ? -op.ars : 0) - op.costos;` (carga → 0; igual una carga no lleva `cajaArsId`).
- [ ] **Step 3: reportes.ts — `rankingClientes`.** Al inicio del `for`: `if (op.tipo === "carga") continue;`.
- [ ] **Step 4: reportes.ts — `resumir`.** `volumenUsd: ops.filter((o) => o.tipo !== "carga").reduce((s, o) => s + o.usd, 0),`.
- [ ] **Step 5:** `npx vitest run lib/cambio/reportes.test.ts` + `tsc`.
- [ ] **Step 6: Commit** `feat(cambio): carga no mueve pesos ni cuenta como volumen/cliente`.

---

### Task 3: `carga` en datos y Excel

**Files:** Modify `web/lib/cambio/datos.ts`, `web/lib/cambio/excel.ts`; Test según exista `excel.test.ts` (si no hay, agregar aserción mínima en un test nuevo pequeño o extender uno existente).

- [ ] **Step 1: datos.ts.** El array `const TIPOS: TipoOperacion[] = ["compra", "venta"];` pasa a incluir `"carga"`. Así `unaDe("tipo", TIPOS, ...)` no manda `carga` a un default.
- [ ] **Step 2: excel.ts.** Donde se muestra el tipo (hoy "COMPRA"/"VENTA"), agregar `carga → "CARGA"`. Leé el archivo para ver la forma exacta (probablemente `o.tipo === "compra" ? "COMPRA" : "VENTA"`; pasarlo a un map de los tres).
- [ ] **Step 3:** `npx vitest run` + `tsc` + `lint`.
- [ ] **Step 4: Commit** `feat(cambio): carga en la lectura y la exportación`.

---

### Task 4: Tipo "CARGA" en el formulario de alta

**Files:** Modify `web/components/cambio/nueva-operacion-form.tsx`.

Leé el archivo entero primero. Agregar un tercer botón de tipo **CARGA** (subtítulo "dólares propios al stock"). Estado `tipo` ya es `TipoOperacion`. Cuando `tipo === "carga"`:
- Ocultar los combos de **cliente**, **emisor**, **receptor**, el select de **caja de pesos** y el campo **costos**.
- Fijar `moneda` en `"USD"` (no mostrar el select de moneda, o mostrarlo deshabilitado en USD). Label del monto → "Dólares a cargar"; label del TC → "Costo por dólar".
- Mantener: fecha, **caja de dólares**, comprobante, notas.
- En el `action`: además de lo actual, cuando es carga, `formData.set("amountCurrency","USD")` y asegurarse de NO mandar cliente/emisor/receptor/arsAccountId (dejarlos vacíos). `kind` ya sale de `tipo`.
- El preview de importes: ocultarlo en carga (o mostrar uno propio). No es obligatorio.

Sin tests (componente). Verificar `tsc`, `lint`, `vitest run` (sin regresiones). Probar mentalmente que compra/venta siguen igual.

- [ ] **Step 1:** Implementar los campos condicionales.
- [ ] **Step 2:** `tsc` + `lint` + `vitest run`.
- [ ] **Step 3: Commit** `feat(cambio): tipo CARGA en el formulario de operación`.

---

### Task 5: Server actions editar/eliminar operación

**Files:** Modify `web/app/(app)/cambio/actions.ts`; Test `web/app/(app)/cambio/actions.test.ts`.

Leé `actions.ts` (molde: `createExchangeOp`). Producir:
- `updateExchangeOp(opId: string, formData: FormData): Promise<ResultadoAlta>` — valida `opId` no vacío antes de la base; arma el mismo objeto de campos que el insert de `createExchangeOp` (incluye `kind`, `comprobante_path`, `amount`, `amount_currency`, `rate`, `client_id`, `sender`, `receiver`, `ars_account_id`, `usd_account_id`, `fees`, `notes`, `op_date`) y hace `update(campos).eq("id", opId)`.
- `deleteExchangeOp(opId: string): Promise<ResultadoAlta>` — valida `opId`; `delete().eq("id", opId)`.
Ambas: resultado discriminado, `revalidatePath("/cambio")` aislado, log `[cambio]`, sin candado.

- [ ] **Step 1: Test** (mock supabase como en el archivo): `updateExchangeOp` actualiza `exchange_ops` por `id` con los campos; rechaza `opId` vacío sin tocar la base; `revalidatePath` que falla no tumba el update. `deleteExchangeOp` borra por `id`; rechaza `opId` vacío. Correr y ver que fallan.
- [ ] **Step 2:** Implementar.
- [ ] **Step 3:** `npx vitest run "app/(app)/cambio/actions.test.ts"` + `tsc` + `lint`.
- [ ] **Step 4: Commit** `feat(cambio): actions updateExchangeOp y deleteExchangeOp`.

---

### Task 6: Formulario de operación reutilizable (crear/editar) + Eliminar + ComboAlta valorInicial

**Files:** Modify `web/components/cambio/combo-alta.tsx`, `web/components/cambio/nueva-operacion-form.tsx`.

- [ ] **Step 1: ComboAlta.** Sumar prop opcional `valorInicial?: { value: string; nombre: string }`. Inicializar `sel` y `texto` con ese valor si viene (`useState(() => valorInicial ?? null)` / `useState(valorInicial?.nombre ?? "")`). No rompe el uso actual (sin la prop, comportamiento idéntico).
- [ ] **Step 2: OperacionForm.** Extraer el modal+form de `NuevaOperacionButton` a un componente exportado `OperacionForm` con props: `clientes`, `personas`, `cajas`, `modo: "crear" | "editar"`, `operacion?: OperacionCalculada` (o el tipo `Operacion`), `abierto`, `onCerrar`. En `crear` llama `createExchangeOp`; en `editar` precarga TODO el estado desde `operacion` (tipo, moneda, monto→string, tc→string, comprobante, cajas, notas, costos, y los combos con `valorInicial`) y llama `updateExchangeOp(operacion.id, formData)`. En `editar` muestra además un botón **Eliminar** (rojo) que, tras `window.confirm("¿Eliminar esta operación?")`, llama `deleteExchangeOp(operacion.id)` y cierra si `ok`. `NuevaOperacionButton` pasa a renderizar su botón + `OperacionForm modo="crear"`.
- [ ] **Step 3:** `tsc` + `lint` + `vitest run` (sin regresiones). Verificar que el alta sigue funcionando igual (mismos names de formData).
- [ ] **Step 4: Commit** `feat(cambio): formulario de operación reutilizable para editar y eliminar`.

---

### Task 7: Lápiz de edición en la tabla de operaciones

**Files:** Modify `web/components/cambio/tabla-operaciones.tsx`.

Leé el archivo (tiene doble render `.ops-cards` / `.ops-tabla`). Sumar en cada fila (tabla) y en cada tarjeta (celular) un botón **lápiz** (icono ✏️ o de lucide `Pencil`) que abre `OperacionForm modo="editar"` con esa operación. Manejar el estado de "qué operación se está editando" en el componente (client). El form necesita `clientes`, `personas`, `cajas` — pasarlos como props nuevas a `TablaOperaciones` desde `page.tsx` (que ya los tiene cargados). El lápiz debe ser cómodo de tocar en el celular.

- [ ] **Step 1:** Implementar el lápiz + estado + pasar props desde `page.tsx`.
- [ ] **Step 2:** `tsc` + `lint` + `vitest run` + `npm run build`.
- [ ] **Step 3: Commit** `feat(cambio): lápiz para editar/eliminar operaciones desde la tabla`.

---

### Task 8: Server actions editar/eliminar gestión y pago de runner

**Files:** Modify `web/app/(app)/cambio/runners-actions.ts`; Test `web/app/(app)/cambio/runners-actions.test.ts`.

Leé `runners-actions.ts` (moldes: `createRunnerGestion`, `createRunnerPayment`). Producir:
- `updateRunnerGestion(id, formData)` y `deleteRunnerGestion(id)`.
- `updateRunnerPayment(id, formData)` y `deleteRunnerPayment(id)`.
Mismos campos que el alta respectiva; update por `id` / delete por `id`; `fee` con `parsearMontoOpcional`, `amount` de pago con `parsearMonto`; validar `id` vacío antes de la base; contrato estándar, `revalidatePath("/cambio/runners")` aislado.

- [ ] **Step 1: Test** (mismos patrones que el alta): update escribe la tabla correcta por id; delete borra por id; rechazan id vacío sin tocar la base; revalidate aislado. Correr y ver que fallan.
- [ ] **Step 2:** Implementar.
- [ ] **Step 3:** `npx vitest run "app/(app)/cambio/runners-actions.test.ts"` + `tsc` + `lint`.
- [ ] **Step 4: Commit** `feat(cambio): actions update/delete de gestiones y pagos de runner`.

---

### Task 9: Editar/eliminar en la UI de runners

**Files:** Modify `web/components/cambio/runner-forms.tsx`, `web/components/cambio/runners-historial.tsx`.

- [ ] **Step 1: runner-forms.** Parametrizar `NuevaGestionButton` y `RegistrarPagoButton` (o extraer sus modales a cuerpos reutilizables) para soportar `modo: "crear" | "editar"` + valor inicial. En editar llaman `updateRunnerGestion`/`updateRunnerPayment` y muestran **Eliminar** (con `confirm`) que llama `deleteRunnerGestion`/`deleteRunnerPayment`. Exportar `EditarGestionButton`/`EditarPagoButton` (o un modo del existente) que reciban la gestión/pago inicial + `runners`/`cuentas`.
- [ ] **Step 2: runners-historial.** En cada fila de gestión y de pago (tabla y tarjeta) sumar el **lápiz** que abre el editar correspondiente. Pasar `runners`/`cuentas` como props desde `runners/page.tsx`.
- [ ] **Step 3:** `tsc` + `lint` + `vitest run` + `npm run build`.
- [ ] **Step 4: Commit** `feat(cambio): editar/eliminar gestiones y pagos de runner`.

---

## Verificación final

- Revisión de rama completa (Opus) antes de mergear: confirmar que **el cálculo sigue derivado y correcto** (carga suma stock a costo, no mueve pesos, no da margen; editar/eliminar recomputan solo), que las actions no tocan tablas equivocadas ni borran de más, y que el alta de operación no se rompió.
- Suite verde, `tsc`/`lint` limpios, `npm run build` OK.
- Merge a master + deploy Vercel. Probar en navegador: cargar stock propio, editar una operación, eliminar una, y lo mismo en una gestión/pago de runner.
