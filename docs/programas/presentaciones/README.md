# Presentaciones de propuesta

Una por programa, A4, fondo blanco. Es el PDF que se manda por mail o se
imprime para mostrar el programa completo: qué es, a quién le habla, la
escaleta, la puesta, dónde se ve, qué se puede vender y qué falta.

```bash
./build-presentaciones.sh
```

Genera `Nexo-<programa>-propuesta.pdf`, uno por programa. Ocho páginas cada
uno, nueve Tercer Tiempo, que tiene dos escaletas.

## De dónde sale el contenido

No se duplica nada. `contenido.py` fusiona dos fuentes:

| Fuente | Qué aporta |
|---|---|
| `comercial.py` | El kit de marca, lo que cubre cada integrante y cuántos kits hacen falta |
| `carpeta-programacion/contenido.py` | Sinopsis, target, pilares, distribución, tono, monetización, paleta y categorías de Sex and the Baires, Exitosa Yo y Pequeños Grandes Sabios |
| `estructuras/datos.py` | Horario, escaleta, semana de producción y qué falta, de los cinco |

Tercer Tiempo y El Motivo no estaban en la carpeta de programación, así que su
parte comercial se escribe en `PROPIOS`, dentro de `contenido.py`, con la misma
forma que los otros tres.

**El horario y la escaleta salen siempre de `estructuras/datos.py`.** Es lo que
se toca cuando cambia la grilla, y de ahí se propaga solo a las presentaciones,
a las hojas de estructura y a la hoja de programación. Un horario se corrige en
un solo lugar.

## Por qué los módulos se cargan por ruta

Este archivo también se llama `contenido.py`, así que un `import contenido` a
secas se importaría a sí mismo. `_cargar()` usa `importlib` para darle a cada
módulo un nombre propio.

## Las dos reglas del CSS

Las mismas de `estructuras/`, y por las mismas razones:

- **Nada de `filter:`.** Obliga a Chromium a rasterizar la página entera al
  imprimir y el PDF pasa de 120 KB a varios MB.
- **Un solo `.spacer` por página**, justo antes del pie.

El build verifica las dos cosas, más que ningún cuerpo de letra baje de 13 pt
impresos, y `verificar.py` mide cada página para que nada se recorte en
silencio.

## El modelo comercial

`comercial.py` tiene dos números y del cruce sale todo lo demás:

- Un **kit de marca** se vende a **150.000 por mes** de base.
- Cada integrante tiene que cubrir **150.000 por mes** de costo operativo.

Son iguales a propósito, y ahí está el modelo entero: **un kit de marca cubre
exactamente la parte de un integrante.** El objetivo de venta de cada programa
es tantos kits como gente tenga en cámara. Tercer Tiempo son seis, así que son
seis kits y 900.000 por mes.

El archivo verifica solo que eso siga siendo cierto. Si mañana el kit sube y
el costo no, la aserción falla y avisa que la frase «un kit por integrante» ya
no se puede escribir.

Pequeños Grandes Sabios queda fuera de esa cuenta a propósito: los cinco
chicos no son socios que cubren un costo, son menores con autorización de sus
familias. Ahí el ingreso sale del naming del ciclo y de las acciones
educativas. Está marcado en `SIN_MODELO_POR_INTEGRANTE` y la presentación
imprime otra cosa para ese programa.

## Las imágenes

`marca/` tiene el logo de cada programa en JPEG de unos 50 KB, reducido desde
el original que vive en `carpeta-programacion/assets/`. Va embebido en la
portada como data URI, no enlazado, porque el PDF tiene que viajar solo.

Se usa la versión reducida y no el original a propósito: el original de Tercer
Tiempo pesa 2,4 MB y metería eso adentro de cada PDF. Con la reducida, cada
propuesta queda en unos 200 KB.

El logo va enmarcado en un panel negro. No es decoración: el arte de estos
logos está hecho para ir sobre negro, y suelto sobre el blanco de la página
aparece un recuadro gris alrededor.
