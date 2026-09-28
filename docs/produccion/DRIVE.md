# El drive de producción

Una carpeta por programa, todas con la misma estructura adentro. El que entra
a una sabe dónde está parado en las otras.

## Estado: falta conectar el Drive

No puedo crear las carpetas todavía. El conector de Google Drive está
disponible pero pide autorización de nuevo, y esta sesión no puede abrir el
login.

**Para habilitarlo:**

1. Entrá a **claude.ai/customize/connectors**
2. Conectá (o reconectá) **Google Drive**
3. Abrí una **sesión nueva** — los conectores se leen cuando la sesión arranca

En esa sesión siguiente, con `drive_estructura.py` a mano, las 56 carpetas se
crean de una.

## Mientras tanto

El árbol ya está escrito en `drive/`, con un `LEEME.txt` en cada carpeta que
dice qué va adentro. Sirve para dos cosas:

- **Revisarlo antes de crearlo.** Es más barato discutir la estructura acá que
  mover cincuenta carpetas después.
- **Subirlo a mano.** Google Drive acepta que arrastres una carpeta entera con
  todo su contenido. Si no querés esperar, arrastrás `Producción · Nexo Studios`
  y queda hecho, con los LEEME adentro.

## La estructura

```
Producción · Nexo Studios/
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

## Qué falta confirmar

- **El Motivo:** martes de 18 a 20 h está como estimado.
- **Tercer Tiempo:** miércoles y domingos, pero los horarios quedaron
  ambiguos. Hace falta saber si son de mañana o de noche.
- **Sex and the Baires:** sin horario ni elenco.
- **Pequeños Grandes Sabios** y **Exitosa Yo:** sin fecha.
