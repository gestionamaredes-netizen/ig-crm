# BLUR × Tony Importados — Landing, CRM, conversión, tracking y dashboard

**Fecha:** 2026-08-13
**Complementa:** [00 — Índice](00-blur-tony-index.md) · [03 — Arquitectura de Drops](03-arquitectura-drops-posicionamiento.md)
**Cubre secciones del brief:** 25 (Landing), 26 (CRM), 24 (Sistema de ventas / Conversión), 30 (Atribución / Tracking), Dashboard

> **DATO de contexto (relevado en el propio repositorio `ig-crm`):** este CRM ya es multi-tenant — administra a **Premoldeados MA, Gestiones MA, NYPRO Imports y Dollar Drop** como empresas activas o en desarrollo, cada una con sus propios módulos (`lib/companies.ts`). **Tony Importados todavía no existe como empresa dada de alta en el sistema.** La imagen de dashboard de Tony Importados que acompaña este proyecto (Drops activos, ventas 30 días, pedidos recientes) es una **pieza de diseño/mockup**, no un módulo construido todavía en el código (`app/(app)` solo tiene implementado `finanzas`, `empresas`, `marketing` y `dashboard` genérico a la fecha de este documento). Esto no es una crítica — es la base real desde la que hay que planificar: construir el módulo de Tony en `ig-crm` es un proyecto de producto en sí mismo, del que este documento define los requisitos funcionales, no el código.

---

## 24 — Sistema de ventas

```
CONTENIDO (Instagram/TikTok, ver documento 05)
    ↓
PERFIL (bio con link + CTA claro)
    ↓
LANDING (por Drop, ver estructura abajo) o WHATSAPP directo (ver documento 01: en Argentina,
    WhatsApp es el canal de cierre real — no hay checkout nativo de TikTok Shop, y el de
    Instagram/Facebook no está confirmado para el país)
    ↓
QUIZ / ELECCIÓN DEL DROP (Calculadora 1, documento 03)
    ↓
COMPRA (transferencia / Mercado Pago / efectivo, según medios ya declarados por el cliente)
    ↓
CONFIRMACIÓN (mensaje automático o manual de WhatsApp Business)
    ↓
POSTVENTA (seguimiento de envío — el cliente ya declara 24/48hs y seguimiento en tiempo real)
    ↓
UPSELL (progresión de nivel, ver documento 03 — "de $70K a $150K")
    ↓
RECOMPRA (activada por el próximo Drop, ver documento 06, calendario de lanzamiento)
```

**RECOMENDACIÓN:** dado que el cierre real ocurre en WhatsApp (no en un checkout automatizado), el "CRM" de Tony no puede depender de que la venta deje un registro automático — necesita que cada conversación cerrada en WhatsApp se cargue (manual o semi-automáticamente) al sistema para no perder el dato de atribución. Esto condiciona todo el diseño de tracking de abajo.

---

## 25 — Landing por Drop

Estructura estándar (una landing por Drop activo, o una landing con las 4 variantes seleccionables):

| Bloque | Contenido |
|---|---|
| Headline | Nombre del Drop + precio, directo |
| Problema | Una línea conectando con el avatar (renovar el ropero / empezar a vender) |
| Propuesta | Qué es un Drop de Tony, en una frase (ligado al concepto "se abre", documento 04) |
| Qué incluye | Listado con foto de cada prenda del combo |
| Para quién | Los dos caminos (A/B) explicados en dos líneas separadas |
| Diferencia entre Drops | Tabla comparativa de los 4 niveles (ver documento 03) |
| Prueba social | UGC real (documento 06) — **no usar testimonios inventados o genéricos** |
| Preguntas frecuentes | Extraídas de la biblioteca de contenido para emprendedores (documento 05) más las de consumidor final |
| Objeciones | Ver avatares (documento 02) — responder directamente "¿es original?", "¿y si no vendo todo?", etc. |
| CTA | WhatsApp directo con el nivel de Drop prellenado en el mensaje |
| Medios de pago | Los ya declarados por el cliente (crédito hasta 12 cuotas, débito, transferencia, efectivo, criptomonedas) |
| Envío | Los ya declarados (envíos a todo el país, 24/48hs, seguimiento en tiempo real) |
| Política de cambios/devoluciones | **Pendiente del cliente** — no se encontró una política declarada en el material disponible; no inventar una |
| Urgencia | Countdown real, conectado al stock real del Drop — nunca un countdown falso o reseteado |

**RECOMENDACIÓN crítica de credibilidad:** el countdown y el contador de stock de la landing tienen que reflejar el estado real del Drop en todo momento. Un countdown que llega a cero y se resetea, o un "quedan 3 unidades" que no cambia nunca, destruye la premisa de escasez real sobre la que se apoya todo el sistema de Drops (ver documento 06).

---

## 26 — CRM: segmentación

Categorías (compatibles con el modelo de niveles de cliente que el manual operativo ya define: Bronze/Silver/Gold/Black):

| Segmento | Criterio | Automatización sugerida |
|---|---|---|
| Consumidor | Declaró uso personal en el Quiz/conversación | Contenido de Camino A en remarketing |
| Emprendedor | Declaró interés en reventa, primera compra | Contenido de Camino B + biblioteca de emprendedores (documento 05) |
| Revendedor | Segunda compra o más, ticket alto, o declara proveedor propio | Ofertas orientadas a volumen ($250K/$400K) |
| Cliente nuevo | Primera compra | Secuencia de bienvenida + programa de puntos |
| Cliente recurrente | 2+ compras | Acceso anticipado al próximo Drop (ya previsto en el programa de niveles) |
| Consultó y no compró | Abrió conversación, no cerró venta | Secuencia de reactivación — sin presión de urgencia falsa |
| Compró Drop $70K / $150K / $250K / $400K | Por nivel | Upsell al nivel siguiente (documento 03) |

**RECOMENDACIÓN de implementación:** dado que Tony aún no es un módulo del CRM (`ig-crm`), la forma más rápida de tener esta segmentación operativa **antes** de que exista el módulo dedicado es una plantilla de etiquetas manual en WhatsApp Business + una planilla, migrando a un módulo propio del CRM cuando se confirme el proyecto de producto.

---

## 30 — Tracking y atribución

Preguntas que hay que poder responder, y cómo (dado que no hay checkout automatizado):

| Pregunta | Mecanismo |
|---|---|
| ¿Qué video vende? | Cada pieza de contenido lleva un código corto único mencionado en el CTA ("escribime TONY150-R7") que el vendedor registra al cerrar por WhatsApp |
| ¿Qué creator vende? | Link o código exclusivo por creator (UTM en el link de bio, o código de WhatsApp distinto) |
| ¿Qué Drop vende? | Ya trackeable de forma directa — cada venta pertenece a un Drop por diseño del propio sistema |
| ¿Qué campaña vende? | UTMs en cualquier pauta paga, cruzadas con el código de WhatsApp en ventas orgánicas |
| Formulario de atribución | Pregunta simple al cerrar la venta: "¿por dónde nos encontraste?" — barato de implementar, no requiere tracking técnico, y es lo único disponible con certeza mientras el cierre siga siendo manual en WhatsApp |

**RECOMENDACIÓN realista:** dado que WhatsApp es el canal de cierre y no tiene tracking nativo confiable, la pregunta de atribución manual ("¿por dónde nos encontraste?") es, hoy, más confiable que cualquier sistema de UTMs — porque las UTMs se pierden en el momento en que la conversación pasa de Instagram a WhatsApp sin un click final medible. Un sistema de códigos por pieza de contenido (como en la fila 1 de la tabla) es el puente entre ambos mundos.

---

## Dashboard

El mockup de dashboard ya diseñado para Tony (KPIs de ventas 30 días, pedidos, Drops activos, alertas de stock, productos más vendidos) es un **buen punto de partida de producto**, no algo a rediseñar. Para que funcione con datos reales (no solo maqueta), necesita:

1. Que las ventas cerradas por WhatsApp se carguen al sistema (ver sistema de ventas arriba) — sin esto, el dashboard no tiene datos reales que mostrar.
2. Que la segmentación CRM (arriba) esté cargada por venta, para poder filtrar KPIs por Público A vs. Público B.
3. Que el nivel $70K se dé de alta como Drop en el sistema (ver documento 03, diagnóstico) antes de poder mostrarlo en el dashboard.

**RECOMENDACIÓN:** este es, en términos de producto, un proyecto de desarrollo separado del proyecto de contenido/growth — se puede secuenciar en paralelo (ver documento 08, plan de 90 días) pero no depende uno del otro para arrancar: el contenido y los Drops pueden lanzarse con seguimiento manual mientras el módulo de CRM se construye.

---

**Siguiente documento:** [08 — Plan de 90 días, calendario, KPIs y experimentación](08-plan-90-dias-calendario-kpis-experimentacion.md)
