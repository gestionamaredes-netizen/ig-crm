# Plataforma de auto-posteo en IG OS — Plan

Módulo de IG OS que conecta cada Instagram de Iniciativa Global y publica según el
[cronograma](cronograma-redes.md). Basado en la **Instagram Graph API** (Meta).

## Requisitos de Meta (esto es lo que más tarda — arrancarlo YA)

Sin esto, ninguna plataforma puede publicar en Instagram:

1. **Cada cuenta → Profesional (Business o Creator)** y **vinculada a una Página de Facebook**.
2. **App de Meta** (developers.facebook.com) tipo Business, con productos *Instagram Graph API*
   + *Facebook Login*.
3. **Permisos:** `instagram_basic`, `instagram_content_publish`, `pages_show_list`,
   `pages_read_engagement`, `business_management`.
4. **Verificación de negocio** (Business Verification) en Meta Business Suite.
5. **App Review** de Meta para `instagram_content_publish` (requiere screencast + descripción
   de uso). Puede tardar de días a semanas → **es el cuello de botella, iniciarlo primero.**
6. **Tokens de acceso de larga duración** (60 días, renovables) por cuenta/página.

> ⚠️ Conectar cada cuenta (aprobar los permisos OAuth) lo hace el dueño de las cuentas,
> no se puede automatizar de nuestro lado.

## Cómo publica la Graph API (referencia técnica)

- **Foto:** `POST /{ig-user-id}/media` con `image_url` → devuelve `creation_id` →
  `POST /{ig-user-id}/media_publish` con ese id.
- **Carrusel:** crear cada item con `is_carousel_item=true`, luego un contenedor
  `media_type=CAROUSEL` con `children=[ids]`, y publicar.
- **Reel:** `media_type=REELS` con `video_url` (+ `cover_url`); esperar a que el contenedor
  esté `FINISHED` (polling de `status_code`) antes de publicar.
- **Historia:** `media_type=STORIES` (imagen o video) — disponible para cuentas Business.
- **Requisito clave:** los medios se pasan por **URL pública** → hay que hostear los PNG/MP4
  (ej. Supabase Storage con URL firmada o pública).
- **Límite:** 25 publicaciones por cuenta por 24h.

## Módulo en IG OS (Next.js + Supabase)

**Tablas Supabase:**
- `ig_accounts` (id, handle, empresa, ig_user_id, fb_page_id, estado)
- `ig_tokens` (account_id, access_token, expires_at) — encriptado
- `ig_posts` (id, account_id, tipo [feed/reel/story/carrusel], media_urls[], caption,
  comentario_fijado, estado [borrador/programado/publicado/error], scheduled_at, published_at,
  ig_media_id, error)

**Flujo:**
1. UI de calendario (arrastra piezas a días/horas → crea `ig_posts` programados).
2. Subida de medios a Supabase Storage → URLs públicas.
3. **Worker programado** (Vercel Cron o Supabase Edge Function cada 5 min): toma los
   `ig_posts` cuyo `scheduled_at` venció → crea contenedor → publica → guarda `ig_media_id`
   o `error`.
4. Refresco automático de tokens antes de vencer.
5. (Opcional) traer métricas vía Graph API para cerrar el loop con el tablero.

## Fases

- **Fase 0 — Trámite (empezar ya, en paralelo al cronograma):** cuentas Profesional + Páginas,
  app de Meta, verificación de negocio, App Review de `instagram_content_publish`, tokens.
- **Fase 1 — Conexión + "Publicar ahora":** tablas + OAuth de cuentas + botón manual que
  publica una pieza. Valida que la API funciona.
- **Fase 2 — Programación:** calendario + worker cron que publica según `scheduled_at`.
- **Fase 3 — Historias + métricas + multi-empresa** (las 5 cuentas) y loop de datos.

## Recomendación de arranque

Correr **cronograma + Meta Business Suite** desde ya (ver `cronograma-redes.md`) mientras
avanza la **Fase 0** del trámite. Recién con el App Review aprobado tiene sentido construir
la Fase 1+ del módulo; antes, sería código que no puede publicar.
