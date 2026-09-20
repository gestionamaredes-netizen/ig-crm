# Propuesta comercial de sponsoreo — Nexo Studios 2026

`Nexo-Studios-propuesta-de-sponsoreo-2026.pdf` — 16 páginas, 1080×1920 px,
vertical, para leer desde el celular. Es la propuesta que se le manda a una marca
para que entre al lanzamiento del centro integral de contenido audiovisual.

## Antes de mandarla: completar los montos

Es lo único que falta. Están todos juntos en `contenido.py`, en el diccionario
`INVERSION`:

```python
INVERSION = {
    "main":    ("A convenir", "según duración de la temporada"),
    "support": ("A convenir", "según programa y duración"),
    "partner": ("Por canje",  "valorizado según la acción"),
}
```

Mientras digan «A convenir» el PDF se imprime bien y la caja de inversión se ve
igual de terminada — es una fórmula usada y no queda un hueco. Pero una propuesta
sin número obliga a una segunda reunión para decirlo, así que conviene ponerlo.
Se edita, se corre `./build-propuesta.sh` y listo.

No inventé los montos: no tengo con qué compararlos. El único precio real que hay
en el repo es el del estudio ($120.000 la hora, $480.000 el abono de 4 h
mensuales, en `docs/propuestas/lqlve-temporada-2/`), y el sponsoreo no se cotiza
por costo de estudio.

## Qué dice

| # | Página | Para qué está |
|---|---|---|
| 01 | Portada | Logo principal sobre negro, «Sé parte del lanzamiento» |
| 02 | Por qué ahora | El argumento de lanzamiento: ahora se elige lugar, después se compra lo que queda |
| 03 | Qué es Nexo Studios | Que no es un estudio de alquiler sino un centro integral |
| 04 | La grilla | Los cinco programas con formato y día |
| 05 | Cómo rinde | La cadena vivo → VOD → clips → podcast |
| 06 | Qué se compra | El inventario real: naming, PNT, branded, activaciones |
| 07 | Separador | Main / Support / Partner |
| 08–10 | Un nivel por página | Qué incluye cada uno + caja de inversión |
| 11 | Comparativa | Los tres lado a lado, ocho criterios |
| 12–13 | El estudio y el piso | Respaldo técnico y los tres sectores |
| 14 | El equipo | El staff fijo de las cinco producciones |
| 15 | Próximos pasos | Los cuatro pasos hasta el aire |
| 16 | Contacto | Firma y cierre |

## Los tres niveles

- **Main Sponsor** — naming en los cinco programas, exclusividad de rubro,
  2 cápsulas de branded al mes, una activación por temporada.
- **Support** — un programa a elección: naming de bloque, PNT, clips y 1 cápsula
  mensual. Profundidad en vez de alcance.
- **Partner Creativo** — por canje. Product placement, mención como partner y una
  acción co-creada. Sin salida de caja para ninguno de los dos, y con primera
  opción de pasar a Support el año siguiente.

## Datos que conviene revisar antes de mandarla

- **El día de tres programas no está cerrado.** Sex and the Baires, Exitosa Yo y
  Pequeños Grandes Sabios figuran con día «A definir» en la carpeta de contenido.
  En esta propuesta se muestra la **frecuencia** en lugar del día, porque tres
  «a definir» en una página se leen como proyecto sin terminar. Cuando los días
  estén cerrados, se actualizan en `../carpeta-de-contenido/contenido.py` y esta
  propuesta los toma solos.
- **El elenco de Tercer Tiempo sigue sin nombres** y **Roko y Paula están
  propuestos, falta confirmación** para El Motivo. Ninguno de los dos aparece en
  esta propuesta, pero van a salir en la primera reunión.
- **No hay página de números de audiencia.** Es deliberado: las métricas que hay
  en el repo son de septiembre de 2026 y el argumento de esta propuesta es el
  lanzamiento, no el alcance actual. Si la marca los pide, se arma una página
  aparte con datos frescos.

## Regenerar el PDF

```bash
./build-propuesta.sh                  # usa el Chromium del entorno
./build-propuesta.sh /ruta/a/chromium # o indicá otro binario
```

- `contenido.py` — **todo el texto y los montos**. Es el único archivo a tocar.
- `propuesta.py` — maqueta. Lee la grilla desde `../carpeta-de-contenido/contenido.py`,
  así que los programas no se duplican: se actualizan en un solo lugar.
- `estilos.css` — sistema visual, heredado del de los cuadernillos de guiones.

Las fuentes, el logo y la foto del estudio se leen de `../carpeta-programacion/assets/`.
**No agregues `filter:` al CSS:** Chromium rasteriza los elementos filtrados al
imprimir y el PDF se dispara de peso.
