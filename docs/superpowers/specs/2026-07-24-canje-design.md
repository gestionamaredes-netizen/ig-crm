# Canje entre formas — módulo Cambio

**Fecha:** 2026-07-24
**Estado:** diseño aprobado

## Problema

Gestiones MA a veces cambia una **forma de dinero por otra** sin que haya pesos
de por medio: ej. recibe **USDT** y entrega **USD físico** (cambio cripto↔billete).
Hoy solo existen compra/venta (pesos↔dólares) y carga (inyección de un lado).
Forzar esto como una VENTA lo deja al revés (el USDT queda en negativo, se
inventa una venta de pesos y un margen falso).

## Decisión

Un tercer-y-medio tipo de operación: **`canje`**. El usuario elige QUÉ RECIBE
(forma + monto) y QUÉ ENTREGA (forma + monto). El sistema mueve las dos formas
(la que recibe sube, la que entrega baja) y **no toca el cálculo de trading**:
sin margen, sin costo promedio, sin stock de dólares del cálculo. El billete y
el USDT tienen precios distintos, así que un canje es cambiar de forma, no una
ganancia/pérdida operando (opción B confirmada por el usuario).

## Modelo de datos

`exchange_ops` suma cuatro columnas nullable (solo se usan cuando `kind='canje'`):

| Columna | Tipo | Notas |
|---|---|---|
| `canje_in_account` | uuid FK exchange_accounts on delete set null | forma que se RECIBE |
| `canje_in_amount` | numeric default 0 | monto recibido |
| `canje_out_account` | uuid FK exchange_accounts on delete set null | forma que se ENTREGA |
| `canje_out_amount` | numeric default 0 | monto entregado |

`kind` pasa a poder valer `compra | venta | carga | canje`. En un canje,
`amount`/`rate`/`ars_account_id`/`usd_account_id`/`client_id`/`sender`/`receiver`
quedan neutros (amount 0, rate 1, cuentas null) — no participan.

## Cálculo y saldos

- `calculo.ts`: un `canje` NO participa del cálculo de stock/costo/margen. Se
  arrastra con `margen 0`, `usd 0`, `ars 0`, stock/costoTotal sin cambios (igual
  que una fila neutra). No entra a ninguna rama de compra/venta/carga.
- `reportes.ts`:
  - `saldosDeCajas`: para un `canje`, la caja `canje_in_account` suma
    `+canje_in_amount` y la caja `canje_out_account` resta `-canje_out_amount`.
    (Independiente de la moneda de cada caja: se mueve la forma tal cual.)
  - `rankingClientes`, `rankingPersonas`, `resumir` (`volumenUsd`,
    `operaciones`): el canje se **excluye** (no es trading; no cuenta como
    volumen ni margen ni cliente). Se puede contar en `operaciones` o no —
    fuera de alcance discutirlo; por ahora se excluye de todo lo de trading.

**Consecuencia buscada:** el canje mueve solo las CAJAS (composición). El "Stock
de dólares" del cálculo y el margen no se tocan. El "Stock de USDT" (saldo de la
caja USDT) y los saldos reflejan el cambio de forma.

## Interfaz

### Formulario (`nueva-operacion-form.tsx`)

Cuarto botón de tipo: **CANJE** (subtítulo "cambio entre formas"). Cuando
`tipo === "canje"`:
- Ocultar: caja de pesos/dólares (los selects de compra/venta), TC, moneda,
  costos, el preview de importes.
- Mostrar: **Recibo** (select de forma `canjeInAccount` + monto `canjeInMonto`)
  y **Entrego** (select de forma `canjeOutAccount` + monto `canjeOutMonto`).
  Ambos selects listan TODAS las formas (pesos y dólares) agrupadas.
- Cliente/emisor/receptor: opcionales (se pueden dejar, útil para saber con
  quién se hizo). Comprobante y notas: se mantienen.
- Fecha: se mantiene.

### Tabla de operaciones (`tabla-operaciones.tsx`)

Badge **CANJE**. En vez de USD/Pesos/TC/Margen, la fila de un canje muestra el
movimiento: "Recibió {inMonto} {formaIn} · Entregó {outMonto} {formaOut}".
Simplificado para no romper las columnas (se puede poner el resumen en la celda
de Emisor→Receptor o en Cliente; el resto en "—").

### Server actions (`actions.ts`)

`camposDeOperacion` suma los 4 campos de canje (parseo de montos con
`parsearMontoOpcional`, cuentas string o null). `createExchangeOp`/
`updateExchangeOp` los guardan. Sin candado, contrato estándar.

## Lo que no cambia

Compra, venta, carga: idénticas. El cálculo de trading (stock de dólares, costo
promedio, margen, comisiones) no cambia — el canje simplemente no participa.

## Fuera de alcance (v1)

- USDT como activo separado con su propio costo promedio y precio (sería el
  modelo completo; por ahora el canje solo mueve cajas).
- Reconciliación exacta entre el "stock de dólares" del cálculo y la suma de
  cajas de dólares cuando un canje mueve entre formas de distinto precio (queda
  una pequeña diferencia por el spread billete/USDT; se documenta).
- Editar el tipo de una operación existente de/hacia canje (se puede, es el mismo
  form en modo editar, pero los campos de canje solo se precargan si ya era canje).

## Convenciones

- SQL idempotente `lib/db/sql/2026-07-24-canje.sql` (4 columnas nuevas).
- Server actions contrato estándar; `parsearMontoOpcional` para montos de canje.
- Estilos inline con CSS variables; mobile-first; el form en `campo-fila`.
- TDD en calculo/reportes/actions.
