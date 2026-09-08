# Cambio USD — compra y venta de dólares (GESTIONES MA)

**Fecha:** 2026-07-22
**Estado:** diseño aprobado

## Problema

GESTIONES MA opera compra y venta de dólares con terceros. Necesita registrar cada
operación y saber, en cualquier momento: cuántos dólares tiene en stock, a qué costo
promedio los consiguió, cuánto margen genera cada venta, cuánto hay en cada caja, y qué
volumen mueve cada cliente.

Se construyó primero como planilla (`GESTIONES MA/FINANZAS/Cambio-USD.xlsx`). El modelo de
datos y el cálculo quedaron validados contra operaciones reales, pero la planilla resultó
frágil en el uso diario:

- El costo promedio se calcula en cadena fila a fila, así que **las filas deben estar
  ordenadas por fecha**. Cargar una operación de ayer rompe todos los números de abajo.
- Al importarla a Google Drive se rompió entera: validaciones que rechazan valores válidos,
  desplegables que desaparecen, errores `#REF`/`#NAME` y cálculos incorrectos.
- Es fácil pisar una celda con fórmula y romper el cálculo sin darse cuenta.

## Decisión

Construirlo como **módulo de IG OS** (`/cambio`), no como planilla ni como página en el
sitio público de Gestiones MA.

Motivos: los datos son internos (caja, márgenes, clientes); IG OS ya tiene auth por magic
link, Supabase, RLS y deploy en Vercel; y es el centro de operaciones de las 4 empresas del
grupo. Se expondrá bajo un subdominio de `gestionesma.store`.

## Modelo de datos

Heredado de la planilla, ya probado contra operaciones reales.

### `exchange_ops` — una fila por movimiento

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `company_id` | uuid FK `companies` | GESTIONES MA |
| `op_date` | date | |
| `kind` | text | `compra` \| `venta` |
| `client_id` | uuid FK `exchange_clients` | la cuenta comercial |
| `sender` | text | quien envía los fondos |
| `receiver` | text | quien los recibe |
| `amount` | numeric | **un solo importe**, el que el usuario conoce |
| `amount_currency` | text | `ARS` \| `USD` — en qué moneda está `amount` |
| `rate` | numeric | tipo de cambio, pesos por dólar |
| `ars_account_id` | uuid FK `exchange_accounts` | caja de pesos |
| `usd_account_id` | uuid FK `exchange_accounts` | caja de dólares |
| `fees` | numeric default 0 | comisiones, cable, red |
| `notes` | text default `''` | |
| `created_at` | timestamptz | |

`usd` y `ars` **no se guardan**: se derivan de `amount` + `amount_currency` + `rate`.
Guardar los tres sería redundante y permitiría estados inconsistentes.

### `exchange_clients` y `exchange_accounts`

`exchange_clients`: `id`, `company_id`, `name`, `active`.

`exchange_accounts`: `id`, `company_id`, `name`, `currency` (`ARS` \| `USD`),
`opening_balance` numeric default 0, `adjustment` numeric default 0, `active`.

`adjustment` existe para cuando el conteo físico no coincide: la diferencia se registra
ahí en vez de alterar operaciones, y queda visible.

### Emisor y receptor

Son **texto libre**, no una tabla. Un cliente tiene varios emisores y receptores, muchos
aparecen una sola vez, y forzar un alta previa fue un obstáculo real en la planilla. El
ranking por persona se arma agrupando por nombre.

El **margen se atribuye al cliente**, nunca al emisor ni al receptor: es de la relación
comercial.

## Cálculo

**Costo promedio ponderado móvil.** Cada compra recalcula el costo promedio del stock;
cada venta descarga a ese costo.

```
compra:  stock += usd
         costo_total += ars + fees
venta:   margen = ars - usd * costo_promedio_previo - fees
         costo_total -= usd * costo_promedio_previo
         stock -= usd
costo_promedio = costo_total / stock
```

Los costos se capitalizan en las compras y se restan del margen en las ventas.

Vive en `lib/cambio/calculo.ts` como **función pura sobre la lista ordenada de
operaciones**, con tests. Diferencia clave con la planilla: la app ordena por fecha antes
de calcular, así que el orden de carga deja de importar.

Caso de referencia para los tests (números ya verificados con el usuario):

| # | Tipo | Monto | Moneda | TC | USD | Pesos | Costo prom. | Margen |
|---|---|---|---|---|---|---|---|---|
| 1 | compra | 1.000 | USD | 1.400 | 1.000,00 | 1.400.000 | 1.400,00 | — |
| 2 | compra | 730.000 | ARS | 1.460 | 500,00 | 730.000 | 1.420,00 | — |
| 3 | venta | 800 | USD | 1.480 | 800,00 | 1.184.000 | 1.420,00 | 43.000 (con 5.000 de costos) |
| 4 | venta | 452.500 | ARS | 1.520 | 297,70 | 452.500 | 1.420,00 | 29.769,74 |

Stock final 402,30 USD · costo total $571.269,74 · margen acumulado $72.769,74.

## Pantallas

**`/cambio`** — una sola pantalla:

- Panel superior: stock USD, costo promedio, margen del mes, saldo de cada caja.
- Botón **Nueva operación**.
- Tabla de operaciones, más recientes primero, con USD, pesos y margen por fila.

**Formulario** (modal, siguiendo el patrón de `/finanzas`):

- Compra / Venta como dos botones grandes, no un desplegable.
- Cliente (select) · Emisor · Receptor (texto libre).
- Monto + Moneda + TC, **con USD y pesos calculados en vivo mientras se escribe**. Este es
  el punto que más fricción causó en la planilla: el usuario a veces conoce el importe en
  pesos y a veces en dólares, y no debe tener que dividir a mano nunca.
- Caja de pesos · Caja de dólares · Costos · Notas.

**Reportes**, en la misma pantalla más abajo: ranking por cliente (volumen, margen, TC
promedio) y por persona (volumen como emisor y como receptor).

## Exportar a Excel

Botón **Descargar Excel** en la pantalla, que pega a un route handler
`app/(app)/cambio/export/route.ts` y devuelve un `.xlsx`.

**Valores, no fórmulas.** El archivo lleva los importes ya calculados: USD, pesos, costo
promedio, margen y stock de cada fila. Es una foto para archivar o mandarle al contador,
no un mecanismo que se pueda romper al moverlo entre programas — que es exactamente lo que
falló con la planilla original.

Hojas:

- **Operaciones** — una fila por movimiento, en orden de fecha, con las columnas derivadas.
- **Clientes** — volumen, margen y TC promedio por cliente.
- **Personas** — volumen por emisor y receptor.
- **Cajas** — saldo de cada caja.
- **Resumen** — stock, costo promedio, margen del período.

Se exporta todo el histórico. Filtrar por rango de fechas queda para más adelante.

Requiere una dependencia nueva (`exceljs`), la primera del proyecto para esto. El route
handler corre en `runtime = "nodejs"`, como el de `dolar-cripto` en el sitio de Gestiones MA.

## Fuera de alcance

- **Cuentas corrientes de clientes** (saldos a favor / deudas). Se evaluará cuando empiece
  a operar fiado.
- **Monedas además de USD.**
- **Edición y borrado de operaciones** en la primera entrega: se carga y se lista. Corregir
  un error requerirá tocar la base. Se agrega en la siguiente iteración.
- Migración automática desde el Excel: al momento de esta decisión la planilla no tiene
  datos reales cargados.
- **Importar** un Excel para cargar operaciones en lote. La exportación es de una sola vía.

## Convenciones a seguir

Las del proyecto, documentadas en `docs/superpowers/specs/2026-07-13-ig-os-design.md` y
visibles en el módulo `finanzas`:

- SQL crudo idempotente en `lib/db/sql/2026-07-22-cambio.sql`, corrido a mano en Supabase,
  con RLS `auth_all_<tabla>`.
- Lectura por `createClient()` de `@/lib/supabase/server`, nunca Drizzle en runtime.
- `lib/cambio/tipos.ts` (dominio en español) · `datos.ts` (getters + mapper) ·
  `calculo.ts` (lógica pura, testeada).
- Server actions con `ResultadoAlta` discriminado y `revalidatePath` en su propio try/catch.
- Estilos inline con las CSS variables de `globals.css`.
- Entrada nueva en el array `nav` de `components/shell/sidebar.tsx`, y sacar la clave del
  mapa `titles` de `app/(app)/[section]/page.tsx`.
