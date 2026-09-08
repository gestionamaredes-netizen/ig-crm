# AQUA MAR — Lanzamiento v1.0 & Roadmap (Etapa 20)

## Estado final: ✅ APROBADO CON PENDIENTES NO CRÍTICOS

Verificado sobre el build real (no checklist teórico). Fecha: 2026-08-02.

## Checklists de validación

### Marca y producto
- [x] Logo, paleta (#0058D9/#003E8A/#002451/#00C9D8/#DFF8FF/#FDB813),
      Manrope + Inter, cards y botones consistentes, estética premium
- [x] Fotos originales intactas en `public/products/*-original.jpg`
      (20, 40, cápsulas, stock) — sin renders ni presentaciones inventadas
- [x] Amarillo solo en detalles

### Contenido
- [x] Copy de Etapa 5 aplicado; sin precios, stock, promociones,
      certificaciones, testimonios, plazos ni medios de pago inventados
- [x] Instrucciones siempre remiten al envase

### Funcional
- [x] Navbar + menú móvil + anclas · footer completo · 404 con marca
- [x] WhatsApp: número desde config, mensajes minorista/mayorista/
      cobertura/por-presentación sin campos vacíos, botón flotante,
      eventos medidos
- [x] Formulario mayorista: labels, validación, error/carga/éxito,
      honeypot, consentimiento, sin doble envío
- [x] Catálogo: 2 productos activos, cantidades configurables,
      "Consultar precio" / "Consultá disponibilidad"

### Aqua IA
- [x] Responde Aqua Mar/Powerful/20/40/minorista/mayorista/cobertura/uso
- [x] Precio y stock → respuesta segura + deriva a WhatsApp
- [x] Desconocidas → 1 aclaración → derivación humana
- [x] Guardrails: inyección de instrucciones, datos sensibles, temas
      médicos/químicos/comparaciones → bloqueo con derivación
- [x] No almacena conversaciones; aviso de privacidad visible
- [x] Analítica sin datos personales (solo intent/acciones)

### Responsive y accesibilidad
- [x] 390px verificado sin scroll horizontal (sitio y panel); breakpoints
      320–1920 cubiertos por grillas fluidas
- [x] Foco visible, teclado, aria-expanded/controls, Escape en
      lightbox/asistente, alt en todas las imágenes,
      prefers-reduced-motion, táctil ≥48px

### SEO
- [x] Title/description/canonical/robots/sitemap/manifest/favicon
- [x] OG 1200×630 con logo + foto original · Twitter Card
- [x] JSON-LD Organization/LocalBusiness/Product sin datos inventados
- [x] Un solo H1, jerarquía H2/H3, /panel noindex

### Analítica y consentimiento
- [x] GA4/GTM/Pixel/Ads solo cargan con ID + consentimiento
- [x] Banner de cookies con 3 categorías + página /cookies editable
- [x] UTM capturado y agregado al mensaje de WhatsApp

### Seguridad
- [x] Headers: HSTS, CSP adaptada, nosniff, X-Frame-Options,
      Permissions-Policy, Referrer-Policy
- [x] Sin secretos en el repo; .env* ignorados; solo NEXT_PUBLIC_ públicos
- [x] Error boundaries sin trazas técnicas
- [x] Validación/sanitización centralizada (lib/validate.ts)

### Técnica
- [x] `npm run typecheck` sin errores (strict, sin any/@ts-ignore)
- [x] `npm run build` exitoso — 18 rutas estáticas
- [x] Dependencias justificadas: next, react, framer-motion,
      lucide-react, recharts, tailwind

## Pendientes NO críticos (antes o después de publicar)
1. Cargar IDs reales de GA4/GTM/Meta Pixel/Google Ads en Netlify.
2. Definir horarios de atención (`src/config/operations.ts`).
3. Aprobar política de cambios/cancelaciones (hoy: caso por caso).
4. Revisión legal de privacidad/términos/cookies (plantillas marcadas).
5. Proteger `/panel` (Netlify password) antes de conectar datos reales.
6. Confirmar dominio propio si se reemplaza el subdominio de Netlify.
7. Migrar el deploy manual (ZIP) a GitHub + Deploy Previews.

## Prueba de aceptación (recorridos verificados)
- Minorista: home → catálogo → cantidad → WhatsApp con mensaje correcto ✅
- Mayorista: formulario → validación → WhatsApp + evento ✅
- Cobertura: sección → CTA → mensaje sin promesas ✅
- Duda: Aqua IA → respuesta verificada → derivación cuando falta dato ✅

## Aprobación interna (a completar por Aqua Mar)
Proyecto: Aqua Mar v1.0 · Fecha: ____ · Dominio: ____
Responsable comercial: ____ · Técnico: ____ · Marca: ____
Estado: APROBADO / NO APROBADO

## Monitoreo post-lanzamiento
- 24 h: web, WhatsApp, formularios, mobile, HTTPS, errores.
- Semana 1: consultas, conversiones, FAQ reales, dispositivos, campañas.
- Mes 1: conversión, costo por consulta, mayoristas, recompra, SEO.

## Roadmap de versiones
- **v1.0** (hoy): web + catálogo + WhatsApp + mayoristas + SEO +
  analítica + Aqua IA local + panel preparado.
- **v1.1**: optimización con métricas reales, FAQ nuevas, velocidad.
- **v1.2**: contenidos — blog, landings por campaña, SEO local verificado.
- **v2.0**: Supabase + CRM + login + pedidos y dashboard con datos reales.
- **v2.5**: automatización — WhatsApp Business Platform, emails
  transaccionales, Conversion API, alertas.
- **v3.0**: e-commerce — carrito, checkout, Mercado Pago, cuenta cliente.
- **v4.0**: app móvil, IA conectada (providers ya definidos),
  distribuidores regionales, multimarca.

## Backlog inicial (estados: pendiente → en_desarrollo → publicado)
| ID | Título | Prioridad | Versión |
|---|---|---|---|
| AM-1 | Cargar IDs de analítica | Alta | 1.0 |
| AM-2 | Horarios de atención en config | Alta | 1.0 |
| AM-3 | Proteger /panel | Alta | 1.0 |
| AM-4 | Revisión legal de plantillas | Alta | 1.0 |
| AM-5 | Migrar deploy a GitHub+Netlify CI | Media | 1.1 |
| AM-6 | Fotos nuevas para galería (detalle) | Media | 1.1 |
| AM-7 | Landing mayorista dedicada | Media | 1.2 |
| AM-8 | Supabase + CRM | Media | 2.0 |
| AM-9 | WhatsApp Business Platform | Baja | 2.5 |
| AM-10 | Checkout + Mercado Pago | Baja | 3.0 |
