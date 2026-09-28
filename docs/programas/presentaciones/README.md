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
