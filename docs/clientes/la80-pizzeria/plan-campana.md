# La 80 Pizzería — Campaña Instagram + SEO Local

**Fecha:** 2026-08-10
**Estado:** plan inicial, listo para arrancar
**Cliente:** La 80 Pizzería — Isidro Casanova (La Matanza)
**Cuenta:** [@la80pizzeria](https://www.instagram.com/la80pizzeria)

## El negocio

| Dato | Valor |
|---|---|
| Dirección | Dr. Ramón Carrillo esq. Berna, Isidro Casanova |
| Horario | Jueves a domingo, 20:00 a 23:30 |
| Pedidos | WhatsApp 11 2341-4906 |
| Rubro | Pizzería — pizzas a la piedra, faina, empanadas |
| Carta | ~26 variedades de pizza ($15.000–$26.000), faina (3 variantes), empanadas ($2.500 unidad / $28.000 la docena, 13 sabores) |
| Marca | Isotipo circular negro y amarillo, "La 80", con la L trazada a mano y bajada "Pizzería" |

Solo abre **4 días a la semana** y **no tiene local propio de delivery ni web**: todo el pedido
pasa por WhatsApp. Eso define la campaña entera — el objetivo no es "más seguidores", es **llenar
las 4 noches de la semana con pedidos por WhatsApp**, y secundariamente, gente que se acerca al
local.

## Diagnóstico inicial

Sin auditar todavía la ficha real de Google (eso es la primera tarea, ver más abajo), lo que ya se
sabe por los datos de arriba:

- **Sin sitio web.** El módulo de SEO Local de esta misma herramienta (`web/lib/seo-local/reglas-ficha.ts`)
  penaliza esto con 8 de 40 puntos del bloque de ficha. No hace falta un sitio grande: una landing
  de una pantalla con menú, dirección, horario y botón de WhatsApp alcanza para cerrar el hallazgo.
- **Horario acotado (4 días).** Si la ficha de Google no tiene cargados los 7 días —aunque sea
  marcando "cerrado" lunes a miércoles— pierde 8 puntos más por "horarios incompletos". Cargar los
  7 días explícitamente es gratis y evita que alguien llegue un martes y encuentre el local cerrado
  sin aviso.
- **Nombre de marca busca mal.** "La 80" es un nombre corto y genérico para buscar en Google — compite
  con cualquier otro "80" de la zona (colectivo, kiosco, etc.). La ficha de Google y las bio de IG
  tienen que forzar el contexto: **"La 80 Pizzería — Isidro Casanova"**, siempre con las tres partes juntas.
- **Sin captura de reseñas todavía verificada.** Bloque de reputación (30 puntos): el piso a alcanzar
  es 10 reseñas y puntaje ≥ 4.0, con la más reciente de menos de 6 meses. Es la palanca de mayor
  impacto y la más barata: pedir la reseña en el momento de la entrega/retiro.

## Objetivo de la campaña

1. **Instagram como generador de pedidos**, no de vanity metrics: cada post de producto termina en
   el link de WhatsApp de pedidos.
2. **Ficha de Google completa y por encima del resto del rubro en Isidro Casanova**, para capturar
   la búsqueda "pizzería Isidro Casanova" / "pizza a domicilio Isidro Casanova".
3. Sostener las **4 noches de apertura llenas**, con picos los viernes y sábados.

## Plan de Instagram

### Pilares de contenido

| Pilar | Qué muestra | Frecuencia |
|---|---|---|
| Producto | Primeros planos de pizza recién salida, el corte, el queso estirando | 2–3 posts/semana |
| Proceso | Amasado, horno, armado — lo que hace creíble "a la piedra" | 1 reel/semana |
| Carta | Rotación de sabores menos conocidos (roquefort, rúcula, verdeo, calabresa) | 1 post/semana |
| Local y gente | El horno, el mostrador, quien atiende — genera confianza de barrio | quincenal |
| Oferta del día/fin de semana | Combo o promo puntual, siempre con precio y CTA a WhatsApp | según haya promo |

### Cadencia semanal (alineada a que abren jueves a domingo)

| Día | Qué sale | Por qué |
|---|---|---|
| Martes | Post de carta / recordatorio "esta semana abrimos jueves" | Genera intención antes de abrir |
| Miércoles | Reel de proceso (amasado, horno) | Construye expectativa para el jueves |
| Jueves (apertura) | Story en vivo del horno prendido + post de producto | Aviso de "ya estamos abiertos" |
| Viernes | Reel de producto (el corte, el queso) — el de mayor alcance de la semana | Pico de pedidos del finde |
| Sábado | Story de pedidos llegando / clientes retirando | Prueba social en caliente |
| Domingo | Post de cierre de semana + adelanto de la semana próxima | Cierra el ciclo, retiene |

### Bio, highlights y link

- Bio: nombre completo con ubicación — *"Pizzería a la piedra · Isidro Casanova · Jue a Dom 20 a 23:30"*.
- Un solo link de bio: WhatsApp directo con mensaje predefinido ("Hola, quiero hacer un pedido").
  Mientras no haya landing, no diluir con linktrees de varios destinos.
- Highlights fijos: **Carta** (capturas del menú, siempre actualizado con precios), **Ubicación**
  (mapa + fachada), **Pedidos** (cómo se pide), **Clientes** (fotos/reseñas que etiqueten la cuenta).

### Ideas concretas de piezas (primeras dos semanas)

1. Reel: cámara cenital del armado de una muzzarella, corte a cámara lenta al final.
2. Carrusel "Las 5 que más pedimos" con foto y precio de cada una.
3. Reel del plano de WhatsApp: alguien pide, el celular suena en el local, se prepara y se entrega
   (mismo recurso que usa la agencia en el formato Flash Day — ver `docs/campo/flash-day-produccion.md`,
   plano 5 — funciona igual de bien para un local ya abierto).
4. Post de faina rellena de jamón y queso — es el producto menos obvio de la carta y con mejor margen
   de sorpresa.
5. Story de "última noche de la semana, quedan X pizzas" los domingos — urgencia real, no forzada.

## Plan de SEO Local

Checklist basado en las mismas reglas que usa el módulo interno de auditoría
(`web/lib/seo-local/reglas-ficha.ts`, `reglas-reputacion.ts`).

### Ficha de Google Business (bloque de 40 puntos)

- [ ] Teléfono cargado (aunque el pedido sea por WhatsApp, el campo de teléfono de Google suma).
- [ ] Sitio web enlazado — landing mínima de una pantalla si no hay web todavía.
- [ ] **Los 7 días de la semana cargados**, marcando explícitamente cerrado lunes a miércoles.
- [ ] Categoría principal: "Pizzería" (no "Restaurante" genérico).
- [ ] Mínimo 5 fotos: fachada, horno, mostrador, al menos 2 productos.
- [ ] Estado operativo en "abierto" — revisar que Google no lo haya marcado cerrado por el horario acotado.

### Reputación (bloque de 30 puntos)

- [ ] Piso de 10 reseñas.
- [ ] Puntaje promedio ≥ 4.0.
- [ ] Reseña más reciente de menos de 6 meses — pedir reseña en cada entrega, no solo al arrancar.
- [ ] Responder todas las reseñas, buenas y malas (esto es revisión manual, Google no lo informa
      pero pesa en el puntaje del módulo).

### Competencia (bloque de 30 puntos)

- [ ] Barrer la zona de Isidro Casanova con el módulo SEO Local para ubicar a las demás pizzerías
      del radio y ver en qué puesto queda La 80 por reseñas y por puntaje.
- [ ] Verificar la posición real buscando "pizzería Isidro Casanova" desde un teléfono en la zona.

### Palabras clave objetivo

`pizzería Isidro Casanova` · `pizza a domicilio Isidro Casanova` · `pizza a la piedra La Matanza` ·
`empanadas Isidro Casanova`

## Cronograma — primeras 4 semanas

| Semana | Foco |
|---|---|
| 1 | Auditar y completar la ficha de Google (checklist de arriba). Rearmar bio e highlights de IG. |
| 2 | Arranca la cadencia semanal de contenido. Pedir las primeras reseñas activamente. |
| 3 | Primer reel de proceso + primer carrusel de carta. Revisar métricas de la semana 2. |
| 4 | Balance del mes: puntaje de la ficha, reseñas ganadas, alcance de IG, pedidos atribuibles a WhatsApp. |

## KPIs a seguir

- Reseñas de Google: cantidad y puntaje (piso 10 reseñas / 4.0).
- Alcance y guardados de Instagram por pieza (el reel del viernes es el termómetro semanal).
- Clics al link de WhatsApp desde la bio de IG.
- Pedidos por WhatsApp en las noches de apertura (referencia cualitativa hasta que haya forma de
  atribuir automáticamente — este CRM ya soporta atribución de leads por campaña en `lib/pautas/`
  si más adelante se suma pauta paga).

## Pendientes

1. Auditar la ficha real de Google de La 80 con el módulo SEO Local (falta la UI del módulo — hoy
   solo existe el motor de reglas; mientras tanto, el checklist de arriba se verifica a mano).
2. Definir si se arma una landing de una pantalla o se deja el link de bio apuntando directo a WhatsApp.
3. Conseguir el archivo de marca real (SVG/PNG en alta) — el logo cargado en este CRM
   (`web/public/logos/la80.svg`) es un placeholder redibujado a partir de las capturas, no el archivo
   original.
4. Definir si se suma pauta paga (Meta Ads) más adelante — hoy la campaña es orgánica.
