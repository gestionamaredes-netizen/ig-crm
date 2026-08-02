# AQUA MAR — Desarrollo Técnico & Arquitectura Frontend v1.0 (Etapa 6)

Objetivo: plataforma moderna, escalable y optimizada. No una landing
estática: una base preparada para nuevos productos, categorías, campañas
y funcionalidades sin reescribir la arquitectura.

## Stack
Next.js (App Router) · React · TypeScript strict · TailwindCSS · Framer
Motion · Lucide React · next/image · next/font. Componentes reutilizables.

## Estructura de carpetas
```
src/
├── app/            layout, page, globals.css, sitemap, robots, not-found
├── components/     layout/ hero/ products/ coverage/ faq/ gallery/
│                   forms/ ui/ shared/
├── data/           company.ts navigation.ts faq.ts seo.ts content.ts
├── lib/  hooks/  styles/  types/
└── assets/         logos/ svg/ backgrounds/ icons/
public/             products/ branding/ gallery/ backgrounds/
```

## Reglas de componentes
Cada bloque de la página es un componente independiente (Navbar, Hero,
TrustBar, ProductSection, HowItWorks, Benefits, Coverage, Wholesale,
Gallery, FAQ, CTA, Footer). Nunca toda la página en un archivo.

## Contenido
Todo el texto se carga desde `data/` (content.ts, faq.ts, etc.). No hay
textos fijos dentro de los componentes.

## Imágenes
Fotos oficiales del producto siempre con next/image, sin modificar
packaging, etiquetas, colores ni forma.

## SEO
Archivos independientes (seo.ts, robots.ts, sitemap.ts, metadata). Open
Graph, Twitter Cards, canonical, JSON-LD (LocalBusiness, Organization,
Product).

## Rendimiento
Performance >95: lazy loading, preload de fuentes, imágenes optimizadas,
code splitting, server components cuando corresponda. Sin librerías
innecesarias.

## Animaciones
Utilidades reutilizables de Framer Motion: fadeUp, fadeLeft, fadeRight,
scaleIn, staggerChildren, float, wave. No duplicar código.

## Configuración central
`data/company.ts` concentra nombre, slogan, whatsapp, instagram, email,
dirección y cobertura.

## Formularios
Lógica separada de la presentación. Componentes Input, Textarea, Select,
Button. Validación preparada para futuras integraciones.

## Accesibilidad
Teclado, foco visible, labels, alt, contraste AA.

## Responsive
Desktop 1440+ · tablet 768–1024 · mobile 390–767, sin duplicar código.

## Principios de código
Componentes chicos, única responsabilidad, nombres descriptivos, sin
repetición, lógica separada de presentación.

## Preparado para escalar
Nuevas líneas de producto, promociones, distribuidores, catálogo, blog,
área de clientes y seguimiento de pedidos sin tocar la estructura base.
