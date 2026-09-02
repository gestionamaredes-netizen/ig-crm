# Aqua Mar — marca

Cómo se usa la identidad en el sitio. Los colores **no están estimados a ojo**:
se muestrearon píxel por píxel del logo oficial. Si hay que corregir algo, se
vuelve a muestrear del archivo original, no se copia de acá.

## Los archivos

| Archivo | Qué es | Cuándo usarlo |
|---|---|---|
| `img/logotipo.png` | "AQUAMAR" con la onda, fondo transparente | El principal. Encabezado, pie, papelería sobre fondo claro. |
| `img/logotipo-blanco.png` | Lo mismo, con fondo blanco sólido | Donde la transparencia moleste (algunos editores, WhatsApp Business). |
| `img/logotipo-inverso.png` | "AQUA" en blanco y "MAR" en celeste claro | Sobre azul o fotos oscuras: el azul marino original ahí desaparece. |
| `img/sello.png` | El sello circular completo, 512 px, transparente | Portada, redes, etiquetas. Necesita tamaño: abajo de 80 px no se lee la letra chica. |
| `img/favicon.svg` | Dos ondas sobre el azul de marca | Pestaña del navegador. El sello completo a 16 px queda ilegible; esto conserva lo que sí se reconoce. |
| `img/apple-touch-icon.png` | El sello sobre blanco, 180×180 | Cuando alguien guarda el sitio en la pantalla de inicio. |
| `img/og.jpg` | 1200×630 con el sello y la bajada | Lo que se ve al compartir el link por WhatsApp o redes. |

**Aire mínimo:** alrededor del logotipo, un margen igual al alto de la letra "A".
**Tamaño mínimo:** el logotipo, 90 px de ancho en pantalla. El sello, 80 px.

**Qué no hacer:** cambiarle los colores, estirarlo, rotarlo, ponerle sombra,
apoyar el logotipo azul sobre fondo oscuro (para eso está el inverso) ni usar el
sello tan chico que no se lean "DISTRIBUIDORA" y los valores.

## Paleta

Muestreada del logotipo y del sello.

| Token | Color | De dónde salió | Dónde se usa |
|---|---|---|---|
| `--azul-600` | `#053388` | trazos de "AQUA" y la onda | **color principal**: botones, títulos de acento |
| `--azul-700` | `#00307A` | fondo del banner, arriba | hover de botones, arranque del degradado |
| `--azul-500` | `#055AB4` | fondo del banner, abajo | cierre del degradado |
| `--azul-900` | `#00245C` | — | bloques oscuros |
| `--celeste-600` | `#0C85A2` | trazos de "MAR" | color secundario |
| `--celeste-400` | `#3FC6E0` | — | foco de los campos, ondas del favicon |
| `--celeste-300` | `#7FD8E8` | — | texto de acento sobre azul, bordes al pasar el mouse |
| `--sol` | `#EDB730` | el sol del sello | reservado para destacar algo puntual |

| Neutro | Color | Dónde |
|---|---|---|
| `--fondo` | `#F4F8FC` | fondo de la página |
| `--tinta` | `#0E2136` | texto principal |
| `--suave` | `#5A7290` | texto secundario |
| `--borde` | `#DCE4EE` | bordes y separadores |

**Degradado de marca:** `linear-gradient(160deg, #00307A, #014397 55%, #055AB4)`.
Es el del banner oficial. Va siempre de arriba-oscuro a abajo-claro.

El verde de WhatsApp (`#25D366`) no es color de marca: se usa solo en ese botón,
porque ahí la gente lo reconoce por el color.

## Tipografía

La del sistema operativo, sin fuentes que descargar:

```css
ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif
```

Carga instantánea y se ve nativa en cada dispositivo. El logotipo tiene su
propia tipografía y viene como imagen, así que no hace falta identificarla para
que el sitio se vea bien. Si algún día necesitás piezas impresas con ese mismo
tipo de letra, pedile los archivos originales a quien diseñó el logo.

## Cómo se escribe

- **Aqua Mar** — dos palabras, en el texto corrido.
- **AQUAMAR** — todo junto y en mayúsculas solo dentro del logotipo.
- **Distribuidora oficial Powerful** — es la bajada que usa el material oficial.
- **Calidad · Confianza · Compromiso** — los tres valores del sello, en ese orden.

> **Un detalle a confirmar.** El sello y el banner dicen **POWERFUL**, con una
> sola L al final, y el sitio sigue esa forma. En el pedido original figuraba
> "Powerfull". Si la marca del producto lleva doble L, es buscar y reemplazar en
> `index.html`.

## Reglas que sostienen el celular

Están en el CSS y conviene no romperlas:

1. **Los campos van a 16px.** Safari en iPhone hace zoom automático al enfocar un
   campo con fuente menor y deja la página corrida.
2. **Todo lo que se toca mide 44px o más** de alto (48px en los botones).
3. **Nada empuja la página al costado.** Si aparece scroll horizontal, hay algo
   que no puede encogerse: casi siempre falta un `min-width: 0`.
