# Changelog — Aqua Mar

Versionado semántico (MAJOR.MINOR.PATCH).

## [1.1.0] — 2026-08-02

El panel se convierte en CRM real con Supabase.

### Agregado
- Conexión a Supabase como base de datos compartida del equipo
  (`src/config/supabase.ts`, esquema con RLS en `supabase/schema.sql`)
- Login real por email y contraseña con Supabase Auth (reemplaza al
  candado compartido cuando la base está conectada) + cerrar sesión
- Alta de clientes, pedidos y consultas mayoristas desde el panel;
  cambio de estado de pedidos y del pipeline mayorista
- KPIs, series, cobertura, embudo y actividad calculados a partir de los
  datos reales cargados (lo no derivable de la base sigue en "—")
- Guía de conexión paso a paso en `docs/SUPABASE.md`
- Pestaña "Base de datos" en Configuración con el estado de la conexión

### Cambiado
- Sin base conectada, todo sigue igual que en 1.0.0 (candado + demo)
- CSP de Netlify permite conexiones a `*.supabase.co`

## [1.0.0] — 2026-08-02

Lanzamiento de la plataforma Aqua Mar.

### Incluye
- Sitio comercial completo según Brand Book y Design System v1.0
- Catálogo con presentaciones de 20 y 40 cápsulas y pedidos por WhatsApp
- Formulario mayorista con validación, honeypot y consentimiento
- Cobertura con mapa real de Argentina (con Islas Malvinas)
- Galería con lightbox accesible, FAQ, páginas legales y 404
- SEO técnico completo (metadata, OG, JSON-LD, sitemap, robots, manifest)
- Analítica modular con consentimiento de cookies y captura de UTM
- Aqua IA: asistente comercial con reglas locales y base de conocimiento
- Dashboard ejecutivo interno en /panel con providers y estados vacíos
- Infraestructura: headers de seguridad, error boundaries, feature flags,
  validación centralizada, documentación técnica y operativa

### Pendiente de datos reales (no bloqueante)
- IDs de GA4/GTM/Meta Pixel/Google Ads
- Horarios de atención y política de cambios/cancelaciones
- Protección de acceso al panel antes de conectar datos reales
- Revisión legal de privacidad/términos/cookies
