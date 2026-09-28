# El drive de producción

Una carpeta por programa, todas con la misma estructura adentro. El que entra
a una sabe dónde está parado en las otras.

## Estado: creado

Las 55 carpetas están hechas en el Drive de `nexostudios.adm@gmail.com`,
dentro de **Programación 1er Temporada**:

https://drive.google.com/drive/folders/1oC11X8QOZag7WNrIsiSPSgFS7MhjyfeW

Siete bloques (seis programas más el de estudio) y ocho subcarpetas en cada
uno de los seis que las llevan.

El árbol local de `drive/` es el espejo: sirve para revisar la estructura sin
abrir el navegador, y los `LEEME.txt` dicen qué va en cada carpeta. Si se
agrega o se saca una en Drive, conviene reflejarlo corriendo
`python3 drive_estructura.py`.

## La estructura

```
Programación 1er Temporada/
├── 00 · Plantillas y marca/     ← la estructura vacía para copiar
├── 01 · El Motivo/
├── 02 · Tercer Tiempo/
├── 03 · Sex and the Baires/
├── 04 · Pequeños Grandes Sabios/
├── 05 · Exitosa Yo/
└── 99 · Estudio/                ← lo que no es de un programa
```

Y adentro de cada programa, siempre las mismas ocho:

| Carpeta | Qué va |
|---|---|
| `1 · Formato` | La biblia, la estructura de la emisión, la rutina tipo |
| `2 · Guiones` | Un documento por emisión: literario y técnico |
| `3 · Para técnica` | Opening, canción de apertura, guión técnico, integrantes, visuales |
| `4 · Gráficas` | Logo, placas, zócalos, plantillas, miniaturas |
| `5 · Invitados` | Contactos, confirmaciones y briefings |
| `6 · Emisiones` | Una subcarpeta por fecha, crudo y editado |
| `7 · Redes` | Cortes verticales, placas y calendario de publicación |
| `8 · Administración` | Presupuesto, contratos, facturas |

`3 · Para técnica` no es una carpeta más: es exactamente lo que la hoja de
roles dice que técnica tiene que recibir antes de grabar. Si está completa, el
piso arranca sabiendo qué hacer.

## Por qué los números adelante

Google Drive ordena alfabéticamente y no deja reordenar a mano. Con `1 ·`,
`2 ·` delante, las carpetas quedan en el orden en que se usan y no en el orden
del abecedario.

## Cómo se nombra adentro

- **Guiones y emisiones:** la fecha primero, en año-mes-día.
  `2026-10-07 guión técnico`. Así se ordenan solas.
- **Gráficas:** qué es y para qué programa. `placa-invitado-el-motivo.psd`.
- **Nada de "final", "final2", "final-bueno".** Si hace falta versionar, va
  `v1`, `v2` al final.

## Para agregar un programa nuevo

Se copia `00 · Plantillas y marca`, se le pone el número y el nombre, y listo.
La estructura ya viene adentro.

## Qué hay subido

56 carpetas, 58 documentos de Google, ninguna vacía. Las cinco carpetas de
programa tienen las ocho subcarpetas completas, y `00 · Plantillas` tiene los
seis modelos en blanco para arrancar un programa nuevo.

En cada programa, uno por subcarpeta:

| Subcarpeta | Qué hay |
|---|---|
| `1 · Formato` | La biblia del programa |
| `2 · Guiones` | El guion técnico modelo, con la escaleta y los horarios reales |
| `3 · Para técnica` | Qué recibe técnica antes de encender el piso |
| `4 · Gráficas` | Colores muestreados, reglas de uso y lista de piezas |
| `5 · Invitados` | La ficha para completar |
| `6 · Emisiones` | Cómo se nombra y qué va en cada emisión |
| `7 · Redes` | Qué bloque rinde en clip, cuántos y cuándo |
| `8 · Administración` | Qué se vende, a qué rubros y cuánto cuesta producirlo |

No son el mismo documento con el nombre cambiado. Lo propio de cada uno:

- **Tercer Tiempo:** el guion tiene los dos días, con el reloj del miércoles
  y el del domingo, y la advertencia de que «tanda» es el corte comercial.
- **El Motivo:** todo lo del enlace con Bogotá, con plan B escrito, porque es
  lo único que no depende del piso.
- **Sex and the Baires:** la regla de la columnista. Si no viene y el tema
  toca salud, se cambia el tema.
- **Pequeños Grandes Sabios:** el protocolo de menores atraviesa las ocho
  carpetas.
- **Exitosa Yo:** es el único que no sale en vivo. Se graban dos episodios por
  jornada y se guardan las pistas de audio separadas.

## Por qué los PDF no se pueden subir desde acá

El conector recibe texto, no binarios, así que un archivo tiene que viajar
codificado en base64 dentro del propio mensaje. **Se probó y no funciona:** un
JPEG de 19.246 bytes llegó a Drive con 11.894. Se corta a mitad de camino y el
archivo queda roto sin que ninguna de las dos puntas avise.

Por eso los binarios se suben a mano, arrastrándolos en el navegador. El
`LÉEME` de la raíz tiene el mapa de qué archivo va a qué carpeta.

Las hojas de estructura (`docs/programas/estructuras/`) se hicieron chicas a
propósito, entre 80 y 115 KB, pensando en subirlas por el conector. Después de
esa prueba el tamaño ya no alcanza: el problema no es el peso, es que la
transferencia se trunca. Siguen siendo livianas, que igual sirve para
mandarlas y para que carguen rápido.

Dos de esos PDF son internos y no se mandan a cliente, porque llevan los costos
de operador, asistente y producción:

- `Nexo-carpeta-de-presupuesto-de-produccion.pdf`
- `Nexo-presupuesto-lectura-ejecutiva.pdf`

Conviene dejarlos en una subcarpeta de `99 · Estudio` con permisos propios.

## Horarios

| Programa | Cuándo |
|---|---|
| El Motivo | Martes 18:00 a 20:00 |
| Tercer Tiempo | Miércoles 20:00 a 22:00 · domingos 22:00 a 00:00 |
| Sex and the Baires | A definir |
| Pequeños Grandes Sabios | A definir |
| Exitosa Yo | A definir |

El domingo de Tercer Tiempo se confirmó de 22:00 a 00:00. Se corrigieron la
biblia, el kit de sponsoreo, los dos PDF y los documentos del Drive. Dos cosas
que cambian por el horario: la llegada del domingo pasa a las 19:00 con aire a
las 22:00, y los clips del domingo se cortan el lunes, porque el programa
termina a medianoche.

## Qué falta confirmar

- **El Motivo:** martes de 18 a 20 h está como estimado.
- **Cuántos programas son:** en la nota de voz se dijo "cuatro" y se
  nombraron cinco. Están las cinco carpetas creadas.
- **César de Beach o Sex and the Baires:** se asumió que son el mismo
  programa, porque la carpeta de programación sólo tiene a Sex and the Baires
  con formato y grilla comercial escritos. Si son dos proyectos distintos,
  falta abrir la carpeta de César de Beach.
- **Sex and the Baires:** sin horario ni elenco.
- **Pequeños Grandes Sabios** y **Exitosa Yo:** sin fecha.
