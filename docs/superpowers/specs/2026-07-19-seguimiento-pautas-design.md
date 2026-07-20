# Seguimiento de pautas publicitarias — Diseño

Fecha: 2026-07-19
Estado: aprobado, pendiente de plan de implementación

## Problema

IG CRM no tiene ningún registro de las pautas publicitarias. La campaña de Google Ads
`Search_Muros-Premoldeados_Zona-Oeste` (cuenta 296-124-4070) está lista para publicar y no hay
dónde seguirla. Google Ads y Meta Ads ya muestran gasto, clics e impresiones; lo que ninguna
plataforma puede mostrar es qué pasó con esas consultas después: cuáles se convirtieron en
cotización y cuáles en venta cerrada. Ese cruce —pauta → lead → plata— sólo puede vivir en el CRM,
y es la razón de ser de este módulo.

## Alcance

Multi-plataforma (Google Ads y Meta Ads) y multi-empresa desde el inicio. El salto de una
plataforma a dos es barato hoy y caro una vez que hay datos cargados.

Fuera de alcance en esta versión:

- Contenido orgánico (posteos de IG, WhatsApp). No tiene gasto diario ni CPA; mezclarlo en las
  mismas tablas ensucia el modelo.
- Bloque de campañas dentro de `/empresas/[slug]`. Es la tabla de `/marketing` filtrada por
  empresa; se agrega después sin cambios de modelo.
- Reemplazo de los stat cards demo del dashboard (`lib/dashboard-data.ts`). Trabajo aparte.
- Ajuste por inflación. Comparar ARS de julio contra ARS de octubre es engañoso, pero elegir
  índice y método es una discusión propia. Ver Pendientes.

## Modelo de datos

Tres tablas nuevas en `lib/db/schema.ts`, siguiendo el estilo de las existentes.

### `ad_accounts`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `company_id` | uuid → `companies` | cascade |
| `platform` | text | `google` \| `meta` |
| `external_id` | text | ID en la plataforma, ej. `296-124-4070` |
| `name` | text | |
| `currency` | text | default `ARS` |
| `active` | boolean | default true |

Una empresa puede tener varias cuentas. `external_id` es la llave que usa el sync para saber a qué
cuenta pedirle datos.

### `campaigns`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `company_id` | uuid → `companies` | cascade |
| `ad_account_id` | uuid → `ad_accounts` | cascade |
| `external_id` | text | ID de campaña en la plataforma; vacío mientras es borrador |
| `name` | text | |
| `objective` | text | `leads` \| `trafico` \| `ventas` |
| `status` | text | `borrador` \| `activa` \| `pausada` \| `finalizada` |
| `daily_budget` | numeric | |
| `started_at` | timestamptz | nullable |
| `ended_at` | timestamptz | nullable |
| `created_at` | timestamptz | default now |

`Search_Muros-Premoldeados_Zona-Oeste` entra como `borrador` con `daily_budget` 2000 antes de
gastar un peso.

### `campaign_metrics`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `campaign_id` | uuid → `campaigns` | cascade |
| `period_start` | date | |
| `period_end` | date | inclusivo |
| `source` | text | `manual` \| `sync` |
| `impressions` | integer | default 0 |
| `clicks` | integer | default 0 |
| `cost` | numeric | default 0 |
| `conversions` | integer | default 0 — las que **reporta la plataforma**, ver abajo |
| `created_at` | timestamptz | default now |
| `updated_at` | timestamptz | default now |

Cada fila cubre un rango. El sync escribe filas de un día (`period_start = period_end`); una carga
manual cubre una semana. Las dos conviven en la misma tabla y los gráficos las suman igual.

### Atribución: dos campos en `leads`

| Campo | Tipo | Notas |
|---|---|---|
| `campaign_id` | uuid → `campaigns` | nullable, `set null` |
| `gclid` | text | default `''` |

El `gclid` viaja dentro del texto pre-cargado del mensaje de WhatsApp (plan ya definido para
Premoldeados). Al cargar el lead se pega el código y el sistema resuelve la campaña. Cuando no hay
`gclid` —texto borrado, o lead de Meta— queda el selector manual de campaña activa.

## Decisiones de diseño

### Dos conteos distintos que nunca hay que mezclar

`campaign_metrics.conversions` es lo que **reporta la plataforma** (clics a `wa.me` según el
tracking de Google). Los **leads atribuidos** son las filas de `leads` con `campaign_id` apuntando a
la campaña: gente que efectivamente escribió y quedó cargada en el CRM.

Nunca coinciden —mucha gente clickea y no escribe— y esa brecha es información valiosa por sí
misma. La UI los muestra siempre como columnas separadas y rotuladas:

- **"Clics a WhatsApp"** → `conversions` de la plataforma
- **"Leads"** → leads atribuidos en el CRM

De ahí salen dos costos distintos, ambos útiles: costo por clic a WhatsApp (`cost / conversions`) y
costo por lead real (`cost / leads atribuidos`). El segundo es el que manda para decidir si escalar.

### Las métricas derivadas no se guardan

CTR, CPC, CPA y ROAS son divisiones entre columnas ya almacenadas. Guardarlas significa que
corregir un gasto deja métricas inconsistentes hasta que algo las recalcule. Se computan al leer.

### Solapamiento: el sync pisa lo manual

Riesgo central del modelo de granularidad mixta: si existe una fila manual del 20 al 26 y el sync
escribe los 7 días sueltos, sumar todo duplica el gasto.

Regla: **antes de escribir un rango, el sync borra las filas `source = 'manual'` de esa campaña que
se solapen con el rango.** El dato automático manda; el manual es respaldo.

Alternativa descartada: constraint `EXCLUDE` con rangos en Postgres. Complica más de lo que
resuelve a esta escala.

## Interfaz

### 1. Card "Pautas" en el dashboard

En la fila del trío, junto al embudo y el resumen financiero. Del mes en curso: inversión, leads
atribuidos, costo por lead, y sparkline de gasto de los últimos 30 días. Link a `/marketing`.

### 2. `/marketing`

Reemplaza el placeholder de `app/(app)/[section]/page.tsx`. La entrada del sidebar ya existe
(`components/shell/sidebar.tsx:27`), no hay cambios de navegación.

Contiene: fila de KPIs del período, selector de rango de fechas, tabla de campañas (empresa,
plataforma, estado, presupuesto, gasto, clics, clics a WhatsApp, leads, costo por lead) ordenada
por gasto descendente, y gráfico de inversión en el tiempo. Incluye el formulario de carga manual
de períodos.

### 3. `/marketing/[id]`

Detalle de campaña: serie temporal, tabla de períodos cargados con marca visual de `manual` vs
`sync`, y lista de leads atribuidos con su valor.

### Estados vacíos

Al terminar la implementación la campaña de Premoldeados aún no correrá. Sin diseño explícito, el
módulo parece roto el día uno.

- Sin campañas activas: la card muestra el estado real —"1 campaña en borrador · Premoldeados MA ·
  esperando publicación"— en vez de `$0`.
- Campaña activa sin métricas: "Activa desde hace 2 días · sin datos cargados".

## Carga de datos

### Manual

Formulario en `/marketing`: campaña, rango de fechas, impresiones, clics, gasto, conversiones.
Server action, mismo patrón que el alta de leads ya existente.

### Sync vía MCP de Supermetrics

Restricción técnica: **el MCP corre en la sesión de Claude Code, no dentro de la app Next.js.** La
app no puede invocarlo.

El flujo es: Claude consulta Supermetrics por MCP → genera un JSON con las filas → un script del
repo (`npm run sync:pautas`) las escribe en Supabase con la regla de solapamiento. Mismo patrón que
`lib/db/seed.ts`. Agendable semanalmente.

Es decir: el sync no es una función de la app, es un proceso externo que escribe en la base. La app
sólo lee.

Bloqueante hoy: Google Ads y Facebook Ads figuran `NOT_AUTHENTICATED` en Supermetrics. Fabricio
debe autorizar Google Ads con el link que devuelve el MCP. Supermetrics es producto pago; verificar
que el plan incluya acceso antes de apoyar un proceso recurrente.

Camino de salida si el costo no cierra: la API oficial de Google Ads es gratis pero requiere
developer token (aprobación de días a semanas). Como las tablas ya existen, es reemplazar el
cargador sin tocar el modelo.

### Frescura del dato

El modo de falla peligroso no es que el sync explote: es que falle en silencio y los números viejos
pasen por actuales.

Cada card y tabla muestra antigüedad: "actualizado hace 2 horas" en gris. Si una campaña `activa`
lleva más de 48hs sin métricas nuevas, el indicador pasa a ámbar: "sin actualizar hace 3 días".

## Testing

Vitest ya está configurado. Tres bloques, todos lógica pura:

1. **Métricas derivadas**, incluyendo división por cero: una campaña con gasto y cero clics no debe
   romper ni devolver `Infinity`.
2. **Regla de solapamiento**: que el sync pise las filas manuales del mismo rango sin duplicar
   gasto. Es la que protege el número que se usa para decidir si escalar la campaña.
3. **Agregación de períodos de distinto tamaño**: una semana manual más seis días de sync suman lo
   correcto.

## Pendientes

- Fabricio autoriza Google Ads en Supermetrics (bloquea el sync, no la implementación).
- Verificar que el plan de Supermetrics incluya acceso por API.
- Ajuste por inflación para comparaciones inter-mensuales en ARS: elegir índice y método.
- Reemplazar los stat cards demo del dashboard por datos reales.
- Bloque de campañas en `/empresas/[slug]`.
