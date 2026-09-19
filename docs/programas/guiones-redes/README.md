# Guiones de redes — tres cuadernillos, 40 guiones

Videos de hasta 1 minuto con gancho y desarrollo. Comparten maqueta y método;
cambia el contenido y a quién le hablan.

| Archivo | Guiones | Quién lo graba | Le habla a |
|---|---|---|---|
| `Nexo-conexion-con-Espana-15-guiones.pdf` | 15 | Nexo (Argentina) | El que quiere que su historia o su marca cruce a España |
| `Nexo-siempre-quisiste-15-guiones.pdf` | 15 | Nexo (Argentina) | El que hace años dice que va a hacer un podcast, un vivo o grabar un tema |
| `SomosComoSomos-volvemos-a-Buenos-Aires-10-guiones.pdf` | 10 | Cristian, Diego, Mike y Juan (Ibiza) | La audiencia del canal en España |

Todos: 1080×1920 px, vertical, tipografía grande para leer desde el celular
mientras se graba. Los dos primeros tienen 17 páginas; el de España, 13.

## Volvemos a Buenos Aires (el de España)

Lo graba el equipo de Ibiza para anunciar que **desde octubre los martes vuelve el
bloque en directo desde Buenos Aires**. Cada guion dice quién lo dice: hay tres de
los cuatro juntos, uno por cabeza para Cristian, Mike y Juan, dos de Diego, uno de
Mike y Juan en dupla y uno cruzado entre los dos estudios.

Tiene una página extra, **La conexión, explicada**, con los seis datos que el equipo
de allá necesita tener claros antes de grabar: qué vuelve, desde cuándo, quién está
del otro lado, a qué hora se ve, qué se ve y qué se le pide al público.

### El horario cambia a mitad de campaña — leer antes de grabar

El programa sale **18 h de Argentina**. España cambia la hora el **domingo 25 de
octubre de 2026**:

| Cuándo | Diferencia | Hora en España |
|---|---|---|
| Hasta el sábado 24 de octubre | ARG +5 (CEST) | **23 h** |
| Desde el domingo 25 de octubre | ARG +4 (CET) | **22 h** |

El primer martes de octubre de 2026 es el **6**, así que los dos primeros martes
(6 y 13, más el 20) van a las 23 h y recién el **27** pasa a las 22 h. El guion 04
está escrito para decir las dos horas y no quedar desactualizado. Si se piden
recortes cortos con la hora sobreimpresa, **hay que hacer dos versiones**.

## Conexión con España

El puente entre Nexo Studios (San Martín) y el canal Somos Como Somos (Ibiza). El
programa que los une es **El Motivo**, martes de 18 a 20 h hora de Argentina, dentro
del bloque Martes de Buenos Aires.

Ejes: el puente · el canal · producción multi-locación · para el invitado · editorial ·
convocatoria · para marcas.

## Siempre quisiste

Ataca la excusa, no el servicio. Cinco guiones por cada cosa que la gente viene
posponiendo: **podcast**, **streaming en vivo** y **live set** (con o sin banda).
El acento cambia de color según el uso: azul podcast, rojo streaming, verde live set.

## Datos usados y qué revisar

Los números del canal (+4.200 suscriptores, +526K reproducciones, 8 programas al aire,
tres temporadas) salen de la propuesta de El Motivo que está en el repo. **Conviene
confirmarlos antes de publicar**: son de septiembre de 2026 y envejecen rápido.

Los guiones 04 y 08 de España mencionan la co-conducción desde Bogotá. Según la
carpeta de contenido, Roko y Paula están **propuestos y falta su confirmación**: si
todavía no está cerrado, conviene grabar esos dos al final. El cuadernillo de octubre
también nombra esa co-conducción en la página de la conexión.

## Regenerar los PDF

```bash
./build-guiones.sh                  # genera los tres
./build-guiones.sh /ruta/a/chromium # o indicá otro binario
```

- `contenido_espana.py`, `contenido_siempre.py` y `contenido_octubre.py` — **el texto
  de cada cuadernillo**. Son los únicos archivos a tocar.
- `guiones.py` — maqueta compartida; toma el módulo de contenido como argumento.
  Un módulo puede definir `CONEXION` (agrega la página explicativa) y cada idea puede
  llevar `quien` (agrega el chip con el nombre de quien lo graba). Los dos son opcionales.
- `estilos.css` — sistema visual.

Las fuentes y el logo se leen de `../carpeta-programacion/assets/`.
**No agregues `filter:` al CSS:** Chromium rasteriza los elementos filtrados al imprimir
y el PDF se dispara de peso.
