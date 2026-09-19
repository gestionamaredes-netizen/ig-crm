# Guiones de redes — dos cuadernillos, 30 guiones

Videos de hasta 1 minuto con gancho y desarrollo. Comparten maqueta y método;
cambia el contenido y a quién le hablan.

| Archivo | Guiones | Le habla a |
|---|---|---|
| `Nexo-conexion-con-Espana-15-guiones.pdf` | 15 | El que quiere que su historia o su marca cruce a España |
| `Nexo-siempre-quisiste-15-guiones.pdf` | 15 | El que hace años dice que va a hacer un podcast, un vivo o grabar un tema |

Los dos: 17 páginas, 1080×1920 px, vertical, tipografía grande para leer desde el
celular mientras se graba.

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
todavía no está cerrado, conviene grabar esos dos al final.

## Regenerar los PDF

```bash
./build-guiones.sh                  # genera los dos
./build-guiones.sh /ruta/a/chromium # o indicá otro binario
```

- `contenido_espana.py` y `contenido_siempre.py` — **el texto de cada cuadernillo**.
  Son los únicos archivos a tocar.
- `guiones.py` — maqueta compartida; toma el módulo de contenido como argumento.
- `estilos.css` — sistema visual.

Las fuentes y el logo se leen de `../carpeta-programacion/assets/`.
**No agregues `filter:` al CSS:** Chromium rasteriza los elementos filtrados al imprimir
y el PDF se dispara de peso.
