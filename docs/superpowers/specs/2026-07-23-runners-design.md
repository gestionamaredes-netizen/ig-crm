# Runners (gestiones y pagos) — módulo Cambio

**Fecha:** 2026-07-23
**Estado:** diseño aprobado

## Problema

Gestiones MA tiene personas de logística —los **runners** (Owen, Zurdo, Capi)—
que hacen "gestiones": van a **retirar** dólar billete de un cajero o de una
casa de cambios, o hacen **transferencias** de pesos/dólares entre cuentas. Hoy
no hay dónde registrar eso ni cuánto se les debe. Se les paga **por gestión
hecha**, y el monto **depende de la cuenta** usada. Hace falta llevar la cuenta
de qué hizo cada uno y cuánto se le debe.

## Decisión

Un subsistema propio dentro de `/cambio`, en la ruta `/cambio/runners`
(accesible al tier `cambio`, que ya puede ver `/cambio/*`). Cuatro piezas de
datos: runners, cuentas de gestión (con su pago precargado), gestiones y pagos.
El pago al runner se registra **aparte** de la gestión: las gestiones suman lo
que se le debe, los pagos lo bajan.

**Invariante:** las gestiones y los pagos de runners **no tocan el cálculo del
cambio** (stock, costo promedio, margen, saldos de cajas). Son un registro
logístico y de deuda con el runner, separado de la caja. `calculo.ts`,
`reportes.ts` y `exchange_ops` no cambian.

## Modelo de datos

Cuatro tablas nuevas, misma plantilla que el resto del cambio (uuid,
`company_id` con FK a `companies`, RLS `for all to authenticated using(true)`).

### `runners`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| company_id | uuid FK companies | |
| name | text | |
| active | boolean default true | inactivo = no aparece para elegir, pero se conserva su historial |
| created_at | timestamptz default now() | |

Índice único `(company_id, lower(name))`. Precargados: **Owen, Zurdo, Capi**
para la empresa Gestiones MA.

### `runner_accounts` (cuentas de gestión)
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| company_id | uuid FK companies | |
| name | text | ej. "Casa de cambio dólares", "Transferencia MercadoPago" |
| currency | text | ARS \| USD — la moneda de lo que se mueve |
| fee | numeric default 0 | **pago al runner por gestión, en pesos** |
| active | boolean default true | |
| created_at | timestamptz default now() | |

Índice único `(company_id, lower(name))`. Lista SEPARADA de `exchange_accounts`
(las cajas): estas describen la *acción de gestión* y llevan el `fee`, y no
deben mezclarse con las cajas que sí entran en el cálculo. No se precarga
ninguna: el usuario las crea desde la UI.

### `runner_gestiones`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| company_id | uuid FK companies | |
| gestion_date | date | |
| runner_id | uuid FK runners on delete restrict | no se borra un runner con historial |
| account_id | uuid FK runner_accounts on delete restrict | |
| kind | text | retiro \| transferencia |
| amount | numeric default 0 | monto movido, **solo informativo** (no calcula el pago) |
| fee | numeric default 0 | **pago de esta gestión**, en pesos; se autocompleta desde `runner_accounts.fee` y es editable |
| notes | text default '' | |
| created_at | timestamptz default now() | |

Índice `(company_id, runner_id)` y `(company_id, gestion_date)`.

### `runner_payments`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| company_id | uuid FK companies | |
| payment_date | date | |
| runner_id | uuid FK runners on delete restrict | |
| amount | numeric default 0 | monto pagado al runner, en pesos |
| notes | text default '' | |
| created_at | timestamptz default now() | |

Índice `(company_id, runner_id)`.

## Cálculo (puro, sin tocar el del cambio)

`lib/cambio/runners.ts` — función pura `calcularRunners(runners, gestiones,
pagos)` que devuelve, por runner: `gestionado` (suma de `fee` de sus
gestiones), `pagado` (suma de sus pagos) y `pendiente = gestionado − pagado`.
Sin efectos, testeable con casos de tabla. El pago es en pesos, así que
`pendiente` puede quedar en cero o positivo (nunca debería ir negativo salvo
que se registre de más un pago; en ese caso se muestra tal cual, no se
disimula — misma filosofía que las cajas en descubierto).

## Interfaz — `/cambio/runners`

Página server component (`force-dynamic`), acento dorado Gestiones MA, con la
barra móvil ya existente. Un enlace **"Runners"** desde el encabezado de
`/cambio` lleva acá; y un enlace de vuelta a Cambio.

- **Resumen por runner** (tarjetas, ya mobile-first): nombre, **saldo
  pendiente** (destacado), total gestionado y total pagado.
- Botón **"Nueva gestión"** → modal: fecha (hoy por defecto), runner (select),
  cuenta (select; al elegirla se autocompleta el pago), tipo (retiro /
  transferencia), monto movido (opcional), pago (editable), notas.
- Botón **"Registrar pago"** → modal: fecha, runner, monto, notas.
- Botón **"Cuentas de gestión"** → modal de configuración: lista de cuentas con
  su pago + alta de cuenta nueva (nombre, moneda, pago). También permite dar de
  alta un **runner** nuevo (nombre), por si suman gente.
- **Historial**: lista de gestiones recientes (fecha, runner, cuenta, tipo,
  pago) y lista de pagos recientes (fecha, runner, monto). En el celular, como
  tarjetas; en escritorio, tabla (mismo patrón `.ops-cards`/`.ops-tabla`).

### Server actions (`app/(app)/cambio/runners-actions.ts`)

Resultado discriminado `{ok} | {ok,error}`, `revalidatePath("/cambio/runners")`
aislado en su try/catch, log `[cambio]`. Todas gateadas por acceso a la caja
(el tier cambio las usa; **sin** candado `tieneAccesoCompleto`).

- `createRunnerGestion(formData)` — inserta en `runner_gestiones`.
- `createRunnerPayment(formData)` — inserta en `runner_payments`.
- `createRunnerAccount(formData)` — inserta en `runner_accounts` (con su fee).
- `createRunner(formData)` — inserta en `runners`.

### Capa de datos (`lib/cambio/datos.ts` o `runners-datos.ts`)

Lecturas por `createClient()` de `@/lib/supabase/server`: `getRunners`,
`getRunnerAccounts`, `getRunnerGestiones`, `getRunnerPayments`. Mappers
snake_case → camelCase, con el mismo chequeo de truncado a 1000 filas que ya
usa el módulo (contar y avisar por consola si se corta).

## Lo que no cambia

`calculo.ts`, `reportes.ts`, `excel.ts` (por ahora los runners no se exportan),
`exchange_ops` y las cajas. El cálculo del cambio queda intacto y sus tests
siguen pasando.

## Fuera de alcance (v1)

- **Pago del runner en dólares.** El pago se maneja en pesos. Si hace falta
  multi-moneda para el pago, se agrega después.
- **Pago distinto por retiro vs transferencia.** El `fee` es por cuenta; en cada
  gestión se puede editar el monto. Si más adelante se quiere fee separado por
  tipo, se amplía `runner_accounts`.
- **Editar/borrar gestiones o pagos** desde la UI (se corrige en la base, igual
  que las operaciones del cambio en v1).
- **Vincular una gestión a una operación de compra/venta.** Son registros
  independientes.
- **Exportar runners a Excel.** Se puede sumar después.

## Convenciones a seguir

- SQL crudo idempotente en `lib/db/sql/2026-07-23-runners.sql` (tablas + índices
  + RLS + alta de Owen/Zurdo/Capi), corrido a mano en Supabase
  (proyecto `zjetaihjddoxxvrpzwsb`, empresa Gestiones MA vía `ilike '%gestiones%ma%'`).
- Server actions con resultado discriminado y `revalidatePath` aislado.
- Montos con `parsearMonto` (entrada) y `formatearPesos` (salida), igual que el
  formulario de operaciones.
- Estilos inline con las CSS variables; acento dorado heredado; mobile-first
  (tarjetas en el celular, tabla en escritorio).
