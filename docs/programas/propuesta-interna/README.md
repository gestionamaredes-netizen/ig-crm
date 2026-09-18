# Nexo Studios — Propuesta interna de programación

Documento **interno**: qué es cada proyecto, cómo está armado y por dónde sale.
Sin cotización, sin argumento de venta y sin paquetes comerciales.

**Entregable:** `Nexo-Studios-propuesta-interna.pdf` — 7 páginas, 1080×1920 px
(vertical, con la tipografía grande para leerlo cómodo en el celular).

| Página | Contenido |
|---|---|
| 1 | Portada: los cinco proyectos con bajada y franja (hace de resumen de grilla) |
| 2 | Sex and the Baires |
| 3 | Exitosa Yo |
| 4 | Tercer Tiempo |
| 5 | El Motivo |
| 6 | Pequeños Grandes Sabios |
| 7 | Estudio y equipo |

Cada proyecto lleva: logo, concepto, ficha (formato, duración, frecuencia, quiénes
están en cámara), estructura por bloques y por dónde sale. Pequeños Grandes Sabios
suma su protocolo de menores; Tercer Tiempo y El Motivo, el estado del proyecto.

El contenido de Tercer Tiempo sale de `../tercer-tiempo-formato.md`, la biblia que ya
estaba en el repo.

## Qué está confirmado y qué no

- **Solo Tercer Tiempo y El Motivo tienen día y franja** (miércoles y domingos de 20 a
  22 h, y martes de 21 a 23 h). Los otros tres figuran como "a definir" en la portada.
- **Tercer Tiempo no tiene plataforma definida** ni nombres de elenco: así figura.
- **Exitosa Yo: conflicto de color.** Su manual de marca declara rosa `#FF2D8B` y el
  logo que tengo es rosa, pero el póster de la grilla 2026 la muestra en dorado. El PDF
  usa el rosa del manual. Si la versión final es la dorada, hace falta el logo suelto
  en esa versión para reemplazarlo.
- **Roko y Paula están propuestos** para la co-conducción de El Motivo; falta su
  confirmación. Así figura en el PDF.
- Las duraciones por bloque de los tres programas de Nexo son una propuesta de
  producción. Los de El Motivo salen de su propia carpeta.
- El Motivo es **un ciclo de Somos Como Somos** (canal de Ibiza, España) que se graba
  en Nexo Studios — no es un programa propio del estudio. El documento lo dice.

## Regenerar el PDF

```bash
./build-interna.sh                  # usa el Chromium de /opt/pw-browsers
./build-interna.sh /ruta/a/chromium # o indicá otro binario
```

- `contenido.py` — **todo el texto**. Es el único archivo a tocar para cambiar datos.
  Los acentos de cada programa salen muestreados de su logo: Sex and the Baires
  `#F00030`, Tercer Tiempo `#50D000`, El Motivo `#F8A858`; Exitosa Yo `#FF2D8B` y
  Pequeños Grandes Sabios `#FFD21C` vienen declarados en sus manuales de marca.
- `interna.py` — maquetación.
- `estilos.css` — sistema visual.

Los logos, las fuentes y el logo de Nexo se leen de `../carpeta-programacion/assets/`,
así hay una sola copia de cada archivo. Si cambia un logo, cambia en los dos documentos.

## Relación con la carpeta de programación

Son dos documentos distintos y se mantienen por separado:

| | `propuesta-interna` | `carpeta-programacion` |
|---|---|---|
| Para quién | Equipo, puertas adentro | Marcas, patrocinadores, inversores |
| Formato | Vertical, celular, 7 págs | Apaisado 16:9, 19 págs |
| Contenido | Solo información | Pitch: target, monetización, PNT, paquetes |
| Proyectos | Los cinco | Los tres de Nexo |

Un cambio de dato (una frecuencia, un nombre) hay que aplicarlo en los dos.
