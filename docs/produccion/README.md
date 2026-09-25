# Carpeta de presupuesto de producción · Nexo Studios

Tres PDF que salen de la misma base de números. Si una tarifa cambia, se cambia
en `tarifas.py` y los tres quedan alineados solos.

| Archivo | Págs | Para quién | Circulación |
|---|---|---|---|
| `Nexo-carpeta-de-presupuesto-de-produccion.pdf` | 15 | Producción, para armar cualquier cotización | **Interna** |
| `Nexo-presupuesto-lectura-ejecutiva.pdf` | 10 | Fede Aguirre, Nico Lahargou y Lorena Rizzo | **Interna** |
| `Nexo-produci-en-nexo.pdf` | 11 | El que está pensando en producir acá | Externa |
| `Nexo-alquilar-el-estudio.pdf` | 4 | El que quiere alquilar y armar algo propio | Externa |
| `Nexo-servicios.pdf` | 9 | El cliente que pide precios | Externa |
| `Nexo-hoja-de-precios-A4.pdf` | 1 | Para imprimir, plastificar y tener en el estudio | Externa |

Los dos primeros llevan los honorarios del equipo técnico. **No se mandan a un
cliente.** Los dos últimos son los que salen de Nexo.

## Ojo: hay dos grillas conviviendo

`servicios.py` es la grilla nueva, por servicio, y sólo la usa
`Nexo-servicios.pdf`. Los otros cuatro documentos siguen leyendo `tarifas.py`,
la grilla vieja de hora técnica y hora completa. **Los precios no coinciden**:
hasta que se migren, no conviene mandar juntos el de servicios y cualquiera de
los otros dos externos.

## Las tarifas

Todo está en `tarifas.py` y en ningún otro lado. Los documentos no tienen
números escritos a mano: los piden.

| Equipo técnico | Jornada de 2 hs | Jornada de 3 hs o más |
|---|---|---|
| Operador técnico | $ 25.000 / hora | $ 20.000 / hora |
| Asistente técnico | $ 10.000 / hora | $ 15.000 / hora |
| **Costo por hora** | **$ 35.000** | **$ 35.000** |

Equipo de producción general: **$ 50.000 / hora**, para producción general y
asistente de producción. El reparto entre los dos todavía no está definido.

> **Es un precio promocional y cubre sólo la jornada de piso.** El promocional
> no tiene fecha de fin todavía (`PRODUCCION_VIGENCIA`).

**Preproducción:** no tiene tarifa por hora y no va a tenerla. Se arma y se
cotiza según cada proyecto. `PREPRODUCCION = None` es una decisión tomada, no un
pendiente.

**Producción ejecutiva:** cobra un porcentaje de lo facturado, no una hora ni un
fijo. El modelo está cerrado; el número, no (`EJECUTIVA_PORCENTAJE`).

Hora de estudio: **$ 120.000** con equipo técnico, **$ 170.000** sumando el
equipo de producción general.

### Las dos propiedades que hay que no romper

**1. El costo técnico por hora es constante.** 25 + 10 es lo mismo que 20 + 15,
así que una hora de equipo técnico cuesta $ 35.000 en cualquier jornada.

**2. El margen por hora es el mismo en los dos planes.** 120.000 − 35.000 y
170.000 − 85.000 dan los dos $ 85.000. Los 50.000 que se le suman al cliente por
la hora completa se pagan enteros al equipo de producción, así que la hora
completa factura más pero no deja más. El porcentaje sí baja, de 70,8% a 50,0%.

**3. Esa paridad se rompe con el porcentaje de producción ejecutiva.** Si se
calcula sobre lo facturado, los 50.000 que pasan derecho a producción también
pagan porcentaje, y la hora completa pasa a dejar $ 50.000 × el porcentaje menos
que la técnica. A 10% son $ 5.000 por hora. Calcularlo sobre el margen en vez de
sobre lo facturado evita el efecto.

`tarifas.py` verifica las tres con `assert` al importarse. Si alguien toca un
número y rompe alguna, los PDF directamente no se generan. Es a propósito: si
dejan de ser ciertas, hay que decidirlo, no descubrirlo tres meses después.

## La guarda de honorarios

Los módulos de contenido declaran `INTERNO = True` o `False`. Antes de escribir
el HTML de un documento externo, `presupuesto.py` busca en él los honorarios del
equipo técnico y aborta si aparece alguno.

Cubre los honorarios del equipo técnico y los $ 50.000 de producción general.
Está probada: forzar `INTERNO = False` sobre la carpeta interna corta el build
con `$ 25.000 es un honorario interno y aparece en un documento externo`.

## Regenerar los PDF

```bash
./build-presupuesto.sh                  # genera los cinco PDF y la hoja A4
./build-presupuesto.sh /ruta/a/chromium # o indicá otro binario
```

- `tarifas.py` — la grilla vieja (hora técnica / hora completa), con sus chequeos.
- `servicios.py` — la grilla nueva por servicio: streaming, podcast, producción,
  paquetes por volumen y descuentos por contrato. También con chequeos.
- `contenido_carpeta.py` — el máster de producción.
- `contenido_direccion.py` — la lectura ejecutiva.
- `contenido_venta.py` — el documento que sale afuera.
- `contenido_servicios.py` — la grilla de servicios que se le manda a un cliente:
  streaming, podcast, producción, paquetes y descuentos. Lee de `servicios.py`.
- `contenido_alquiler.py` — las cuatro hojas de alquiler: los tres armados del
  piso (escritorio de streaming hasta 6, mano a mano y live set), tarifas y reserva.
- `presupuesto.py` — las cinco maquetas y la guarda.
- `hoja.py` — la hoja de precios suelta en A4. Usa el mismo cuerpo que la
  página 2 de `Nexo-servicios.pdf`, así que los precios no pueden desfasarse.
- `estilos.css` — sistema visual, tomado de `../programas/propuesta-sponsors/`.

El logo, las fuentes y la foto del estudio salen de
`../programas/carpeta-programacion/assets/`.

**No agregues `filter:` al CSS:** Chromium rasteriza los elementos filtrados al
imprimir y el PDF se dispara de peso.

## Lo que falta definir

La lectura ejecutiva las pide como seis decisiones. Hasta que estén, la carpeta
no se puede mandar a un cliente sin aclaraciones a mano:

1. Si las tarifas son con IVA incluido o más IVA.
2. Si la hora completa tiene que dejar algo para Nexo. Hoy está a costo más cero.
3. Cómo se reparten los $ 50.000 entre producción general y asistente.
4. Qué porcentaje se lleva producción ejecutiva, y sobre qué base.
5. Hasta cuándo rige el precio promocional de los $ 50.000.
6. Cada cuánto se revisan las tarifas.
