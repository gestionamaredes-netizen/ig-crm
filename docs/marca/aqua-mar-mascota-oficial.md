# Aqua Mar Distribuidora — Mascota oficial (concepto)

**Fecha:** 2026-08-07
**Pedido:** mascota oficial de Aqua Mar Distribuidora, estilo Chavecito (Vívere) — simple, cartoon,
cara grande, apta para redes y packaging.
**Fuentes:** logo de Aqua Mar Distribuidora, landing de Aqua Mar (venta de Powerful en Zona Oeste),
packaging de Powerful (cápsulas 3en1), y una referencia de estilo/tono: Jabberjaw.

Aqua Mar todavía no tiene assets propios en este repo — es contenido nuevo. Este documento y el SVG
que lo acompaña son un **boceto de concepto**, no arte final: sirven para validar personaje, nombre
y paleta antes de briefear a un ilustrador.

Ficha visual completa (paleta, expresiones, uso): `mascota-aqua-mar.html` (ver artifact adjunto en
la conversación). Asset del personaje: [`web/public/marca/aqua-mar/mascota-concepto.svg`](../../web/public/marca/aqua-mar/mascota-concepto.svg).

## El personaje: Marito

**Especie:** tiburón. Se eligió por tres motivos, no por capricho:

1. Conecta directo con el nombre de la marca — Aqua **MAR**.
2. La referencia de estilo que se pidió (Jabberjaw) ya es un tiburón — mismo espíritu de dibujo
   simple y sonrisa enorme.
3. Encaja con "Powerful": un tiburón vende fuerza sin esfuerzo.

**El chiste central del personaje:** es un tiburón obsesionado con lo impecable. No da miedo a la
gente — le da miedo a la mugre. Ataca manchas, no personas.

**Personalidad:**

- Enérgico, resolutivo, sonríe siempre (dientes prolijos, no filosos)
- Maniático de la limpieza — irónico en un tiburón
- Vendedor de confianza de barrio (Zona Oeste), no tono corporativo

## Nombre

| Opción | Rationale |
|---|---|
| **Marito** (propuesta) | Mar + diminutivo. Sale directo del nombre de la marca, fácil de decir en un audio de WhatsApp. |
| Tibu | Más corto, más "sticker", menos ligado a la marca. |
| Capitán Aqua | Más heroico — útil si a futuro se quiere una línea "superhéroe de la limpieza". |

Queda a confirmar con el cliente antes de avanzar a arte final.

## Paleta

La del cuerpo y el pañuelo **no está inventada**: se muestreó píxel por píxel del isotipo de Aqua
Mar que mandó el cliente (mismo método que se usó para la marca de Iniciativa Global — ver
[`identidad-visual.md`](./identidad-visual.md)).

| Token | Color | Uso | Origen |
|---|---|---|---|
| `--am-azul` | `#0B4DA2` | Cuerpo (arranque del degradé) | muestreado del texto "AQUA" del isotipo |
| `--am-teal` | `#0B90A4` | Cuerpo (cierre del degradé) | muestreado del texto "MAR" del isotipo |
| `--am-teal-claro` | `#4FD3D9` | Espuma, burbujas, acentos | derivado del teal, no muestreado |
| `--am-sol` | `#F5B70C` | Pañuelo al cuello | muestreado del sol del isotipo |

Acentos que son **licencia del personaje**, no paleta de marca:

| Token | Color | Uso |
|---|---|---|
| `--marito-mejillas` | `#FF8FA8` | Mejillas |
| `--marito-boca` | `#B23A4E` | Interior de la boca |
| `--marito-tinta` | `#0B2E57` | Contornos de ojos/cejas/branquias |

**Pendiente:** si en algún momento aparece el manual de marca oficial de Aqua Mar (no lo mandaron,
solo el PNG del isotipo), reconfirmar estos hex contra ese archivo.

## Diseño visual

- Careta blanca a modo de antifaz que enmarca la cara — el cuerpo (degradé azul→teal) queda como
  un "casco" alrededor, referencia visual a una capucha de neoprene/buzo.
- Ojos grandes, cejas amistosas, mejillas rosadas — registro cartoon simple, cabeza grande respecto
  al cuerpo (proporción chibi), en línea con lo simple que es Chavecito.
- Sonrisa amplia con dientes prolijos y parejos — el gag visual es que un tiburón es la cara de la
  limpieza.
- Aleta dorsal, dos aletas pectorales (una saludando) y cola — lo mínimo para que se lea "tiburón"
  sin perder la silueta cabezona.
- Pañuelo amarillo al cuello con un pequeño sol — referencia directa al sol del isotipo de Aqua Mar.

## Expresiones para stickers

Con esta misma cara ya se arma un set chico sin tocar el cuerpo: **feliz** (default), **sorpresa**,
**guiño**, **durmiendo**. Están dibujadas en la ficha visual (`mascota-aqua-mar.html`); no se
versionaron como SVG individuales todavía porque son variantes menores de la cara, no del
personaje.

## Uso

**Sí:**

- Avatar del bot / atención de pedidos por WhatsApp
- Reels e historias de Instagram — reacciones cortas con las expresiones
- Esquina de packaging o cartelería de punto de venta
- Frases cortas propias del personaje ("¡Llegó Powerful!", "Marito lo aprueba")

**No:**

- Versión "agresiva" con dientes filosos — el chiste es que le da miedo a la mugre, no a la gente
- Recolorear fuera de esta paleta
- Estirar o achatar el cuerpo — la proporción cabezona es la gracia del personaje

## Estado y próximo paso

Este es un boceto armado con formas geométricas simples (círculos, elipses, curvas bézier a mano),
pensado para validar la idea rápido. **No reemplaza el trabajo de un ilustrador.**

1. Confirmar personaje y nombre con el cliente.
2. Briefear a un ilustrador con esta ficha para la versión final vectorizada + variantes de
   expresión +, si hace falta, un rig simple para animar en Reels.
3. Pedir el archivo editable (Figma / Illustrator) desde el día uno — es el mismo problema que ya
   tiene el logo de Iniciativa Global (solo PNG, sin fuente editable) y ahí costó destrabarlo.
