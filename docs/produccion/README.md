# Carpeta de presupuesto de producción · Nexo Studios

Tres PDF que salen de la misma base de números. Si una tarifa cambia, se cambia
en `tarifas.py` y los tres quedan alineados solos.

| Archivo | Págs | Para quién | Circulación |
|---|---|---|---|
| `Nexo-carpeta-de-presupuesto-de-produccion.pdf` | 13 | Producción, para armar cualquier cotización | **Interna** |
| `Nexo-presupuesto-lectura-ejecutiva.pdf` | 9 | Fede Aguirre, Nico Lahargou y Lorena Rizzo | **Interna** |
| `Nexo-produci-en-nexo.pdf` | 11 | El que está pensando en producir acá | Externa |
| `Nexo-alquilar-el-estudio.pdf` | 4 | El que quiere alquilar y armar algo propio | Externa |

Los dos primeros llevan los honorarios del equipo técnico. **No se mandan a un
cliente.** Los dos últimos son los que salen de Nexo.

## Las tarifas

Todo está en `tarifas.py` y en ningún otro lado. Los documentos no tienen
números escritos a mano: los piden.

| | Jornada de 2 hs | Jornada de 3 hs o más |
|---|---|---|
| Operador técnico | $ 25.000 / hora | $ 20.000 / hora |
| Asistente | $ 10.000 / hora | $ 15.000 / hora |
| **Costo por hora** | **$ 35.000** | **$ 35.000** |

Hora de estudio: **$ 120.000** con equipo técnico, **$ 150.000** sumando el
equipo de producción.

### La propiedad que hay que no romper

Las dos columnas dan el mismo costo por hora: 25 + 10 es lo mismo que 20 + 15.
Eso hace que el margen porcentual sea idéntico en cualquier jornada, y es lo que
permite cotizar sin abrir una planilla.

`tarifas.py` lo verifica con un `assert` al importarse. Si alguien toca un número
y rompe la igualdad, los PDF directamente no se generan. Es a propósito: si deja
de ser cierto, hay que decidirlo, no descubrirlo tres meses después.

## La guarda de honorarios

Los módulos de contenido declaran `INTERNO = True` o `False`. Antes de escribir
el HTML de un documento externo, `presupuesto.py` busca en él los honorarios del
equipo técnico y aborta si aparece alguno.

Está probada: forzar `INTERNO = False` sobre la carpeta interna corta el build
con `$ 25.000 es un honorario interno y aparece en un documento externo`.

## Regenerar los PDF

```bash
./build-presupuesto.sh                  # genera los cuatro
./build-presupuesto.sh /ruta/a/chromium # o indicá otro binario
```

- `tarifas.py` — todos los números, con sus chequeos.
- `contenido_carpeta.py` — el máster de producción.
- `contenido_direccion.py` — la lectura ejecutiva.
- `contenido_venta.py` — el documento que sale afuera.
- `contenido_alquiler.py` — las cuatro hojas de alquiler: los tres armados del
  piso (escritorio de streaming hasta 6, mano a mano y live set), tarifas y reserva.
- `presupuesto.py` — las cuatro maquetas y la guarda.
- `estilos.css` — sistema visual, tomado de `../programas/propuesta-sponsors/`.

El logo, las fuentes y la foto del estudio salen de
`../programas/carpeta-programacion/assets/`.

**No agregues `filter:` al CSS:** Chromium rasteriza los elementos filtrados al
imprimir y el PDF se dispara de peso.

## Lo que falta definir

La lectura ejecutiva las pide como cuatro decisiones. Hasta que estén, la carpeta
no se puede mandar a un cliente sin aclaraciones a mano:

1. Si las tarifas son con IVA incluido o más IVA.
2. Cuánto cuesta hacia adentro la hora de equipo de producción.
3. Si los honorarios de producción ejecutiva salen de la hora o van aparte.
4. Cada cuánto se revisan las tarifas.
