# El Motivo — carpeta de contenido y guiones

Cinco PDF verticales de 1080×1920, para leer desde el celular.

| Archivo | Págs | Para quién |
|---|---|---|
| `El-Motivo-carpeta-de-contenido.pdf` | 11 | El equipo, los invitados y el canal |
| `El-Motivo-30-disparadores-Fabricio.pdf` | 6 | Fabricio, conducción |
| `El-Motivo-30-disparadores-Roko.pdf` | 6 | Rodrigo García Roko, co-conducción |
| `El-Motivo-30-disparadores-Paula.pdf` | 6 | Paula González, co-conducción desde Bogotá |
| `El-Motivo-el-motivo-en-la-calle.pdf` | 7 | El que sale a grabar |

## El programa

**El Motivo · Ideas que conectan.** Martes de 18 a 20 h hora de Argentina, por el
canal **Somos Como Somos**. Se graba en **Nexo Studios**, San Martín.

Conduce **Fabricio Benjamín Ortega**. Co-conducen **Rodrigo García Roko** desde
el piso y **Paula González** desde Bogotá.

Tres ciudades: San Martín (Argentina), Bogotá (Colombia), Ibiza (España).

## Cómo están armados los 90 disparadores

30 por persona, agrupados por función y numerados corrido. Cada uno trae **la
frase de apertura entre comillas** —esa va tal cual, es la que frena el scroll— y
una línea de por dónde sigue.

**El desarrollo no está escrito a propósito.** Son sus historias: si se las
escribo, suenan a libreto. Los disparadores están armados para que cada uno los
llene con lo suyo.

Los grupos no son los mismos para los tres, porque el lugar de cada uno en el
programa es distinto:

- **Fabricio** — convocatoria · el programa por dentro · el tema · con el invitado · a la audiencia
- **Roko** — convocatoria · desde acá (Florencio Varela) · la repregunta · el tema · con el invitado
- **Paula** — convocatoria · la mirada de afuera · el tema · tu bloque · a la audiencia

### El trato, por persona

Los de Fabricio y Roko están en voseo argentino. **Los de Paula están en tuteo
colombiano**: «cuéntame», «tienes», «conoces». Si se los pasa a voseo, suena
prestado y se nota en cámara.

## El motivo en la calle

Cuatro formatos con su banco de preguntas: **¿cuánto vale tu tiempo?**, **¿cuál es
tu sueño?** (el formato que popularizó Simon Squibb), **el oficio de al lado** y
**la pregunta incómoda**. Más seis lugares concretos donde grabar.

Antes de los formatos hay una página de **seis reglas**, y dos no son de estilo:

- **Pedir permiso antes de grabar, siempre.** Si la persona después no quiere
  aparecer, el material no se puede usar.
- **Si alguien se abre de verdad, dejar de grabar y escuchar.** Y si duda sobre
  publicarlo, no se publica.

No son un detalle legal: es gente real contando cosas suyas en la calle.

## Regenerar los PDF

```bash
./build-motivo.sh                  # genera los cinco
./build-motivo.sh /ruta/a/chromium # o indicá otro binario
```

- `contenido_carpeta.py` — el programa: estructura, bloques, convocatoria.
- `contenido_fabricio.py`, `contenido_roko.py`, `contenido_paula.py` — los 30
  disparadores de cada uno.
- `contenido_calle.py` — formatos, preguntas, reglas y lugares.
- `motivo.py` — maqueta. Dos armados distintos según el módulo: la carpeta y los
  cuadernillos.
- `estilos.css` — sistema visual, con el acento de El Motivo (`#F8A858`).

El logo y las fuentes salen de `../carpeta-programacion/assets/`. El arte de
portada es `el-motivo-final.png`.

**No agregues `filter:` al CSS:** Chromium rasteriza los elementos filtrados al
imprimir y el PDF se dispara de peso.

## Datos a confirmar

- **La hora en España cambia el 25 de octubre**: 23 h hasta el 24, 22 h desde el
  25. La carpeta lo dice en la página de las tres ciudades.
- Roko graba sus disparadores **desde Florencio Varela**, pero co-conduce **desde
  el piso** de Nexo. Si eso cambia, se toca en `contenido_roko.py`.
