# Editar/eliminar cargas + tipo "Carga de stock propio" — módulo Cambio

**Fecha:** 2026-07-24
**Estado:** diseño aprobado

## Problema

Dos huecos operativos en la caja:
1. **No se puede corregir nada.** Una operación (o una gestión/pago de runner)
   cargada con un error queda así hasta tocar la base. Falta editar y eliminar.
2. **Falta cargar dólares propios.** El usuario a veces mete al stock **dólares
   físicos que ya son suyos** (no una compra a un cliente). Hoy solo hay
   compra/venta.

## Parte A — Tipo de operación "Carga de stock propio"

Se agrega un tercer `kind`: **`carga`** (además de `compra` y `venta`).

**Qué es:** meter dólares propios al stock, a un costo que el usuario define.

**Reglas (decididas):**
- Suma USD al **stock**, igual que una compra.
- Entra al **costo promedio** a un **costo por dólar (TC)** que el usuario
  escribe. Es decir: se capitaliza `usd × tc` como costo, como una compra.
- **No mueve la caja de pesos** (no se pagaron pesos: son dólares propios).
- Entra a la **caja de dólares** que se elija (+usd).
- **No genera margen** (no es una venta).
- **Sin cliente, sin emisor/receptor.**

### Cálculo (`lib/cambio/calculo.ts`)

- La rama que hoy corre para `compra` (sumar al stock + capitalizar costo)
  corre también para `carga`: `if (op.tipo === "compra" || op.tipo === "carga")`.
  El manejo de stock negativo (cubrir descubierto) aplica igual. `margen`
  queda en 0. Nada más cambia en `calcular`.

### Cajas y rankings (`lib/cambio/reportes.ts`)

- `saldosDeCajas`: la caja USD suma `+usd` para `carga` (igual que compra):
  `op.tipo === "compra" || op.tipo === "carga" ? +usd : -usd`. La caja de pesos
  **no se toca** en una carga: el movimiento ARS es `venta → +ars`,
  `compra → −ars`, `carga → 0` (y una carga no lleva `cajaArsId`, así que ya
  queda excluida; se explicita igual por robustez).
- `rankingClientes`: **saltear las cargas** (`if (op.tipo === "carga") continue;`).
  No tienen cliente ni son un trade; no deben contar como comprado/vendido.
- `rankingPersonas`: sin cambios (una carga no lleva emisor/receptor; los
  nombres vacíos ya se ignoran).
- `resumir`: `volumenUsd` **excluye las cargas** (no es volumen operado). El
  `stockUsd`, `costoPromedio` y márgenes salen del cálculo y ya reflejan la
  carga correctamente.

### Datos y export

- `lib/cambio/tipos.ts`: `TipoOperacion = "compra" | "venta" | "carga"`.
- `lib/cambio/datos.ts`: el array `TIPOS` incluye `"carga"` (para que el
  validador `unaDe` no lo tire a un default).
- `lib/cambio/excel.ts`: la columna "Tipo" muestra **"CARGA"** para `carga`.

### Formulario (`components/cambio/nueva-operacion-form.tsx`)

Se agrega un tercer botón de tipo: **"CARGA"** (subtítulo "dólares propios al
stock"). Cuando el tipo es `carga`:
- Se ocultan **cliente**, **emisor**, **receptor**, **caja de pesos** y
  **costos**.
- **Moneda fija en USD** (son dólares físicos). El campo "Monto" es "Dólares a
  cargar"; "TC" pasa a "Costo por dólar".
- Se mantienen: fecha, **caja de dólares**, comprobante (opcional), notas.
- Al enviar: `kind="carga"`, `amountCurrency="USD"`, `clientId`/`sender`/
  `receiver`/`arsAccountId` vacíos, `usdAccountId` con la caja elegida.

El preview "Entregás/Recibís" no aplica a la carga (se puede mostrar uno propio:
"Cargás USD X a un costo de $ Y" o simplemente ocultarlo).

## Parte B — Editar y eliminar

Un **lápiz** por fila que abre la carga para corregirla, con un botón
**Eliminar** adentro (con confirmación). Aplica a: **operaciones**,
**gestiones de runner** y **pagos de runner**.

### Operaciones

**Server actions** (`app/(app)/cambio/actions.ts`):
- `updateExchangeOp(opId, formData)`: mismos campos que `createExchangeOp`
  (incluye `kind` con el nuevo `carga`, `comprobante_path`), `update(...).eq("id", opId)`.
  Resultado discriminado, `revalidatePath("/cambio")` aislado, log `[cambio]`,
  sin candado `tieneAccesoCompleto`.
- `deleteExchangeOp(opId)`: `delete().eq("id", opId)`. Mismo contrato.

**UI:** el formulario de operación se vuelve **reutilizable** (crear y editar):
- Se extrae el modal+form de `nueva-operacion-form.tsx` a un componente
  `OperacionForm` que recibe `modo: "crear" | "editar"` y, en editar, la
  `operacion` inicial. En crear llama `createExchangeOp`; en editar,
  `updateExchangeOp` y muestra **Eliminar** (llama `deleteExchangeOp` tras un
  `confirm()`), que cierra al borrar.
- `ComboAlta` suma una prop opcional `valorInicial?: { value: string; nombre: string }`
  para precargar cliente/emisor/receptor al editar.
- En la tabla de operaciones (`tabla-operaciones.tsx`), cada fila (tabla y
  tarjeta) suma un **lápiz** que abre `OperacionForm` en modo editar con esa
  operación. `NuevaOperacionButton` sigue existiendo para el alta.

**Recálculo:** editar/eliminar no necesita lógica extra de recálculo: el costo
promedio, el stock y el margen son **derivados** (`calcular` corre sobre todas
las operaciones en cada carga de la página, que es `force-dynamic`). Corregir
un dato y revalidar recompone todo solo.

### Gestiones y pagos de runner

**Server actions** (`app/(app)/cambio/runners-actions.ts`):
- `updateRunnerGestion(id, formData)`, `deleteRunnerGestion(id)`.
- `updateRunnerPayment(id, formData)`, `deleteRunnerPayment(id)`.
  Mismo contrato (discriminado, `revalidatePath("/cambio/runners")` aislado,
  log `[cambio]`, sin candado; `fee`/`amount` con las mismas reglas de cero que
  el alta).

**UI:** los modales de `runner-forms.tsx` (`NuevaGestionButton`,
`RegistrarPagoButton`) se parametrizan con `modo` + valor inicial (o se agregan
`EditarGestionButton`/`EditarPagoButton` que reusan el mismo cuerpo). En el
historial (`runners-historial.tsx`) cada fila de gestión y de pago suma un
**lápiz** que abre el modal en editar, con **Eliminar** adentro.

## Lo que no cambia

- El motor de cálculo sigue siendo derivado; editar/eliminar no agrega estado.
- Las tablas y columnas existentes; la carga solo agrega un valor de `kind`.
- RLS y acceso (todo sigue `authenticated`, tier cambio, sin candado en las
  nuevas actions).

## Fuera de alcance

- Historial/auditoría de cambios (quién editó qué). Se puede sumar después.
- Editar cuentas de gestión de runner o cajas (esas se tocan poco; sigue por
  base si hace falta).
- Deshacer (undo) una eliminación. La confirmación (`confirm()`) es la red.

## Convenciones

- Server actions con resultado discriminado y `revalidatePath` aislado, log
  `[cambio]`, sin `tieneAccesoCompleto`.
- Montos con `parsearMonto`/`parsearMontoOpcional` y `formatearPesos`.
- Estilos inline con CSS variables; acento dorado; mobile-first (lápiz visible y
  tocable en las tarjetas del celular).
- TDD en `calculo.ts`, `reportes.ts`, `excel.ts` y las server actions.
