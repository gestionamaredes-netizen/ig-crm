# Aqua Mar — Plataforma oficial

Sitio de Aqua Mar, distribuidora oficial de Powerful en Zona Oeste con
envíos a todo el país. Catálogo con pedidos por WhatsApp, formulario
mayorista, SEO completo, analítica con consentimiento y páginas legales.

## Requisitos

- Node.js 20+
- npm

## Instalación local

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # TypeScript estricto sin errores
npm run build      # genera el sitio estático en out/
```

## Estructura

```
src/
├── app/          páginas (home, privacidad, terminos, cookies, 404),
│                 robots, sitemap, manifest
├── components/   layout/ sections/ ui/ consent/
├── config/       business.ts (datos del negocio) · commerce.ts · seo.ts ·
│                 analytics.ts
├── data/         content.ts (todos los textos) · products.ts (catálogo) ·
│                 faq.ts · navigation.ts
├── commerce/     tipos operativos, generador de mensajes, plantillas
├── analytics/    capa única de tracking + carga condicional de scripts
└── lib/          whatsapp.ts · utm.ts · structured-data.ts · motion.ts
public/
├── products/     fotografías ORIGINALES de Powerful (no modificar)
├── branding/     logo Aqua Mar
└── og/           imagen para redes (1200×630)
```

## Configuración

- **Datos del negocio**: `src/config/business.ts` (WhatsApp, Instagram,
  email, cobertura). Sobreescribibles por variables de entorno.
- **Catálogo**: `src/data/products.ts`. `price: null` muestra "Consultar
  precio"; `stockStatus` controla la disponibilidad visible.
- **Textos**: `src/data/content.ts` y `src/data/faq.ts`.
- **Variables de entorno**: copiar `.env.example` a `.env.local`. En
  producción cargarlas en Netlify → Site configuration → Environment
  variables. Nunca commitear `.env*`.

## Fotografías del producto

Las fotos de `public/products/*-original.jpg` son material oficial de
Powerful: solo se permite optimizar peso/formato, nunca alterar envase,
etiquetas, colores ni proporciones.

## WhatsApp

`src/lib/whatsapp.ts` centraliza la construcción de URLs; el número sale
de `NEXT_PUBLIC_WHATSAPP_NUMBER` (o del valor por defecto en
`business.ts`). Si no hay número, los botones se deshabilitan solos.

## Analítica

`src/config/analytics.ts` lee GA4, GTM, Meta Pixel y Google Ads de las
variables de entorno. **Sin ID configurado, el script no se carga.** Las
herramientas opcionales además esperan el consentimiento del banner de
cookies. Todos los eventos pasan por `trackEvent()`
(`src/analytics/track-event.ts`): whatsapp_click, wholesale_form_submit,
order_whatsapp_click, quantity_select, gallery_open, faq_open.

Para conectar: crear la propiedad (GA4/GTM/Pixel/Ads), copiar el ID en la
variable correspondiente de Netlify y redeployar.

## Deploy en Netlify

El proyecto exporta estático (`output: "export"` → `out/`).

**Con Git (recomendado):** subir el repo a GitHub → Netlify → Add new
site → Import an existing project → conectar el repo → build
`npm run build` (netlify.toml ya lo define, publish `out/`) → cargar
variables de entorno → deploy. Cada push genera Deploy Preview.

**Manual:** `npm run build` y arrastrar `out/` (o el ZIP) en
Netlify → Deploys.

Después del deploy: verificar dominio en `NEXT_PUBLIC_SITE_URL`, probar
WhatsApp, formulario, robots.txt, sitemap.xml y la preview del link.

`netlify.toml` incluye headers de seguridad (nosniff, referrer-policy,
X-Frame-Options, permissions-policy) y cache inmutable para estáticos.

## Solución de problemas

- **Build falla en robots/sitemap**: requieren `dynamic = "force-static"`
  (ya configurado) por el modo export.
- **La preview del link muestra contenido viejo**: WhatsApp cachea;
  compartir con `?v=2` para forzar preview nueva.
- **Los botones de WhatsApp no abren**: revisar
  `NEXT_PUBLIC_WHATSAPP_NUMBER` (solo dígitos, con código de país).

## Aqua IA (asistente comercial)

Asistente con reglas locales (sin API externa) en el botón "Aqua IA" del
sitio. Responde solo con la base de conocimiento aprobada
(`knowledge/*.md` + `src/ai/knowledge.ts`); ante precio, stock o cualquier
dato no confirmado deriva al WhatsApp del equipo. Incluye flujos guiados
minorista/mayorista/cobertura, guardrails contra inyección de
instrucciones, aviso de privacidad y analítica sin datos personales. No
almacena conversaciones.

- **Actualizar conocimiento**: editar `knowledge/*.md` y reflejar el
  cambio en `src/ai/knowledge.ts` (sincronización manual y deliberada).
- **Conectar IA real (futuro)**: implementar la interfaz `AIProvider`
  (`src/ai/provider.ts`) del lado servidor; las claves (OpenAI/Anthropic/
  Gemini) nunca van al navegador.
- Activar/desactivar: `featureFlags.assistant` en `src/config/features.ts`.

## Panel interno (/panel)

Dashboard ejecutivo en la ruta `/panel` (no indexada ni linkeada desde el
sitio): KPIs, pedidos, clientes, pipeline mayorista, productos, cobertura,
analytics, marketing y configuración.

- **Sin datos inventados**: por defecto muestra estados vacíos elegantes.
  El interruptor "Modo demo" carga datos de demostración etiquetados, solo
  para previsualizar el layout.
- **Arquitectura de providers** (`src/dashboard/service.ts`): la misma
  interfaz servirá para conectar Supabase, Google Sheets o un CRM.
- Tema oscuro con toggle, bottom navigation en mobile, gráficos Recharts.
- **Seguridad**: el panel no tiene login porque no muestra datos reales.
  Antes de conectarlos, proteger la ruta (Netlify password protection,
  Netlify Identity o autenticación propia). Roles previstos en
  `src/config/dashboard.ts`.

## Documentación de marca

Las 8 etapas del proyecto (estrategia, brand book, design system,
wireframes, copywriting, frontend) están en `brand/`.
