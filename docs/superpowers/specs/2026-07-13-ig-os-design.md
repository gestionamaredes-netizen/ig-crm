# IG OS — Centro de operaciones de Iniciativa Global — Documento de diseño

**Fecha:** 2026-07-13
**Estado:** Diseño aprobado. Construimos **Fase 1**.
**Autor:** Fabricio (Iniciativa Global) + Claude

---

## 1. Visión

**IG OS** no es solo un CRM: es el **centro de operaciones** de Iniciativa Global.
Un panel único donde Fabricio administra sus empresas, cada una como un **workspace
independiente** con sus propios módulos, colores y datos.

Está pensado como **producto con identidad propia**, preparado para escalar y algún
día comercializarse como **SaaS** desarrollado por Iniciativa Global.

## 2. Empresas (workspaces iniciales)

1. **NYPRO IMPORTS** — e-commerce tech · acento **azul**
2. **Gestiones MA** — servicios financieros · acento **negro + dorado**
3. **Premoldeados MA** — construcción / premoldeados · acento **blanco + gris cemento**
4. **Dollar Drop** — cambio / cripto · acento **gris** · *(en desarrollo)*

Al entrar a una empresa, el **color de acento del sistema cambia** a su identidad.

### Módulos por empresa (varían según el rubro)
- **NYPRO:** Dashboard, Productos, Pedidos, Clientes, WhatsApp, Meta Ads, Facturación, Stock, Importaciones, Reportes, IA Comercial
- **Gestiones MA:** Dashboard, Clientes, Divisas, Operaciones, Documentación, Importaciones, Cobros, Facturación, Seguimiento, IA Jurídica
- **Premoldeados MA:** Dashboard, Obras, Presupuestos, Clientes, Pedidos, Producción, Entregas, Cobros, Calendario, Fotos
- **Dollar Drop:** Dashboard, Mystery Box, USDT, Usuarios, Transacciones, Wallet, Recompensas, Analytics

## 3. Estructura global (menú lateral)

`Dashboard · Empresas · Clientes · Ventas · Marketing · Finanzas · Configuración`
(módulos globales adicionales previstos: CRM Comercial, Automatizaciones, Documentación, IA.)

### Dashboard principal
- **Cards enormes:** Clientes · Facturación · Leads · Conversión · Pendientes.
- Debajo: **Empresas** (workspaces), **Actividad**, **Calendario**, **Tareas**, **Ventas**.

### CRM Comercial — embudo (drag & drop)
`Lead → Contactado → Reunión → Presupuesto → Negociación → Cliente → Postventa`

### IG AI (asistente integrado)
Botón fijo que responde en lenguaje natural y genera contenido. Ejemplos:
- "¿Qué cliente hace más de 30 días que no compra?"
- "Generame una campaña para NYPRO."
- "Escribime un presupuesto para Gestiones MA."
- "¿Cuántas ventas hubo este mes?" · "Creame un post." · "Resumime las tareas."

## 4. Branding (identidad exacta)

| Token | Valor |
|---|---|
| Fondo | `#0B0B0D` |
| Cards | `#17181C` |
| Bordes | `rgba(255,255,255,.06)` |
| Hover | `rgba(255,255,255,.04)` |
| Gradiente principal | `#5E5CE6 → #B14BFF → #FF6B6B → #FF9966` |
| Tipografía | Inter / SF Pro Display |

**Efectos:** glassmorphism sutil, mucho blur, sombras suaves, animaciones estilo
Linear, microinteracciones. **Nada recargado.** Tema oscuro como identidad principal.

## 5. Stack técnico

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Estilos:** Tailwind CSS 4 + shadcn/ui + framer-motion + lucide-react
- **Base de datos:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (email/password)
- **ORM:** Drizzle ORM sobre Postgres
- **Deploy:** Vercel

> **Setup manual del usuario:** la cuenta de Supabase y sus claves las crea Fabricio
> (Claude no crea cuentas ni carga contraseñas). Claude guía el paso a paso y consume
> las claves vía variables de entorno.

## 6. Arquitectura (multi-tenant por workspace)

```
Next.js (Vercel)
├── (auth)/login
├── (app)/
│   ├── dashboard                 → panel global (cards enormes + empresas)
│   ├── empresas/[slug]/          → workspace de una empresa
│   │   └── [modulo]              → módulos dinámicos por empresa
│   ├── crm                       → embudo comercial global
│   ├── clientes · ventas · marketing · finanzas · configuracion
│   └── (IG AI como panel global fijo)
├── lib/db (Drizzle + schema)
├── lib/auth (guard + sesión)
├── lib/theme (acento por workspace)
└── components/ (shell, sidebar, cards, kanban, ai-panel…)
```

- **Registro de módulos:** cada empresa declara qué módulos tiene habilitados; el
  shell renderiza pestañas/rutas según ese registro. Los módulos nuevos (fases
  siguientes) se **enchufan** sin rehacer el shell.
- **Acento dinámico:** el color del workspace se aplica vía CSS variables al entrar.

## 7. Modelo de datos (Fase 1)

- **companies** — `id, slug, nombre, categoria, color, gradiente, estado(activo|desarrollo|pausado), modulos(jsonb)`
- **stages** — `id, company_id, nombre, color, orden` — *embudo propio por empresa*
- **leads** — `id, company_id, stage_id, nombre, descripcion, valor, canal(ig|wa|web|otro), notas, created_at, updated_at`
- **contacts** — `id, company_id, lead_id?, nombre, telefono, email, notas`
- **tasks** — `id, company_id?, lead_id?, titulo, vence_at, done, etiqueta`
- **events** — `id, company_id?, titulo, inicio, fin, tipo` — *calendario*
- **activity** — `id, company_id?, texto, tipo, created_at`
- **accounts** — `id, company_id, tipo(ig|wa|web|meta|tiktok|email), url, vinculada`
- Usuarios: `auth.users` de Supabase.

## 8. Errores y casos borde

- Sin conexión a DB → pantalla de error con reintento (no pantalla en blanco).
- Empresa "en desarrollo" (Dollar Drop) → workspace visible con estado especial.
- Borrar etapa con leads → obligar a mover leads antes de borrar.
- Validación server-side de formularios (nombre requerido, valor numérico).
- Rutas `(app)` protegidas por middleware de sesión.

## 9. Verificación

Sin suite de tests (igual que `GESTIONES MA/web`): verificar con `npm run build` +
`npm run lint` y probando en el navegador los flujos clave. Tests a futuro.

## 10. Roadmap (decomposición en fases)

**Fase 1 — la construimos ahora (esqueleto premium + base usable):**
- Autenticación y usuarios.
- Dashboard general (cards enormes, empresas, actividad, ventas).
- Workspaces por empresa (shell, acento dinámico, registro de módulos).
- Gestión de clientes/leads (embudo comercial drag & drop, etapas propias).
- Gestión de tareas.
- Calendario.

**Fase 2 — comercial/administrativo:**
- CRM comercial completo, presupuestos, documentos, facturación, reportes.

**Fase 3 — integraciones (APIs externas, trámites):**
- WhatsApp Business, Meta Ads, Instagram, Email, Google Calendar, Google Drive.

**Fase 4 — inteligencia y escala:**
- IG AI real (consultas, generación de contenido, presupuestos, análisis),
  automatizaciones, dashboards inteligentes, app móvil.

> **Nota de honestidad sobre alcance:** IG OS es una plataforma grande. Fase 1 entrega
> algo real y premium ya. La IA real (Fase 4) e integraciones (Fase 3) son las piezas
> más pesadas (APIs, trámites, verificación de Meta) y por eso van después. El mockup
> muestra IG AI y módulos como *maqueta* de la visión; su versión funcional llega en
> sus fases.

## 11. Costos

Arranque **gratuito**: Supabase (free) + Vercel (hobby). Costos solo al escalar
(más usuarios, IA con uso real de API, volumen alto).

## 12. Preguntas abiertas

- Qué **módulos exactos** entran ya en Fase 1 vs. quedan de placeholder por empresa
  (por defecto Fase 1 activa: Dashboard, Clientes/Embudo, Tareas, Calendario en las 4).
- Cantidad de usuarios además del admin (afecta solo textos/roles, no el modelo).
