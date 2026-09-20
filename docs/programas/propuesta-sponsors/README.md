# Propuesta comercial de sponsoreo — Nexo Studios 2026

`Nexo-Studios-propuesta-de-sponsoreo-2026.pdf` — 21 páginas, 1080×1920 px,
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
| 02 | Por qué ahora | Ahora se elige lugar; después se compra lo que queda |
| 03 | Qué es Nexo Studios | Que no es un estudio de alquiler sino un centro integral |
| 04 | La grilla | Los cinco programas con formato y día |
| 05 | El mercado | Qué pasó con el streaming y cómo cambió para las marcas |
| 06 | La oportunidad | Por qué los canales grandes ya no sirven a una marca mediana |
| 07 | Qué es un nicho dorado | Las cuatro condiciones: definible, comprometida, desatendida, comprable |
| 08 | Cómo se construye | Que un nicho no se busca, se fabrica — y cómo |
| 09 | Las cinco audiencias | Cada programa descrito como nicho, con los rubros que le sirven |
| 10 | Proyección | Escenario conservador y base, con el aviso de que es proyección |
| 11 | Cómo rinde | La cadena vivo → VOD → clips → podcast |
| 12 | Qué se compra | El inventario real: naming, PNT, branded, activaciones |
| 13 | Separador | Main / Support / Partner |
| 14–16 | Un nivel por página | Qué incluye cada uno + caja de inversión |
| 17 | Comparativa | Los tres lado a lado, ocho criterios |
| 18 | El estudio | Foto, los tres sectores y el equipamiento |
| 19 | El equipo | El staff fijo y qué hace cada uno para el sponsor |
| 20 | Próximos pasos | Los cuatro pasos hasta el aire |
| 21 | Contacto | Firma y cierre |

## El bloque de mercado y nicho

Las páginas 5 a 10 son el argumento de por qué una audiencia chica puede valer más
que una grande. El recorrido es: el streaming ya es un medio → los canales grandes
están llenos y son generales → existe algo mejor, que es el nicho dorado → así se
construye → estos son los cinco de la grilla → estos son los números que esperamos.

**Un nicho dorado** se define acá como la audiencia que cumple cuatro condiciones a
la vez: **definible** en una frase concreta, **comprometida** (vuelve cada semana),
**desatendida** (no tiene diez programas compitiendo) y **comprable** (existe un
rubro con presupuesto que la necesita). Si falta una, es solo una audiencia chica.

El mercado se describe en términos estructurales —el consumo se corrió, una emisión
tiene tres vidas, la inversión siguió a la gente, el público se fragmentó— sin citar
porcentajes ni estudios. Son afirmaciones que cualquier anunciante reconoce y que no
envejecen ni se pueden discutir con un dato.

### Los números de la página 10 son proyecciones, no mediciones

| | Conservador | Base |
|---|---|---|
| Vivo simultáneo | 40 – 80 | 80 – 150 |
| VOD a 30 días | 400 – 800 | 800 – 1.500 |
| Alcance de clips | 3.000 – 7.000 | 7.000 – 15.000 |
| Alcance mensual | 15.000 – 30.000 | 30.000 – 60.000 |

Están puestos como escenario de lanzamiento para un programa semanal y la página lo
dice con todas las letras, con un aviso en dorado al pie: *«Proyección de
lanzamiento. Se actualiza con datos reales desde la primera emisión.»*

**Revisalos antes de mandarla.** Son estimaciones razonables para un canal que
arranca, no datos del canal. Si la primera emisión da otra cosa, se cambian en
`PROYECCION` dentro de `contenido.py` y el PDF se rehace. Prometer de más en esta
página es lo único que puede costar una renovación.

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
- **La página 10 no usa las métricas del repo** (+4.200 suscriptores, +526K
  reproducciones). Son de septiembre de 2026 y envejecen rápido, y además el
  argumento de esta propuesta es el lanzamiento, no el alcance actual. Si querés
  mostrarlas, van como página aparte y con fecha.

## Regenerar el PDF

```bash
./build-propuesta.sh                  # usa el Chromium del entorno
./build-propuesta.sh /ruta/a/chromium # o indicá otro binario
```

- `contenido.py` — **todo el texto y los montos**. Es el único archivo a tocar.
- `propuesta.py` — maqueta. Lee la grilla desde `../carpeta-de-contenido/contenido.py`,
  así que los programas no se duplican: se actualizan en un solo lugar.
- `estilos.css` — sistema visual. Los cuerpos están subidos respecto de los
  cuadernillos de guiones para que se lea cómodo en el teléfono: texto corrido a
  39 px, descripciones a 31 px, beneficios de cada nivel a 32 px y las tablas a 29 px.

### Cómo se evita el hueco en el medio de la página

Cada página de contenido tiene **un solo** `<div class="spacer">`, y va siempre
inmediatamente antes del pie. Así el contenido arranca arriba, el aire sobrante se
acumula abajo y el pie queda clavado a 1852 px. Dos spacers en la misma página
—uno arriba y otro abajo del contenido— es lo que abría el agujero en el medio.
Las únicas tres páginas con dos spacers son la portada, el separador de niveles y
el contacto, donde el bloque va centrado a propósito (`spacer libre`).

Para verificar que ninguna página desborda ni perdió el pie, se mide con Chromium:

```bash
# over debe dar 0 y pie 1852 en todas
```

Las fuentes, el logo y la foto del estudio se leen de `../carpeta-programacion/assets/`.
**No agregues `filter:` al CSS:** Chromium rasteriza los elementos filtrados al
imprimir y el PDF se dispara de peso.
