# Hojas de estructura de trabajo

Una hoja A4 por programa, fondo blanco, para la carpeta `1 · Formato` de cada
programa en el Drive. Es el papel que resume qué es el programa, cómo es la
escaleta, cómo es la semana y qué falta definir.

```bash
./build-estructuras.sh
```

Genera `Nexo-<programa>-estructura.pdf`, uno por programa, más
`Nexo-grilla-de-programacion.pdf` con la semana entera.

## Los archivos

| Archivo | Qué es |
|---|---|
| `datos.py` | Todo el contenido: ficha, escaleta, semana, qué falta, y la grilla |
| `estructura.py` | Arma el HTML y el CSS de las hojas de programa |
| `grilla.py` | Arma la hoja de la semana, reusando ese CSS |
| `verificar.py` | Mide cada página y falla si algo se desborda |
| `build-estructuras.sh` | Corre los tres pasos y saca los PDF |

Para cambiar un horario o un bloque se edita `datos.py` y se vuelve a correr
el build. No hace falta tocar el HTML.

## Tamaño de letra

La página mide 794 px y se imprime a 210 mm, o sea 96 dpi exactos: **un px CSS
es 0,75 pt en el papel**. Para que nada baje de 13 pt, ningún cuerpo puede ser
menor a 18 px. `estructura.py` lo verifica solo: lee todos los `font-size` del
CSS y falla el build si alguno queda corto.

## Por qué hay un verificador de páginas

`.page` tiene `overflow:hidden`, así que Chromium recorta en silencio lo que no
entra y el PDF sale sin el párrafo de más, sin ningún error. `verificar.py`
mide `scrollHeight` del contenido contra la altura de la página y falla el
build antes de imprimir.

## Dos reglas del CSS

- **Nada de `filter:`.** Cualquier `blur()`, `drop-shadow()` o `saturate()`
  obliga a Chromium a rasterizar la página entera al imprimir, y el PDF pasa
  de 90 KB a varios MB.
- **Un solo `.spacer` por página**, justo antes del pie. Es lo que mantiene el
  pie abajo sin depender de que el contenido llene la hoja.

## Por qué pesan poco

Sin imágenes y sin fuentes embebidas, cada hoja queda entre 80 y 115 KB. Eso
es lo que permite subirlas al Drive desde esta sesión: el conector manda texto,
así que un binario viaja en base64 y el costo es proporcional al peso.

## Los cruces de la grilla no se escriben a mano

`datos.GRILLA` tiene los horarios y `datos.ARMADO` cuánto tarda en quedar
listo el piso de cada programa. `datos.transiciones()` compara el hueco entre
dos programas contra lo que necesita el que viene, y `grilla.py` marca en rojo
los que no cierran y escribe el aviso solo.

Si mañana se mueve un horario, se edita `GRILLA`, se vuelve a correr el build
y el aviso aparece o desaparece según corresponda. Nadie tiene que acordarse
de actualizar un párrafo.

Hoy avisa de dos, los dos el miércoles:

- **Exitosa Yo → El Motivo**, 30 minutos de hueco contra 45 que necesita El
  Motivo. Se resuelve solo si Exitosa Yo sale grabado, porque entonces no
  ocupa el piso.
- **El Motivo → Tercer Tiempo**, 0 minutos. Uno termina y el otro empieza en
  el mismo minuto, en el mismo piso. Este no se resuelve sin mover un horario.
