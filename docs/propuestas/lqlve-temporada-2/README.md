# Propuesta NEXO STUDIOS × LQLVE — Temporada 2

Respuesta comercial de Nexo Studios al brief *"LQLVE Temporada 2 — Propuesta de
producción para Nexo Studios"*.

**Entregable:** `NEXO_STUDIOS_x_LQLVE_Temporada2.pdf` — 3 páginas, 1080×1920 px
(mismo formato vertical 9:16 que usó el cliente en su propuesta).

| Página | Contenido |
|---|---|
| 01 | Portada co-branded + render del set principal (sin precios) |
| 02 | Set y equipamiento: cada pedido del brief contra lo que pone el estudio + sala de control |
| 03 | Cotización, lanzamiento de noviembre, incluidos y próximos pasos |

## Valores cotizados

- Hora de estudio: **$120.000**
- Abono mensual (4 h = 2 capítulos de 2 h): **$480.000**
- Hora adicional fuera del abono: **$120.000**
- Lanzamiento noviembre (8–10 h): **a cotizar** — se menciona, sin importe cerrado

La página 3 aclara que, si en los meses siguientes LQLVE suma horas fijas al
abono mensual, el valor de la hora se revisa con una consideración preferencial.
Esta cotización cubre las 4 h mensuales del brief.

## Regenerar el PDF

```bash
./build.sh                  # usa el Chromium de /opt/pw-browsers
./build.sh /ruta/a/chromium # o indicá otro binario
```

El script inserta fuentes e imágenes como data URIs en `deck.html` y lo imprime
a PDF con Chromium headless. Para editar textos o valores, tocar `deck.html`
y volver a correr `build.sh`.

## Assets

- `assets/nexo-studios-logo.png` — logo NEXO STUDIOS (PNG transparente)
- `assets/lqlve-logo.png` — wordmark LQLVE (PNG transparente)
- `assets/nexo-studio-render.jpg` — render del set principal de Nexo Studios
- `assets/fonts/` — Inter + Barlow Condensed (subset latino, SIL Open Font License)
