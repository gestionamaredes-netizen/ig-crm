# Resumen para marcas — Nexo Studios 2026

`Nexo-Studios-resumen-para-marcas.pdf` — 5 páginas, 1080×1920 px, vertical.

Versión corta de la propuesta de sponsoreo, apuntada a **pymes y comercios que ya
hacen contenido en redes**: gastronomía, bebidas, food trucks, indumentaria,
servicios. Es el documento que se manda por WhatsApp después de una primera charla.

## No es la misma propuesta más corta

A una panadería no se le vende «naming del ciclo» ni «exclusividad de rubro»: eso
es lenguaje para una marca grande con presupuesto de medios. Acá el argumento es
otro y el vocabulario también.

| | Propuesta de sponsoreo | Este resumen |
|---|---|---|
| A quién | Marca con presupuesto de medios | Comercio o pyme que ya postea |
| Qué vende | Estar en la grilla | Subir el nivel del contenido y armar el nicho |
| Entrada natural | Main o Support | Producción en el estudio o canje |
| Largo | 21 páginas | 5 páginas |

## Qué dice

| # | Página | Para qué está |
|---|---|---|
| 01 | Portada | «Tu marca ya hace contenido. Que se note.» |
| 02 | A quién le hablamos | Los rubros listados + los cuatro problemas en los que se reconocen |
| 03 | Tu nicho dorado | Las cuatro condiciones y **un ejemplo concreto por rubro** |
| 04 | Qué hacemos | Las tres formas de entrar y con qué se va |
| 05 | Cómo empezamos | Los tres pasos, el equipo completo con nombres y el cierre |

La **página 3 es la que vende**. No explica el concepto en abstracto: lo baja a
cada rubro con una frase que el dueño reconoce al instante.

> **Panadería** — No «gente que compra pan». Las familias que arman la merienda del
> domingo y quieren llegar con algo distinto.
>
> **Rotisería** — No «los que piden delivery». El que llega a las nueve de la noche
> sin ganas de cocinar y no quiere comer cualquier cosa.

Si aparece un rubro nuevo —una veterinaria, un gimnasio, una óptica— se agrega una
línea con el mismo molde en `NICHO["ejemplos"]`. **Escribir la frase antes de la
reunión** y llevarla lista es la mitad de la venta.

## El equipo de la página 5

Seis nombres, tal como se pidieron: Lorena Rizzo, Fabricio Ortega, Martina Nagel,
Fede Aguirre, Nico Lahargou y Julián Barreiro.

**Falta Néstor Mago**, que figura como Producción Técnica en la carpeta de
programación, en la carpeta de contenido y en la propuesta de sponsoreo. No está
acá porque no estaba en la lista pedida. Si corresponde que esté, se agrega una
línea a `EQUIPO` en `contenido.py` y se vuelve a generar: la página tiene lugar.

## Otra cosa a decidir

**No hay precios.** Los tres caminos de la página 4 se describen sin monto, porque
para este público el número depende de qué se grabe y cuántas piezas salgan, y
porque el paso 2 del cierre promete justamente eso: «te armamos la propuesta, con
el número cerrado». Si querés un precio de entrada visible —un «desde $X la jornada
de producción»— se agrega a `SERVICIOS`.

## Regenerar el PDF

```bash
./build-resumen.sh                  # usa el Chromium del entorno
./build-resumen.sh /ruta/a/chromium # o indicá otro binario
```

- `contenido.py` — **todo el texto**. Es el único archivo a tocar.
- `resumen.py` — maqueta y los estilos propios de este documento.
- El sistema visual se lee de `../propuesta-sponsors/estilos.css`, y las fuentes y
  el logo de `../carpeta-programacion/assets/`. **Si cambiás la hoja de estilos de
  la propuesta de sponsoreo, este documento cambia también.**

**No agregues `filter:` al CSS:** Chromium rasteriza los elementos filtrados al
imprimir y el PDF se dispara de peso.
