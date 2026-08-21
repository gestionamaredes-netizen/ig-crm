# La 80 Pizzería — Campaña Instagram + SEO Local

**Fecha:** 2026-08-10 · **Revisado:** 2026-08-21
**Estado:** plan vigente — eje de contenido redefinido (sin humor, posicionamiento premium/educativo) + podcast quincenal
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

**Revisado 2026-08-21.** El eje de la campaña gira de "más seguidores" a construir una marca
gastronómica reconocible. La comunicación **no busca humor**: busca posicionar calidad, oficio y
confianza, con un tono premium, artesanal, cercano y educativo. La viralidad no desaparece, cambia
el mecanismo — se persigue por producto + conocimiento + proceso + deseo + experiencia, no por
chistes. El detalle completo vive en la propuesta aparte (ver "Material entregado al cliente").

1. **Instagram como generador de pedidos**, no de vanity metrics: cada pieza de producto termina en
   el link de WhatsApp de pedidos.
2. **Construir una marca gastronómica de referencia en Isidro Casanova** — no una cuenta de
   entretenimiento — a partir de mostrar el producto, el oficio y los procesos reales del local.
3. **Ficha de Google completa y por encima del resto del rubro en Isidro Casanova**, para capturar
   la búsqueda "pizzería Isidro Casanova" / "pizza a domicilio Isidro Casanova".
4. Sostener las **4 noches de apertura llenas**, con picos los viernes y sábados.

## Plan de Instagram — programa de 120 días

Se abandona el planteo de "calendario semanal fijo" a favor de un **programa estratégico de 120
días** en 4 fases de 30 días (Posicionamiento → Autoridad → Deseo → Conversión), con 7 pilares de
contenido y series reconocibles. El desarrollo completo está en
[`propuesta-120-dias-a4.html`](./propuesta-120-dias-a4.html); acá el resumen operativo.

### Los 7 pilares

Producto · El arte de hacer pizza · Calidad e ingredientes · Contenido de valor ("escuela de pizza")
· La experiencia La 80 · Identidad local (Isidro Casanova / Zona Oeste) · **Podcast quincenal**.

### Podcast — "Charlas en la 80"

Novedad de esta revisión: **una grabación cada 15 días, en el propio local**, 20–30 minutos de
conversación entre el dueño (o quien atienda) y un invitado. 8 episodios en los 120 días, 2 por
fase, con invitados que van de la historia del local (fase 1) a colegas del oficio (fase 2),
creadores gastronómicos de la zona (fase 3) y clientes frecuentes / comercios vecinos (fase 4). Cada
episodio se sube completo a YouTube/Spotify y se recorta en 2 a 4 reels para Instagram.
Detalle completo en la sección 05 de la propuesta.

### Bio, highlights y link

- Bio: nombre completo con ubicación — *"Pizzería a la piedra · Isidro Casanova · Jue a Dom 20 a 23:30"*.
- Un solo link de bio: WhatsApp directo con mensaje predefinido ("Hola, quiero hacer un pedido").
  Mientras no haya landing, no diluir con linktrees de varios destinos.
- Highlights fijos: **Carta** (capturas del menú, siempre actualizado con precios), **Ubicación**
  (mapa + fachada), **Pedidos** (cómo se pide), **Charlas en la 80** (recortes del podcast),
  **Clientes** (fotos/reseñas que etiqueten la cuenta).

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

## Material entregado al cliente

Piezas imprimibles a A4, en HTML con hoja de estilos de impresión (mismo patrón que
`docs/campo/cesion-imagen-a4.html`), exportadas a PDF y enviadas:

- [`ficha-google-a4.html`](./ficha-google-a4.html) — guía paso a paso para crear y verificar la
  ficha de Google Business Profile, con los datos del negocio ya cargados.
- [`propuesta-120-dias-a4.html`](./propuesta-120-dias-a4.html) — propuesta estratégica completa:
  posicionamiento de marca, 7 pilares de contenido (incluye el podcast quincenal), las 4 fases de
  120 días, series, funnel de captación, captación geográfica, colaboraciones, producción y
  métricas. **Reemplaza** al `analisis-estrategias-a4.html` original (2026-08-10), que quedó
  superado por este enfoque.
- [`voz-y-ganchos.md`](./voz-y-ganchos.md) — guía de tono con dos familias de gancho (educativo y de
  vida cotidiana) y banco de ganchos listos para usar, actualizado a medida que se suman más.

## Cronograma — primeras 4 semanas

| Semana | Foco |
|---|---|
| 1 | Auditar y completar la ficha de Google (checklist de arriba). Rearmar bio e highlights de IG. Coordinar fecha del primer episodio del podcast. |
| 2 | Arranca la fase 1 (Posicionamiento) del programa de 120 días. Pedir las primeras reseñas activamente. |
| 3 | Grabar y publicar el primer episodio de "Charlas en la 80". Revisar métricas de la semana 2. |
| 4 | Balance del mes: puntaje de la ficha, reseñas ganadas, alcance de IG, pedidos atribuibles a WhatsApp, primer episodio de podcast publicado. |

## KPIs a seguir

- Reseñas de Google: cantidad y puntaje (piso 10 reseñas / 4.0).
- Alcance, guardados y compartidos de Instagram por pieza (los guardados importan más que los likes
  en un contenido educativo).
- Reproducciones y retención de los episodios del podcast, completo y en recortes.
- Clics al link de WhatsApp desde la bio de IG.
- Pedidos por WhatsApp en las noches de apertura (referencia cualitativa hasta que haya forma de
  atribuir automáticamente — este CRM ya soporta atribución de leads por campaña en `lib/pautas/`
  si más adelante se suma pauta paga).

## Pendientes

1. Auditar la ficha real de Google de La 80 con el módulo SEO Local (falta la UI del módulo — hoy
   solo existe el motor de reglas; mientras tanto, el checklist de arriba se verifica a mano).
2. Definir si se arma una landing de una pantalla o se deja el link de bio apuntando directo a WhatsApp.
3. ~~Conseguir el archivo de marca real~~ — resuelto 2026-08-21: logo oficial cargado en
   `web/public/logos/la80.png` y en el material impreso.
4. Definir si se suma pauta paga (Meta Ads) más adelante — hoy la campaña es orgánica.
5. Validar el nombre del podcast ("Charlas en la 80" es la propuesta) y coordinar día/horario fijo
   cada 15 días para la grabación en el local.
6. Definir quién edita y sube el episodio completo (YouTube/Spotify) además de los recortes para IG.
