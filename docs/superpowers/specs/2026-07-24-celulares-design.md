# Celulares Operativos — módulo Cambio

**Fecha:** 2026-07-24
**Estado:** diseño aprobado

## Problema

Gestiones MA administra cuentas (bancarias, billeteras) que se abren y operan
desde **teléfonos operativos**. Hoy no hay dónde registrar qué teléfono es,
quién lo tiene, y qué cuentas están operativas en cada uno. Hace falta un
registro ordenado: teléfono → cuentas.

## Decisión

Un segmento propio dentro de `/cambio`, ruta `/cambio/celulares` (tier cambio ya
ve `/cambio/*`). Dos niveles: **celular** (teléfono) y sus **cuentas operativas**.
Es un registro (alta/edición/baja); **no toca la caja ni el cálculo**.

También se suma un cuarto runner: **Ale**. Y se precargan 18 teléfonos ya
asignados: Owen 5, Zurdo 5, Ale 8 (fichas con alias tipo "Owen 1" y modelo
vacío, listas para completar).

## Modelo de datos

Dos tablas nuevas, misma plantilla del cambio (uuid, `company_id` FK companies,
RLS `for all to authenticated using(true)`, `created_at`).

### `phones` (celulares)
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| company_id | uuid FK companies on delete cascade | |
| alias | text default '' | nombre corto para identificarlo (ej. "Owen 1") |
| model | text default '' | modelo del celular (ej. "Samsung A54") |
| runner_id | uuid FK runners on delete set null | runner a cargo; null si el runner se borró |
| active | boolean default true | operativo / fuera de uso |
| created_at | timestamptz default now() | |

Índice `(company_id)`.

### `phone_accounts` (cuentas operativas)
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| company_id | uuid FK companies on delete cascade | |
| phone_id | uuid FK phones on delete cascade | borrar un celular borra sus cuentas |
| holder_name | text default '' | nombre completo del titular |
| dni | text default '' | |
| cbu_pesos | text default '' | CBU/CVU de la cuenta en pesos |
| alias_pesos | text default '' | alias de la cuenta en pesos |
| cbu_dolares | text default '' | CBU/CVU de la cuenta en dólares |
| alias_dolares | text default '' | alias de la cuenta en dólares |
| status | text default 'activa' | activa / bloqueada |
| notes | text default '' | |
| created_at | timestamptz default now() | |

Índice `(company_id, phone_id)`.

**Datos sensibles:** DNI, CBU/CVU y nombres. Quedan tras el login (RLS
authenticated), privados como el resto de la caja. No se exponen a ningún lado
público ni se exportan por defecto.

## Interfaz — `/cambio/celulares`

Página server component (`force-dynamic`), acento dorado, `MobileTopBar`, enlace
de vuelta a `/cambio`. Un botón **"Celulares"** en el encabezado de `/cambio`.

- **Lista de celulares** (tarjetas mobile / tabla desktop): alias, modelo,
  **runner a cargo**, cantidad de cuentas, estado. Lápiz para editar/eliminar el
  celular.
- Botón **"Nuevo celular"** → modal: alias, modelo, runner (select), estado.
- Dentro de cada celular, sus **cuentas operativas**: titular, DNI, y las dos
  cuentas (pesos: CBU/CVU + alias; dólares: CBU/CVU + alias), estado, notas.
  Botón **"Agregar cuenta"** por celular, y lápiz para editar/eliminar cada
  cuenta.

Para no recargar una sola página gigante, la vista puede ser: lista de celulares,
y al abrir un celular (o inline en su tarjeta) se ven/editan sus cuentas. El
detalle exacto de layout se resuelve en el plan siguiendo el patrón de runners.

### Server actions (`app/(app)/cambio/celulares-actions.ts`)

Contrato estándar (resultado discriminado, `revalidatePath("/cambio/celulares")`
aislado, log `[cambio]`, sin candado, validar antes de `createClient()`):
- `createPhone`, `updatePhone(id, fd)`, `deletePhone(id)`.
- `createPhoneAccount`, `updatePhoneAccount(id, fd)`, `deletePhoneAccount(id)`.

### Datos (`lib/cambio/celulares-datos.ts`)

Lecturas por `createClient()` server: `getPhones` (con nombre del runner por
join), `getPhoneAccounts`. Mismo chequeo de truncado (LIMITE 10000) y mappers
snake→camel.

## Lo que no cambia

`calculo.ts`, `reportes.ts`, `exchange_ops`, cajas. Es un registro aislado.

## Fuera de alcance (v1)

- Historial de cambios / auditoría.
- Adjuntar fotos del teléfono o de la cuenta.
- Vincular una cuenta operativa a operaciones de la caja.
- Exportar celulares a Excel.

## Convenciones

- SQL crudo idempotente `lib/db/sql/2026-07-24-celulares.sql` (tablas + RLS +
  alta de Ale + precarga de 18 teléfonos), corrido a mano en Supabase.
- Server actions con resultado discriminado y `revalidatePath` aislado, sin candado.
- Estilos inline con CSS variables; acento dorado; mobile-first (tarjetas en
  celular, tabla en escritorio; lápiz tocable).
