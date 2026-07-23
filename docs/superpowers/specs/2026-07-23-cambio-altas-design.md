# Altas de clientes, emisores y receptores — módulo Cambio

**Fecha:** 2026-07-23
**Estado:** diseño aprobado (Opción A)

## Problema

En el formulario de nueva operación del módulo Cambio (`/cambio`), **Cliente** es
un desplegable que lee de la tabla `exchange_clients`, pero no hay forma de agregar
un cliente desde la app: hay que insertarlo a mano en la base. **Emisor** y
**Receptor** son texto libre: se reescriben en cada operación y no hay lista
reutilizable.

El usuario quiere dar de alta clientes, emisores y receptores **de forma sencilla,
dentro de la plataforma**, sin salir de la carga.

## Decisión

**Opción A — registro de personas.** Emisor y receptor pasan a elegirse de una lista
reutilizable que el usuario administra, en vez de texto libre. Se descartó la Opción B
(autocompletado por historial) porque el usuario pidió un "alta" explícita y una lista
administrable (poder corregir o quitar un nombre mal cargado).

## Modelo de datos

### `exchange_people` (nueva)

Personas que actúan como emisor o receptor. Una misma persona puede ser ambos, así que
es una sola tabla, no dos.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `company_id` | uuid FK `companies` | GESTIONES MA |
| `name` | text | |
| `active` | boolean default true | desactivar = sacar del buscador sin borrar historial |
| `created_at` | timestamptz | |

Índice único `(company_id, lower(name))`, igual que `exchange_clients` y
`exchange_accounts`. RLS `auth_all_exchange_people`, misma plantilla del proyecto.

### `exchange_clients` (existente, sin cambios de esquema)

Ya tiene `active`. Solo se le agrega el alta y la baja lógica desde la UI.

### `exchange_ops` (sin cambios)

**`sender` y `receiver` se siguen guardando como texto**, no como FK. La tabla de
personas solo alimenta el buscador; el nombre elegido (o tipeado) se persiste como
texto. Esto deja el cálculo, los rankings (`rankingPersonas` agrupa por nombre) y la
exportación **intactos**: ninguna capa de lógica cambia. Es la decisión de menor riesgo.

## Interfaz

### Combobox reutilizable

Un componente cliente `ComboAlta` para los tres campos:

- Input con **buscador**: al escribir, filtra la lista (case-insensitive).
- Al elegir una opción, queda seleccionada.
- Botón **"+ nuevo"**: abre un input inline; se escribe el nombre, se confirma, se da
  de alta (server action) y queda seleccionado sin cerrar el formulario de operación.
- **Emisor y Receptor** (valor = nombre, texto): se puede elegir de la lista, **o
  escribir un nombre que no está en la lista** y usarlo tal cual (caso de la persona
  que aparece una sola vez — se preserva la flexibilidad del texto libre original, no se
  fuerza a registrar a todos). El **"+ nuevo"** es para cuando sí querés guardarlo y
  reusarlo. En los tres casos, lo que se persiste en `exchange_ops` es el nombre.
- **Cliente** (valor = id, FK): acá sí hay que elegir de la lista o dar de alta con
  "+ nuevo" — un cliente no puede ser texto suelto porque se guarda como `client_id`.

El componente es genérico: recibe las opciones, el label, y el server action de alta.
Vive en `components/cambio/combo-alta.tsx`.

### Formulario de nueva operación

- **Cliente**: `ComboAlta` sobre `exchange_clients` (valor = id). Reemplaza el `<select>`.
- **Emisor** y **Receptor**: `ComboAlta` sobre `exchange_people` (valor = nombre).
  Reemplazan los inputs de texto libre.
- Al dar de alta desde cualquiera de los tres, la lista se refresca (revalidación) y el
  nuevo contacto queda disponible en los otros campos también.

### Pantalla de Contactos

Modal accesible desde un botón **"Contactos"** en el encabezado de `/cambio`, al lado de
"Descargar Excel" y "Nueva operación". Contenido mínimo:

- Dos listas: **Clientes** y **Personas** (emisores/receptores).
- En cada una: agregar (input + botón) y **desactivar** cada fila (baja lógica: `active`
  = false; no borra, para no romper operaciones históricas).
- Solo se muestran los activos en los buscadores del formulario; en Contactos se ven
  todos, con los inactivos atenuados y un botón para reactivar.

## Server actions

En un archivo hermano `app/(app)/cambio/contactos-actions.ts` (separado de
`createExchangeOp` para no mezclar responsabilidades):

- `createExchangeClient(formData)` → inserta en `exchange_clients`, valida nombre no
  vacío, choca contra el índice único (nombre duplicado → error claro).
- `createExchangePerson(formData)` → idem sobre `exchange_people`.
- `setClientActive(id, active)` y `setPersonActive(id, active)` → baja/alta lógica.

Todas con el mismo patrón del módulo: resultado discriminado `{ ok } | { ok, error }`,
`revalidatePath("/cambio")` en su propio try/catch, log con prefijo `[cambio]`. Todas
gateadas por el acceso a la caja (el tier actual — todos son cambio-only — puede usarlas;
no requieren acceso full, a diferencia de finanzas/marketing).

## Capa de datos

En `lib/cambio/datos.ts`:

- `getPersonasParaOperacion()` → personas activas, `{ id, nombre }[]`, ordenadas por
  nombre. Análogo a `getClientesParaOperacion` que ya existe.
- Para la pantalla de Contactos: `getContactos()` → clientes y personas **todos**
  (activos e inactivos) con su estado, para administrarlos.

## Lo que no cambia

`calculo.ts`, `reportes.ts`, `excel.ts`, el esquema de `exchange_ops`, y todo el cálculo.
Emisor/receptor siguen siendo texto. Verificable: los 244 tests actuales siguen pasando.

## Fuera de alcance

- **Vincular una persona a un cliente fijo.** La hoja PERSONAS ya deduce el "cliente
  asociado" de las operaciones.
- **Runners** (logística/pagos): subsistema aparte, con su propio diseño.
- Editar el nombre de un contacto ya creado (por ahora se desactiva y se crea de nuevo).
