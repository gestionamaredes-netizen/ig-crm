# Documentos del Drive, en PDF para imprimir

Al lado de cada documento de Google del Drive va un PDF con el logo de Nexo
y el del programa. El documento sigue siendo el editable; el PDF es el que se
imprime y el que se manda.

**72 PDF en 50 carpetas.** Ninguna carpeta queda vacía.

## Por qué existe esta carpeta

Hasta acá el texto de los documentos vivía sólo en el Drive. El repositorio no
lo tenía, así que no se podía regenerar nada ni revisarlo en frío. Ahora el
texto vive en `fuente/` y el PDF sale de ahí.

## Cómo se usa

```
python3 extraer.py            baja el texto de los documentos del Drive a fuente/
python3 pdf.py                arma los 61 PDF y verifica que ninguno se recorte
python3 pdf.py tercer         sólo los que coincidan, para probar
python3 vista.py <archivo> 3  captura PNG de una página, para mirar el diseño
python3 paquete.py            arma el ZIP con el árbol igual al del Drive
```

## Cómo entra al Drive

El conector no puede subir binarios: un JPG de 19.246 bytes llegó del otro
lado con 11.894. No es cuestión de tamaño, la transferencia se corta a la
mitad y ni el conector ni el Drive avisan. Por eso los PDF se entregan en
`Nexo-Studios-PDF-para-el-drive.zip`, con el árbol de carpetas igual al del
Drive: se descomprime y cada carpeta se arrastra a la carpeta del mismo
nombre.

## Cómo está hecho el PDF

Dos pasadas de Chromium por documento. La primera mide cuánto ocupa cada
bloque y cuánto el encabezado; la segunda imprime con las páginas ya
repartidas y numeradas. Medir no es opcional: `overflow:hidden` recorta en
silencio, y el alto de la portada depende del largo del título.

Tres cosas que el código comprueba solo, porque las tres ya fallaron una vez:

- **Ningún cuerpo de letra baja de 12 pt impresos**, y el texto corrido va en
  13,5. La cuenta es `pt = px × 0,75`, que vale porque la página mide
  794×1123 px con `@page` del mismo tamaño: eso imprime 210×297 mm a 96 dpi
  exactos.
- **Nada de `filter:`**. Un solo `blur()` o `drop-shadow()` obliga a Chromium
  a rasterizar la página entera y el PDF pasa de 90 KB a varios MB.
- **Ninguna página se pasa de alto.** Se mide en el navegador, sobre el HTML
  final, la distancia entre el final del texto y el pie.

Los formularios no se copian como estaban. En el documento, un campo es una
fila de puntos, y a 78 caracteres monoespaciados no se llega al piso de
legibilidad en A4. Acá cada campo es un campo de verdad: etiqueta, línea
punteada y el ancho proporcional al que tenía en el documento. Los casilleros
son cuadros, las filas de escaleta son barras con la hora, y las rayas de
guiones que las enmarcaban se van, porque la barra ya separa.

## El id de cada documento se pisa cuando se reemplaza

El Drive no deja actualizar un documento en su lugar por este camino: se crea
uno nuevo con el contenido nuevo y se manda el viejo a la papelera. Eso
significa que el id que guarda `_indice.json` deja de existir en cuanto un
documento se reemplaza, y si no se actualiza ahí mismo, la próxima vez que
alguien quiera reemplazar ese documento va a buscar un id que ya no está: el
borrado falla (contesta "no tenés permiso", que es confuso, porque lo que
pasa es que el archivo no existe) y queda una copia duplicada en la carpeta.

Así que al reemplazar un documento hay tres pasos y ninguno es opcional:
crear el nuevo, mandar el viejo a la papelera, y escribir el id nuevo en
`_indice.json`. Si el id que figura acá no existe, la forma de recuperar el
verdadero es listar la carpeta por `parentId` y buscarlo por título.

## Los archivos

| | |
|---|---|
| `fuente/` | el texto de los 61 documentos, más `_indice.json` con título, id y carpeta |
| `mapa.py` | qué carpeta del Drive es cada id, y de qué programa es |
| `pdf.py` | el armador: interpreta el texto, mide, reparte e imprime |
| `vista.py` | captura de una página suelta, para mirar el diseño |
| `paquete.py` | el ZIP y la verificación carpeta por carpeta |
| `marca/` | el logo de Nexo y el de cada programa |
| `pdf/` | la salida, con el árbol igual al del Drive |
