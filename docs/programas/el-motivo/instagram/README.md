# Assets de la cuenta de Instagram de El Motivo

Las imágenes que hay que subir. Todo lo demás —usuario, bio, enlaces, la grilla
de lanzamiento y la rutina semanal— está en `../El-Motivo-instagram.pdf`.

## `perfil.png` · 1080 × 1080

La foto de perfil. Es el logo recortado para que las dos palabras entren enteras
dentro del círculo.

Se probaron tres encuadres antes de elegir éste: el que incluye el claim
("Ideas que conectan") se vuelve una mancha ilegible en el tamaño chico, así que
el claim quedó para la bio.

**Si alguna vez hay que rehacerla:** tiene que leerse a 56 píxeles. Ése es el
tamaño con el que aparece al lado de cada posteo, que es donde la gente nos ve
casi siempre. A 150 px se lee cualquier cosa; ése no es el examen.

## `destacadas/*.png` · 1080 × 1920 cada una

Las ocho portadas de las historias destacadas, en el orden en que van cargadas:

| Archivo | Destacada |
|---|---|
| `empeza-aca.png` | EMPEZÁ ACÁ |
| `sumate.png` | SUMATE |
| `el-vivo.png` | EL VIVO |
| `la-calle.png` | LA CALLE |
| `paula.png` | PAULA |
| `roko.png` | ROKO |
| `fabri.png` | FABRI |
| `el-estudio.png` | EL ESTUDIO |

Instagram recorta un círculo del centro de la imagen. La palabra está centrada a
propósito (medida: cae en Y 967 de 1920), así que al cargarla **no hay que
arrastrarla**: se deja donde cae sola.

## Cómo se regeneran

Las imágenes se arman con Chromium desde `../instagram.py` y los HTML que ese
script escribe. Para cambiar una palabra de una destacada se edita la lista
`PALABRAS` y se vuelve a correr.

El acento es `#F8A858`, el mismo de toda la carpeta de El Motivo.
