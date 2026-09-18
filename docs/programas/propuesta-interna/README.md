# Nexo Studios — Carpeta de contenido 2026

Documento **interno**: qué es cada proyecto, cómo está armado y por dónde sale.
Sin cotización, sin argumento de venta y sin paquetes comerciales.

**Entregable:** `Nexo-Studios-carpeta-de-contenido.pdf` — 7 páginas, 1080×1920 px.
Vertical y pensado para el celular: cada programa abre con su key art a sangre y la
estructura se lee como una lista de episodios, al estilo de un canal de streaming.

Tipografía: **Sora** para títulos, **Inter** para textos y **Barlow Condensed** para
números y etiquetas.

| Página | Contenido |
|---|---|
| 1 | Portada tipo home de canal: destacado + grilla de tiles con día y franja |
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
./build-interna.sh                  # usa el Chromium de /opt/pw-browsers
./build-interna.sh /ruta/a/chromium # o indicá otro binario
```

- `contenido.py` — **todo el texto**. Es el único archivo a tocar para cambiar datos.
  Los acentos de cada programa salen muestreados de su logo: Sex and the Baires
  `#F00030`, Exitosa Yo `#D0A860`, Tercer Tiempo `#50D000` y El Motivo `#F8A858`.
  Pequeños Grandes Sabios usa el `#FFD21C` declarado en su manual de marca.
- `interna.py` — maquetación.
- `estilos.css` — sistema visual.

Los assets se leen de `../carpeta-programacion/assets/`, así hay una sola copia de cada
archivo. Si cambia un logo, cambia en los dos documentos.

### Assets de key art

Cada programa usa dos archivos derivados de su logo:

- `art-<slug>.jpg` — el logo a 820 px de lado, para el hero y las tiles
- `blur-<slug>.jpg` — una miniatura de 220 px con el desenfoque y la saturación **ya
  horneados**, que se usa de fondo

Esto último no es un capricho: cualquier `filter:` de CSS obliga a Chromium a rasterizar
el elemento entero al imprimir, y el PDF se iba a 27 MB. Con el desenfoque horneado en el
archivo y sin un solo `filter:` en la hoja de estilos, pesa menos de 2 MB. **Si agregás un
`filter:` al CSS, el PDF se vuelve a disparar.**

Para regenerar esos derivados hace falta rehacerlos desde los logos originales
(se generaron con canvas en Chromium headless).

## Relación con la carpeta de programación

Son dos documentos distintos y se mantienen por separado:

| | `propuesta-interna` | `carpeta-programacion` |
|---|---|---|
| Para quién | Equipo, puertas adentro | Marcas, patrocinadores, inversores |
| Formato | Vertical, celular, 7 págs | Apaisado 16:9, 19 págs |
| Contenido | Solo información | Pitch: target, monetización, PNT, paquetes |
| Proyectos | Los cinco | Los tres de Nexo |

Un cambio de dato (una frecuencia, un nombre) hay que aplicarlo en los dos.
