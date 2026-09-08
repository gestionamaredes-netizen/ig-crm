# Arquitectura técnica — Aqua Mar

Principios: Clean Architecture liviana, SOLID, DRY, KISS, feature-first,
mobile-first, security-first. Server Components por defecto; cliente solo
donde hay interacción (formularios, asistente, panel, animaciones).

## Capas

```
app/          rutas y páginas (públicas, legales, /panel noindex)
components/   presentación (sections, ui, layout, dashboard, assistant, consent)
config/       toda la configuración editable (business, commerce, seo,
              analytics, dashboard, assistant, features)
data/         contenido y catálogo (content, products, faq, navigation)
commerce/     dominio comercial: tipos, estados, mensajes
dashboard/    tipos + providers de datos del panel (empty/demo → Supabase)
ai/           Aqua IA: intents, guardrails, conversación, provider local
analytics/    capa única trackEvent + carga condicional de scripts
lib/          utilidades puras (whatsapp, utm, validate, motion, schema)
```

Reglas:
- Ningún dato comercial hardcodeado en componentes: todo sale de config/ y data/.
- Ningún secreto en el cliente: solo variables NEXT_PUBLIC_ públicas.
- Los providers (dashboard, IA) definen interfaces: cambiar de fuente de
  datos no toca la UI.

## Escalabilidad prevista

- **Multiproducto**: `data/products.ts` es un array tipado; el catálogo y
  el panel lo consumen sin límite de ítems.
- **Multimarca**: `config/business.ts` + tokens de color en `globals.css`
  concentran la identidad; clonar la marca = duplicar esos dos archivos.
- **Feature flags** (`config/features.ts`): blog, checkout y CRM se
  activan sin reestructurar.
- **Roadmap técnico**: v1 landing+catálogo+WhatsApp → v2 CRM+dashboard con
  datos → v3 checkout+Mercado Pago → v4 app móvil+IA conectada.

## Seguridad

- Headers en netlify.toml: HSTS, CSP adaptada, nosniff, frame-options,
  permissions-policy, referrer-policy.
- Validación y sanitización en `lib/validate.ts` (formularios y asistente).
- Error boundaries (`app/error.tsx`, `global-error.tsx`): sin stack traces
  al usuario.
- El sitio es estático: sin superficie de servidor propia. Cuando se sumen
  APIs (v2+), la validación se repite del lado servidor y el rate limiting
  se resuelve en la capa de funciones.

## Monitoreo y testing (preparados, no conectados)

- Sentry/LogRocket: se integran en `app/layout.tsx` + variables de entorno
  cuando existan credenciales.
- Testing: estructura prevista `src/**/__tests__` con Vitest (unit),
  Testing Library (integración) y Playwright (E2E). Sin dependencias
  instaladas hasta que se decida el stack de CI.

## Backups (documentado)

- Código: repositorio Git (GitHub).
- Fotos originales: `public/products/*-original.jpg` versionadas en Git —
  nunca sobrescribir.
- Configuración: versionada en Git; variables de entorno respaldadas en el
  gestor de secretos del equipo (no en el repo).
- Datos operativos (cuando existan en Supabase/Sheets): export automático
  diario — definir al conectar.
