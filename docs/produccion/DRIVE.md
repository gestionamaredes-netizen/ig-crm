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

Once documentos de Google, escritos desde el material que ya existía en el
repositorio. Son editables desde el Drive: si cambia un horario o un nombre, se
corrige ahí y no hace falta volver a generar nada.

| Carpeta | Documento |
|---|---|
| `99 · Estudio` | Grilla de servicios y precios |
| `99 · Estudio` | Roles y circuito de trabajo |
| `00 · Plantillas` → `2 · Guiones` | Plantilla · Guión técnico |
| `00 · Plantillas` → `3 · Para técnica` | Plantilla · Checklist para técnica |
| `01 · El Motivo` → `1 · Formato` | El Motivo · formato y estructura |
| `01 · El Motivo` → `2 · Guiones` | El Motivo · 90 disparadores para redes |
| `01 · El Motivo` → `7 · Redes` | Kit de Instagram |
| `02 · Tercer Tiempo` → `1 · Formato` | Tercer Tiempo · biblia de formato |
| `02 · Tercer Tiempo` → `8 · Administración` | Tercer Tiempo · kit de marca y sponsoreo |
| `03 · Sex and the Baires` → `1 · Formato` | Sex and the Baires · formato y estructura |
| `04 · Pequeños Grandes Sabios` → `1 · Formato` | Pequeños Grandes Sabios · formato y estructura |
| `05 · Exitosa Yo` → `1 · Formato` | Exitosa Yo · formato y estructura |

En la raíz hay además un `LÉEME` que explica la estructura, lista lo subido y
dice a qué carpeta va cada PDF que falta.

## Por qué los PDF no se pueden subir desde acá

Son 30 archivos, 47,6 MB. El conector de Drive recibe texto, no binarios: un
PDF tendría que viajar codificado en base64, y sólo el más chico cuesta unos
147 000 tokens. Los 30 juntos rondan los 16 millones, más de lo que entra en
una sesión entera.

Se suben a mano, arrastrándolos en el navegador. El `LÉEME` de la raíz tiene el
mapa completo de qué archivo va a qué carpeta.

Dos de esos PDF son internos y no se mandan a cliente, porque llevan los costos
de operador, asistente y producción:

- `Nexo-carpeta-de-presupuesto-de-produccion.pdf`
- `Nexo-presupuesto-lectura-ejecutiva.pdf`

Conviene dejarlos en una subcarpeta de `99 · Estudio` con permisos propios.

## Qué falta confirmar

- **El Motivo:** martes de 18 a 20 h está como estimado.
- **Tercer Tiempo:** hay una contradicción abierta. En la nota de voz se
  dijo miércoles de 8 a 10 y domingos de 10 a 12; la biblia de formato dice
  los dos días de 20:00 a 22:00, y el guion técnico entero está calculado
  sobre ese arranque. Los domingos no coinciden. Hasta que se confirme, la
  biblia subida al Drive lleva la nota al principio.
- **Cuántos programas son:** en la nota de voz se dijo "cuatro" y se
  nombraron cinco. Están las cinco carpetas creadas.
- **César de Beach o Sex and the Baires:** se asumió que son el mismo
  programa, porque la carpeta de programación sólo tiene a Sex and the Baires
  con formato y grilla comercial escritos. Si son dos proyectos distintos,
  falta abrir la carpeta de César de Beach.
- **Sex and the Baires:** sin horario ni elenco.
- **Pequeños Grandes Sabios** y **Exitosa Yo:** sin fecha.
