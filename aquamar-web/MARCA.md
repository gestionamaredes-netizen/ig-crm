# Aqua Mar — marca

Cómo se usa la identidad, para que el sitio, el sistema de gestión y cualquier
pieza nueva se lean como la misma empresa.

> **Nota importante.** En el repositorio no había ningún logo de Aqua Mar. Lo que
> está en `docs/marca/` pertenece a Iniciativa Global, que es otra empresa. El
> isotipo de este paquete se creó a partir de la paleta y el lenguaje visual que
> ya venía usando el sistema de gestión. Si tenés un logo propio, se reemplaza en
> un solo lugar: los archivos de `img/`.

## El isotipo

Una gota con agua adentro. El nivel del agua es espacio negativo, así que se
sostiene chico: probado a 128, 56, 24 y 16 px.

| Archivo | Cuándo usarlo |
|---|---|
| `img/isotipo.svg` | El principal. Baldosa con degradado, sobre cualquier fondo. |
| `img/isotipo-mono.svg` | Una sola tinta. Toma el color del texto (`currentColor`): sirve en sellos, facturas, bordados y fondos oscuros. |
| `img/favicon.svg` | Versión simplificada para la pestaña del navegador. |
| `img/apple-touch-icon.png` | 180×180, para cuando alguien guarda el sitio en la pantalla de inicio del celular. |
| `img/og.png` | 1200×630, la imagen que se ve al compartir el link por WhatsApp o redes. |

**Aire mínimo:** dejá alrededor del isotipo un margen igual a un cuarto de su
alto. **Tamaño mínimo:** 24 px de alto en pantalla, 8 mm impreso.

**Qué no hacer:** cambiarle los colores, rotarlo, deformarlo, ponerle sombra ni
apoyarlo sobre una foto con mucho detalle.

## El nombre

El logo horizontal no es un archivo: es el isotipo más el nombre en texto
(`.marca` en `css/estilos.css`). Se arma así a propósito, porque el texto queda
siempre nítido, se adapta al ancho y usa la misma tipografía que el resto.

- **Aqua Mar** — 700, interletrado −0.02em
- **Distribuidora mayorista** — 12px, color `--suave`

Para imprenta o bordado, pedí el logo en curvas: un `<text>` en SVG depende de
qué tipografías tenga instaladas la máquina que lo abre.

## Paleta

Los mismos valores que usa el sistema de gestión (`aquamar/app/globals.css`).

| Token | Color | Dónde |
|---|---|---|
| `--marea-50` | `#eefcfb` | fondos suaves, estado apoyado |
| `--marea-100` | `#d3f6f4` | aro de foco |
| `--marea-300` | `#6fdcdb` | bordes al pasar el mouse |
| `--marea-400` | `#2fc3c4` | arranque del degradado, foco |
| `--marea-600` | `#0d848b` | **color principal**: botones y acciones |
| `--marea-700` | `#0f6a70` | cierre del degradado, links, hover |
| `--marea-900` | `#12474c` | bloques oscuros |

| Neutro | Color | Dónde |
|---|---|---|
| `--fondo` | `#f5f8fa` | fondo de la página |
| `--tinta` | `#0f2b34` | texto principal |
| `--suave` | `#5b7481` | texto secundario |
| `--borde` | `#dde7ec` | bordes y separadores |

**Degradado de marca:** `linear-gradient(135deg, #2fc3c4, #0f6a70)`.
Va siempre en esa dirección: invertido lee como otra marca.

El verde de WhatsApp (`#25d366`) no es color de marca. Se usa solo en el botón
de WhatsApp, porque ahí la gente lo reconoce por el color.

## Tipografía

La del sistema operativo, sin fuentes que descargar:

```css
ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif
```

Carga instantánea y se ve nativa en cada dispositivo. Los títulos van con
`letter-spacing: -0.02em`; los números de plata, con `tabular-nums` para que
las columnas queden alineadas.

## Reglas que sostienen el celular

Están en el CSS y conviene no romperlas:

1. **Los campos van a 16px.** Safari en iPhone hace zoom automático al enfocar un
   campo con fuente menor y deja la página corrida.
2. **Todo lo que se toca mide 44px o más** de alto (48px en los botones).
3. **Nada empuja la página al costado.** Si aparece scroll horizontal, hay algo
   que no puede encogerse: casi siempre falta un `min-width: 0`.
