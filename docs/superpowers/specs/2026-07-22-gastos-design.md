# Módulo de Gastos — diseño

**Fecha:** 2026-07-22
**Ruta:** `/finanzas`
**Estado:** aprobado, pendiente de plan de implementación

## Problema

Iniciativa Global gasta plata en tres frentes y solo uno está registrado en IG CRM:

1. **Pauta publicitaria** — ya cubierto por el módulo `/marketing` (tablas `ad_accounts`,
   `campaigns`, `campaign_metrics`). No se toca.
2. **Infraestructura** — dominios y hosting en Donweb. Sin registrar en ningún lado.
3. **Merch / indumentaria publicitaria** — chombas, buzos. Sin registrar.

Además, los ítems de infraestructura **renuevan**, y hoy nada avisa antes del vencimiento.
El hosting vence el 05/08/2026 y se enteró de casualidad mirando el panel de Donweb.

La pregunta que el módulo tiene que contestar al abrirlo: **cuánto llevo gastado y en qué**,
y **qué se me viene**.

## Alcance

**Dentro:** alta y lectura de gastos operativos (no-pauta), agenda de renovaciones, y un total
consolidado que suma pauta + operativo.

**Fuera de esta fase:**

- Editar y borrar gastos (se corrige por SQL, como el resto del proyecto).
- Sync automático de gasto de pauta vía Supermetrics. El esquema lo prevé (`source`,
  `external_id`) pero no se implementa.
- Avisos por Telegram o email. Requieren un job diario y IG CRM todavía corre local; un cron
  que solo se ejecuta con la notebook prendida falla justo el día que importa. Se suma post-deploy.
- Costo por lead cruzando gasto contra leads del CRM. El tracking de WhatsApp de Premoldeados
  sigue pendiente, así que el número saldría mentiroso.
- Discriminación de IVA. El módulo guarda el monto final pagado; lo fiscal es contabilidad.
- Gráficos. Con 4 categorías y ~12 filas la tabla se lee mejor.

## Modelo de datos

Tabla nueva `expenses`, separada de las tablas de pautas. Convención del proyecto: inglés en la
DB, español en la UI.

```sql
create table expenses (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid references companies(id) on delete cascade,  -- null = gasto de agencia
  category     text not null,              -- dominio | hosting | herramienta | merch | servicio | otro
  concept      text not null,              -- "nyproimports.com.ar", "Chombas bordadas"
  vendor       text not null default '',   -- "Donweb"
  external_ref text not null default '',   -- "#6138993"
  amount       numeric not null,           -- TOTAL pagado, no unitario
  quantity     integer not null default 1,
  currency     text not null default 'ARS',
  paid_at      date,                       -- null = pendiente de pago
  renews_at    date,                       -- null = gasto único
  period       text not null default 'unico',   -- unico | mensual | anual
  source       text not null default 'manual',  -- manual | meta | google
  external_id  text not null default '',
  notes        text not null default '',
  created_at   timestamptz not null default now()
);

create index expenses_company_idx  on expenses(company_id);
create index expenses_renews_idx   on expenses(renews_at);
```

RLS activo con política `for all to authenticated`, igual que las tablas de pautas.

### Decisiones y por qué

**`company_id` nullable en vez de una 5ta empresa "Iniciativa Global".** El merch es de la
agencia, no de una empresa cliente. Crear una fila en `companies` la haría aparecer como un
workspace más en el sidebar, con su embudo y sus leads vacíos — inventar una empresa cliente
para poder cargar unas remeras. `null` significa "gasto de agencia" y la UI lo muestra como
*Iniciativa Global*.

**`paid_at` nullable en vez de un campo `estado`.** Con fecha está pagado, sin fecha está
pendiente. Un booleano `pagado` más una fecha aparte se contradicen apenas alguien edita uno
y no el otro.

**`renews_at` + `period` en la misma fila, sin tabla de renovaciones.** El hosting mensual es
*una* fila; al pagarlo se actualiza `paid_at` y se empuja `renews_at` un mes. No se guarda el
histórico de renovaciones pasadas. Si hace falta, se agrega una tabla hija sin tocar ésta.

**`amount` guarda el total y `quantity` las unidades; el unitario sale de dividir.** Así una
chomba y un dominio se suman igual, sin casos especiales — el dominio tiene `quantity 1`. El
formulario acepta "3 × $34.000" y calcula, pero persiste el total.

**Tabla separada, no unificada con `campaigns`.** Un gasto de pauta tiene CTR y costo por lead;
un dominio tiene vencimiento y proveedor. En una sola tabla, la mitad de las columnas queda en
`null` siempre. Se suman en la capa de datos, no en el esquema.

## Pantallas

`app/(app)/finanzas/page.tsx` — server component, `dynamic = "force-dynamic"`, mismo patrón que
`app/(app)/marketing/page.tsx`. Hoy `/finanzas` ya existe en el sidebar servido por el
placeholder genérico `[section]/page.tsx`; se le da contenido, no se agrega ítem nuevo.

**1. Cuatro KPIs** en la grilla de tarjetas glass existente:

| KPI | Fuente |
|---|---|
| Gasto total | `sum(expenses.amount) where paid_at not null` + `sum(campaign_metrics.cost)` |
| Gasto del mes | Lo mismo, filtrado por mes en curso |
| Por vencer (30 días) | `sum(amount) where renews_at <= hoy + 30` |
| Pendiente de pago | `sum(amount) where paid_at is null` |

El primero es el único punto donde `expenses` y `campaign_metrics` se cruzan.

**2. Próximos vencimientos** — filas con `renews_at`, ordenadas por fecha, semáforo rojo <7 días,
ámbar <30, gris el resto. Si no hay nada en 60 días el bloque no se renderiza.

**3. Tabla de gastos** — concepto, empresa, categoría, cantidad, monto, pagado, vence. Filtros por
empresa y categoría. `components/finanzas/tabla-gastos.tsx`, espejo de `tabla-campanas.tsx`.

**4. Alta de gasto** — formulario + server action, siguiendo `components/workspace/new-lead-form.tsx`
y `app/(app)/empresas/[slug]/actions.ts`.

**Módulos de datos:** `lib/finanzas/tipos.ts`, `lib/finanzas/datos.ts` (queries), `lib/finanzas/totales.ts`
(agregaciones y semáforo de vencimiento, con tests — espejo de `lib/pautas/metricas.ts` y
`lib/pautas/frescura.ts`).

## Datos iniciales

### Donweb — dominios, pagados el 05/07/2026, renuevan 05/07/2027, `period` anual

| Empresa | Concepto | Ref | Monto |
|---|---|---|---|
| NYPRO IMPORTS | nyproimports.com.ar | #6138993 | $27.000 |
| NYPRO IMPORTS | nyproimports.com | #6138996 | $44.000 |
| NYPRO IMPORTS | nyproimports.online | #6138999 | $52.580 |
| NYPRO IMPORTS | nyproimports.store | #6139002 | $63.320 |
| Gestiones MA | gestionesma.com | #6139499 | $44.000 |
| Gestiones MA | gestionesma.com.ar | #6139502 | $27.000 |
| Gestiones MA | gestionesma.online | #6139505 | $52.580 |
| Gestiones MA | gestionesma.store | #6139508 | $63.320 |
| Premoldeados MA | premoldeadosma.com | #6139543 | $44.000 |
| | | **Total** | **$417.800** |

Verificado: coincide exacto con el "Total a pagar" del panel de Donweb.

### Donweb — hosting, NO pagado

| Concepto | Ref | Monto | Vence | Período |
|---|---|---|---|---|
| Web Hosting Plan Empresa | #6139713 | $20.000 | 05/08/2026 | mensual |

`paid_at` en null. Empresa a confirmar (el panel no la discrimina).

### Merch — agencia (`company_id` null)

| Concepto | Cant. | Unitario | Total |
|---|---|---|---|
| Chombas | 3 | $34.000 | $102.000 |
| Buzos | 3 | $45.000 | $135.000 |
| | | **Total** | **$237.000** |

Proveedor y fecha de pago a confirmar.

### Ya cargado en pautas (no se toca)

Campaña Meta "Mensajes — Cierres premoldeados", $2.972/día × 4 días = **$11.888**, del
21 al 25/07/2026, cuenta `576563516950939`. Sembrada en `lib/db/sql/2026-07-21-pautas.sql`.

**Gasto total al arranque: $666.688** ($417.800 dominios + $237.000 merch + $11.888 pauta).
Más $20.000 pendientes de pago.

## Pendientes de información

- **Página 2 del panel de Donweb.** Solo se vio la página 1 de 2. Probablemente estén ahí
  `premoldeadosma.com.ar`, `.online` y `.store`. Hay que pedirle el screenshot a Fabricio antes
  de dar los totales por definitivos.
- **Proveedor y fecha de pago del merch.**
- **A qué empresa imputar el hosting**, o si va como gasto de agencia.

## Verificación

- Tests unitarios en `lib/finanzas/totales.ts`: agregaciones, semáforo de vencimiento en los
  bordes (7 y 30 días), y el caso de división por cero en el costo unitario.
- Verificación manual con sesión iniciada: los KPIs tienen que dar $666.688 y $20.000 por vencer.
- **Chequeo de RLS:** abrir `/finanzas` sin sesión. Con RLS activo devuelve cero filas sin error,
  o sea que se ve idéntico a "no hay datos". Confirmar que el estado vacío distingue "no hay
  gastos" de "no hay sesión", para no perder una tarde diagnosticando una query que está bien.
