# AQUA MAR — Plan de Lanzamiento & Marketing v1.0 (Etapa 13)

Embudo: Instagram → Meta Ads → Landing → WhatsApp → Venta → Recompra.
Todo se mide con los eventos ya implementados en la web (whatsapp_click,
wholesale_form_submit, order_whatsapp_click) una vez cargados los IDs de
GA4/GTM/Pixel en Netlify. Sin precios, promociones ni testimonios
inventados; presupuestos a definir por el equipo.

## Meta Ads — estructura de campañas

| # | Campaña | Objetivo | Destino | Creatividades |
|---|---|---|---|---|
| 1 | Reconocimiento | Alcance/ThruPlay | Perfil IG / video | Reel del producto real, carrusel placas del kit |
| 2 | Tráfico | Landing Views | Sitio (utm_campaign=trafico) | Placa hero + foto envase |
| 3 | Mensajes (principal) | Conversaciones WhatsApp | wa.me con mensaje precargado | Foto 40 cápsulas + "Pedí por WhatsApp" |
| 4 | Mayoristas | Leads/Mensajes | /#mayoristas (utm_campaign=mayoristas) | Foto caja de 8, copy comercios |
| 5 | Remarketing | Conversiones | wa.me | Visitó web / abrió WhatsApp / interactuó IG y no consultó |

Audiencias de remarketing a crear en Meta: visitantes web (Pixel, 30/90
días), interacción con perfil IG (365 días), video views 50%+. Excluir
compradores confirmados manualmente vía lista.

UTM estándar: `utm_source=meta&utm_medium=paid&utm_campaign=<nombre>` —
la web ya captura UTM y los agrega al mensaje de WhatsApp.

## Google Ads

**Búsqueda** — grupo 1 marca/producto: powerful, powerful argentina,
powerful zona oeste, comprar powerful, distribuidora powerful. Grupo 2
categoría: cápsulas para lavar ropa, jabón en cápsulas, productos de
limpieza mayorista zona oeste. Concordancia de frase, negativas a
construir con el reporte de términos.

**Performance Max** — solo fotografías reales + logo + placas del kit.
Señales de audiencia: visitantes web + intereses limpieza del hogar.

Conversiones a importar: whatsapp_click (principal),
wholesale_form_submit (mayorista). Configurar en Google Ads cuando exista
el ID y cargarlo en `NEXT_PUBLIC_GOOGLE_ADS_ID`.

## Instagram — primeros 30 días

- **Semana 1 · Presentación**: post 1 (marca), post 2 (producto), post 3
  (tamaños) + historias bienvenida/producto del kit.
- **Semana 2 · Educación**: post 4 (cómo se usa), envíos, FAQ en
  historias con sticker de preguntas.
- **Semana 3 · Detrás de escena**: stock llegando, preparación de
  pedidos, cápsulas en mano (fotos reales, sin placa).
- **Semana 4 · Comercial**: post 5 (mayoristas), revendedores, Zona
  Oeste, envíos nacionales.

Reels (1 por semana): apertura del envase · cómo usar Powerful ·
preparando pedidos · envíos/despacho · propuesta mayorista.

Historias diarias: encuesta ¿20 o 40? · consultas recibidas (sin datos
personales) · cobertura · stock · recordatorio WhatsApp.

Destacados: ya creados (Powerful, Precios, Envíos, Mayoristas, Cómo se
usa) — mantener Precios siempre al día.

## Google Business Profile

Preparar (sin horarios ni dirección hasta confirmarlos): descripción
(usar posicionamiento del Brand Book), categoría "Distribuidor mayorista",
servicios (venta minorista, mayorista, envíos), fotos reales del producto,
FAQ (las 6 de la web), publicación semanal reutilizando placas.

## Email (flujos a preparar cuando haya lista)

Bienvenida → información del producto → seguimiento de consulta →
propuesta mayorista → novedades a clientes frecuentes. Sin compras de
bases ni envíos no solicitados.

## KPIs mensuales

Costo por conversación de WhatsApp · costo por lead mayorista · CTR de
anuncios · tasa de conversión web→WhatsApp · consultas minoristas vs
mayoristas · pedidos confirmados (registro manual/CRM) · tasa de
recompra. Fuente: GA4 + panel de Meta/Google + registro operativo de la
Etapa 11.
