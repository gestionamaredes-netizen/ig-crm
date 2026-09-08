# Captura móvil de leads — Diseño

Fecha: 2026-07-22
Estado: aprobado, pendiente de plan de implementación

## Problema

A Premoldeados MA le están entrando consultas por WhatsApp desde la campaña de Meta que corre
(ver [[premoldeados-ma-meta-ads]]), y hoy no quedan registradas en ningún lado. Cada consulta que no
se carga es un dato de atribución que se pierde: no se puede saber cuánto de los $11.888 invertidos
volvió en cotizaciones.

La integración automática de WhatsApp **no es viable**: para que un número entre a la API de
WhatsApp hay que migrarlo fuera de la app, y ese número deja de funcionar en el teléfono. Fabricio
atiende desde el celular, muchas veces en la obra, y necesita la app. El +54 9 11 4144-9010 es el
número del negocio (web, bio de IG, CTA de Google Ads). Migrarlo está descartado.

La solución es hacer que **cargar un lead a mano desde el celular sea tan rápido que se haga en el
momento**: una pantalla dedicada, tres campos, accesible con un toque desde un ícono en la pantalla
de inicio del iPhone.

## Alcance

Sólo Premoldeados MA: es la única empresa con pauta corriendo y consultas entrando. El formulario
queda clavado en esa empresa, sin selector. Cuando otra empresa tenga pauta, agregar el selector es
trabajo menor.

Fuera de alcance:

- Integración automática de WhatsApp (API oficial) — descartada por el motivo de arriba.
- Instagram DM automático vía webhooks — es la evolución natural (era la opción B del brainstorming),
  pero requiere permisos de Meta y revisión de la app. Se evalúa cuando el hábito de captura esté
  instalado y se sepa el volumen real de consultas.
- Selector de empresa. Captura para las otras tres empresas.

## Flujo

1. Fabricio recibe una consulta por WhatsApp en el celular.
2. Toca el ícono de "Captura IG" en la pantalla de inicio del iPhone (PWA agregada a home).
3. Se abre `/captura` directo, sin pasar por dashboard ni menús.
4. Escribe teléfono, nombre, elige origen. Toca Guardar.
5. Ve "✓ Guardado", el formulario se limpia solo, listo para la próxima consulta.

## Interfaz

Ruta nueva `/captura`, pensada para pantalla de celular vertical. Fuera del layout del dashboard —
sin sidebar, sin topbar—: es una pantalla de una sola tarea.

Campos, en orden:

| Campo | Detalle |
|---|---|
| Teléfono | `inputMode="tel"`, `autoFocus` — el teclado numérico salta solo y el cursor arranca ahí |
| Nombre | texto libre |
| Origen | select con las campañas activas/pausadas de Premoldeados + opción "Otro / orgánico" |

Botón **Guardar** grande, ancho completo. Al guardar con éxito: mensaje "✓ Guardado" y el formulario
se resetea para cargar el siguiente lead sin volver a navegar.

**Acceso desde el iPhone:** Safari → Compartir → "Agregar a pantalla de inicio". En iOS no existe la
integración con el menú de compartir de WhatsApp (Apple no la permite para web), así que el ícono es
lo más directo posible. Para que se comporte como app (pantalla completa, sin barra de Safari) se
agrega un `manifest.webmanifest` mínimo y las meta tags `apple-mobile-web-app-*`.

## Qué se guarda

Un lead en la tabla `leads` existente:

| Campo | Valor |
|---|---|
| `phone` | lo tipeado, **normalizado** (ver abajo) — columna nueva |
| `name` | lo tipeado |
| `company_id` | Premoldeados (resuelto por slug `premoldeados`) |
| `campaign_id` | la campaña elegida, o null si "Otro / orgánico" |
| `stage_id` | la primera etapa del embudo de Premoldeados (la de menor `order`, sin depender de su nombre) |
| `channel` | `wa` por defecto |
| `value` | 0 — se completa al cotizar |

Los campos que quedan vacíos (descripción, valor, zona) se completan después desde la computadora,
cuando la conversación avanzó.

### Cambio en el esquema

Agregar columna `phone text not null default ''` a `leads`. Hoy el teléfono sólo existe en la tabla
`contacts`, pero crear un contacto además de un lead para una captura de 3 campos rompe la premisa de
que sea instantáneo. El teléfono va directo en el lead.

## Decisiones de diseño

### Normalización de teléfono

La gente escribe el mismo número de mil formas: `11 4144 9010`, `+54 9 11 4144-9010`, `1141449010`.
Para detectar duplicados y guardar consistente, se normaliza antes de comparar y de guardar: se
quitan espacios, guiones, paréntesis y el `+`, dejando sólo dígitos. Función pura en `lib/`, testeada
con las variantes de escritura.

### Detección de duplicados

Antes de insertar, se busca un lead de Premoldeados con el mismo teléfono normalizado. Si existe, no
se crea uno nuevo: se avisa "Este contacto ya está cargado" y se ofrece abrirlo. Evita que el mismo
cliente aparezca varias veces por escribir en días distintos — que es justo el ruido que arruinaría
la métrica de leads por campaña.

## Manejo de errores

Los tres modos de falla que matan el flujo, cada uno con salida clara:

- **Sesión vencida.** Si al abrir el ícono la sesión de Supabase caducó, hoy redirige a `/login` y
  ahí se abandona. La captura detecta la falta de sesión y muestra "Tu sesión venció, tocá para
  reconectarte" con un botón directo, en vez de dejar trabado. (No se puede evitar el vencimiento
  desde el código —depende de la duración de sesión de Supabase— pero sí que falle de forma
  entendible.)
- **Sin señal.** En la obra la señal es mala. El botón muestra "Guardando…" y, si falla, "No se pudo
  guardar, reintentá" **sin borrar lo tipeado**. Perder un lead por un bajón de señal sería el peor
  resultado.
- **Duplicado.** Cubierto arriba: no es error, es un aviso con acción.

## Testing

Vitest ya corre (161 tests). Se agregan dos bloques de lógica pura:

1. **Normalización de teléfono** — todas las variantes de escritura colapsan al mismo valor; entrada
   vacía o con basura no rompe.
2. **Detección de duplicados** — un teléfono ya cargado se reconoce aunque esté escrito distinto (se
   testea sobre la comparación de valores normalizados, sin tocar la base).

El formulario se verifica en el navegador con el server de preview.

## Fuera de alcance / pendientes relacionados

- Instagram DM automático (webhooks) — evolución futura.
- Captura para las otras tres empresas — cuando tengan pauta.
- Vincular WhatsApp a la API — descartado mientras se atienda desde el celular.
