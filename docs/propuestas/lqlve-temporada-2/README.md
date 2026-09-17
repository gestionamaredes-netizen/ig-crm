# Propuesta NEXO STUDIOS × LQLVE — Temporada 2

Respuesta comercial de Nexo Studios al brief *"LQLVE Temporada 2 — Propuesta de
producción para Nexo Studios"*.

**Entregables:**

- `NEXO_STUDIOS_x_LQLVE_Temporada2.pdf` — versión de presentación. 3 páginas,
  1080×1920 px (mismo formato vertical 9:16 que usó el cliente en su propuesta).
- `NEXO_STUDIOS_x_LQLVE_Temporada2_MOVIL.pdf` — versión para leer en el celular.
  8 páginas, mismo tamaño de hoja pero con la tipografía ~2× más grande y menos
  contenido por pantalla. Misma información y mismos valores.

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

## Regenerar los PDF

```bash
./build.sh          # version de presentacion  -> deck.html
./build-mobile.sh   # version movil            -> deck-mobile.html
```

Ambos aceptan la ruta a Chromium como primer argumento (por defecto usan el de
`/opt/pw-browsers`). El script inserta fuentes e imágenes como data URIs y lo
imprime a PDF con Chromium headless.

**Importante:** los dos decks son archivos separados. Si cambiás un valor o un
texto, hay que tocarlo en `deck.html` **y** en `deck-mobile.html`, y volver a
correr los dos scripts.

## Assets

- `assets/nexo-studios-logo.png` — logo NEXO STUDIOS (PNG transparente)
- `assets/lqlve-logo.png` — wordmark LQLVE (PNG transparente)
- `assets/nexo-studio-render.jpg` — render del set principal de Nexo Studios
- `assets/fonts/` — Inter + Barlow Condensed (subset latino, SIL Open Font License)
