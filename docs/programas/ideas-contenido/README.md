# 15 ideas de contenido — Fabricio Benjamín Ortega

Guion de videos cortos para redes sobre lo que ofrece como Productor General en
Nexo Studios. Cada idea es un video de **hasta 1 minuto** con gancho de retención.

**Entregable:** `Nexo-15-ideas-de-contenido.pdf` — 17 páginas, 1080×1920 px,
vertical y con tipografía grande para leerlo desde el celular mientras se graba.

| Página | Contenido |
|---|---|
| 1 | Portada |
| 2 | El método: seis reglas que valen para las 15 |
| 3–17 | Una idea por pantalla |

Cada idea trae: número y categoría, duración sugerida, título, **el gancho textual
para los primeros 3 segundos**, el desarrollo, qué se ve en cámara y la frase de
cierre. Al pie, qué servicio vende esa pieza.

Los acentos rotan entre azul, rojo y dorado para dar ritmo al pasar las pantallas.

## De dónde sale el contenido

Las 15 ideas salen de lo que ya está documentado en este repo, no de supuestos:
el equipamiento y los tres sectores del piso (`carpeta-de-contenido/contenido.py`),
la biblia de Tercer Tiempo (`../tercer-tiempo-formato.md`), el protocolo de menores
de Pequeños Grandes Sabios, el esquema multi-país de El Motivo y la lógica de
bloques patrocinables de la carpeta de programación.

## Regenerar el PDF

```bash
./build-ideas.sh                  # usa el Chromium de /opt/pw-browsers
./build-ideas.sh /ruta/a/chromium # o indicá otro binario
```

- `contenido.py` — **las 15 ideas y el método**. Único archivo a tocar para editar texto.
- `ideas.py` — maquetación.
- `estilos.css` — sistema visual.

Las fuentes y el logo se leen de `../carpeta-programacion/assets/`.
**No agregues `filter:` al CSS:** Chromium rasteriza los elementos filtrados al
imprimir y el PDF se dispara de peso.
