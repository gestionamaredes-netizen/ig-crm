# Cobros — Diseño

Fecha: 2026-07-27
Estado: aprobado, en implementación

## Problema

Iniciativa Global (agencia de marketing audiovisual de Fabricio + Marcelo) necesita controlar,
por cliente, cuánto factura, cuánto cuesta producir, cómo se reparte la ganancia entre los dos
socios, y cuánto le pagaron vs cuánto debe. Hoy no vive en ningún lado. Segmento nuevo del CRM,
separado del embudo comercial (es control interno de la agencia, no clientes del funnel de las 4
empresas).

## Regla de reparto (el corazón del módulo)

```
Total facturado
  − Costos de producción (filmaker, viáticos, terceros)   ← se cargan como líneas
  = Ganancia
      → Marcelo:  30% de la ganancia   (automático)
      → Fabricio: 70% de la ganancia   (automático)
```

El trabajo de Fabricio (edición, operar cámara) **no es un costo**: su pago ES el 70% de la
ganancia. Sólo se cargan como costo los terceros (filmaker, viáticos, etc.). El 30/70 es fijo
("Marcelo siempre el 30%"); se deja como constante única para cambiarlo en un solo lugar si algún
día se renegocia.

Ejemplos reales:
- **BELLAVISTA CERRAMIENTOS:** facturado $100.000, costos $0 → ganancia $100.000 → Marcelo $30.000,
  Fabricio $70.000.
- **UPGRADE DETAILING (mensual):** facturado $350.000, costos filmaker $90.000 + viáticos $10.000 =
  $100.000 → ganancia $250.000 → Marcelo $75.000, Fabricio $175.000.

## Modelo de datos

Cuatro tablas nuevas, prefijo `cobros_`:

- **`cobros_clientes`**: `nombre`, `tipo` (`unico` | `mensual`), `notas`.
- **`cobros`**: `cliente_id`, `concepto`, `total` (facturado), `fecha`.
- **`cobros_costos`**: `cobro_id`, `concepto`, `monto` — líneas de costo de producción (terceros).
- **`cobros_pagos`**: `cobro_id`, `monto`, `fecha`, `medio` (PREX/efectivo/transferencia…),
  `cuenta` (dónde cayó, ej. "Fabricio · PREX").

Nada se guarda calculado. Ganancia, reparto y saldo se computan al leer.

## Cálculo (lib/cobros, funciones puras + tests)

```
costosTotal = Σ costos.monto
ganancia    = total − costosTotal
marcelo     = ganancia × 0.30
fabricio    = ganancia × 0.70
pagado      = Σ pagos.monto
saldo       = total − pagado
```

Casos borde testeados: costos = 0 (ganancia = total); costos > total (ganancia negativa → se muestra
como pérdida, no se esconde); sin pagos (saldo = total); pago mayor al total (saldo negativo = pagó
de más, se muestra). Reusa el parseo de montos a la argentina de `lib/finanzas/montos.ts`.

## Interfaz

Sección nueva **"Cobros"** en el sidebar (acceso completo, gateada con `tieneAccesoCompleto`).

- **`/cobros`** — lista de clientes: nombre, tipo, total facturado, ganancia, **saldo pendiente**
  (destacado), ordenada por saldo desc. Botón "Nuevo cliente".
- **`/cobros/[id]`** — detalle del cliente: sus cobros; cada cobro muestra total · ganancia ·
  Marcelo · Fabricio · pagado · **saldo**, con sus costos y pagos. Alta de cobro; alta/edición/borrado
  de costos y de pagos (borrar pide confirmación — es plata).

Mensual (UPGRADE): se carga cada mes a mano, clonando el anterior (opción A del brainstorming). Sin
generación automática en la v1.

## Server actions

Todas gateadas con `tieneAccesoCompleto()` (mismo candado que marketing/finanzas): crear cliente,
crear cobro, agregar/editar/borrar costo, agregar/editar/borrar pago. Montos parseados con el parser
AR. Revalidan `/cobros` y `/dashboard`.

## Fuera de alcance v1

- Generación automática de los cobros mensuales.
- Facturas/comprobantes formales (AFIP).
- Vincular estos clientes con el embudo comercial (es un segmento aparte a propósito).
- Reparto configurable por cliente (hoy 30/70 fijo para todos).
