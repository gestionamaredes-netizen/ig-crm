# Iniciativa Global — Identidad visual

**Fecha:** 2026-07-20
**Fuente:** `web/public/marca/ig-manual-de-marca.png` y `ig-logo-circulo.png` (1254 × 1254 cada uno)

Los valores de esta página **no están estimados a ojo**: se muestrearon píxel por píxel de los
archivos originales con canvas. Cualquier corrección debe hacerse volviendo a muestrear, no
copiando de acá.

## Marca

**Nombre:** Iniciativa Global
**Bajada:** Creamos conexiones. Generamos impacto.
**Servicios declarados en el manual:** Influencers · Producción audiovisual · Marketing digital ·
Contenido viral · Publicidad cinematográfica

El isotipo es un monograma **IG** donde la I y la G comparten un corte diagonal. La G tiene el
travesaño resuelto como una flecha que apunta hacia adentro.

## El gradiente de marca

Recorre cinco tonos, de celeste a naranja. Es la firma visual de la identidad: sin él, la marca no
se reconoce.

| Parada | Color | Dónde se muestreó |
|---|---|---|
| 1 | `#15A6F6` | extremo superior de la I |
| 2 | `#812AEE` | medio de la I |
| 3 | `#C213E2` | base de la I / arranque de la G |
| 4 | `#FA3A66` | base de la G |
| 5 | `#FE7843` | remate derecho de la G |

```css
--ig-grad: linear-gradient(135deg,#15A6F6 0%,#812AEE 26%,#C213E2 48%,#FA3A66 76%,#FE7843 100%);
```

**Dirección:** el gradiente va de celeste (arriba-izquierda) a naranja (abajo-derecha). Invertirlo
lee como otra marca.

## Paleta

Muestreada de la franja al pie del manual.

### Gradiente, tonos sólidos

Para cuando hace falta un color plano del gradiente (íconos, etiquetas, series de gráficos).

| Token | Color | Uso |
|---|---|---|
| `--ig-violeta` | `#934ABC` | |
| `--ig-magenta` | `#B84295` | |
| `--ig-rosa` | `#DD5074` | |
| `--ig-naranja` | `#F17856` | |

### Secundario — teal

| Token | Color | Uso |
|---|---|---|
| `--ig-teal` | `#2B92A7` | color secundario de la marca |
| `--ig-teal-claro` | `#73C7D4` | fondos suaves, estados apagados |

El teal es el **contrapunto frío** del gradiente cálido. Es lo que evita que todo termine siendo
una mancha rosa. Hoy no existe en el sistema de la app.

### Neutros

| Token | Color | Uso |
|---|---|---|
| `--ig-negro` | `#0F100F` | fondo del logo circular |
| `--ig-carbon` | `#1E1D21` | neutro oscuro del manual |
| `--ig-gris-claro` | `#DFDEDE` | neutro claro del manual |

## Versiones del logo

El manual muestra cinco, de las cuales **solo tenemos archivo de una**:

| Versión | Para qué | ¿Tenemos archivo? |
|---|---|---|
| Gradiente sobre fondo oscuro | Uso principal | **Sí** — `ig-logo-circulo.png` |
| Monocromo negro sobre claro | Impresión, fax, sellos, documentos | **No** |
| Monocromo blanco sobre oscuro | Sobre foto, marca de agua | **No** |
| Trazo / construcción | Manual, usos técnicos | **No** |
| Ícono de app | Favicon, perfiles | **No** (recortable del circular) |

### Qué falta y por qué importa

**No hay vectores.** Los dos archivos son PNG de 1254 px. Alcanza para pantalla y para impresión
chica, pero **no para nada por encima de ~10 cm**: cartelería, lonas, vidrieras, remeras. El día que
haga falta un banner para un evento, el logo va a salir pixelado y no hay forma de arreglarlo desde
el PNG.

**No hay versión monocromo.** Es la que se necesita para todo lo impreso en blanco y negro —
incluida la planilla de encuesta de Gorriti. El PNG circular tiene fondo negro sólido: impreso sobre
papel blanco es un disco negro que consume medio cartucho por hoja.

**No hay fondo transparente.** El circular trae el fondo pegado, así que no se puede montar sobre
otro color.

**Recomendación:** pedir al diseñador el **SVG del isotipo y del logotipo completo**, en las tres
variantes (gradiente, negro, blanco), con fondo transparente. Es un pedido de diez minutos para
quien tenga el archivo editable, y destraba todo el material impreso.

## Aplicación en material impreso

Mientras no exista la versión monocromo:

- **No usar** `ig-logo-circulo.png` sobre papel blanco.
- Resolver la cabecera con **lockup tipográfico**: el nombre en mayúsculas espaciadas más una barra
  fina con el gradiente. Es lo que hace la [planilla de encuesta de Gorriti](../campo/encuesta-gorriti-a5.html).
- La barra de gradiente es la única tinta de color de la hoja: da identidad sin arruinar el costo
  de impresión.

## Tipografía

El manual usa una **sans geométrica en mayúsculas con tracking abierto** para el logotipo
("INICIATIVA GLOBAL") y para la bajada. No está declarado el nombre de la familia y no se puede
identificar con certeza desde un PNG.

Hasta confirmarlo con el diseñador, el material propio usa la sans del sistema con
`letter-spacing` abierto en los títulos, que es lo que reproduce el gesto sin fingir una fuente que
capaz no es.

**Pendiente:** preguntar qué tipografía es.

## Diferencias con el sistema actual de IG OS

`web/app/globals.css` **no coincide** con la marca muestreada.

| Concepto | En la app hoy | En el logo real | Veredicto |
|---|---|---|---|
| Arranque del gradiente | `--g1: #5e5ce6` índigo | `#15A6F6` celeste | no coincide |
| Segundo tono | `--g2: #b14bff` | `#812AEE` / `#C213E2` | cercano |
| Tercer tono | `--g3: #ff6b6b` coral pastel | `#FA3A66` saturado | apagado |
| Cuarto tono | `--g4: #ff9966` durazno | `#FE7843` saturado | apagado |
| Secundario frío | `--info: #5b9dff` azul | `#2B92A7` teal | falta el teal |
| Fondo | `--bg: #0b0b0d` | `#0F100F` | equivalente |

El gradiente de la app arranca en índigo donde la marca arranca en celeste, y cierra en pasteles
donde la marca es saturada. El resultado es que la app se ve **más apagada y más fría** que el logo
que lleva arriba.

**Decisión pendiente:** si se alinea `globals.css` al gradiente real. Es un cambio de una línea pero
repinta toda la aplicación, así que lo decide el dueño de la marca, no este documento.
