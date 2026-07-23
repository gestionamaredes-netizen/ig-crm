# Comprobante opcional por operación — módulo Cambio

**Fecha:** 2026-07-23
**Estado:** diseño aprobado (Opción A)

## Problema

Cada operación de la caja (compra/venta de dólares) suele tener un respaldo: la
foto de la transferencia, el PDF del comprobante bancario, la captura del pago.
Hoy no hay forma de adjuntarlo en la app. El usuario quiere poder sumar un
comprobante **opcional** a cada operación, tanto al cargarla como después (el
comprobante muchas veces llega más tarde).

## Decisión

**Opción A — adjuntar al crear la operación y también después.** Se descartó
"solo al crear" (Opción B) porque en la operativa real el comprobante suele
aparecer después de cargar la operación, y editar operaciones todavía no existe.

## Modelo de datos

### `exchange_ops` (columna nueva)

| Columna | Tipo | Notas |
|---|---|---|
| `comprobante_path` | text default `''` | ruta del archivo en Storage; `''` = sin comprobante |

Nullable-por-convención con `default ''` (como el resto del esquema). No cambia
ninguna otra columna ni el cálculo.

### Supabase Storage — bucket `comprobantes`

Bucket **privado** (no público): solo alguien autenticado en la caja puede leer
los archivos, nadie desde afuera. Consistente con que la caja es privada.

Se crea por SQL idempotente (`insert into storage.buckets ... on conflict do
nothing`) junto con políticas RLS sobre `storage.objects` para el bucket
`comprobantes`: **authenticated** puede `insert`, `select` y `update` (subir,
listar/leer, reemplazar). Sin acceso anónimo.

## Flujo de archivos

- **Formato:** imágenes (JPG/PNG/WEBP) y **PDF**. Tope de tamaño: **10 MB**
  (una foto de transferencia o un PDF entran de sobra; se rechaza más grande
  para no llenar el Storage gratis).
- **Ruta:** `comprobantes/<uuid>.<ext>` — nombre generado, único, sin datos
  sensibles en el path. La misma convención sirve para el alta y para adjuntar
  después (no depende del id de la operación).
- **Subida:** del lado del cliente, con el cliente Supabase del navegador
  (`@/lib/supabase/client`), que ya lleva la sesión del usuario (RLS
  authenticated). El archivo se sube a Storage y se obtiene su `path`.
- **Lectura/ver:** como el bucket es privado, para abrir un comprobante se
  genera una **URL firmada** temporal (~1 hora) con el cliente Supabase y se
  abre en una pestaña nueva. No se exponen URLs públicas permanentes.

## Interfaz

### Componente reutilizable `ComprobanteInput`

Cliente. Recibe el `path` actual (o vacío) y avisa cuando cambia. Al elegir un
archivo: valida tipo y tamaño, lo sube a Storage, muestra el nombre y un enlace
"ver", y expone el `path` resultante. Maneja error de subida y estado
"subiendo…". Se usa en dos lugares:

- **Formulario de nueva operación:** un campo opcional "Comprobante". El `path`
  subido viaja al server action en un input oculto (`comprobantePath`).
- **Fila de la tabla de operaciones (adjuntar después):** las filas sin
  comprobante muestran un botón **"Adjuntar"** que abre el mismo componente en
  un popover/modal chico; al subir, un server action guarda el `path` en esa
  operación y revalida.

### Tabla de operaciones

Nueva celda "Comprobante": si la operación tiene uno, un enlace **"Ver"** (abre
la URL firmada); si no, el botón **"Adjuntar"**.

### Server actions

En `app/(app)/cambio/actions.ts` (o `contactos-actions.ts` hermano):

- `createExchangeOp` (existente) suma `comprobante_path` al insert, leyendo
  `comprobantePath` del FormData (vacío si no se adjuntó).
- `setComprobante(opId: string, path: string)` → nuevo: actualiza
  `comprobante_path` de una operación (para adjuntar/reemplazar después).
  Resultado discriminado, `revalidatePath("/cambio")` aislado, log `[cambio]`.
  Gateado por acceso a la caja (todos cambio-only pueden usarlo).

### Capa de datos

`OperacionCalculada`/`Operacion` suma `comprobantePath: string`. El mapper de
`datos.ts` lo traduce desde `comprobante_path`. No afecta `calculo.ts` ni
`reportes.ts` (es un campo que se arrastra, no entra en ninguna cuenta).

## Exportación a Excel

La hoja Operaciones suma una columna **"Comprobante"** con "Sí" / "" (no la URL,
que es temporal). Suficiente para saber qué operaciones tienen respaldo.

## Lo que no cambia

`calculo.ts`, `reportes.ts`, el cálculo de stock/margen/cajas. El comprobante es
metadata que viaja con la operación. Los tests de cálculo siguen pasando.

## Fuera de alcance

- **Varios comprobantes por operación.** Con uno alcanza; se amplía si hace falta.
- **Borrar el comprobante** (solo reemplazar). Se puede agregar después.
- **Vista previa embebida** (miniatura en la tabla). Por ahora un enlace "Ver".
- **Comprobante en compras vs ventas con reglas distintas.** Es igual para todas.
- **Limpieza de archivos huérfanos.** Si alguien sube un archivo y después cancela
  el formulario sin guardar la operación, el archivo queda en Storage sin uso. Es
  inofensivo (ocupa poco) y se puede limpiar más adelante con una tarea aparte.

## Convenciones a seguir

- SQL crudo idempotente en `lib/db/sql/2026-07-23-comprobantes.sql` (columna +
  bucket + políticas), corrido a mano en Supabase (proyecto `zjetaihjddoxxvrpzwsb`).
- Lectura por `createClient()` de `@/lib/supabase/server`; subida/URL firmada por
  `@/lib/supabase/client` en componentes cliente.
- Server actions con resultado discriminado y `revalidatePath` aislado.
- Estilos inline con las CSS variables; el dorado de la caja se hereda.
