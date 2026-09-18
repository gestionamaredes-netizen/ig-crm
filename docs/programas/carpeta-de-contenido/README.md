# Nexo Studios — Carpeta de contenido 2026

Qué es cada programa, cómo está armado y por dónde sale. Pensada para presentar
la grilla — a inversores, socios o equipo — sin meterse con números ni paquetes
comerciales, que van aparte en la carpeta de programación.

**Entregable:** `Nexo-Studios-carpeta-de-contenido.pdf` — 7 páginas, 1080×1920 px.
Vertical y pensado para el celular: cada programa abre con su key art a sangre y la
estructura se lee como una lista de episodios, al estilo de un canal de streaming.

Tipografía: **Sora** para títulos, **Inter** para textos y **Barlow Condensed** para
números y etiquetas.

| Página | Contenido |
|---|---|
| 1 | Portada: el póster de programación 2026 a sangre + franja con la grilla semanal |
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
  22 h, y martes de 18 a 20 h, hora de Argentina). Los otros tres figuran como
  "a definir" en la portada.
- **Tercer Tiempo no tiene plataforma definida** ni nombres de elenco: así figura.
- **Exitosa Yo pasó de rosa a dorado.** El logo final es el dorado; el manual de marca
  rosa que había antes quedó viejo. El acento `#D0A860` sale muestreado de ese logo.
- **Roko y Paula están propuestos** para la co-conducción de El Motivo; falta su
  confirmación. Así figura en el PDF.
- Las duraciones por bloque de los tres programas de Nexo son una propuesta de
  producción. Los de El Motivo salen de su propia carpeta.
- El Motivo es **un ciclo de Somos Como Somos** (canal de Ibiza, España) que se graba
  en Nexo Studios — no es un programa propio del estudio. El documento lo dice.

## Regenerar el PDF

```bash
./build-carpeta-contenido.sh                  # usa el Chromium de /opt/pw-browsers
./build-carpeta-contenido.sh /ruta/a/chromium # o indicá otro binario
```

- `contenido.py` — **todo el texto**. Es el único archivo a tocar para cambiar datos.
  Los acentos de cada programa salen muestreados de su logo: Sex and the Baires
  `#F00030`, Exitosa Yo `#D0A860`, Tercer Tiempo `#50D000` y El Motivo `#F8A858`.
  Pequeños Grandes Sabios usa el `#FFD21C` declarado en su manual de marca.
- `carpeta.py` — maquetación.
- `estilos.css` — sistema visual.

Los assets se leen de `../carpeta-programacion/assets/`, así hay una sola copia de cada
archivo. Si cambia un logo, cambia en los dos documentos.

La portada usa `grilla-2026.jpg`, el póster oficial de programación, a página completa.
El póster es 2:3 y la hoja 9:16, así que ocupa el ancho y los 300 px que sobran abajo
llevan la grilla semanal con el día de cada programa.

### Assets de key art

Cada programa tiene su logo en **formato portada**: apaisado 16:9 y sobre negro puro
(`portada-<slug>.png`, 1672×941). De ahí sale `art-<slug>.jpg`, de 1120 px de ancho,
que es el que va al hero.

Que vengan sobre negro es lo que permite mostrarlos sin marco: el hero tiene fondo
negro y el borde del archivo se vuelve invisible. El brillo de color lo pone un halo
en el color del programa, corrido hacia abajo para no iluminar la zona del logo.
Los `blur-<slug>.jpg` quedaron de la versión anterior y ya no se usan en el hero.

**No agregues `filter:` a la hoja de estilos.** Cualquier filtro de CSS obliga a
Chromium a rasterizar el elemento entero al imprimir: con desenfoques el PDF se iba a
27 MB. Sin un solo `filter:`, pesa alrededor de 2 MB.

El alto del hero está fijado por programa (`alto` en `carpeta.py`): 825 px para los que
no llevan nota al pie y 645 px para los que sí, que traen más texto abajo. De ahí sale
el tamaño del logo, porque el art se escala al espacio disponible. Si agregás texto a
un programa, hay que bajarle el hero.

## Relación con la carpeta de programación

Son dos documentos distintos y se mantienen por separado:

| | `propuesta-interna` | `carpeta-programacion` |
|---|---|---|
| Para quién | Presentar la grilla | Marcas, patrocinadores, inversores |
| Formato | Vertical, celular, 7 págs | Apaisado 16:9, 19 págs |
| Contenido | Qué es cada programa | Pitch: target, monetización, PNT, paquetes |
| Proyectos | Los cinco | Los tres de Nexo |

Un cambio de dato (una frecuencia, un nombre) hay que aplicarlo en los dos.
