# AQUA MAR — Documento Maestro v1.0 (Etapa 19)

Índice unificado del proyecto. Fuente de verdad: los documentos por etapa
y el código de este repositorio.

## Identidad
Aqua Mar · Distribuidora Oficial Powerful · Zona Oeste + envíos a todo el
país. Claim: "La limpieza comienza con la confianza."

## Regla absoluta
Las fotografías de Powerful (`public/products/*-original.jpg`) no se
redibujan, recrean, modifican ni reemplazan. Solo: recorte, quitar fondo,
nitidez leve, exposición, optimización de peso/formato, sombra de
integración. Los originales se conservan intactos.

## Mapa de documentación
| Etapa | Documento | Implementación |
|---|---|---|
| 1 | brand/01-brand-strategy.md | — |
| 2 | brand/02-brand-book.md | tokens en src/app/globals.css |
| 3 | brand/03-design-system.md | src/components/ui |
| 4 | brand/04-arquitectura-wireframes.md | src/app/page.tsx |
| 5 | brand/05-copywriting.md | src/data/content.ts |
| 6 | brand/06-arquitectura-frontend.md | estructura src/ |
| 7 | Implementación final | todo el sitio |
| 8 | SEO + Analítica | src/config/seo.ts · src/analytics/ · consent |
| 9 | QA + Netlify | netlify.toml · .env.example · docs |
| 10 | Catálogo comercial | src/data/products.ts · ProductCatalog |
| 11 | Operación de pedidos | src/commerce/ |
| 12 | Kit comercial | social/instagram/ |
| 13 | brand/13-plan-marketing.md | — |
| 14 | CRM (pendiente de credenciales) | interfaces en providers |
| 15 | Dashboard BI | src/app/panel · src/dashboard/ |
| 16 | Seguridad/escala | docs/ARCHITECTURE.md · headers · flags |
| 17 | Aqua IA | src/ai/ · knowledge/ · components/assistant |
| 18 | Manual operativo | operations/ |
| 19 | Este documento | — |
| 20 | brand/20-lanzamiento-roadmap.md | LAUNCH checklist |

## Configuración central
- Negocio: `src/config/business.ts` (WhatsApp, redes, email, cobertura)
- Comercio: `src/config/commerce.ts` + `src/data/products.ts`
- Flags: `src/config/features.ts`
- SEO: `src/config/seo.ts` · Analítica: `src/config/analytics.ts`
- Asistente: `src/config/assistant.ts` · Operación: `src/config/operations.ts`

## Prohibiciones permanentes
No inventar precios, stock, descuentos, promociones, horarios, medios de
pago, costos de envío, plazos, testimonios, certificaciones, datos
legales, localidades ni métricas. Lo que falte queda como variable vacía
o estado "Consultar".

## Nota de implementación
Los nombres de ruta del paquete original (`/products/originals/…`) se
implementaron como `public/products/*-original.jpg` — misma garantía
(sufijo "original", archivos intactos), estructura plana por simplicidad
del export estático. El stack quedó en Next.js 16 (App Router), superset
de lo especificado para Next.js 15.
