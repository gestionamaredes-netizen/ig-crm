# Aqua Mar — Sitio web oficial

Sitio de Aqua Mar, distribuidora oficial de Powerful en Zona Oeste, con venta
minorista, mayorista y envíos a todo el país. Todo el contacto convierte a
WhatsApp.

## Stack

- Next.js 16 (App Router, salida 100% estática) + React 19 + TypeScript
- TailwindCSS 4
- Framer Motion (animaciones de entrada, flotación, burbujas)
- Lucide Icons + Next Image

## Correr en local

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción
npm start        # servir el build
```

## Editar los datos del negocio

Todo lo editable está centralizado:

- **`config.ts`** — WhatsApp, Instagram, email, dirección, cobertura, medios
  de pago, dominio. Cambiás el número acá y se actualiza en toda la web.
- **`data/faq.json`** — preguntas y respuestas del FAQ.
- **`public/img/`** — fotos reales del producto y logo.

## Estructura

- `app/` — layout (SEO, fuentes, JSON-LD), página principal, robots y sitemap.
- `components/` — una sección por archivo: `hero`, `trust-bar`, `product`,
  `how-to-use`, `benefits`, `coverage`, `wholesale`, `gallery`, `faq`,
  `final-cta`, `footer`, más piezas compartidas (`reveal`, `bubbles`, íconos).
- `lib/wa.ts` — armado de links de WhatsApp con mensaje precargado.

## Deploy

Pensado para Vercel: importar el repo y setear **Root Directory = `aqua-mar`**.
Después del deploy, actualizar `siteUrl` en `config.ts` con el dominio final.
