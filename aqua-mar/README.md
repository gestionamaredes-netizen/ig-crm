# Sitio Aqua Mar Distribuidora

Landing estática de Aqua Mar, distribuidora exclusiva de Powerful PODS 3 en 1.

- `index.html` — toda la página (HTML + CSS + JS en un solo archivo, sin dependencias).
- `img/` — logo y fotos del producto.

## Qué hace

- Formulario de pedido con provincia (las 24) y localidad con sugerencias.
- Modo minorista (baldes de 40 cápsulas) y mayorista (cajas de 8 baldes).
- El pedido sale armado a WhatsApp: **+54 9 11 5810-0225** (`wa.me/5491158100225`).

## Cómo publicarla

Cualquier hosting estático sirve. Las dos opciones más rápidas:

- **Netlify**: arrastrar la carpeta `aqua-mar/` en app.netlify.com/drop.
- **Vercel / GitHub Pages**: apuntar el deploy a la carpeta `aqua-mar/`.

Para cambiar el número de WhatsApp: editar la constante `WSP` al principio del
`<script>` en `index.html` (y los tres links `wa.me` fijos del header, la
sección de cobertura y el botón flotante).
