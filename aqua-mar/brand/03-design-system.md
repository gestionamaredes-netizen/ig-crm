# AQUA MAR — Design System v1.0 (Etapa 3)

No diseñar libremente: toda la interfaz se construye con este sistema y
todos los componentes se reutilizan.

## Grid
- Desktop 1440px · 12 col · container 1320 · margen 60 · gutter 24
- Tablet 1024px · 8 col · container 928
- Mobile 390px · 4 col · container 342 · padding lateral 24

## Espaciados (única escala)
4 · 8 · 12 · 16 · 24 · 32 · 40 · 48 · 64 · 80 · 96 · 128 · 160

## Border radius
Botones 18 · cards 24 · inputs 18 · galería 28 · hero 36. Nunca cuadrado.

## Sombras
XS (cards) · SM (botones) · MD (productos) · XL (hero). Desenfoque amplio,
baja opacidad.

## Colores de interfaz
Primario `#0058D9` · hover `#0048B5` · activo `#003D98` · turquesa
`#00C9D8` · background `#F6FAFD` · cards `#FFFFFF` · texto `#14213D` ·
texto secundario `#5E6A79` · bordes `#E6EDF4`.

## Botones
- Primario: alto 56px, padding 32px, 16px bold, azul; hover escala 1.02 +
  sombra; transición 200ms.
- Secundario: blanco con borde azul; hover celeste.
- Ghost: texto azul; hover fondo muy claro.

## Inputs
Alto 56px · radio 18 · borde 1px · placeholder gris · focus borde azul con
glow suave.

## Navbar
Alto 88px, glass blur 18px. Logo izquierda, menú centro, CTA derecha. En
scroll cambia el fondo; nunca desaparece.

## Hero
100vh, dos columnas 45/55. Izquierda: texto, botones, beneficios.
Derecha: fotografía real del producto (nunca reemplazar ni generar otra).

## Tarjetas
Padding 32 · icono arriba · título · descripción. Hover: elevación +
sombra + escala 1.02.

## Iconos
SVG, trazo 2px, redondeado, inspiración Lucide.

## Productos
Nunca renders. Solo fotos oficiales, con sombras/reflejos/glass.

## Galería
Masonry: 4 col desktop, 2 tablet, 1 mobile. Hover zoom + lightbox.

## Beneficios
Cards con icono, título y texto de máximo tres líneas.

## FAQ
Accordion, solo uno abierto, animación 250ms.

## Formularios
Nombre, Empresa, Ciudad, WhatsApp, Mensaje + botón Enviar. Reutilizable.

## Footer
Fondo azul oscuro. Logo, menú, contacto, WhatsApp, Instagram, cobertura,
copyright.

## Floating WhatsApp
Inferior derecha, 64px, sombra, glass, tooltip "¿Necesitás ayuda?".

## Animaciones
Framer Motion: fadeUp, fadeLeft, fadeRight, scale, blur, ripple, floating,
wave. Duración 200–600ms, nunca agresivas.

## Componentes obligatorios
Navbar, Hero, PrimaryButton, SecondaryButton, GhostButton, SectionTitle,
FeatureCard, ProductCard, BenefitCard, CoverageCard, Gallery, GalleryItem,
FAQ, Accordion, WholesaleForm, Input, Textarea, Footer, FloatingWhatsApp,
Container, Section, Badge, Pill, StatsCard. Reutilizables y configurables
por props.

## Responsive
Desktop ≥1440 dos columnas; tablet 768–1024 reorganiza manteniendo
jerarquía; mobile <768 una columna, botones full-width, menú hamburguesa.

## Accesibilidad
Contraste AA, foco visible, teclado, alt en imágenes, labels asociados,
no depender solo del color.

## Regla
No inventar componentes nuevos si uno existente sirve.
